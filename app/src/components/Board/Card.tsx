import { useEffect, useRef, useState } from "react";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import * as ContextMenu from "@radix-ui/react-context-menu";
import type { Issue, IssuePriority } from "@shared/types";
import { useLyraStore } from "../../state/store";
import { LyraIcon, type IconName } from "../../icons/LyraIcon";
import { Avatar } from "../Avatar";
import { PRIORITY_COLOR, TYPE_ICON } from "../../lib/issueMeta";
import styles from "./Board.module.css";

type Edge = "before" | "after" | null;

function priorityIcon(priority: IssuePriority): IconName {
  switch (priority) {
    case "urgent":
      return "priority-urgent";
    case "high":
      return "priority-high";
    case "medium":
      return "priority-medium";
    case "low":
      return "priority-low";
    default:
      return "priority-none";
  }
}

const PRIORITY_LABELS: Record<IssuePriority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
  none: "None",
};

const LABEL_COLORS: Record<string, { bg: string; text: string }> = {
  Design: { bg: "#EEF2FF", text: "#4338CA" },
  macOS: { bg: "#F1F5F9", text: "#334155" },
  Agent: { bg: "#FDF4FF", text: "#A21CAF" },
  Git: { bg: "#FFF7ED", text: "#C2410C" },
  Frontend: { bg: "#EFF6FF", text: "#1D4ED8" },
  Board: { bg: "#F0FDF4", text: "#15803D" },
  Backend: { bg: "#F8FAFC", text: "#475569" },
  Auth: { bg: "#FEF2F2", text: "#B91C1C" },
  Productivity: { bg: "#FAF5FF", text: "#7E22CE" },
  Data: { bg: "#ECFDF5", text: "#047857" },
  Sync: { bg: "#F0FDF4", text: "#166534" },
  Integrations: { bg: "#FFFBEB", text: "#B45309" },
  Navigation: { bg: "#EFF6FF", text: "#2563EB" },
  UX: { bg: "#F5F3FF", text: "#6D28D9" },
  Polish: { bg: "#FDF2F8", text: "#BE185D" },
  Native: { bg: "#F1F5F9", text: "#1E293B" },
  Docs: { bg: "#F3F4F6", text: "#374151" },
  Settings: { bg: "#F8FAFC", text: "#334155" },
  Core: { bg: "#FEF3C7", text: "#92400E" },
  Setup: { bg: "#F1F5F9", text: "#475569" },
};

