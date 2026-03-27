import { Notice } from "obsidian";

/** Search console / Logstravaganza output for this prefix. */
export const CALENDAR_PLUGIN_LOG_PREFIX = "[calendar-react]";

export function logStep(step: string, detail?: unknown): void {
  if (detail !== undefined) {
    console.info(`${CALENDAR_PLUGIN_LOG_PREFIX} ${step}`, detail);
  } else {
    console.info(`${CALENDAR_PLUGIN_LOG_PREFIX} ${step}`);
  }
}

/**
 * Logs full error + stack to console and shows a Notice (mobile-friendly).
 * Re-throw after calling this if the plugin should still fail to load.
 */
export function reportStartupError(context: string, error: unknown): void {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error(
    `${CALENDAR_PLUGIN_LOG_PREFIX} ERROR in ${context}`,
    err.message,
    err.stack ?? err
  );
  const msg = `${CALENDAR_PLUGIN_LOG_PREFIX} ${context}\n${err.message}`.slice(
    0,
    400
  );
  try {
    new Notice(msg, 20000);
  } catch {
    /* ignore */
  }
}
