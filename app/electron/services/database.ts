import Database from "better-sqlite3";
import { app } from "electron";
import path from "node:path";
import fs from "node:fs";

/**
 * SQLite-backed persistence. The Swift app never had a persistence layer
 * (see MIGRATION.md) — this is new, not a port of an existing store.
 * Demo fixtures are seeded once on first launch into a `workspace_kind =
 * 'demo'` row so they stay distinguishable from anything the user creates.
 */
export function openDatabase(): Database.Database {
  const dir = app.getPath("userData");
  fs.mkdirSync(dir, { recursive: true });
  const dbPath = path.join(dir, "lyra.sqlite3");
  if (process.env.RESET_DB === "1" || process.env.CAPTURE_SCREENS === "1") {
    try {
      if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
      const wal = path.join(dir, "lyra.sqlite3-wal");
      if (fs.existsSync(wal)) fs.unlinkSync(wal);
      const shm = path.join(dir, "lyra.sqlite3-shm");
      if (fs.existsSync(shm)) fs.unlinkSync(shm);
    } catch (e) {
      console.warn("Could not remove old DB files", e);
    }
  }
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  return db;
}

const SCHEMA_VERSION = 1;

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);

    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, color_seed INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, abbreviation TEXT NOT NULL, member_ids TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS repositories (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, local_path TEXT NOT NULL,
      current_branch TEXT NOT NULL, remote_url TEXT
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, summary TEXT NOT NULL, status TEXT NOT NULL,
      icon_symbol TEXT NOT NULL, parent_id TEXT, team_id TEXT, member_ids TEXT NOT NULL,
      repository_id TEXT, active_cycle_id TEXT, target_date TEXT, created_at TEXT NOT NULL,
      starred INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS cycles (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, number INTEGER NOT NULL, project_id TEXT NOT NULL,
      start_date TEXT NOT NULL, end_date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS labels (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, color_seed INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      prefix TEXT NOT NULL, number INTEGER NOT NULL,
      title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL, status TEXT NOT NULL, priority TEXT NOT NULL,
      estimate INTEGER, epic_name TEXT,
      assignee_id TEXT, creator_id TEXT NOT NULL, label_ids TEXT NOT NULL DEFAULT '[]',
      project_id TEXT, cycle_id TEXT, due_date TEXT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL, rank REAL NOT NULL,
      linked_branch TEXT, linked_pr_url TEXT, comment_count INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_issues_project ON issues(project_id);
    CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);

    CREATE TABLE IF NOT EXISTS activity (
      id TEXT PRIMARY KEY, issue_id TEXT NOT NULL, actor_kind TEXT NOT NULL,
      actor_user_id TEXT, actor_agent_name TEXT, kind TEXT NOT NULL,
      detail TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_activity_issue ON activity(issue_id);

    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, issue_id TEXT,
      provider_id TEXT NOT NULL, provider_session_id TEXT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      archived INTEGER NOT NULL DEFAULT 0, draft TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY, session_id TEXT NOT NULL, role TEXT NOT NULL,
      text TEXT NOT NULL, created_at TEXT NOT NULL,
      activity_json TEXT, files_json TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);

    CREATE TABLE IF NOT EXISTS preferences (
      key TEXT PRIMARY KEY, value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS components (
      id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL,
      description TEXT, lead_id TEXT, created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_components_project ON components(project_id);

    CREATE TABLE IF NOT EXISTS releases (
      id TEXT PRIMARY KEY, project_id TEXT NOT NULL, version TEXT NOT NULL,
      status TEXT NOT NULL, release_date TEXT, description TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_releases_project ON releases(project_id);

    CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY, project_id TEXT NOT NULL, title TEXT NOT NULL,
      content TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_pages_project ON pages(project_id);

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, link TEXT
    );
  `);

  const row = db.prepare("SELECT value FROM schema_meta WHERE key = 'version'").get() as { value: string } | undefined;
  if (!row) {
    db.prepare("INSERT INTO schema_meta (key, value) VALUES ('version', ?)").run(String(SCHEMA_VERSION));
  }

  const projectColumns = (db.prepare("PRAGMA table_info(projects)").all() as { name: string }[]).map((c) => c.name);
  if (!projectColumns.includes("parent_id")) {
    db.exec("ALTER TABLE projects ADD COLUMN parent_id TEXT");
  }
}
