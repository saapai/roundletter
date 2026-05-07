"use client";
import { useEffect, useRef, useState, useCallback } from "react";

type EggId = "egg_1" | "egg_2" | "egg_5";
type FoundEggs = Record<EggId, boolean>;

const COOKIE_NAME = "aureliex_eggs";
const BONUS_COOKIE = "aureliex_discount";

function getFoundEggs(): FoundEggs {
  const base: FoundEggs = { egg_1: false, egg_2: false, egg_5: false };
  try {
    const raw = document.cookie
      .split("; ")
      .find((c) => c.startsWith(COOKIE_NAME + "="));
    if (raw) {
      const val = JSON.parse(decodeURIComponent(raw.split("=")[1]));
      if (val.egg_1) base.egg_1 = true;
      if (val.egg_2) base.egg_2 = true;
      if (val.egg_5) base.egg_5 = true;
    }
  } catch {}
  return base;
}

function saveFoundEggs(eggs: FoundEggs) {
  const maxAge = 60 * 60 * 24 * 30; // 30 days
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(eggs))};path=/;max-age=${maxAge};SameSite=Strict`;

  // Check if all found → set bonus
  if (eggs.egg_1 && eggs.egg_2 && eggs.egg_5) {
    document.cookie = `${BONUS_COOKIE}=10;path=/;max-age=${maxAge};SameSite=Strict`;
  }
}

export function getDiscount(): number {
  try {
    const raw = document.cookie
      .split("; ")
      .find((c) => c.startsWith(BONUS_COOKIE + "="));
    if (raw) return parseInt(raw.split("=")[1], 10) || 0;
    // Sum individual eggs
    const eggs = getFoundEggs();
    let sum = 0;
    if (eggs.egg_1) sum += 1;
    if (eggs.egg_2) sum += 2;
    if (eggs.egg_5) sum += 5;
    return sum;
  } catch {
    return 0;
  }
}

export function useEggs() {
  const [eggs, setEggs] = useState<FoundEggs>({ egg_1: false, egg_2: false, egg_5: false });
  const [justFound, setJustFound] = useState<EggId | "bonus" | null>(null);

  useEffect(() => {
    setEggs(getFoundEggs());
  }, []);

  const findEgg = useCallback((id: EggId) => {
    setEggs((prev) => {
      if (prev[id]) return prev;
      const next = { ...prev, [id]: true };
      saveFoundEggs(next);

      setJustFound(id);
      setTimeout(() => {
        // Check for bonus
        if (next.egg_1 && next.egg_2 && next.egg_5) {
          setJustFound("bonus");
          setTimeout(() => setJustFound(null), 3000);
        } else {
          setJustFound(null);
        }
      }, 2000);

      return next;
    });
  }, []);

  const allFound = eggs.egg_1 && eggs.egg_2 && eggs.egg_5;
  const discount = allFound ? 10 : (eggs.egg_1 ? 1 : 0) + (eggs.egg_2 ? 2 : 0) + (eggs.egg_5 ? 5 : 0);

  return { eggs, findEgg, justFound, allFound, discount };
}

/*
 * Easter Egg #1 ($1) — EASY: Long-press on the "aureliex." wordmark (3 seconds)
 * Easter Egg #2 ($2) — MEDIUM: Type "PARTY" anywhere on the page
 * Easter Egg #3 ($5) — HARD: Click the ornamental ❦ divider 5 times rapidly
 */

export function EggWordmarkTrigger({ findEgg }: { findEgg: (id: EggId) => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pressing, setPressing] = useState(false);

  const onStart = () => {
    setPressing(true);
    timerRef.current = setTimeout(() => {
      findEgg("egg_1");
      setPressing(false);
    }, 3000);
  };

  const onEnd = () => {
    setPressing(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <span
      className={`egg-wordmark-trigger ${pressing ? "is-pressing" : ""}`}
      onMouseDown={onStart}
      onMouseUp={onEnd}
      onMouseLeave={onEnd}
      onTouchStart={onStart}
      onTouchEnd={onEnd}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, cursor: "default" }}
    />
  );
}

export function EggPartyListener({ findEgg }: { findEgg: (id: EggId) => void }) {
  const bufferRef = useRef("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      bufferRef.current = (bufferRef.current + e.key.toUpperCase()).slice(-5);
      if (bufferRef.current === "PARTY") {
        findEgg("egg_2");
        bufferRef.current = "";
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [findEgg]);

  return null;
}

export function EggOrnamentTrigger({ findEgg }: { findEgg: (id: EggId) => void }) {
  const clicksRef = useRef<number[]>([]);

  const onClick = () => {
    const now = Date.now();
    clicksRef.current = [...clicksRef.current.filter((t) => now - t < 2000), now];
    if (clicksRef.current.length >= 5) {
      findEgg("egg_5");
      clicksRef.current = [];
    }
  };

  return (
    <span
      onClick={onClick}
      className="egg-ornament-trigger"
      style={{ cursor: "default", userSelect: "none" }}
      aria-hidden="true"
    >
      ❦
    </span>
  );
}

export function EggToast({ justFound }: { justFound: EggId | "bonus" | null }) {
  if (!justFound) return null;

  const messages: Record<string, { amount: string; label: string }> = {
    egg_1: { amount: "+$1", label: "You found a hidden treasure" },
    egg_2: { amount: "+$2", label: "The party knows you're coming" },
    egg_5: { amount: "+$5", label: "Persistence pays" },
    bonus: { amount: "$10 total", label: "All three found — full discount unlocked" },
  };

  const msg = messages[justFound];
  const isBonus = justFound === "bonus";

  return (
    <div className={`egg-toast ${isBonus ? "egg-toast-bonus" : ""}`}>
      <span className="egg-toast-amount">{msg.amount}</span>
      <span className="egg-toast-label">{msg.label}</span>
    </div>
  );
}
