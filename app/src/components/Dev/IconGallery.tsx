import { useState } from "react";
import { LyraIcon, type IconName } from "../../icons/LyraIcon";

const ALL_ICONS: IconName[] = [
  "search",
  "inbox",
  "my-issues",
  "assigned",
  "created",
  "history",
  "star",
  "star-filled",
  "projects",
  "filters",
  "teams",
  "settings",
  "command-k",
  "engineering",
  "design",
  "infrastructure",
  "mobile",
  "document",
  "repository",
  "branch",
  "commit",
  "pull-request",
  "file",
  "diff",
  "terminal",
  "tests",
  "worktree",
  "comment",
  "priority-urgent",
  "priority-high",
  "priority-medium",
  "priority-low",
  "priority-none",
  "type-bug",
  "type-story",
  "type-task",
  "type-epic",
  "agent",
  "run",
  "new-chat",
  "context",
  "attachment",
  "send",
  "mic",
  "stop",
  "tool",
  "approval",
  "success",
  "error",
  "provider-codex",
  "provider-astra",
  "provider-claude",
  "provider-gemini",
  "provider-opencode",
  "sidebar",
  "chevron-down",
  "chevron-right",
  "chevron-up",
  "plus",
  "close",
  "overflow",
  "notification",
  "share",
  "detach",
  "lock",
  "check",
];

const SIZES = [14, 16, 18, 20, 24] as const;

export function IconGallery() {
  const [filter, setFilter] = useState("");
  const filtered = ALL_ICONS.filter((name) => name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: "0 auto", color: "var(--lyra-text)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Lyra Icon System Gallery</h1>
          <p style={{ color: "var(--lyra-text-muted)", fontSize: 13, marginTop: 4 }}>
            Original 24x24 vector icons · 1.7 stroke · round caps & joins · rendered at 14, 16, 18, 20, and 24px
          </p>
        </div>
        <input
          type="text"
          placeholder="Filter icons…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid var(--lyra-border)",
            background: "var(--lyra-card)",
            color: "var(--lyra-text)",
            fontSize: 13,
            width: 220,
          }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {filtered.map((name) => (
          <div
            key={name}
            style={{
              padding: 14,
              borderRadius: 10,
              border: "1px solid var(--lyra-border)",
              background: "var(--lyra-card)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--lyra-text-muted)" }}>{name}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              {SIZES.map((size) => (
                <div key={size} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 6,
                      background: "var(--lyra-surface)",
                    }}
                  >
                    <LyraIcon name={name} size={size} />
                  </div>
                  <span style={{ fontSize: 10, color: "var(--lyra-text-faint)" }}>{size}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
