# Migration checklist — SwiftUI → TypeScript/React/Electron

Source: `Lyra/` (native macOS app, Xcode project `Lyra.xcodeproj`). Kept in
place, untouched, for reference during migration. New app lives in `app/`.

## What actually existed before this migration

Inspected `Lyra/App/WorkspaceStore.swift` and `Lyra/Core/Mock/MockData.swift`:
the Swift app had **no persistence layer**. `WorkspaceStore` is an
`@Observable` in-memory class seeded once from `MockData` at launch; nothing
was ever written to SQLite/SwiftData/CoreData/disk. "Phase 2: persistence"
from the original plan was never implemented.

**Consequence:** there is no real user data to migrate. Nothing to export,
back up, or roll back. The new app seeds the equivalent demo fixtures
directly in TypeScript and persists *new* data going forward via SQLite —
this is a net improvement (the Swift app lost all data on every relaunch).

## Feature inventory → replacement

| Swift source | Feature | TS/React replacement | Data dependency | Validation |
|---|---|---|---|---|
| `Core/Models/*.swift` | Issue/Project/Cycle/User/Label/Activity models | `app/shared/types.ts` | none (fixtures) | type-check + seed round-trip |
| `App/WorkspaceStore.swift` | in-memory store, filters, undo | `electron/services/issueService.ts` (SQLite) + renderer Zustand store | none | manual CRUD path (§16 in the prompt) |
| `Components/SidebarView.swift` | Jira-style sidebar | `src/components/Sidebar.tsx` | — | visual compare to Jira nav reference |
| `Features/Projects/ProjectView.swift` + `BoardView`/`BacklogView`/`IssueTableView` | project shell, Board, Backlog, List | `src/components/Project/*` | issue store | drag/move/filter path |
| `Features/Issues/IssueDetailView.swift` | issue detail panel | `src/components/IssuePanel/*` | issue store | edit propagates to all views |
| `Core/Models/AgentChat.swift` (mock) | scripted agent chat | `electron/services/claudeAdapter.ts` (real `claude -p --output-format stream-json`) + `src/components/Chat/*` | Claude Code CLI on PATH | real streamed message, labeled non-demo |
| `Core/DesignSystem/*.swift` | Liquid Glass tokens | `src/styles/tokens.css` + `GlassSurface.tsx` (backdrop-filter + Electron vibrancy) | — | Reduce Transparency fallback |
| `design/LyraIcon.icon`, `Lyra/Resources/Assets.xcassets/AppIcon.appiconset` | Lyra mark, app icon | copied into `app/resources/` | — | renders in Dock after packaging |

## Explicitly not carried over as fake work

- Codex/Gemini/OpenCode adapters: **not implemented**. Only Claude Code has a
  real adapter (see §11 of the governing instructions: "implement one real
  integration before adding provider names with no functionality"). The
  adapter list in the UI shows Claude Code as available and the others as
  "not configured," not as working buttons.
- Code signing/notarization: config scaffolded, **not run** (requires a
  Developer ID + credentials this session doesn't have).
- 10k-issue / long-transcript performance measurement: **not run** — no
  Apple Silicon perf harness was set up in the time available. Flagged as an
  open item, not claimed as done.
