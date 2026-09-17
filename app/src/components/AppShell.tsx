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
import { AppIcon } from "./AppIcon";
import { Avatar } from "./Avatar";
import styles from "./AppShell.module.css";

export function AppShell() {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const selection = useLyraStore((s) => s.selection);
  const companionPanel = useLyraStore((s) => s.companionPanel);
  const issues = useLyraStore((s) => s.issues);
  const currentUserId = useLyraStore((s) => s.currentUserId);
  const recentIssueIds = useLyraStore((s) => s.recentIssueIds);
  const openGeneralChat = useLyraStore((s) => s.openGeneralChat);

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
      if (e.key === "," && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        useLyraStore.getState().setSelection({ kind: "settings" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.desktopBackdrop} />
      {sidebarVisible && <Sidebar onOpenSettings={() => useLyraStore.getState().setSelection({ kind: "settings" })} />}
      <div className={styles.main}>
        <TopBar onToggleSidebar={() => setSidebarVisible((v) => !v)} onOpenComposer={() => setComposerOpen(true)} onOpenPalette={() => setPaletteOpen(true)} />
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

          {companionPanel.kind === "issueDetail" && <IssuePanel issueId={companionPanel.issueId} />}
          {companionPanel.kind === "agentChat" && <ChatPanel sessionId={companionPanel.sessionId} />}
        </div>
      </div>

      {composerOpen && <IssueComposer onClose={() => setComposerOpen(false)} />}
      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} onOpenComposer={() => setComposerOpen(true)} />}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
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
