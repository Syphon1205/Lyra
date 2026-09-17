import type Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import os from "node:os";
import type { AgentAdapter, AgentRunRequest } from "./adapters/agentAdapter.js";
import type { AgentProviderId, AgentRunEvent, FileChangeSummary } from "../../shared/agentEvents.js";
import type { ID } from "../../shared/types.js";

export interface ChatMessageRecord {
  id: string;
  sessionId: string;
  role: "user" | "agent" | "system";
  text: string;
  createdAt: string;
  activity?: { label: string; detail?: string; succeeded: boolean };
  files?: FileChangeSummary[];
}

export interface ChatSessionRecord {
  id: string;
  title: string;
  issueId?: string;
  providerId: AgentProviderId;
  providerSessionId?: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  draft: string;
  messages: ChatMessageRecord[];
  isRunning: boolean;
}

/**
 * Owns chat session state and orchestrates agent runs. This is the "shared
 * service, not a React component" the migration brief requires: the
 * renderer only ever sees persisted sessions + a stream of events, so a
 * renderer reload or a second (detached) window can't start a duplicate run
 * — `runningBySession` is keyed per session in this single process.
 */
export class ChatService {
  private runningBySession = new Map<ID, { runId: string; cancel: () => void }>();

  constructor(
    private db: Database.Database,
    private adapters: Map<AgentProviderId, AgentAdapter>,
    private repoPath: string,
    private emit: (sessionId: ID, event: AgentRunEvent) => void
  ) {}

  listSessions(issueId?: ID): ChatSessionRecord[] {
    const rows = issueId
      ? (this.db.prepare("SELECT * FROM chat_sessions WHERE issue_id = ? ORDER BY updated_at DESC").all(issueId) as any[])
      : (this.db.prepare("SELECT * FROM chat_sessions ORDER BY updated_at DESC").all() as any[]);
    return rows.map((r) => this.hydrate(r));
  }

  getSession(id: ID): ChatSessionRecord | undefined {
    const row = this.db.prepare("SELECT * FROM chat_sessions WHERE id = ?").get(id) as any;
    return row ? this.hydrate(row) : undefined;
  }

  createSession(input: { title: string; issueId?: ID; providerId: AgentProviderId }): ChatSessionRecord {
    const id = randomUUID();
    const now = new Date().toISOString();
    this.db
      .prepare("INSERT INTO chat_sessions (id, title, issue_id, provider_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
      .run(id, input.title, input.issueId ?? null, input.providerId, now, now);
    return this.getSession(id)!;
  }

  renameSession(id: ID, title: string) {
    this.db.prepare("UPDATE chat_sessions SET title = ?, updated_at = ? WHERE id = ?").run(title, new Date().toISOString(), id);
  }

  archiveSession(id: ID, archived: boolean) {
    this.db.prepare("UPDATE chat_sessions SET archived = ? WHERE id = ?").run(archived ? 1 : 0, id);
  }

  deleteSession(id: ID) {
    this.runningBySession.get(id)?.cancel();
    this.db.prepare("DELETE FROM chat_messages WHERE session_id = ?").run(id);
    this.db.prepare("DELETE FROM chat_sessions WHERE id = ?").run(id);
  }

  saveDraft(id: ID, draft: string) {
    this.db.prepare("UPDATE chat_sessions SET draft = ? WHERE id = ?").run(draft, id);
  }

  isRunning(sessionId: ID): boolean {
    return this.runningBySession.has(sessionId);
  }

  cancelRun(sessionId: ID) {
    const running = this.runningBySession.get(sessionId);
    if (!running) return;
    running.cancel();
    this.runningBySession.delete(sessionId);
    this.appendMessage(sessionId, "system", "Run canceled.");
    this.emit(sessionId, { type: "run.canceled", runId: running.runId });
  }

  sendMessage(sessionId: ID, text: string): ChatMessageRecord {
    if (this.runningBySession.has(sessionId)) {
      throw new Error("A run is already in progress for this session.");
    }
    const session = this.getSession(sessionId);
    if (!session) throw new Error("Session not found");

    const userMessage = this.appendMessage(sessionId, "user", text);
    this.saveDraft(sessionId, "");

    const adapter = this.adapters.get(session.providerId);
    if (!adapter) {
      this.appendMessage(sessionId, "system", `No adapter registered for ${session.providerId}.`);
      return userMessage;
    }

    const runId = randomUUID();
    const request: AgentRunRequest = {
      runId,
      prompt: text,
      cwd: this.repoPath && this.repoPath.length > 0 ? this.repoPath : os.tmpdir(),
      resumeSessionId: session.providerSessionId,
    };

    const handle = adapter.start(request, (event) => this.handleEvent(sessionId, event));
    this.runningBySession.set(sessionId, { runId, cancel: handle.cancel });
    return userMessage;
  }

  private handleEvent(sessionId: ID, event: AgentRunEvent) {
    switch (event.type) {
      case "run.started":
        if (event.providerSessionId) {
          this.db.prepare("UPDATE chat_sessions SET provider_session_id = ? WHERE id = ?").run(event.providerSessionId, sessionId);
        }
        break;
      case "message.completed":
        this.appendMessage(sessionId, "agent", event.text);
        break;
      case "tool.completed":
        this.appendMessage(sessionId, "agent", event.label, {
          activity: { label: event.label, detail: event.detail, succeeded: event.succeeded },
        });
        break;
      case "files.changed":
        this.appendMessage(sessionId, "agent", `Changed ${event.files.length} file${event.files.length === 1 ? "" : "s"}`, {
          files: event.files,
        });
        break;
      case "run.completed":
      case "run.failed":
      case "run.canceled":
        this.runningBySession.delete(sessionId);
        if (event.type === "run.failed") {
          this.appendMessage(sessionId, "system", event.message);
        }
        break;
    }
    this.emit(sessionId, event);
  }

  private appendMessage(
    sessionId: ID,
    role: ChatMessageRecord["role"],
    text: string,
    extra?: { activity?: ChatMessageRecord["activity"]; files?: FileChangeSummary[] }
  ): ChatMessageRecord {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    this.db
      .prepare("INSERT INTO chat_messages (id, session_id, role, text, created_at, activity_json, files_json) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(id, sessionId, role, text, createdAt, extra?.activity ? JSON.stringify(extra.activity) : null, extra?.files ? JSON.stringify(extra.files) : null);
    this.db.prepare("UPDATE chat_sessions SET updated_at = ? WHERE id = ?").run(createdAt, sessionId);
    return { id, sessionId, role, text, createdAt, activity: extra?.activity, files: extra?.files };
  }

  private hydrate(row: any): ChatSessionRecord {
    const messages = (this.db.prepare("SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC").all(row.id) as any[]).map(
      (m): ChatMessageRecord => ({
        id: m.id,
        sessionId: m.session_id,
        role: m.role,
        text: m.text,
        createdAt: m.created_at,
        activity: m.activity_json ? JSON.parse(m.activity_json) : undefined,
        files: m.files_json ? JSON.parse(m.files_json) : undefined,
      })
    );
    return {
      id: row.id,
      title: row.title,
      issueId: row.issue_id ?? undefined,
      providerId: row.provider_id,
      providerSessionId: row.provider_session_id ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      archived: !!row.archived,
      draft: row.draft ?? "",
      messages,
      isRunning: this.runningBySession.has(row.id),
    };
  }
}
