import { useState } from "react";
import { useLyraStore } from "../state/store";
import { LyraIcon } from "../icons/LyraIcon";
import { Avatar } from "./Avatar";
import { GlassSurface } from "./GlassSurface";
import styles from "./TopBar.module.css";

export function TopBar({
  onToggleSidebar,
  onOpenComposer,
  onOpenPalette,
}: {
  onToggleSidebar: () => void;
  onOpenComposer: () => void;
  onOpenPalette: () => void;
}) {
  const companionPanel = useLyraStore((s) => s.companionPanel);
  const closeCompanionPanel = useLyraStore((s) => s.closeCompanionPanel);
  const openGeneralChat = useLyraStore((s) => s.openGeneralChat);
  const selection = useLyraStore((s) => s.selection);
  const setSelection = useLyraStore((s) => s.setSelection);
  const projects = useLyraStore((s) => s.projects);
  const issues = useLyraStore((s) => s.issues);
  const currentUserId = useLyraStore((s) => s.currentUserId);
  const users = useLyraStore((s) => s.users);
  const currentUser = users.find((u) => u.id === currentUserId);
  const githubStatus = useLyraStore((s) => s.githubStatus);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isChatOpen = companionPanel.kind === "agentChat";

  const breadcrumbs = (() => {
    if (companionPanel.kind === "issueDetail") {
      const issue = issues.find((i) => i.id === companionPanel.issueId);
      const project = projects.find((p) => p.id === issue?.projectId);
      const parent = project?.parentId ? projects.find((p) => p.id === project.parentId) : undefined;
      const parts: { label: string; onClick?: () => void }[] = [{ label: "Projects", onClick: () => setSelection({ kind: "forYou" }) }];
      if (parent) parts.push({ label: parent.name, onClick: () => setSelection({ kind: "project", projectId: parent.id }) });
      if (project) parts.push({ label: project.name, onClick: () => setSelection({ kind: "project", projectId: project.id }) });
      if (issue) parts.push({ label: `${issue.identifier.prefix}-${issue.identifier.number}` });
      return parts;
    }

    switch (selection.kind) {
      case "project": {
        const project = projects.find((p) => p.id === selection.projectId);
        if (!project) return [{ label: "Projects" }];
        const parent = project.parentId ? projects.find((p) => p.id === project.parentId) : undefined;
        return parent
          ? [
              { label: "Projects", onClick: () => setSelection({ kind: "forYou" }) },
              { label: parent.name, onClick: () => setSelection({ kind: "project", projectId: parent.id }) },
              { label: project.name },
            ]
          : [{ label: "Projects", onClick: () => setSelection({ kind: "forYou" }) }, { label: project.name }];
      }
      case "issue": {
        const issue = issues.find((i) => i.id === selection.issueId);
        const project = projects.find((p) => p.id === issue?.projectId);
        return [
          { label: "Projects", onClick: () => setSelection({ kind: "forYou" }) },
          ...(project ? [{ label: project.name, onClick: () => setSelection({ kind: "project", projectId: project.id }) }] : []),
          { label: issue ? `${issue.identifier.prefix}-${issue.identifier.number}` : "Issue" },
        ];
      }
      case "forYou":
        return [{ label: "Inbox" }];
      case "assigned":
        return [{ label: "Assigned to me" }];
      case "created":
        return [{ label: "Created by me" }];
      case "recent":
        return [{ label: "Recent" }];
      case "starred":
        return [{ label: "Starred" }];
      case "filters":
        return [{ label: "Filters" }];
      case "teams":
        return [{ label: "Teams" }];
      case "agents":
        return [{ label: "Agents" }];
      case "runs":
        return [{ label: "Runs" }];
      case "settings":
        return [{ label: "Settings" }];
      default:
        return [{ label: "Projects" }];
    }
  })();

  const notifications = useLyraStore((s) => s.notifications);
  const markNotificationRead = useLyraStore((s) => s.markNotificationRead);
  const openIssueDetail = useLyraStore((s) => s.openIssueDetail);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    for (const n of notifications.filter((n) => !n.read)) {
      await markNotificationRead(n.id);
    }
  };

  const handleNotificationClick = async (n: any) => {
    await markNotificationRead(n.id);
    if (n.link && n.link.startsWith("issue:")) {
      const issueId = n.link.replace("issue:", "");
      openIssueDetail(issueId);
      setNotificationsOpen(false);
    }
  };

  return (
    <GlassSurface variant="light-toolbar" className={styles.bar} border={false}>
      <button className={styles.iconButton} onClick={onToggleSidebar} title="Toggle Sidebar (⌘\)">
        <LyraIcon name="sidebar" size={16} />
      </button>

      <div className={styles.breadcrumb}>
        {breadcrumbs.map((item, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            {i > 0 && <span style={{ color: "var(--lyra-text-faint)", opacity: 0.6 }}>/</span>}
            <span
              className={i === breadcrumbs.length - 1 ? styles.breadcrumbCurrent : undefined}
              onClick={item.onClick}
              style={{ cursor: item.onClick ? "pointer" : "default" }}
            >
              {item.label}
            </span>
          </span>
        ))}
      </div>

      <button className={styles.search} onClick={onOpenPalette}>
        <LyraIcon name="search" size={13} style={{ color: "var(--lyra-text-muted)" }} />
        <span style={{ flex: 1, textAlign: "left", color: "var(--lyra-text-muted)" }}>
          Search issues, projects, or ask Lyra…
        </span>
        <span className={styles.kbdHint}>⌘K</span>
      </button>

      <div className={styles.right}>
        <button className={styles.createButton} onClick={onOpenComposer} title="Create Issue (⌘N)">
          <LyraIcon name="plus" size={13} style={{ strokeWidth: 2.2 }} />
          Create
        </button>

        <button
          className={styles.iconButton}
          title="Agent Chat (⌘⇧A)"
          onClick={() => {
            if (isChatOpen) closeCompanionPanel();
            else void openGeneralChat();
          }}
          style={isChatOpen ? { color: "var(--lyra-accent-solid)", background: "rgba(98, 107, 255, 0.12)" } : undefined}
        >
          <LyraIcon name="agent" size={16} />
        </button>

        <button
          className={styles.iconButton}
          title="Notifications"
          onClick={() => setNotificationsOpen((v) => !v)}
          style={{ position: "relative" }}
        >
          <LyraIcon name="notification" size={16} />
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--lyra-accent-solid)",
              }}
            />
          )}
        </button>

        {notificationsOpen && (
          <div
            style={{
              position: "absolute",
              top: 48,
              right: 16,
              width: 320,
              background: "var(--lyra-card)",
              border: "1px solid var(--lyra-border)",
              borderRadius: 10,
              padding: "12px",
              boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
              zIndex: 100,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--lyra-text)" }}>Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  style={{ background: "none", border: "none", fontSize: 11, color: "var(--lyra-accent-solid)", cursor: "pointer" }}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 280, overflowY: "auto" }}>
              {notifications.length === 0 ? (
                <div style={{ fontSize: 12, color: "var(--lyra-text-muted)", padding: "12px 0", textAlign: "center" }}>
                  No new notifications.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => void handleNotificationClick(n)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 6,
                      background: n.read ? "transparent" : "rgba(98, 107, 255, 0.08)",
                      cursor: "pointer",
                      fontSize: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 600, color: "var(--lyra-text)" }}>{n.title}</span>
                      {!n.read && (
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--lyra-accent-solid)" }} />
                      )}
                    </div>
                    <span style={{ color: "var(--lyra-text-muted)", fontSize: 11.5 }}>{n.body}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {githubStatus?.authenticated && githubStatus.user ? (
          <button
            className={styles.avatarButton}
            title={`${githubStatus.user.name || githubStatus.user.login} (Settings)`}
            onClick={() => useLyraStore.getState().setSelection({ kind: "settings" })}
          >
            {githubStatus.user.avatar_url ? (
              <img
                src={githubStatus.user.avatar_url}
                alt={githubStatus.user.login}
                style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <Avatar name={githubStatus.user.login} colorSeed={42} size={26} />
            )}
          </button>
        ) : currentUser ? (
          <button
            className={styles.avatarButton}
            title={`${currentUser.name} (Settings)`}
            onClick={() => useLyraStore.getState().setSelection({ kind: "settings" })}
          >
            <Avatar name={currentUser.name} colorSeed={currentUser.colorSeed} size={26} />
          </button>
        ) : null}
      </div>
    </GlassSurface>
  );
}
