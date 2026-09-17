import { useEffect } from "react";
import { useDragResize, type ResizeAxis } from "../hooks/useDragResize";
import styles from "./Splitter.module.css";

interface SplitterProps {
  axis: ResizeAxis;
  getStart: () => number;
  onChange: (size: number) => void;
  onReset: () => void;
  invert?: boolean;
  min?: () => number;
  max?: () => number;
  title?: string;
  className?: string;
  /** Called with the live dragging state so a parent can suppress width/height transitions. */
  onDraggingChange?: (dragging: boolean) => void;
}

export function Splitter({ axis, getStart, onChange, onReset, invert, min, max, title, className, onDraggingChange }: SplitterProps) {
  const { isDragging, onPointerDown } = useDragResize({ axis, getStart, onChange, invert, min, max });

  useEffect(() => {
    onDraggingChange?.(isDragging);
  }, [isDragging, onDraggingChange]);

  return (
    <div
      className={`${styles.splitter} ${axis === "x" ? styles.colResize : styles.rowResize} ${isDragging ? styles.active : ""} ${className ?? ""}`}
      onMouseDown={onPointerDown}
      onDoubleClick={onReset}
      title={title ?? "Drag to resize (double-click to reset)"}
      role="separator"
      aria-orientation={axis === "x" ? "vertical" : "horizontal"}
    >
      <div className={styles.line} />
    </div>
  );
}
