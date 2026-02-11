import type { Moment } from "moment";
import { type ReactElement, useEffect, useRef, useState } from "react";

import { Arrow } from "./Arrow";

const YEAR_SPAN = 6;
const MONTHS_PER_ROW = 4;

interface MonthYearPickerProps {
  anchorRef: React.RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
  displayedMonth: Moment;
  onSelect: (date: Moment) => void;
  today: Moment;
}

export function MonthYearPicker({
  anchorRef,
  isOpen,
  onClose,
  displayedMonth,
  onSelect,
  today,
}: MonthYearPickerProps): ReactElement | null {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [year, setYear] = useState(displayedMonth.year());

  useEffect(() => {
    if (isOpen) setYear(displayedMonth.year());
  }, [isOpen, displayedMonth]);

  useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        anchorRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      onClose();
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  const years = Array.from(
    { length: YEAR_SPAN * 2 + 1 },
    (_, i) => year - YEAR_SPAN + i
  );
  const monthNames = window.moment.monthsShort();

  const handleMonthClick = (monthIndex: number) => {
    const date = window.moment().year(year).month(monthIndex).date(1);
    onSelect(date);
    onClose();
  };

  const handleTodayClick = () => {
    onSelect(today.clone().date(1));
    onClose();
  };

  return (
    <div
      ref={popoverRef}
      className="calendar-quick-switch"
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        marginTop: "4px",
        minWidth: "220px",
        padding: "10px",
        borderRadius: "6px",
        backgroundColor: "var(--background-primary)",
        border: "1px solid var(--background-modifier-border)",
        boxShadow: "0 4px 12px var(--background-modifier-box-shadow)",
        zIndex: 100,
      }}
    >
      <div
        className="calendar-quick-switch-year"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
          gap: "4px",
        }}
      >
        <Arrow
          direction="left"
          onClick={() => setYear((y) => y - 1)}
          tooltip="Previous year"
        />
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          style={{
            flex: 1,
            maxWidth: "80px",
            padding: "4px 6px",
            fontSize: "0.95em",
            backgroundColor: "var(--background-secondary)",
            color: "var(--text-normal)",
            border: "1px solid var(--background-modifier-border)",
            borderRadius: "4px",
          }}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <Arrow
          direction="right"
          onClick={() => setYear((y) => y + 1)}
          tooltip="Next year"
        />
      </div>
      <div
        className="calendar-quick-switch-months"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${MONTHS_PER_ROW}, 1fr)`,
          gap: "4px",
          marginBottom: "8px",
        }}
      >
        {monthNames.map((name, i) => (
          <button
            key={name}
            type="button"
            onClick={() => handleMonthClick(i)}
            style={{
              padding: "6px 4px",
              fontSize: "0.75em",
              backgroundColor:
                displayedMonth.year() === year && displayedMonth.month() === i
                  ? "var(--interactive-accent)"
                  : "var(--background-secondary)",
              color:
                displayedMonth.year() === year && displayedMonth.month() === i
                  ? "var(--text-on-accent)"
                  : "var(--text-normal)",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {name}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={handleTodayClick}
        style={{
          width: "100%",
          padding: "6px",
          fontSize: "0.8em",
          backgroundColor: "var(--background-secondary)",
          color: "var(--text-muted)",
          border: "1px solid var(--background-modifier-border)",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Today
      </button>
    </div>
  );
}
