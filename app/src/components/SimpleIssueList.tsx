import type { Issue } from "@shared/types";
import { useLyraStore } from "../state/store";
import { STATUS_LABEL, ISSUE_STATUSES_ORDERED, issueKey, TYPE_ICON } from "../lib/issueMeta";
import { AppIcon } from "./AppIcon";
import styles from "./SimpleIssueList.module.css";

export function SimpleIssueList({ title, issues, emptyText }: { title: string; issues: Issue[]; emptyText: string }) {
  const openIssueDetail = useLyraStore((s) => s.openIssueDetail);
  const groups = ISSUE_STATUSES_ORDERED.map((status) => ({ status, items: issues.filter((i) => i.status === status) })).filter((g) => g.items.length > 0);

  return (
    <div className={`${styles.container} lyra-scroll`}>
      <h1 className={styles.heading}>{title}</h1>
      {issues.length === 0 && <div className={styles.empty}>{emptyText}</div>}
      {groups.map((group) => (
        <div key={group.status}>
          <div className={styles.groupLabel}>
            {STATUS_LABEL[group.status]} · {group.items.length}
          </div>
          {group.items.map((issue) => (
            <div key={issue.id} className={styles.row} onClick={() => openIssueDetail(issue.id)}>
              <AppIcon name={TYPE_ICON[issue.type]} size={13} />
              <span className={styles.key}>{issueKey(issue)}</span>
              <span className={styles.title}>{issue.title}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
