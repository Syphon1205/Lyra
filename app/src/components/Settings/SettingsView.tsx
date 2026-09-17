import { useState } from "react";
import { useLyraStore } from "../../state/store";
import { LyraMark } from "../Sidebar";
import { LyraIcon } from "../../icons/LyraIcon";
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

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<Tab>("Appearance");
  const appearance = useLyraStore((s) => s.appearance);
  const setAppearance = useLyraStore((s) => s.setAppearance);
  const density = useLyraStore((s) => s.density);
  const setDensity = useLyraStore((s) => s.setDensity);

  const [accentColor, setAccentColor] = useState("#3b82f6");
  const [glassEffects, setGlassEffects] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [increaseContrast, setIncreaseContrast] = useState(false);
  const [windowSize, setWindowSize] = useState("Last used");
  const [sidebarState, setSidebarState] = useState("Expanded");
  const [densityChoice, setDensityChoice] = useState<"compact" | "default" | "comfortable">(
    density === "compact" ? "compact" : "default"
  );

  const handleSelectTheme = (mode: "light" | "dark" | "system") => {
    void setAppearance(mode);
  };

  const handleSelectAccent = (hex: string) => {
    setAccentColor(hex);
    document.documentElement.style.setProperty("--lyra-accent-solid", hex);
    document.documentElement.style.setProperty("--lyra-accent", hex);
  };

  const handleSelectDensity = (d: "compact" | "default" | "comfortable") => {
    setDensityChoice(d);
    setDensity(d === "compact" ? "compact" : "comfortable");
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
            <div className={styles.toggleRow} onClick={() => setGlassEffects((v) => !v)}>
              <div className={styles.toggleLabelWrap}>
                <span className={styles.toggleLabel}>Glass effects</span>
                <span className={styles.toggleDesc}>Show wallpaper through sidebar and panels</span>
              </div>
              <div className={`${styles.switch} ${glassEffects ? styles.switchActive : ""}`}>
                <div className={styles.switchThumb} />
              </div>
            </div>

            <div className={styles.toggleRow} onClick={() => setReduceMotion((v) => !v)}>
              <div className={styles.toggleLabelWrap}>
                <span className={styles.toggleLabel}>Reduce motion</span>
              </div>
              <div className={`${styles.switch} ${reduceMotion ? styles.switchActive : ""}`}>
                <div className={styles.switchThumb} />
              </div>
            </div>

            <div className={styles.toggleRow} onClick={() => setIncreaseContrast((v) => !v)}>
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
                onChange={(e) => setWindowSize(e.target.value)}
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
                onChange={(e) => setSidebarState(e.target.value)}
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

              {/* Pill button at bottom */}
              <button className={styles.previewContextButton}>
                Preview in context
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
