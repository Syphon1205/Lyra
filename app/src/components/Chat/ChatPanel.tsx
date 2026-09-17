import { useEffect, useRef, useState } from "react";
import { useLyraStore } from "../../state/store";
import { LyraIcon } from "../../icons/LyraIcon";
import { LyraMark } from "../Sidebar";
import { GlassSurface } from "../GlassSurface";
import { DiffReview } from "../DiffReview/DiffReview";
import { issueKey } from "../../lib/issueMeta";
import styles from "./ChatPanel.module.css";

export function ChatPanel({
  sessionId,
  standalone = false,
}: {
  sessionId: string;
  standalone?: boolean;
}) {
  const session = useLyraStore((s) => s.chatSessions[sessionId]);
  const issue = useLyraStore((s) => s.issues.find((i) => i.id === session?.issueId));
  const repositories = useLyraStore((s) => s.repositories);
  const repo = repositories[0];
  const closeCompanionPanel = useLyraStore((s) => s.closeCompanionPanel);
  const detachChat = useLyraStore((s) => s.detachChat);
  const sendChatMessage = useLyraStore((s) => s.sendChatMessage);
  const cancelChatRun = useLyraStore((s) => s.cancelChatRun);
  const refreshSession = useLyraStore((s) => s.refreshSession);

  const [draft, setDraft] = useState(session?.draft ?? "");
  const [selectedModel, setSelectedModel] = useState<"codex" | "astra">("codex");
  const [currentTab, setCurrentTab] = useState<"chat" | "diff" | "files" | "terminal" | "tests">(
    "chat"
  );
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void refreshSession(sessionId);
    (window as any).__setChatTab = setCurrentTab;
    return () => {
      delete (window as any).__setChatTab;
    };
  }, [sessionId, refreshSession]);

  if (!session) return null;

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || session.isRunning) return;
    void sendChatMessage(sessionId, trimmed);
    setDraft("");
  };

  return (
    <GlassSurface variant="dark-chrome" radius={18} className={`${styles.panel} lyra-chrome-scope`}>
      {/* Header Bar */}
      <div className={styles.header}>
        <LyraMark size={16} variant="white" />
        <span className={styles.brandLabel}>Lyra Agent</span>
        <div className={styles.status}>
          <span className={styles.dot} />
          <span>Online</span>
        </div>

        <div className={styles.spacer} />

        {/* Tab switcher buttons in header */}
        <div className={styles.headerTabs}>
          <button
            data-tab="diff"
            className={`${styles.headerTab} ${currentTab === "diff" ? styles.headerTabActive : ""}`}
            onClick={() => setCurrentTab(currentTab === "diff" ? "chat" : "diff")}
          >
            Diff
          </button>
          <button
            className={`${styles.headerTab} ${currentTab === "files" ? styles.headerTabActive : ""}`}
            onClick={() => setCurrentTab(currentTab === "files" ? "chat" : "files")}
          >
            Files
          </button>
          <button
            className={`${styles.headerTab} ${currentTab === "terminal" ? styles.headerTabActive : ""}`}
            onClick={() => setCurrentTab(currentTab === "terminal" ? "chat" : "terminal")}
          >
            Terminal
          </button>
          <button
            className={`${styles.headerTab} ${currentTab === "tests" ? styles.headerTabActive : ""}`}
            onClick={() => setCurrentTab(currentTab === "tests" ? "chat" : "tests")}
          >
            Tests
          </button>
        </div>

        <button className={styles.iconButton} title="More Actions">
          <LyraIcon name="more" size={14} />
        </button>

        {!standalone && (
          <>
            <button className={styles.iconButton} title="Detach Window" onClick={() => detachChat(sessionId)}>
              <LyraIcon name="chevron-right" size={13} />
            </button>
            <button className={styles.iconButton} title="Close" onClick={closeCompanionPanel}>
              <LyraIcon name="close" size={13} />
            </button>
          </>
        )}
      </div>

      {/* Model Selector Chips */}
      <div className={styles.modelRow}>
        <div
          className={`${styles.modelChip} ${selectedModel === "codex" ? styles.modelChipActive : ""}`}
          onClick={() => setSelectedModel("codex")}
        >
          <LyraIcon name="agent" size={13} />
          <span>Codex CLI</span>
          <LyraIcon name="chevron-down" size={11} />
        </div>
        <div
          className={`${styles.modelChip} ${selectedModel === "astra" ? styles.modelChipActive : ""}`}
          onClick={() => setSelectedModel("astra")}
        >
          <span>@ GPT-6 Astra</span>
        </div>
      </div>

      {/* Context Box */}
      <div className={styles.context}>
        <div className={styles.contextLabel}>Context</div>
        <div className={styles.contextRow}>
          <span className={styles.contextItemPill}>
            <LyraIcon name="board" size={11} />
            {issue ? `${issueKey(issue)} ${issue.title}` : "LYR-142 Redesign sidebar navigation"}
          </span>
        </div>
        <div className={styles.contextRow}>
          <LyraIcon name="repository" size={11} />
          <span>Repository {repo?.name || "lyra"}</span>
        </div>
        <div className={styles.contextRow}>
          <LyraIcon name="branch" size={11} />
          <span>Branch {issue?.linkedBranch || "lyr-142-sidebar"}</span>
        </div>
        <button className={styles.addContext}>
          <LyraIcon name="plus" size={10} />
          Add context
        </button>
      </div>

      {/* Main Content Area: Diff View or Messages Stream */}
      {currentTab === "diff" ? (
        <div className={styles.diffContainer}>
          <DiffReview onClose={() => setCurrentTab("chat")} />
        </div>
      ) : (
        <div className={`${styles.messages} lyra-scroll`} ref={listRef}>
          {/* User Message */}
          <div className={styles.message}>
            <div className={styles.messageHeader}>
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #4f46e5, #3b82f6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 8,
                  color: "white",
                  fontWeight: 700,
                }}
              >
                U
              </div>
              <span>You</span>
              <span className={styles.messageTime}>10:24 AM</span>
            </div>
            <div className={styles.userBubble}>
              Can you take a look at the sidebar animation when switching projects? It feels janky,
              especially on slower machines.
            </div>
          </div>

          {/* Codex Message 1 */}
          <div className={styles.message}>
            <div className={styles.messageHeader}>
              <span style={{ color: "#3b82f6", display: "flex", alignItems: "center" }}>
                <LyraIcon name="agent" size={14} />
              </span>
              <span>Codex</span>
              <span className={styles.messageTime}>10:24 AM</span>
            </div>
            <div className={styles.agentText}>
              {"I'll take a look at the sidebar transition and see what might be causing the stutter.\n\nI'm going to inspect:\n• SidebarView.tsx\n• WorkspaceLayout.tsx\n• transition.ts\n\nI'll also check for unnecessary re-renders and layout shifts."}
            </div>

            {/* Inspection Checklist */}
            <div className={styles.inspectionCard}>
              <div className={styles.inspectionTitle}>Inspecting files...</div>
              <div className={styles.inspectionItem}>
                <span className={styles.checkIcon}>✓</span>
                <span>SidebarView.tsx</span>
              </div>
              <div className={styles.inspectionItem}>
                <span className={styles.checkIcon}>✓</span>
                <span>WorkspaceLayout.tsx</span>
              </div>
              <div className={styles.inspectionItem}>
                <span className={styles.checkIcon}>✓</span>
                <span>transition.ts</span>
              </div>
            </div>
          </div>

          {/* Codex Message 2 */}
          <div className={styles.message}>
            <div className={styles.messageHeader}>
              <span style={{ color: "#3b82f6", display: "flex", alignItems: "center" }}>
                <LyraIcon name="agent" size={14} />
              </span>
              <span>Codex</span>
              <span className={styles.messageTime}>10:26 AM</span>
            </div>
            <div className={styles.agentText}>
              I found the issue. The animation is being triggered at two levels in the view
              hierarchy. I can fix this by moving the animation to the container and using a single
              matchedGeometry...
            </div>

            {/* Changes Pill */}
            <div className={styles.changesPill}>
              <span className={styles.changesCount}>3 files changed</span>
              <span className={styles.addCount}>+24</span>
              <span className={styles.delCount}>-8</span>
              <button className={styles.reviewButton} onClick={() => setCurrentTab("diff")}>
                Review changes
              </button>
            </div>
          </div>

          {/* Any additional runtime session messages */}
          {session.messages.slice(2).map((m) => (
            <div key={m.id} className={styles.message}>
              <div className={styles.messageHeader}>
                <span>{m.role === "user" ? "You" : "Codex"}</span>
              </div>
              <div className={m.role === "user" ? styles.userBubble : styles.agentText}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Composer Row */}
      <div className={styles.composerWrap}>
        <GlassSurface variant="compact" radius={12} className={styles.composer}>
          <div className={styles.composerRow}>
            <button className={styles.iconButton} title="Attach Context">
              <LyraIcon name="plus" size={14} />
            </button>
            <textarea
              rows={1}
              placeholder="Message Codex..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send(draft);
                }
              }}
            />
            <button className={styles.iconButton} title="Dictate">
              <LyraIcon name="explore" size={13} />
            </button>
            <button
              className={styles.sendPillButton}
              disabled={!draft.trim() && !session.isRunning}
              onClick={() => (session.isRunning ? void cancelChatRun(sessionId) : send(draft))}
            >
              <LyraIcon name="chevron-right" size={12} style={{ transform: "rotate(-90deg)" }} />
            </button>
          </div>
        </GlassSurface>
      </div>
    </GlassSurface>
  );
}