export function Card({ issue }: { issue: Issue }) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [edge, setEdge] = useState<Edge>(null);
  const users = useLyraStore((s) => s.users);
  const labels = useLyraStore((s) => s.labels);
  const cardLabels = labels.filter((l) => issue.labelIds.includes(l.id));
  const openIssueDetail = useLyraStore((s) => s.openIssueDetail);
  const moveIssue = useLyraStore((s) => s.moveIssue);
  const reorderIssue = useLyraStore((s) => s.reorderIssue);
  const updateIssue = useLyraStore((s) => s.updateIssue);
  const chatSessions = useLyraStore((s) => s.chatSessions);
  const assignee = users.find((u) => u.id === issue.assigneeId);
  const isAgentRunning = Object.values(chatSessions).some((s) => s.issueId === issue.id && s.isRunning);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return combineCleanup(
      draggable({
        element: el,
        getInitialData: () => ({ issueId: issue.id, status: issue.status }),
        onDragStart: () => setDragging(true),
        onDrop: () => setDragging(false),
      }),
      dropTargetForElements({
        element: el,
        getData: () => ({ issueId: issue.id, status: issue.status }),
        canDrop: ({ source }) => source.data.issueId !== issue.id,
        onDrag: ({ source, location }) => {
          if (source.data.issueId === issue.id) return;
          const rect = el.getBoundingClientRect();
          const midpoint = rect.top + rect.height / 2;
          setEdge(location.current.input.clientY < midpoint ? "before" : "after");
        },
        onDragLeave: () => setEdge(null),
        onDrop: ({ source }) => {
          setEdge(null);
          const draggedId = source.data.issueId as string;
          if (draggedId === issue.id) return;
          const currentEdge = edgeRef.current;
          if (issue.status !== (source.data.status as string)) {
            void moveIssue(draggedId, issue.status, currentEdge === "before" ? issue.id : undefined, currentEdge === "after" ? issue.id : undefined);
          } else {
            void reorderIssue(draggedId, currentEdge === "before" ? issue.id : undefined, currentEdge === "after" ? issue.id : undefined);
          }
        },
      })
    );
  }, [issue.id, issue.status, moveIssue, reorderIssue]);

  const edgeRef = useRef<Edge>(null);
  edgeRef.current = edge;

  const keyString = `${issue.identifier.prefix}-${issue.identifier.number}`;

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div
          ref={ref}
          className={[
            styles.card,
            dragging ? styles.cardDragging : "",
            edge === "before" ? styles.dropIndicatorBefore : "",
            edge === "after" ? styles.dropIndicatorAfter : "",
          ].join(" ")}
          onClick={() => openIssueDetail(issue.id)}
        >
          {/* Top Row: Type icon + Issue Key */}
          <div className={styles.cardHeaderRow}>
            <span style={{ color: issue.type === "bug" ? "var(--lyra-danger)" : issue.type === "story" ? "var(--lyra-success)" : "var(--lyra-accent-solid)" }}>
              <LyraIcon name={TYPE_ICON[issue.type] as any} size={13} />
            </span>
            <span className={styles.issueKey}>{keyString}</span>
          </div>

          {/* Title */}
          <div className={styles.cardTitle}>{issue.title}</div>

          {/* Labels Row */}
          {cardLabels.length > 0 && (
            <div className={styles.labelRow}>
              {cardLabels.map((label) => {
                const color = LABEL_COLORS[label.name] ?? { bg: "var(--lyra-surface)", text: "var(--lyra-text-muted)" };
                return (
                  <span
                    key={label.id}
                    className={styles.labelChip}
                    style={{ background: color.bg, color: color.text }}
                  >
                    {label.name}
                  </span>
                );
              })}
            </div>
          )}

          {isAgentRunning && (
            <div className={styles.agentBadge}>
              <LyraIcon name="agent" size={11} />
              Agent running
            </div>
          )}

          {/* Bottom Meta Row: Priority, Comments, Assignee */}
          <div className={styles.cardBottomRow}>
            {issue.priority !== "none" && (
              <div className={styles.priorityGroup} style={{ color: PRIORITY_COLOR[issue.priority] }}>
                <LyraIcon name={priorityIcon(issue.priority)} size={12} />
                <span>{PRIORITY_LABELS[issue.priority]}</span>
              </div>
            )}

            <div style={{ flex: 1 }} />

            {issue.commentCount > 0 && (
              <div className={styles.commentTag}>
                <LyraIcon name="comment" size={11} style={{ opacity: 0.7 }} />
                <span>{issue.commentCount}</span>
              </div>
            )}

            {assignee && (
              <Avatar name={assignee.name} colorSeed={assignee.colorSeed} size={18} />
            )}
          </div>
        </div>
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content className="lyra-menu">
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger className="lyra-menu-item">Move to</ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent className="lyra-menu">
                {(["todo", "inProgress", "inReview", "done"] as const).map((status) => (
                  <ContextMenu.Item key={status} className="lyra-menu-item" onSelect={() => void moveIssue(issue.id, status)}>
                    {statusLabel(status)}
                  </ContextMenu.Item>
                ))}
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger className="lyra-menu-item">Assignee</ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent className="lyra-menu">
                <ContextMenu.Item className="lyra-menu-item" onSelect={() => void updateIssue(issue.id, { assigneeId: null as unknown as undefined })}>
                  Unassigned
                </ContextMenu.Item>
                {users.map((u) => (
                  <ContextMenu.Item key={u.id} className="lyra-menu-item" onSelect={() => void updateIssue(issue.id, { assigneeId: u.id })}>
                    {u.name}
                  </ContextMenu.Item>
                ))}
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>
          <ContextMenu.Item className="lyra-menu-item" onSelect={() => openIssueDetail(issue.id)}>
            Open Issue
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

function statusLabel(status: string) {
  switch (status) {
    case "todo":
      return "To Do";
    case "inProgress":
      return "In Progress";
    case "inReview":
      return "In Review";
    case "done":
      return "Done";
    default:
      return status;
  }
}

function combineCleanup(...fns: (() => void)[]) {
  return () => fns.forEach((fn) => fn());
}
