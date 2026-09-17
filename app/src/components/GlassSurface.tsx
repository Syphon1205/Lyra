import type { CSSProperties, PropsWithChildren, HTMLAttributes } from "react";
import styles from "./GlassSurface.module.css";

export type GlassMaterialVariant =
  | "darkChrome"
  | "dark-chrome"
  | "lightChrome"
  | "light-toolbar"
  | "composer"
  | "compact"
  | "popover"
  | "solid"
  | "standard"
  | "subtle"
  | "none";

interface GlassSurfaceProps extends Omit<HTMLAttributes<HTMLDivElement>, "style"> {
  variant?: GlassMaterialVariant;
  tint?: "neutral" | "accent";
  radius?: number;
  border?: boolean;
  className?: string;
  style?: CSSProperties;
}

const NORMALIZE_VARIANT: Record<GlassMaterialVariant, string> = {
  darkChrome: "darkChrome",
  "dark-chrome": "darkChrome",
  lightChrome: "lightToolbar",
  "light-toolbar": "lightToolbar",
  composer: "compact",
  compact: "compact",
  popover: "popover",
  solid: "solid",
  standard: "legacyStandard",
  subtle: "legacySubtle",
  none: "solid",
};

/**
 * The one shared glass implementation (contract §4 & §5).
 *
 * Semantic variants:
 * - `darkChrome` (or `dark-chrome`): sidebar + agent panel base material (fixed dark).
 * - `lightChrome` (or `light-toolbar`): pale toolbar material.
 * - `composer` (or `compact`): small controls / message input composer.
 * - `popover`: floating translucent popovers (command palette, contextual menus).
 * - `solid`: documented fallback.
 * - `standard` / `subtle`: scope-aware legacy aliases.
 *
 * Material modes (`native-vibrancy` / `css-preview` / `solid-accessibility` /
 * `solid-unsupported`) are declared on `<html data-material-mode>`.
 */
export function GlassSurface({
  variant = "darkChrome",
  tint = "neutral",
  radius = 0,
  border = true,
  className,
  style,
  children,
  ...rest
}: PropsWithChildren<GlassSurfaceProps>) {
  const normalizedKey = NORMALIZE_VARIANT[variant] ?? "solid";
  const variantClass = styles[normalizedKey] ?? styles.solid;
  const classNames = [
    styles.surface,
    variantClass,
    tint === "accent" ? styles.accent : "",
    border ? styles.border : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames} style={{ borderRadius: radius, ...style }} {...rest}>
      {children}
    </div>
  );
}
