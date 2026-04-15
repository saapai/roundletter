// Shared client helper. Calls /api/v1-letters to get the authoritative server
// round; if it's different from what this browser last saw, wipes every
// local/session key related to the riddle (letter solves, sticky flags,
// polymarket depth, caches). Future round bumps auto-reset the client.

export async function syncRiddleRound(): Promise<number | null> {
  if (typeof window === "undefined") return null;
  try {
    const r = await fetch("/api/v1-letters", { cache: "no-store" });
    if (!r.ok) return null;
    const j = (await r.json()) as { round?: number };
    const serverRound = typeof j.round === "number" ? j.round : 1;
    const lastSeen = parseInt(localStorage.getItem("last-seen-round") || "0", 10);
    if (serverRound !== lastSeen) {
      const lsKeysToWipe = Object.keys(localStorage).filter(
        (k) =>
          k.startsWith("v1-solved-") ||
          k.startsWith("v1-seen-") ||
          k.startsWith("crowd-solved-") ||
          k === "polymarket-global-solved-sticky" ||
          k === "home-polymarket-solved" ||
          k === "home-green-seen",
      );
      lsKeysToWipe.forEach((k) => localStorage.removeItem(k));
      const ssKeysToWipe = Object.keys(sessionStorage).filter(
        (k) =>
          k === "polymarket-global-cache" ||
          k === "polymarket-depth" ||
          k === "prices-cache-v1",
      );
      ssKeysToWipe.forEach((k) => sessionStorage.removeItem(k));
      localStorage.setItem("last-seen-round", String(serverRound));
    }
    return serverRound;
  } catch {
    return null;
  }
}
