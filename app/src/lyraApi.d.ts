import type {
  Issue,
  Project,
  Cycle,
  User,
  IssueLabel,
  Workspace,
  ActivityEvent,
  Team,
  Repository,
  ID,
  ProjectComponent,
  ProjectRelease,
  ProjectPage,
  AppNotification,
  UserPreferences,
  GitHubStatus,
  GitHubRepo,
  GitHubPR,
  GitStatusResult,
  GitBranchResult,
  GitCommitResult,
} from "@shared/types";
import type { AgentRunEvent, AgentAdapterDescriptor, AgentProviderId } from "@shared/agentEvents";

export interface ChatMessageRecord {
  id: string;
  sessionId: string;
  role: "user" | "agent" | "system";
  text: string;
  createdAt: string;
  activity?: { label: string; detail?: string; succeeded: boolean };
  files?: { path: string; additions: number; deletions: number }[];
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

export interface StarredProject extends Project {
  starred: boolean;
}

export interface AppearanceState {
  mode: "system" | "light" | "dark";
  isDark: boolean;
  reducedTransparency?: boolean;
}

export interface LyraApi {
  issues: {
    list(): Promise<Issue[]>;
    create(input: {
      title: string;
      body?: string;
      type: Issue["type"];
      status: Issue["status"];
      priority: Issue["priority"];
      assigneeId?: ID;
      projectId?: ID;
      cycleId?: ID;
      creatorId: ID;
    }): Promise<Issue>;
    update(
      id: ID,
      patch: Partial<Pick<Issue, "title" | "body" | "status" | "priority" | "assigneeId" | "cycleId" | "estimate">> & {
        labelIds?: ID[];
      }
    ): Promise<Issue>;
    addComment(issueId: ID, authorId: ID, body: string): Promise<ActivityEvent>;
    move(id: ID, status: Issue["status"], beforeId?: ID, afterId?: ID): Promise<Issue>;
    reorder(id: ID, beforeId?: ID, afterId?: ID): Promise<Issue>;
    undo(): Promise<Issue | null>;
  };
  projects: {
    list(): Promise<StarredProject[]>;
    toggleStar(id: ID): Promise<boolean>;
    create(input: {
      name: string;
      key: string;
      description?: string;
      icon?: string;
      leadId?: ID;
    }): Promise<Project>;
    update(id: ID, patch: { name?: string; description?: string; icon?: string }): Promise<Project>;
  };
  cycles: {
    list(): Promise<Cycle[]>;
    create(input: {
      projectId: ID;
      number: number;
      name: string;
      startsAt: string;
      endsAt: string;
    }): Promise<Cycle>;
    complete(id: ID): Promise<Cycle>;
  };
  components: {
    list(projectId: ID): Promise<ProjectComponent[]>;
    create(input: {
      projectId: ID;
      name: string;
      description?: string;
      leadId?: ID;
    }): Promise<ProjectComponent>;
  };
  releases: {
    list(projectId: ID): Promise<ProjectRelease[]>;
    create(input: {
      projectId: ID;
      version: string;
      name: string;
      releaseDate?: string;
    }): Promise<ProjectRelease>;
  };
  pages: {
    list(projectId: ID): Promise<ProjectPage[]>;
    create(input: {
      projectId: ID;
      title: string;
      body?: string;
      parentId?: ID;
    }): Promise<ProjectPage>;
    update(id: ID, patch: { title?: string; body?: string }): Promise<ProjectPage>;
    delete(id: ID): Promise<void>;
  };
  notifications: {
    list(): Promise<AppNotification[]>;
    markRead(id?: ID): Promise<void>;
  };
  preferences: {
    get(): Promise<Record<string, unknown>>;
    set(prefs: Record<string, unknown>): Promise<void>;
  };
  github: {
    status(): Promise<GitHubStatus>;
    login(): Promise<{ success: boolean; error?: string }>;
    logout(): Promise<{ success: boolean; error?: string }>;
    listRepos(): Promise<GitHubRepo[]>;
    listPRs(repo?: string): Promise<GitHubPR[]>;
    openWeb(url: string): Promise<void>;
  };
  git: {
    status(dir?: string): Promise<GitStatusResult>;
    diff(dir?: string): Promise<string>;
    apply(patch: string, dir?: string): Promise<{ success: boolean; error?: string }>;
    discard(file?: string, dir?: string): Promise<{ success: boolean; error?: string }>;
    branches(dir?: string): Promise<GitBranchResult>;
    commits(limit?: number, dir?: string): Promise<GitCommitResult[]>;
    createBranch(branchName: string, dir?: string): Promise<{ success: boolean; error?: string }>;
  };
  teams: { list(): Promise<Team[]> };
  repositories: { list(): Promise<Repository[]> };
  users: { list(): Promise<User[]> };
  labels: { list(): Promise<IssueLabel[]> };
  workspace: { get(): Promise<Workspace> };
  activity: { list(issueId: ID): Promise<ActivityEvent[]> };
  chat: {
    listSessions(issueId?: ID): Promise<ChatSessionRecord[]>;
    createSession(input: { title: string; issueId?: ID; providerId: AgentProviderId }): Promise<ChatSessionRecord>;
    getSession(id: ID): Promise<ChatSessionRecord | undefined>;
    sendMessage(sessionId: ID, text: string): Promise<ChatMessageRecord>;
    cancelRun(sessionId: ID): Promise<void>;
    archiveSession(id: ID, archived: boolean): Promise<void>;
    deleteSession(id: ID): Promise<void>;
    renameSession(id: ID, title: string): Promise<void>;
    onEvent(cb: (sessionId: ID, event: AgentRunEvent) => void): () => void;
  };
  agents: { listAdapters(): Promise<AgentAdapterDescriptor[]> };
  appearance: {
    get(): Promise<AppearanceState>;
    set(mode: "system" | "light" | "dark"): Promise<AppearanceState>;
    onChange(cb: (state: AppearanceState) => void): () => void;
  };
  window: {
    openIssue(issueId: ID): Promise<void>;
    openChat(sessionId: ID): Promise<void>;
  };
  menu: {
    onNewIssue(cb: () => void): () => void;
    onCommandPalette(cb: () => void): () => void;
    onToggleChat(cb: () => void): () => void;
  };
}

declare global {
  interface Window {
    lyra: LyraApi;
  }
}
