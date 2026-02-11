import type { IDot } from "./types";

interface DotProps extends IDot {
  isActive?: boolean;
}

export function Dot({ className = "", isFilled, isActive }: DotProps): JSX.Element {
  const color = isActive ? "var(--text-on-accent)" : "var(--color-dot)";
  return (
    <svg
      className={`inline-block h-1.5 w-1.5 mx-0.5 ${className}`}
      viewBox="0 0 6 6"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="3"
        cy="3"
        r="2"
        fill={isFilled ? color : "none"}
        stroke={isFilled ? "none" : color}
        strokeWidth={1}
      />
    </svg>
  );
}
