import { seedColor, initials } from "../lib/colors";

export function Avatar({ name, colorSeed, size = 20 }: { name: string; colorSeed: number; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: seedColor(colorSeed),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.4,
        fontWeight: 600,
        color: "white",
        flexShrink: 0,
      }}
    >
      {initials(name)}
    </div>
  );
}
