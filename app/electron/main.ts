import { app, BrowserWindow, ipcMain, nativeTheme, Menu, shell } from "electron";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { openDatabase } from "./services/database.js";
import { seedIfEmpty } from "./services/seed.js";
import { IssueService } from "./services/issueService.js";
import { CatalogService } from "./services/catalogService.js";
import { ChatService } from "./services/chatService.js";
import { PreferenceService } from "./services/preferenceService.js";
import { GitHubService } from "./services/githubService.js";
import { GitService } from "./services/gitService.js";
import { ClaudeCodeAdapter } from "./services/adapters/claudeCodeAdapter.js";
import { CodexAdapter } from "./services/adapters/codexAdapter.js";
import { OpenCodeAdapter } from "./services/adapters/opencodeAdapter.js";
import { GeminiAdapter } from "./services/adapters/geminiAdapter.js";
import type { AgentAdapter } from "./services/adapters/agentAdapter.js";
import { IPC } from "../shared/ipc.js";
import type { AgentProviderId } from "../shared/agentEvents.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;

const db = openDatabase();
seedIfEmpty(db);
const issueService = new IssueService(db);
const catalogService = new CatalogService(db);
const preferenceService = new PreferenceService(db);
const githubService = new GitHubService();
const gitService = new GitService();

const adapters = new Map<AgentProviderId, AgentAdapter>([
  ["claude-code", new ClaudeCodeAdapter()],
  ["codex", new CodexAdapter()],
  ["opencode", new OpenCodeAdapter()],
  ["gemini", new GeminiAdapter()],
]);

function repoPathForActiveProject(): string {
  const repos = catalogService.repositories();
  const candidate = repos[0]?.localPath?.replace(/^~/, app.getPath("home"));
  // The seeded demo repository path is a fixture, not a guarantee — spawning
  // a real CLI agent with a `cwd` that doesn't exist fails with a Node ENOENT
  // that is easy to misread as "executable not found." Fall back to a real
  // directory rather than pass through an unverified path.
  if (candidate && fs.existsSync(candidate)) return candidate;
  return app.getPath("home");
}

const chatService = new ChatService(db, adapters, repoPathForActiveProject(), (sessionId, event) => {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send(IPC.chatEvent, sessionId, event);
  }
});

let appearanceMode: "system" | "light" | "dark" = "light";

function effectiveIsDark(): boolean {
  return appearanceMode === "system" ? nativeTheme.shouldUseDarkColors : appearanceMode === "dark";
}

function createMainWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 980,
    minHeight: 640,
    titleBarStyle: "hiddenInset",
    vibrancy: "under-window",
    visualEffectState: "active",
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  loadRenderer(win);
  if (isDev) {
    win.webContents.on("console-message", (_e, level, message, line, sourceId) => {
      console.log(`[renderer:${level}] ${message} (${sourceId}:${line})`);
    });
    win.webContents.on("preload-error", (_e, preloadPath, error) => {
      console.error(`[preload-error] ${preloadPath}`, error);
    });
  }
  return win;
}

function loadRenderer(win: BrowserWindow, hash = "") {
  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    win.loadURL(`${devUrl}/${hash ? "#" + hash : ""}`);
  } else {
    win.loadFile(path.join(__dirname, "..", "..", "dist", "renderer", "index.html"), hash ? { hash } : undefined);
  }
}

