interface ArrowProps {
  direction: "left" | "right";
  onClick: () => void;
  tooltip: string;
}

export function Arrow({ direction, onClick, tooltip }: ArrowProps): JSX.Element {
  return (
    <div
      className={`flex items-center justify-center w-6 cursor-pointer ${direction === "right" ? "rotate-180" : ""}`}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      role="button"
      tabIndex={0}
      aria-label={tooltip}
      style={{ color: "var(--color-arrow)" }}
    >
      <svg
        focusable={false}
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 320 512"
        className="h-4 w-4"
        style={{ color: "currentColor" }}
      >
        <path
          fill="currentColor"
          d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"
        />
      </svg>
    </div>
  );
}
