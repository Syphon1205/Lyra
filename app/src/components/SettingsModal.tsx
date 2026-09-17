import { useLyraStore } from "../state/store";
import { GlassSurface } from "./GlassSurface";
import type { AppearanceState } from "../lyraApi";

const MODES: AppearanceState["mode"][] = ["system", "light", "dark"];

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const appearance = useLyraStore((s) => s.appearance);
  const setAppearance = useLyraStore((s) => s.setAppearance);

  return (
    <div style={overlayStyle} onMouseDown={onClose}>
      <GlassSurface variant="standard" radius={14} style={cardStyle} onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Settings</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--lyra-text-faint)", marginBottom: 6 }}>APPEARANCE</div>
        <div style={{ display: "flex", gap: 6 }}>
          {MODES.map((mode) => (
            <button
              key={mode}
              onClick={() => void setAppearance(mode)}
              style={{
                flex: 1,
                padding: "6px 0",
                borderRadius: 6,
                fontSize: 12,
                border: "1px solid var(--lyra-border)",
                background: appearance.mode === mode ? "var(--lyra-accent-solid)" : "var(--lyra-surface)",
                color: appearance.mode === mode ? "white" : "var(--lyra-text-muted)",
              }}
            >
              {mode === "system" ? "System" : mode === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
        {appearance.reducedTransparency && (
          <div style={{ marginTop: 12, fontSize: 11, color: "var(--lyra-text-faint)" }}>
            Reduce Transparency is on system-wide — glass surfaces are shown as solid.
          </div>
        )}
      </GlassSurface>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "flex-end",
  padding: "44px 16px",
  zIndex: 250,
};

const cardStyle: React.CSSProperties = {
  width: 260,
  padding: 16,
  boxShadow: "0 16px 40px rgba(0,0,0,0.3)",
};
