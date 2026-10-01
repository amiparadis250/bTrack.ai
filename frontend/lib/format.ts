// Display formatting for backend wire values (FastAPI serializes Decimal as a
// string, datetimes as ISO-8601). Times are shown in Kigali time.

export const KIGALI_TZ = "Africa/Kigali";

/** "3200.00" + "RWF" -> "RWF 3,200" */
export function formatMoney(amount: string | number | null | undefined, currency: string): string {
  if (amount === null || amount === undefined || amount === "") return "--";
  const value = typeof amount === "number" ? amount : Number(amount);
  if (Number.isNaN(value)) return "--";
  return `${currency} ${Math.round(value).toLocaleString("en-US")}`;
}

/** ISO -> "23 Sep, 14:10" (Kigali time) */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "--";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: KIGALI_TZ,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** ISO -> "23 Sep 2026" (Kigali time) */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "--";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: KIGALI_TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/** "2026-09" -> "September 2026" */
export function formatMonthKey(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, 15))
  );
}

/** 87.5 -> "87.5%"; null (no data behind the rate) -> "--" */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return "--";
  return `${Number(value.toFixed(1))}%`;
}

/** ISO -> "just now" / "4 min ago" / "3 h ago" / "2 days ago", relative to `now` (ms). */
export function formatRelative(iso: string | null | undefined, now: number): string {
  if (!iso) return "--";
  const minutes = Math.round((now - Date.parse(iso)) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
