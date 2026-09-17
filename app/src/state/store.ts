import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type {
  Issue,
  Cycle,
  User,
  IssueLabel,
  Workspace,
  ActivityEvent,
  Team,
  Repository,
  ID,
  IssueStatus,
  IssuePriority,
  IssueType,
  ProjectComponent,
  ProjectRelease,
  ProjectPage,
  AppNotification,
  GitHubStatus,
  GitHubRepo,
  GitStatusResult,
  GitBranchResult,
  GitCommitResult,
} from "@shared/types";
import type { AgentAdapterDescriptor, AgentProviderId } from "@shared/agentEvents";
import type { ChatSessionRecord, StarredProject, AppearanceState } from "../lyraApi";

export type SidebarSelection =
  | { kind: "forYou" }
  | { kind: "assigned" }
  | { kind: "created" }
  | { kind: "recent" }
  | { kind: "starred" }
  | { kind: "project"; projectId: ID }
  | { kind: "issue"; issueId: ID }
  | { kind: "filters" }
  | { kind: "teams" }
  | { kind: "agents" }
  | { kind: "runs" }
  | { kind: "settings" };

export type ProjectTab = "board" | "backlog" | "list" | "timeline" | "components" | "releases" | "pages" | "settings";

export type CompanionPanel = { kind: "none" } | { kind: "issueDetail"; issueId: ID } | { kind: "agentChat"; sessionId: ID };

export type BottomPaneTab = "diff" | "files" | "terminal" | "tests";

export interface BottomPaneState {
  isOpen: boolean;
  height: number;
  tab: BottomPaneTab;
}

interface LyraState {
  loaded: boolean;
  workspace?: Workspace;
  issues: Issue[];
  projects: StarredProject[];
  cycles: Cycle[];
  teams: Team[];
  repositories: Repository[];
  users: User[];
  labels: IssueLabel[];
  currentUserId: ID | null;
  activityByIssue: Record<ID, ActivityEvent[]>;
  adapters: AgentAdapterDescriptor[];
  chatSessions: Record<ID, ChatSessionRecord>;

  components: ProjectComponent[];
  releases: ProjectRelease[];
  pages: ProjectPage[];
  notifications: AppNotification[];
  preferences: Record<string, unknown>;
  githubStatus: GitHubStatus | null;
  githubRepos: GitHubRepo[];
  contributors: { name: string; email: string; avatarUrl?: string; username?: string }[];
  gitStatus: GitStatusResult | null;
  gitBranches: GitBranchResult | null;
  gitCommits: GitCommitResult[];
  gitDiff: string;

  sidebarWidth: number;
  companionWidth: number;
  isSidebarCollapsed: boolean;
  isCompanionWide: boolean;
  onboardingCompleted: boolean;
  bottomPane: BottomPaneState;
  activeChatOptions: {
    model?: string;
    reasoningEffort?: string;
    repoPath?: string;
    providerId?: AgentProviderId;
  };

  selection: SidebarSelection;
  projectTab: ProjectTab;
  companionPanel: CompanionPanel;
  isComposerOpen: boolean;
  isCommandPaletteOpen: boolean;
  recentIssueIds: ID[];
  searchText: string;
  assigneeFilter: ID | null;
  epicFilter: string | null;
  statusFilter: IssueStatus | null;
  typeFilter: IssueType | null;
  sprintFilter: ID | null;
  appearance: AppearanceState;
  density: "compact" | "comfortable";

  load(): Promise<void>;
  setSelection(s: SidebarSelection): void;
  setProjectTab(t: ProjectTab): void;
  setSearchText(v: string): void;
  setAssigneeFilter(v: ID | null): void;
  setEpicFilter(v: string | null): void;
  setStatusFilter(v: IssueStatus | null): void;
  setTypeFilter(v: IssueType | null): void;
  setSprintFilter(v: ID | null): void;
  clearFilters(): void;

