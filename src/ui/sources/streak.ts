import type { Moment } from "moment";
import type { TFile } from "obsidian";
import type { ICalendarSource, IDayMetadata } from "src/ui/calendar/types";
import { getDailyNote, getWeeklyNote } from "obsidian-daily-notes-interface";

import { dailyNotes, weeklyNotes } from "../stores";
import { classList } from "../utils";

const getStreakClasses = (file: TFile | null): string[] => {
  return classList({
    "has-note": !!file,
  });
};

export const streakSource: ICalendarSource = {
  getDailyMetadata: async (date: Moment): Promise<IDayMetadata> => {
    const file = getDailyNote(date, dailyNotes.getValue() ?? {});
    return {
      classes: getStreakClasses(file),
      dots: [],
    };
  },

  getWeeklyMetadata: async (date: Moment): Promise<IDayMetadata> => {
    const file = getWeeklyNote(date, weeklyNotes.getValue() ?? {});
    return {
      classes: getStreakClasses(file),
      dots: [],
    };
  },
};
