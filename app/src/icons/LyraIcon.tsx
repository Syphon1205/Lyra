/**
 * Lyra custom icon system. Original 24x24 line icons, 1.7px stroke,
 * round caps and joins, drawn to sit crisply at 14, 16, 18, 20, 24px.
 *
 * Usage: <LyraIcon name="inbox" size={16} />
 */
import type { CSSProperties } from "react";

const STROKE = 1.7;

export type IconName =
  // Navigation
  | "search"
  | "inbox"
  | "my-issues"
  | "assigned"
  | "created"
  | "history"
  | "star"
  | "star-filled"
  | "projects"
  | "filters"
  | "teams"
  | "settings"
  | "command-k"
  // Projects & Features
  | "engineering"
  | "design"
  | "infrastructure"
  | "mobile"
  | "document"
  | "repository"
  | "branch"
  | "commit"
  | "pull-request"
  | "file"
  | "diff"
  | "terminal"
  | "tests"
  | "worktree"
  | "comment"
  // Issues & Status
  | "priority-urgent"
  | "priority-high"
  | "priority-medium"
  | "priority-low"
  | "priority-none"
  | "type-bug"
  | "type-story"
  | "type-task"
  | "type-epic"
  // Agents & Automations
  | "agent"
  | "run"
  | "new-chat"
  | "context"
  | "attachment"
  | "send"
  | "mic"
  | "stop"
  | "tool"
  | "approval"
  | "success"
  | "error"
  // Providers
  | "provider-codex"
  | "provider-astra"
  | "provider-claude"
  | "provider-gemini"
  | "provider-opencode"
  | "provider-kilo"
  | "github"
  // UI Controls
  | "sidebar"
  | "chevron-down"
  | "chevron-right"
  | "chevron-up"
  | "plus"
  | "close"
  | "overflow"
  | "notification"
  | "share"
  | "detach"
  | "lock"
  | "check"
  | "more"
  | "board"
  | "explore";

export type LyraIconName = IconName;

