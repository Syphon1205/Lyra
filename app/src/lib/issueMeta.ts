import type { IssuePriority, IssueStatus, IssueType } from "@shared/types";

export const TYPE_ICON: Record<IssueType, "bug" | "story" | "task" | "epic"> = {
  bug: "bug",
  story: "story",
  task: "task",
  epic: "epic",
};

export const TYPE_LABEL: Record<IssueType, string> = {
  task: "Task",
  bug: "Bug",
  story: "Story",
  epic: "Epic",
};

export const PRIORITY_COLOR: Record<IssuePriority, string> = {
  none: "var(--lyra-text-faint)",
  low: "#4c9aff",
  medium: "#e2b203",
  high: "#e56910",
  urgent: "var(--lyra-danger)",
};

export const PRIORITY_LABEL: Record<IssuePriority, string> = {
  none: "No priority",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const STATUS_LABEL: Record<IssueStatus, string> = {
  backlog: "Backlog",
  todo: "To Do",
  inProgress: "In Progress",
  inReview: "In Review",
  done: "Done",
  canceled: "Canceled",
};

export const STATUS_COLOR: Record<IssueStatus, string> = {
  backlog: "var(--lyra-text-faint)",
  todo: "var(--lyra-text-muted)",
  inProgress: "var(--lyra-accent-solid)",
  inReview: "#e2b203",
  done: "var(--lyra-success)",
  canceled: "var(--lyra-text-faint)",
};

export const ISSUE_STATUSES_ORDERED: IssueStatus[] = ["backlog", "todo", "inProgress", "inReview", "done", "canceled"];

export function issueKey(issue: { identifier: { prefix: string; number: number } }): string {
  return `${issue.identifier.prefix}-${issue.identifier.number}`;
}
