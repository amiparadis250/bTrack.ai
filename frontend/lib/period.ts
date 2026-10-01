function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export interface DateRange {
  from: string;
  to: string;
}

export function currentMonthRange(now: Date = new Date()): DateRange {
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return { from: toIsoDate(from), to: toIsoDate(to) };
}

/** The immediately-preceding period of the same length, for period-over-period deltas. */
export function previousPeriodRange(range: DateRange): DateRange {
  const from = new Date(`${range.from}T00:00:00Z`);
  const to = new Date(`${range.to}T00:00:00Z`);
  const spanMs = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime() - 24 * 60 * 60 * 1000);
  const prevFrom = new Date(prevTo.getTime() - spanMs);
  return { from: toIsoDate(prevFrom), to: toIsoDate(prevTo) };
}

/** From the first day of the month `monthsBack` months ago, through today. */
export function trailingMonthsRange(monthsBack: number, now: Date = new Date()): DateRange {
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (monthsBack - 1), 1));
  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return { from: toIsoDate(from), to: toIsoDate(to) };
}

/** null when there's no prior-period baseline to compare against (avoids a misleading ±Infinity%). */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

export const PERIOD_PRESETS = ["today", "week", "month", "quarter", "year", "custom"] as const;
export type PeriodPreset = (typeof PERIOD_PRESETS)[number];

export const PERIOD_PRESET_LABELS: Record<PeriodPreset, string> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  quarter: "This Quarter",
  year: "This Year",
  custom: "Custom Range",
};

export function presetRange(preset: PeriodPreset, now: Date = new Date()): DateRange {
  const to = toIsoDate(now);
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  switch (preset) {
    case "today":
      return { from: to, to };
    case "week": {
      const dayOfWeek = now.getUTCDay();
      const from = new Date(now);
      from.setUTCDate(now.getUTCDate() - dayOfWeek);
      return { from: toIsoDate(from), to };
    }
    case "quarter": {
      const quarterStartMonth = Math.floor(month / 3) * 3;
      return { from: toIsoDate(new Date(Date.UTC(year, quarterStartMonth, 1))), to };
    }
    case "year":
      return { from: toIsoDate(new Date(Date.UTC(year, 0, 1))), to };
    case "month":
    default:
      return { from: toIsoDate(new Date(Date.UTC(year, month, 1))), to };
  }
}
