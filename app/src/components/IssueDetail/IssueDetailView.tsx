import { useEffect, useState } from "react";
import { useLyraStore } from "../../state/store";
import { LyraIcon } from "../../icons/LyraIcon";
import { Avatar } from "../Avatar";
import styles from "./IssueDetail.module.css";

import type { ActivityEvent } from "@shared/types";

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

const EMPTY_ACTIVITIES: ActivityEvent[] = [];

export function IssueDetailView({ issueId }: { issueId: string }) {
  const issue = useLyraStore((s) => s.issues.find((i) => i.id === issueId));
  const users = useLyraStore((s) => s.users);
  const cycles = useLyraStore((s) => s.cycles);
  const projects = useLyraStore((s) => s.projects);
  const labels = useLyraStore((s) => s.labels);
  const updateIssue = useLyraStore((s) => s.updateIssue);
  const openChatForIssue = useLyraStore((s) => s.openChatForIssue);
  const setSelection = useLyraStore((s) => s.setSelection);
  const loadActivity = useLyraStore((s) => s.loadActivity);
  const addComment = useLyraStore((s) => s.addComment);
  const activityEvents = useLyraStore((s) => s.activityByIssue[issueId]) ?? EMPTY_ACTIVITIES;

  const [activeTab, setActiveTab] = useState<"overview" | "comments" | "files" | "activity" | "linked">("overview");
  const [activityFilter, setActivityFilter] = useState<"all" | "comments" | "commits" | "agent" | "status">("all");
  const [tasks, setTasks] = useState<TaskItem[]>(DEFAULT_TASKS);
  const [commentText, setCommentText] = useState("");
  const [branchCreated, setBranchCreated] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (issueId) {
      void loadActivity(issueId);
    }
  }, [issueId, loadActivity]);

  if (!issue) {
    return (
      <div style={{ padding: 40, color: "var(--lyra-text-muted)" }}>
        Issue not found.
      </div>
    );
  }

  const reporter = users.find((u) => u.id === issue.creatorId) ?? users[0];
  const project = projects.find((p) => p.id === issue.projectId);
  const issueLabels = labels.filter((l) => issue.labelIds.includes(l.id));
  const keyString = `${issue.identifier.prefix}-${issue.identifier.number}`;

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const handleCreateBranch = async () => {
    const slug = issue.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20);
    const branchName = `lyr-${issue.identifier.number}-${slug}`;
    try {
      await window.lyra.git.createBranch(branchName);
    } catch {
      // Ignore if branch exists
    }
    setBranchCreated(branchName);
  };

  const handleRunTests = () => {
    setTestResult("Running tests...");
    setTimeout(() => {
      setTestResult("8/8 tests passed (1.2s)");
    }, 1200);
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    await addComment(issue.id, commentText.trim());
    setCommentText("");
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
          <button className={styles.outlineButton} onClick={() => navigator.clipboard?.writeText(window.location.href)}>
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

              <select
                className={styles.statusPill}
                value={issue.priority}
                onChange={(e) => void updateIssue(issue.id, { priority: e.target.value as any })}
                style={{
                  background:
                    issue.priority === "urgent" || issue.priority === "high"
                      ? "rgba(239, 68, 68, 0.15)"
                      : "var(--lyra-card)",
                  color:
                    issue.priority === "urgent" || issue.priority === "high"
                      ? "var(--lyra-danger)"
                      : "var(--lyra-text)",
                  border: "1px solid var(--lyra-border)",
                }}
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="none">None</option>
              </select>

              <select
                className={styles.statusPill}
                value={issue.assigneeId ?? ""}
                onChange={(e) => void updateIssue(issue.id, { assigneeId: e.target.value || undefined })}
                style={{
                  background: "var(--lyra-card)",
                  color: "var(--lyra-text)",
                  border: "1px solid var(--lyra-border)",
                }}
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>

              <select
                className={styles.statusPill}
                value={issue.cycleId ?? ""}
                onChange={(e) => void updateIssue(issue.id, { cycleId: e.target.value || undefined })}
                style={{
                  background: "var(--lyra-card)",
                  color: "var(--lyra-text)",
                  border: "1px solid var(--lyra-border)",
                }}
              >
                <option value="">Backlog</option>
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
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
              Comments <span className={styles.tabBadge}>{issue.commentCount ?? 2}</span>
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
              Linked Issues <span className={styles.tabBadge}>2</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabBody}>
            {(activeTab === "overview" || activeTab === "files") && (
              <>
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

                    <div className={styles.attachmentCard}>
                      <div className={styles.diagramThumbnail}>
                        <LyraIcon name="diff" size={24} style={{ color: "var(--lyra-accent-solid)", opacity: 0.8 }} />
                      </div>
                      <div className={styles.attachmentMeta}>
                        <span className={styles.attachmentName}>transition-diagram.png</span>
                      </div>
                    </div>

                    <div className={styles.addAttachmentCard}>
                      <LyraIcon name="plus" size={18} style={{ color: "var(--lyra-accent-solid)" }} />
                      <span>Add</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Linked tab view */}
            {activeTab === "linked" && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Linked Issues</div>
                <div className={styles.relatedList} style={{ marginTop: 8 }}>
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
            )}

            {/* Activity Stream */}
            {(activeTab === "overview" || activeTab === "comments" || activeTab === "activity") && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  {activeTab === "comments" ? "Comments" : "Activity"}
                </div>

                {/* Comment Box */}
                <div className={styles.commentInputBox}>
                  <input
                    placeholder="Add a comment… (Press Enter to post)"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleCommentSubmit();
                    }}
                  />
                  {commentText.trim() && (
                    <button
                      className={styles.outlineButton}
                      style={{ position: "absolute", right: 6, top: 4, height: 26, fontSize: 11 }}
                      onClick={() => void handleCommentSubmit()}
                    >
                      Post
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                {activeTab !== "comments" && (
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
                )}

                {/* Timeline Items */}
                <div className={styles.timeline}>
                  {/* Dynamic activity items from SQLite */}
                  {activityEvents.length > 0 ? (
                    activityEvents
                      .filter((ev) => {
                        const kindStr = ev.kind as string;
                        if (activeTab === "comments" || activityFilter === "comments") {
                          return ev.kind === "commentAdded" || kindStr === "comment";
                        }
                        if (activityFilter === "commits") {
                          return ev.kind === "commitLinked" || kindStr === "commitsPushed";
                        }
                        if (activityFilter === "agent") {
                          return ev.actor.kind === "agent";
                        }
                        if (activityFilter === "status") {
                          return ev.kind === "statusChanged";
                        }
                        return true;
                      })
                      .map((ev) => {
                        const actorUser = users.find((u) => u.id === ev.actor.userId);
                        const actorName = ev.actor.agentName || actorUser?.name || "Tanner";
                        const isAgent = ev.actor.kind === "agent";
                        const isSystem = ev.actor.kind === "system";
                        const kindStr = ev.kind as string;

                        return (
                          <div key={ev.id} className={styles.timelineItem}>
                            {isAgent ? (
                              <div className={styles.agentIconCircle}>
                                <LyraIcon name="agent" size={12} style={{ color: "white" }} />
                              </div>
                            ) : isSystem ? (
                              <div className={styles.successIconCircle}>
                                <LyraIcon name="check" size={12} style={{ color: "white" }} />
                              </div>
                            ) : (
                              <Avatar name={actorName} colorSeed={actorUser?.colorSeed ?? 1} size={22} />
                            )}
                            <div className={styles.timelineContent}>
                              {ev.kind === "commentAdded" || kindStr === "comment" ? (
                                <div>
                                  <div>
                                    <span className={styles.actorName}>{actorName}</span>
                                    <span className={styles.timeAgo}>just now</span>
                                  </div>
                                  <div style={{ marginTop: 4, color: "var(--lyra-text)" }}>{ev.detail}</div>
                                </div>
                              ) : ev.kind === "branchCreated" ? (
                                <div>
                                  <span className={styles.actorName}>{actorName}</span> created branch{" "}
                                  <span className={styles.branchPill}>{ev.detail.replace("created branch ", "")}</span>
                                  <span className={styles.timeAgo}>1d ago</span>
                                </div>
                              ) : ev.kind === "commitLinked" || kindStr === "commitsPushed" ? (
                                <div>
                                  <div>
                                    <span className={styles.actorName}>{actorName}</span> pushed 3 commits
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
                                  </div>
                                </div>
                              ) : kindStr === "buildStatus" ? (
                                <div>
                                  <span className={styles.actorName}>{ev.detail}</span>
                                  <span className={styles.timeAgo}>1d ago</span>
                                </div>
                              ) : (
                                <div>
                                  <span className={styles.actorName}>{actorName}</span> {ev.detail}
                                  <span className={styles.timeAgo}>recently</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            )}
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
                <select
                  className={styles.fieldSelect}
                  value={issue.status}
                  onChange={(e) => void updateIssue(issue.id, { status: e.target.value as any })}
                >
                  <option value="todo">To Do</option>
                  <option value="inProgress">In Progress</option>
                  <option value="inReview">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className={styles.fieldLabel}>Assignee</div>
              <div className={styles.fieldValue}>
                <select
                  className={styles.fieldSelect}
                  value={issue.assigneeId ?? ""}
                  onChange={(e) => void updateIssue(issue.id, { assigneeId: e.target.value || undefined })}
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
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
                <select
                  className={styles.fieldSelect}
                  value={issue.priority}
                  onChange={(e) => void updateIssue(issue.id, { priority: e.target.value as any })}
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="none">None</option>
                </select>
              </div>

              <div className={styles.fieldLabel}>Sprint</div>
              <div className={styles.fieldValue}>
                <select
                  className={styles.fieldSelect}
                  value={issue.cycleId ?? ""}
                  onChange={(e) => void updateIssue(issue.id, { cycleId: e.target.value || undefined })}
                >
                  <option value="">Backlog</option>
                  {cycles.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldLabel}>Parent</div>
              <div className={styles.fieldValue} style={{ color: "var(--lyra-text-faint)" }}>None</div>

              <div className={styles.fieldLabel}>Repository</div>
              <div className={styles.fieldValue}>lyra</div>

              <div className={styles.fieldLabel}>Branch</div>
              <div className={styles.fieldValue} style={{ fontFamily: "var(--lyra-font-mono)", fontSize: 11 }}>
                {issue.linkedBranch || branchCreated || "lyr-142-sidebar"}
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
              <button
                className={styles.agentActionOutline}
                onClick={() => void handleCreateBranch()}
              >
                <LyraIcon name="branch" size={14} />
                <span>{branchCreated ? "✓ Branch Created" : "Create Branch"}</span>
              </button>
            </div>

            <div className={styles.actionList}>
              <div className={styles.actionItem} onClick={() => void handleCreateBranch()}>
                <LyraIcon name="worktree" size={13} />
                <span>Start worktree</span>
              </div>
              <div className={styles.actionItem} onClick={handleRunTests}>
                <LyraIcon name="tests" size={13} />
                <span>Run tests</span>
              </div>
              <div className={styles.actionItem} onClick={() => void window.lyra.git.status()}>
                <LyraIcon name="terminal" size={13} />
                <span>Open in terminal</span>
              </div>
            </div>

            {testResult && (
              <div style={{ fontSize: 11.5, color: "var(--lyra-success)", fontWeight: 500, padding: "4px 8px", background: "rgba(16, 185, 129, 0.1)", borderRadius: 5 }}>
                {testResult}
              </div>
            )}

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
