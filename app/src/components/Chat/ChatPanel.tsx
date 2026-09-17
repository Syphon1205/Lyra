import { useEffect, useRef, useState } from "react";
import { useLyraStore } from "../../state/store";
import { LyraIcon, LyraIconName } from "../../icons/LyraIcon";
import { LyraMark } from "../Sidebar";
import { GlassSurface } from "../GlassSurface";
import { issueKey } from "../../lib/issueMeta";
import type { AgentProviderId } from "@shared/agentEvents";
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
  const adapters = useLyraStore((s) => s.adapters);
  const gitStatus = useLyraStore((s) => s.gitStatus);
  const isCompanionWide = useLyraStore((s) => s.isCompanionWide);
  const toggleCompanionWide = useLyraStore((s) => s.toggleCompanionWide);
  const closeCompanionPanel = useLyraStore((s) => s.closeCompanionPanel);
  const detachChat = useLyraStore((s) => s.detachChat);
  const sendChatMessage = useLyraStore((s) => s.sendChatMessage);
  const cancelChatRun = useLyraStore((s) => s.cancelChatRun);
  const refreshSession = useLyraStore((s) => s.refreshSession);
  const activeChatOptions = useLyraStore((s) => s.activeChatOptions);
  const setActiveChatOptions = useLyraStore((s) => s.setActiveChatOptions);
  const bottomPane = useLyraStore((s) => s.bottomPane);
  const toggleBottomPane = useLyraStore((s) => s.toggleBottomPane);

  const [draft, setDraft] = useState(session?.draft ?? "");
  const [showContextPicker, setShowContextPicker] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const activeProvider = (activeChatOptions.providerId ?? session?.providerId ?? "codex") as AgentProviderId;

  useEffect(() => {
    void refreshSession(sessionId);
    (window as any).__setChatTab = (tab: "chat" | "diff" | "files" | "terminal" | "tests") => {
      if (tab === "chat") useLyraStore.getState().closeBottomPane();
      else useLyraStore.getState().openBottomPane(tab);
    };
    return () => {
      delete (window as any).__setChatTab;
    };
  }, [sessionId, refreshSession]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [session?.messages.length, session?.isRunning]);

  if (!session) return null;

  const currentAdapter = adapters.find((a) => a.id === activeProvider) ?? adapters[0];

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || session.isRunning) return;
    void sendChatMessage(sessionId, trimmed, {
      ...activeChatOptions,
      providerId: activeProvider,
    });
    setDraft("");
  };

  const handleSelectProvider = (providerId: AgentProviderId) => {
    const targetAdapter = adapters.find((a) => a.id === providerId);
    const defaultModel = targetAdapter?.supportedModels?.[0];
    setActiveChatOptions({
      providerId,
      model: defaultModel,
    });
  };

  const promptSuggestions = [
    issue
      ? `Analyze requirements for ${issueKey(issue)}: "${issue.title}"`
      : "Inspect working tree diff and recent git commits",
    "Run tests and verify build status",
    "Identify performance bottlenecks in codebase",
    "Generate implementation plan for current sprint",
  ];

  return (
    <GlassSurface variant="dark-chrome" radius={18} className={`${styles.panel} lyra-chrome-scope`}>
      {/* Header Bar */}
      <div className={styles.header}>
        <LyraMark size={16} variant="white" />
        <span className={styles.brandLabel}>
          {currentAdapter?.displayName ?? "Lyra Agent"}
        </span>
        <div className={styles.status}>
          <span className={styles.dot} />
          <span>{session.isRunning ? "Running" : "Online"}</span>
        </div>

        <div className={styles.spacer} />

        {/* Tab switcher buttons in header — these open the resizable workspace bottom pane */}
        <div className={styles.headerTabs}>
          <button
            data-tab="diff"
            className={`${styles.headerTab} ${bottomPane.isOpen && bottomPane.tab === "diff" ? styles.headerTabActive : ""}`}
            onClick={() => toggleBottomPane("diff")}
            title="Open diff in workspace"
          >
            Diff
          </button>
          <button
            data-tab="files"
            className={`${styles.headerTab} ${bottomPane.isOpen && bottomPane.tab === "files" ? styles.headerTabActive : ""}`}
            onClick={() => toggleBottomPane("files")}
            title="Open changed files in workspace"
          >
            Files
          </button>
          <button
            data-tab="terminal"
            className={`${styles.headerTab} ${bottomPane.isOpen && bottomPane.tab === "terminal" ? styles.headerTabActive : ""}`}
            onClick={() => toggleBottomPane("terminal")}
            title="Open terminal in workspace"
          >
            Terminal
          </button>
          <button
            data-tab="tests"
            className={`${styles.headerTab} ${bottomPane.isOpen && bottomPane.tab === "tests" ? styles.headerTabActive : ""}`}
            onClick={() => toggleBottomPane("tests")}
            title="Open tests in workspace"
          >
            Tests
          </button>
        </div>

        {!standalone && (
          <>
            <button
              className={styles.iconButton}
              title={isCompanionWide ? "Restore standard width" : "Expand to wide view"}
              onClick={toggleCompanionWide}
            >
              <LyraIcon name="filters" size={13} />
            </button>
            <button
              className={styles.iconButton}
              title="Detach Window"
              onClick={() => detachChat(sessionId)}
            >
              <LyraIcon name="chevron-right" size={13} />
            </button>
            <button
              className={styles.iconButton}
              title="Close"
              onClick={closeCompanionPanel}
            >
              <LyraIcon name="close" size={13} />
            </button>
          </>
        )}
      </div>

      {/* Dynamic Model Selector Chips */}
      <div className={styles.modelRow} style={{ overflowX: "auto", paddingBottom: 6 }}>
        {adapters.map((adapter) => {
          const isActive = activeProvider === adapter.id;
          const iconName: LyraIconName =
            adapter.id === "codex"
              ? "provider-codex"
              : adapter.id === "claude-code"
              ? "provider-claude"
              : adapter.id === "gemini"
              ? "provider-gemini"
              : adapter.id === "kilo"
              ? "provider-kilo"
              : "provider-opencode";

          return (
            <div
              key={adapter.id}
              className={`${styles.modelChip} ${isActive ? styles.modelChipActive : ""}`}
              onClick={() => handleSelectProvider(adapter.id as AgentProviderId)}
              style={{ opacity: adapter.available ? 1 : 0.5 }}
              title={adapter.available ? adapter.displayName : `${adapter.displayName} (not found in PATH)`}
            >
              <LyraIcon name={iconName} size={13} />
              <span>{adapter.displayName}</span>
            </div>
          );
        })}
      </div>

      {/* Model & Reasoning Sub-Bar if supported */}
      {currentAdapter?.supportedModels && currentAdapter.supportedModels.length > 0 && (
        <div style={{ display: "flex", gap: 6, padding: "0 14px 8px", alignItems: "center", fontSize: 11 }}>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>Model:</span>
          <select
            value={activeChatOptions.model ?? currentAdapter.supportedModels[0]}
            onChange={(e) => setActiveChatOptions({ model: e.target.value })}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "white",
              borderRadius: 4,
              fontSize: 11,
              padding: "2px 6px",
              outline: "none",
            }}
          >
            {currentAdapter.supportedModels.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {currentAdapter.supportedReasoningEfforts && (
            <>
              <span style={{ color: "rgba(255,255,255,0.4)", marginLeft: 6 }}>Reasoning:</span>
              <select
                value={activeChatOptions.reasoningEffort ?? "medium"}
                onChange={(e) => setActiveChatOptions({ reasoningEffort: e.target.value })}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "white",
                  borderRadius: 4,
                  fontSize: 11,
                  padding: "2px 6px",
                  outline: "none",
                }}
              >
                {currentAdapter.supportedReasoningEfforts.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      )}

      {/* Context Box */}
      <div className={styles.context}>
        <div className={styles.contextLabel}>Context</div>
        <div className={styles.contextRow}>
          <span className={styles.contextItemPill}>
            <LyraIcon name="board" size={11} />
            {issue ? `${issueKey(issue)} ${issue.title}` : "General project context"}
          </span>
        </div>
        <div className={styles.contextRow}>
          <LyraIcon name="repository" size={11} />
          <span>Repository {repo?.name || "lyra"}</span>
        </div>
        <div className={styles.contextRow}>
          <LyraIcon name="branch" size={11} />
          <span>Branch {gitStatus?.branch || issue?.linkedBranch || "main"}</span>
        </div>
        <div style={{ position: "relative" }}>
          <button
            className={styles.addContext}
            onClick={() => setShowContextPicker((v) => !v)}
          >
            <LyraIcon name="plus" size={10} />
            Add context
          </button>
          {showContextPicker && (
            <div
              style={{
                position: "absolute",
                top: 24,
                left: 0,
                background: "rgba(20,24,36,0.95)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 8,
                padding: "6px",
                zIndex: 50,
                display: "flex",
                flexDirection: "column",
                gap: 4,
                width: 170,
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              }}
            >
              <button
                onClick={() => {
                  setDraft((d) => `${d} @issue `);
                  setShowContextPicker(false);
                }}
                style={{ background: "none", border: "none", color: "white", fontSize: 11.5, textAlign: "left", padding: "4px 6px", borderRadius: 4, cursor: "pointer" }}
              >
                @issue (Current issue)
              </button>
              <button
                onClick={() => {
                  setDraft((d) => `${d} @branch `);
                  setShowContextPicker(false);
                }}
                style={{ background: "none", border: "none", color: "white", fontSize: 11.5, textAlign: "left", padding: "4px 6px", borderRadius: 4, cursor: "pointer" }}
              >
                @branch (Git branch)
              </button>
              <button
                onClick={() => {
                  setDraft((d) => `${d} @repo `);
                  setShowContextPicker(false);
                }}
                style={{ background: "none", border: "none", color: "white", fontSize: 11.5, textAlign: "left", padding: "4px 6px", borderRadius: 4, cursor: "pointer" }}
              >
                @repo (Repository root)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Message Stream — Diff/Files/Terminal/Tests now live in the resizable workspace bottom pane */}
      <div className={`${styles.messages} lyra-scroll`} ref={listRef}>
          {session.messages.length > 0 ? (
            session.messages.map((m) => (
              <div key={m.id} className={styles.message}>
                <div className={styles.messageHeader}>
                  {m.role === "user" ? (
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
                  ) : (
                    <span style={{ color: "#3b82f6", display: "flex", alignItems: "center" }}>
                      <LyraIcon name="agent" size={14} />
                    </span>
                  )}
                  <span>
                    {m.role === "user" ? "You" : currentAdapter?.displayName ?? "Agent"}
                  </span>
                  <span className={styles.messageTime}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div className={m.role === "user" ? styles.userBubble : styles.agentText}>
                  {m.text}
                </div>

                {m.activity && (
                  <div className={styles.inspectionCard}>
                    <div className={styles.inspectionTitle}>{m.activity.label}</div>
                    {m.activity.detail && (
                      <div className={styles.inspectionItem}>
                        <span className={styles.checkIcon}>✓</span>
                        <span>{m.activity.detail}</span>
                      </div>
                    )}
                  </div>
                )}

                {m.files && m.files.length > 0 && (
                  <div className={styles.changesPill}>
                    <span className={styles.changesCount}>
                      {m.files.length} file{m.files.length > 1 ? "s" : ""} changed
                    </span>
                    <span className={styles.addCount}>
                      +{m.files.reduce((s, f) => s + f.additions, 0)}
                    </span>
                    <span className={styles.delCount}>
                      -{m.files.reduce((s, f) => s + f.deletions, 0)}
                    </span>
                    <button className={styles.reviewButton} onClick={() => toggleBottomPane("diff")}>
                      Review changes
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <LyraMark size={28} variant="tile" />
              <div className={styles.emptyTitle}>
                Collaborate with {currentAdapter?.displayName ?? "AI Agent"}
              </div>
              <div className={styles.emptyDesc}>
                Ask questions, inspect diffs, debug issues, or execute automated tasks in your repository.
              </div>

              <div className={styles.promptChips}>
                {promptSuggestions.map((prompt) => (
                  <div
                    key={prompt}
                    className={styles.promptChip}
                    onClick={() => send(prompt)}
                  >
                    {prompt}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Running indicator */}
          {session.isRunning && (
            <div className={styles.message}>
              <div className={styles.messageHeader}>
                <span style={{ color: "#3b82f6", display: "flex", alignItems: "center" }}>
                  <LyraIcon name="agent" size={14} />
                </span>
                <span>{currentAdapter?.displayName ?? "Agent"}</span>
              </div>
              <div className={styles.agentText} style={{ fontStyle: "italic", opacity: 0.8 }}>
                Running command and inspecting files...
              </div>
            </div>
          )}
        </div>

      {/* Composer Row */}
      <div className={styles.composerWrap}>
        <GlassSurface variant="compact" radius={12} className={styles.composer}>
          <div className={styles.composerRow}>
            <button
              className={styles.iconButton}
              title="Attach Context"
              onClick={() => setShowContextPicker((v) => !v)}
            >
              <LyraIcon name="plus" size={14} />
            </button>
            <textarea
              rows={1}
              placeholder={`Message ${currentAdapter?.displayName ?? "Agent"}…`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send(draft);
                }
              }}
            />
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
