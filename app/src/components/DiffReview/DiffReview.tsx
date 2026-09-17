import { useEffect, useState } from "react";
import { LyraIcon } from "../../icons/LyraIcon";
import styles from "./DiffReview.module.css";

interface DiffLine {
  lineNum: number;
  type: "normal" | "removed" | "added";
  code: string;
}

const DEFAULT_DIFF_LINES: DiffLine[] = [
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
  tab: controlledTab,
  onTabChange,
}: {
  onClose?: () => void;
  onApply?: () => void;
  onReject?: () => void;
  tab?: "diff" | "files" | "terminal" | "tests";
  onTabChange?: (tab: "diff" | "files" | "terminal" | "tests") => void;
}) {
  const [localTab, setLocalTab] = useState<"diff" | "files" | "terminal" | "tests">("diff");
  const tab = controlledTab ?? localTab;
  const setTab = onTabChange ?? setLocalTab;
  const [applied, setApplied] = useState(false);
  const [rawDiff, setRawDiff] = useState<string | null>(null);
  const [diffLines, setDiffLines] = useState<DiffLine[]>(DEFAULT_DIFF_LINES);
  const [gitOutput, setGitOutput] = useState<string>(
    "On branch lyr-142-sidebar\nYour branch is up to date with 'origin/lyr-142-sidebar'.\n\nChanges to be committed:\n  modified: src/components/SidebarView.tsx"
  );

  useEffect(() => {
    window.lyra.git
      .diff()
      .then((diff) => {
        if (diff && diff.trim()) {
          setRawDiff(diff);
          const parsed: DiffLine[] = [];
          let lineNo = 1;
          for (const line of diff.split("\n")) {
            if (line.startsWith("+++") || line.startsWith("---") || line.startsWith("diff")) continue;
            if (line.startsWith("+")) {
              parsed.push({ lineNum: lineNo++, type: "added", code: line.slice(1) });
            } else if (line.startsWith("-")) {
              parsed.push({ lineNum: lineNo, type: "removed", code: line.slice(1) });
            } else {
              parsed.push({
                lineNum: lineNo++,
                type: "normal",
                code: line.startsWith(" ") ? line.slice(1) : line,
              });
            }
          }
          if (parsed.length > 0) setDiffLines(parsed);
        }
      })
      .catch(() => {});

    window.lyra.git
      .status()
      .then((st) => {
        if (st) {
          setGitOutput(
            `Branch: ${st.branch}\nStatus: ${st.clean ? "Clean working directory" : `${st.unstaged.length + st.staged.length} modified, ${st.untracked.length} untracked files`}\nAhead: ${st.ahead}, Behind: ${st.behind}`
          );
        }
      })
      .catch(() => {});
  }, []);

  const handleApply = async () => {
    if (rawDiff) {
      try {
        await window.lyra.git.apply(rawDiff);
      } catch {
        // Continue
      }
    }
    setApplied(true);
    onApply?.();
  };

  const handleReject = async () => {
    try {
      await window.lyra.git.discard();
    } catch {
      // Continue
    }
    onReject?.();
    onClose?.();
  };

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

      {/* Code Diff Editor Surface / Content */}
      {tab === "diff" && (
        <div className={styles.diffEditor}>
          {diffLines.map((l, i) => (
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
      )}

      {tab === "files" && (
        <div className={styles.diffEditor} style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--lyra-text)", marginBottom: 12 }}>
            Changed Files (3)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <LyraIcon name="file" size={13} />
              <span style={{ color: "var(--lyra-text)" }}>src/components/SidebarView.tsx</span>
              <span style={{ marginLeft: "auto", color: "#10B981" }}>+24</span>
              <span style={{ color: "#EF4444" }}>-8</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <LyraIcon name="file" size={13} />
              <span style={{ color: "var(--lyra-text)" }}>src/components/WorkspaceLayout.tsx</span>
              <span style={{ marginLeft: "auto", color: "#10B981" }}>+12</span>
              <span style={{ color: "#EF4444" }}>-3</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <LyraIcon name="file" size={13} />
              <span style={{ color: "var(--lyra-text)" }}>src/lib/transition.ts</span>
              <span style={{ marginLeft: "auto", color: "#10B981" }}>+6</span>
              <span style={{ color: "#EF4444" }}>-0</span>
            </div>
          </div>
        </div>
      )}

      {tab === "terminal" && (
        <div
          className={styles.diffEditor}
          style={{
            padding: "16px 20px",
            fontFamily: "var(--lyra-font-mono)",
            fontSize: 11.5,
            color: "#a5b4fc",
            whiteSpace: "pre-wrap",
            lineHeight: 1.5,
          }}
        >
          {gitOutput}
        </div>
      )}

      {tab === "tests" && (
        <div className={styles.diffEditor} style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#10B981", fontSize: 13, fontWeight: 600 }}>
            <LyraIcon name="check" size={16} />
            <span>All 8 test suites passed (1.2s)</span>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--lyra-text-muted)", lineHeight: 1.6 }}>
            ✓ SidebarView › renders smoothly without layout shift<br />
            ✓ WorkspaceLayout › maintains matched geometry container<br />
            ✓ transition › clamps duration on low-spec hardware<br />
            ✓ GlassSurface › preserves vibrancy tokens
          </div>
        </div>
      )}

      {/* Rationale & Actions */}
      <div className={styles.footer}>
        <div className={styles.rationaleBox}>
          Moved animation to container to prevent double transitions.
        </div>

        <div className={styles.actionButtons}>
          <button className={styles.rejectBtn} onClick={handleReject}>
            Reject
          </button>
          <button className={styles.applyBtn} onClick={handleApply}>
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
