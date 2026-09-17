import { useEffect, useRef, useState } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import type { Issue, IssueStatus, ID } from "@shared/types";
import { useLyraStore } from "../../state/store";
import { LyraIcon } from "../../icons/LyraIcon";
import { STATUS_LABEL } from "../../lib/issueMeta";
import { Card } from "./Card";
import styles from "./Board.module.css";

function columnToken(status: IssueStatus): string {
  switch (status) {
    case "todo":
      return "todo";
    case "inProgress":
      return "progress";
    case "inReview":
      return "review";
    case "done":
      return "done";
    default:
      return "todo";
  }
}

export function Column({
  status,
  issues,
  projectId,
}: {
  status: IssueStatus;
  issues: Issue[];
  projectId: ID;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isOver, setIsOver] = useState(false);
  const moveIssue = useLyraStore((s) => s.moveIssue);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const createIssue = useLyraStore((s) => s.createIssue);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return dropTargetForElements({
      element: el,
      getData: () => ({ status }),
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop: ({ source, location }) => {
        setIsOver(false);
        const first = location.current.dropTargets[0];
        if (first?.element !== el) return;
        void moveIssue(source.data.issueId as string, status);
      },
    });
  }, [status, moveIssue]);

  const submit = () => {
    if (!title.trim()) {
      setCreating(false);
      return;
    }
    void createIssue({ title: title.trim(), type: "task", status, priority: "medium", projectId });
    setTitle("");
    setCreating(false);
  };

  return (
    <div
      ref={ref}
      className={`${styles.column} ${isOver ? styles.columnOver : ""}`}
      style={{ background: `var(--lyra-column-${columnToken(status)})` }}
    >
      {/* Column Header: e.g. "To Do 12" + "+" and "..." buttons */}
      <div className={styles.columnHeader}>
        <span className={styles.columnTitle}>{STATUS_LABEL[status]}</span>
        <span className={styles.columnCount}>{issues.length}</span>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 2 }}>
          <button
            className={styles.columnIconBtn}
            title="Create issue in column"
            onClick={() => setCreating(true)}
          >
            <LyraIcon name="plus" size={13} />
          </button>
          <button className={styles.columnIconBtn} title="Column options">
            <LyraIcon name="overflow" size={14} />
          </button>
        </div>
      </div>

      <div className={styles.cardList}>
        {issues.map((issue) => (
          <Card key={issue.id} issue={issue} />
        ))}
      </div>

      {creating ? (
        <div className={styles.createInput}>
          <input
            autoFocus
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              if (e.key === "Escape") {
                setCreating(false);
                setTitle("");
              }
            }}
          />
          <div className={styles.createActions}>
            <button className="primary" onClick={submit}>
              Create
            </button>
            <button
              className="secondary"
              onClick={() => {
                setCreating(false);
                setTitle("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button className={styles.createRow} onClick={() => setCreating(true)}>
          <LyraIcon name="plus" size={12} />
          <span>Create issue</span>
        </button>
      )}
    </div>
  );
}
