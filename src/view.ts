import type { Moment } from "moment";
import {
  getDailyNote,
  getDailyNoteSettings,
  getDateFromFile,
  getWeeklyNote,
  getWeeklyNoteSettings,
} from "obsidian-daily-notes-interface";
import { FileView, type TFile, ItemView, WorkspaceLeaf } from "obsidian";
import { createRoot, type Root } from "react-dom/client";
import { createElement } from "react";

import { TRIGGER_ON_OPEN, VIEW_TYPE_CALENDAR } from "src/constants";
import { tryToCreateDailyNote } from "src/io/dailyNotes";
import { tryToCreateWeeklyNote } from "src/io/weeklyNotes";

import { configureGlobalMomentLocale } from "./ui/calendar/localization";
import { CalendarRoot, type CalendarRootHandle } from "./ui/calendar/CalendarRoot";
import { showFileMenu } from "./ui/fileMenu";
import { activeFile, dailyNotes, weeklyNotes, settings } from "./ui/stores";
import {
  customTagsSource,
  streakSource,
  tasksSource,
  wordCountSource,
} from "./ui/sources";

const REFRESH_DEBOUNCE_MS = 300;

function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn(...args);
    }, ms);
  }) as T;
}

export default class CalendarView extends ItemView {
  private root: Root | null = null;
  private reactContainer: HTMLDivElement | null = null;
  private calendarRef: { current: CalendarRootHandle | null } = { current: null };
  private debouncedRefresh = debounce(() => {
    if (this.calendarRef.current) this.calendarRef.current.refresh();
  }, REFRESH_DEBOUNCE_MS);

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);

    this.openOrCreateDailyNote = this.openOrCreateDailyNote.bind(this);
    this.openOrCreateWeeklyNote = this.openOrCreateWeeklyNote.bind(this);
    this.onNoteSettingsUpdate = this.onNoteSettingsUpdate.bind(this);
    this.onFileCreated = this.onFileCreated.bind(this);
    this.onFileDeleted = this.onFileDeleted.bind(this);
    this.onFileModified = this.onFileModified.bind(this);
    this.onFileOpen = this.onFileOpen.bind(this);
    this.onHoverDay = this.onHoverDay.bind(this);
    this.onHoverWeek = this.onHoverWeek.bind(this);
    this.onContextMenuDay = this.onContextMenuDay.bind(this);
    this.onContextMenuWeek = this.onContextMenuWeek.bind(this);

    this.registerEvent(
      (this.app.workspace as { on: (name: string, cb: () => void) => import("obsidian").EventRef }).on(
        "periodic-notes:settings-updated",
        this.onNoteSettingsUpdate
      )
    );
    this.registerEvent(this.app.vault.on("create", (f) => this.onFileCreated(f as TFile)));
    this.registerEvent(this.app.vault.on("delete", (f) => this.onFileDeleted(f as TFile)));
    this.registerEvent(this.app.vault.on("modify", (f) => this.onFileModified(f as TFile)));
    this.registerEvent(this.app.workspace.on("file-open", (f) => this.onFileOpen(f)));
  }

  getViewType(): string {
    return VIEW_TYPE_CALENDAR;
  }

  getDisplayText(): string {
    return "Calendar";
  }

  getIcon(): string {
    return "calendar-with-checkmark";
  }

  onClose(): Promise<void> {
    if (this.root && this.reactContainer) {
      this.root.unmount();
      this.root = null;
      this.reactContainer = null;
      this.calendarRef.current = null;
    }
    return Promise.resolve();
  }

  async onOpen(): Promise<void> {
    const sources = [
      customTagsSource,
      streakSource,
      wordCountSource,
      tasksSource,
    ];
    this.app.workspace.trigger(TRIGGER_ON_OPEN, sources);

    const currentSettings = settings.getValue();
    configureGlobalMomentLocale(
      currentSettings.localeOverride,
      currentSettings.weekStart
    );
    dailyNotes.reindex();
    weeklyNotes.reindex();

    this.reactContainer = this.contentEl.createDiv();
    this.root = createRoot(this.reactContainer);
    this.root.render(
      createElement(CalendarRoot, {
        ref: this.calendarRef,
        sources,
        onClickDay: this.openOrCreateDailyNote,
        onClickWeek: this.openOrCreateWeeklyNote,
        onHoverDay: this.onHoverDay,
        onHoverWeek: this.onHoverWeek,
        onContextMenuDay: this.onContextMenuDay,
        onContextMenuWeek: this.onContextMenuWeek,
      })
    );
  }

  onHoverDay(
    date: Moment,
    targetEl: EventTarget,
    isMetaPressed: boolean
  ): void {
    if (!isMetaPressed) return;
    const { format } = getDailyNoteSettings();
    const note = getDailyNote(date, dailyNotes.getValue() ?? {});
    this.app.workspace.trigger(
      "link-hover",
      this,
      targetEl,
      date.format(format),
      note?.path
    );
  }

  onHoverWeek(
    date: Moment,
    targetEl: EventTarget,
    isMetaPressed: boolean
  ): void {
    if (!isMetaPressed) return;
    const note = getWeeklyNote(date, weeklyNotes.getValue() ?? {});
    const { format } = getWeeklyNoteSettings();
    this.app.workspace.trigger(
      "link-hover",
      this,
      targetEl,
      date.format(format),
      note?.path
    );
  }

  private onContextMenuDay(date: Moment, event: MouseEvent): void {
    const note = getDailyNote(date, dailyNotes.getValue() ?? {});
    if (!note) return;
    showFileMenu(this.app, note, { x: event.pageX, y: event.pageY });
  }

  private onContextMenuWeek(date: Moment, event: MouseEvent): void {
    const note = getWeeklyNote(date, weeklyNotes.getValue() ?? {});
    if (!note) return;
    showFileMenu(this.app, note, { x: event.pageX, y: event.pageY });
  }

  private onNoteSettingsUpdate(): void {
    dailyNotes.reindex();
    weeklyNotes.reindex();
    this.updateActiveFile();
  }

  private async onFileDeleted(file: TFile): Promise<void> {
    if (getDateFromFile(file, "day")) {
      dailyNotes.reindex();
      this.updateActiveFile();
    }
    if (getDateFromFile(file, "week")) {
      weeklyNotes.reindex();
      this.updateActiveFile();
    }
  }

  private onFileModified(file: TFile): void {
    const date = getDateFromFile(file, "day") || getDateFromFile(file, "week");
    if (date) this.debouncedRefresh();
  }

  private onFileCreated(file: TFile): void {
    if (!this.app.workspace.layoutReady) return;
    if (getDateFromFile(file, "day")) dailyNotes.reindex();
    if (getDateFromFile(file, "week")) weeklyNotes.reindex();
    if (getDateFromFile(file, "day") || getDateFromFile(file, "week")) {
      this.debouncedRefresh();
    }
  }

  public onFileOpen(_file: TFile | null): void {
    if (this.app.workspace.layoutReady) {
      this.updateActiveFile();
    }
  }

  private updateActiveFile(): void {
    const leaf = this.app.workspace.activeLeaf;
    if (!leaf) return;
    const { view } = leaf;
    const file = view instanceof FileView ? view.file : null;
    activeFile.setFile(file);
    if (this.calendarRef.current) this.calendarRef.current.refresh();
  }

  public revealActiveNote(): void {
    const { moment } = window;
    const { activeLeaf } = this.app.workspace;
    if (!activeLeaf || !this.calendarRef.current) return;

    if (activeLeaf.view instanceof FileView && activeLeaf.view.file) {
      let date = getDateFromFile(activeLeaf.view.file, "day");
      if (date) {
        this.calendarRef.current.setDisplayedMonth(date);
        return;
      }
      const { format } = getWeeklyNoteSettings();
      date = moment(activeLeaf.view.file.basename, format, true);
      if (date.isValid()) {
        this.calendarRef.current.setDisplayedMonth(date);
      }
    }
  }

  async openOrCreateWeeklyNote(
    date: Moment,
    inNewSplit: boolean
  ): Promise<void> {
    const { workspace } = this.app;
    const startOfWeek = date.clone().startOf("week");
    const existingFile = getWeeklyNote(date, weeklyNotes.getValue() ?? {});

    if (!existingFile) {
      tryToCreateWeeklyNote(
        startOfWeek,
        inNewSplit,
        settings.getValue(),
        (file) => {
          activeFile.setFile(file);
        }
      );
      return;
    }

    const leaf = inNewSplit
      ? workspace.splitActiveLeaf()
      : workspace.getUnpinnedLeaf();
    await leaf.openFile(existingFile);
    activeFile.setFile(existingFile);
    workspace.setActiveLeaf(leaf, true, true);
  }

  async openOrCreateDailyNote(
    date: Moment,
    inNewSplit: boolean
  ): Promise<void> {
    const { workspace } = this.app;
    const currentSettings = settings.getValue();
    const existingFile = getDailyNote(date, dailyNotes.getValue() ?? {});

    if (!existingFile) {
      tryToCreateDailyNote(
        date,
        inNewSplit,
        currentSettings,
        (dailyNote: TFile) => {
          activeFile.setFile(dailyNote);
        }
      );
      return;
    }

    const mode = (this.app.vault as unknown as { getConfig?: (k: string) => string }).getConfig?.("defaultViewMode");
    const leaf = inNewSplit
      ? workspace.splitActiveLeaf()
      : workspace.getUnpinnedLeaf();
    await leaf.openFile(existingFile, { active: true, mode } as Parameters<typeof leaf.openFile>[1]);
    activeFile.setFile(existingFile);
  }
}
