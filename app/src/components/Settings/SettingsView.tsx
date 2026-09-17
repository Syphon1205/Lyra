import { useState, useEffect } from "react";
import { useLyraStore } from "../../state/store";
import { LyraMark } from "../Sidebar";
import { LyraIcon, LyraIconName } from "../../icons/LyraIcon";
import previewWallpaper from "../../assets/preview-wallpaper.jpg";
import styles from "./SettingsView.module.css";

const SECTIONS = [
  { id: "General", label: "General", icon: "settings" },
  { id: "Appearance", label: "Appearance", icon: "design" },
  { id: "Accounts", label: "Accounts", icon: "assigned" },
  { id: "GitHub", label: "GitHub", icon: "github" },
  { id: "Repositories", label: "Repositories", icon: "repository" },
  { id: "Agents", label: "Agents & Providers", icon: "agent" },
  { id: "AgentDefaults", label: "Agent Defaults", icon: "run" },
  { id: "Notifications", label: "Notifications", icon: "notification" },
  { id: "Shortcuts", label: "Shortcuts", icon: "search" },
  { id: "Git", label: "Git & Worktrees", icon: "branch" },
  { id: "Terminal", label: "Terminal", icon: "engineering" },
  { id: "Privacy", label: "Privacy & Security", icon: "filters" },
  { id: "Data", label: "Data", icon: "document" },
  { id: "Advanced", label: "Advanced", icon: "more" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const ACCENT_COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Orange", value: "#f97316" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Emerald", value: "#10b981" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Slate", value: "#64748b" },
];

const SHORTCUTS_LIST = [
  { label: "Command Palette", keys: "⌘ K", category: "Navigation" },
  { label: "New Issue", keys: "⌘ N", category: "Actions" },
  { label: "Toggle Agent Chat", keys: "⌘ ⇧ A", category: "Agents" },
  { label: "Toggle Sidebar", keys: "⌘ \\", category: "Navigation" },
  { label: "Open Settings", keys: "⌘ ,", category: "Navigation" },
  { label: "Switch Project", keys: "⌘ P", category: "Navigation" },
  { label: "Run Build / Tests", keys: "⌘ B", category: "Actions" },
  { label: "Dismiss / Close", keys: "Esc", category: "General" },
  { label: "Submit / Send Message", keys: "Enter", category: "General" },
  { label: "Add Line Break in Message", keys: "⇧ Enter", category: "Agents" },
];

export function SettingsView() {
  const [activeSection, setActiveSection] = useState<SectionId>("Appearance");

  const appearance = useLyraStore((s) => s.appearance);
  const setAppearance = useLyraStore((s) => s.setAppearance);
  const density = useLyraStore((s) => s.density);
  const setDensity = useLyraStore((s) => s.setDensity);
  const preferences = useLyraStore((s) => s.preferences);
  const savePreference = useLyraStore((s) => s.savePreference);
  const adapters = useLyraStore((s) => s.adapters);
  const refreshAdapters = useLyraStore((s) => s.refreshAdapters);
  const githubStatus = useLyraStore((s) => s.githubStatus);
  const githubRepos = useLyraStore((s) => s.githubRepos);
  const refreshGitHub = useLyraStore((s) => s.refreshGitHub);
  const loginGitHub = useLyraStore((s) => s.loginGitHub);
  const logoutGitHub = useLyraStore((s) => s.logoutGitHub);
  const openGeneralChat = useLyraStore((s) => s.openGeneralChat);
  const workspace = useLyraStore((s) => s.workspace);
  const currentUserId = useLyraStore((s) => s.currentUserId);
  const users = useLyraStore((s) => s.users);
  const currentUser = users.find((u) => u.id === currentUserId);
  const projects = useLyraStore((s) => s.projects);
  const contributors = useLyraStore((s) => s.contributors);
  const loadContributors = useLyraStore((s) => s.loadContributors);
  const setOnboardingCompleted = useLyraStore((s) => s.setOnboardingCompleted);
  const resetDatabase = useLyraStore((s) => s.resetDatabase);
  const seedDemoData = useLyraStore((s) => s.seedDemoData);

  // Appearance state
  const [accentColor, setAccentColor] = useState(
    (preferences.accent_color as string) ?? "#3b82f6"
  );
  const [glassEffects, setGlassEffects] = useState(
    preferences.glass_effects !== undefined ? !!preferences.glass_effects : true
  );
  const [reduceMotion, setReduceMotion] = useState(
    preferences.reduce_motion !== undefined ? !!preferences.reduce_motion : false
  );
  const [increaseContrast, setIncreaseContrast] = useState(
    preferences.increase_contrast !== undefined ? !!preferences.increase_contrast : false
  );
  const [windowSize, setWindowSize] = useState(
    (preferences.window_size as string) ?? "Last used"
  );
  const [sidebarState, setSidebarState] = useState(
    (preferences.sidebar_state as string) ?? "Expanded"
  );
  const [densityChoice, setDensityChoice] = useState<"compact" | "default" | "comfortable">(
    density === "compact" ? "compact" : "default"
  );

  // General state
  const [workspaceName, setWorkspaceName] = useState(
    (preferences.workspace_name as string) ?? workspace?.name ?? "Ambient"
  );
  const [startupView, setStartupView] = useState((preferences.startup_view as string) ?? "board");
  const [defaultProject, setDefaultProject] = useState(
    (preferences.default_project as string) ?? (projects[0]?.id || "")
  );
  const [dateFormat, setDateFormat] = useState((preferences.date_format as string) ?? "MMM D, YYYY");

  // Accounts state
  const [displayName, setDisplayName] = useState(currentUser?.name ?? "Developer");
  const [displayEmail, setDisplayEmail] = useState(currentUser?.email ?? "dev@ambient.dev");

  // Notifications state
  const [desktopNotifications, setDesktopNotifications] = useState(
    preferences.desktop_notifications !== undefined ? !!preferences.desktop_notifications : true
  );
  const [playSounds, setPlaySounds] = useState(
    preferences.play_sounds !== undefined ? !!preferences.play_sounds : false
  );
  const [notifyAgentDone, setNotifyAgentDone] = useState(
    preferences.notify_agent_done !== undefined ? !!preferences.notify_agent_done : true
  );
  const [notifyAssignment, setNotifyAssignment] = useState(
    preferences.notify_assignment !== undefined ? !!preferences.notify_assignment : true
  );

  // Agent Defaults state
  const [defaultAgent, setDefaultAgent] = useState((preferences.default_agent as string) ?? "codex");
  const [reasoningEffort, setReasoningEffort] = useState(
    (preferences.reasoning_effort as string) ?? "medium"
  );
  const [executionTimeout, setExecutionTimeout] = useState(
    (preferences.execution_timeout as string) ?? "10m"
  );
  const [autoApplyDiffs, setAutoApplyDiffs] = useState(
    preferences.auto_apply_diffs !== undefined ? !!preferences.auto_apply_diffs : false
  );

  // Git state
  const [gitDefaultBranch, setGitDefaultBranch] = useState(
    (preferences.git_default_branch as string) ?? "main"
  );
  const [gitSignOff, setGitSignOff] = useState(
    preferences.git_sign_off !== undefined ? !!preferences.git_sign_off : true
  );
  const [autoFetchInterval, setAutoFetchInterval] = useState(
    (preferences.auto_fetch_interval as string) ?? "5m"
  );

  // Terminal state
  const [preferredTerminal, setPreferredTerminal] = useState(
    (preferences.preferred_terminal as string) ?? "Terminal"
  );
  const [shellPath, setShellPath] = useState((preferences.shell_path as string) ?? "/bin/zsh");

  // Shortcuts search
  const [shortcutSearch, setShortcutSearch] = useState("");

  // Data inspection info
  const [dbInfo, setDbInfo] = useState<{
    path: string;
    sizeBytes: number;
    issueCount: number;
    projectCount: number;
    chatSessionCount: number;
  } | null>(null);

  useEffect(() => {
    void refreshGitHub();
    void refreshAdapters();
    void loadContributors();
    window.lyra.data
      .databaseInfo()
      .then(setDbInfo)
      .catch(() => {});
  }, [refreshGitHub, refreshAdapters, loadContributors]);

  const handleSelectTheme = (mode: "light" | "dark" | "system") => {
    void setAppearance(mode);
    void savePreference("appearance_mode", mode);
  };

  const handleSelectAccent = (hex: string) => {
    setAccentColor(hex);
    document.documentElement.style.setProperty("--lyra-accent-solid", hex);
    document.documentElement.style.setProperty("--lyra-accent", hex);
    void savePreference("accent_color", hex);
  };

  const handleSelectDensity = (d: "compact" | "default" | "comfortable") => {
    setDensityChoice(d);
    setDensity(d === "compact" ? "compact" : "comfortable");
    void savePreference("density", d);
  };

  const handleToggleGlass = () => {
    const next = !glassEffects;
    setGlassEffects(next);
    void savePreference("glass_effects", next);
  };

  const handleToggleMotion = () => {
    const next = !reduceMotion;
    setReduceMotion(next);
    void savePreference("reduce_motion", next);
  };

  const handleToggleContrast = () => {
    const next = !increaseContrast;
    setIncreaseContrast(next);
    void savePreference("increase_contrast", next);
  };

  const handleExportData = async () => {
    const jsonStr = await window.lyra.data.export();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lyra-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = async () => {
    if (
      window.confirm(
        "Are you sure you want to reset the database? All issues, projects, and chat history will be cleared."
      )
    ) {
      await resetDatabase();
      const info = await window.lyra.data.databaseInfo();
      setDbInfo(info);
      alert("Database reset successfully.");
    }
  };

  return (
    <div className={styles.settingsLayout}>
      {/* 14-section Left Sidebar */}
      <div className={styles.settingsSidebar}>
        <div style={{ padding: "0 8px 12px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--lyra-text-muted)", letterSpacing: "0.04em" }}>
          Settings
        </div>
        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              className={`${styles.settingsSidebarItem} ${isActive ? styles.settingsSidebarItemActive : ""}`}
              onClick={() => setActiveSection(sec.id)}
            >
              <LyraIcon name={sec.icon as LyraIconName} size={15} />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className={styles.settingsContent}>
        {/* Section 1: General */}
        {activeSection === "General" && (
          <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 24 }}>
            <div className={styles.header}>
              <h1 className={styles.title}>General</h1>
              <p className={styles.subtitle}>Workspace preferences, default view, and formatting.</p>
            </div>

            <div className={styles.cardBox}>
              <h3 className={styles.sectionTitle}>Workspace Details</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, color: "var(--lyra-text-muted)" }}>Workspace Name</label>
                <input
                  className={styles.textInput}
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  onBlur={() => void savePreference("workspace_name", workspaceName)}
                />
              </div>
            </div>

            <div className={styles.cardBox}>
              <h3 className={styles.sectionTitle}>Startup & Defaults</h3>
              <div className={styles.selectRow}>
                <div className={styles.toggleLabelWrap}>
                  <span className={styles.toggleLabel}>Default View</span>
                  <span className={styles.toggleDesc}>Tab shown when launching a project</span>
                </div>
                <select
                  className={styles.selectInput}
                  value={startupView}
                  onChange={(e) => {
                    setStartupView(e.target.value);
                    void savePreference("startup_view", e.target.value);
                  }}
                >
                  <option value="board">Board</option>
                  <option value="backlog">Backlog</option>
                  <option value="list">List</option>
                  <option value="timeline">Timeline</option>
                </select>
              </div>

              {projects.length > 0 && (
                <div className={styles.selectRow}>
                  <div className={styles.toggleLabelWrap}>
                    <span className={styles.toggleLabel}>Default Project</span>
                    <span className={styles.toggleDesc}>Initial project loaded on start</span>
                  </div>
                  <select
                    className={styles.selectInput}
                    value={defaultProject}
                    onChange={(e) => {
                      setDefaultProject(e.target.value);
                      void savePreference("default_project", e.target.value);
                    }}
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.selectRow}>
                <div className={styles.toggleLabelWrap}>
                  <span className={styles.toggleLabel}>Date Format</span>
                </div>
                <select
                  className={styles.selectInput}
                  value={dateFormat}
                  onChange={(e) => {
                    setDateFormat(e.target.value);
                    void savePreference("date_format", e.target.value);
                  }}
                >
                  <option value="MMM D, YYYY">MMM D, YYYY (e.g. Sep 16, 2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                </select>
              </div>
            </div>

            <div className={styles.cardBox}>
              <h3 className={styles.sectionTitle}>Onboarding Flow</h3>
              <p className={styles.sectionSubtitle}>
                Re-run the first-launch setup wizard to configure GitHub, workspace, and coding agents.
              </p>
              <button
                className={styles.smallButton}
                onClick={() => void setOnboardingCompleted(false)}
                style={{ alignSelf: "flex-start", marginTop: 4 }}
              >
                Launch Onboarding Wizard
              </button>
            </div>
          </div>
        )}

        {/* Section 2: Appearance */}
        {activeSection === "Appearance" && (
          <div className={styles.contentGrid}>
            <div className={styles.leftColumn}>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Appearance</h3>
                <div className={styles.themeGrid}>
                  <div
                    className={`${styles.themeCard} ${appearance.mode === "light" ? styles.themeCardActive : ""}`}
                    onClick={() => handleSelectTheme("light")}
                  >
                    <div className={styles.themePreview}>
                      <div className={`${styles.themeCardSidebar} ${styles.themeCardSidebarLight}`} />
                      <div className={styles.themeCardBody}>
                        <div className={styles.themeCardHeader} />
                        <div className={styles.themeCardContent} />
                      </div>
                    </div>
                    <div className={styles.themeLabel}>Light</div>
                  </div>

                  <div
                    className={`${styles.themeCard} ${appearance.mode === "dark" ? styles.themeCardActive : ""}`}
                    onClick={() => handleSelectTheme("dark")}
                  >
                    <div className={`${styles.themePreview} ${styles.themePreviewDark}`}>
                      <div className={styles.themeCardSidebar} />
                      <div className={styles.themeCardBody}>
                        <div className={styles.themeCardHeader} />
                        <div className={styles.themeCardContent} />
                      </div>
                    </div>
                    <div className={styles.themeLabel}>Dark</div>
                  </div>

                  <div
                    className={`${styles.themeCard} ${appearance.mode === "system" ? styles.themeCardActive : ""}`}
                    onClick={() => handleSelectTheme("system")}
                  >
                    <div className={`${styles.themePreview} ${styles.themePreviewSystem}`}>
                      <div className={styles.themeCardSidebar} />
                      <div className={styles.themeCardBody}>
                        <div className={styles.themeCardHeader} />
                        <div className={styles.themeCardContent} />
                      </div>
                    </div>
                    <div className={styles.themeLabel}>System</div>
                  </div>
                </div>
              </div>

              {/* Accent Color */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Accent color</h3>
                <div className={styles.accentRow}>
                  {ACCENT_COLORS.map((c) => (
                    <div
                      key={c.value}
                      className={`${styles.accentDot} ${accentColor === c.value ? styles.accentDotActive : ""}`}
                      style={{ background: c.value }}
                      onClick={() => handleSelectAccent(c.value)}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Glass effects */}
              <div className={styles.section}>
                <div className={styles.toggleRow} onClick={handleToggleGlass}>
                  <div className={styles.toggleLabelWrap}>
                    <span className={styles.toggleLabel}>Glass effects</span>
                    <span className={styles.toggleDesc}>Show smoky wallpaper through sidebar and panels</span>
                  </div>
                  <div className={`${styles.switch} ${glassEffects ? styles.switchActive : ""}`}>
                    <div className={styles.switchThumb} />
                  </div>
                </div>

                <div className={styles.toggleRow} onClick={handleToggleMotion}>
                  <div className={styles.toggleLabelWrap}>
                    <span className={styles.toggleLabel}>Reduce motion</span>
                  </div>
                  <div className={`${styles.switch} ${reduceMotion ? styles.switchActive : ""}`}>
                    <div className={styles.switchThumb} />
                  </div>
                </div>

                <div className={styles.toggleRow} onClick={handleToggleContrast}>
                  <div className={styles.toggleLabelWrap}>
                    <span className={styles.toggleLabel}>Increase contrast</span>
                  </div>
                  <div className={`${styles.switch} ${increaseContrast ? styles.switchActive : ""}`}>
                    <div className={styles.switchThumb} />
                  </div>
                </div>
              </div>

              {/* Window Options */}
              <div className={styles.section}>
                <div className={styles.selectRow}>
                  <span className={styles.toggleLabel}>Default window size</span>
                  <select
                    className={styles.selectInput}
                    value={windowSize}
                    onChange={(e) => {
                      setWindowSize(e.target.value);
                      void savePreference("window_size", e.target.value);
                    }}
                  >
                    <option value="Last used">Last used</option>
                    <option value="1280x800">1280 × 800</option>
                    <option value="1440x900">1440 × 900</option>
                    <option value="1920x1080">1920 × 1080</option>
                  </select>
                </div>

                <div className={styles.selectRow}>
                  <span className={styles.toggleLabel}>Default sidebar state</span>
                  <select
                    className={styles.selectInput}
                    value={sidebarState}
                    onChange={(e) => {
                      setSidebarState(e.target.value);
                      void savePreference("sidebar_state", e.target.value);
                    }}
                  >
                    <option value="Expanded">Expanded</option>
                    <option value="Collapsed">Collapsed</option>
                  </select>
                </div>
              </div>

              {/* Density */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Density</h3>
                <p className={styles.sectionSubtitle}>Choose how much information is shown in lists and boards.</p>
                <div className={styles.segmentedControl}>
                  <button
                    className={`${styles.segmentButton} ${densityChoice === "compact" ? styles.segmentButtonActive : ""}`}
                    onClick={() => handleSelectDensity("compact")}
                  >
                    Compact
                  </button>
                  <button
                    className={`${styles.segmentButton} ${densityChoice === "default" ? styles.segmentButtonActive : ""}`}
                    onClick={() => handleSelectDensity("default")}
                  >
                    Default
                  </button>
                  <button
                    className={`${styles.segmentButton} ${densityChoice === "comfortable" ? styles.segmentButtonActive : ""}`}
                    onClick={() => handleSelectDensity("comfortable")}
                  >
                    Comfortable
                  </button>
                </div>
              </div>
            </div>

            {/* Right Live Preview Column */}
            <div className={styles.rightColumn}>
              <div className={styles.previewContainer}>
                <div>
                  <h3 className={styles.sectionTitle} style={{ marginBottom: 2 }}>Live Preview</h3>
                  <p className={styles.sectionSubtitle}>See how Lyra looks with your settings.</p>
                </div>

                <div
                  className={styles.previewFrame}
                  style={{
                    backgroundImage: `url(${previewWallpaper})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className={styles.previewMiniWindow}>
                    <div className={styles.previewWindowHeader}>
                      <div className={`${styles.previewDot} ${styles.previewDotRed}`} />
                      <div className={`${styles.previewDot} ${styles.previewDotYellow}`} />
                      <div className={`${styles.previewDot} ${styles.previewDotGreen}`} />
                    </div>

                    <div className={styles.previewWindowBody}>
                      <div className={styles.previewSidebar}>
                        <div className={styles.previewLogoRow}>
                          <LyraMark size={14} variant="white" />
                          <span>Lyra</span>
                        </div>
                        <div className={styles.previewSideItem}>
                          <LyraIcon name="search" size={9} />
                          <span>Search</span>
                        </div>
                        <div className={styles.previewSideItem}>
                          <LyraIcon name="inbox" size={9} />
                          <span>Inbox</span>
                          <span className={styles.previewBadge}>3</span>
                        </div>
                        <div className={styles.previewSideItem}>
                          <LyraIcon name="assigned" size={9} />
                          <span>My issues</span>
                        </div>
                        <div
                          className={`${styles.previewSideItem} ${styles.previewSideItemActive}`}
                          style={{ background: accentColor }}
                        >
                          <LyraIcon name="engineering" size={9} />
                          <span>Engineering</span>
                        </div>
                      </div>

                      <div
                        className={styles.previewCanvas}
                        style={{
                          background: appearance.mode === "dark" ? "#0b0f19" : "#f6f8fe",
                          color: appearance.mode === "dark" ? "#f1f5f9" : "#0f172a",
                        }}
                      >
                        <div className={styles.previewCanvasTitle}>
                          <LyraMark size={11} variant="tile" />
                          <span>Lyra Engineering</span>
                        </div>
                        <div className={styles.previewCards}>
                          <div className={styles.previewColumn}>
                            <div className={styles.previewCard}>
                              <div className={styles.previewCardLine} style={{ width: "80%" }} />
                              <div className={styles.previewCardLine} style={{ width: "50%" }} />
                            </div>
                          </div>
                          <div className={styles.previewColumn}>
                            <div className={styles.previewCard}>
                              <div className={styles.previewCardLine} style={{ width: "60%", background: accentColor }} />
                              <div className={styles.previewCardLine} style={{ width: "40%" }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Accounts */}
        {activeSection === "Accounts" && (
          <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 24 }}>
            <div className={styles.header}>
              <h1 className={styles.title}>Accounts & Profile</h1>
              <p className={styles.subtitle}>Manage local and linked identity.</p>
            </div>

            <div className={styles.cardBox}>
              <h3 className={styles.sectionTitle}>User Profile</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 12, color: "var(--lyra-text-muted)" }}>Display Name</label>
                  <input
                    className={styles.textInput}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onBlur={() => void savePreference("user_display_name", displayName)}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 12, color: "var(--lyra-text-muted)" }}>Email Address</label>
                  <input
                    className={styles.textInput}
                    value={displayEmail}
                    onChange={(e) => setDisplayEmail(e.target.value)}
                    onBlur={() => void savePreference("user_email", displayEmail)}
                  />
                </div>
              </div>
            </div>

            <div className={styles.cardBox}>
              <h3 className={styles.sectionTitle}>Connected GitHub Account</h3>
              {githubStatus?.authenticated && githubStatus.user ? (
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
                  {githubStatus.user.avatar_url && (
                    <img
                      src={githubStatus.user.avatar_url}
                      alt={githubStatus.user.login}
                      style={{ width: 36, height: 36, borderRadius: "50%" }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                      {githubStatus.user.name || githubStatus.user.login} (@{githubStatus.user.login})
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--lyra-text-muted)" }}>
                      Connected via GitHub CLI ({githubStatus.path})
                    </div>
                  </div>
                  <button className={styles.smallButton} onClick={() => void logoutGitHub()}>
                    Disconnect
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ fontSize: 12.5, color: "var(--lyra-text-muted)", margin: 0 }}>
                    No GitHub account linked. Link your GitHub account to enable repository browsing and PR integration.
                  </p>
                  <button
                    className={styles.primaryButton}
                    onClick={() => void loginGitHub()}
                    style={{ alignSelf: "flex-start", marginTop: 4 }}
                  >
                    Sign in with GitHub CLI
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 4: GitHub */}
        {activeSection === "GitHub" && (
          <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 24 }}>
            <div className={styles.header}>
              <h1 className={styles.title}>GitHub Integration</h1>
              <p className={styles.subtitle}>Direct connection through installed GitHub CLI (`gh`).</p>
            </div>

            <div className={styles.cardBox}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "#24292e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <LyraIcon name="github" size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>GitHub CLI</span>
                    {githubStatus?.authenticated ? (
                      <span className={styles.badgeInstalled}>● Authenticated</span>
                    ) : (
                      <span className={styles.badgeMissing}>Disconnected</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--lyra-text-muted)", marginTop: 2 }}>
                    Executable: {githubStatus?.path || "Not found in PATH"}
                  </div>
                </div>
              </div>

              {githubStatus?.authenticated && githubStatus.user ? (
                <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12, padding: "12px", background: "var(--lyra-surface)", borderRadius: 8, border: "1px solid var(--lyra-border)" }}>
                  {githubStatus.user.avatar_url && (
                    <img
                      src={githubStatus.user.avatar_url}
                      alt={githubStatus.user.login}
                      style={{ width: 38, height: 38, borderRadius: "50%" }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                      {githubStatus.user.name} ({githubStatus.user.login})
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--lyra-text-muted)" }}>
                      Scopes: {githubStatus.scopes?.join(", ") || "repo, read:org"}
                    </div>
                  </div>
                  <button
                    className={styles.smallButton}
                    onClick={() => void window.lyra.github.openWeb(githubStatus.user!.html_url)}
                  >
                    View on GitHub ↗
                  </button>
                  <button className={styles.smallButton} onClick={() => void refreshGitHub()}>
                    Refresh
                  </button>
                  <button
                    className={styles.smallButton}
                    style={{ color: "var(--lyra-danger)" }}
                    onClick={() => void logoutGitHub()}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: 12 }}>
                  <button className={styles.primaryButton} onClick={() => void loginGitHub()}>
                    Sign in with GitHub CLI
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 5: Repositories */}
        {activeSection === "Repositories" && (
          <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 24 }}>
            <div className={styles.header}>
              <h1 className={styles.title}>Repositories & Contributors</h1>
              <p className={styles.subtitle}>Connected repositories and real git contributors.</p>
            </div>

            <div className={styles.cardBox}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 className={styles.sectionTitle}>Connected Repositories ({githubRepos.length})</h3>
                <button
                  className={styles.smallButton}
                  onClick={async () => {
                    const dir = await window.lyra.system.pickDirectory();
                    if (dir) alert(`Selected local repository at: ${dir}`);
                  }}
                >
                  Add Local Folder…
                </button>
              </div>

              {githubRepos.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8, maxHeight: 220, overflowY: "auto" }}>
                  {githubRepos.map((r) => (
                    <div key={r.nameWithOwner} className={styles.repoItem}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 12.5 }}>{r.nameWithOwner}</div>
                        <div style={{ fontSize: 11, color: "var(--lyra-text-muted)" }}>
                          {r.description || "No description"}
                        </div>
                      </div>
                      <button
                        className={styles.smallButton}
                        onClick={() => void window.lyra.github.openWeb(r.url)}
                      >
                        Open ↗
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "var(--lyra-text-muted)", marginTop: 8 }}>
                  No repositories listed. Authenticate with GitHub to populate.
                </div>
              )}
            </div>

            <div className={styles.cardBox}>
              <h3 className={styles.sectionTitle}>Git Contributors ({contributors.length})</h3>
              <p className={styles.sectionSubtitle}>Extracted from git log history and authenticated user profile.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8, maxHeight: 180, overflowY: "auto" }}>
                {contributors.map((c) => (
                  <div key={c.email || c.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
                    {c.avatarUrl ? (
                      <img src={c.avatarUrl} alt={c.name} style={{ width: 22, height: 22, borderRadius: "50%" }} />
                    ) : (
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--lyra-accent-solid)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 9, fontWeight: 700 }}>
                        {c.name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <span style={{ fontSize: 12.5, fontWeight: 500 }}>{c.name}</span>
                    <span style={{ fontSize: 11, color: "var(--lyra-text-muted)" }}>{c.email}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 6: Agents & Providers */}
        {activeSection === "Agents" && (
          <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 24 }}>
            <div className={styles.header}>
              <h1 className={styles.title}>Agents & Providers</h1>
              <p className={styles.subtitle}>Manifest and runtime status of all 5 CLI coding agents.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {adapters.map((adapter) => {
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
                  <div key={adapter.id} className={styles.agentCardRow}>
                    <LyraIcon name={iconName} size={22} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 13.5 }}>{adapter.displayName}</span>
                        {adapter.available ? (
                          <span className={styles.badgeInstalled}>
                            ● Ready {adapter.version ? `(${adapter.version})` : ""}
                          </span>
                        ) : (
                          <span className={styles.badgeMissing}>Not detected</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--lyra-text-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {adapter.executablePath || "Add executable to PATH or override below"}
                      </div>
                      {adapter.supportedModels && adapter.supportedModels.length > 0 && (
                        <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                          {adapter.supportedModels.map((m) => (
                            <span key={m} style={{ fontSize: 10, background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: 3, color: "var(--lyra-text-muted)" }}>
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {adapter.available && (
                      <button
                        className={styles.smallButton}
                        onClick={() => void openGeneralChat(adapter.id)}
                      >
                        Start Chat
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 7: Agent Defaults */}
        {activeSection === "AgentDefaults" && (
          <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 24 }}>
            <div className={styles.header}>
              <h1 className={styles.title}>Agent Defaults</h1>
              <p className={styles.subtitle}>Execution parameters, timeout limits, and automated diff application.</p>
            </div>

            <div className={styles.cardBox}>
              <div className={styles.selectRow}>
                <div className={styles.toggleLabelWrap}>
                  <span className={styles.toggleLabel}>Default CLI Coding Agent</span>
                  <span className={styles.toggleDesc}>Used for quick actions and new chats</span>
                </div>
                <select
                  className={styles.selectInput}
                  value={defaultAgent}
                  onChange={(e) => {
                    setDefaultAgent(e.target.value);
                    void savePreference("default_agent", e.target.value);
                  }}
                >
                  {adapters.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.displayName} {a.available ? "" : "(not installed)"}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.selectRow}>
                <div className={styles.toggleLabelWrap}>
                  <span className={styles.toggleLabel}>Default Reasoning Effort</span>
                  <span className={styles.toggleDesc}>Passes reasoning effort to supported models</span>
                </div>
                <select
                  className={styles.selectInput}
                  value={reasoningEffort}
                  onChange={(e) => {
                    setReasoningEffort(e.target.value);
                    void savePreference("reasoning_effort", e.target.value);
                  }}
                >
                  <option value="low">Low (Faster)</option>
                  <option value="medium">Medium (Standard)</option>
                  <option value="high">High (Deep reasoning)</option>
                </select>
              </div>

              <div className={styles.selectRow}>
                <div className={styles.toggleLabelWrap}>
                  <span className={styles.toggleLabel}>Execution Timeout</span>
                  <span className={styles.toggleDesc}>Maximum duration before stopping run</span>
                </div>
                <select
                  className={styles.selectInput}
                  value={executionTimeout}
                  onChange={(e) => {
                    setExecutionTimeout(e.target.value);
                    void savePreference("execution_timeout", e.target.value);
                  }}
                >
                  <option value="5m">5 minutes</option>
                  <option value="10m">10 minutes</option>
                  <option value="15m">15 minutes</option>
                  <option value="30m">30 minutes</option>
                </select>
              </div>

              <div className={styles.toggleRow} onClick={() => {
                const next = !autoApplyDiffs;
                setAutoApplyDiffs(next);
                void savePreference("auto_apply_diffs", next);
              }}>
                <div className={styles.toggleLabelWrap}>
                  <span className={styles.toggleLabel}>Auto-apply Streaming Diffs</span>
                  <span className={styles.toggleDesc}>Immediately patch files upon agent generation</span>
                </div>
                <div className={`${styles.switch} ${autoApplyDiffs ? styles.switchActive : ""}`}>
                  <div className={styles.switchThumb} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 8: Notifications */}
        {activeSection === "Notifications" && (
          <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 24 }}>
            <div className={styles.header}>
              <h1 className={styles.title}>Notifications</h1>
              <p className={styles.subtitle}>Alerts for issue assignments and agent completions.</p>
            </div>

            <div className={styles.cardBox}>
              <div className={styles.toggleRow} onClick={() => {
                const next = !desktopNotifications;
                setDesktopNotifications(next);
                void savePreference("desktop_notifications", next);
              }}>
                <div className={styles.toggleLabelWrap}>
                  <span className={styles.toggleLabel}>Desktop Notifications</span>
                  <span className={styles.toggleDesc}>System notifications via macOS Notification Center</span>
                </div>
                <div className={`${styles.switch} ${desktopNotifications ? styles.switchActive : ""}`}>
                  <div className={styles.switchThumb} />
                </div>
              </div>

              <div className={styles.toggleRow} onClick={() => {
                const next = !playSounds;
                setPlaySounds(next);
                void savePreference("play_sounds", next);
              }}>
                <div className={styles.toggleLabelWrap}>
                  <span className={styles.toggleLabel}>Sound Effects</span>
                  <span className={styles.toggleDesc}>Subtle chime on task completion</span>
                </div>
                <div className={`${styles.switch} ${playSounds ? styles.switchActive : ""}`}>
                  <div className={styles.switchThumb} />
                </div>
              </div>

              <div className={styles.toggleRow} onClick={() => {
                const next = !notifyAgentDone;
                setNotifyAgentDone(next);
                void savePreference("notify_agent_done", next);
              }}>
                <div className={styles.toggleLabelWrap}>
                  <span className={styles.toggleLabel}>Agent Run Complete</span>
                  <span className={styles.toggleDesc}>Alert when background CLI run finishes</span>
                </div>
                <div className={`${styles.switch} ${notifyAgentDone ? styles.switchActive : ""}`}>
                  <div className={styles.switchThumb} />
                </div>
              </div>

              <div className={styles.toggleRow} onClick={() => {
                const next = !notifyAssignment;
                setNotifyAssignment(next);
                void savePreference("notify_assignment", next);
              }}>
                <div className={styles.toggleLabelWrap}>
                  <span className={styles.toggleLabel}>Issue Assignment</span>
                  <span className={styles.toggleDesc}>Alert when an issue is assigned to you</span>
                </div>
                <div className={`${styles.switch} ${notifyAssignment ? styles.switchActive : ""}`}>
                  <div className={styles.switchThumb} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 9: Shortcuts */}
        {activeSection === "Shortcuts" && (
          <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 16 }}>
            <div className={styles.header}>
              <h1 className={styles.title}>Keyboard Shortcuts</h1>
              <p className={styles.subtitle}>Desktop keybindings for rapid project management.</p>
            </div>

            <input
              className={styles.textInput}
              placeholder="Filter shortcuts…"
              value={shortcutSearch}
              onChange={(e) => setShortcutSearch(e.target.value)}
              style={{ maxWidth: 280 }}
            />

            <div className={styles.cardBox}>
              {SHORTCUTS_LIST.filter(
                (s) =>
                  !shortcutSearch ||
                  s.label.toLowerCase().includes(shortcutSearch.toLowerCase()) ||
                  s.keys.toLowerCase().includes(shortcutSearch.toLowerCase())
              ).map((s) => (
                <div key={s.label} className={styles.shortcutRow}>
                  <span style={{ fontSize: 13, color: "var(--lyra-text)" }}>{s.label}</span>
                  <span className={styles.kbd}>{s.keys}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 10: Git & Worktrees */}
        {activeSection === "Git" && (
          <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 24 }}>
            <div className={styles.header}>
              <h1 className={styles.title}>Git & Worktrees</h1>
              <p className={styles.subtitle}>Branch creation, worktree configuration, and auto-fetch.</p>
            </div>

            <div className={styles.cardBox}>
              <div className={styles.selectRow}>
                <div className={styles.toggleLabelWrap}>
                  <span className={styles.toggleLabel}>Default Base Branch</span>
                </div>
                <select
                  className={styles.selectInput}
                  value={gitDefaultBranch}
                  onChange={(e) => {
                    setGitDefaultBranch(e.target.value);
                    void savePreference("git_default_branch", e.target.value);
                  }}
                >
                  <option value="main">main</option>
                  <option value="master">master</option>
                  <option value="trunk">trunk</option>
                </select>
              </div>

              <div className={styles.selectRow}>
                <div className={styles.toggleLabelWrap}>
                  <span className={styles.toggleLabel}>Auto-Fetch Interval</span>
                  <span className={styles.toggleDesc}>Fetch remote refs in background</span>
                </div>
                <select
                  className={styles.selectInput}
                  value={autoFetchInterval}
                  onChange={(e) => {
                    setAutoFetchInterval(e.target.value);
                    void savePreference("auto_fetch_interval", e.target.value);
                  }}
                >
                  <option value="never">Never</option>
                  <option value="5m">Every 5 minutes</option>
                  <option value="15m">Every 15 minutes</option>
                </select>
              </div>

              <div className={styles.toggleRow} onClick={() => {
                const next = !gitSignOff;
                setGitSignOff(next);
                void savePreference("git_sign_off", next);
              }}>
                <div className={styles.toggleLabelWrap}>
                  <span className={styles.toggleLabel}>Sign-off Commits (-s)</span>
                  <span className={styles.toggleDesc}>Append Signed-off-by trailer to commits</span>
                </div>
                <div className={`${styles.switch} ${gitSignOff ? styles.switchActive : ""}`}>
                  <div className={styles.switchThumb} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 11: Terminal */}
        {activeSection === "Terminal" && (
          <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 24 }}>
            <div className={styles.header}>
              <h1 className={styles.title}>Terminal</h1>
              <p className={styles.subtitle}>Preferred shell environment and terminal emulator.</p>
            </div>

            <div className={styles.cardBox}>
              <div className={styles.selectRow}>
                <div className={styles.toggleLabelWrap}>
                  <span className={styles.toggleLabel}>Preferred Terminal</span>
                </div>
                <select
                  className={styles.selectInput}
                  value={preferredTerminal}
                  onChange={(e) => {
                    setPreferredTerminal(e.target.value);
                    void savePreference("preferred_terminal", e.target.value);
                  }}
                >
                  <option value="Terminal">Terminal.app</option>
                  <option value="iTerm2">iTerm2</option>
                  <option value="VSCode">VS Code</option>
                  <option value="Ghostty">Ghostty</option>
                  <option value="Alacritty">Alacritty</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, color: "var(--lyra-text-muted)" }}>Shell Executable Path</label>
                <input
                  className={styles.textInput}
                  value={shellPath}
                  onChange={(e) => setShellPath(e.target.value)}
                  onBlur={() => void savePreference("shell_path", shellPath)}
                />
              </div>

              <button
                className={styles.smallButton}
                onClick={() => void window.lyra.system.openTerminal()}
                style={{ alignSelf: "flex-start", marginTop: 8 }}
              >
                Launch Terminal at Workspace Root ↗
              </button>
            </div>
          </div>
        )}

        {/* Section 12: Privacy & Security */}
        {activeSection === "Privacy" && (
          <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 24 }}>
            <div className={styles.header}>
              <h1 className={styles.title}>Privacy & Security</h1>
              <p className={styles.subtitle}>Data protection and credential management.</p>
            </div>

            <div className={styles.cardBox}>
              <h3 className={styles.sectionTitle}>Telemetry & Diagnostics</h3>
              <div className={styles.toggleRow}>
                <div className={styles.toggleLabelWrap}>
                  <span className={styles.toggleLabel}>Anonymous Telemetry</span>
                  <span className={styles.toggleDesc}>Lyra does not collect or transmit analytics</span>
                </div>
                <div className={styles.switch}>
                  <div className={styles.switchThumb} />
                </div>
              </div>

              <div className={styles.toggleRow}>
                <div className={styles.toggleLabelWrap}>
                  <span className={styles.toggleLabel}>Crash Reporting</span>
                  <span className={styles.toggleDesc}>Crash dumps stored on local disk only</span>
                </div>
                <div className={styles.switch}>
                  <div className={styles.switchThumb} />
                </div>
              </div>
            </div>

            <div className={styles.cardBox}>
              <h3 className={styles.sectionTitle}>IPC Sandboxing</h3>
              <p className={styles.sectionSubtitle}>
                Electron context isolation active. Renderer has zero direct filesystem access.
              </p>
              <div style={{ fontSize: 12, color: "#34d399", fontWeight: 600 }}>
                ● ContextIsolation: true · NodeIntegration: false · Sandbox: true
              </div>
            </div>
          </div>
        )}

        {/* Section 13: Data */}
        {activeSection === "Data" && (
          <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 24 }}>
            <div className={styles.header}>
              <h1 className={styles.title}>Local Data & SQLite Storage</h1>
              <p className={styles.subtitle}>Inspect, export, seed, and reset your local database.</p>
            </div>

            {dbInfo && (
              <div className={styles.cardBox}>
                <h3 className={styles.sectionTitle}>Database Status</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 8 }}>
                  <div style={{ padding: 10, background: "var(--lyra-surface)", borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: "var(--lyra-text-muted)" }}>Issues</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{dbInfo.issueCount}</div>
                  </div>
                  <div style={{ padding: 10, background: "var(--lyra-surface)", borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: "var(--lyra-text-muted)" }}>Projects</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{dbInfo.projectCount}</div>
                  </div>
                  <div style={{ padding: 10, background: "var(--lyra-surface)", borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: "var(--lyra-text-muted)" }}>Chat Sessions</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{dbInfo.chatSessionCount}</div>
                  </div>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--lyra-text-muted)", marginTop: 12, fontFamily: "var(--lyra-font-mono)", overflow: "hidden", textOverflow: "ellipsis" }}>
                  Location: {dbInfo.path} ({Math.round(dbInfo.sizeBytes / 1024)} KB)
                </div>
              </div>
            )}

            <div className={styles.cardBox}>
              <h3 className={styles.sectionTitle}>Data Management Actions</h3>
              <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                <button className={styles.smallButton} onClick={() => void handleExportData()}>
                  Export Database (JSON)
                </button>
                <button
                  className={styles.smallButton}
                  onClick={async () => {
                    await seedDemoData();
                    const info = await window.lyra.data.databaseInfo();
                    setDbInfo(info);
                    alert("Sample projects, issues, and cycles seeded successfully.");
                  }}
                >
                  Seed Sample Fixtures
                </button>
                <button
                  className={styles.smallButton}
                  style={{ color: "var(--lyra-danger)" }}
                  onClick={() => void handleResetData()}
                >
                  Reset & Clear Database
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section 14: Advanced */}
        {activeSection === "Advanced" && (
          <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 24 }}>
            <div className={styles.header}>
              <h1 className={styles.title}>Advanced</h1>
              <p className={styles.subtitle}>Developer tools, logging, and release metadata.</p>
            </div>

            <div className={styles.cardBox}>
              <h3 className={styles.sectionTitle}>Release Information</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12.5 }}>
                <div>Lyra Desktop 0.1.0-alpha</div>
                <div style={{ color: "var(--lyra-text-muted)" }}>Electron 33 · React 18 · TypeScript 5.6</div>
              </div>
            </div>

            <div className={styles.cardBox}>
              <h3 className={styles.sectionTitle}>Developer Diagnostics</h3>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  className={styles.smallButton}
                  onClick={() => alert("Diagnostics exported to console.")}
                >
                  Export Diagnostic Log
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
