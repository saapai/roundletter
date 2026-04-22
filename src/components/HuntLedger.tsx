"use client";

import { useEffect, useState } from "react";
import {
  HUNT_EGGS,
  HUNT_TOTAL,
  readUnlocked,
  HUNT_STORAGE_KEY,
} from "@/lib/hunt";

// The ledger. Rendered at the bottom of /6969 so the curious reader who
// makes it past the credits finds a running record of the five eggs —
// which they've caught and which are still out there. Never names the
// bankroll pages directly; each locked egg shows only a shape of a hint.

export default function HuntLedger() {
  const [unlocked, setUnlocked] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setUnlocked(readUnlocked());
    const onStorage = (e: StorageEvent) => {
      if (e.key === HUNT_STORAGE_KEY) setUnlocked(readUnlocked());
    };
    window.addEventListener("storage", onStorage);
    const onFocus = () => setUnlocked(readUnlocked());
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const foundCount = unlocked.size;

  return (
    <section className="hunt-ledger" id="hunt" aria-label="the hunt">
      <div className="hunt-ledger-head">
        <span className="hunt-ledger-eye">// the hunt</span>
        <span className="hunt-ledger-count">
          {foundCount} of {HUNT_TOTAL} caught
        </span>
      </div>
      <p className="hunt-ledger-line">
        <em>
          six eggs, hidden across the document. two of them pay real bankroll
          — $25 or $10, cash or portfolio. one plays a song. the rest are
          lore. catch them in any order. your browser keeps the record.
        </em>
      </p>
      <ul className="hunt-ledger-list">
        {HUNT_EGGS.map((egg) => {
          const found = unlocked.has(egg.id);
          const tag =
            egg.reward === "kalshi"
              ? "$25 kalshi"
              : egg.reward === "waymo"
              ? "$10 waymo"
              : egg.reward === "lucky"
              ? "daft punk"
              : null;
          return (
            <li
              key={egg.id}
              className={`hunt-ledger-row${found ? " is-found" : ""}`}
            >
              <span className="hunt-ledger-mark" aria-hidden="true">
                {found ? "◆" : "·"}
              </span>
              <span className="hunt-ledger-name">
                {found ? egg.name : "—"}
                {tag && (
                  <span className="hunt-ledger-tag" aria-hidden="true">
                    {tag}
                  </span>
                )}
              </span>
              <span className="hunt-ledger-origin">
                <em>{found ? egg.origin : rarityShape(egg.rarity)}</em>
              </span>
            </li>
          );
        })}
      </ul>
      <p className="hunt-ledger-fine">
        <em>the ledger is stored on this device. clear site data and it resets.</em>
      </p>
    </section>
  );
}

function rarityShape(r: 1 | 2 | 3): string {
  if (r === 3) return "· · · · · hard · · · · ·";
  if (r === 2) return "· · · medium · · ·";
  return "· easy ·";
}
