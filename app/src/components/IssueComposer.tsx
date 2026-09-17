import { useState } from "react";
import { ISSUE_PRIORITIES, ISSUE_TYPES } from "@shared/types";
import type { ID, IssuePriority, IssueStatus, IssueType } from "@shared/types";
import { useLyraStore } from "../state/store";
import { GlassSurface } from "./GlassSurface";
import { TYPE_LABEL, PRIORITY_LABEL, STATUS_LABEL } from "../lib/issueMeta";
import styles from "./IssueComposer.module.css";

export function IssueComposer({ onClose }: { onClose: () => void }) {
  const projects = useLyraStore((s) => s.projects);
  const users = useLyraStore((s) => s.users);
  const createIssue = useLyraStore((s) => s.createIssue);
  const selection = useLyraStore((s) => s.selection);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<IssueType>("task");
  const [status, setStatus] = useState<IssueStatus>("todo");
  const [priority, setPriority] = useState<IssuePriority>("medium");
  const [assigneeId, setAssigneeId] = useState<ID | "">("");
  const [projectId, setProjectId] = useState<ID>(selection.kind === "project" ? selection.projectId : projects[0]?.id ?? "");

  const submit = () => {
    if (!title.trim()) return;
    void createIssue({ title: title.trim(), type, status, priority, assigneeId: assigneeId || undefined, projectId });
    onClose();
  };

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <GlassSurface variant="standard" radius={16} className={styles.card} onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}>
        <div className={styles.label}>Create Issue</div>
        <input
          autoFocus
          className={styles.titleInput}
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          }}
        />
        <textarea className={styles.descInput} rows={2} placeholder="Description…" />

        <div className={styles.row}>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value as IssueType)}>
            {ISSUE_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABEL[t]}
              </option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value as IssueStatus)}>
            {(["backlog", "todo", "inProgress", "inReview", "done"] as const).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value as IssuePriority)}>
            {ISSUE_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
          <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.footer}>
          <button className={styles.createButton} disabled={!title.trim()} onClick={submit}>
            Create <span className={styles.hint}>⌘⏎</span>
          </button>
        </div>
      </GlassSurface>
    </div>
  );
}
