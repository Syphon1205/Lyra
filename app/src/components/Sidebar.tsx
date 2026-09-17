import { useState } from "react";
import { useLyraStore } from "../state/store";
import { LyraIcon } from "../icons/LyraIcon";
import { GlassSurface } from "./GlassSurface";
import lyraMarkWhite from "../assets/lyra-mark-white.png";
import lyraMarkDark from "../assets/lyra-mark-dark.png";
import styles from "./Sidebar.module.css";

export function Sidebar({
  onOpenSettings,
  onOpenPalette,
}: {
  onOpenSettings: () => void;
  onOpenPalette?: () => void;
}) {
  const selection = useLyraStore((s) => s.selection);
  const setSelection = useLyraStore((s) => s.setSelection);
  const projects = useLyraStore((s) => s.projects);
  const createProject = useLyraStore((s) => s.createProject);
  const workspace = useLyraStore((s) => s.workspace);
  const currentUserId = useLyraStore((s) => s.currentUserId);
  const users = useLyraStore((s) => s.users);
  const currentUser = users.find((u) => u.id === currentUserId);
  const githubStatus = useLyraStore((s) => s.githubStatus);
  const loginGitHub = useLyraStore((s) => s.loginGitHub);
  const preferences = useLyraStore((s) => s.preferences);

  const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(
    new Set(projects.map((p) => p.id))
  );

  const isActive = (predicate: boolean) =>
    predicate ? `${styles.row} ${styles.rowActive}` : styles.row;

  const toggleExpanded = (id: string) =>
    setExpandedProjectIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const parentProjects = projects.filter((p) => !p.parentId);
  const lyraProject = parentProjects.find((p) => p.name === "Lyra") ?? parentProjects[0];

  const wsName = workspace?.name ?? (preferences.workspace_name as string) ?? "Ambient";
  const wsSub = githubStatus?.authenticated && githubStatus.user
    ? `@${githubStatus.user.login}`
    : currentUser?.email ?? "local workspace";

  return (
    <GlassSurface variant="dark-chrome" className={`${styles.sidebar} lyra-chrome-scope`} border={false}>
      {/* Brand & Traffic lights inset */}
      <div className={styles.brand}>
        <LyraMark size={20} variant="white" />
        <span className={styles.wordmark}>Lyra</span>
      </div>

      {/* Workspace Switcher */}
      <div className={styles.workspaceSwitcher}>
        <div className={styles.workspaceAvatar}>{wsName.slice(0, 1).toUpperCase()}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className={styles.workspaceName}>{wsName}</div>
          <div className={styles.workspaceSub}>{wsSub}</div>
        </div>
        <LyraIcon name="chevron-down" size={12} style={{ color: "var(--lyra-chrome-faint)" }} />
      </div>

      <nav className={styles.nav}>
        {/* Core Navigation */}
        <div className={styles.section} style={{ marginTop: 4 }}>
          <button
            className={isActive(false)}
            onClick={() => onOpenPalette?.()}
            style={{ display: "flex", alignItems: "center" }}
          >
            <span className={styles.rowIcon}>
              <LyraIcon name="search" size={14} />
            </span>
            <span className={styles.rowLabel}>Search</span>
            <span
              style={{
                fontSize: 10,
                color: "var(--lyra-chrome-faint)",
                background: "rgba(255, 255, 255, 0.08)",
                padding: "1px 5px",
                borderRadius: 4,
                letterSpacing: "0.02em",
              }}
            >
              ⌘K
            </span>
          </button>

          <button
            className={isActive(selection.kind === "forYou")}
            onClick={() => setSelection({ kind: "forYou" })}
          >
            <span className={styles.rowIcon}>
              <LyraIcon name="inbox" size={14} />
            </span>
            <span className={styles.rowLabel}>Inbox</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "var(--lyra-chrome-muted)",
                background: "rgba(255, 255, 255, 0.08)",
                padding: "1px 6px",
                borderRadius: 999,
              }}
            >
              3
            </span>
          </button>

          <button
            className={isActive(false)}
            onClick={() => setSelection({ kind: "assigned" })}
          >
            <span className={styles.rowIcon}>
              <LyraIcon name="my-issues" size={14} />
            </span>
            <span className={styles.rowLabel}>My Issues</span>
          </button>

          <button
            className={isActive(selection.kind === "assigned")}
            onClick={() => setSelection({ kind: "assigned" })}
          >
            <span className={styles.rowIcon}>
              <LyraIcon name="assigned" size={14} />
            </span>
            <span className={styles.rowLabel}>Assigned to me</span>
          </button>

          <button
            className={isActive(selection.kind === "created")}
            onClick={() => setSelection({ kind: "created" })}
          >
            <span className={styles.rowIcon}>
              <LyraIcon name="created" size={14} />
            </span>
            <span className={styles.rowLabel}>Created by me</span>
          </button>

          <button
            className={isActive(selection.kind === "recent")}
            onClick={() => setSelection({ kind: "recent" })}
          >
            <span className={styles.rowIcon}>
              <LyraIcon name="history" size={14} />
            </span>
            <span className={styles.rowLabel}>Recent</span>
          </button>

          <button
            className={isActive(selection.kind === "starred")}
            onClick={() => setSelection({ kind: "starred" })}
          >
            <span className={styles.rowIcon}>
              <LyraIcon name="star" size={14} />
            </span>
            <span className={styles.rowLabel}>Starred</span>
          </button>
        </div>

        {/* Projects Section with '+' action */}
        <div className={styles.section}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 8px 4px",
            }}
          >
            <span className={styles.sectionLabel} style={{ padding: 0 }}>
              Projects
            </span>
            <button
              title="Create Project"
              onClick={async () => {
                const name = window.prompt("Enter new project name:");
                if (name && name.trim()) {
                  const key = name.trim().slice(0, 3).toUpperCase();
                  await createProject({ name: name.trim(), key });
                }
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--lyra-chrome-faint)",
                cursor: "pointer",
                padding: 2,
                display: "flex",
                borderRadius: 4,
              }}
            >
              <LyraIcon name="plus" size={11} />
            </button>
          </div>

          {lyraProject && (
            <div className={styles.projectGroup}>
              {/* Lyra Root Group */}
              <button
                className={styles.row}
                onClick={() => toggleExpanded(lyraProject.id)}
                style={{ fontWeight: 500 }}
              >
                <span className={styles.rowIcon}>
                  <LyraIcon
                    name={expandedProjectIds.has(lyraProject.id) ? "chevron-down" : "chevron-right"}
                    size={11}
                  />
                </span>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3.5,
                    background: "var(--lyra-accent-solid)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 8,
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  L
                </span>
                <span className={styles.rowLabel}>{lyraProject.name}</span>
              </button>

              {/* Child projects under Lyra */}
              {expandedProjectIds.has(lyraProject.id) &&
                projects
                  .filter((p) => p.parentId === lyraProject.id)
                  .map((child) => {
                    const isSelected =
                      selection.kind === "project" && selection.projectId === child.id;
                    const icon =
                      child.name === "Engineering"
                        ? "engineering"
                        : child.name === "Design"
                          ? "design"
                          : child.name === "Infrastructure"
                            ? "infrastructure"
                            : child.name === "Mobile"
                              ? "mobile"
                              : "document";
                    return (
                      <button
                        key={child.id}
                        className={isActive(isSelected) + " " + styles.subRow}
                        onClick={() => setSelection({ kind: "project", projectId: child.id })}
                        style={{ paddingLeft: 26, position: "relative" }}
                      >
                        <span
                          className={styles.rowIcon}
                          style={{
                            color: isSelected ? "white" : "var(--lyra-chrome-muted)",
                          }}
                        >
                          <LyraIcon name={icon as any} size={13} />
                        </span>
                        <span className={styles.rowLabel}>{child.name}</span>
                        {child.starred && (
                          <LyraIcon name="star-filled" size={10} style={{ color: "#e2b203" }} />
                        )}
                      </button>
                    );
                  })}
            </div>
          )}
        </div>

        {/* Secondary Section: Filters, Teams, Agents, Runs */}
        <div className={styles.section}>
          <button
            className={isActive(selection.kind === "filters")}
            onClick={() => setSelection({ kind: "filters" })}
          >
            <span className={styles.rowIcon}>
              <LyraIcon name="filters" size={14} />
            </span>
            <span className={styles.rowLabel}>Filters</span>
          </button>

          <button
            className={isActive(selection.kind === "teams")}
            onClick={() => setSelection({ kind: "teams" })}
          >
            <span className={styles.rowIcon}>
              <LyraIcon name="teams" size={14} />
            </span>
            <span className={styles.rowLabel}>Teams</span>
          </button>

          <button
            className={isActive(selection.kind === "agents")}
            onClick={() => setSelection({ kind: "agents" })}
          >
            <span className={styles.rowIcon}>
              <LyraIcon name="agent" size={14} />
            </span>
            <span className={styles.rowLabel}>Agents</span>
          </button>

          <button
            className={isActive(selection.kind === "runs")}
            onClick={() => setSelection({ kind: "runs" })}
          >
            <span className={styles.rowIcon}>
              <LyraIcon name="run" size={14} />
            </span>
            <span className={styles.rowLabel}>Runs</span>
            <span
              style={{
                fontSize: 10,
                color: "var(--lyra-chrome-muted)",
                background: "rgba(255, 255, 255, 0.08)",
                padding: "1px 6px",
                borderRadius: 999,
              }}
            >
              2
            </span>
          </button>
        </div>
      </nav>

      {/* Footer: Settings + User Profile */}
      <div className={styles.footerWrap} style={{ padding: "0 10px 10px" }}>
        <button
          className={`${styles.row} ${selection.kind === "settings" ? styles.rowActive : ""}`}
          onClick={onOpenSettings}
          style={{ height: 30, marginBottom: 4 }}
        >
          <span className={styles.rowIcon}>
            <LyraIcon name="settings" size={14} />
          </span>
          <span className={styles.rowLabel}>Settings</span>
        </button>

        <div className={styles.footer} style={{ borderTop: "1px solid var(--lyra-chrome-border)", paddingTop: 8 }}>
          {githubStatus?.authenticated && githubStatus.user ? (
            <div className={styles.profile} onClick={onOpenSettings} style={{ cursor: "pointer" }} title="GitHub connected">
              {githubStatus.user.avatar_url ? (
                <img
                  src={githubStatus.user.avatar_url}
                  alt={githubStatus.user.login}
                  style={{ width: 24, height: 24, borderRadius: 6, objectFit: "cover", flexShrink: 0 }}
                />
              ) : (
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: "linear-gradient(135deg, #4f46e5, #3b82f6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 10,
                    flexShrink: 0,
                  }}
                >
                  {(githubStatus.user.login || "U").slice(0, 2).toUpperCase()}
                </div>
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className={styles.profileName}>
                  {githubStatus.user.name || githubStatus.user.login}
                </div>
                <div className={styles.profilePlan}>@{githubStatus.user.login}</div>
              </div>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", marginRight: 2 }} />
            </div>
          ) : (
            <button
              className={styles.row}
              onClick={() => void loginGitHub()}
              style={{ height: 32, padding: "0 6px", width: "100%", color: "var(--lyra-chrome-text)" }}
            >
              <span className={styles.rowIcon}>
                <LyraIcon name="github" size={14} />
              </span>
              <span className={styles.rowLabel} style={{ fontWeight: 500 }}>Sign in with GitHub</span>
            </button>
          )}
        </div>
      </div>
    </GlassSurface>
  );
}

/** The approved Lyra mark preserved directly from product design assets */
export function LyraMark({
  size = 20,
  variant = "white",
}: {
  size?: number;
  variant?: "white" | "dark" | "tile";
}) {
  if (variant === "tile") {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.22),
          background: "#16191f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.35)",
          flexShrink: 0,
        }}
      >
        <img
          src={lyraMarkWhite}
          alt="Lyra"
          style={{ width: Math.round(size * 0.72), height: Math.round(size * 0.72), objectFit: "contain" }}
        />
      </div>
    );
  }

  return (
    <img
      src={variant === "white" ? lyraMarkWhite : lyraMarkDark}
      alt="Lyra"
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        display: "inline-block",
        verticalAlign: "middle",
        flexShrink: 0,
      }}
    />
  );
}
