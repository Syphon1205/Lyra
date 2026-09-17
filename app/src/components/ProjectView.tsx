import { useLyraStore } from "../state/store";
import { LyraIcon } from "../icons/LyraIcon";
import { LyraMark } from "./Sidebar";
import { Avatar } from "./Avatar";
import { STATUS_LABEL, ISSUE_STATUSES_ORDERED } from "../lib/issueMeta";
import { Board } from "./Board/Board";
import { Backlog } from "./Backlog/Backlog";
import { ListView } from "./ListView/ListView";
import styles from "./ProjectView.module.css";

const TABS = [
  { id: "board", label: "Board" },
  { id: "backlog", label: "Backlog" },
  { id: "list", label: "List" },
  { id: "timeline", label: "Timeline" },
  { id: "components", label: "Components" },
  { id: "releases", label: "Releases" },
  { id: "pages", label: "Pages" },
  { id: "settings", label: "Settings" },
] as const;

export function ProjectView({ projectId }: { projectId: string }) {
  const project = useLyraStore((s) => s.projects.find((p) => p.id === projectId));
  const projectTab = useLyraStore((s) => s.projectTab);
  const setProjectTab = useLyraStore((s) => s.setProjectTab);
  const toggleStar = useLyraStore((s) => s.toggleStar);
  const users = useLyraStore((s) => s.users);

  if (!project) return null;

  return (
    <div className={styles.container}>
      {/* Project Header */}
      <div className={styles.header}>
        <LyraMark size={40} variant="tile" />

        <div className={styles.titleGroup}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{project.name}</h1>
            <button
              className={`${styles.iconButton} ${project.starred ? styles.starActive : ""}`}
              onClick={() => void toggleStar(project.id)}
              title={project.starred ? "Unstar" : "Star"}
              style={{ color: project.starred ? "#e2b203" : "var(--lyra-text-muted)" }}
            >
              <LyraIcon name={project.starred ? "star-filled" : "star"} size={16} />
            </button>
          </div>
          <div className={styles.description}>
            {project.summary || "Build, iterate, and ship the next generation of project management."}
          </div>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.avatarStack}>
            {users.slice(0, 3).map((user) => (
              <Avatar key={user.id} name={user.name} colorSeed={user.colorSeed} size={26} />
            ))}
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "var(--lyra-surface)",
                border: "2px solid var(--lyra-canvas)",
                fontSize: 10.5,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--lyra-text-muted)",
              }}
            >
              +4
            </div>
          </div>

          <button className={styles.shareButton} title="Share project">
            <LyraIcon name="share" size={13} />
            Share
          </button>

          <button className={styles.iconButton} title="More options">
            <LyraIcon name="overflow" size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${projectTab === tab.id ? styles.tabActive : ""}`}
            onClick={() => setProjectTab(tab.id as any)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Strip */}
      <FilterStrip projectId={projectId} />

      {/* Workspace Content */}
      <div className={styles.content}>
        {projectTab === "board" && <Board projectId={projectId} />}
        {projectTab === "backlog" && <Backlog projectId={projectId} />}
        {projectTab === "list" && <ListView projectId={projectId} />}
        {projectTab !== "board" && projectTab !== "backlog" && projectTab !== "list" && (
          <div style={{ padding: 40, textAlign: "center", color: "var(--lyra-text-muted)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>{String(projectTab).charAt(0).toUpperCase() + String(projectTab).slice(1)}</h3>
            <p style={{ fontSize: 13, marginTop: 6 }}>Switch to Board or Backlog to view active cycles and tasks.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterStrip({ projectId }: { projectId: string }) {
  const users = useLyraStore((s) => s.users);
  const cycles = useLyraStore((s) => s.cycles);
  const labels = useLyraStore((s) => s.labels);
  const projects = useLyraStore((s) => s.projects);
  const searchText = useLyraStore((s) => s.searchText);
  const setSearchText = useLyraStore((s) => s.setSearchText);
  const assigneeFilter = useLyraStore((s) => s.assigneeFilter);
  const setAssigneeFilter = useLyraStore((s) => s.setAssigneeFilter);
  const statusFilter = useLyraStore((s) => s.statusFilter);
  const setStatusFilter = useLyraStore((s) => s.setStatusFilter);
  const sprintFilter = useLyraStore((s) => s.sprintFilter);
  const setSprintFilter = useLyraStore((s) => s.setSprintFilter);
  const clearFilters = useLyraStore((s) => s.clearFilters);

  const project = projects.find((p) => p.id === projectId);
  const memberIds = new Set(project?.memberIds ?? []);
  const projectCycles = cycles.filter((c) => c.projectId === projectId);
  const hasFilters = !!searchText || !!assigneeFilter || !!statusFilter || !!sprintFilter;

  return (
    <div className={styles.filterStrip}>
      <div className={styles.searchBox}>
        <LyraIcon name="search" size={13} style={{ color: "var(--lyra-text-muted)" }} />
        <input
          placeholder="Search board…"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {/* Assignee Filter */}
        <select
          className={styles.filterPill}
          value={assigneeFilter ?? ""}
          onChange={(e) => setAssigneeFilter(e.target.value || null)}
        >
          <option value="">Assignee ▾</option>
          {users
            .filter((u) => memberIds.has(u.id))
            .map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
        </select>

        {/* Status Filter */}
        <select
          className={styles.filterPill}
          value={statusFilter ?? ""}
          onChange={(e) => setStatusFilter((e.target.value || null) as any)}
        >
          <option value="">Status ▾</option>
          {ISSUE_STATUSES_ORDERED.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>

        {/* Labels Filter */}
        <select className={styles.filterPill} defaultValue="">
          <option value="">Labels ▾</option>
          {labels.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>

        {/* Sprint Filter */}
        <select
          className={styles.filterPill}
          value={sprintFilter ?? ""}
          onChange={(e) => setSprintFilter(e.target.value || null)}
        >
          <option value="">Sprint ▾</option>
          {projectCycles.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Type Filter */}
        <select className={styles.filterPill} defaultValue="">
          <option value="">Type ▾</option>
          <option value="task">Task</option>
          <option value="bug">Bug</option>
          <option value="story">Story</option>
          <option value="epic">Epic</option>
        </select>

        {/* More Filter */}
        <button className={styles.filterPill} title="More filters">
          More ▾
        </button>

        {hasFilters && (
          <button className={styles.clearFilters} onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: 12, color: "var(--lyra-text-muted)" }}>Group by:</div>
        <select className={styles.filterPill} defaultValue="status">
          <option value="status">Status ▾</option>
          <option value="assignee">Assignee ▾</option>
          <option value="priority">Priority ▾</option>
        </select>
        <button className={styles.iconButton} title="View Settings">
          <LyraIcon name="filters" size={14} />
        </button>
      </div>
    </div>
  );
}
