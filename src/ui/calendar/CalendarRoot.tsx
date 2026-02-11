import type { Moment } from "moment";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { useSyncExternalStore } from "react";

import type { ICalendarSource } from "./types";
import { configureGlobalMomentLocale } from "./localization";
import { Calendar } from "./Calendar";
import { activeFile, dailyNotes, weeklyNotes, settings } from "../stores";

export interface CalendarRootHandle {
  setDisplayedMonth: (date: Moment) => void;
  refresh: () => void;
}

interface CalendarRootProps {
  sources: ICalendarSource[];
  onClickDay: (date: Moment, isMetaPressed: boolean) => void;
  onClickWeek: (date: Moment, isMetaPressed: boolean) => void;
  onHoverDay: (date: Moment, target: EventTarget, isMetaPressed: boolean) => void;
  onHoverWeek: (date: Moment, target: EventTarget, isMetaPressed: boolean) => void;
  onContextMenuDay: (date: Moment, e: MouseEvent) => void;
  onContextMenuWeek: (date: Moment, e: MouseEvent) => void;
}

function subscribeSettings(cb: () => void) {
  return settings.subscribe(cb);
}

function subscribeActiveFile(cb: () => void) {
  return activeFile.subscribe(cb);
}

export const CalendarRoot = forwardRef<CalendarRootHandle, CalendarRootProps>(
  function CalendarRoot(
    {
      sources,
      onClickDay,
      onClickWeek,
      onHoverDay,
      onHoverWeek,
      onContextMenuDay,
      onContextMenuWeek,
    },
    ref
  ) {
    const currentSettings = useSyncExternalStore(
      subscribeSettings,
      () => settings.getValue(),
      () => settings.getValue()
    );
    const selectedId = useSyncExternalStore(
      subscribeActiveFile,
      () => activeFile.getValue(),
      () => activeFile.getValue()
    );

    const [displayedMonth, setDisplayedMonthState] = useState<Moment>(() =>
      window.moment()
    );
    const [tick, setTick] = useState(0);

    useEffect(() => {
      configureGlobalMomentLocale(
        currentSettings.localeOverride,
        currentSettings.weekStart
      );
      dailyNotes.reindex();
      weeklyNotes.reindex();
    }, [
      currentSettings.localeOverride,
      currentSettings.weekStart,
    ]);

    const setDisplayedMonth = useCallback((date: Moment) => {
      setDisplayedMonthState(date.clone());
    }, []);

    const refresh = useCallback(() => {
      setTick((t) => t + 1);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        setDisplayedMonth,
        refresh,
      }),
      [setDisplayedMonth, refresh]
    );

    return (
      <Calendar
        refreshTrigger={tick}
        sources={sources}
        selectedId={selectedId}
        showWeekNums={currentSettings.showWeeklyNote}
        displayedMonth={displayedMonth}
        onDisplayedMonthChange={setDisplayedMonth}
        onClickDay={onClickDay}
        onClickWeek={onClickWeek}
        onHoverDay={onHoverDay}
        onHoverWeek={onHoverWeek}
        onContextMenuDay={onContextMenuDay}
        onContextMenuWeek={onContextMenuWeek}
      />
    );
  }
);