function createIssueWindow(issueId: string) {
  const win = new BrowserWindow({
    width: 420,
    height: 640,
    minWidth: 360,
    titleBarStyle: "hiddenInset",
    vibrancy: "under-window",
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  loadRenderer(win, `/issue/${issueId}`);
}

function createChatWindow(sessionId: string) {
  const win = new BrowserWindow({
    width: 440,
    height: 700,
    minWidth: 360,
    titleBarStyle: "hiddenInset",
    vibrancy: "under-window",
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  loadRenderer(win, `/chat/${sessionId}`);
}

// ---------------------------------------------------------------------------
// IPC — every handler validates its payload before touching a service.
// ---------------------------------------------------------------------------

const idSchema = z.string().min(1);

function handle<T extends z.ZodTypeAny>(channel: string, schema: T, fn: (input: z.infer<T>, event: Electron.IpcMainInvokeEvent) => unknown) {
  ipcMain.handle(channel, (event, raw) => {
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(`Invalid payload for ${channel}: ${parsed.error.message}`);
    }
    return fn(parsed.data, event);
  });
}

handle(IPC.issuesList, z.undefined(), () => issueService.list());

handle(
  IPC.issuesCreate,
  z.object({
    title: z.string().min(1),
    body: z.string().optional(),
    type: z.enum(["task", "bug", "story", "epic"]),
    status: z.enum(["backlog", "todo", "inProgress", "inReview", "done", "canceled"]),
    priority: z.enum(["none", "low", "medium", "high", "urgent"]),
    assigneeId: z.string().optional(),
    projectId: z.string().optional(),
    cycleId: z.string().optional(),
    creatorId: z.string(),
  }),
  (input) => issueService.create(input)
);

handle(
  IPC.issuesUpdate,
  z.object({
    id: idSchema,
    patch: z.object({
      title: z.string().optional(),
      body: z.string().optional(),
      status: z.enum(["backlog", "todo", "inProgress", "inReview", "done", "canceled"]).optional(),
      priority: z.enum(["none", "low", "medium", "high", "urgent"]).optional(),
      assigneeId: z.string().nullable().optional(),
      cycleId: z.string().nullable().optional(),
      estimate: z.number().nullable().optional(),
      labelIds: z.array(z.string()).optional(),
    }),
  }),
  (input) => issueService.update(input.id, input.patch as any)
);

handle(
  IPC.issuesAddComment,
  z.object({
    issueId: idSchema,
    authorId: idSchema,
    body: z.string().min(1),
  }),
  (input) => issueService.addComment(input.issueId, input.authorId, input.body)
);

handle(
  IPC.issuesMove,
  z.object({ id: idSchema, status: z.enum(["backlog", "todo", "inProgress", "inReview", "done", "canceled"]), beforeId: idSchema.optional(), afterId: idSchema.optional() }),
  (input) => issueService.move(input.id, input.status, input.beforeId, input.afterId)
);

handle(IPC.issuesReorder, z.object({ id: idSchema, beforeId: idSchema.optional(), afterId: idSchema.optional() }), (input) =>
  issueService.reorder(input.id, input.beforeId, input.afterId)
);

handle(IPC.issuesUndo, z.undefined(), () => issueService.undo());

handle(IPC.projectsList, z.undefined(), () => catalogService.projects());
handle(IPC.projectsToggleStar, idSchema, (id) => catalogService.toggleStar(id));
handle(
  IPC.projectsCreate,
  z.object({
    name: z.string().min(1),
    key: z.string().min(1),
    description: z.string().optional(),
    icon: z.string().optional(),
    leadId: z.string().optional(),
  }),
  (input) => catalogService.createProject(input)
);
handle(
  IPC.projectsUpdate,
  z.object({
    id: idSchema,
    patch: z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      icon: z.string().optional(),
    }),
  }),
  (input) => catalogService.updateProject(input.id, input.patch)
);

handle(IPC.cyclesList, z.undefined(), () => catalogService.cycles());
handle(
  IPC.cyclesCreate,
  z.object({
    projectId: idSchema,
    number: z.number(),
    name: z.string().min(1),
    startsAt: z.string(),
    endsAt: z.string(),
  }),
  (input) => catalogService.createCycle(input)
);
handle(IPC.cyclesComplete, idSchema, (id) => catalogService.completeCycle(id));

handle(IPC.componentsList, idSchema, (projectId) => catalogService.components(projectId));
handle(
  IPC.componentsCreate,
  z.object({
    projectId: idSchema,
    name: z.string().min(1),
    description: z.string().optional(),
    leadId: z.string().optional(),
  }),
  (input) => catalogService.createComponent(input)
);

handle(IPC.releasesList, idSchema, (projectId) => catalogService.releases(projectId));
handle(
  IPC.releasesCreate,
  z.object({
    projectId: idSchema,
    version: z.string().min(1),
    name: z.string().min(1),
    releaseDate: z.string().optional(),
  }),
  (input) => catalogService.createRelease(input)
);

handle(IPC.pagesList, idSchema, (projectId) => catalogService.pages(projectId));
handle(
  IPC.pagesCreate,
  z.object({
    projectId: idSchema,
    title: z.string().min(1),
    body: z.string().optional(),
    parentId: z.string().optional(),
  }),
  (input) => catalogService.createPage(input)
);
handle(
  IPC.pagesUpdate,
  z.object({
    id: idSchema,
    patch: z.object({
      title: z.string().optional(),
      body: z.string().optional(),
    }),
  }),
  (input) => catalogService.updatePage(input.id, input.patch)
);
handle(IPC.pagesDelete, idSchema, (id) => catalogService.deletePage(id));

handle(IPC.notificationsList, z.undefined(), () => catalogService.notifications());
handle(IPC.notificationsMarkRead, idSchema.optional(), (id) => catalogService.markNotificationRead(id));

handle(IPC.preferencesGet, z.undefined(), () => preferenceService.getAll());
handle(IPC.preferencesSet, z.record(z.any()), (prefs) => preferenceService.setMany(prefs));

handle(IPC.githubStatus, z.undefined(), () => githubService.status());
handle(IPC.githubLogin, z.undefined(), () => githubService.login());
handle(IPC.githubLogout, z.undefined(), () => githubService.logout());
handle(IPC.githubListRepos, z.undefined(), () => githubService.listRepos());
handle(IPC.githubListPRs, z.object({ repo: z.string().optional() }).optional(), (input) =>
  input?.repo ? githubService.listPullRequests(input.repo) : []
);
handle(IPC.githubOpenWeb, z.string(), (url) => shell.openExternal(url));

handle(IPC.gitStatus, z.string().optional(), (dir) => gitService.status(dir || repoPathForActiveProject()));
handle(IPC.gitDiff, z.string().optional(), (dir) => gitService.diff(dir || repoPathForActiveProject()));
handle(
  IPC.gitApply,
  z.object({ patch: z.string(), dir: z.string().optional() }),
  (input) => gitService.applyPatch(input.dir || repoPathForActiveProject(), input.patch)
);
handle(
  IPC.gitDiscard,
  z.object({ file: z.string().optional(), dir: z.string().optional() }),
  (input) => gitService.discardChanges(input.dir || repoPathForActiveProject(), input.file)
);
handle(IPC.gitBranches, z.string().optional(), (dir) => gitService.branches(dir || repoPathForActiveProject()));
handle(
  IPC.gitCommits,
  z.object({ limit: z.number().optional(), dir: z.string().optional() }).optional(),
  (input) => gitService.commits(input?.dir || repoPathForActiveProject(), input?.limit)
);
handle(
  IPC.gitCreateBranch,
  z.object({ branchName: z.string().min(1), dir: z.string().optional() }),
  (input) => gitService.createBranch(input.dir || repoPathForActiveProject(), input.branchName)
);

handle(IPC.teamsList, z.undefined(), () => catalogService.teams());
handle(IPC.repositoriesList, z.undefined(), () => catalogService.repositories());
handle(IPC.usersList, z.undefined(), () => catalogService.users());
handle(IPC.labelsList, z.undefined(), () => catalogService.labels());
handle(IPC.workspaceGet, z.undefined(), () => catalogService.workspace());
handle(IPC.activityList, idSchema, (issueId) => issueService.activityFor(issueId));

handle(IPC.chatListSessions, z.object({ issueId: idSchema.optional() }).optional(), (input) => chatService.listSessions(input?.issueId));
handle(
  IPC.chatCreateSession,
  z.object({ title: z.string(), issueId: idSchema.optional(), providerId: z.enum(["claude-code", "codex", "opencode", "gemini"]) }),
  (input) => chatService.createSession(input)
);
handle(IPC.chatGetSession, idSchema, (id) => chatService.getSession(id));
handle(IPC.chatSendMessage, z.object({ sessionId: idSchema, text: z.string().min(1) }), (input) => chatService.sendMessage(input.sessionId, input.text));
handle(IPC.chatCancelRun, idSchema, (id) => chatService.cancelRun(id));
handle(IPC.chatArchiveSession, z.object({ id: idSchema, archived: z.boolean() }), (input) => chatService.archiveSession(input.id, input.archived));
handle(IPC.chatDeleteSession, idSchema, (id) => chatService.deleteSession(id));
handle(IPC.chatRenameSession, z.object({ id: idSchema, title: z.string().min(1) }), (input) => chatService.renameSession(input.id, input.title));

handle(IPC.agentsListAdapters, z.undefined(), async () => {
  const list = [];
  for (const adapter of adapters.values()) list.push(await adapter.detect());
  return list;
});

handle(IPC.appearanceGet, z.undefined(), () => ({ mode: appearanceMode, isDark: effectiveIsDark(), reducedTransparency: nativeTheme.shouldUseHighContrastColors }));
handle(IPC.appearanceSet, z.enum(["system", "light", "dark"]), (mode) => {
  appearanceMode = mode;
  preferenceService.set("appearance_mode", mode);
  for (const win of BrowserWindow.getAllWindows()) {
    win.setVibrancy(effectiveIsDark() ? "under-window" : "under-window");
    win.webContents.send(IPC.appearanceNativeChanged, { mode: appearanceMode, isDark: effectiveIsDark() });
  }
  return { mode: appearanceMode, isDark: effectiveIsDark() };
});

handle(IPC.windowOpenIssue, idSchema, (issueId) => createIssueWindow(issueId));
handle(IPC.windowOpenChat, idSchema, (sessionId) => createChatWindow(sessionId));

nativeTheme.on("updated", () => {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send(IPC.appearanceNativeChanged, { mode: appearanceMode, isDark: effectiveIsDark() });
  }
});

