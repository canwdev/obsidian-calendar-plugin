import type { Moment } from "moment";

import type { ICalendarSource, IDayMetadata } from "./types";

async function metadataReducer(
  promisedMetadata: Promise<IDayMetadata>[]
): Promise<IDayMetadata> {
  const meta: IDayMetadata = {
    dots: [],
    classes: [],
    dataAttributes: {},
  };
  const metas = await Promise.all(promisedMetadata);
  return metas.reduce<IDayMetadata>(
    (acc, m) => ({
      classes: [...(acc.classes ?? []), ...(m.classes ?? [])],
      dataAttributes: Object.assign({}, acc.dataAttributes, m.dataAttributes),
      dots: [...(acc.dots ?? []), ...(m.dots ?? [])],
    }),
    meta
  );
}

export function getDailyMetadata(
  sources: ICalendarSource[],
  date: Moment
): Promise<IDayMetadata> {
  return metadataReducer(
    sources
      .filter((s): s is ICalendarSource & { getDailyMetadata: (d: Moment) => Promise<IDayMetadata> } =>
        typeof s.getDailyMetadata === "function"
      )
      .map((s) => s.getDailyMetadata!(date))
  );
}

export function getWeeklyMetadata(
  sources: ICalendarSource[],
  date: Moment
): Promise<IDayMetadata> {
  return metadataReducer(
    sources
      .filter((s): s is ICalendarSource & { getWeeklyMetadata: (d: Moment) => Promise<IDayMetadata> } =>
        typeof s.getWeeklyMetadata === "function"
      )
      .map((s) => s.getWeeklyMetadata!(date))
  );
}