  setSidebarWidth(width: number): void;
  setCompanionWidth(width: number): void;
  setSidebarCollapsed(collapsed: boolean): void;
  toggleSidebarCollapsed(): void;
  toggleCompanionWide(): void;
  setBottomPaneHeight(height: number): void;
  setBottomPaneTab(tab: BottomPaneTab): void;
  openBottomPane(tab?: BottomPaneTab): void;
  closeBottomPane(): void;
  toggleBottomPane(tab?: BottomPaneTab): void;
  setOnboardingCompleted(completed: boolean): Promise<void>;
  loadContributors(repoPath?: string): Promise<void>;
  setActiveChatOptions(opts: Partial<{ model?: string; reasoningEffort?: string; repoPath?: string; providerId?: AgentProviderId }>): void;
  refreshAdapters(): Promise<void>;
  resetDatabase(): Promise<void>;
  seedDemoData(user?: { name: string; email: string; avatarUrl?: string; username?: string }): Promise<void>;

  openIssueDetail(id: ID): void;
  closeCompanionPanel(): void;
  openIssueWindow(id: ID): void;

  setDensity(density: "compact" | "comfortable"): void;
  savePreference(key: string, value: unknown): Promise<void>;
  createIssue(input: {
    title: string;
    body?: string;
    type: IssueType;
    status: IssueStatus;
    priority: IssuePriority;
    assigneeId?: ID;
    projectId?: ID;
    cycleId?: ID;
  }): Promise<void>;
  updateIssue(
    id: ID,
    patch: Partial<Pick<Issue, "title" | "body" | "status" | "priority" | "assigneeId" | "cycleId" | "estimate">> & {
      labelIds?: ID[];
    }
  ): Promise<void>;
  addComment(issueId: ID, body: string): Promise<void>;
  moveIssue(id: ID, status: IssueStatus, beforeId?: ID, afterId?: ID): Promise<void>;
  reorderIssue(id: ID, beforeId?: ID, afterId?: ID): Promise<void>;
  undo(): Promise<void>;
  toggleStar(projectId: ID): Promise<void>;
  createProject(input: { name: string; key: string; description?: string; icon?: string }): Promise<void>;
  updateProject(id: ID, patch: { name?: string; description?: string; icon?: string }): Promise<void>;
  createCycle(input: { projectId: ID; number: number; name: string; startsAt: string; endsAt: string }): Promise<void>;
  completeCycle(id: ID): Promise<void>;
  loadComponents(projectId: ID): Promise<void>;
  createComponent(input: { projectId: ID; name: string; description?: string; leadId?: ID }): Promise<void>;
  loadReleases(projectId: ID): Promise<void>;
  createRelease(input: { projectId: ID; version: string; name: string; releaseDate?: string }): Promise<void>;
  loadPages(projectId: ID): Promise<void>;
  createPage(input: { projectId: ID; title: string; body?: string; parentId?: ID }): Promise<void>;
  updatePage(id: ID, patch: { title?: string; body?: string }): Promise<void>;
  deletePage(id: ID): Promise<void>;
  loadNotifications(): Promise<void>;
  markNotificationRead(id?: ID): Promise<void>;
  refreshGitHub(): Promise<void>;
  loginGitHub(): Promise<void>;
  logoutGitHub(): Promise<void>;
  refreshGit(dir?: string): Promise<void>;
  applyGitDiff(patch: string, dir?: string): Promise<{ success: boolean; error?: string }>;
  discardGit(file?: string, dir?: string): Promise<{ success: boolean; error?: string }>;
  createGitBranch(branchName: string, dir?: string): Promise<{ success: boolean; error?: string }>;
  loadActivity(issueId: ID): Promise<void>;

