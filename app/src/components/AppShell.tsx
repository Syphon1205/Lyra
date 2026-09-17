import { useEffect, useState } from "react";
import { useLyraStore } from "../state/store";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { ProjectView } from "./ProjectView";
import { IssuePanel } from "./IssuePanel/IssuePanel";
import { ChatPanel } from "./Chat/ChatPanel";
import { IssueComposer } from "./IssueComposer";
import { CommandPalette } from "./CommandPalette/CommandPalette";
import { SimpleIssueList } from "./SimpleIssueList";
import { SettingsModal } from "./SettingsModal";
import { IssueDetailView } from "./IssueDetail/IssueDetailView";
import { AgentsView } from "./Agents/AgentsView";
import { SettingsView } from "./Settings/SettingsView";
import { OnboardingView } from "./Onboarding/OnboardingView";
import { AppIcon } from "./AppIcon";
import { Avatar } from "./Avatar";
import styles from "./AppShell.module.css";

export function AppShell() {
  const [composerOpen, setComposerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isDraggingSidebar, setIsDraggingSidebar] = useState(false);
  const [isDraggingCompanion, setIsDraggingCompanion] = useState(false);

  const selection = useLyraStore((s) => s.selection);
  const companionPanel = useLyraStore((s) => s.companionPanel);
  const issues = useLyraStore((s) => s.issues);
  const currentUserId = useLyraStore((s) => s.currentUserId);
  const recentIssueIds = useLyraStore((s) => s.recentIssueIds);
  const openGeneralChat = useLyraStore((s) => s.openGeneralChat);
  const sidebarWidth = useLyraStore((s) => s.sidebarWidth);
  const setSidebarWidth = useLyraStore((s) => s.setSidebarWidth);
  const companionWidth = useLyraStore((s) => s.companionWidth);
  const setCompanionWidth = useLyraStore((s) => s.setCompanionWidth);
  const isSidebarCollapsed = useLyraStore((s) => s.isSidebarCollapsed);
  const toggleSidebarCollapsed = useLyraStore((s) => s.toggleSidebarCollapsed);
  const isCompanionWide = useLyraStore((s) => s.isCompanionWide);
  const onboardingCompleted = useLyraStore((s) => s.onboardingCompleted);

  useEffect(() => {
    const offNewIssue = window.lyra.menu.onNewIssue(() => setComposerOpen(true));
    const offPalette = window.lyra.menu.onCommandPalette(() => setPaletteOpen(true));
    const offToggleChat = window.lyra.menu.onToggleChat(() => {
      if (useLyraStore.getState().companionPanel.kind === "agentChat") {
        useLyraStore.getState().closeCompanionPanel();
      } else {
        void openGeneralChat();
      }
    });
    (window as any).__setPaletteOpen = setPaletteOpen;
    return () => {
      delete (window as any).__setPaletteOpen;
      offNewIssue();
      offPalette();
      offToggleChat();
    };
  }, [openGeneralChat]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPaletteOpen(false);
        setComposerOpen(false);
        setSettingsOpen(false);
      }
      if (e.key === "\\" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSidebarCollapsed();
      }
      if (e.key === "," && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        useLyraStore.getState().setSelection({ kind: "settings" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleSidebarCollapsed]);

  const startSidebarDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSidebar(true);
    const startX = e.clientX;
    const startW = sidebarWidth;
    const onMouseMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      const newW = Math.min(Math.max(startW + delta, 180), 480);
      setSidebarWidth(newW);
    };
    const onMouseUp = () => {
      setIsDraggingSidebar(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const startCompanionDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingCompanion(true);
    const startX = e.clientX;
    const startW = isCompanionWide ? 680 : companionWidth;
    const onMouseMove = (ev: MouseEvent) => {
      const delta = startX - ev.clientX;
      const newW = Math.min(Math.max(startW + delta, 320), 760);
      setCompanionWidth(newW);
    };
    const onMouseUp = () => {
      setIsDraggingCompanion(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const isCompanionOpen = companionPanel.kind !== "none";
  const effectiveCompanionWidth = isCompanionWide ? 680 : companionWidth;

  return (
    <div className={styles.root}>
      <div className={styles.desktopBackdrop} />

      {/* Resizable Sidebar Container */}
      <div
        className={styles.sidebarWrap}
        style={{
          width: isSidebarCollapsed ? 0 : sidebarWidth,
          opacity: isSidebarCollapsed ? 0 : 1,
          pointerEvents: isSidebarCollapsed ? "none" : "auto",
        }}
      >
        <Sidebar onOpenSettings={() => useLyraStore.getState().setSelection({ kind: "settings" })} />
        {!isSidebarCollapsed && (
          <div
            className={`${styles.sidebarResizer} ${isDraggingSidebar ? styles.sidebarResizerActive : ""}`}
            onMouseDown={startSidebarDrag}
            onDoubleClick={() => setSidebarWidth(240)}
            title="Drag to resize sidebar (double-click to reset)"
          />
        )}
      </div>

      <div className={styles.main}>
        <TopBar
          onToggleSidebar={toggleSidebarCollapsed}
          onOpenComposer={() => setComposerOpen(true)}
          onOpenPalette={() => setPaletteOpen(true)}
        />
        <div className={styles.contentRow}>
          <div className={styles.center}>
            {selection.kind === "project" && <ProjectView projectId={selection.projectId} />}
            {selection.kind === "issue" && <IssueDetailView issueId={selection.issueId} />}
            {selection.kind === "forYou" && (
              <SimpleIssueList
                title="Inbox"
                issues={issues.filter((i) => i.assigneeId === currentUserId && i.status !== "done" && i.status !== "canceled")}
                emptyText="Inbox zero. Nothing needs your attention."
              />
            )}
            {selection.kind === "assigned" && (
              <SimpleIssueList title="Assigned to Me" issues={issues.filter((i) => i.assigneeId === currentUserId)} emptyText="No issues assigned to you." />
            )}
            {selection.kind === "created" && (
              <SimpleIssueList title="Created by Me" issues={issues.filter((i) => i.creatorId === currentUserId)} emptyText="You haven't created any issues yet." />
            )}
            {selection.kind === "recent" && (
              <SimpleIssueList
                title="Recent"
                issues={recentIssueIds.map((id) => issues.find((i) => i.id === id)).filter((i): i is NonNullable<typeof i> => !!i)}
                emptyText="Issues you open will show up here."
              />
            )}
            {selection.kind === "starred" && <StarredProjects />}
            {selection.kind === "filters" && (
              <SimpleIssueList title="Assigned to Me" issues={issues.filter((i) => i.assigneeId === currentUserId)} emptyText="Nothing matches." />
            )}
            {selection.kind === "teams" && <TeamsOverview />}
            {selection.kind === "agents" && <AgentsView />}
            {selection.kind === "runs" && <AgentsView initialTab="runs" />}
            {selection.kind === "settings" && <SettingsView />}
          </div>

          {/* Resizable & Smooth Sliding Companion Panel */}
          <div
            className={styles.companionWrap}
            style={{
              width: isCompanionOpen ? effectiveCompanionWidth : 0,
              opacity: isCompanionOpen ? 1 : 0,
              pointerEvents: isCompanionOpen ? "auto" : "none",
            }}
          >
            {isCompanionOpen && (
              <div
                className={`${styles.companionResizer} ${isDraggingCompanion ? styles.companionResizerActive : ""}`}
                onMouseDown={startCompanionDrag}
                onDoubleClick={() => setCompanionWidth(420)}
                title="Drag to resize panel (double-click to reset)"
              />
            )}
            {companionPanel.kind === "issueDetail" && <IssuePanel issueId={companionPanel.issueId} />}
            {companionPanel.kind === "agentChat" && <ChatPanel sessionId={companionPanel.sessionId} />}
          </div>
        </div>
      </div>

      {composerOpen && <IssueComposer onClose={() => setComposerOpen(false)} />}
      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} onOpenComposer={() => setComposerOpen(true)} />}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      {!onboardingCompleted && <OnboardingView />}
    </div>
  );
}

function StarredProjects() {
  const projects = useLyraStore((s) => s.projects);
  const setSelection = useLyraStore((s) => s.setSelection);
  const starred = projects.filter((p) => p.starred);
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600 }}>Starred</h1>
      {starred.length === 0 && <div style={{ color: "var(--lyra-text-faint)", marginTop: 20 }}>Nothing starred.</div>}
      {starred.map((p) => (
        <div
          key={p.id}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 4px", cursor: "default" }}
          onClick={() => setSelection({ kind: "project", projectId: p.id })}
        >
          <AppIcon name="board" size={14} />
          {p.name}
        </div>
      ))}
    </div>
  );
}

function TeamsOverview() {
  const teams = useLyraStore((s) => s.teams);
  const users = useLyraStore((s) => s.users);
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Teams</h1>
      {teams.length === 0 && <div style={{ color: "var(--lyra-text-faint)" }}>No teams yet.</div>}
      {teams.map((team) => (
        <div key={team.id} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {team.name} <span style={{ color: "var(--lyra-text-faint)", fontWeight: 400 }}>· {team.abbreviation}</span>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {team.memberIds.map((id) => {
              const user = users.find((u) => u.id === id);
              if (!user) return null;
              return (
                <div key={id} title={user.name}>
                  <Avatar name={user.name} colorSeed={user.colorSeed} size={26} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
