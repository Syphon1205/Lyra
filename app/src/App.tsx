import { useEffect, useState } from "react";
import { useLyraStore } from "./state/store";
import { AppShell } from "./components/AppShell";
import { IssueWindow } from "./components/IssueWindow";
import { ChatWindow } from "./components/ChatWindow";
import { IconGallery } from "./components/Dev/IconGallery";

function useRoute() {
  const [hash, setHash] = useState(window.location.hash.replace(/^#/, ""));
  useEffect(() => {
    const onChange = () => setHash(window.location.hash.replace(/^#/, ""));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

export default function App() {
  const loaded = useLyraStore((s) => s.loaded);
  const load = useLyraStore((s) => s.load);
  const appearance = useLyraStore((s) => s.appearance);
  const route = useRoute();

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = appearance.isDark ? "dark" : "light";
  }, [appearance.isDark]);

  // Explicit material modes (contract §3): native-vibrancy /
  // css-preview / solid-accessibility / solid-unsupported.
  useEffect(() => {
    const root = document.documentElement;
    const params = new URLSearchParams(window.location.search);
    const forced = params.get("material");
    const reason: string[] = [];
    let mode: "native-vibrancy" | "css-preview" | "solid-accessibility" | "solid-unsupported" = "native-vibrancy";
    if (forced === "css-preview" || forced === "solid-accessibility" || forced === "solid-unsupported" || forced === "native-vibrancy") {
      mode = forced;
      reason.push(`query ?material=${forced}`);
    } else if (
      root.dataset.reduceTransparency === "true" ||
      window.matchMedia("(prefers-reduced-transparency: reduce)").matches
    ) {
      mode = "solid-accessibility";
      reason.push("reduce-transparency");
    } else if (typeof window.lyra !== "undefined" && !window.navigator.userAgent.includes("Electron")) {
      // Browser dev server without the native window: CSS preview against an
      // explicit test scene, never the real desktop.
      mode = "css-preview";
      root.dataset.previewScene = "dev-two-tone";
      reason.push("non-electron-dev-preview");
    }
    root.dataset.materialMode = mode;
    if (import.meta.env.DEV) {
      console.info(`[lyra:material] mode=${mode} reason=${reason.join(",") || "electron-native-default"}`);
    }
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-transparency: reduce)");
    const apply = () => {
      document.documentElement.dataset.reduceTransparency = String(mql.matches);
    };
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  if (!loaded) {
    return <div style={{ padding: 40, color: "var(--lyra-text-muted)" }}>Loading Lyra…</div>;
  }

  const issueMatch = route.match(/^\/issue\/(.+)$/);
  const chatMatch = route.match(/^\/chat\/(.+)$/);

  if (route === "/dev/icons" || route === "dev/icons") return <IconGallery />;
  if (issueMatch) return <IssueWindow issueId={issueMatch[1]!} />;
  if (chatMatch) return <ChatWindow sessionId={chatMatch[1]!} />;
  return <AppShell />;
}
