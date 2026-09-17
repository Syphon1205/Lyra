import type Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import type { Issue, IssueStatus, IssuePriority, IssueType, ID, ActivityEvent } from "../../shared/types.js";

interface IssueRow {
  id: string;
  prefix: string;
  number: number;
  title: string;
  body: string;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  estimate: number | null;
  epic_name: string | null;
  assignee_id: string | null;
  creator_id: string;
  label_ids: string;
  project_id: string | null;
  cycle_id: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  rank: number;
  linked_branch: string | null;
  linked_pr_url: string | null;
  comment_count: number;
}

function rowToIssue(row: IssueRow): Issue {
  return {
    id: row.id,
    identifier: { prefix: row.prefix, number: row.number },
    title: row.title,
    body: row.body,
    type: row.type,
    status: row.status,
    priority: row.priority,
    estimate: row.estimate ?? undefined,
    epicName: row.epic_name ?? undefined,
    assigneeId: row.assignee_id ?? undefined,
    creatorId: row.creator_id,
    labelIds: JSON.parse(row.label_ids),
    projectId: row.project_id ?? undefined,
    cycleId: row.cycle_id ?? undefined,
    dueDate: row.due_date ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    rank: row.rank,
    linkedBranch: row.linked_branch ?? undefined,
    linkedPullRequestUrl: row.linked_pr_url ?? undefined,
    commentCount: row.comment_count,
  };
}

/** In-memory undo stack for issue field changes — mirrors WorkspaceStore's
 * undo behavior from the Swift app. Kept per-process (not persisted); an
 * undo after a restart is out of scope, same as the original. */
interface UndoEntry {
  issueId: ID;
  previous: Partial<IssueRow>;
}

export class IssueService {
  private undoStack: UndoEntry[] = [];

  constructor(private db: Database.Database) {}

  list(): Issue[] {
    const rows = this.db.prepare("SELECT * FROM issues ORDER BY rank ASC").all() as IssueRow[];
    return rows.map(rowToIssue);
  }

  private getRow(id: ID): IssueRow | undefined {
    return this.db.prepare("SELECT * FROM issues WHERE id = ?").get(id) as IssueRow | undefined;
  }

  create(input: {
    title: string;
    body?: string;
    type: IssueType;
    status: IssueStatus;
    priority: IssuePriority;
    assigneeId?: ID;
    projectId?: ID;
    cycleId?: ID;
    creatorId: ID;
  }): Issue {
    const maxNumber = (this.db.prepare("SELECT MAX(number) as m FROM issues").get() as { m: number | null }).m ?? 139;
    const minRank = (this.db.prepare("SELECT MIN(rank) as m FROM issues WHERE status = ?").get(input.status) as { m: number | null }).m ?? 0;
    const id = randomUUID();
    const now = new Date().toISOString();
    this.db
      .prepare(
        `INSERT INTO issues (id, prefix, number, title, body, type, status, priority, estimate, epic_name,
          assignee_id, creator_id, label_ids, project_id, cycle_id, due_date, created_at, updated_at, rank,
          linked_branch, linked_pr_url, comment_count)
        VALUES (@id, 'LYR', @number, @title, @body, @type, @status, @priority, NULL, NULL,
          @assignee_id, @creator_id, '[]', @project_id, @cycle_id, NULL, @created_at, @updated_at, @rank,
          NULL, NULL, 0)`
      )
      .run({
        id,
        number: maxNumber + 1,
        title: input.title,
        body: input.body ?? "",
        type: input.type,
        status: input.status,
        priority: input.priority,
        assignee_id: input.assigneeId ?? null,
        creator_id: input.creatorId,
        project_id: input.projectId ?? null,
        cycle_id: input.cycleId ?? null,
        created_at: now,
        updated_at: now,
        rank: minRank - 1000,
      });
    this.addActivity(id, { kind: "human", userId: input.creatorId }, "issueCreated", "created this issue");
    return rowToIssue(this.getRow(id)!);
  }

