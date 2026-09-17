import { useState, useEffect } from "react";
import { useLyraStore } from "../../state/store";
import { LyraIcon } from "../../icons/LyraIcon";
import { LyraMark } from "../Sidebar";
import type { GitHubRepo } from "@shared/types";
import styles from "./OnboardingView.module.css";

interface OnboardingViewProps {
  onComplete?: () => void;
}

export function OnboardingView({ onComplete }: OnboardingViewProps) {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 6;

  const githubStatus = useLyraStore((s) => s.githubStatus);
  const githubRepos = useLyraStore((s) => s.githubRepos);
  const refreshGitHub = useLyraStore((s) => s.refreshGitHub);
  const loginGitHub = useLyraStore((s) => s.loginGitHub);
  const adapters = useLyraStore((s) => s.adapters);
  const refreshAdapters = useLyraStore((s) => s.refreshAdapters);
  const setOnboardingCompleted = useLyraStore((s) => s.setOnboardingCompleted);
  const savePreference = useLyraStore((s) => s.savePreference);
  const seedDemoData = useLyraStore((s) => s.seedDemoData);

  // Form State
  const [userName, setUserName] = useState("Developer");
  const [userEmail, setUserEmail] = useState("dev@ambient.dev");
  const [userAvatar, setUserAvatar] = useState("");
  const [workspaceName, setWorkspaceName] = useState("Ambient");
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [localRepoPath, setLocalRepoPath] = useState<string>("");
  const [seedSample, setSeedSample] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState("codex");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    void refreshGitHub();
    void refreshAdapters();
  }, [refreshGitHub, refreshAdapters]);

  useEffect(() => {
    if (githubStatus?.authenticated && githubStatus.user) {
      if (githubStatus.user.name) setUserName(githubStatus.user.name);
      if (githubStatus.user.avatar_url) setUserAvatar(githubStatus.user.avatar_url);
    }
  }, [githubStatus]);

  useEffect(() => {
    if (githubRepos.length > 0 && !selectedRepo && githubRepos[0]) {
      setSelectedRepo(githubRepos[0].nameWithOwner);
    }
  }, [githubRepos, selectedRepo]);

  const handleGitHubLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginGitHub();
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handlePickLocalDir = async () => {
    const dir = await window.lyra.system.pickDirectory();
    if (dir) {
      setLocalRepoPath(dir);
    }
  };

  const handleFinish = async () => {
    await savePreference("workspace_name", workspaceName);
    await savePreference("default_agent", selectedAgent);
    if (seedSample) {
      await seedDemoData({
        name: userName,
        email: userEmail,
        avatarUrl: userAvatar || undefined,
        username: githubStatus?.user?.login || "dev",
      });
    }
    await setOnboardingCompleted(true);
    onComplete?.();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header with Step Dots */}
        <div className={styles.header}>
          <div className={styles.stepIndicator}>
            {Array.from({ length: totalSteps }).map((_, idx) => {
              const sNum = idx + 1;
              const isCurrent = sNum === step;
              const isPast = sNum < step;
              return (
                <div
                  key={sNum}
                  className={`${styles.stepDot} ${isCurrent ? styles.stepDotActive : ""} ${isPast ? styles.stepDotDone : ""}`}
                />
              );
            })}
          </div>
          <span className={styles.stepNumber}>
            Step {step} of {totalSteps}
          </span>
        </div>

        {/* Content Body per Step */}
        <div className={styles.content}>
          {step === 1 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <LyraMark size={32} variant="tile" />
                <h2 className={styles.title} style={{ margin: 0, fontSize: 24 }}>
                  Welcome to Lyra
                </h2>
              </div>
              <p className={styles.subtitle}>
                The reference-grade project management application for software engineers and autonomous AI coding agents.
              </p>

              <div className={styles.featureList}>
                <div className={styles.featureItem}>
                  <div style={{ color: "var(--lyra-accent-solid, #3b82f6)", marginTop: 1 }}>
                    <LyraIcon name="board" size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>Local-First Board & Issue Tracking</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                      Lightning-fast SQLite WAL storage with zero network latency and undo support.
                    </div>
                  </div>
                </div>

                <div className={styles.featureItem}>
                  <div style={{ color: "var(--lyra-accent-solid, #3b82f6)", marginTop: 1 }}>
                    <LyraIcon name="agent" size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>First-Class AI Coding Agents</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                      Headless execution for Codex, Claude Code, Gemini, OpenCode, and Kilo CLI with streaming diff review.
                    </div>
                  </div>
                </div>

                <div className={styles.featureItem}>
                  <div style={{ color: "var(--lyra-accent-solid, #3b82f6)", marginTop: 1 }}>
                    <LyraIcon name="github" size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>GitHub CLI Backbone</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                      Direct integration with local `gh` auth — no personal access tokens required.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className={styles.title}>GitHub Authentication</h2>
              <p className={styles.subtitle}>
                Lyra uses your local GitHub CLI (`gh`) to list repositories, fetch pull requests, and commit changes securely.
              </p>

              {githubStatus?.authenticated && githubStatus.user ? (
                <div>
                  <div className={styles.userCard}>
                    {githubStatus.user.avatar_url ? (
                      <img
                        src={githubStatus.user.avatar_url}
                        alt={githubStatus.user.login}
                        className={styles.userAvatar}
                      />
                    ) : (
                      <div className={styles.userAvatarFallback}>
                        {githubStatus.user.login.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {githubStatus.user.name || githubStatus.user.login}
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                        @{githubStatus.user.login} · Connected via {githubStatus.path || "gh"}
                      </div>
                      <div style={{ fontSize: 11, color: "#34d399", marginTop: 4, fontWeight: 500 }}>
                        ● Authenticated & Ready
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                    You can switch accounts or sign out at any time in Settings.
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ padding: "16px", background: "rgba(255,255,255,0.04)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                      {githubStatus?.installed ? "GitHub CLI Detected" : "GitHub CLI Not Found"}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                      {githubStatus?.installed
                        ? `Found gh at ${githubStatus.path}. Sign in with one click to connect your GitHub account.`
                        : "Install GitHub CLI (`brew install gh`) to link repositories and pull requests."}
                    </div>
                  </div>

                  {githubStatus?.installed && (
                    <button
                      className={styles.btnPrimary}
                      onClick={() => void handleGitHubLogin()}
                      disabled={isLoggingIn}
                      style={{ width: "100%", justifyContent: "center", height: 40 }}
                    >
                      <LyraIcon name="github" size={16} />
                      {isLoggingIn ? "Waiting for GitHub login..." : "Sign in with GitHub CLI"}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className={styles.title}>Workspace & Profile</h2>
              <p className={styles.subtitle}>Configure your team workspace name and display profile.</p>

              <div className={styles.formGroup}>
                <label className={styles.label}>Workspace Name</label>
                <input
                  className={styles.input}
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Ambient, Personal, Acme Corp"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Your Name</label>
                <input
                  className={styles.input}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Tanner Davidson"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  className={styles.input}
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="e.g. dev@ambient.dev"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className={styles.title}>Connect Repository</h2>
              <p className={styles.subtitle}>Select a GitHub repository or choose a local directory to work in.</p>

              {githubRepos.length > 0 && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Select GitHub Repository</label>
                  <select
                    className={styles.input}
                    value={selectedRepo}
                    onChange={(e) => setSelectedRepo(e.target.value)}
                  >
                    {githubRepos.map((r: GitHubRepo) => (
                      <option key={r.nameWithOwner} value={r.nameWithOwner}>
                        {r.nameWithOwner}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label}>Local Folder / Worktree</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className={styles.input}
                    style={{ flex: 1 }}
                    value={localRepoPath}
                    placeholder="e.g. /Users/tannerdavidson/Desktop/Lyra"
                    readOnly
                  />
                  <button className={styles.btnSecondary} onClick={() => void handlePickLocalDir()}>
                    Browse…
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
                <input
                  type="checkbox"
                  id="seedSample"
                  checked={seedSample}
                  onChange={(e) => setSeedSample(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: "var(--lyra-accent-solid, #3b82f6)" }}
                />
                <label htmlFor="seedSample" style={{ fontSize: 13, cursor: "pointer" }}>
                  Seed sample projects, sprints, and demo issues for exploration
                </label>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className={styles.title}>Coding Agents & Providers</h2>
              <p className={styles.subtitle}>
                Lyra auto-detected installed CLI agents on your machine. Choose your primary coding assistant.
              </p>

              <div className={styles.agentList}>
                {adapters.map((adapter) => {
                  const isSelected = selectedAgent === adapter.id;
                  const iconName =
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
                      className={`${styles.agentCard} ${isSelected ? styles.agentCardSelected : ""}`}
                      onClick={() => setSelectedAgent(adapter.id)}
                    >
                      <LyraIcon name={iconName as any} size={20} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{adapter.displayName}</span>
                          {adapter.version && (
                            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{adapter.version}</span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {adapter.executablePath || "Executable not detected"}
                        </div>
                      </div>
                      {adapter.available ? (
                        <span className={styles.badgeReady}>Ready</span>
                      ) : (
                        <span className={styles.badgeMissing}>Missing</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 700,
                  }}
                >
                  ✓
                </div>
                <h2 className={styles.title} style={{ margin: 0 }}>
                  You're Ready to Build
                </h2>
              </div>
              <p className={styles.subtitle}>
                Your environment is configured and ready. Here is a summary of your workspace:
              </p>

              <div style={{ padding: "16px", background: "rgba(255,255,255,0.04)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "rgba(255,255,255,0.6)" }}>Workspace</span>
                  <span style={{ fontWeight: 600 }}>{workspaceName}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "rgba(255,255,255,0.6)" }}>User Profile</span>
                  <span style={{ fontWeight: 600 }}>{userName}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "rgba(255,255,255,0.6)" }}>GitHub Status</span>
                  <span style={{ fontWeight: 600, color: githubStatus?.authenticated ? "#34d399" : "rgba(255,255,255,0.6)" }}>
                    {githubStatus?.authenticated ? `@${githubStatus.user?.login}` : "Skipped"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "rgba(255,255,255,0.6)" }}>Default Agent</span>
                  <span style={{ fontWeight: 600, textTransform: "capitalize" }}>{selectedAgent}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={styles.footer}>
          {step > 1 ? (
            <button className={styles.btnSecondary} onClick={() => setStep((s) => s - 1)}>
              Back
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {step < totalSteps ? (
              <>
                {step === 2 && !githubStatus?.authenticated && (
                  <button className={styles.btnText} onClick={() => setStep((s) => s + 1)}>
                    Skip for now
                  </button>
                )}
                <button className={styles.btnPrimary} onClick={() => setStep((s) => s + 1)}>
                  Continue
                </button>
              </>
            ) : (
              <button className={styles.btnPrimary} onClick={() => void handleFinish()}>
                Launch Lyra
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
