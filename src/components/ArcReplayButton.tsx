"use client";

const STORAGE_KEY = "rl:arc-overture-seen-v1";

export default function ArcReplayButton() {
  function replay() {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
    window.location.reload();
  }
  return (
    <button
      type="button"
      className="arc-coda-replay"
      onClick={replay}
      aria-label="replay the ghost town intro"
    >
      replay the intro
    </button>
  );
}