  update(id: ID, patch: Partial<Pick<Issue, "title" | "body" | "status" | "priority" | "assigneeId" | "cycleId" | "estimate" | "labelIds">>, recordUndo = true): Issue {
    const before = this.getRow(id);
    if (!before) throw new Error(`Issue not found: ${id}`);

    if (recordUndo) this.undoStack.push({ issueId: id, previous: before });

    const next: IssueRow = {
      ...before,
      title: patch.title ?? before.title,
      body: patch.body ?? before.body,
      status: patch.status ?? before.status,
      priority: patch.priority ?? before.priority,
      assignee_id: patch.assigneeId !== undefined ? patch.assigneeId ?? null : before.assignee_id,
      cycle_id: patch.cycleId !== undefined ? patch.cycleId ?? null : before.cycle_id,
      estimate: patch.estimate !== undefined ? patch.estimate ?? null : before.estimate,
      label_ids: patch.labelIds ? JSON.stringify(patch.labelIds) : before.label_ids,
      updated_at: new Date().toISOString(),
    };

    this.db
      .prepare(
        `UPDATE issues SET title=@title, body=@body, status=@status, priority=@priority,
          assignee_id=@assignee_id, cycle_id=@cycle_id, estimate=@estimate, label_ids=@label_ids, updated_at=@updated_at
         WHERE id=@id`
      )
      .run(next);

    return rowToIssue(next);
  }

  move(id: ID, status: IssueStatus, beforeId?: ID, afterId?: ID): Issue {
    const rank = this.computeRank(status, beforeId, afterId);
    const before = this.getRow(id);
    if (!before) throw new Error(`Issue not found: ${id}`);
    if (before.status !== status) {
      this.undoStack.push({ issueId: id, previous: before });
    }
    const updatedAt = new Date().toISOString();
    this.db.prepare("UPDATE issues SET status=?, rank=?, updated_at=? WHERE id=?").run(status, rank, updatedAt, id);
    return rowToIssue(this.getRow(id)!);
  }

  reorder(id: ID, beforeId?: ID, afterId?: ID): Issue {
    const row = this.getRow(id);
    if (!row) throw new Error(`Issue not found: ${id}`);
    return this.move(id, row.status, beforeId, afterId);
  }

  private computeRank(status: IssueStatus, beforeId?: ID, afterId?: ID): number {
    const before = beforeId ? this.getRow(beforeId) : undefined;
    const after = afterId ? this.getRow(afterId) : undefined;
    if (before && after) return (before.rank + after.rank) / 2;
    if (before) return before.rank + 1000;
    if (after) return after.rank - 1000;
    const extreme = this.db.prepare("SELECT MAX(rank) as m FROM issues WHERE status = ?").get(status) as { m: number | null };
    return (extreme.m ?? 0) + 1000;
  }

  undo(): Issue | null {
    const entry = this.undoStack.pop();
    if (!entry) return null;
    this.db
      .prepare(
        `UPDATE issues SET title=@title, body=@body, status=@status, priority=@priority,
          assignee_id=@assignee_id, cycle_id=@cycle_id, estimate=@estimate, rank=@rank, updated_at=@updated_at
         WHERE id=@id`
      )
      .run({ ...entry.previous, id: entry.issueId, updated_at: new Date().toISOString() });
    return rowToIssue(this.getRow(entry.issueId)!);
  }

  addActivity(issueId: ID, actor: { kind: "human" | "agent" | "system"; userId?: ID; agentName?: string }, kind: ActivityEvent["kind"], detail: string) {
    this.db
      .prepare(
        "INSERT INTO activity (id, issue_id, actor_kind, actor_user_id, actor_agent_name, kind, detail, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(randomUUID(), issueId, actor.kind, actor.userId ?? null, actor.agentName ?? null, kind, detail, new Date().toISOString());
  }

  addComment(issueId: ID, userId: ID, text: string): ActivityEvent {
    const id = randomUUID();
    const now = new Date().toISOString();
    this.db
      .prepare(
        "INSERT INTO activity (id, issue_id, actor_kind, actor_user_id, actor_agent_name, kind, detail, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(id, issueId, "human", userId, null, "comment", text, now);

    this.db.prepare("UPDATE issues SET comment_count = comment_count + 1 WHERE id = ?").run(issueId);

    return {
      id,
      issueId,
      actor: { kind: "human", userId },
      kind: "commentAdded",
      detail: text,
      createdAt: now,
    };
  }

  activityFor(issueId: ID): ActivityEvent[] {
    const rows = this.db.prepare("SELECT * FROM activity WHERE issue_id = ? ORDER BY created_at ASC").all(issueId) as any[];
    return rows.map((r) => ({
      id: r.id,
      issueId: r.issue_id,
      actor: { kind: r.actor_kind, userId: r.actor_user_id ?? undefined, agentName: r.actor_agent_name ?? undefined },
      kind: r.kind,
      detail: r.detail,
      createdAt: r.created_at,
    }));
  }
}
