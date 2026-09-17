import { useCallback, useRef, useState } from "react";

export type ResizeAxis = "x" | "y";

interface UseDragResizeOptions {
  axis: ResizeAxis;
  /** Current size in px, read fresh at drag-start time. */
  getStart: () => number;
  /** Called continuously while dragging with the next candidate size (already axis-adjusted). */
  onChange: (size: number) => void;
  /** Invert delta direction (e.g. a right-edge panel that grows when dragging left). */
  invert?: boolean;
  /** Clamp bounds evaluated live on every move (so they can react to window size). */
  min?: () => number;
  max?: () => number;
}

/**
 * Shared pointer-drag-to-resize logic. Returns `isDragging` (for disabling
 * CSS transitions while tracking the pointer) and `onPointerDown` to wire to
 * a splitter handle.
 */
export function useDragResize({ axis, getStart, onChange, invert = false, min, max }: UseDragResizeOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const frame = useRef<number | null>(null);

  const onPointerDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startPos = axis === "x" ? e.clientX : e.clientY;
      const startSize = getStart();
      setIsDragging(true);

      const clamp = (value: number) => {
        const lo = min?.() ?? -Infinity;
        const hi = max?.() ?? Infinity;
        return Math.min(Math.max(value, lo), hi);
      };

      const onMove = (ev: MouseEvent) => {
        const pos = axis === "x" ? ev.clientX : ev.clientY;
        const rawDelta = pos - startPos;
        const delta = invert ? -rawDelta : rawDelta;
        const next = clamp(startSize + delta);
        if (frame.current) cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => onChange(next));
      };

      const onUp = () => {
        setIsDragging(false);
        if (frame.current) cancelAnimationFrame(frame.current);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = axis === "x" ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [axis, getStart, onChange, invert, min, max]
  );

  return { isDragging, onPointerDown };
}
