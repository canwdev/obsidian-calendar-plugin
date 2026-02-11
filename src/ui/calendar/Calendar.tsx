import type { Moment } from "moment";
import { type ReactElement, useEffect, useMemo, useState } from "react";

import type { ICalendarSource } from "./types";
import { getDailyMetadata, getWeeklyMetadata } from "./metadata";
import { getDaysOfWeek, getMonth, isWeekend } from "./utils";
import { Nav } from "./Nav";
import { DayCell } from "./DayCell";
import { WeekNumCell } from "./WeekNumCell";

interface CalendarProps {
  refreshTrigger?: number;
  sources: ICalendarSource[];
  selectedId: string | null;
  showWeekNums: boolean;
  today: Moment;
  displayedMonth: Moment;
  onDisplayedMonthChange: (m: Moment) => void;
  onClickDay: (date: Moment, isMetaPressed: boolean) => void;
  onClickWeek: (date: Moment, isMetaPressed: boolean) => void;
  onHoverDay: (date: Moment, target: EventTarget, isMetaPressed: boolean) => void;
  onHoverWeek: (date: Moment, target: EventTarget, isMetaPressed: boolean) => void;
  onContextMenuDay: (date: Moment, e: MouseEvent) => void;
  onContextMenuWeek: (date: Moment, e: MouseEvent) => void;
}

export function Calendar({
  refreshTrigger: _refreshTrigger,
  sources,
  selectedId,
  showWeekNums,
  today,
  displayedMonth,
  onDisplayedMonthChange,
  onClickDay,
  onClickWeek,
  onHoverDay,
  onHoverWeek,
  onContextMenuDay,
  onContextMenuWeek,
}: CalendarProps): ReactElement {
  const [currentToday, setCurrentToday] = useState(today);

  const month = useMemo(() => getMonth(displayedMonth), [displayedMonth]);
  const daysOfWeek = useMemo(() => getDaysOfWeek(), []);

  useEffect(() => {
    setCurrentToday(today);
  }, [today]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = window.moment();
      setCurrentToday(now);
      if (displayedMonth.isSame(now, "month")) {
        onDisplayedMonthChange(now);
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [displayedMonth, onDisplayedMonthChange]);

  const incrementMonth = () => onDisplayedMonthChange(displayedMonth.clone().add(1, "month"));
  const decrementMonth = () => onDisplayedMonthChange(displayedMonth.clone().subtract(1, "month"));
  const resetMonth = () => onDisplayedMonthChange(currentToday.clone());

  return (
    <div id="calendar-container" className="calendar-react-root px-2">
      <Nav
        today={currentToday}
        displayedMonth={displayedMonth}
        onIncrement={incrementMonth}
        onDecrement={decrementMonth}
        onReset={resetMonth}
      />
      <table className="w-full border-collapse table-fixed calendar-table">
        <colgroup>
          {showWeekNums && <col className="w-8" />}
          {month[0]?.days.map((date) => (
            <col
              key={date.format()}
              className={isWeekend(date) ? "bg-[var(--color-background-weekend)]" : ""}
            />
          ))}
        </colgroup>
        <thead>
          <tr>
            {showWeekNums && (
              <th
                className="text-center text-[0.6em] uppercase tracking-wider p-1"
                style={{
                  backgroundColor: "var(--color-background-heading)",
                  color: "var(--color-text-heading)",
                }}
              >
                W
              </th>
            )}
            {daysOfWeek.map((day) => (
              <th
                key={day}
                className="text-center text-[0.6em] uppercase tracking-wider p-1"
                style={{
                  backgroundColor: "var(--color-background-heading)",
                  color: "var(--color-text-heading)",
                }}
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {month.map((week) => (
            <tr key={week.weekNum}>
              {showWeekNums && (
                <WeekNumCell
                  weekNum={week.weekNum}
                  days={week.days}
                  selectedId={selectedId}
                  metadataPromise={getWeeklyMetadata(sources, week.days[0])}
                  onClick={onClickWeek}
                  onContextMenu={onContextMenuWeek}
                  onHover={onHoverWeek}
                />
              )}
              {week.days.map((day) => (
                <DayCell
                  key={day.format()}
                  date={day}
                  today={currentToday}
                  displayedMonth={displayedMonth}
                  selectedId={selectedId}
                  metadataPromise={getDailyMetadata(sources, day)}
                  onClick={onClickDay}
                  onContextMenu={onContextMenuDay}
                  onHover={onHoverDay}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
