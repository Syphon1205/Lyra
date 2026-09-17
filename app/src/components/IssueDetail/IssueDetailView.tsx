import { useState } from "react";
import { useLyraStore } from "../../state/store";
import { LyraIcon } from "../../icons/LyraIcon";
import { Avatar } from "../Avatar";
import styles from "./IssueDetail.module.css";

interface TaskItem {
  id: string;
  text: string;
  done: boolean;
}

const DEFAULT_TASKS: TaskItem[] = [
  { id: "1", text: "Investigate current animation flow", done: true },
  { id: "2", text: "Identify re-render triggers", done: false },
  { id: "3", text: "Implement matched geometry transition", done: false },
  { id: "4", text: "Test on lower-end machines", done: false },
];

export function IssueDetailView({ issueId }: { issueId: string }) {
  const issue = useLyraStore((s) => s.issues.find((i) => i.id === issueId));
  const users = useLyraStore((s) => s.users);
  const cycles = useLyraStore((s) => s.cycles);
  const projects = useLyraStore((s) => s.projects);
  const labels = useLyraStore((s) => s.labels);
  const updateIssue = useLyraStore((s) => s.updateIssue);
  const openChatForIssue = useLyraStore((s) => s.openChatForIssue);
  const setSelection = useLyraStore((s) => s.setSelection);

  const [activeTab, setActiveTab] = useState<"overview" | "comments" | "files" | "activity" | "linked">("overview");
  const [activityFilter, setActivityFilter] = useState<"all" | "comments" | "commits" | "agent" | "status">("all");
  const [tasks, setTasks] = useState<TaskItem[]>(DEFAULT_TASKS);
  const [commentText, setCommentText] = useState("");

  if (!issue) {
    return (
      <div style={{ padding: 40, color: "var(--lyra-text-muted)" }}>
        Issue not found.
      </div>
    );
  }

  const assignee = users.find((u) => u.id === issue.assigneeId);
  const reporter = users.find((u) => u.id === issue.creatorId) ?? users[0];
  const cycle = cycles.find((c) => c.id === issue.cycleId);
  const project = projects.find((p) => p.id === issue.projectId);
  const issueLabels = labels.filter((l) => issue.labelIds.includes(l.id));
  const keyString = `${issue.identifier.prefix}-${issue.identifier.number}`;

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  return (
    <div className={styles.container}>
      {/* Top Breadcrumb & Actions Bar */}
      <div className={styles.topActionsBar}>
        <div className={styles.breadcrumb}>
          <span
            className={styles.breadcrumbLink}
            onClick={() => project && setSelection({ kind: "project", projectId: project.id })}
          >
            Projects
          </span>
          <span className={styles.sep}>/</span>
          <span
            className={styles.breadcrumbLink}
            onClick={() => project && setSelection({ kind: "project", projectId: project.id })}
          >
            Lyra
          </span>
          <span className={styles.sep}>/</span>
          <span
            className={styles.breadcrumbLink}
            onClick={() => project && setSelection({ kind: "project", projectId: project.id })}
          >
            {project?.name ?? "Engineering"}
          </span>
          <span className={styles.sep}>/</span>
          <span className={styles.breadcrumbCurrent}>{keyString}</span>
        </div>

        <div className={styles.topRightActions}>
          <button className={styles.outlineButton}>
            <LyraIcon name="share" size={13} />
            <span>Share</span>
          </button>
          <button
            className={styles.primaryButton}
            onClick={() => void openChatForIssue(issue.id)}
          >
            <LyraIcon name="agent" size={14} />
            <span>Run with Agent</span>
          </button>
          <button className={styles.iconBtn}>
            <LyraIcon name="overflow" size={15} />
          </button>
        </div>
      </div>

      <div className={styles.layoutRow}>
        {/* Main Content Column */}
        <div className={styles.mainColumn}>
          {/* Issue Header */}
          <div className={styles.header}>
            <div className={styles.keyRow}>
              <span className={styles.typeIconWrap}>
                <LyraIcon name="type-task" size={14} />
              </span>
              <span className={styles.issueKey}>{keyString}</span>
            </div>
            <h1 className={styles.title}>{issue.title}</h1>

            {/* Quick Status Bar */}
            <div className={styles.pillsRow}>
              <select
                className={styles.statusPill}
                value={issue.status}
                onChange={(e) => void updateIssue(issue.id, { status: e.target.value as any })}
              >
                <option value="todo">To Do</option>
                <option value="inProgress">In Progress</option>
                <option value="inReview">In Review</option>
                <option value="done">Done</option>
              </select>

              <div className={styles.metaPill}>
                <LyraIcon name="priority-high" size={12} style={{ color: "var(--lyra-danger)" }} />
                <span>High</span>
              </div>

              {assignee && (
                <div className={styles.metaPill}>
                  <Avatar name={assignee.name} colorSeed={assignee.colorSeed} size={16} />
                  <span>{assignee.name}</span>
                </div>
              )}

              <div className={styles.metaPill}>
                <LyraIcon name="history" size={12} />
                <span>{cycle?.name ?? "Cycle 04"}</span>
              </div>

              <button className={styles.iconBtnSmall}>
                <LyraIcon name="overflow" size={13} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.subTabs}>
            <button
              className={`${styles.subTab} ${activeTab === "overview" ? styles.subTabActive : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`${styles.subTab} ${activeTab === "comments" ? styles.subTabActive : ""}`}
              onClick={() => setActiveTab("comments")}
            >
              Comments <span className={styles.tabBadge}>2</span>
            </button>
            <button
              className={`${styles.subTab} ${activeTab === "files" ? styles.subTabActive : ""}`}
              onClick={() => setActiveTab("files")}
            >
              Files <span className={styles.tabBadge}>3</span>
            </button>
            <button
              className={`${styles.subTab} ${activeTab === "activity" ? styles.subTabActive : ""}`}
              onClick={() => setActiveTab("activity")}
            >
              Activity
            </button>
            <button
              className={`${styles.subTab} ${activeTab === "linked" ? styles.subTabActive : ""}`}
              onClick={() => setActiveTab("linked")}
            >
              Linked Issues <span className={styles.tabBadge}>1</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabBody}>
            {/* Description */}
            <div className={styles.section}>
              <div className={styles.descriptionText}>
                {issue.body ||
                  "The sidebar transitions feel janky when switching projects, especially on slower machines. We should refine the animation and ensure it uses matched geometry for a smoother experience."}
              </div>
            </div>

            {/* Acceptance Criteria / Tasks */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Tasks</div>
              <div className={styles.tasksList}>
                {tasks.map((task) => (
                  <div key={task.id} className={styles.taskItem} onClick={() => toggleTask(task.id)}>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(task.id)}
                      className={styles.taskCheckbox}
                    />
                    <span className={task.done ? styles.taskDoneText : styles.taskText}>
                      {task.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Labels */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Labels</div>
              <div className={styles.labelsRow}>
                {issueLabels.map((l) => (
                  <span key={l.id} className={styles.tagChip}>
                    {l.name}
                  </span>
                ))}
                <span className={styles.tagChip}>Design</span>
                <span className={styles.tagChip}>macOS</span>
                <span className={styles.tagChip}>Navigation</span>
                <button className={styles.addTagButton}>+ Add label</button>
              </div>
            </div>

            {/* Attachments */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Attachments</div>
              <div className={styles.attachmentsGrid}>
                {/* Attachment 1: sidebar.mp4 */}
                <div className={styles.attachmentCard}>
                  <div className={styles.videoThumbnail}>
                    <div className={styles.playIconCircle}>
                      <LyraIcon name="run" size={14} style={{ color: "white", marginLeft: 2 }} />
                    </div>
                    <span className={styles.durationBadge}>00:12</span>
                  </div>
                  <div className={styles.attachmentMeta}>
                    <span className={styles.attachmentName}>sidebar.mp4</span>
                  </div>
                </div>

                {/* Attachment 2: transition-diagram.png */}
                <div className={styles.attachmentCard}>
                  <div className={styles.diagramThumbnail}>
                    <LyraIcon name="diff" size={24} style={{ color: "var(--lyra-accent-solid)", opacity: 0.8 }} />
                  </div>
                  <div className={styles.attachmentMeta}>
                    <span className={styles.attachmentName}>transition-diagram.png</span>
                  </div>
                </div>

                {/* Add Attachment */}
                <div className={styles.addAttachmentCard}>
                  <LyraIcon name="plus" size={18} style={{ color: "var(--lyra-accent-solid)" }} />
                  <span>Add</span>
                </div>
              </div>
            </div>

            {/* Activity Stream */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Activity</div>

              {/* Comment Box */}
              <div className={styles.commentInputBox}>
                <input
                  placeholder="Add a comment…"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
              </div>

              {/* Filter Tabs */}
              <div className={styles.activityFilterStrip}>
                {(["all", "comments", "commits", "agent", "status"] as const).map((filter) => (
                  <button
                    key={filter}
                    className={`${styles.filterBtn} ${activityFilter === filter ? styles.filterBtnActive : ""}`}
                    onClick={() => setActivityFilter(filter)}
                  >
                    {filter === "all"
                      ? "All"
                      : filter === "comments"
                        ? "Comments"
                        : filter === "commits"
                          ? "Commits"
                          : filter === "agent"
                            ? "Agent Events"
                            : "Status Changes"}
                  </button>
                ))}
              </div>

              {/* Timeline Items */}
              <div className={styles.timeline}>
                <div className={styles.timelineItem}>
                  <Avatar name="Tanner Davidson" colorSeed={1} size={22} />
                  <div className={styles.timelineContent}>
                    <span className={styles.actorName}>Tanner</span> created this issue
                    <span className={styles.timeAgo}>2d ago</span>
                  </div>
                </div>

                <div className={styles.timelineItem}>
                  <div className={styles.agentIconCircle}>
                    <LyraIcon name="agent" size={12} style={{ color: "white" }} />
                  </div>
                  <div className={styles.timelineContent}>
                    <span className={styles.actorName}>Codex</span> created branch{" "}
                    <span className={styles.branchPill}>lyr-142-sidebar</span>
                    <span className={styles.timeAgo}>1d ago</span>
                  </div>
                </div>

                <div className={styles.timelineItem}>
                  <div className={styles.agentIconCircle}>
                    <LyraIcon name="commit" size={12} style={{ color: "white" }} />
                  </div>
                  <div className={styles.timelineContent}>
                    <div>
                      <span className={styles.actorName}>Codex</span> pushed 3 commits
                      <span className={styles.timeAgo}>1d ago</span>
                    </div>
                    <div className={styles.commitList}>
                      <div className={styles.commitRow}>
                        <span className={styles.commitSha}>a1b2c3d</span>
                        <span>Adjust sidebar transition timing</span>
                      </div>
                      <div className={styles.commitRow}>
                        <span className={styles.commitSha}>d4e5f6a</span>
                        <span>Refactor navigation state</span>
                      </div>
                      <div className={styles.commitRow}>
                        <span className={styles.commitSha}>f7g8h9i</span>
                        <span>Add reduced motion support</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.timelineItem}>
                  <div className={styles.successIconCircle}>
                    <LyraIcon name="check" size={12} style={{ color: "white" }} />
                  </div>
                  <div className={styles.timelineContent}>
                    <span className={styles.actorName}>Build passed</span>
                    <span className={styles.timeAgo}>1d ago</span>
                  </div>
                </div>

                <div className={styles.timelineItem}>
                  <Avatar name="Tanner Davidson" colorSeed={1} size={22} />
                  <div className={styles.timelineContent}>
                    <span className={styles.actorName}>Tanner</span> moved to{" "}
                    <span className={styles.statusInline}>In Progress</span>
                    <span className={styles.timeAgo}>1d ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Inspector Column */}
        <div className={styles.rightInspector}>
          {/* Details Table */}
          <div className={styles.inspectorSection}>
            <div className={styles.inspectorHeading}>Details</div>
            <div className={styles.fieldsGrid}>
              <div className={styles.fieldLabel}>Type</div>
              <div className={styles.fieldValue}>
                <span className={styles.typeIconSmall}>
                  <LyraIcon name="type-task" size={12} />
                </span>
                <span>Task</span>
              </div>

              <div className={styles.fieldLabel}>Status</div>
              <div className={styles.fieldValue}>
                <span className={styles.statusBadge}>In Progress ▾</span>
              </div>

              <div className={styles.fieldLabel}>Assignee</div>
              <div className={styles.fieldValue}>
                {assignee ? (
                  <>
                    <Avatar name={assignee.name} colorSeed={assignee.colorSeed} size={18} />
                    <span>{assignee.name}</span>
                  </>
                ) : (
                  <span>Unassigned</span>
                )}
              </div>

              <div className={styles.fieldLabel}>Reporter</div>
              <div className={styles.fieldValue}>
                <Avatar name={reporter?.name ?? "Tanner"} colorSeed={reporter?.colorSeed ?? 1} size={18} />
                <span>{reporter?.name ?? "Tanner"}</span>
              </div>

              <div className={styles.fieldLabel}>Labels</div>
              <div className={styles.fieldValue}>
                <span className={styles.miniTag}>Design</span>
                <span className={styles.miniTag}>macOS</span>
              </div>

              <div className={styles.fieldLabel}>Priority</div>
              <div className={styles.fieldValue}>
                <LyraIcon name="priority-high" size={12} style={{ color: "var(--lyra-danger)" }} />
                <span>High</span>
              </div>

              <div className={styles.fieldLabel}>Sprint</div>
              <div className={styles.fieldValue}>Cycle 04</div>

              <div className={styles.fieldLabel}>Parent</div>
              <div className={styles.fieldValue} style={{ color: "var(--lyra-text-faint)" }}>None</div>

              <div className={styles.fieldLabel}>Repository</div>
              <div className={styles.fieldValue}>lyra</div>

              <div className={styles.fieldLabel}>Branch</div>
              <div className={styles.fieldValue} style={{ fontFamily: "var(--lyra-font-mono)", fontSize: 11 }}>
                lyr-142-sidebar
              </div>

              <div className={styles.fieldLabel}>Estimate</div>
              <div className={styles.fieldValue}>2d</div>

              <div className={styles.fieldLabel}>Created</div>
              <div className={styles.fieldValue}>Nov 12, 2024</div>

              <div className={styles.fieldLabel}>Updated</div>
              <div className={styles.fieldValue}>2h ago</div>
            </div>
          </div>

          {/* Development / Agent Actions */}
          <div className={styles.inspectorSection}>
            <div className={styles.inspectorHeading}>Agent Actions</div>
            <div className={styles.agentActionButtons}>
              <button
                className={styles.agentActionPrimary}
                onClick={() => void openChatForIssue(issue.id)}
              >
                <LyraIcon name="agent" size={14} />
                <span>Ask Agent</span>
              </button>
              <button className={styles.agentActionOutline}>
                <LyraIcon name="branch" size={14} />
                <span>Create Branch</span>
              </button>
            </div>

            <div className={styles.actionList}>
              <div className={styles.actionItem}>
                <LyraIcon name="worktree" size={13} />
                <span>Start worktree</span>
              </div>
              <div className={styles.actionItem}>
                <LyraIcon name="tests" size={13} />
                <span>Run tests</span>
              </div>
              <div className={styles.actionItem}>
                <LyraIcon name="terminal" size={13} />
                <span>Open in terminal</span>
              </div>
            </div>

            <div className={styles.statsBlock}>
              <div className={styles.statRow}>
                <LyraIcon name="commit" size={13} />
                <span>3 commits</span>
              </div>
              <div className={styles.statRow}>
                <LyraIcon name="pull-request" size={13} />
                <span>1 pull request</span>
              </div>
              <div className={styles.statRow}>
                <LyraIcon name="diff" size={13} />
                <span style={{ color: "var(--lyra-text-muted)" }}>3 files changed</span>
                <span style={{ color: "var(--lyra-success)", fontWeight: 600, marginLeft: "auto" }}>+24</span>
                <span style={{ color: "var(--lyra-danger)", fontWeight: 600, marginLeft: 4 }}>-8</span>
              </div>
            </div>
          </div>

          {/* Related Issues */}
          <div className={styles.inspectorSection}>
            <div className={styles.inspectorHeading}>Related</div>
            <div className={styles.relatedRow}>
              <span className={styles.relatedLabel}>Blocks</span>
              <span className={styles.relatedCount}>0</span>
            </div>
            <div className={styles.relatedRow}>
              <span className={styles.relatedLabel}>Is blocked by</span>
              <span className={styles.relatedCount}>0</span>
            </div>
            <div className={styles.relatedRow}>
              <span className={styles.relatedLabel}>Relates to</span>
              <span className={styles.relatedCount}>2</span>
            </div>
            <div className={styles.relatedList}>
              <div className={styles.relatedItem}>
                <LyraIcon name="type-story" size={12} style={{ color: "var(--lyra-success)" }} />
                <span className={styles.relatedKey}>LYR-138</span>
                <span className={styles.relatedTitle}>Implement agent chat panel</span>
              </div>
              <div className={styles.relatedItem}>
                <LyraIcon name="type-task" size={12} style={{ color: "var(--lyra-accent-solid)" }} />
                <span className={styles.relatedKey}>LYR-101</span>
                <span className={styles.relatedTitle}>Menu bar integration</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
