/**
 * Loaded via dynamic import from main.ts so React / view / CSS are not
 * evaluated at the entry module’s top level.
 */
import "./styles.css";
import { WorkspaceLeaf, type Plugin } from "obsidian";

import { VIEW_TYPE_CALENDAR } from "./constants";
import { settings } from "./ui/stores";
import {
  appHasPeriodicNotesPluginLoaded,
  CalendarSettingsTab,
  type ISettings,
} from "./settings";
import type CalendarPlugin from "./main";
import CalendarView from "./view";

type CalendarPluginHost = Plugin & {
  options: ISettings;
  initLeaf(): Promise<void>;
};

function getOpenCalendarView(plugin: Plugin): CalendarView | null {
  for (const leaf of plugin.app.workspace.getLeavesOfType(VIEW_TYPE_CALENDAR)) {
    if (leaf.view instanceof CalendarView) {
      return leaf.view;
    }
  }
  return null;
}

export async function runOnload(plugin: CalendarPluginHost): Promise<void> {
  plugin.register(
    settings.subscribe((value) => {
      plugin.options = value;
    })
  );

  plugin.registerView(
    VIEW_TYPE_CALENDAR,
    (leaf: WorkspaceLeaf) => new CalendarView(leaf)
  );

  plugin.addCommand({
    id: "show-calendar-view",
    name: "Open view",
    checkCallback: (checking: boolean) => {
      if (checking) {
        return (
          plugin.app.workspace.getLeavesOfType(VIEW_TYPE_CALENDAR).length === 0
        );
      }
      void plugin.initLeaf();
    },
  });

  plugin.addCommand({
    id: "open-weekly-note",
    name: "Open Weekly Note",
    checkCallback: (checking: boolean) => {
      if (checking) {
        return !appHasPeriodicNotesPluginLoaded();
      }
      getOpenCalendarView(plugin)?.openOrCreateWeeklyNote(
        window.moment(),
        false
      );
    },
  });

  plugin.addCommand({
    id: "reveal-active-note",
    name: "Reveal active note",
    callback: () => getOpenCalendarView(plugin)?.revealActiveNote(),
  });

  await runLoadOptions(plugin);

  plugin.addSettingTab(
    new CalendarSettingsTab(plugin.app, plugin as CalendarPlugin)
  );

  if (plugin.app.workspace.layoutReady) {
    await runInitLeaf(plugin);
  } else {
    plugin.registerEvent(
      (
        plugin.app.workspace as {
          on: (
            name: string,
            cb: () => void
          ) => import("obsidian").EventRef;
        }
      ).on("layout-ready", () => {
        void runInitLeaf(plugin);
      })
    );
  }
}

export async function runInitLeaf(plugin: Plugin): Promise<void> {
  const { workspace } = plugin.app;
  if (workspace.getLeavesOfType(VIEW_TYPE_CALENDAR).length) {
    return;
  }
  const leaf =
    workspace.getRightLeaf(false) ??
    workspace.getLeftLeaf(false) ??
    workspace.getUnpinnedLeaf();
  await Promise.resolve(leaf.setViewState({ type: VIEW_TYPE_CALENDAR }));
}

export async function runLoadOptions(plugin: CalendarPluginHost): Promise<void> {
  const options = await plugin.loadData();
  settings.update((old) => ({
    ...old,
    ...(options || {}),
  }));
  await plugin.saveData(plugin.options);
}

export async function runWriteOptions(
  plugin: CalendarPluginHost,
  changeOpts: (s: ISettings) => Partial<ISettings>
): Promise<void> {
  settings.update((old) => ({ ...old, ...changeOpts(old) }));
  await plugin.saveData(plugin.options);
}
