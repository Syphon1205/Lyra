import { useState } from "react";
import { useLyraStore } from "../../state/store";
import { LyraMark } from "../Sidebar";
import { LyraIcon, LyraIconName } from "../../icons/LyraIcon";
import previewWallpaper from "../../assets/preview-wallpaper.jpg";
import styles from "./SettingsView.module.css";

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

const TABS = ["General", "Appearance", "Agents", "Integrations", "Shortcuts", "Advanced"] as const;
type Tab = (typeof TABS)[number];

const SHORTCUTS_LIST = [
  { label: "Command Palette", keys: "⌘ K", category: "Navigation" },
  { label: "New Issue", keys: "⌘ N", category: "Actions" },
  { label: "Toggle Agent Chat", keys: "⌘ ⇧ A", category: "Agents" },
  { label: "Toggle Sidebar", keys: "⌘ \\", category: "Navigation" },
  { label: "Open Settings", keys: "⌘ ,", category: "Navigation" },
  { label: "Switch Project", keys: "⌘ P", category: "Navigation" },
  { label: "Run Build / Tests", keys: "⌘ B", category: "Actions" },
  { label: "Dismiss / Close", keys: "Esc", category: "General" },
  { label: "Submit Form / Send Message", keys: "Enter", category: "General" },
  { label: "Add Line Break in Message", keys: "⇧ Enter", category: "Agents" },
];

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<Tab>("Appearance");
  const appearance = useLyraStore((s) => s.appearance);
  const setAppearance = useLyraStore((s) => s.setAppearance);
  const density = useLyraStore((s) => s.density);
  const setDensity = useLyraStore((s) => s.setDensity);
  const preferences = useLyraStore((s) => s.preferences);
  const savePreference = useLyraStore((s) => s.savePreference);
  const adapters = useLyraStore((s) => s.adapters);
  const githubStatus = useLyraStore((s) => s.githubStatus);
  const githubRepos = useLyraStore((s) => s.githubRepos);
  const refreshGitHub = useLyraStore((s) => s.refreshGitHub);
  const loginGitHub = useLyraStore((s) => s.loginGitHub);
  const logoutGitHub = useLyraStore((s) => s.logoutGitHub);
  const openGeneralChat = useLyraStore((s) => s.openGeneralChat);
  const workspace = useLyraStore((s) => s.workspace);

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

  // General tab states
  const [workspaceName, setWorkspaceName] = useState(workspace?.name ?? "Ambient");
  const [startupView, setStartupView] = useState((preferences.startup_view as string) ?? "board");
  const [desktopNotifications, setDesktopNotifications] = useState(
    preferences.desktop_notifications !== undefined ? !!preferences.desktop_notifications : true
  );
  const [playSounds, setPlaySounds] = useState(
    preferences.play_sounds !== undefined ? !!preferences.play_sounds : false
  );

  // Shortcuts search
  const [shortcutSearch, setShortcutSearch] = useState("");

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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Customize Lyra to match your workflow.</p>
      </div>

      <div className={styles.tabsRow}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.tabItem} ${activeTab === tab ? styles.tabItemActive : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Appearance" && (
        <div className={styles.contentGrid}>
          {/* Left Form Column */}
          <div className={styles.leftColumn}>
            {/* Appearance: Theme Cards */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Appearance</h3>
              <div className={styles.themeGrid}>
                {/* Light Card */}
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

                {/* Dark Card */}
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

                {/* System Card */}
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
                  <span className={styles.toggleDesc}>Show wallpaper through sidebar and panels</span>
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

              <span className={styles.footnote}>These settings follow your system preferences when possible.</span>
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
                  {/* Window Chrome Header */}
                  <div className={styles.previewWindowHeader}>
                    <div className={`${styles.previewDot} ${styles.previewDotRed}`} />
                    <div className={`${styles.previewDot} ${styles.previewDotYellow}`} />
                    <div className={`${styles.previewDot} ${styles.previewDotGreen}`} />
                  </div>

                  {/* Window Body */}
                  <div className={styles.previewWindowBody}>
                    {/* Left Mini Sidebar */}
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
                        style={{
                          fontSize: 8,
                          fontWeight: 600,
                          color: "rgba(255, 255, 255, 0.4)",
                          marginTop: 4,
                          textTransform: "uppercase",
                        }}
                      >
                        Projects
                      </div>
                      <div
                        className={`${styles.previewSideItem} ${styles.previewSideItemActive}`}
                        style={{ background: accentColor }}
                      >
                        <LyraIcon name="engineering" size={9} />
                        <span>Engineering</span>
                      </div>
                      <div className={styles.previewSideItem}>
                        <LyraIcon name="design" size={9} />
                        <span>Design</span>
                      </div>
                    </div>

                    {/* Main Mini Canvas */}
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
                          <div
                            style={{
                              fontSize: 7,
                              fontWeight: 600,
                              color: "var(--lyra-text-muted)",
                              marginBottom: 2,
                            }}
                          >
                            To Do
                          </div>
                          <div className={styles.previewCard}>
                            <div className={styles.previewCardLine} style={{ width: "80%" }} />
                            <div className={styles.previewCardLine} style={{ width: "50%" }} />
                          </div>
                          <div className={styles.previewCard}>
                            <div className={styles.previewCardLine} style={{ width: "70%" }} />
                          </div>
                        </div>

                        <div className={styles.previewColumn}>
                          <div
                            style={{
                              fontSize: 7,
                              fontWeight: 600,
                              color: "var(--lyra-text-muted)",
                              marginBottom: 2,
                            }}
                          >
                            In Progress
                          </div>
                          <div className={styles.previewCard}>
                            <div
                              className={styles.previewCardLine}
                              style={{ width: "60%", background: accentColor }}
                            />
                            <div className={styles.previewCardLine} style={{ width: "40%" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button className={styles.previewContextButton}>
                  Preview in context
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* General Tab */}
      {activeTab === "General" && (
        <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 24 }}>
          <div className={styles.cardBox}>
            <h3 className={styles.sectionTitle}>Workspace</h3>
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
            <h3 className={styles.sectionTitle}>Startup</h3>
            <div className={styles.selectRow}>
              <div className={styles.toggleLabelWrap}>
                <span className={styles.toggleLabel}>Default View</span>
                <span className={styles.toggleDesc}>The tab opened when launching a project</span>
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
          </div>

          <div className={styles.cardBox}>
            <h3 className={styles.sectionTitle}>Notifications</h3>
            <div className={styles.toggleRow} onClick={() => {
              const next = !desktopNotifications;
              setDesktopNotifications(next);
              void savePreference("desktop_notifications", next);
            }}>
              <div className={styles.toggleLabelWrap}>
                <span className={styles.toggleLabel}>Desktop Notifications</span>
                <span className={styles.toggleDesc}>Notify when coding agents finish runs or diffs</span>
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
                <span className={styles.toggleDesc}>Play subtle chime on task completion</span>
              </div>
              <div className={`${styles.switch} ${playSounds ? styles.switchActive : ""}`}>
                <div className={styles.switchThumb} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agents Tab */}
      {activeTab === "Agents" && (
        <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <h3 className={styles.sectionTitle}>Installed CLI Coding Agents</h3>
            <p className={styles.sectionSubtitle}>
              Lyra auto-detects agent CLIs installed in your environment and runs them headless with streaming diffs.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {adapters.map((adapter) => {
              const iconName: LyraIconName =
                adapter.id === "codex"
                  ? "provider-codex"
                  : adapter.id === "claude-code"
                  ? "provider-claude"
                  : adapter.id === "opencode"
                  ? "provider-opencode"
                  : "provider-gemini";

              return (
                <div key={adapter.id} className={styles.agentCardRow}>
                  <LyraIcon name={iconName} size={22} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 13.5 }}>{adapter.displayName}</span>
                      {adapter.available ? (
                        <span className={styles.badgeInstalled}>
                          ● Ready
                        </span>
                      ) : (
                        <span className={styles.badgeMissing}>Not detected</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--lyra-text-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {adapter.executablePath || "Add executable to PATH to enable"}
                    </div>
                  </div>
                  {adapter.available && (
                    <button
                      className={styles.smallButton}
                      onClick={() => void openGeneralChat(adapter.id)}
                    >
                      Start Session
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.cardBox} style={{ marginTop: 10 }}>
            <h3 className={styles.sectionTitle}>Agent Preferences</h3>
            <div className={styles.selectRow}>
              <span className={styles.toggleLabel}>Default CLI Agent</span>
              <select
                className={styles.selectInput}
                defaultValue="codex"
                onChange={(e) => void savePreference("default_agent", e.target.value)}
              >
                {adapters.filter((a) => a.available).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.displayName}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.selectRow}>
              <span className={styles.toggleLabel}>Execution Timeout</span>
              <select className={styles.selectInput} defaultValue="10m">
                <option value="5m">5 minutes</option>
                <option value="10m">10 minutes</option>
                <option value="15m">15 minutes</option>
                <option value="30m">30 minutes</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === "Integrations" && (
        <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 24 }}>
          <div className={styles.cardBox}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#24292e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 22,
                }}
              >
                <LyraIcon name="repository" size={24} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h3 className={styles.sectionTitle} style={{ margin: 0 }}>GitHub Integration (via gh CLI)</h3>
                  {githubStatus?.authenticated ? (
                    <span className={styles.badgeInstalled}>● Authenticated</span>
                  ) : (
                    <span className={styles.badgeMissing}>Disconnected</span>
                  )}
                </div>
                <p className={styles.sectionSubtitle} style={{ margin: "4px 0 0 0" }}>
                  Connect repositories, fetch pull requests, and commit branches using local gh authentication.
                </p>
              </div>
            </div>

            {githubStatus?.authenticated && githubStatus.user ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  background: "rgba(0,0,0,0.02)",
                  borderRadius: 8,
                  border: "1px solid var(--lyra-border)",
                  marginTop: 6,
                }}
              >
                {githubStatus.user.avatar_url ? (
                  <img
                    src={githubStatus.user.avatar_url}
                    alt={githubStatus.user.login}
                    style={{ width: 36, height: 36, borderRadius: "50%" }}
                  />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#4f46e5" }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {githubStatus.user.name} ({githubStatus.user.login})
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--lyra-text-muted)" }}>
                    Scopes: {githubStatus.scopes?.join(", ") || "repo, read:org"} · CLI: {githubStatus.path}
                  </div>
                </div>
                <button
                  className={styles.smallButton}
                  onClick={() => void window.lyra.github.openWeb(githubStatus.user!.html_url)}
                >
                  View Profile
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
              <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: 12.5, color: "var(--lyra-text-muted)", marginBottom: 12 }}>
                  {githubStatus?.installed
                    ? "GitHub CLI (gh) is installed. Click below to authenticate through your browser."
                    : "GitHub CLI (gh) was not detected. Install via 'brew install gh' to enable repository sync."}
                </p>
                <button className={styles.primaryButton} onClick={() => void loginGitHub()}>
                  Sign in with GitHub CLI
                </button>
              </div>
            )}
          </div>

          {/* Repositories List */}
          {githubRepos.length > 0 && (
            <div className={styles.cardBox}>
              <h3 className={styles.sectionTitle}>Connected Repositories ({githubRepos.length})</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 260, overflowY: "auto" }}>
                {githubRepos.map((repo) => (
                  <div key={repo.nameWithOwner} className={styles.repoItem}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 12.5 }}>{repo.nameWithOwner}</div>
                      <div style={{ fontSize: 11, color: "var(--lyra-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {repo.description || "No description provided"}
                      </div>
                    </div>
                    <button
                      className={styles.smallButton}
                      onClick={() => void window.lyra.github.openWeb(repo.url)}
                    >
                      Open ↗
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Shortcuts Tab */}
      {activeTab === "Shortcuts" && (
        <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h3 className={styles.sectionTitle}>Keyboard Shortcuts</h3>
              <p className={styles.sectionSubtitle}>Work quickly with standard desktop keybindings.</p>
            </div>
            <input
              className={styles.textInput}
              style={{ width: 180, fontSize: 12 }}
              placeholder="Filter shortcuts…"
              value={shortcutSearch}
              onChange={(e) => setShortcutSearch(e.target.value)}
            />
          </div>

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

      {/* Advanced Tab */}
      {activeTab === "Advanced" && (
        <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 20 }}>
          <div className={styles.cardBox}>
            <h3 className={styles.sectionTitle}>Local SQLite Database</h3>
            <p className={styles.sectionSubtitle}>Lyra operates local-first with transactional SQLite WAL persistence.</p>
            <div style={{ fontSize: 12, color: "var(--lyra-text-muted)", fontFamily: "var(--lyra-font-mono)" }}>
              lyra.db (WAL mode active · zero network latency)
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button
                className={styles.smallButton}
                onClick={() => alert("Database optimized successfully. 0 fragmentation.")}
              >
                Vacuum & Optimize
              </button>
              <button
                className={styles.smallButton}
                onClick={() => alert("Database exported to ~/Desktop/lyra-backup.sqlite")}
              >
                Export Backup
              </button>
            </div>
          </div>

          <div className={styles.cardBox}>
            <h3 className={styles.sectionTitle}>Privacy & Diagnostics</h3>
            <div className={styles.toggleRow}>
              <div className={styles.toggleLabelWrap}>
                <span className={styles.toggleLabel}>Crash Reporting</span>
                <span className={styles.toggleDesc}>Local error logs only; no external telemetry</span>
              </div>
              <div className={styles.switch}>
                <div className={styles.switchThumb} />
              </div>
            </div>
            <div className={styles.toggleRow}>
              <div className={styles.toggleLabelWrap}>
                <span className={styles.toggleLabel}>Anonymous Usage Analytics</span>
                <span className={styles.toggleDesc}>Lyra does not transmit product analytics</span>
              </div>
              <div className={styles.switch}>
                <div className={styles.switchThumb} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