const paths: Record<IconName, JSX.Element> = {
  more: (
    <>
      <circle cx="6" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  board: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M9 4v16M15 4v16" />
    </>
  ),
  explore: (
    <>
      <circle cx="12" cy="12" r="8" />
      <polygon points="15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5 15.5 8.5" fill="currentColor" opacity="0.3" />
      <polygon points="15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5 15.5 8.5" />
    </>
  ),
  // Navigation
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4.5 4.5" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 13h4.5l1.5 2.5h4l1.5-2.5H20" />
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
    </>
  ),
  "my-issues": (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19.5c0-3.5 3.1-6 7-6s7 2.5 7 6" />
    </>
  ),
  assigned: (
    <>
      <circle cx="11" cy="8" r="3.5" />
      <path d="M4.5 19.5c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6" />
      <path d="m16 9 2 2 4-4" strokeWidth="1.5" />
    </>
  ),
  created: (
    <>
      <path d="M6 3.5h8.5l4.5 4.5V20a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 20V5A1.5 1.5 0 0 1 6 3.5Z" />
      <path d="M14.5 3.5V8H19" />
      <path d="M12 11.5v6M9 14.5h6" />
    </>
  ),
  history: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  star: <path d="M12 3.5 14.7 9l6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6L3.3 9.9l6-.9Z" />,
  "star-filled": <path d="M12 3.5 14.7 9l6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6L3.3 9.9l6-.9Z" fill="currentColor" stroke="none" />,
  projects: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  filters: <path d="M4 6h16M7 12h10M10 18h4" />,
  teams: (
    <>
      <circle cx="9" cy="8.5" r="3" />
      <circle cx="16.5" cy="9.5" r="2.5" />
      <path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <path d="M14.5 15.2c2.2.3 4 1.8 4 4.3" />
    </>
  ),
  settings: (
    <>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  "command-k": (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
      <path d="M8 12h2.5M10.5 9.5v5M13.5 9.5v5M13.5 12l3-2.5M13.5 12l3 2.5" />
    </>
  ),

  // Projects & Features
  engineering: (
    <>
      <path d="M14.5 3.5 20.5 9.5 9.5 20.5 3.5 14.5Z" />
      <path d="m8 12 4 4" strokeWidth="1.4" />
    </>
  ),
  design: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <circle cx="9" cy="9.5" r="1.6" fill="currentColor" stroke="none" />
      <path d="M13 15c1.8 0 3-1 3-2.6 0-1-.7-1.7-1.7-1.7-.7 0-1.1.4-1.1 1 0 .5.3.8.8.8" />
    </>
  ),
  infrastructure: (
    <>
      <rect x="4" y="3.5" width="16" height="6" rx="1.5" />
      <rect x="4" y="14.5" width="16" height="6" rx="1.5" />
      <circle cx="7.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="7.5" cy="17.5" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  mobile: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.2" />
      <path d="M11 18.5h2" />
    </>
  ),
  document: (
    <>
      <path d="M6.5 3h7l4 4v13.5a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M13.5 3v4h4" />
      <path d="M8.5 12.5h7M8.5 16h5" />
    </>
  ),
  repository: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2.5" />
      <path d="M8 8.5h8M8 12h8M8 15.5h5" />
    </>
  ),
  branch: (
    <>
      <circle cx="6.5" cy="6" r="2.2" />
      <circle cx="6.5" cy="18" r="2.2" />
      <circle cx="17.5" cy="14" r="2.2" />
      <path d="M6.5 8.2v7.6" />
      <path d="M6.5 10.5c0 3 2.5 3.5 6 3.5h2.8" />
    </>
  ),
  commit: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M3 12h6M15 12h6" />
    </>
  ),
  "pull-request": (
    <>
      <circle cx="6.5" cy="6" r="2.2" />
      <circle cx="6.5" cy="18" r="2.2" />
      <circle cx="17.5" cy="8" r="2.2" />
      <path d="M6.5 8.2v7.6" />
      <path d="M17.5 10.2v3.8c0 2.5-2 4-5 4H8.7" />
    </>
  ),
  file: (
    <>
      <path d="M6.5 3.5h7.5l4.5 4.5v12.5a1.5 1.5 0 0 1-1.5 1.5h-10.5a1.5 1.5 0 0 1-1.5-1.5V5a1.5 1.5 0 0 1 1.5-1.5Z" />
      <path d="M14 3.5V8h4.5" />
    </>
  ),
  diff: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M12 4v16" strokeDasharray="2 2" />
      <path d="M7 10h3M14 14h3M15.5 12.5v3" />
    </>
  ),
  terminal: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <path d="m8 9 3 3-3 3M13 15h3.5" />
    </>
  ),
  tests: (
    <>
      <path d="M9 3v4.5L5 15.5a2 2 0 0 0 1.8 2.5h10.4a2 2 0 0 0 1.8-2.5L15 7.5V3" />
      <path d="M8 3h8M8 12h8" />
    </>
  ),
  worktree: (
    <>
      <rect x="3.5" y="3.5" width="8" height="8" rx="2" />
      <rect x="12.5" y="12.5" width="8" height="8" rx="2" />
      <path d="M7.5 11.5v5h5" />
    </>
  ),
  comment: <path d="M4 5.5h16a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1H9l-4.5 4V16H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1Z" />,

  // Issues & Status
  "priority-urgent": (
    <>
      <path d="m6 16 6-6 6 6" strokeWidth="1.9" />
      <path d="m6 11 6-6 6 6" strokeWidth="1.9" />
    </>
  ),
  "priority-high": <path d="m6 15 6-7 6 7" strokeWidth="1.8" />,
  "priority-medium": (
    <>
      <path d="M6 10h12" strokeWidth="1.8" />
      <path d="M6 14h12" strokeWidth="1.8" />
    </>
  ),
  "priority-low": <path d="m6 9 6 7 6-7" strokeWidth="1.8" />,
  "priority-none": <path d="M7 12h10" strokeDasharray="2 3" strokeWidth="1.6" />,
  "type-bug": (
    <>
      <circle cx="12" cy="13" r="4.5" />
      <path d="M12 8.5v-3M9 6l6 0M6 11.5H3.5M20.5 11.5H18M6.5 16 4 18M17.5 16 20 18M7 8.5 5 7M17 8.5l2-1.5" strokeWidth="1.4" />
    </>
  ),
  "type-story": (
    <>
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <path d="M8 8h8M8 12h6" />
    </>
  ),
  "type-task": (
    <>
      <rect x="4.5" y="4.5" width="15" height="15" rx="3" />
      <path d="m8.5 12 2.5 2.5L16 9" strokeWidth="1.8" />
    </>
  ),
  "type-epic": (
    <>
      <path d="M13 2 5 13h5.5L11 22l8-12h-5.5Z" />
    </>
  ),

  // Agents & Automations
  agent: (
    <>
      <rect x="4.5" y="5.5" width="15" height="13" rx="3" />
      <circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 2.5v3M8 18.5v2.5M16 18.5v2.5M2 12h2.5M19.5 12H22" />
    </>
  ),
  run: <path d="M8 5v14l10-7Z" fill="currentColor" stroke="none" />,
  "new-chat": (
    <>
      <path d="M4 5.5h13a1.5 1.5 0 0 1 1.5 1.5V13a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 4V14.5H4A1.5 1.5 0 0 1 2.5 13V7A1.5 1.5 0 0 1 4 5.5Z" />
      <path d="M18.5 3v5M16 5.5h5" strokeWidth="1.6" />
    </>
  ),
  context: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v4l2.6 2.6" />
    </>
  ),
  attachment: (
    <path d="M16.5 7.5 9 15a2.5 2.5 0 1 0 3.5 3.5L20 11a4.5 4.5 0 1 0-6.4-6.4L6.5 11.7a1 1 0 1 0 1.4 1.4" />
  ),
  send: <path d="M21 3 3 10.5l7 2.5 2.5 7L21 3Z" />,
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8" />
    </>
  ),
  stop: <rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor" />,
  tool: (
    <path d="M14.5 3.5a4.5 4.5 0 0 0-5.9 4.9L4 13l3 3 4.6-4.6a4.5 4.5 0 0 0 4.9-5.9l-2.9 2.9-2.1-2.1Z" />
  ),
  approval: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="m8.5 12.5 2.3 2.3L16 9.5" />
    </>
  ),
  success: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.3 12.3 2.3 2.3 5-5" strokeWidth="1.8" />
    </>
  ),
  error: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m9 9 6 6M15 9l-6 6" strokeWidth="1.8" />
    </>
  ),

  // Providers
  "provider-codex": (
    <>
      <path d="M12 3a9 9 0 0 1 7.8 4.5l-2.3 1.3A6.3 6.3 0 0 0 12 5.7V3Z" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="5" strokeWidth="1.5" />
      <path d="m8.5 10 3.5 2-3.5 2" strokeWidth="1.5" />
    </>
  ),
  "provider-astra": (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4v16M4 12h16M6.5 6.5l11 11M17.5 6.5l-11 11" strokeWidth="1.2" />
    </>
  ),
  "provider-claude": (
    <>
      <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
    </>
  ),
  "provider-gemini": (
    <path d="M12 3C12 8 8 12 3 12c5 0 9 4 9 9 0-5 4-9 9-9-5 0-9-4-9-9Z" fill="currentColor" stroke="none" />
  ),
  "provider-opencode": (
    <>
      <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12" />
    </>
  ),
  "provider-kilo": (
    <path d="M6 4v16M18 4l-8 8 8 8" strokeWidth="2.2" />
  ),
  github: (
    <path
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
      fill="currentColor"
      stroke="none"
    />
  ),

  // UI Controls
  sidebar: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <path d="M9.5 4.5v15" />
    </>
  ),
  "chevron-down": <path d="m6 9.5 6 5.5 6-5.5" strokeWidth="1.8" />,
  "chevron-right": <path d="m9.5 6 5.5 6-5.5 6" strokeWidth="1.8" />,
  "chevron-up": <path d="m6 14.5 6-5.5 6 5.5" strokeWidth="1.8" />,
  plus: <path d="M12 5v14M5 12h14" strokeWidth="1.8" />,
  close: <path d="m6 6 12 12M18 6 6 18" strokeWidth="1.8" />,
  overflow: (
    <>
      <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  notification: (
    <>
      <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5.5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="18.5" r="2.5" />
      <path d="m8.2 13.1 7.6 4.3M15.8 6.6 8.2 10.9" />
    </>
  ),
  detach: (
    <>
      <path d="m11 13 8-8M14 5h5v5" />
      <path d="M18 13v5a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 5 18V8A1.5 1.5 0 0 1 6.5 6.5H11" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2.2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7" strokeWidth="1.9" />,
};

export function LyraIcon({
  name,
  size = 16,
  className,
  style,
  strokeWidth = STROKE,
  decorative = true,
}: {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
  decorative?: boolean;
}) {
  const element = paths[name] ?? paths.document;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
      aria-hidden={decorative ? "true" : undefined}
      focusable="false"
    >
      {element}
    </svg>
  );
}
