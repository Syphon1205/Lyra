import { useEffect, useState } from "react";
import { useLyraStore } from "../../state/store";
import { AppIcon } from "../AppIcon";
import { STATUS_LABEL, PRIORITY_LABEL, ISSUE_STATUSES_ORDERED, issueKey } from "../../lib/issueMeta";
import { ISSUE_PRIORITIES } from "@shared/types";
import styles from "./IssuePanel.module.css";

export function IssuePanel({ issueId, standalone = false }: { issueId: string; standalone?: boolean }) {
  const issue = useLyraStore((s) => s.issues.find((i) => i.id === issueId));
  const users = useLyraStore((s) => s.users);
  const cycles = useLyraStore((s) => s.cycles);
  const labels = useLyraStore((s) => s.labels);
  const projects = useLyraStore((s) => s.projects);
  const activity = useLyraStore((s) => s.activityByIssue[issueId]);
  const loadActivity = useLyraStore((s) => s.loadActivity);
  const updateIssue = useLyraStore((s) => s.updateIssue);
  const closeCompanionPanel = useLyraStore((s) => s.closeCompanionPanel);
  const openIssueWindow = useLyraStore((s) => s.openIssueWindow);
  const openChatForIssue = useLyraStore((s) => s.openChatForIssue);

  const [titleDraft, setTitleDraft] = useState(issue?.title ?? "");
  useEffect(() => setTitleDraft(issue?.title ?? ""), [issue?.id, issue?.title]);
  useEffect(() => {
    if (!activity) void loadActivity(issueId);
  }, [issueId, activity, loadActivity]);

  if (!issue) return null;
  const cycle = cycles.find((c) => c.id === issue.cycleId);
  const project = projects.find((p) => p.id === issue.projectId);
  const issueLabels = labels.filter((l) => issue.labelIds.includes(l.id));

  return (
    <div className={styles.panel}>
      <div className={styles.topBar}>
        <span className={styles.key}>{issueKey(issue)}</span>
        <div className={styles.spacer} />
        {!standalone && (
          <button className={styles.iconButton} title="Open in New Window" onClick={() => openIssueWindow(issue.id)}>
            <AppIcon name="detach" size={15} />
          </button>
        )}
        {!standalone && (
          <button className={styles.iconButton} title="Close" onClick={closeCompanionPanel}>
            <AppIcon name="close" size={15} />
          </button>
        )}
      </div>

      <div className={styles.body}>
        <textarea
          className={styles.title}
          rows={Math.max(1, Math.ceil(titleDraft.length / 40))}
          value={titleDraft}
          onChange={(e) => setTitleDraft(e.target.value)}
          onBlur={() => {
            if (titleDraft.trim() && titleDraft !== issue.title) void updateIssue(issue.id, { title: titleDraft.trim() });
          }}
        />

        <div className={styles.metaRow}>
          <select className={styles.metaSelect} value={issue.status} onChange={(e) => void updateIssue(issue.id, { status: e.target.value as typeof issue.status })}>
            {ISSUE_STATUSES_ORDERED.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <select className={styles.metaSelect} value={issue.priority} onChange={(e) => void updateIssue(issue.id, { priority: e.target.value as typeof issue.priority })}>
            {ISSUE_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
          <select
            className={styles.metaSelect}
            value={issue.assigneeId ?? ""}
            onChange={(e) => void updateIssue(issue.id, { assigneeId: (e.target.value || null) as unknown as string | undefined })}
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className={styles.sectionLabel} style={{ marginBottom: 6 }}>
            Description
          </div>
          <div className={styles.description}>{issue.body || "No description."}</div>
        </div>

        <div>
          <div className={styles.sectionLabel} style={{ marginBottom: 6 }}>
            Details
          </div>
          <dl className={styles.detailsGrid}>
            <dt>Reporter</dt>
            <dd>{users.find((u) => u.id === issue.creatorId)?.name ?? "—"}</dd>
            <dt>Project</dt>
            <dd>{project?.name ?? "—"}</dd>
            <dt>Sprint</dt>
            <dd>{cycle?.name ?? "Backlog"}</dd>
            {issue.epicName && (
              <>
                <dt>Epic</dt>
                <dd>{issue.epicName}</dd>
              </>
            )}
            {issue.estimate != null && (
              <>
                <dt>Estimate</dt>
                <dd>{issue.estimate} pts</dd>
              </>
            )}
            {issueLabels.length > 0 && (
              <>
                <dt>Labels</dt>
                <dd>{issueLabels.map((l) => l.name).join(", ")}</dd>
              </>
            )}
            {issue.linkedBranch && (
              <>
                <dt>Branch</dt>
                <dd style={{ fontFamily: "var(--lyra-font-mono)" }}>{issue.linkedBranch}</dd>
              </>
            )}
          </dl>
        </div>

        <div>
          <div className={styles.sectionLabel} style={{ marginBottom: 6 }}>
            Activity
          </div>
          {(activity ?? []).map((event) => (
            <div key={event.id} className={styles.activityRow}>
              <AppIcon name={event.actor.kind === "agent" ? "agents" : event.actor.kind === "system" ? "check" : "history"} size={12} />
              <span>
                <strong>{actorName(event, users)}</strong> {event.detail}
              </span>
              <span className={styles.activityTime}>{new Date(event.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
            </div>
          ))}
        </div>

        <button className={styles.askAgent} onClick={() => void openChatForIssue(issue.id)}>
          <AppIcon name="agents" size={14} />
          Ask Agent
        </button>
      </div>
    </div>
  );
}

function actorName(event: { actor: { kind: string; userId?: string; agentName?: string } }, users: { id: string; name: string }[]): string {
  if (event.actor.kind === "human") return users.find((u) => u.id === event.actor.userId)?.name ?? "Someone";
  if (event.actor.kind === "agent") return event.actor.agentName ?? "Agent";
  return "Lyra";
}
