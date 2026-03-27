/**
 * Loaded only via dynamic import from main.ts so React / view / CSS
 * do not run at module top-level (avoids silent failures before onload).
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
import { logStep, reportStartupError } from "./startupLog";
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
  try {
    logStep("pluginImpl.runOnload: start");

    logStep("pluginImpl: register settings subscription");
    plugin.register(
      settings.subscribe((value) => {
        plugin.options = value;
      })
    );

    logStep("pluginImpl: registerView");
    plugin.registerView(
      VIEW_TYPE_CALENDAR,
      (leaf: WorkspaceLeaf) => new CalendarView(leaf)
    );

    logStep("pluginImpl: register commands");
    plugin.addCommand({
      id: "show-calendar-view",
      name: "Open view",
      checkCallback: (checking: boolean) => {
        if (checking) {
          return (
            plugin.app.workspace.getLeavesOfType(VIEW_TYPE_CALENDAR).length === 0
          );
        }
        void plugin.initLeaf().catch((e) => {
          reportStartupError("command:show-calendar-view → initLeaf", e);
        });
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

    logStep("pluginImpl: loadOptions");
    await runLoadOptions(plugin);

    logStep("pluginImpl: addSettingTab");
    plugin.addSettingTab(new CalendarSettingsTab(plugin.app, plugin));

    if (plugin.app.workspace.layoutReady) {
      logStep("pluginImpl: layoutReady → initLeaf");
      await runInitLeaf(plugin);
    } else {
      logStep("pluginImpl: wait layout-ready → initLeaf");
      plugin.registerEvent(
        (
          plugin.app.workspace as {
            on: (
              name: string,
              cb: () => void
            ) => import("obsidian").EventRef;
          }
        ).on("layout-ready", () => {
          void runInitLeaf(plugin).catch((e) => {
            reportStartupError("onload:layout-ready → initLeaf", e);
          });
        })
      );
    }

    logStep("pluginImpl.runOnload: complete");
  } catch (e) {
    reportStartupError("pluginImpl.runOnload", e);
    throw e;
  }
}

export async function runInitLeaf(plugin: Plugin): Promise<void> {
  logStep("initLeaf: start");
  const { workspace } = plugin.app;
  if (workspace.getLeavesOfType(VIEW_TYPE_CALENDAR).length) {
    logStep("initLeaf: calendar view already open, skip");
    return;
  }
  const leaf =
    workspace.getRightLeaf(false) ??
    workspace.getLeftLeaf(false) ??
    workspace.getUnpinnedLeaf();
  logStep("initLeaf: resolved leaf (right → left → unpinned fallback)");
  try {
    await Promise.resolve(
      leaf.setViewState({ type: VIEW_TYPE_CALENDAR })
    );
    logStep("initLeaf: setViewState ok");
  } catch (e) {
    reportStartupError("initLeaf:setViewState", e);
    throw e;
  }
}

export async function runLoadOptions(plugin: CalendarPluginHost): Promise<void> {
  try {
    logStep("loadOptions: loadData");
    const options = await plugin.loadData();
    logStep("loadOptions: merge into settings store");
    settings.update((old) => ({
      ...old,
      ...(options || {}),
    }));

    logStep("loadOptions: saveData");
    await plugin.saveData(plugin.options);
    logStep("loadOptions: done");
  } catch (e) {
    reportStartupError("loadOptions", e);
    throw e;
  }
}

export async function runWriteOptions(
  plugin: CalendarPluginHost,
  changeOpts: (s: ISettings) => Partial<ISettings>
): Promise<void> {
  settings.update((old) => ({ ...old, ...changeOpts(old) }));
  await plugin.saveData(plugin.options);
}
