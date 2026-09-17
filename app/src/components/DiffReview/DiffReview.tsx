import { useState } from "react";
import { LyraIcon } from "../../icons/LyraIcon";
import styles from "./DiffReview.module.css";

interface DiffLine {
  lineNum: number;
  type: "normal" | "removed" | "added";
  code: string;
}

const DIFF_LINES: DiffLine[] = [
  { lineNum: 178, type: "normal", code: "const SidebarView = () => {" },
  { lineNum: 179, type: "normal", code: "  const [isOpen, setIsOpen] = useState(true);" },
  { lineNum: 180, type: "normal", code: "" },
  { lineNum: 181, type: "removed", code: "  useEffect(() => {" },
  { lineNum: 182, type: "removed", code: "    if (isOpen) {" },
  { lineNum: 183, type: "removed", code: "      animateSidebar();" },
  { lineNum: 184, type: "removed", code: "      requestAnimationFrame(() => {" },
  { lineNum: 185, type: "removed", code: "        animateSidebar();" },
  { lineNum: 186, type: "removed", code: "      });" },
  { lineNum: 187, type: "removed", code: "    }" },
  { lineNum: 188, type: "removed", code: "  }, [isOpen]);" },
  { lineNum: 189, type: "normal", code: "" },
  { lineNum: 190, type: "added", code: "  return (" },
  { lineNum: 191, type: "added", code: "    <motion.aside" },
  { lineNum: 192, type: "added", code: '      animate={{ width: isOpen ? "238px" : "0px" }}' },
  { lineNum: 193, type: "added", code: "      initial={false}" },
  { lineNum: 194, type: "added", code: '      transition={{ duration: 0.2, ease: "easeOut" }}' },
  { lineNum: 195, type: "normal", code: "    >" },
];

export function DiffReview({
  onClose,
  onApply,
  onReject,
}: {
  onClose?: () => void;
  onApply?: () => void;
  onReject?: () => void;
}) {
  const [tab, setTab] = useState<"diff" | "files" | "terminal" | "tests">("diff");
  const [applied, setApplied] = useState(false);

  return (
    <div className={styles.container}>
      {/* Top Tabs */}
      <div className={styles.header}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === "diff" ? styles.tabActive : ""}`}
            onClick={() => setTab("diff")}
          >
            Diff
          </button>
          <button
            className={`${styles.tab} ${tab === "files" ? styles.tabActive : ""}`}
            onClick={() => setTab("files")}
          >
            Files
          </button>
          <button
            className={`${styles.tab} ${tab === "terminal" ? styles.tabActive : ""}`}
            onClick={() => setTab("terminal")}
          >
            Terminal
          </button>
          <button
            className={`${styles.tab} ${tab === "tests" ? styles.tabActive : ""}`}
            onClick={() => setTab("tests")}
          >
            Tests
          </button>
        </div>

        {onClose && (
          <button className={styles.closeBtn} onClick={onClose} title="Close Diff">
            <LyraIcon name="close" size={14} />
          </button>
        )}
      </div>

      {/* File Path Header */}
      <div className={styles.fileBar}>
        <LyraIcon name="file" size={14} style={{ color: "var(--lyra-chrome-muted)" }} />
        <span className={styles.fileName}>src/components/SidebarView.tsx</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6, fontSize: 11 }}>
          <span style={{ color: "#10B981", fontWeight: 600 }}>+24</span>
          <span style={{ color: "#EF4444", fontWeight: 600 }}>-8</span>
        </div>
      </div>

      {/* Code Diff Editor Surface */}
      <div className={styles.diffEditor}>
        {DIFF_LINES.map((l, i) => (
          <div
            key={i}
            className={`${styles.diffLine} ${
              l.type === "removed"
                ? styles.lineRemoved
                : l.type === "added"
                  ? styles.lineAdded
                  : styles.lineNormal
            }`}
          >
            <span className={styles.lineNum}>{l.lineNum}</span>
            <span className={styles.lineSign}>
              {l.type === "removed" ? "-" : l.type === "added" ? "+" : " "}
            </span>
            <span className={styles.lineContent}>{l.code}</span>
          </div>
        ))}
      </div>

      {/* Rationale & Actions */}
      <div className={styles.footer}>
        <div className={styles.rationaleBox}>
          Moved animation to container to prevent double transitions.
        </div>

        <div className={styles.actionButtons}>
          <button
            className={styles.rejectBtn}
            onClick={() => {
              onReject?.();
              onClose?.();
            }}
          >
            Reject
          </button>
          <button
            className={styles.applyBtn}
            onClick={() => {
              setApplied(true);
              onApply?.();
            }}
          >
            {applied ? "✓ Applied" : "Apply"}
          </button>
        </div>

        <div className={styles.assistantNote}>
          This should fix the janky transition. The animation is now only applied at the container level.
        </div>
      </div>
    </div>
  );
}
