const HUES = [222, 0, 32, 45, 150, 200, 280, 320];

export function seedColor(seed: number, sat = 55, light = 52): string {
  const hue = HUES[Math.abs(seed) % HUES.length];
  return `hsl(${hue} ${sat}% ${light}%)`;
}

/** Deterministic tile color for a project, derived from its name. */
export function projectColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${hash} 55% 48%)`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}
