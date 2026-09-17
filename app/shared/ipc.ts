/**
 * The narrow, validated IPC surface exposed to the renderer via preload.
 * Every channel name is listed here once so main and preload can't drift.
 */
export const IPC = {
  issuesList: "lyra:issues:list",
  issuesCreate: "lyra:issues:create",
  issuesUpdate: "lyra:issues:update",
  issuesMove: "lyra:issues:move",
  issuesReorder: "lyra:issues:reorder",
  issuesUndo: "lyra:issues:undo",

  projectsList: "lyra:projects:list",
  projectsToggleStar: "lyra:projects:toggleStar",
  cyclesList: "lyra:cycles:list",
  teamsList: "lyra:teams:list",
  repositoriesList: "lyra:repositories:list",
  usersList: "lyra:users:list",
  labelsList: "lyra:labels:list",
  activityList: "lyra:activity:list",
  workspaceGet: "lyra:workspace:get",

  chatListSessions: "lyra:chat:listSessions",
  chatCreateSession: "lyra:chat:createSession",
  chatGetSession: "lyra:chat:getSession",
  chatSendMessage: "lyra:chat:sendMessage",
  chatCancelRun: "lyra:chat:cancelRun",
  chatArchiveSession: "lyra:chat:archiveSession",
  chatDeleteSession: "lyra:chat:deleteSession",
  chatRenameSession: "lyra:chat:renameSession",
  chatEvent: "lyra:chat:event", // main -> renderer push

  agentsListAdapters: "lyra:agents:listAdapters",

  appearanceGet: "lyra:appearance:get",
  appearanceSet: "lyra:appearance:set",
  appearanceNativeChanged: "lyra:appearance:nativeChanged", // main -> renderer push

  issuesAddComment: "lyra:issues:addComment",

  projectsCreate: "lyra:projects:create",
  projectsUpdate: "lyra:projects:update",
  cyclesCreate: "lyra:cycles:create",
  cyclesComplete: "lyra:cycles:complete",

  componentsList: "lyra:components:list",
  componentsCreate: "lyra:components:create",
  releasesList: "lyra:releases:list",
  releasesCreate: "lyra:releases:create",
  pagesList: "lyra:pages:list",
  pagesCreate: "lyra:pages:create",
  pagesUpdate: "lyra:pages:update",
  pagesDelete: "lyra:pages:delete",
  notificationsList: "lyra:notifications:list",
  notificationsMarkRead: "lyra:notifications:markRead",

  preferencesGet: "lyra:preferences:get",
  preferencesSet: "lyra:preferences:set",

  githubStatus: "lyra:github:status",
  githubLogin: "lyra:github:login",
  githubLogout: "lyra:github:logout",
  githubListRepos: "lyra:github:listRepos",
  githubListPRs: "lyra:github:listPRs",
  githubOpenWeb: "lyra:github:openWeb",

  gitStatus: "lyra:git:status",
  gitDiff: "lyra:git:diff",
  gitApply: "lyra:git:apply",
  gitDiscard: "lyra:git:discard",
  gitBranches: "lyra:git:branches",
  gitCommits: "lyra:git:commits",
  gitCreateBranch: "lyra:git:createBranch",

  githubContributors: "lyra:github:contributors",

  systemPickDirectory: "lyra:system:pickDirectory",
  systemOpenTerminal: "lyra:system:openTerminal",
  dataDatabaseInfo: "lyra:data:databaseInfo",
  dataExport: "lyra:data:export",
  dataReset: "lyra:data:reset",
  seedSampleData: "lyra:seed:sampleData",

  windowOpenIssue: "lyra:window:openIssue",
  windowOpenChat: "lyra:window:openChat",
} as const;

export type IpcChannel = (typeof IPC)[keyof typeof IPC];
