import type Database from "better-sqlite3";
import { randomUUID } from "node:crypto";

/**
 * Approved reference fixtures seeded for visual tests / capture or user demo selection.
 */
export function seedDemoFixtures(
  db: Database.Database,
  currentUser?: { id?: string; name?: string; email?: string }
) {
  const count = (db.prepare("SELECT COUNT(*) as c FROM issues").get() as { c: number }).c;
  if (count > 0) return;

  const now = Date.now();
  const days = (n: number) => new Date(now + n * 86400000).toISOString();
  const hours = (n: number) => new Date(now + n * 3600000).toISOString();

  const workspaceId = randomUUID();
  db.prepare("INSERT INTO workspaces (id, name, slug) VALUES (?, ?, ?)").run(
    workspaceId,
    "Ambient",
    "ambient"
  );

  const users = [
    {
      id: currentUser?.id ?? randomUUID(),
      name: currentUser?.name ?? "Tanner Davidson",
      email: currentUser?.email ?? "tanner@ambient.dev",
      colorSeed: 1,
    },
    { id: randomUUID(), name: "Marcus Lee", email: "marcus@ambient.dev", colorSeed: 3 },
    { id: randomUUID(), name: "Elena Fischer", email: "elena@ambient.dev", colorSeed: 4 },
    { id: randomUUID(), name: "Priya Shah", email: "priya@ambient.dev", colorSeed: 2 },
  ];
  const insertUser = db.prepare(
    "INSERT INTO users (id, name, email, color_seed) VALUES (?, ?, ?, ?)"
  );
  for (const u of users) insertUser.run(u.id, u.name, u.email, u.colorSeed);

  const teamId = randomUUID();
  db.prepare("INSERT INTO teams (id, name, abbreviation, member_ids) VALUES (?, ?, ?, ?)").run(
    teamId,
    "Engineering",
    "ENG",
    JSON.stringify(users.map((u) => u.id))
  );

  const repoId = randomUUID();
  db.prepare(
    "INSERT INTO repositories (id, name, local_path, current_branch, remote_url) VALUES (?, ?, ?, ?, ?)"
  ).run(repoId, "lyra", "~/Developer/lyra", "lyr-142-sidebar", "https://github.com/ambient/lyra");

  const lyraId = randomUUID();
  const engineeringId = randomUUID();

  const insertProject = db.prepare(`
    INSERT INTO projects (id, name, summary, status, icon_symbol, parent_id, team_id, member_ids, repository_id, active_cycle_id, target_date, created_at, starred)
    VALUES (@id, @name, @summary, @status, @icon_symbol, @parent_id, @team_id, @member_ids, @repository_id, @active_cycle_id, @target_date, @created_at, @starred)
  `);

  insertProject.run({
    id: lyraId,
    name: "Lyra",
    summary: "Native project management for humans and agents.",
    status: "active",
    icon_symbol: "layout-grid",
    parent_id: null,
    team_id: teamId,
    member_ids: JSON.stringify(users.map((u) => u.id)),
    repository_id: repoId,
    active_cycle_id: null,
    target_date: days(21),
    created_at: days(-30),
    starred: 1,
  });

  insertProject.run({
    id: engineeringId,
    name: "Engineering",
    summary: "Build, iterate, and ship the next generation of project management.",
    status: "active",
    icon_symbol: "engineering",
    parent_id: lyraId,
    team_id: teamId,
    member_ids: JSON.stringify(users.map((u) => u.id)),
    repository_id: repoId,
    active_cycle_id: null,
    target_date: days(21),
    created_at: days(-30),
    starred: 1,
  });

  for (const [name, icon] of [
    ["Design", "design"],
    ["Infrastructure", "infrastructure"],
    ["Mobile", "mobile"],
    ["Docs", "document"],
  ] as const) {
    insertProject.run({
      id: randomUUID(),
      name,
      summary: `${name} work for Lyra.`,
      status: "active",
      icon_symbol: icon,
      parent_id: lyraId,
      team_id: teamId,
      member_ids: JSON.stringify([users[0]!.id]),
      repository_id: null,
      active_cycle_id: null,
      target_date: null,
      created_at: days(-20),
      starred: 0,
    });
  }

  const cycle04Id = randomUUID();
  const cycle05Id = randomUUID();
  const insertCycle = db.prepare(
    "INSERT INTO cycles (id, name, number, project_id, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)"
  );
  insertCycle.run(cycle04Id, "Cycle 04", 4, engineeringId, "2024-11-04T00:00:00.000Z", "2024-11-17T23:59:59.000Z");
  insertCycle.run(cycle05Id, "Cycle 05", 5, engineeringId, "2024-11-18T00:00:00.000Z", "2024-12-01T23:59:59.000Z");

  const labelNames = [
    "Design", "macOS", "Agent", "Git", "Frontend", "Board", "Backend",
    "Auth", "Productivity", "Data", "Sync", "Integrations", "Navigation",
    "UX", "Polish", "Native", "Docs", "Settings", "Core", "Setup"
  ];
  const labelMap: Record<string, string> = {};
  const insertLabel = db.prepare("INSERT INTO labels (id, name, color_seed) VALUES (?, ?, ?)");
  labelNames.forEach((name, i) => {
    const id = randomUUID();
    labelMap[name] = id;
    insertLabel.run(id, name, i);
  });

  interface IssueDef {
    prefix: string;
    number: number;
    title: string;
    body: string;
    type: "task" | "bug" | "story" | "epic";
    status: "todo" | "inProgress" | "inReview" | "done" | "backlog";
    priority: "urgent" | "high" | "medium" | "low" | "none";
    labels: string[];
    assigneeIndex: number;
    estimate: number;
    commentCount: number;
    branch?: string;
  }

  const issueDefs: IssueDef[] = [
    // To Do
    {
      prefix: "LYR", number: 142, title: "Redesign sidebar navigation",
      body: "The sidebar transitions feel janky when switching projects, especially on slower machines. We should refine the animation and ensure it uses matched geometry for a smoother experience.",
      type: "task", status: "todo", priority: "low", labels: ["Design", "macOS"],
      assigneeIndex: 0, estimate: 2, commentCount: 2, branch: "lyr-142-sidebar"
    },
    {
      prefix: "LYR", number: 138, title: "Implement agent chat panel",
      body: "Add responsive companion agent panel on the right supporting stream responses.",
      type: "story", status: "todo", priority: "medium", labels: ["Agent", "Frontend"],
      assigneeIndex: 1, estimate: 4, commentCount: 4
    },
    {
      prefix: "LYR", number: 129, title: "Migrate data layer to SQLite",
      body: "Replace temporary in-memory store with better-sqlite3 local persistence.",
      type: "task", status: "todo", priority: "high", labels: ["Backend", "Data"],
      assigneeIndex: 2, estimate: 5, commentCount: 1
    },
    {
      prefix: "LYR", number: 118, title: "Add keyboard shortcuts",
      body: "Global keyboard shortcuts for navigation and issue operations.",
      type: "task", status: "todo", priority: "low", labels: ["UX", "Polish"],
      assigneeIndex: 0, estimate: 1, commentCount: 0
    },
    {
      prefix: "LYR", number: 104, title: "Project settings UI",
      body: "Build dedicated view for general, appearance, and agent configuration.",
      type: "task", status: "todo", priority: "medium", labels: ["Settings"],
      assigneeIndex: 3, estimate: 2, commentCount: 2
    },

    // In Progress
    {
      prefix: "LYR", number: 137, title: "Agent worktree isolation",
      body: "Ensure agents work in detached worktrees without interfering with working directory.",
      type: "task", status: "inProgress", priority: "high", labels: ["Agent", "Git"],
      assigneeIndex: 1, estimate: 3, commentCount: 3, branch: "agent-worktree"
    },
    {
      prefix: "LYR", number: 126, title: "Board drag and drop",
      body: "Pragmatic drag and drop implementation for board columns and rank updates.",
      type: "task", status: "inProgress", priority: "medium", labels: ["Board", "Frontend"],
      assigneeIndex: 0, estimate: 2, commentCount: 5, branch: "board-dnd"
    },
    {
      prefix: "LYR", number: 112, title: "Realtime activity updates",
      body: "Stream agent and git events into issue activity timeline in realtime.",
      type: "task", status: "inProgress", priority: "medium", labels: ["Backend", "Sync"],
      assigneeIndex: 2, estimate: 3, commentCount: 2, branch: "activity-sync"
    },
    {
      prefix: "LYR", number: 101, title: "Menu bar integration",
      body: "macOS native menu bar and quick issue composer integration.",
      type: "task", status: "inProgress", priority: "low", labels: ["macOS", "Native"],
      assigneeIndex: 3, estimate: 2, commentCount: 1, branch: "menubar"
    },

    // In Review
    {
      prefix: "LYR", number: 130, title: "Issue detail panel redesign",
      body: "Focus view with structured right inspector and activity stream.",
      type: "task", status: "inReview", priority: "medium", labels: ["UX", "Frontend"],
      assigneeIndex: 0, estimate: 3, commentCount: 4, branch: "issue-detail"
    },
    {
      prefix: "LYR", number: 121, title: "Command palette",
      body: "Cmd+K palette with instant action search and keyboard shortcuts.",
      type: "task", status: "inReview", priority: "low", labels: ["Productivity"],
      assigneeIndex: 1, estimate: 1, commentCount: 3, branch: "cmd-k"
    },
    {
      prefix: "LYR", number: 107, title: "Repo insights in issues",
      body: "Display commit list and file diff badges on linked pull requests.",
      type: "task", status: "inReview", priority: "medium", labels: ["Git", "Integrations"],
      assigneeIndex: 2, estimate: 2, commentCount: 1, branch: "repo-insights"
    },
    {
      prefix: "LYR", number: 99, title: "Onboarding experience",
      body: "Introduce workspace creation and agent detection during first run.",
      type: "story", status: "inReview", priority: "low", labels: ["UX", "Docs"],
      assigneeIndex: 3, estimate: 3, commentCount: 2, branch: "onboarding"
    },

    // Done
    {
      prefix: "LYR", number: 125, title: "Authentication (GitHub)",
      body: "GitHub personal access token and OAuth support for repository actions.",
      type: "task", status: "done", priority: "high", labels: ["Auth", "Backend"],
      assigneeIndex: 1, estimate: 5, commentCount: 0
    },
    {
      prefix: "LYR", number: 119, title: "Basic issue CRUD",
      body: "Create, read, update, and delete issues via SQLite service.",
      type: "task", status: "done", priority: "medium", labels: ["Backend"],
      assigneeIndex: 2, estimate: 2, commentCount: 0
    },
    {
      prefix: "LYR", number: 110, title: "Project sidebar",
      body: "Liquid glass sidebar navigation with responsive collapsible groups.",
      type: "task", status: "done", priority: "low", labels: ["Navigation"],
      assigneeIndex: 0, estimate: 1, commentCount: 0
    },
    {
      prefix: "LYR", number: 108, title: "Dark mode polish",
      body: "Subtle semantic tokens for both light and dark appearance modes.",
      type: "task", status: "done", priority: "low", labels: ["Design"],
      assigneeIndex: 3, estimate: 1, commentCount: 0
    },
    {
      prefix: "LYR", number: 100, title: "Initial project structure",
      body: "Vite, React, TypeScript, and Electron architecture configuration.",
      type: "task", status: "done", priority: "low", labels: ["Core", "Setup"],
      assigneeIndex: 0, estimate: 1, commentCount: 0
    },
  ];

  const insertIssue = db.prepare(`
    INSERT INTO issues (id, prefix, number, title, body, type, status, priority, estimate, epic_name,
      assignee_id, creator_id, label_ids, project_id, cycle_id, due_date, created_at, updated_at, rank,
      linked_branch, linked_pr_url, comment_count)
    VALUES (@id, @prefix, @number, @title, @body, @type, @status, @priority, @estimate, @epic_name,
      @assignee_id, @creator_id, @label_ids, @project_id, @cycle_id, @due_date, @created_at, @updated_at, @rank,
      @linked_branch, @linked_pr_url, @comment_count)
  `);

  const insertActivity = db.prepare(`
    INSERT INTO activity (id, issue_id, actor_kind, actor_user_id, actor_agent_name, kind, detail, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  issueDefs.forEach((def, index) => {
    const id = randomUUID();
    const createdAt = days(-10 + index);
    const updatedAt = hours(-index);
    const labelIds = def.labels.map((l) => labelMap[l]).filter(Boolean);

    insertIssue.run({
      id,
      prefix: def.prefix,
      number: def.number,
      title: def.title,
      body: def.body,
      type: def.type,
      status: def.status,
      priority: def.priority,
      estimate: def.estimate,
      epic_name: "Liquid Glass Shell",
      assignee_id: users[def.assigneeIndex]?.id ?? null,
      creator_id: users[0]!.id,
      label_ids: JSON.stringify(labelIds),
      project_id: engineeringId,
      cycle_id: cycle04Id,
      due_date: days(14),
      created_at: createdAt,
      updated_at: updatedAt,
      rank: index * 1000,
      linked_branch: def.branch ?? null,
      linked_pr_url: null,
      comment_count: def.commentCount,
    });

    insertActivity.run(randomUUID(), id, "human", users[0]!.id, null, "issueCreated", "created this issue", createdAt);
    if (def.number === 142) {
      insertActivity.run(randomUUID(), id, "agent", null, "Codex", "branchCreated", "created branch lyr-142-sidebar", hours(-24));
      insertActivity.run(randomUUID(), id, "agent", null, "Codex", "commitsPushed", "pushed 3 commits", hours(-20));
      insertActivity.run(randomUUID(), id, "system", null, null, "buildStatus", "Build passed", hours(-18));
      insertActivity.run(randomUUID(), id, "human", users[0]!.id, null, "statusChanged", "moved to In Progress", hours(-16));
    }
  });

  // Seed sample Agent Chat Session for LYR-142
  const sessionId = randomUUID();
  const issue142 = db.prepare("SELECT id FROM issues WHERE number = 142").get() as { id: string } | undefined;
  db.prepare(`
    INSERT INTO chat_sessions (id, title, issue_id, provider_id, provider_session_id, created_at, updated_at, archived, draft)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(sessionId, "Fix sidebar transition", issue142?.id ?? null, "codex", "codex-1", days(-1), hours(-2), 0, "");

  const insertMessage = db.prepare(`
    INSERT INTO chat_messages (id, session_id, role, text, created_at, activity_json, files_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertMessage.run(
    randomUUID(), sessionId, "user",
    "Can you take a look at the sidebar animation when switching projects? It feels janky, especially on slower machines.",
    hours(-3), null, null
  );

  insertMessage.run(
    randomUUID(), sessionId, "agent",
    "I'll take a look at the sidebar transition and see what might be causing the stutter.\n\nI'm going to inspect:\n• SidebarView.tsx\n• WorkspaceLayout.tsx\n• transition.ts\n\nI'll also check for unnecessary re-renders and layout shifts.",
    hours(-2.9), null, null
  );

  insertMessage.run(
    randomUUID(), sessionId, "agent",
    "Inspecting files...",
    hours(-2.8),
    JSON.stringify({ label: "Inspecting files...", detail: "✓ SidebarView.tsx  ✓ WorkspaceLayout.tsx  ✓ transition.ts", succeeded: true }),
    null
  );

  insertMessage.run(
    randomUUID(), sessionId, "agent",
    "I found the issue. The animation is being triggered at two levels in the view hierarchy, which causes a layout fight during transition.\n\nI can fix this by moving the animation to the container and using a single matchedGeometry.",
    hours(-2.7), null,
    JSON.stringify([
      { path: "src/components/SidebarView.tsx", additions: 24, deletions: 8 }
    ])
  );
}

export function seedIfEmpty(db: Database.Database) {
  if (process.env.CAPTURE_SCREENS === "1") {
    seedDemoFixtures(db);
    db.prepare("INSERT OR REPLACE INTO preferences (key, value) VALUES ('onboarding_completed', 'true')").run();
  }
}