// ---------------------------------------------------------------------------
// App lifecycle
// ---------------------------------------------------------------------------

app.whenReady().then(() => {
  Menu.setApplicationMenu(buildMenu());
  const mainWin = createMainWindow();

  if (process.env.CAPTURE_SCREENS === "1") {
    runCaptureWorkflow(mainWin);
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

async function runCaptureWorkflow(win: BrowserWindow) {
  const screenshotsDir = path.resolve(__dirname, "..", "..", "screenshots");
  fs.mkdirSync(screenshotsDir, { recursive: true });

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  win.webContents.on("did-finish-load", async () => {
    console.log("[capture] Window did finish load. Waiting 2s for React and SQLite state...");
    await sleep(2000);

    const screens = [
      {
        name: "01-board.png",
        action: `
          const s = window.__store.getState();
          const p = s.projects.find(x => x.name.includes("Engineering")) || s.projects[0];
          if (p) s.setSelection({ kind: "project", projectId: p.id });
          s.setProjectTab("board");
          const sessId = Object.keys(s.chatSessions)[0];
          if (sessId) {
            window.__store.setState({ companionPanel: { kind: "agentChat", sessionId: sessId } });
          }
          if (window.__setChatTab) window.__setChatTab("chat");
        `,
      },
      {
        name: "02-issue.png",
        action: `
          const s = window.__store.getState();
          const issue142 = s.issues.find(i => i.identifier?.number === 142) || s.issues[0];
          s.closeCompanionPanel();
          if (issue142) s.openIssueDetail(issue142.id);
        `,
      },
      {
        name: "03-backlog.png",
        action: `
          const s = window.__store.getState();
          const p = s.projects.find(x => x.name.includes("Engineering")) || s.projects[0];
          s.closeCompanionPanel();
          if (p) s.setSelection({ kind: "project", projectId: p.id });
          s.setProjectTab("backlog");
        `,
      },
      {
        name: "04-agents.png",
        action: `
          const s = window.__store.getState();
          s.closeCompanionPanel();
          s.setSelection({ kind: "agents" });
        `,
      },
      {
        name: "05-agent-chat.png",
        action: `
          const s = window.__store.getState();
          const p = s.projects.find(x => x.name.includes("Engineering")) || s.projects[0];
          if (p) s.setSelection({ kind: "project", projectId: p.id });
          s.setProjectTab("board");
          const sessId = Object.keys(s.chatSessions)[0];
          if (sessId) {
            window.__store.setState({ companionPanel: { kind: "agentChat", sessionId: sessId } });
          }
          if (window.__setChatTab) window.__setChatTab("chat");
        `,
      },
      {
        name: "06-diff.png",
        action: `
          const s = window.__store.getState();
          const p = s.projects.find(x => x.name.includes("Engineering")) || s.projects[0];
          if (p) s.setSelection({ kind: "project", projectId: p.id });
          s.setProjectTab("board");
          const sessId = Object.keys(s.chatSessions)[0];
          if (sessId) {
            window.__store.setState({ companionPanel: { kind: "agentChat", sessionId: sessId } });
          }
          if (window.__setChatTab) window.__setChatTab("diff");
        `,
      },
      {
        name: "07-settings.png",
        action: `
          const s = window.__store.getState();
          s.closeCompanionPanel();
          s.setSelection({ kind: "settings" });
        `,
      },
      {
        name: "08-command-palette.png",
        action: `
          const s = window.__store.getState();
          const p = s.projects.find(x => x.name.includes("Engineering")) || s.projects[0];
          s.closeCompanionPanel();
          if (p) s.setSelection({ kind: "project", projectId: p.id });
          s.setProjectTab("board");
          if (window.__setPaletteOpen) window.__setPaletteOpen(true);
        `,
      },
    ];

    for (const screen of screens) {
      console.log(`[capture] Capturing ${screen.name}...`);
      await win.webContents.executeJavaScript(`(function() { ${screen.action} })()`);
      await sleep(750);
      const img = await win.webContents.capturePage();
      const filePath = path.join(screenshotsDir, screen.name);
      fs.writeFileSync(filePath, img.toPNG());
      console.log(`[capture] Saved ${filePath}`);
    }

    console.log("[capture] All 8 reference screens successfully captured!");
    app.exit(0);
  });
}

app.on("web-contents-created", (_event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://") || url.startsWith("http://")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

function buildMenu(): Menu {
  const isMac = process.platform === "darwin";
  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac ? [{ role: "appMenu" as const }] : []),
    {
      label: "File",
      submenu: [
        { label: "New Issue", accelerator: "CmdOrCtrl+N", click: () => broadcast("lyra:menu:newIssue") },
        { type: "separator" },
        isMac ? { role: "close" as const } : { role: "quit" as const },
      ],
    },
    { role: "editMenu" },
    { role: "viewMenu" },
    {
      label: "Go",
      submenu: [
        { label: "Command Palette…", accelerator: "CmdOrCtrl+K", click: () => broadcast("lyra:menu:commandPalette") },
        { label: "Toggle Agent Chat", accelerator: "CmdOrCtrl+Shift+A", click: () => broadcast("lyra:menu:toggleChat") },
      ],
    },
    { role: "windowMenu" },
  ];
  return Menu.buildFromTemplate(template);
}

function broadcast(channel: string) {
  BrowserWindow.getFocusedWindow()?.webContents.send(channel);
}
