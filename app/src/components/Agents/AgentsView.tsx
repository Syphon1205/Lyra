import { useState } from "react";
import { useLyraStore } from "../../state/store";
import { LyraIcon } from "../../icons/LyraIcon";
import styles from "./AgentsView.module.css";

interface AgentRun {
  id: string;
  agent: string;
  task: string;
  status: "Running" | "Waiting for approval" | "Completed" | "Failed";
  started: string;
  duration: string;
}

const RUNS: AgentRun[] = [
  { id: "1", agent: "Codex", task: "Fix sidebar transition", status: "Running", started: "10:24 AM", duration: "2m 14s" },
  { id: "2", agent: "Astra", task: "Write docs for agent API", status: "Completed", started: "9:41 AM", duration: "4m 32s" },
  { id: "3", agent: "Claude", task: "Refactor database layer", status: "Failed", started: "9:12 AM", duration: "1m 08s" },
  { id: "4", agent: "Codex", task: "Add keyboard shortcuts", status: "Completed", started: "8:03 AM", duration: "3m 21s" },
];

export function AgentsView({
  initialTab = "active",
}: {
  initialTab?: "active" | "recent" | "providers" | "settings" | "runs";
}) {
  const [tab, setTab] = useState<"active" | "recent" | "providers" | "settings">(
    initialTab === "runs" ? "recent" : initialTab
  );
  const [search, setSearch] = useState("");
  const openGeneralChat = useLyraStore((s) => s.openGeneralChat);
  const openChatForIssue = useLyraStore((s) => s.openChatForIssue);
  const issues = useLyraStore((s) => s.issues);

  const issue142 = issues.find((i) => i.identifier.number === 142) ?? issues[0];

  const adapters = useLyraStore((s) => s.adapters);
  const chatSessions = useLyraStore((s) => s.chatSessions);

  const sessionsList = Object.values(chatSessions);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerIconWrap}>
          <LyraIcon name="agent" size={20} />
        </div>
        <div>
          <h1 className={styles.title}>Agents</h1>
          <p className={styles.subtitle}>
            Run, monitor, and manage your AI coding agents.
          </p>
        </div>
        <button
          className={styles.newAgentBtn}
          onClick={() => void openGeneralChat()}
        >
          <LyraIcon name="plus" size={13} style={{ strokeWidth: 2.2 }} />
          <span>New Agent</span>
        </button>
      </div>

      {/* Tabs Bar */}
      <div className={styles.tabsRow}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === "active" ? styles.tabActive : ""}`}
            onClick={() => setTab("active")}
          >
            Active <span className={styles.badge}>{sessionsList.length > 0 ? sessionsList.length : 2}</span>
          </button>
          <button
            className={`${styles.tab} ${tab === "recent" ? styles.tabActive : ""}`}
            onClick={() => setTab("recent")}
          >
            Recent
          </button>
          <button
            className={`${styles.tab} ${tab === "providers" ? styles.tabActive : ""}`}
            onClick={() => setTab("providers")}
          >
            Providers
          </button>
          <button
            className={`${styles.tab} ${tab === "settings" ? styles.tabActive : ""}`}
            onClick={() => setTab("settings")}
          >
            Settings
          </button>
        </div>

        <div className={styles.searchBox}>
          <LyraIcon name="search" size={12} style={{ color: "var(--lyra-text-muted)" }} />
          <input
            placeholder="Search agents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.content}>
        {/* Active Agents Section */}
        <div className={styles.sectionHeader}>Active Sessions</div>
        <div className={styles.cardsGrid}>
          {/* Card 1: Codex CLI / First session */}
          <div className={styles.agentCard}>
            <div className={styles.cardTop}>
              <div className={styles.providerLogo}>
                <LyraIcon name="provider-codex" size={18} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className={styles.agentName}>Codex CLI</span>
                  <span className={styles.statusPillRunning}>
                    <span className={styles.dotGreen} /> Running
                  </span>
                </div>
                <div className={styles.agentDesc}>
                  OpenAI&apos;s coding agent for local development.
                </div>
              </div>
              <span className={styles.elapsed}>12m 34s</span>
            </div>

            <div className={styles.cardTags}>
              <span className={styles.tag}>Local</span>
              <span className={styles.tag}>CLI</span>
            </div>

            <div className={styles.taskBlock}>
              <div className={styles.taskTitle}>Fix sidebar transition</div>
              <div className={styles.taskSub}>
                LYR-142 · lyra · lyr-142-sidebar
              </div>
              <div className={styles.stepList}>
                <div className={styles.stepItemDone}>✓ Inspecting files…</div>
                <div className={styles.stepItemDone}>✓ Editing WorkspaceLayout.tsx</div>
                <div className={styles.stepItemActive}>● Running tests…</div>
                <div className={styles.stepItemPending}>◯ Waiting for approval…</div>
              </div>
            </div>

            <div className={styles.cardActions}>
              <button
                className={styles.viewSessionBtn}
                onClick={() => issue142 && void openChatForIssue(issue142.id)}
              >
                View Session
              </button>
              <button className={styles.cardOutlineBtn} onClick={() => void openGeneralChat("codex")}>
                Configure
              </button>
              <button className={styles.cardIconBtn}>
                <LyraIcon name="overflow" size={14} />
              </button>
            </div>
          </div>

          {/* Card 2: Claude Code */}
          <div className={styles.agentCard}>
            <div className={styles.cardTop}>
              <div className={styles.providerLogo}>
                <LyraIcon name="provider-claude" size={18} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className={styles.agentName}>Claude Code</span>
                  <span className={styles.statusPillIdle}>
                    <span className={styles.dotGray} /> Ready
                  </span>
                </div>
                <div className={styles.agentDesc}>
                  Anthropic&apos;s autonomous coding CLI agent.
                </div>
              </div>
            </div>

            <div className={styles.cardTags}>
              <span className={styles.tag}>Local</span>
              <span className={styles.tag}>CLI</span>
            </div>

            <div className={styles.taskBlock}>
              <div className={styles.taskTitle}>Review persistence architecture</div>
              <div className={styles.taskSub}>
                LYR-106 · lyra · main
              </div>
            </div>

            <div className={styles.cardActions}>
              <button
                className={styles.startBtn}
                onClick={() => void openGeneralChat("claude-code")}
              >
                Start
              </button>
              <button className={styles.cardOutlineBtn} onClick={() => void openGeneralChat("claude-code")}>
                Options ▾
              </button>
            </div>
          </div>
        </div>

        {/* Available Providers Grid */}
        <div className={styles.sectionHeader} style={{ marginTop: 28 }}>Available Providers</div>
        <div className={styles.providersGrid}>
          {adapters.length > 0 ? (
            adapters.map((a) => {
              const iconName =
                a.id === "codex"
                  ? "provider-codex"
                  : a.id === "claude-code"
                    ? "provider-claude"
                    : a.id === "gemini"
                      ? "provider-gemini"
                      : "provider-opencode";
              return (
                <div
                  key={a.id}
                  className={styles.providerItem}
                  onClick={() => a.available && void openGeneralChat(a.id as any)}
                  style={{ cursor: a.available ? "pointer" : "default" }}
                  title={a.executablePath ?? "Not installed"}
                >
                  <LyraIcon name={iconName} size={16} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className={styles.provName}>{a.displayName}</div>
                    <div className={a.available ? styles.provStatusInstalled : styles.provStatusInstall}>
                      {a.available ? "Installed" : "Not found"}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <>
              <div className={styles.providerItem}>
                <LyraIcon name="provider-codex" size={16} />
                <div style={{ minWidth: 0 }}>
                  <div className={styles.provName}>Codex CLI</div>
                  <div className={styles.provStatusInstalled}>Installed</div>
                </div>
              </div>
              <div className={styles.providerItem}>
                <LyraIcon name="provider-claude" size={16} />
                <div style={{ minWidth: 0 }}>
                  <div className={styles.provName}>Claude Code</div>
                  <div className={styles.provStatusInstalled}>Installed</div>
                </div>
              </div>
              <div className={styles.providerItem}>
                <LyraIcon name="provider-gemini" size={16} />
                <div style={{ minWidth: 0 }}>
                  <div className={styles.provName}>Gemini CLI</div>
                  <div className={styles.provStatusInstalled}>Installed</div>
                </div>
              </div>
              <div className={styles.providerItem}>
                <LyraIcon name="provider-opencode" size={16} />
                <div style={{ minWidth: 0 }}>
                  <div className={styles.provName}>OpenCode</div>
                  <div className={styles.provStatusInstalled}>Installed</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Agent Runs Table */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 28 }}>
          <div className={styles.sectionHeader} style={{ margin: 0 }}>Agent Runs</div>
          <span style={{ fontSize: 12, color: "var(--lyra-accent-solid)", cursor: "default" }}>View all runs →</span>
        </div>

        <div className={styles.runsTable}>
          <div className={styles.runsHeader}>
            <span style={{ width: 120 }}>Agent</span>
            <span style={{ flex: 1 }}>Task</span>
            <span style={{ width: 150 }}>Status</span>
            <span style={{ width: 100 }}>Started</span>
            <span style={{ width: 80, textAlign: "right" }}>Duration</span>
          </div>

          {RUNS.map((run) => (
            <div
              key={run.id}
              className={styles.runsRow}
              onClick={() => issue142 && void openChatForIssue(issue142.id)}
            >
              <div style={{ width: 120, display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                <span className={styles.runDot} />
                {run.agent}
              </div>
              <div style={{ flex: 1, fontWeight: 500, color: "var(--lyra-text)" }}>
                {run.task}
              </div>
              <div style={{ width: 150 }}>
                <span
                  className={
                    run.status === "Running"
                      ? styles.badgeRunning
                      : run.status === "Completed"
                        ? styles.badgeCompleted
                        : styles.badgeFailed
                  }
                >
                  {run.status}
                </span>
              </div>
              <div style={{ width: 100, color: "var(--lyra-text-muted)" }}>
                {run.started}
              </div>
              <div style={{ width: 80, textAlign: "right", color: "var(--lyra-text-muted)" }}>
                {run.duration}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
