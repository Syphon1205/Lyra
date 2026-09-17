# Lyra Agent Instructions

- Preserve TypeScript, React, Electron, existing data, and approved assets.
- Do not replace working agent connections or add unrelated features.
- Respect project security and data-preservation rules (`MIGRATION.md`).

## Glass material (binding)

The strict glass-material correction pass is binding for window
composition, sidebar, agent panel, toolbar, and their materials:

- See `docs/glass-material-contract.md` — it overrides conflicting earlier
  aesthetic suggestions (not security or data-preservation rules).
- Success = rendered result + contract tests, not the word "glass" in CSS.
- Sidebar/chat stay dark in light mode; toolbar pale; center solid and
  scoped; one shared `GlassSurface` + tokens; explicit material modes
  (`native-vibrancy` / `css-preview` / `solid-accessibility` /
  `solid-unsupported`).
