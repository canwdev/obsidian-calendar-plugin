import type { WeekSpec } from "moment";

declare global {
  interface Window {
    _bundledLocaleWeekSpec: WeekSpec;
  }
}

import type { ILocaleOverride, IWeekStartOption } from "./types";

const weekdays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const langToMomentLocale: Record<string, string> = {
  en: "en-gb",
  zh: "zh-cn",
  "zh-TW": "zh-tw",
  ru: "ru",
  ko: "ko",
  it: "it",
  id: "id",
  ro: "ro",
  "pt-BR": "pt-br",
  cz: "cs",
  da: "da",
  de: "de",
  es: "es",
  fr: "fr",
  no: "nn",
  pl: "pl",
  pt: "pt",
  tr: "tr",
  hi: "hi",
  nl: "nl",
  ar: "ar",
  ja: "ja",
};

function overrideGlobalMomentWeekStart(weekStart: IWeekStartOption): void {
  const { moment } = window;
  const currentLocale = moment.locale();

  if (!window._bundledLocaleWeekSpec) {
    window._bundledLocaleWeekSpec = (moment.localeData() as unknown as { _week: WeekSpec })._week;
  }

  if (weekStart === "locale") {
    moment.updateLocale(currentLocale, {
      week: window._bundledLocaleWeekSpec,
    });
  } else {
    moment.updateLocale(currentLocale, {
      week: {
        dow: weekdays.indexOf(weekStart) || 0,
      },
    });
  }
}

export function configureGlobalMomentLocale(
  localeOverride: ILocaleOverride = "system-default",
  weekStart: IWeekStartOption = "locale"
): string {
  const obsidianLang = localStorage.getItem("language") || "en";
  const systemLang = navigator.language?.toLowerCase();

  let momentLocale = langToMomentLocale[obsidianLang] ?? "en-gb";

  if (localeOverride !== "system-default") {
    momentLocale = localeOverride;
  } else if (systemLang.startsWith(obsidianLang)) {
    momentLocale = systemLang;
  }

  const currentLocale = window.moment.locale(momentLocale);
  console.debug(
    `[Calendar] Trying to switch Moment.js global locale to ${momentLocale}, got ${currentLocale}`
  );

  overrideGlobalMomentWeekStart(weekStart);

  return currentLocale;
}
