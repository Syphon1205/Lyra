import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, "..");
const read = (rel: string) => fs.readFileSync(path.resolve(src, rel), "utf8");

describe("glass-material contract", () => {
  it("shares one GlassSurface with dark-chrome / light-toolbar / compact / solid variants", () => {
    const tsx = read("components/GlassSurface.tsx");
    for (const v of ['"dark-chrome"', '"light-toolbar"', '"compact"', '"solid"']) {
      expect(tsx).toContain(v);
    }
    expect(tsx).toContain("data-material-mode");
    // Legacy aliases preserved for existing call sites.
    expect(tsx).toContain("standard");
  });

  it("defines shared starting tokens and geometry", () => {
    const tokens = read("styles/tokens.css");
    for (const t of [
      "--lyra-glass-tint",
      "--lyra-glass-edge",
      "--lyra-glass-highlight",
      "--lyra-glass-text",
      "--lyra-glass-muted",
      "--lyra-glass-hover",
      "--lyra-glass-selected",
      "--lyra-workspace",
      "--lyra-accent",
    ]) {
      expect(tokens).toContain(t);
    }
    expect(tokens).toContain("--lyra-sidebar-width: 238px");
    expect(tokens).toContain("--lyra-panel-width: 332px");
    expect(tokens).toContain("--lyra-topbar-height: 54px");
    // Dark chrome stays translucent, not an opaque slab.
    expect(tokens).not.toContain("--lyra-chrome-tint: rgba(28, 40, 56, 0.72)");
  });

  it("keeps dark chrome dark in light mode via chrome scope", () => {
    const global = read("styles/global.css");
    expect(global).toContain(".lyra-chrome-scope");
    expect(global).toContain("--lyra-chrome-text");
    const tokens = read("styles/tokens.css");
    // Chrome scope tokens are fixed, not redefined under [data-theme=light].
    const lightBlock = tokens.split('[data-theme="dark"]')[0] ?? "";
    expect(lightBlock).toContain("--lyra-chrome-tint");
  });

  it("scopes the solid workspace to the canvas, keeps shell transparent", () => {
    const shell = read("components/AppShell.module.css");
    expect(shell).toMatch(/\.root\s*\{[^}]*background:\s*transparent/);
    expect(shell).toMatch(/\.contentRow\s*\{[^}]*background:\s*transparent/);
    expect(shell).toMatch(/\.center\s*\{[^}]*background:\s*var\(--lyra-workspace\)/);
    expect(shell).not.toMatch(/\.contentRow\s*\{[^}]*background:\s*var\(--lyra-canvas\)/);
    const html = read("index.html");
    expect(html).toBeTruthy();
    const global = read("styles/global.css");
    expect(global).toMatch(/#root\s*\{[^}]*background:\s*transparent/);
  });

  it("gives chat one glass plane: transparent transcript, 18px shell, resizable", () => {
    const css = read("components/Chat/ChatPanel.module.css");
    expect(css).toMatch(/\.panel\s*\{[^}]*opacity:\s*1/);
    expect(css).not.toMatch(/\.panel\s*\{[^}]*background:\s*var\(--lyra-canvas\)/);
    expect(css).toMatch(/\.messages\s*\{[^}]*background:\s*transparent/);
    expect(css).toMatch(/\.panel\s*\{[^}]*resize:\s*horizontal/);
    const tsx = read("components/Chat/ChatPanel.tsx");
    expect(tsx).toContain('variant="dark-chrome"');
    expect(tsx).toContain("radius={18}");
    expect(tsx).toContain('variant="compact"');
    // Single principal plane: no nested full-size standard surface in header.
    expect(tsx).not.toContain('variant="standard"');
  });

  it("uses pale toolbar material and 31px nav rows", () => {
    const topbar = read("components/TopBar.tsx");
    expect(topbar).toContain('variant="light-toolbar"');
    expect(topbar).not.toContain("lyra-chrome-scope");
    const sidebar = read("components/Sidebar.tsx");
    expect(sidebar).toContain('variant="dark-chrome"');
    const sidebarCss = read("components/Sidebar.module.css");
    expect(sidebarCss).toContain("height: 31px");
    expect(sidebarCss).toMatch(/\.sidebar\s*\{[^}]*opacity:\s*1/);
  });

  it("declares explicit material modes with documented solid fallbacks", () => {
    const css = read("components/GlassSurface.module.css");
    for (const m of ["native-vibrancy", "css-preview", "solid-accessibility", "solid-unsupported"]) {
      expect(css).toContain(`[data-material-mode="${m}"]`);
    }
    // css-preview blur is development-only starting value.
    expect(css).toContain("blur(28px) saturate(1.15)");
    const app = read("App.tsx");
    expect(app).toContain("dataset.materialMode");
    expect(app).toContain("solid-accessibility");
  });

  it("never blurs text panels or fades containers", () => {
    const css = read("components/GlassSurface.module.css");
    expect(css).not.toMatch(/(^|\s)filter:\s*blur\(/);
    expect(css).toContain("backdrop-filter");
    const chatCss = read("components/Chat/ChatPanel.module.css");
    expect(chatCss).not.toMatch(/opacity:\s*0\./);
    const global = read("styles/global.css");
    expect(global).not.toContain("transform: scale");
  });
});
