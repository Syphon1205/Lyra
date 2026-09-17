/**
 * Shared, validated data contracts between the renderer, preload, and main
 * process. These are the TypeScript equivalents of the models that used to
 * live in `Lyra/Core/Models/*.swift` — see MIGRATION.md for the mapping.
 */

export type ID = string;

export type IssueStatus = "backlog" | "todo" | "inProgress" | "inReview" | "done" | "canceled";

export const ISSUE_STATUSES: IssueStatus[] = ["backlog", "todo", "inProgress", "inReview", "done", "canceled"];
export const BOARD_STATUSES: IssueStatus[] = ["todo", "inProgress", "inReview", "done"];

export type IssuePriority = "none" | "low" | "medium" | "high" | "urgent";
export const ISSUE_PRIORITIES: IssuePriority[] = ["none", "low", "medium", "high", "urgent"];

export type IssueType = "task" | "bug" | "story" | "epic";
export const ISSUE_TYPES: IssueType[] = ["task", "bug", "story", "epic"];

export interface IssueIdentifier {
  prefix: string;
  number: number;
}

export function formatIssueKey(id: IssueIdentifier): string {
  return `${id.prefix}-${id.number}`;
}

export interface User {
  id: ID;
  name: string;
  email: string;
  colorSeed: number;
}

export interface Team {
  id: ID;
  name: string;
  abbreviation: string;
  memberIds: ID[];
}

export interface Workspace {
  id: ID;
  name: string;
  slug: string;
}

export interface Repository {
  id: ID;
  name: string;
  localPath: string;
  currentBranch: string;
  remoteUrl?: string;
}

export interface Project {
  id: ID;
  name: string;
  summary: string;
  status: "planned" | "active" | "paused" | "completed" | "canceled";
  iconSymbol: string;
  /** Nests this project under another in the sidebar (e.g. "Engineering" under "Lyra"). */
  parentId?: ID;
  teamId?: ID;
  memberIds: ID[];
  repositoryId?: ID;
  activeCycleId?: ID;
  targetDate?: string;
  createdAt: string;
}

export interface Cycle {
  id: ID;
  name: string;
  number: number;
  projectId: ID;
  startDate: string;
  endDate: string;
}

export interface IssueLabel {
  id: ID;
  name: string;
  colorSeed: number;
}

export interface Issue {
  id: ID;
  identifier: IssueIdentifier;
  title: string;
  body: string;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  estimate?: number;
  epicName?: string;
  assigneeId?: ID;
  creatorId: ID;
  labelIds: ID[];
  projectId?: ID;
  cycleId?: ID;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  /** Board/backlog manual rank — smaller sorts first within a column/sprint. */
  rank: number;
  linkedBranch?: string;
  linkedPullRequestUrl?: string;
  commentCount: number;
}

export type ActorKind = "human" | "agent" | "system";

export interface Actor {
  kind: ActorKind;
  userId?: ID;
  agentName?: string;
}

export type ActivityKind =
  | "issueCreated"
  | "statusChanged"
  | "priorityChanged"
  | "assigneeChanged"
  | "commentAdded"
  | "commitLinked"
  | "branchCreated"
  | "pullRequestOpened"
  | "agentSessionStarted"
  | "agentSessionCompleted";

export interface ActivityEvent {
  id: ID;
  issueId: ID;
  actor: Actor;
  kind: ActivityKind;
  detail: string;
  createdAt: string;
}

export interface Comment {
  id: ID;
  issueId: ID;
  author: Actor;
  body: string;
  createdAt: string;
}

export interface ProjectComponent {
  id: ID;
  projectId: ID;
  name: string;
  description?: string;
  leadId?: ID;
  createdAt: string;
}

export interface ProjectRelease {
  id: ID;
  projectId: ID;
  version: string;
  status: "unreleased" | "released" | "archived";
  releaseDate?: string;
  description?: string;
}

export interface ProjectPage {
  id: ID;
  projectId: ID;
  title: string;
  content: string;
  updatedAt: string;
}

export interface AppNotification {
  id: ID;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface UserPreferences {
  appearanceMode: "system" | "light" | "dark";
  accentColor: string;
  density: "compact" | "default" | "comfortable";
  glassEffects: boolean;
  reduceMotion: boolean;
  increaseContrast: boolean;
  defaultWindowSize: string;
  defaultSidebarState: "Expanded" | "Collapsed";
  activeProjectId?: ID;
  activeProjectTab?: string;
}

export interface GitHubUserProfile {
  login: string;
  name: string;
  avatar_url: string;
  company?: string;
  bio?: string;
  html_url: string;
  public_repos: number;
}

export interface GitHubRepo {
  nameWithOwner: string;
  name: string;
  description: string;
  url: string;
  isPrivate: boolean;
  defaultBranchRef?: {
    name: string;
  };
}

export interface GitHubPR {
  number: number;
  title: string;
  state: string;
  url: string;
  headRefName: string;
  baseRefName: string;
}

export interface GitHubStatus {
  installed: boolean;
  path?: string;
  version?: string;
  authenticated: boolean;
  user: GitHubUserProfile | null;
  scopes?: string[];
}

export interface GitStatusResult {
  branch: string;
  clean: boolean;
  staged: string[];
  unstaged: string[];
  untracked: string[];
  ahead: number;
  behind: number;
}

export interface GitBranchResult {
  current: string;
  branches: string[];
}

export interface GitCommitResult {
  hash: string;
  author: string;
  date: string;
  message: string;
}


