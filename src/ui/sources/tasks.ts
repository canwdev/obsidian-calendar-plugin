import type { Moment } from "moment";
import type { TFile } from "obsidian";
import type { ICalendarSource, IDayMetadata, IDot } from "src/ui/calendar/types";
import { getDailyNote, getWeeklyNote } from "obsidian-daily-notes-interface";

import { dailyNotes, weeklyNotes } from "../stores";

export async function getNumberOfRemainingTasks(note: TFile): Promise<number> {
  if (!note) {
    return 0;
  }

  const { vault } = window.app;
  const fileContents = await vault.cachedRead(note);
  return (fileContents.match(/(-|\*) \[ \]/g) || []).length;
}

export async function getDotsForDailyNote(
  dailyNote: TFile | null
): Promise<IDot[]> {
  if (!dailyNote) {
    return [];
  }
  const numTasks = await getNumberOfRemainingTasks(dailyNote);

  const dots: IDot[] = [];
  if (numTasks) {
    dots.push({
      className: "task",
      color: "default",
      isFilled: false,
    });
  }
  return dots;
}

export const tasksSource: ICalendarSource = {
  getDailyMetadata: async (date: Moment): Promise<IDayMetadata> => {
    const file = getDailyNote(date, dailyNotes.getValue() ?? {});
    const dots = await getDotsForDailyNote(file);
    return {
      dots,
    };
  },

  getWeeklyMetadata: async (date: Moment): Promise<IDayMetadata> => {
    const file = getWeeklyNote(date, weeklyNotes.getValue() ?? {});
    const dots = await getDotsForDailyNote(file);
    return {
      dots,
    };
  },
};
