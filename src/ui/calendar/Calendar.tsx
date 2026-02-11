import type { Moment } from "moment";
import { type ReactElement, useCallback, useEffect, useMemo, useState } from "react";

import type { ICalendarSource, IDayMetadata } from "./types";
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
  refreshTrigger = 0,
  sources,
  selectedId,
  showWeekNums,
  displayedMonth,
  onDisplayedMonthChange,
  onClickDay,
  onClickWeek,
  onHoverDay,
  onHoverWeek,
  onContextMenuDay,
  onContextMenuWeek,
}: CalendarProps): ReactElement {
  const [currentToday, setCurrentToday] = useState(() => window.moment());

  const month = useMemo(() => getMonth(displayedMonth), [displayedMonth]);
  const daysOfWeek = useMemo(() => getDaysOfWeek(), []);

  const dailyMetadataCache = useMemo(() => {
    const cache = new Map<string, Promise<IDayMetadata>>();
    for (const week of month) {
      for (const day of week.days) {
        const key = day.format("YYYY-MM-DD");
        if (!cache.has(key)) cache.set(key, getDailyMetadata(sources, day));
      }
    }
    return cache;
  }, [month, sources, refreshTrigger]);

  const weeklyMetadataCache = useMemo(() => {
    const cache = new Map<string, Promise<IDayMetadata>>();
    for (const week of month) {
      const key = week.days[0].format("YYYY-MM-DD");
      if (!cache.has(key)) cache.set(key, getWeeklyMetadata(sources, week.days[0]));
    }
    return cache;
  }, [month, sources, refreshTrigger]);

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

  const incrementMonth = useCallback(
    () => onDisplayedMonthChange(displayedMonth.clone().add(1, "month")),
    [displayedMonth, onDisplayedMonthChange]
  );
  const decrementMonth = useCallback(
    () => onDisplayedMonthChange(displayedMonth.clone().subtract(1, "month")),
    [displayedMonth, onDisplayedMonthChange]
  );
  const resetMonth = useCallback(
    () => onDisplayedMonthChange(currentToday.clone()),
    [currentToday, onDisplayedMonthChange]
  );

  return (
    <div id="calendar-react-container" className="calendar-react-root px-1.5">
      <Nav
        today={currentToday}
        displayedMonth={displayedMonth}
        onIncrement={incrementMonth}
        onDecrement={decrementMonth}
        onReset={resetMonth}
        onDisplayedMonthChange={onDisplayedMonthChange}
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
                className="text-center text-[0.6em] uppercase tracking-wider p-0.5"
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
                className="text-center text-[0.6em] uppercase tracking-wider p-0.5"
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
                  metadataPromise={weeklyMetadataCache.get(week.days[0].format("YYYY-MM-DD")) ?? null}
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
                  metadataPromise={dailyMetadataCache.get(day.format("YYYY-MM-DD")) ?? null}
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
