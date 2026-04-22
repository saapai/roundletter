// US equity market hours helper — used by the live-price pollers to
// decide whether to refetch aggressively.  returns true when the
// wall clock in the America/New_York zone is inside the 9:30-16:00
// window on a weekday.  no holiday calendar — if the market's shut
// for the day, /api/prices just returns the last close and the UI
// keeps showing the same numbers without penalty.

const OPEN_MIN = 9 * 60 + 30;   // 9:30 ET in minutes since midnight
const CLOSE_MIN = 16 * 60;      // 16:00 ET

function etNow(): { dow: number; min: number } {
  // Render a Date in the America/New_York zone via toLocaleString +
  // parse the pieces back.  avoids shipping a tz library.
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { dow: map[weekday] ?? 0, min: hour * 60 + minute };
}

export function isMarketOpen(): boolean {
  const { dow, min } = etNow();
  if (dow === 0 || dow === 6) return false;
  return min >= OPEN_MIN && min < CLOSE_MIN;
}

export const MARKET_OPEN_POLL_MS = 15_000;   // 15s when open
export const MARKET_SHUT_POLL_MS = 600_000;  // 10m when closed (covers pre/post)
