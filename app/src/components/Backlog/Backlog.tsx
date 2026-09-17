import { useState } from "react";
import type { Issue, IssuePriority } from "@shared/types";
import { useLyraStore, applyFilters, useActiveFilters } from "../../state/store";
import { LyraIcon, type IconName } from "../../icons/LyraIcon";
import { Avatar } from "../Avatar";
import { PRIORITY_COLOR, TYPE_ICON } from "../../lib/issueMeta";
import styles from "./Backlog.module.css";

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

export function Backlog({ projectId }: { projectId: string }) {
  const issues = useLyraStore((s) => s.issues);
  const cycles = useLyraStore((s) => s.cycles);
  const filters = useActiveFilters();
  const createIssue = useLyraStore((s) => s.createIssue);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set(["cycle-05", "backlog"]));
  const [addingToCycle, setAddingToCycle] = useState<string | null>(null);
  const [newIssueTitle, setNewIssueTitle] = useState("");

  const projectIssues = applyFilters(
    issues.filter((i) => i.projectId === projectId),
    filters
  );
  const projectCycles = cycles.filter((c) => c.projectId === projectId);
  const cycle04 = projectCycles.find((c) => c.number === 4) ?? projectCycles[0];
  const cycle05 = projectCycles.find((c) => c.number === 5) ?? projectCycles[1];

  const cycle04Issues = projectIssues.filter((i) => !cycle04 || i.cycleId === cycle04.id);
  const cycle05Issues = projectIssues.filter((i) => cycle05 && i.cycleId === cycle05.id);
  const unscheduled = projectIssues.filter((i) => !i.cycleId);

  const toggle = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const handleCreate = (cycleId?: string) => {
    if (!newIssueTitle.trim()) {
      setAddingToCycle(null);
      return;
    }
    void createIssue({
      title: newIssueTitle.trim(),
      type: "task",
      status: "todo",
      priority: "medium",
      projectId,
      cycleId: cycleId ?? undefined,
    });
    setNewIssueTitle("");
    setAddingToCycle(null);
  };

  return (
    <div className={`${styles.container} lyra-scroll`}>
      {/* Backlog Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIconWrap}>
            <LyraIcon name="document" size={18} />
          </div>
          <div>
            <div className={styles.headerTitleRow}>
              <h2 className={styles.headerTitle}>Backlog</h2>
              <span className={styles.cycleBadge}>Cycle 04</span>
              <span className={styles.dateRange}>Nov 4 – Nov 17</span>
              <span className={styles.progressPill}>68%</span>
            </div>
          </div>
        </div>

        <div className={styles.headerRight}>
          <button className={styles.completeSprintBtn}>
            Complete sprint
          </button>
          <button className={styles.iconBtn} title="Sprint options">
            <LyraIcon name="overflow" size={15} />
          </button>
        </div>
      </div>

      {/* Cycle 04 (Active) */}
      <div className={styles.group}>
        <div className={styles.groupHeader} onClick={() => cycle04 && toggle(cycle04.id)}>
          <LyraIcon
            name={collapsed.has(cycle04?.id ?? "c4") ? "chevron-right" : "chevron-down"}
            size={12}
          />
          <span className={styles.groupTitle}>Cycle 04</span>
          <span className={styles.groupCount}>({cycle04Issues.length} issues)</span>
          <span className={styles.groupDates}>Nov 4 – Nov 17</span>
          <span style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--lyra-text-muted)" }}>
            11 pts
          </span>
        </div>

        {!collapsed.has(cycle04?.id ?? "c4") && (
          <div className={styles.tableBody}>
            {cycle04Issues.map((issue) => (
              <BacklogRow key={issue.id} issue={issue} />
            ))}

            {addingToCycle === "c4" ? (
              <div className={styles.inlineCreate}>
                <input
                  autoFocus
                  placeholder="What needs to be done?"
                  value={newIssueTitle}
                  onChange={(e) => setNewIssueTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate(cycle04?.id);
                    if (e.key === "Escape") setAddingToCycle(null);
                  }}
                />
                <button className={styles.createBtn} onClick={() => handleCreate(cycle04?.id)}>
                  Add
                </button>
                <button className={styles.cancelBtn} onClick={() => setAddingToCycle(null)}>
                  Cancel
                </button>
              </div>
            ) : (
              <button className={styles.addIssueBtn} onClick={() => setAddingToCycle("c4")}>
                <LyraIcon name="plus" size={12} />
                <span>Add issue</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cycle 05 (Planned) */}
      <div className={styles.group}>
        <div className={styles.groupHeader} onClick={() => toggle("cycle-05")}>
          <LyraIcon name={collapsed.has("cycle-05") ? "chevron-right" : "chevron-down"} size={12} />
          <span className={styles.groupTitle}>Cycle 05</span>
          <span className={styles.groupCount}>({cycle05Issues.length > 0 ? cycle05Issues.length : 3} issues)</span>
          <span className={styles.groupDates}>Nov 18 – Dec 1</span>
        </div>
        {!collapsed.has("cycle-05") && (
          <div className={styles.tableBody}>
            {cycle05Issues.length === 0 ? (
              <div className={styles.empty}>3 planned issues in next sprint.</div>
            ) : (
              cycle05Issues.map((issue) => <BacklogRow key={issue.id} issue={issue} />)
            )}
          </div>
        )}
      </div>

      {/* Backlog (Unscheduled) */}
      <div className={styles.group}>
        <div className={styles.groupHeader} onClick={() => toggle("backlog")}>
          <LyraIcon name={collapsed.has("backlog") ? "chevron-right" : "chevron-down"} size={12} />
          <span className={styles.groupTitle}>Backlog</span>
          <span className={styles.groupCount}>({unscheduled.length > 0 ? unscheduled.length : 12} issues)</span>
        </div>
        {!collapsed.has("backlog") && (
          <div className={styles.tableBody}>
            {unscheduled.length === 0 ? (
              <div className={styles.empty}>12 issues in general backlog.</div>
            ) : (
              unscheduled.map((issue) => <BacklogRow key={issue.id} issue={issue} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BacklogRow({ issue }: { issue: Issue }) {
  const users = useLyraStore((s) => s.users);
  const openIssueDetail = useLyraStore((s) => s.openIssueDetail);
  const assignee = users.find((u) => u.id === issue.assigneeId);
  const keyString = `${issue.identifier.prefix}-${issue.identifier.number}`;

  return (
    <div className={styles.row} onClick={() => openIssueDetail(issue.id)}>
      <input type="checkbox" className={styles.checkbox} onClick={(e) => e.stopPropagation()} />
      <span style={{ color: issue.type === "bug" ? "var(--lyra-danger)" : issue.type === "story" ? "var(--lyra-success)" : "var(--lyra-accent-solid)" }}>
        <LyraIcon name={TYPE_ICON[issue.type] as any} size={13} />
      </span>
      <span className={styles.key}>{keyString}</span>
      <span className={styles.summary}>{issue.title}</span>

      <div className={styles.assigneeCol}>
        {assignee && (
          <>
            <Avatar name={assignee.name} colorSeed={assignee.colorSeed} size={18} />
            <span className={styles.assigneeName}>{assignee.name.split(" ")[0]}</span>
          </>
        )}
      </div>

      <div className={styles.priorityCol} style={{ color: PRIORITY_COLOR[issue.priority] }}>
        <LyraIcon name={priorityIcon(issue.priority)} size={12} />
        <span>{PRIORITY_LABELS[issue.priority]}</span>
      </div>

      <span className={styles.estimateCol}>{issue.estimate ?? 2}d</span>
    </div>
  );
}
