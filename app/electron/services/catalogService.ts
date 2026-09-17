import type Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import type {
  Project,
  Cycle,
  User,
  IssueLabel,
  Workspace,
  Repository,
  Team,
  ID,
  ProjectComponent,
  ProjectRelease,
  ProjectPage,
  AppNotification,
} from "../../shared/types.js";

/** Reference data reads and writes (projects, cycles, users, labels, workspace, repos, components, releases, pages, notifications). */
export class CatalogService {
  constructor(private db: Database.Database) {}

  workspace(): Workspace {
    return this.db.prepare("SELECT * FROM workspaces LIMIT 1").get() as Workspace;
  }

  users(): User[] {
    const rows = this.db.prepare("SELECT * FROM users").all() as any[];
    return rows.map((r) => ({ id: r.id, name: r.name, email: r.email, colorSeed: r.color_seed }));
  }

  labels(): IssueLabel[] {
    const rows = this.db.prepare("SELECT * FROM labels").all() as any[];
    return rows.map((r) => ({ id: r.id, name: r.name, colorSeed: r.color_seed }));
  }

  repositories(): Repository[] {
    const rows = this.db.prepare("SELECT * FROM repositories").all() as any[];
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      localPath: r.local_path,
      currentBranch: r.current_branch,
      remoteUrl: r.remote_url ?? undefined,
    }));
  }

  projects(): (Project & { starred: boolean })[] {
    const rows = this.db.prepare("SELECT * FROM projects").all() as any[];
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      summary: r.summary,
      status: r.status,
      iconSymbol: r.icon_symbol,
      parentId: r.parent_id ?? undefined,
      teamId: r.team_id ?? undefined,
      memberIds: JSON.parse(r.member_ids),
      repositoryId: r.repository_id ?? undefined,
      activeCycleId: r.active_cycle_id ?? undefined,
      targetDate: r.target_date ?? undefined,
      createdAt: r.created_at,
      starred: !!r.starred,
    }));
  }

  createProject(input: {
    name: string;
    summary?: string;
    description?: string;
    iconSymbol?: string;
    icon?: string;
    key?: string;
    parentId?: ID;
    repositoryId?: ID;
  }): Project & { starred: boolean } {
    const id = randomUUID();
    const now = new Date().toISOString();
    const users = this.users();
    const firstTeam = this.teams()[0];
    const summary = input.summary || input.description || "";
    const icon = input.iconSymbol || input.icon || "engineering";
    this.db
      .prepare(
        `INSERT INTO projects (id, name, summary, status, icon_symbol, parent_id, team_id, member_ids, repository_id, active_cycle_id, target_date, created_at, starred)
         VALUES (?, ?, ?, 'active', ?, ?, ?, ?, ?, NULL, NULL, ?, 0)`
      )
      .run(
        id,
        input.name,
        summary,
        icon,
        input.parentId ?? null,
        firstTeam?.id ?? null,
        JSON.stringify(users.map((u) => u.id)),
        input.repositoryId ?? null,
        now
      );

    return {
      id,
      name: input.name,
      summary,
      status: "active",
      iconSymbol: icon,
      parentId: input.parentId,
      teamId: firstTeam?.id ?? "",
      memberIds: users.map((u) => u.id),
      repositoryId: input.repositoryId,
      activeCycleId: undefined,
      targetDate: undefined,
      createdAt: now,
      starred: false,
    };
  }

  updateProject(id: ID, patch: { name?: string; summary?: string; description?: string; iconSymbol?: string; icon?: string; repositoryId?: ID }): void {
    const fields: string[] = [];
    const values: any[] = [];
    if (patch.name !== undefined) {
      fields.push("name = ?");
      values.push(patch.name);
    }
    const summary = patch.summary ?? patch.description;
    if (summary !== undefined) {
      fields.push("summary = ?");
      values.push(summary);
    }
    const icon = patch.iconSymbol ?? patch.icon;
    if (icon !== undefined) {
      fields.push("icon_symbol = ?");
      values.push(icon);
    }
    if (patch.repositoryId !== undefined) {
      fields.push("repository_id = ?");
      values.push(patch.repositoryId);
    }
    if (fields.length > 0) {
      values.push(id);
      this.db.prepare(`UPDATE projects SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    }
  }

  toggleStar(projectId: ID): boolean {
    const row = this.db.prepare("SELECT starred FROM projects WHERE id = ?").get(projectId) as { starred: number } | undefined;
    if (!row) throw new Error("Project not found");
    const next = row.starred ? 0 : 1;
    this.db.prepare("UPDATE projects SET starred = ? WHERE id = ?").run(next, projectId);
    return !!next;
  }

  teams(): Team[] {
    const rows = this.db.prepare("SELECT * FROM teams").all() as any[];
    return rows.map((r) => ({ id: r.id, name: r.name, abbreviation: r.abbreviation, memberIds: JSON.parse(r.member_ids) }));
  }

  cycles(): Cycle[] {
    const rows = this.db.prepare("SELECT * FROM cycles ORDER BY number ASC").all() as any[];
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      number: r.number,
      projectId: r.project_id,
      startDate: r.start_date,
      endDate: r.end_date,
    }));
  }

  createCycle(input: { projectId: ID; name: string; startDate?: string; endDate?: string; startsAt?: string; endsAt?: string; number?: number }): Cycle {
    const id = randomUUID();
    const maxNum = (this.db.prepare("SELECT MAX(number) as m FROM cycles WHERE project_id = ?").get(input.projectId) as any)?.m ?? 4;
    const number = input.number ?? maxNum + 1;
    const startDate = input.startDate || input.startsAt || new Date().toISOString();
    const endDate = input.endDate || input.endsAt || new Date(Date.now() + 14 * 86400000).toISOString();
    this.db
      .prepare("INSERT INTO cycles (id, name, number, project_id, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)")
      .run(id, input.name, number, input.projectId, startDate, endDate);

    return { id, name: input.name, number, projectId: input.projectId, startDate, endDate };
  }

  completeCycle(cycleId: ID, targetCycleId?: ID): Cycle {
    if (targetCycleId) {
      this.db.prepare("UPDATE issues SET cycle_id = ? WHERE cycle_id = ? AND status != 'done'").run(targetCycleId, cycleId);
    } else {
      this.db.prepare("UPDATE issues SET cycle_id = NULL WHERE cycle_id = ? AND status != 'done'").run(cycleId);
    }
    const row = this.db.prepare("SELECT * FROM cycles WHERE id = ?").get(cycleId) as any;
    return {
      id: row.id,
      name: row.name,
      number: row.number,
      projectId: row.project_id,
      startDate: row.start_date,
      endDate: row.end_date,
    };
  }

  components(projectId: ID): ProjectComponent[] {
    const rows = this.db.prepare("SELECT * FROM components WHERE project_id = ? ORDER BY created_at ASC").all(projectId) as any[];
    if (rows.length === 0) {
      // Seed initial components for this project if empty
      const initial = [
        { name: "Liquid Glass Shell", description: "Translucent backdrop, smoky chrome, and macOS vibrancy.", lead: "Tanner Davidson" },
        { name: "Navigation & Sidebar", description: "31px row height, project trees, and matched geometry transitions.", lead: "Marcus Lee" },
        { name: "Agent Runner Service", description: "Subprocess execution harness, streaming, and CLI adapters.", lead: "Elena Fischer" },
        { name: "Persistence Layer", description: "SQLite WAL store, migrations, and transactional updates.", lead: "Priya Shah" },
      ];
      const insert = this.db.prepare("INSERT INTO components (id, project_id, name, description, lead_id, created_at) VALUES (?, ?, ?, ?, ?, ?)");
      const users = this.users();
      for (const comp of initial) {
        const id = randomUUID();
        const lead = users.find((u) => u.name === comp.lead) ?? users[0];
        insert.run(id, projectId, comp.name, comp.description, lead?.id ?? null, new Date().toISOString());
      }
      return this.components(projectId);
    }
    return rows.map((r) => ({
      id: r.id,
      projectId: r.project_id,
      name: r.name,
      description: r.description ?? undefined,
      leadId: r.lead_id ?? undefined,
      createdAt: r.created_at,
    }));
  }

  createComponent(input: { projectId: ID; name: string; description?: string; leadId?: ID }): ProjectComponent {
    const id = randomUUID();
    const now = new Date().toISOString();
    this.db
      .prepare("INSERT INTO components (id, project_id, name, description, lead_id, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .run(id, input.projectId, input.name, input.description ?? null, input.leadId ?? null, now);
    return { id, projectId: input.projectId, name: input.name, description: input.description, leadId: input.leadId, createdAt: now };
  }

  releases(projectId: ID): ProjectRelease[] {
    const rows = this.db.prepare("SELECT * FROM releases WHERE project_id = ? ORDER BY release_date DESC").all(projectId) as any[];
    if (rows.length === 0) {
      // Seed default releases
      const initial = [
        { version: "v0.1.0", status: "released" as const, date: "Nov 1, 2024", desc: "Initial alpha architecture with Electron, React, and SQLite." },
        { version: "v0.2.0", status: "unreleased" as const, date: "Nov 20, 2024", desc: "Liquid glass chrome, CLI agent execution, and GitHub CLI integration." },
        { version: "v1.0.0", status: "unreleased" as const, date: "Dec 15, 2024", desc: "General availability release with full collaborative sync." },
      ];
      const insert = this.db.prepare("INSERT INTO releases (id, project_id, version, status, release_date, description) VALUES (?, ?, ?, ?, ?, ?)");
      for (const rel of initial) {
        insert.run(randomUUID(), projectId, rel.version, rel.status, rel.date, rel.desc);
      }
      return this.releases(projectId);
    }
    return rows.map((r) => ({
      id: r.id,
      projectId: r.project_id,
      version: r.version,
      status: r.status,
      releaseDate: r.release_date ?? undefined,
      description: r.description ?? undefined,
    }));
  }

  createRelease(input: { projectId: ID; version: string; status?: "unreleased" | "released" | "archived"; releaseDate?: string; description?: string; name?: string }): ProjectRelease {
    const id = randomUUID();
    const status = input.status || "unreleased";
    const desc = input.description || input.name;
    this.db
      .prepare("INSERT INTO releases (id, project_id, version, status, release_date, description) VALUES (?, ?, ?, ?, ?, ?)")
      .run(id, input.projectId, input.version, status, input.releaseDate ?? null, desc ?? null);
    return { id, projectId: input.projectId, version: input.version, status, releaseDate: input.releaseDate, description: desc };
  }

  pages(projectId: ID): ProjectPage[] {
    const rows = this.db.prepare("SELECT * FROM pages WHERE project_id = ? ORDER BY updated_at DESC").all(projectId) as any[];
    if (rows.length === 0) {
      // Seed default page
      const id = randomUUID();
      const now = new Date().toISOString();
      const content = `# Architecture Guide\n\nLyra combines native desktop performance with local-first agent workflows.\n\n## Core Principles\n- **Liquid Glass Shell**: Native macOS vibrancy with smoky translucency.\n- **Agent Companion**: Persistent CLI execution for Codex, Claude Code, and OpenCode.\n- **Local-First SQLite**: Transactional persistence with zero latency.`;
      this.db.prepare("INSERT INTO pages (id, project_id, title, content, updated_at) VALUES (?, ?, ?, ?, ?)").run(id, projectId, "Architecture Guide", content, now);
      return [{ id, projectId, title: "Architecture Guide", content, updatedAt: now }];
    }
    return rows.map((r) => ({
      id: r.id,
      projectId: r.project_id,
      title: r.title,
      content: r.content,
      updatedAt: r.updated_at,
    }));
  }

  createPage(input: { projectId: ID; title: string; content?: string; body?: string }): ProjectPage {
    const id = randomUUID();
    const now = new Date().toISOString();
    const content = input.content || input.body || "";
    this.db
      .prepare("INSERT INTO pages (id, project_id, title, content, updated_at) VALUES (?, ?, ?, ?, ?)")
      .run(id, input.projectId, input.title, content, now);
    return { id, projectId: input.projectId, title: input.title, content, updatedAt: now };
  }

  updatePage(id: ID, patch: { title?: string; content?: string; body?: string }): void {
    const now = new Date().toISOString();
    const content = patch.content ?? patch.body;
    if (patch.title !== undefined && content !== undefined) {
      this.db.prepare("UPDATE pages SET title = ?, content = ?, updated_at = ? WHERE id = ?").run(patch.title, content, now, id);
    } else if (patch.title !== undefined) {
      this.db.prepare("UPDATE pages SET title = ?, updated_at = ? WHERE id = ?").run(patch.title, now, id);
    } else if (content !== undefined) {
      this.db.prepare("UPDATE pages SET content = ?, updated_at = ? WHERE id = ?").run(content, now, id);
    }
  }

  deletePage(id: ID): void {
    this.db.prepare("DELETE FROM pages WHERE id = ?").run(id);
  }

  notifications(): AppNotification[] {
    const rows = this.db.prepare("SELECT * FROM notifications ORDER BY created_at DESC").all() as any[];
    if (rows.length === 0) {
      const initial = [
        { title: "Codex Agent Run Completed", body: "3 files changed in branch lyr-142-sidebar with passing tests.", link: "LYR-142" },
        { title: "Assigned to LYR-142", body: "Tanner Davidson assigned you to Redesign sidebar navigation.", link: "LYR-142" },
        { title: "Cycle 04 Started", body: "Cycle 04 (Nov 4 - Nov 17) is active with 18 scheduled tasks.", link: "cycle-04" },
      ];
      const insert = this.db.prepare("INSERT INTO notifications (id, title, body, read, created_at, link) VALUES (?, ?, ?, ?, ?, ?)");
      for (const n of initial) {
        insert.run(randomUUID(), n.title, n.body, 0, new Date().toISOString(), n.link);
      }
      return this.notifications();
    }
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      read: !!r.read,
      createdAt: r.created_at,
      link: r.link ?? undefined,
    }));
  }

  markNotificationRead(id?: ID): void {
    if (id) {
      this.db.prepare("UPDATE notifications SET read = 1 WHERE id = ?").run(id);
    } else {
      this.db.prepare("UPDATE notifications SET read = 1").run();
    }
  }
}

