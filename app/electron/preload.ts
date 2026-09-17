import { contextBridge, ipcRenderer } from "electron";
import { IPC } from "../shared/ipc.js";
import type { AgentRunEvent } from "../shared/agentEvents.js";

/**
 * The entire desktop surface available to the renderer. Nothing else of
 * Node/Electron is reachable from web content — no raw ipcRenderer, no
 * filesystem, no shell.
 */
const lyra = {
  issues: {
    list: () => ipcRenderer.invoke(IPC.issuesList),
    create: (input: unknown) => ipcRenderer.invoke(IPC.issuesCreate, input),
    update: (id: string, patch: unknown) => ipcRenderer.invoke(IPC.issuesUpdate, { id, patch }),
    addComment: (issueId: string, authorId: string, body: string) =>
      ipcRenderer.invoke(IPC.issuesAddComment, { issueId, authorId, body }),
    move: (id: string, status: string, beforeId?: string, afterId?: string) =>
      ipcRenderer.invoke(IPC.issuesMove, { id, status, beforeId, afterId }),
    reorder: (id: string, beforeId?: string, afterId?: string) => ipcRenderer.invoke(IPC.issuesReorder, { id, beforeId, afterId }),
    undo: () => ipcRenderer.invoke(IPC.issuesUndo),
  },
  projects: {
    list: () => ipcRenderer.invoke(IPC.projectsList),
    toggleStar: (id: string) => ipcRenderer.invoke(IPC.projectsToggleStar, id),
    create: (input: unknown) => ipcRenderer.invoke(IPC.projectsCreate, input),
    update: (id: string, patch: unknown) => ipcRenderer.invoke(IPC.projectsUpdate, { id, patch }),
  },
  cycles: {
    list: () => ipcRenderer.invoke(IPC.cyclesList),
    create: (input: unknown) => ipcRenderer.invoke(IPC.cyclesCreate, input),
    complete: (id: string) => ipcRenderer.invoke(IPC.cyclesComplete, id),
  },
  components: {
    list: (projectId: string) => ipcRenderer.invoke(IPC.componentsList, projectId),
    create: (input: unknown) => ipcRenderer.invoke(IPC.componentsCreate, input),
  },
  releases: {
    list: (projectId: string) => ipcRenderer.invoke(IPC.releasesList, projectId),
    create: (input: unknown) => ipcRenderer.invoke(IPC.releasesCreate, input),
  },
  pages: {
    list: (projectId: string) => ipcRenderer.invoke(IPC.pagesList, projectId),
    create: (input: unknown) => ipcRenderer.invoke(IPC.pagesCreate, input),
    update: (id: string, patch: unknown) => ipcRenderer.invoke(IPC.pagesUpdate, { id, patch }),
    delete: (id: string) => ipcRenderer.invoke(IPC.pagesDelete, id),
  },
  notifications: {
    list: () => ipcRenderer.invoke(IPC.notificationsList),
    markRead: (id?: string) => ipcRenderer.invoke(IPC.notificationsMarkRead, id),
  },
  preferences: {
    get: () => ipcRenderer.invoke(IPC.preferencesGet),
    set: (prefs: Record<string, unknown>) => ipcRenderer.invoke(IPC.preferencesSet, prefs),
  },
  github: {
    status: () => ipcRenderer.invoke(IPC.githubStatus),
    login: () => ipcRenderer.invoke(IPC.githubLogin),
    logout: () => ipcRenderer.invoke(IPC.githubLogout),
    listRepos: () => ipcRenderer.invoke(IPC.githubListRepos),
    listPRs: (repo?: string) => ipcRenderer.invoke(IPC.githubListPRs, repo ? { repo } : undefined),
    contributors: (localRepoPath?: string) => ipcRenderer.invoke(IPC.githubContributors, localRepoPath ? { localRepoPath } : undefined),
    openWeb: (url: string) => ipcRenderer.invoke(IPC.githubOpenWeb, url),
  },
  system: {
    pickDirectory: () => ipcRenderer.invoke(IPC.systemPickDirectory),
    openTerminal: (dir?: string) => ipcRenderer.invoke(IPC.systemOpenTerminal, dir),
  },
  data: {
    databaseInfo: () => ipcRenderer.invoke(IPC.dataDatabaseInfo),
    export: () => ipcRenderer.invoke(IPC.dataExport),
    reset: () => ipcRenderer.invoke(IPC.dataReset),
    seedSampleData: (user?: { name: string; email: string; avatarUrl?: string; username?: string }) =>
      ipcRenderer.invoke(IPC.seedSampleData, user),
  },
  git: {
    status: (dir?: string) => ipcRenderer.invoke(IPC.gitStatus, dir),
    diff: (dir?: string) => ipcRenderer.invoke(IPC.gitDiff, dir),
    apply: (patch: string, dir?: string) => ipcRenderer.invoke(IPC.gitApply, { patch, dir }),
    discard: (file?: string, dir?: string) => ipcRenderer.invoke(IPC.gitDiscard, { file, dir }),
    branches: (dir?: string) => ipcRenderer.invoke(IPC.gitBranches, dir),
    commits: (limit?: number, dir?: string) => ipcRenderer.invoke(IPC.gitCommits, { limit, dir }),
    createBranch: (branchName: string, dir?: string) => ipcRenderer.invoke(IPC.gitCreateBranch, { branchName, dir }),
  },
  teams: {
    list: () => ipcRenderer.invoke(IPC.teamsList),
  },
  repositories: {
    list: () => ipcRenderer.invoke(IPC.repositoriesList),
  },
  users: {
    list: () => ipcRenderer.invoke(IPC.usersList),
  },
  labels: {
    list: () => ipcRenderer.invoke(IPC.labelsList),
  },
  workspace: {
    get: () => ipcRenderer.invoke(IPC.workspaceGet),
  },
  activity: {
    list: (issueId: string) => ipcRenderer.invoke(IPC.activityList, issueId),
  },
  chat: {
    listSessions: (issueId?: string) => ipcRenderer.invoke(IPC.chatListSessions, issueId ? { issueId } : undefined),
    createSession: (input: unknown) => ipcRenderer.invoke(IPC.chatCreateSession, input),
    getSession: (id: string) => ipcRenderer.invoke(IPC.chatGetSession, id),
    sendMessage: (
      sessionId: string,
      text: string,
      options?: { model?: string; reasoningEffort?: string; repoPath?: string; providerId?: string }
    ) => ipcRenderer.invoke(IPC.chatSendMessage, { sessionId, text, options }),
    cancelRun: (sessionId: string) => ipcRenderer.invoke(IPC.chatCancelRun, sessionId),
    archiveSession: (id: string, archived: boolean) => ipcRenderer.invoke(IPC.chatArchiveSession, { id, archived }),
    deleteSession: (id: string) => ipcRenderer.invoke(IPC.chatDeleteSession, id),
    renameSession: (id: string, title: string) => ipcRenderer.invoke(IPC.chatRenameSession, { id, title }),
    onEvent: (cb: (sessionId: string, event: AgentRunEvent) => void) => {
      const listener = (_: Electron.IpcRendererEvent, sessionId: string, event: AgentRunEvent) => cb(sessionId, event);
      ipcRenderer.on(IPC.chatEvent, listener);
      return () => ipcRenderer.removeListener(IPC.chatEvent, listener);
    },
  },
  agents: {
    listAdapters: () => ipcRenderer.invoke(IPC.agentsListAdapters),
  },
  appearance: {
    get: () => ipcRenderer.invoke(IPC.appearanceGet),
    set: (mode: "system" | "light" | "dark") => ipcRenderer.invoke(IPC.appearanceSet, mode),
    onChange: (cb: (state: { mode: string; isDark: boolean }) => void) => {
      const listener = (_: Electron.IpcRendererEvent, state: { mode: string; isDark: boolean }) => cb(state);
      ipcRenderer.on(IPC.appearanceNativeChanged, listener);
      return () => ipcRenderer.removeListener(IPC.appearanceNativeChanged, listener);
    },
  },
  window: {
    openIssue: (issueId: string) => ipcRenderer.invoke(IPC.windowOpenIssue, issueId),
    openChat: (sessionId: string) => ipcRenderer.invoke(IPC.windowOpenChat, sessionId),
  },
  menu: {
    onNewIssue: (cb: () => void) => {
      ipcRenderer.on("lyra:menu:newIssue", cb);
      return () => ipcRenderer.removeListener("lyra:menu:newIssue", cb);
    },
    onCommandPalette: (cb: () => void) => {
      ipcRenderer.on("lyra:menu:commandPalette", cb);
      return () => ipcRenderer.removeListener("lyra:menu:commandPalette", cb);
    },
    onToggleChat: (cb: () => void) => {
      ipcRenderer.on("lyra:menu:toggleChat", cb);
      return () => ipcRenderer.removeListener("lyra:menu:toggleChat", cb);
    },
    onToggleSidebar: (cb: () => void) => {
      ipcRenderer.on("lyra:menu:toggleSidebar", cb);
      return () => ipcRenderer.removeListener("lyra:menu:toggleSidebar", cb);
    },
    onToggleBottomPane: (cb: () => void) => {
      ipcRenderer.on("lyra:menu:toggleBottomPane", cb);
      return () => ipcRenderer.removeListener("lyra:menu:toggleBottomPane", cb);
    },
  },
};

contextBridge.exposeInMainWorld("lyra", lyra);

export type LyraApi = typeof lyra;
