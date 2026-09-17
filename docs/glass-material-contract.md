# LYRA: Strict Glass-Material Correction Pass (Contract)

Approved visual reference: dark, smoky, blue-gray translucent navigation on
the left; bright, cool-white project canvas in the middle; matching dark
translucent agent panel on the right; pale translucent toolbar; fine
highlights, restrained selection states, sharp text/icons. The dark sidebar
and dark chat MUST remain dark in the approved light appearance.

This pass is exclusively about correcting window composition, sidebar, agent
panel, toolbar, and their materials. Do not restart the application, rebuild
the backend, replace working agent connections, or add unrelated features.
Preserve TypeScript, React, Electron, existing data, and approved assets.
These requirements override conflicting earlier aesthetic suggestions, not
project security or data-preservation rules.

Success requires the rendered result and the tests below — not merely the
word "glass" in CSS.

## 1. Locked composition (starting targets, ~1472x940 content)

- Sidebar: 238px. Toolbar: 54px tall. Chat: 332px, resizable.
- Center: remaining width. Chat shell: ~18px corners, fine highlighted edge.
- Navigation rows: ~31px. Keep responsive behavior.
- Do not shrink the app with a CSS transform.
- Desktop wallpaper around the reference is NOT an application asset.

## 2. Material modes (explicit, on `<html data-material-mode>`)

- `native-vibrancy`: production on supported macOS. Native vibrancy supplies
  the desktop-backed effect; DOM adds restrained tint, borders, content.
  Electron 33 (`electron@^33.4.11` pinned in `app/package.json`):
  `BrowserWindow({ vibrancy: "under-window", backgroundColor: "#00000000" })`
  with whole-window opacity 1. No `transparent: true`. No full-app translucency.
- `css-preview`: browser-only, development-only backdrop scene for testing DOM
  materials. CSS blur operates on that scene, never the real desktop. Never
  ship the scene as a production wallpaper or as proof of native vibrancy.
- `solid-accessibility`: Reduce Transparency or user-selected solid style.
- `solid-unsupported`: genuinely unsupported environments.
- Record the fallback reason in development diagnostics. Never silently fall
  back on a supported Mac because the native path is unimplemented.

## 3. Paint boundaries (conceptual hierarchy)

```
AppShell [transparent]
  WorkspaceSidebar [glass]
  MainArea [transparent]
    Toolbar [light material]
    WorkRow [transparent]
      WorkspaceCanvas [solid light surface]
      AgentPanel [glass]
```

- The solid canvas MUST end at the canvas boundary (scoped to the workspace
  component, never beneath sidebar/chat).
- `html`, `body`, `#root`, shared wrappers stay transparent in glass regions.
- One principal material/tint plane per side panel. Sidebar groups and the
  chat transcript do not each get another full-size fill. Small nested
  controls may have subtle state fills.
- Use alpha in background colors, never `opacity` on the panel container.
  Never `filter: blur()` a panel containing text. No opaque gradient as a
  transmission substitute. No decorative cloudy wallpaper layer in production.

## 4. Shared implementation

One shared `GlassSurface` + shared tokens. Sidebar and chat consume the same
base material. Variants: dark chrome, light toolbar, compact
control/composer, solid fallback.

Starting tokens (tune against real screenshots; native material affects the
final look):

```css
--lyra-glass-tint: rgb(30 43 61 / 0.36);
--lyra-glass-edge: rgb(255 255 255 / 0.18);
--lyra-glass-highlight: rgb(255 255 255 / 0.10);
--lyra-glass-text: #F4F7FC;
--lyra-glass-muted: #C2CCD9;
--lyra-glass-hover: rgb(255 255 255 / 0.07);
--lyra-glass-selected: rgb(255 255 255 / 0.11);
--lyra-workspace: #F6F8FE;
--lyra-accent: #626BFF;
```

css-preview only: `backdrop-filter: blur(28px) saturate(1.15)`. Native desktop
blur is not controlled by CSS. Avoid redundant CSS filtering over a
native-backed panel unless testing shows a benefit. Fine boundary + subtle
inset top highlight. No neon glow, no thick white outline. Keep expensive
blur scoped; never animate blur radius; no per-row effect; no blanket
`will-change`. Accessibility takes priority over any alpha value.

## 5. Panel details

