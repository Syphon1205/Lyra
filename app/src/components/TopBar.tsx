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
  const projects = useLyraStore((s) => s.projects);
  const issues = useLyraStore((s) => s.issues);
  const currentUserId = useLyraStore((s) => s.currentUserId);
  const users = useLyraStore((s) => s.users);
  const currentUser = users.find((u) => u.id === currentUserId);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isChatOpen = companionPanel.kind === "agentChat";

  const breadcrumbSegments = (() => {
    if (companionPanel.kind === "issueDetail") {
      const issue = issues.find((i) => i.id === companionPanel.issueId);
      const project = projects.find((p) => p.id === issue?.projectId);
      const parent = project?.parentId ? projects.find((p) => p.id === project.parentId) : undefined;
      const parts = ["Projects"];
      if (parent) parts.push(parent.name);
      if (project) parts.push(project.name);
      if (issue) parts.push(`${issue.identifier.prefix}-${issue.identifier.number}`);
      return parts;
    }

    switch (selection.kind) {
      case "project": {
        const project = projects.find((p) => p.id === selection.projectId);
        if (!project) return ["Projects"];
        const parent = project.parentId ? projects.find((p) => p.id === project.parentId) : undefined;
        return parent ? ["Projects", parent.name, project.name] : ["Projects", project.name];
      }
      case "forYou":
        return ["Inbox"];
      case "assigned":
        return ["Assigned to me"];
      case "created":
        return ["Created by me"];
      case "recent":
        return ["Recent"];
      case "starred":
        return ["Starred"];
      case "filters":
        return ["Filters"];
      case "teams":
        return ["Teams"];
      case "agents":
        return ["Agents"];
      case "runs":
        return ["Runs"];
      default:
        return ["Projects"];
    }
  })();

  return (
    <GlassSurface variant="light-toolbar" className={styles.bar} border={false}>
      <button className={styles.iconButton} onClick={onToggleSidebar} title="Toggle Sidebar (⌘\)">
        <LyraIcon name="sidebar" size={16} />
      </button>

      <div className={styles.breadcrumb}>
        {breadcrumbSegments.map((seg, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            {i > 0 && <span style={{ color: "var(--lyra-text-faint)", opacity: 0.6 }}>/</span>}
            <span className={i === breadcrumbSegments.length - 1 ? styles.breadcrumbCurrent : undefined}>
              {seg}
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
        >
          <LyraIcon name="notification" size={16} />
        </button>

        {notificationsOpen && (
          <div
            style={{
              position: "absolute",
              top: 48,
              right: 16,
              background: "var(--lyra-card)",
              border: "1px solid var(--lyra-border)",
              borderRadius: 10,
              padding: "12px 16px",
              fontSize: 12.5,
              color: "var(--lyra-text-muted)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
              zIndex: 100,
            }}
          >
            No new notifications.
          </div>
        )}

        {currentUser && (
          <button className={styles.avatarButton} title={currentUser.name}>
            <Avatar name={currentUser.name} colorSeed={currentUser.colorSeed} size={26} />
          </button>
        )}
      </div>
    </GlassSurface>
  );
}
