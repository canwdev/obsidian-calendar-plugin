import type { Moment, WeekSpec } from "moment";
import { App, Notice, Plugin } from "obsidian";

import { VIEW_TYPE_CALENDAR } from "./constants";
import type { ISettings } from "./settings";

declare global {
  interface Window {
    app: App;
    moment: () => Moment;
    _bundledLocaleWeekSpec: WeekSpec;
  }
}

let implModule: Promise<typeof import("./pluginImpl")> | null = null;

function loadImpl(): Promise<typeof import("./pluginImpl")> {
  return (implModule ??= import("./pluginImpl"));
}

/**
 * Thin entry: no heavy imports at top level. Failures in React/CSS/daily-notes
 * surface inside onload after import(), so we can Notice + console.error.
 */
export default class CalendarPlugin extends Plugin {
  public options!: ISettings;

  onunload(): void {
    this.app.workspace
      .getLeavesOfType(VIEW_TYPE_CALENDAR)
      .forEach((leaf) => leaf.detach());
  }

  async onload(): Promise<void> {
    console.info("[calendar-react] main.ts: onload entered (before dynamic import)");
    try {
      const impl = await loadImpl();
      await impl.runOnload(this);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      console.error("[calendar-react] onload failed (pluginImpl)", err.message, err.stack);
      try {
        new Notice(
          `[calendar-react] onload/pluginImpl\n${err.message}`.slice(0, 400),
          25000
        );
      } catch {
        /* ignore */
      }
      throw e;
    }
  }

  async initLeaf(): Promise<void> {
    const impl = await loadImpl();
    return impl.runInitLeaf(this);
  }

  async loadOptions(): Promise<void> {
    const impl = await loadImpl();
    return impl.runLoadOptions(this);
  }

  async writeOptions(
    changeOpts: (settings: ISettings) => Partial<ISettings>
  ): Promise<void> {
    const impl = await loadImpl();
    return impl.runWriteOptions(this, changeOpts);
  }
}
