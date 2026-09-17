import { useEffect, useState } from "react";
import { useLyraStore } from "../state/store";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { ProjectView } from "./ProjectView";
import { IssuePanel } from "./IssuePanel/IssuePanel";
import { ChatPanel } from "./Chat/ChatPanel";
import { DiffReview } from "./DiffReview/DiffReview";
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
import { Splitter } from "./Splitter";
import styles from "./AppShell.module.css";

const SIDEBAR_MIN = 180;
const SIDEBAR_MAX = 480;
const SIDEBAR_DEFAULT = 240;
const COMPANION_MIN = 320;
const COMPANION_MAX = 760;
const COMPANION_DEFAULT = 420;
const COMPANION_WIDE = 680;
const BOTTOM_PANE_MIN = 160;
const BOTTOM_PANE_MAX_FRACTION = 0.75;
const BOTTOM_PANE_DEFAULT = 300;
/** Smallest useful width for the center workspace before it should stop shrinking further. */
const CENTER_MIN = 360;

export function AppShell() {
  const [composerOpen, setComposerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isDraggingSidebar, setIsDraggingSidebar] = useState(false);
  const [isDraggingCompanion, setIsDraggingCompanion] = useState(false);
  const [isDraggingBottomPane, setIsDraggingBottomPane] = useState(false);

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
  const bottomPane = useLyraStore((s) => s.bottomPane);
  const setBottomPaneHeight = useLyraStore((s) => s.setBottomPaneHeight);
  const setBottomPaneTab = useLyraStore((s) => s.setBottomPaneTab);
  const toggleBottomPane = useLyraStore((s) => s.toggleBottomPane);
  const closeBottomPane = useLyraStore((s) => s.closeBottomPane);

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
    const offToggleSidebar = window.lyra.menu.onToggleSidebar?.(() => toggleSidebarCollapsed());
    const offToggleBottomPane = window.lyra.menu.onToggleBottomPane?.(() => useLyraStore.getState().toggleBottomPane());
    (window as any).__setPaletteOpen = setPaletteOpen;
    return () => {
      delete (window as any).__setPaletteOpen;
      offNewIssue();
      offPalette();
      offToggleChat();
      offToggleSidebar?.();
      offToggleBottomPane?.();
    };
  }, [openGeneralChat, toggleSidebarCollapsed]);

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
      if ((e.key === "j" || e.key === "J") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleBottomPane();
      }
      if ((e.key === "a" || e.key === "A") && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        if (useLyraStore.getState().companionPanel.kind === "agentChat") {
          useLyraStore.getState().closeCompanionPanel();
        } else {
          void openGeneralChat();
        }
      }
      if (e.key === "," && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        useLyraStore.getState().setSelection({ kind: "settings" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleSidebarCollapsed, toggleBottomPane, openGeneralChat]);

  const isCompanionOpen = companionPanel.kind !== "none";
  const effectiveCompanionWidth = isCompanionWide ? COMPANION_WIDE : companionWidth;

  return (
    <div className={styles.root}>
      <div className={styles.desktopBackdrop} />

      {/* Resizable Sidebar Column */}
      <div
        className={`${styles.sidebarWrap} ${isDraggingSidebar ? styles.noTransition : ""}`}
        style={{
          width: isSidebarCollapsed ? 0 : sidebarWidth,
          opacity: isSidebarCollapsed ? 0 : 1,
          pointerEvents: isSidebarCollapsed ? "none" : "auto",
        }}
      >
        <Sidebar onOpenSettings={() => useLyraStore.getState().setSelection({ kind: "settings" })} />
      </div>
      {!isSidebarCollapsed && (
        <Splitter
          axis="x"
          className={styles.sidebarSplitter}
          getStart={() => sidebarWidth}
          onChange={(w) => setSidebarWidth(Math.min(Math.max(w, SIDEBAR_MIN), SIDEBAR_MAX))}
          onReset={() => setSidebarWidth(SIDEBAR_DEFAULT)}
          onDraggingChange={setIsDraggingSidebar}
          title="Drag to resize sidebar (double-click to reset)"
        />
      )}

      <div className={styles.main}>
        <TopBar
          onToggleSidebar={toggleSidebarCollapsed}
          onOpenComposer={() => setComposerOpen(true)}
          onOpenPalette={() => setPaletteOpen(true)}
        />
        <div className={styles.contentRow}>
          <div className={styles.center}>
            <div className={styles.centerBody}>
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

            {bottomPane.isOpen && (
              <>
                <Splitter
                  axis="y"
                  className={styles.bottomSplitter}
                  getStart={() => bottomPane.height}
                  onChange={(h) =>
                    setBottomPaneHeight(
                      Math.min(Math.max(h, BOTTOM_PANE_MIN), window.innerHeight * BOTTOM_PANE_MAX_FRACTION)
                    )
                  }
                  onReset={() => setBottomPaneHeight(BOTTOM_PANE_DEFAULT)}
                  onDraggingChange={setIsDraggingBottomPane}
                  invert
                  title="Drag to resize (double-click to reset)"
                />
                <div
                  className={`${styles.bottomPane} ${isDraggingBottomPane ? styles.noTransition : ""}`}
                  style={{ height: bottomPane.height }}
                >
                  <DiffReview tab={bottomPane.tab} onTabChange={setBottomPaneTab} onClose={closeBottomPane} />
                </div>
              </>
            )}
          </div>

          {/* Resizable & Smooth Sliding Companion Panel */}
          {isCompanionOpen && (
            <Splitter
              axis="x"
              className={styles.companionSplitter}
              getStart={() => effectiveCompanionWidth}
              onChange={(w) =>
                setCompanionWidth(
                  Math.min(Math.max(w, COMPANION_MIN), Math.min(COMPANION_MAX, window.innerWidth - CENTER_MIN - sidebarWidth))
                )
              }
              onReset={() => setCompanionWidth(COMPANION_DEFAULT)}
              onDraggingChange={setIsDraggingCompanion}
              invert
              title="Drag to resize panel (double-click to reset)"
            />
          )}
          <div
            className={`${styles.companionWrap} ${isDraggingCompanion ? styles.noTransition : ""}`}
            style={{
              width: isCompanionOpen ? effectiveCompanionWidth : 0,
              opacity: isCompanionOpen ? 1 : 0,
              pointerEvents: isCompanionOpen ? "auto" : "none",
            }}
          >
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
