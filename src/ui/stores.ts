import type { TFile } from "obsidian";
import {
  getAllDailyNotes,
  getAllWeeklyNotes,
} from "obsidian-daily-notes-interface";

import { defaultSettings, type ISettings } from "src/settings";

import { getDateUIDFromFile } from "./utils";

type Subscribe<T> = (value: T) => void;
type Unsubscribe = () => void;

function createWritable<T>(initial: T): {
  subscribe: (fn: Subscribe<T>) => Unsubscribe;
  set: (value: T) => void;
  update: (fn: (prev: T) => T) => void;
  getValue: () => T;
} {
  let value = initial;
  const listeners = new Set<Subscribe<T>>();

  const set = (v: T) => {
    value = v;
    listeners.forEach((fn) => fn(value));
  };

  const update = (fn: (prev: T) => T) => set(fn(value));

  const subscribe = (fn: Subscribe<T>): Unsubscribe => {
    listeners.add(fn);
    fn(value);
    return () => listeners.delete(fn);
  };

  const getValue = () => value;

  return { set, update, subscribe, getValue };
}

function createDailyNotesStore(): ReturnType<typeof createWritable<Record<string, TFile> | null>> & { reindex: () => void } {
  let hasError = false;
  const store = createWritable<Record<string, TFile> | null>(null);
  return {
    ...store,
    reindex: () => {
      try {
        const notes = getAllDailyNotes();
        store.set(notes);
        hasError = false;
      } catch (err) {
        if (!hasError) {
          console.log("[Calendar] Failed to find daily notes folder", err);
        }
        store.set({});
        hasError = true;
      }
    },
  };
}

function createWeeklyNotesStore(): ReturnType<typeof createWritable<Record<string, TFile> | null>> & { reindex: () => void } {
  let hasError = false;
  const store = createWritable<Record<string, TFile> | null>(null);
  return {
    ...store,
    reindex: () => {
      try {
        const notes = getAllWeeklyNotes();
        store.set(notes);
        hasError = false;
      } catch (err) {
        if (!hasError) {
          console.log("[Calendar] Failed to find weekly notes folder", err);
        }
        store.set({});
        hasError = true;
      }
    },
  };
}

function createSelectedFileStore(): ReturnType<typeof createWritable<string | null>> & { setFile: (file: TFile | null) => void } {
  const store = createWritable<string | null>(null);
  return {
    ...store,
    setFile: (file: TFile | null) => {
      store.set(file ? getDateUIDFromFile(file) : null);
    },
  };
}

export const settings = createWritable<ISettings>({
  ...defaultSettings,
} as ISettings);
export const dailyNotes = createDailyNotesStore();
export const weeklyNotes = createWeeklyNotesStore();
export const activeFile = createSelectedFileStore();
