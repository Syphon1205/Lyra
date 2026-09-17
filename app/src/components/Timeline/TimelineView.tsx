import { useLyraStore, applyFilters, useActiveFilters } from "../../state/store";
import { LyraIcon } from "../../icons/LyraIcon";
import { issueKey, TYPE_ICON } from "../../lib/issueMeta";
import styles from "./TimelineView.module.css";

const DATES = ["Nov 4", "Nov 11", "Nov 18", "Nov 25", "Dec 2", "Dec 9"];

export function TimelineView({ projectId }: { projectId: string }) {
  const issues = useLyraStore((s) => s.issues);
  const filters = useActiveFilters();
  const openIssueDetail = useLyraStore((s) => s.openIssueDetail);

  const projectIssues = applyFilters(
    issues.filter((i) => i.projectId === projectId),
    filters
  );

  return (
    <div className={`${styles.container} lyra-scroll`}>
      <div className={styles.headerBar}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIconWrap}>
            <LyraIcon name="history" size={18} />
          </div>
          <div>
            <h2 className={styles.headerTitle}>Roadmap & Timeline</h2>
          </div>
        </div>
      </div>

      <div className={styles.timelineCard}>
        <div className={styles.timelineScaleHeader}>
          <div className={styles.leftColumnHeader}>Item / Sprint</div>
          <div className={styles.dateScaleRow}>
            {DATES.map((d) => (
              <div key={d} className={styles.dateScaleCol}>
                {d}
              </div>
            ))}
          </div>
        </div>

        {/* Cycle 04 */}
        <div className={styles.timelineRow} style={{ background: "rgba(0,0,0,0.02)" }}>
          <div className={styles.rowLabel} style={{ fontWeight: 700 }}>
            <LyraIcon name="document" size={14} style={{ color: "var(--lyra-accent-solid)" }} />
            <span>Cycle 04 (Active)</span>
          </div>
          <div className={styles.barsArea}>
            <div
              className={styles.bar}
              style={{
                left: "2%",
                width: "30%",
                background: "linear-gradient(90deg, #3b82f6, #6366f1)",
                color: "white",
              }}
            >
              Cycle 04 · 68% Complete
            </div>
          </div>
        </div>

        {/* Cycle 04 issues */}
        {projectIssues.slice(0, 6).map((issue, idx) => {
          const leftOffsets = ["4%", "8%", "6%", "12%", "16%", "20%"];
          const widths = ["18%", "14%", "22%", "16%", "12%", "15%"];
          const isDone = issue.status === "done";

          return (
            <div
              key={issue.id}
              className={styles.timelineRow}
              onClick={() => openIssueDetail(issue.id)}
            >
              <div className={styles.rowLabel}>
                <LyraIcon name={TYPE_ICON[issue.type] as any} size={13} />
                <span style={{ fontFamily: "var(--lyra-font-mono)", fontSize: 11, color: "var(--lyra-text-muted)" }}>
                  {issueKey(issue)}
                </span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {issue.title}
                </span>
              </div>
              <div className={styles.barsArea}>
                <div
                  className={styles.bar}
                  style={{
                    left: leftOffsets[idx % leftOffsets.length],
                    width: widths[idx % widths.length],
                    background: isDone
                      ? "rgba(16, 185, 129, 0.2)"
                      : "rgba(59, 130, 246, 0.18)",
                    border: isDone
                      ? "1px solid #10b981"
                      : "1px solid #3b82f6",
                    color: isDone ? "#10b981" : "var(--lyra-text)",
                  }}
                >
                  {issueKey(issue)} · {issue.estimate ?? 2}d
                </div>
              </div>
            </div>
          );
        })}

        {/* Cycle 05 */}
        <div className={styles.timelineRow} style={{ background: "rgba(0,0,0,0.02)" }}>
          <div className={styles.rowLabel} style={{ fontWeight: 700 }}>
            <LyraIcon name="document" size={14} style={{ color: "var(--lyra-text-muted)" }} />
            <span>Cycle 05 (Planned)</span>
          </div>
          <div className={styles.barsArea}>
            <div
              className={styles.bar}
              style={{
                left: "34%",
                width: "32%",
                background: "rgba(100, 116, 139, 0.2)",
                border: "1px solid var(--lyra-border)",
                color: "var(--lyra-text-muted)",
              }}
            >
              Cycle 05 · Planned
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