  openChatForIssue(issueId: ID, providerId?: AgentProviderId): Promise<void>;
  openGeneralChat(providerId?: AgentProviderId): Promise<void>;
  sendChatMessage(
    sessionId: ID,
    text: string,
    options?: { model?: string; reasoningEffort?: string; repoPath?: string; providerId?: AgentProviderId }
  ): Promise<void>;
  cancelChatRun(sessionId: ID): Promise<void>;
  refreshSession(sessionId: ID): Promise<void>;
  detachChat(sessionId: ID): void;

  setAppearance(mode: "system" | "light" | "dark"): Promise<void>;
}

export const useLyraStore = create<LyraState>((set, get) => ({
  loaded: false,
  issues: [],
  projects: [],
  cycles: [],
  teams: [],
  repositories: [],
  users: [],
  labels: [],
  currentUserId: null,
  activityByIssue: {},
  adapters: [],
  chatSessions: {},

  components: [],
  releases: [],
  pages: [],
  notifications: [],
  preferences: {},
  githubStatus: null,
  githubRepos: [],
  contributors: [],
  gitStatus: null,
  gitBranches: null,
  gitCommits: [],
  gitDiff: "",

  sidebarWidth: 240,
  companionWidth: 420,
  isSidebarCollapsed: false,
  isCompanionWide: false,
  onboardingCompleted: true,
  bottomPane: {
    isOpen: false,
    height: 300,
    tab: "diff",
  },
  activeChatOptions: {},

  selection: { kind: "project", projectId: "" },
  projectTab: "board",
  companionPanel: { kind: "none" },
  isComposerOpen: false,
  isCommandPaletteOpen: false,
  recentIssueIds: [],
  searchText: "",
  assigneeFilter: null,
  epicFilter: null,
  statusFilter: null,
  typeFilter: null,
  sprintFilter: null,
  appearance: { mode: "light", isDark: false },
  density: "comfortable",

  async load() {
    const [
      workspace,
      issues,
      projects,
      cycles,
      teams,
      repositories,
      users,
      labels,
      adapters,
      appearance,
      sessions,
      notifications,
      preferences,
      githubStatus,
      gitStatus,
      gitBranches,
      gitCommits,
      gitDiff,
      contributors,
    ] = await Promise.all([
      window.lyra.workspace.get(),
      window.lyra.issues.list(),
      window.lyra.projects.list(),
      window.lyra.cycles.list(),
      window.lyra.teams.list(),
      window.lyra.repositories.list(),
      window.lyra.users.list(),
      window.lyra.labels.list(),
      window.lyra.agents.listAdapters(),
      window.lyra.appearance.get(),
      window.lyra.chat.listSessions(),
      window.lyra.notifications.list(),
      window.lyra.preferences.get(),
      window.lyra.github.status().catch(() => null),
      window.lyra.git.status().catch(() => null),
      window.lyra.git.branches().catch(() => null),
      window.lyra.git.commits(20).catch(() => []),
      window.lyra.git.diff().catch(() => ""),
      window.lyra.github.contributors().catch(() => []),
    ]);

    let githubRepos: GitHubRepo[] = [];
    if (githubStatus?.authenticated) {
      try {
        githubRepos = await window.lyra.github.listRepos();
      } catch {
        // ignore
      }
    }

    const chatSessionsMap: Record<ID, ChatSessionRecord> = {};
    for (const s of sessions) {
      chatSessionsMap[s.id] = s;
    }
    const firstProject = projects.find((p) => !p.parentId) ?? projects[0];

    // Load initial project components, releases, pages
    let components: ProjectComponent[] = [];
    let releases: ProjectRelease[] = [];
    let pages: ProjectPage[] = [];
    if (firstProject) {
      const [comps, rels, pgs] = await Promise.all([
        window.lyra.components.list(firstProject.id).catch(() => []),
        window.lyra.releases.list(firstProject.id).catch(() => []),
        window.lyra.pages.list(firstProject.id).catch(() => []),
      ]);
      components = comps;
      releases = rels;
      pages = pgs;
    }

    // Apply stored preferences if available
    const savedDensity = preferences?.density as "compact" | "comfortable" | undefined;
    const savedAccent = preferences?.accent_color as string | undefined;
    if (savedAccent) {
      document.documentElement.style.setProperty("--lyra-accent-solid", savedAccent);
      document.documentElement.style.setProperty("--lyra-accent", savedAccent);
    }

    const savedSidebarWidth = Number(preferences?.sidebar_width) || 240;
    const savedCompanionWidth = Number(preferences?.companion_width) || 420;
    const savedSidebarCollapsed = preferences?.sidebar_collapsed === "true" || preferences?.sidebar_collapsed === true;
    const savedBottomPaneHeight = Number(preferences?.bottom_pane_height) || 300;
    const savedBottomPaneOpen = preferences?.bottom_pane_open === "true" || preferences?.bottom_pane_open === true;
    const savedBottomPaneTab = (preferences?.bottom_pane_tab as BottomPaneTab) || "diff";
    const savedOnboardingCompleted =
      preferences?.onboarding_completed !== undefined
        ? preferences.onboarding_completed === "true" || preferences.onboarding_completed === true
        : issues.length > 0;

    set({
      loaded: true,
      workspace,
      issues,
      projects,
      cycles,
      teams,
      repositories,
      users,
      labels,
      currentUserId: users[0]?.id ?? null,
      adapters,
      appearance,
      chatSessions: chatSessionsMap,
      components,
      releases,
      pages,
      notifications,
      preferences: preferences ?? {},
      githubStatus,
      githubRepos,
      contributors,
      gitStatus,
      gitBranches,
      gitCommits,
      gitDiff,
      sidebarWidth: Math.min(Math.max(savedSidebarWidth, 180), 480),
      companionWidth: Math.min(Math.max(savedCompanionWidth, 320), 760),
      isSidebarCollapsed: savedSidebarCollapsed,
      bottomPane: {
        isOpen: savedBottomPaneOpen,
        height: Math.min(Math.max(savedBottomPaneHeight, 160), 600),
        tab: savedBottomPaneTab,
      },
      onboardingCompleted: savedOnboardingCompleted,
      density: savedDensity ?? "comfortable",
      selection: firstProject ? { kind: "project", projectId: firstProject.id } : { kind: "forYou" },
    });

    window.lyra.appearance.onChange((state) => set({ appearance: state }));
    window.lyra.chat.onEvent((sessionId) => {
      get().refreshSession(sessionId);
    });
  },

  setSelection: (s) => set({ selection: s }),
  setProjectTab: (t) => set({ projectTab: t }),
  setSearchText: (v) => set({ searchText: v }),
  setAssigneeFilter: (v) => set({ assigneeFilter: v }),
  setEpicFilter: (v) => set({ epicFilter: v }),
  setStatusFilter: (v) => set({ statusFilter: v }),
  setTypeFilter: (v) => set({ typeFilter: v }),
  setSprintFilter: (v) => set({ sprintFilter: v }),
  clearFilters: () => set({ searchText: "", assigneeFilter: null, epicFilter: null, statusFilter: null, typeFilter: null, sprintFilter: null }),
  setDensity: (density) => set({ density }),

  setSidebarWidth: (width) => {
    set({ sidebarWidth: width });
    void get().savePreference("sidebar_width", width);
  },
  setCompanionWidth: (width) => {
    set({ companionWidth: width });
    void get().savePreference("companion_width", width);
  },
  setSidebarCollapsed: (collapsed) => {
    set({ isSidebarCollapsed: collapsed });
    void get().savePreference("sidebar_collapsed", collapsed);
  },
  toggleSidebarCollapsed: () => {
    const next = !get().isSidebarCollapsed;
    set({ isSidebarCollapsed: next });
    void get().savePreference("sidebar_collapsed", next);
  },
  toggleCompanionWide: () => set((s) => ({ isCompanionWide: !s.isCompanionWide })),
  setBottomPaneHeight: (height) => {
    set((s) => ({ bottomPane: { ...s.bottomPane, height } }));
    void get().savePreference("bottom_pane_height", height);
  },
  setBottomPaneTab: (tab) => {
    set((s) => ({ bottomPane: { ...s.bottomPane, tab } }));
    void get().savePreference("bottom_pane_tab", tab);
  },
  openBottomPane: (tab) => {
    set((s) => ({
      bottomPane: {
        ...s.bottomPane,
        isOpen: true,
        tab: tab ?? s.bottomPane.tab,
      },
    }));
    void get().savePreference("bottom_pane_open", true);
    if (tab) void get().savePreference("bottom_pane_tab", tab);
  },
  closeBottomPane: () => {
    set((s) => ({ bottomPane: { ...s.bottomPane, isOpen: false } }));
    void get().savePreference("bottom_pane_open", false);
  },
  toggleBottomPane: (tab) => {
    const current = get().bottomPane;
    if (current.isOpen && (!tab || current.tab === tab)) {
      get().closeBottomPane();
    } else {
      get().openBottomPane(tab);
    }
  },
  setOnboardingCompleted: async (completed) => {
    set({ onboardingCompleted: completed });
    await get().savePreference("onboarding_completed", completed);
  },
  loadContributors: async (repoPath) => {
    const contribs = await window.lyra.github.contributors(repoPath).catch(() => []);
    set({ contributors: contribs });
  },
  setActiveChatOptions: (opts) => set((s) => ({ activeChatOptions: { ...s.activeChatOptions, ...opts } })),
  refreshAdapters: async () => {
    const adapters = await window.lyra.agents.listAdapters();
    set({ adapters });
  },
  resetDatabase: async () => {
    await window.lyra.data.reset();
    await get().load();
  },
  seedDemoData: async (user) => {
    await window.lyra.data.seedSampleData(user);
    await get().load();
  },

  openIssueDetail: (id) => {
    set((s) => ({
      selection: { kind: "issue", issueId: id },
      companionPanel: s.companionPanel.kind === "issueDetail" ? { kind: "none" } : s.companionPanel,
      recentIssueIds: [id, ...s.recentIssueIds.filter((x) => x !== id)].slice(0, 10),
    }));
    get().loadActivity(id);
  },
  closeCompanionPanel: () => set({ companionPanel: { kind: "none" } }),
  openIssueWindow: (id) => {
    void window.lyra.window.openIssue(id);
  },

  async createIssue(input) {
    const creatorId = get().currentUserId;
    if (!creatorId) return;
    const issue = await window.lyra.issues.create({ ...input, creatorId });
    set((s) => ({ issues: [issue, ...s.issues] }));
    get().openIssueDetail(issue.id);
  },

  async updateIssue(id, patch) {
    const updated = await window.lyra.issues.update(id, patch);
    set((s) => ({ issues: s.issues.map((i) => (i.id === id ? updated : i)) }));
  },

  async moveIssue(id, status, beforeId, afterId) {
    const previous = get().issues;
    // Optimistic update so drag/drop feels instant; on failure we restore.
    set((s) => ({ issues: s.issues.map((i) => (i.id === id ? { ...i, status } : i)) }));
    try {
      const updated = await window.lyra.issues.move(id, status, beforeId, afterId);
      set((s) => ({ issues: s.issues.map((i) => (i.id === id ? updated : i)) }));
    } catch (err) {
      set({ issues: previous });
      console.error("Failed to move issue", err);
    }
  },

  async reorderIssue(id, beforeId, afterId) {
    const updated = await window.lyra.issues.reorder(id, beforeId, afterId);
    set((s) => ({ issues: s.issues.map((i) => (i.id === id ? updated : i)) }));
  },

  async undo() {
    const restored = await window.lyra.issues.undo();
    if (!restored) return;
    set((s) => ({ issues: s.issues.map((i) => (i.id === restored.id ? restored : i)) }));
  },

  async toggleStar(projectId) {
    const starred = await window.lyra.projects.toggleStar(projectId);
    set((s) => ({ projects: s.projects.map((p) => (p.id === projectId ? { ...p, starred } : p)) }));
  },

  async loadActivity(issueId) {
    const events = await window.lyra.activity.list(issueId);
    set((s) => ({ activityByIssue: { ...s.activityByIssue, [issueId]: events } }));
  },

  async openChatForIssue(issueId, providerId = "claude-code") {
    const existing = (await window.lyra.chat.listSessions(issueId))[0];
    const session = existing ?? (await window.lyra.chat.createSession({ title: "Chat", issueId, providerId }));
    set((s) => ({ chatSessions: { ...s.chatSessions, [session.id]: session }, companionPanel: { kind: "agentChat", sessionId: session.id } }));
  },

  async openGeneralChat(providerId = "claude-code") {
    const session = await window.lyra.chat.createSession({ title: "New conversation", providerId });
    set((s) => ({ chatSessions: { ...s.chatSessions, [session.id]: session }, companionPanel: { kind: "agentChat", sessionId: session.id } }));
  },

  async sendChatMessage(sessionId, text, options) {
    const opts = options ?? get().activeChatOptions;
    await window.lyra.chat.sendMessage(sessionId, text, opts);
    await get().refreshSession(sessionId);
  },

  async cancelChatRun(sessionId) {
    await window.lyra.chat.cancelRun(sessionId);
    await get().refreshSession(sessionId);
  },

  async refreshSession(sessionId) {
    const session = await window.lyra.chat.getSession(sessionId);
    if (!session) return;
    set((s) => ({ chatSessions: { ...s.chatSessions, [sessionId]: session } }));
  },

  detachChat: (sessionId) => {
    void window.lyra.window.openChat(sessionId);
  },

  async savePreference(key, value) {
    set((s) => ({ preferences: { ...s.preferences, [key]: value } }));
    await window.lyra.preferences.set({ [key]: value });
  },

  async addComment(issueId, body) {
    const authorId = get().currentUserId;
    if (!authorId) return;
    const event = await window.lyra.issues.addComment(issueId, authorId, body);
    set((s) => {
      const existing = s.activityByIssue[issueId] ?? [];
      return {
        activityByIssue: { ...s.activityByIssue, [issueId]: [event, ...existing] },
        issues: s.issues.map((i) =>
          i.id === issueId ? { ...i, commentCount: (i.commentCount ?? 0) + 1 } : i
        ),
      };
    });
  },

  async createProject(input) {
    const p = await window.lyra.projects.create(input);
    set((s) => ({ projects: [...s.projects, { ...p, starred: false }] }));
  },

  async updateProject(id, patch) {
    const updated = await window.lyra.projects.update(id, patch);
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...updated } : p)),
    }));
  },

  async createCycle(input) {
    const cycle = await window.lyra.cycles.create(input);
    set((s) => ({ cycles: [...s.cycles, cycle] }));
  },

  async completeCycle(id) {
    const completed = await window.lyra.cycles.complete(id);
    set((s) => ({
      cycles: s.cycles.map((c) => (c.id === id ? completed : c)),
    }));
  },

  async loadComponents(projectId) {
    const components = await window.lyra.components.list(projectId);
    set({ components });
  },

  async createComponent(input) {
    const comp = await window.lyra.components.create(input);
    set((s) => ({ components: [...s.components, comp] }));
  },

  async loadReleases(projectId) {
    const releases = await window.lyra.releases.list(projectId);
    set({ releases });
  },

  async createRelease(input) {
    const rel = await window.lyra.releases.create(input);
    set((s) => ({ releases: [...s.releases, rel] }));
  },

  async loadPages(projectId) {
    const pages = await window.lyra.pages.list(projectId);
    set({ pages });
  },

  async createPage(input) {
    const page = await window.lyra.pages.create(input);
    set((s) => ({ pages: [...s.pages, page] }));
  },

  async updatePage(id, patch) {
    const updated = await window.lyra.pages.update(id, patch);
    set((s) => ({
      pages: s.pages.map((p) => (p.id === id ? updated : p)),
    }));
  },

  async deletePage(id) {
    await window.lyra.pages.delete(id);
    set((s) => ({ pages: s.pages.filter((p) => p.id !== id) }));
  },

  async loadNotifications() {
    const notifications = await window.lyra.notifications.list();
    set({ notifications });
  },

  async markNotificationRead(id) {
    await window.lyra.notifications.markRead(id);
    set((s) => ({
      notifications: s.notifications.map((n) => (!id || n.id === id ? { ...n, read: true } : n)),
    }));
  },

  async refreshGitHub() {
    const status = await window.lyra.github.status();
    let repos: GitHubRepo[] = [];
    if (status.authenticated) {
      try {
        repos = await window.lyra.github.listRepos();
      } catch {
        // ignore
      }
    }
    set({ githubStatus: status, githubRepos: repos });
  },

  async loginGitHub() {
    await window.lyra.github.login();
    await get().refreshGitHub();
  },

  async logoutGitHub() {
    await window.lyra.github.logout();
    await get().refreshGitHub();
  },

  async refreshGit(dir) {
    const [status, branches, commits, diff] = await Promise.all([
      window.lyra.git.status(dir).catch(() => null),
      window.lyra.git.branches(dir).catch(() => null),
      window.lyra.git.commits(20, dir).catch(() => []),
      window.lyra.git.diff(dir).catch(() => ""),
    ]);
    set({ gitStatus: status, gitBranches: branches, gitCommits: commits, gitDiff: diff });
  },

  async applyGitDiff(patch, dir) {
    const res = await window.lyra.git.apply(patch, dir);
    if (res.success) await get().refreshGit(dir);
    return res;
  },

  async discardGit(file, dir) {
    const res = await window.lyra.git.discard(file, dir);
    if (res.success) await get().refreshGit(dir);
    return res;
  },

  async createGitBranch(branchName, dir) {
    const res = await window.lyra.git.createBranch(branchName, dir);
    if (res.success) await get().refreshGit(dir);
    return res;
  },

  async setAppearance(mode) {
    const state = await window.lyra.appearance.set(mode);
    set({ appearance: state });
  },
}));