Sidebar: one continuous plane top-to-bottom; white/slate icons; compact
text; subtle transparent selection; no solid card per group; no oversized
purple selection; no opaque default sidebar background.
Chat: same smoky family; transcript clear relative to panel; no huge opaque
card behind conversation; small restrained tool-result surfaces; composer
anchored at bottom with light edge + modest tint; crisp New Chat /
Attachment / Send / Stop icons; preserve approved Lyra logo + periwinkle
square. Toolbar pale/quiet; center bright/stable; board is not another giant
glass surface.

## 6. Proof required (same native window factory + shared GlassSurface)

Controlled light/dark or two-color backing behind the actual app (a test
window behind Lyra is acceptable; keep personal desktop content out):

A. Backing change visibly changes unobstructed areas of BOTH panels.
B. Backing detail is softened, not sharply readable.
C. Text/icons stay sharp. D. Solid center is wallpaper-independent.
E. Scrolling reveals no opaque full-panel wrapper.
F. Resizing, focus changes, open/close chat do not break the effect.

Browser screenshots alone are not desktop-backing evidence. Compare
like-for-like captures. If the host cannot run the native app, finish
DOM/layout work and report native-material verification as outstanding —
never claim it passed.

## 7. Rejection criteria (normal supported native mode)

Opaque slab panels; glass only in an isolated demo; center white under chat;
faded text from parent/window opacity; stacked full-panel scrims; only
borders/glows changed; reference wallpaper baked in; screen-recording
required; accessibility prefs must be disabled; resizing/controls sacrificed;
whole app white or dark instead of mixed composition; mock image as proof.
Solid accessibility / unsupported modes are valid only when tested and
identified separately.

## 8. Regression guards

Theme switching preserves dark chrome in light mode. Workspace background
scoped to workspace. Main glass containers `opacity: 1`. Documented
fallbacks for unsupported + reduced-transparency. Scroll/resize preserve
material. Sidebar/chat share tokens. Deterministic screenshot tests for
geometry + renderer surfaces (not a substitute for native-compositor
verification).

## 9. Diagnosis (actual files, this repo)

- Native factory: `app/electron/main.ts` `createMainWindow()` (also
  `createIssueWindow`/`createChatWindow`): `vibrancy: "under-window"`,
  `backgroundColor: "#00000000"`, no `transparent: true`. Verified pattern
  preserving shadows/resizing on Electron 33. Whole-window opacity untouched.
- Renderer root: `app/src/index.html` → `app/src/main.tsx` → `app/src/App.tsx`
  (`documentElement.dataset.theme`, `data-reduce-transparency`) →
  `app/src/components/AppShell.tsx` → layout wrappers
  (`AppShell.module.css`) → `Sidebar`/`TopBar`/`ProjectView`/`Chat/ChatPanel`.
- Responsible defects fixed in this pass:
  - `ChatPanel.module.css .panel { background: var(--lyra-canvas) }` made the
    chat an opaque slab (in chrome scope this resolved to solid
    `--lyra-chrome-bg`). Removed; panel is now the single glass plane.
  - Nested full-size `GlassSurface variant="standard"` in chat header +
    composer over the opaque panel stacked dark fills. Collapsed to one
    principal plane; header transparent, composer compact variant only.
  - `GlassSurface.module.css` had no material modes and light-theme
    `--lyra-glass-tint: rgba(255,255,255,0.55)` risked turning chrome white.
    Chrome now consumes fixed dark tokens independent of `data-theme`.
  - `AppShell.module.css .center { background: var(--lyra-canvas) }` is
    correctly scoped (sibling of chat, not an ancestor), but re-mapped to
    explicit `--lyra-workspace` so theme overrides cannot leak.
  - `tokens.css --lyra-chrome-tint: rgba(28,40,56,0.72)` was too opaque to
    show any backing. Retuned toward `rgb(30 43 61 / 0.36)` starting target
    with explicit edge/highlight tokens.
- No `opacity < 1` on panel containers; no `filter: blur()` on text panels;
  no `::before/::after` full-size opaque scrims found; no global transform.

## 10. Completion evidence required

Diagnosis + files changed; before/after screenshots at comparable
dimensions; tight sidebar/chat crops; native material config + runtime
version; controlled-backdrop results; reduced-transparency screenshot;
remaining failures / unverified behavior. Build, launch, inspect, correct,
repeat. Do not start another feature pass until this contract is met or a
concrete platform limitation is documented as incomplete.
