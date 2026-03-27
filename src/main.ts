import type { Moment, WeekSpec } from "moment";
import { App, Plugin } from "obsidian";

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

export default class CalendarPlugin extends Plugin {
  public options!: ISettings;

  onunload(): void {
    this.app.workspace
      .getLeavesOfType(VIEW_TYPE_CALENDAR)
      .forEach((leaf) => leaf.detach());
  }

  async onload(): Promise<void> {
    const impl = await loadImpl();
    await impl.runOnload(this);
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
