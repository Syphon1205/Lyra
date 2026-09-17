import { useEffect, useMemo, useState } from "react";
import { useLyraStore } from "../../state/store";
import { LyraIcon, LyraIconName } from "../../icons/LyraIcon";
import { issueKey } from "../../lib/issueMeta";
import styles from "./CommandPalette.module.css";

interface PaletteItem {
  id: string;
  category: "Actions" | "Issues" | "Projects" | "Agents" | "Files" | "Navigation" | "Settings";
  label: string;
  icon: LyraIconName;
  shortcut?: string;
  run: () => void;
}

const CATEGORIES = [
  { id: "Actions", label: "Actions", icon: "run" as LyraIconName },
  { id: "Issues", label: "Issues", icon: "board" as LyraIconName },
  { id: "Projects", label: "Projects", icon: "engineering" as LyraIconName },
  { id: "Agents", label: "Agents", icon: "agent" as LyraIconName },
  { id: "Files", label: "Files", icon: "document" as LyraIconName },
  { id: "Navigation", label: "Navigation", icon: "explore" as LyraIconName },
  { id: "Settings", label: "Settings", icon: "settings" as LyraIconName },
] as const;

export function CommandPalette({
  onClose,
  onOpenComposer,
}: {
  onClose: () => void;
  onOpenComposer: () => void;
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Actions");
  const [activeIndex, setActiveIndex] = useState(0);

  const projects = useLyraStore((s) => s.projects);
  const issues = useLyraStore((s) => s.issues);
  const setSelection = useLyraStore((s) => s.setSelection);
  const openIssueDetail = useLyraStore((s) => s.openIssueDetail);
  const openGeneralChat = useLyraStore((s) => s.openGeneralChat);
  const toggleSidebarCollapsed = useLyraStore((s) => s.toggleSidebarCollapsed);
  const openBottomPane = useLyraStore((s) => s.openBottomPane);
  const toggleBottomPane = useLyraStore((s) => s.toggleBottomPane);

  const allItems: PaletteItem[] = useMemo(() => {
    const baseActions: PaletteItem[] = [
      {
        id: "create-issue",
        category: "Actions",
        label: "Create new issue",
        icon: "plus",
        shortcut: "⌘ N",
        run: onOpenComposer,
      },
      {
        id: "ask-agent",
        category: "Actions",
        label: "Ask an agent",
        icon: "agent",
        shortcut: "⌘ ⇧ A",
        run: () => void openGeneralChat(),
      },
      {
        id: "toggle-sidebar",
        category: "Actions",
        label: "Toggle primary sidebar",
        icon: "sidebar",
        shortcut: "⌘ \\",
        run: () => toggleSidebarCollapsed(),
      },
      {
        id: "toggle-bottom-pane",
        category: "Actions",
        label: "Toggle bottom panel",
        icon: "terminal",
        shortcut: "⌘ J",
        run: () => toggleBottomPane(),
      },
      {
        id: "view-diff",
        category: "Actions",
        label: "View Git diff / changes",
        icon: "diff",
        shortcut: "",
        run: () => openBottomPane("diff"),
      },
      {
        id: "open-terminal",
        category: "Actions",
        label: "Open terminal",
        icon: "terminal",
        shortcut: "^ T",
        run: () => openBottomPane("terminal"),
      },
      {
        id: "view-files",
        category: "Actions",
        label: "View changed files",
        icon: "file",
        shortcut: "",
        run: () => openBottomPane("files"),
      },
      {
        id: "run-tests",
        category: "Actions",
        label: "Run test suite",
        icon: "tests",
        shortcut: "",
        run: () => openBottomPane("tests"),
      },
      {
        id: "open-lyr-142",
        category: "Actions",
        label: "Open LYR-142",
        icon: "board",
        shortcut: "",
        run: () => {
          const lyr142 = issues.find((i) => issueKey(i) === "LYR-142");
          if (lyr142) openIssueDetail(lyr142.id);
          else setSelection({ kind: "project", projectId: projects[0]?.id || "proj-lyra" });
        },
      },
      {
        id: "switch-project",
        category: "Actions",
        label: "Switch project",
        icon: "engineering",
        shortcut: "⌘ P",
        run: () => setSelection({ kind: "project", projectId: projects[0]?.id || "proj-lyra" }),
      },
      {
        id: "run-build",
        category: "Actions",
        label: "Run build",
        icon: "run",
        shortcut: "⌘ B",
        run: () => console.log("Run build"),
      },
      {
        id: "search-repo",
        category: "Actions",
        label: "Search repository",
        icon: "search",
        shortcut: "⇧ ⌘ F",
        run: () => console.log("Search repo"),
      },
      {
        id: "open-settings",
        category: "Actions",
        label: "Open settings",
        icon: "settings",
        shortcut: "⌘ ,",
        run: () => setSelection({ kind: "settings" }),
      },
    ];

    const issueItems: PaletteItem[] = issues.map((i) => ({
      id: `issue-${i.id}`,
      category: "Issues",
      label: `${issueKey(i)} ${i.title}`,
      icon: "board",
      run: () => openIssueDetail(i.id),
    }));

    const projectItems: PaletteItem[] = projects.map((p) => ({
      id: `proj-${p.id}`,
      category: "Projects",
      label: p.name,
      icon: "engineering",
      run: () => setSelection({ kind: "project", projectId: p.id }),
    }));

    const agentItems: PaletteItem[] = [
      {
        id: "agent-codex",
        category: "Agents",
        label: "Codex CLI",
        icon: "agent",
        run: () => void openGeneralChat(),
      },
      {
        id: "agent-astra",
        category: "Agents",
        label: "GPT-6 Astra",
        icon: "agent",
        run: () => void openGeneralChat(),
      },
      {
        id: "agent-claude",
        category: "Agents",
        label: "Claude Code",
        icon: "agent",
        run: () => void openGeneralChat(),
      },
    ];

    const navItems: PaletteItem[] = [
      {
        id: "nav-inbox",
        category: "Navigation",
        label: "Inbox",
        icon: "inbox",
        run: () => setSelection({ kind: "forYou" }),
      },
      {
        id: "nav-assigned",
        category: "Navigation",
        label: "Assigned to me",
        icon: "assigned",
        run: () => setSelection({ kind: "assigned" }),
      },
      {
        id: "nav-recent",
        category: "Navigation",
        label: "Recent",
        icon: "history",
        run: () => setSelection({ kind: "recent" }),
      },
      {
        id: "nav-starred",
        category: "Navigation",
        label: "Starred",
        icon: "star",
        run: () => setSelection({ kind: "starred" }),
      },
    ];

    return [...baseActions, ...issueItems, ...projectItems, ...agentItems, ...navItems];
  }, [issues, projects, onOpenComposer, openGeneralChat, openIssueDetail, setSelection]);

  const filteredItems = useMemo(() => {
    if (query.trim()) {
      const q = query.toLowerCase();
      return allItems.filter(
        (it) => it.label.toLowerCase().includes(q) || it.category.toLowerCase().includes(q)
      );
    }
    return allItems.filter((it) => it.category === activeCategory);
  }, [allItems, query, activeCategory]);

  useEffect(() => {
    setActiveIndex(0);
  }, [filteredItems]);

  const runSelected = () => {
    const item = filteredItems[activeIndex];
    if (item) {
      item.run();
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div className={styles.palette} onMouseDown={(e) => e.stopPropagation()}>
        {/* Search Header */}
        <div className={styles.searchRow}>
          <span className={styles.searchIcon}>
            <LyraIcon name="search" size={16} />
          </span>
          <input
            autoFocus
            placeholder="Search Lyra..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((i) => Math.min(i + 1, filteredItems.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((i) => Math.max(i - 1, 0));
              }
              if (e.key === "Enter") {
                e.preventDefault();
                runSelected();
              }
            }}
          />
          <span className={styles.cmdKBadge}>⌘ K</span>
        </div>

        {/* Split Body */}
        <div className={styles.bodyRow}>
          {/* Left Category Rail */}
          <div className={styles.categoryRail}>
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className={`${styles.categoryItem} ${activeCategory === cat.id && !query ? styles.categoryItemActive : ""}`}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setQuery("");
                }}
              >
                <LyraIcon name={cat.icon} size={14} />
                <span>{cat.label}</span>
              </div>
            ))}
          </div>

          {/* Right Results List */}
          <div className={styles.resultsList}>
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className={`${styles.item} ${index === activeIndex ? styles.itemActive : ""}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => {
                  item.run();
                  onClose();
                }}
              >
                <span className={styles.itemIcon}>
                  <LyraIcon name={item.icon} size={14} />
                </span>
                <span className={styles.itemLabel}>{item.label}</span>
                {item.shortcut && <span className={styles.shortcutBadge}>{item.shortcut}</span>}
              </div>
            ))}
            {filteredItems.length === 0 && (
              <div
                style={{
                  padding: "24px 16px",
                  textAlign: "center",
                  fontSize: 13,
                  color: "rgba(255, 255, 255, 0.4)",
                }}
              >
                No matching results
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerHints}>
            <span>Type to search,</span>
            <span className={styles.footerKbd}>↑</span>
            <span className={styles.footerKbd}>↓</span>
            <span>to navigate,</span>
            <span className={styles.footerKbd}>↵</span>
            <span>to select</span>
          </div>
          <div>
            <span className={styles.footerKbd}>esc</span> to close
          </div>
        </div>
      </div>
    </div>
  );
}
