import { LyraIcon, type IconName } from "../icons/LyraIcon";

const roleToIcon: Record<string, IconName> = {
  // Navigation & Core
  inbox: "inbox",
  recent: "history",
  starred: "star",
  starFilled: "star-filled",
  board: "projects",
  filters: "filters",
  agents: "agent",
  runs: "run",
  settings: "settings",
  search: "search",
  commandK: "command-k",
  teams: "teams",
  myIssues: "my-issues",
  assigned: "assigned",
  created: "created",

  // Actions & Controls
  newIssue: "plus",
  newChat: "new-chat",
  toggleSidebar: "sidebar",
  toggleSidebarRight: "sidebar",
  chevronDown: "chevron-down",
  chevronRight: "chevron-right",
  chevronUp: "chevron-up",
  close: "close",
  more: "overflow",
  attach: "attachment",
  send: "send",
  mic: "mic",
  stop: "stop",
  detach: "detach",
  share: "share",
  check: "check",
  notification: "notification",

  // Issue Metadata
  bug: "type-bug",
  story: "type-story",
  task: "type-task",
  epic: "type-epic",
  branch: "branch",
  commit: "commit",
  pullRequest: "pull-request",
  diff: "diff",
  terminal: "terminal",
  tests: "tests",
  worktree: "worktree",
  comment: "comment",
  archive: "document",
  trash: "close",
  rename: "document",
  history: "history",

  // Priorities
  priorityUrgent: "priority-urgent",
  priorityHigh: "priority-high",
  priorityMedium: "priority-medium",
  priorityLow: "priority-low",
  priorityNone: "priority-none",

  // Providers
  codex: "provider-codex",
  astra: "provider-astra",
  claude: "provider-claude",
  gemini: "provider-gemini",
  opencode: "provider-opencode",
};

export function AppIcon({
  name,
  size = 16,
  className,
  style,
}: {
  name: keyof typeof roleToIcon | string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const iconName = roleToIcon[name] ?? (name as IconName);
  return <LyraIcon name={iconName} size={size} className={className} style={style} />;
}