/** Convenience selector bundling all active board/backlog/list filters. */
export function useActiveFilters() {
  return useLyraStore(
    useShallow((s) => ({
      searchText: s.searchText,
      assigneeFilter: s.assigneeFilter,
      epicFilter: s.epicFilter,
      statusFilter: s.statusFilter,
      typeFilter: s.typeFilter,
      sprintFilter: s.sprintFilter,
    }))
  );
}

export function applyFilters(
  issues: Issue[],
  state: Pick<LyraState, "searchText" | "assigneeFilter" | "epicFilter" | "statusFilter" | "typeFilter" | "sprintFilter">
): Issue[] {
  return issues.filter((issue) => {
    if (state.assigneeFilter && issue.assigneeId !== state.assigneeFilter) return false;
    if (state.epicFilter && issue.epicName !== state.epicFilter) return false;
    if (state.statusFilter && issue.status !== state.statusFilter) return false;
    if (state.typeFilter && issue.type !== state.typeFilter) return false;
    if (state.sprintFilter && issue.cycleId !== state.sprintFilter) return false;
    if (state.searchText) {
      const q = state.searchText.toLowerCase();
      const key = `${issue.identifier.prefix}-${issue.identifier.number}`.toLowerCase();
      if (!issue.title.toLowerCase().includes(q) && !key.includes(q)) return false;
    }
    return true;
  });
}
