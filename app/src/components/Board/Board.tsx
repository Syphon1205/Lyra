import { BOARD_STATUSES } from "@shared/types";
import { useLyraStore, applyFilters, useActiveFilters } from "../../state/store";
import { Column } from "./Column";
import styles from "./Board.module.css";

export function Board({ projectId }: { projectId: string }) {
  const issues = useLyraStore((s) => s.issues);
  const filters = useActiveFilters();

  const projectIssues = issues.filter((i) => i.projectId === projectId && i.status !== "backlog" && i.status !== "canceled");
  const filtered = applyFilters(projectIssues, filters).sort((a, b) => a.rank - b.rank);

  return (
    <div className={`${styles.board} lyra-scroll`}>
      {BOARD_STATUSES.map((status) => (
        <Column key={status} status={status} issues={filtered.filter((i) => i.status === status)} projectId={projectId} />
      ))}
    </div>
  );
}
