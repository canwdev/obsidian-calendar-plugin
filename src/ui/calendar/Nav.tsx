import type { Moment } from "moment";
import { useState, useRef } from "react";
import { Arrow } from "./Arrow";
import { MonthYearPicker } from "./MonthYearPicker";

interface NavProps {
  today: Moment;
  displayedMonth: Moment;
  onIncrement: () => void;
  onDecrement: () => void;
  onReset: () => void;
  onDisplayedMonthChange: (m: Moment) => void;
}

export function Nav({
  today,
  displayedMonth,
  onIncrement,
  onDecrement,
  onReset,
  onDisplayedMonthChange,
}: NavProps): JSX.Element {
  const [pickerOpen, setPickerOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const todayDisplayStr = today.calendar().split(/\d|\s/)[0];

  return (
    <div className="flex items-center w-full my-2 px-2">
      <div className="relative" ref={triggerRef}>
        <h3
          className="m-0 text-2xl cursor-pointer"
          style={{ color: "var(--color-text-title)" }}
          onClick={() => setPickerOpen((o) => !o)}
          title="Quick switch year / month"
        >
          <span className="font-medium capitalize" style={{ textTransform: "capitalize" }}>
            {displayedMonth.format("MMM")}
          </span>
          <span className="ml-1" style={{ color: "var(--interactive-accent)" }}>
            {displayedMonth.format("YYYY")}
          </span>
        </h3>
        <MonthYearPicker
          anchorRef={triggerRef}
          isOpen={pickerOpen}
          onClose={() => setPickerOpen(false)}
          displayedMonth={displayedMonth}
          onSelect={onDisplayedMonthChange}
          today={today}
        />
      </div>
      <div className="flex justify-center ml-auto">
        <Arrow direction="left" onClick={onDecrement} tooltip="Previous Month" />
        <div
          className="cursor-pointer rounded px-1 text-xs font-semibold uppercase mx-1 hidden sm:block"
          style={{ color: "var(--text-muted)", letterSpacing: "1px" }}
          onClick={onReset}
        >
          {todayDisplayStr}
        </div>
        <Arrow direction="right" onClick={onIncrement} tooltip="Next Month" />
      </div>
    </div>
  );
}
