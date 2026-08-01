"use client";
import { useEffect, useRef } from "react";
import { useEggs, EggPartyListener, EggOrnamentTrigger, EggToast } from "@/components/EasterEggs";
import Link from "next/link";

type EggId = "egg_1" | "egg_2" | "egg_5";

export default function HomeEggs({ daysToBirthday }: { daysToBirthday: number }) {
  const { eggs, findEgg, justFound, allFound, discount } = useEggs();

  return (
    <>
      {/* Easter egg #2: type PARTY anywhere */}
      <EggPartyListener findEgg={findEgg} />
      <EggToast justFound={justFound} />

      {/* Easter egg #1: long-press the "aureliex" cover mark */}
      <WordmarkEgg findEgg={findEgg} />

      {/* Easter egg #3: ornament divider — click 5x fast */}
      <div className="home-egg-ornament">
        <EggOrnamentTrigger findEgg={findEgg} />
      </div>

      {/* Invest CTA section */}
      <section className="home-invest-cta">
        <h2>Join the Pool</h2>
        <p>
          Invest early, invest more — your allocation weight grows with time.
          <br />
          <em>weight = investment × days before the party</em>
        </p>
        <div className="home-invest-methods">
          <a
            href="https://venmo.com/saathvikpai"
            target="_blank"
            rel="noopener noreferrer"
            className="home-invest-btn home-invest-primary"
          >
            Venmo @saathvikpai — no fees
          </a>
          <a
            href="sms:3853687238&body=Investing%20in%20the%20aureliex%20pool"
            className="home-invest-btn home-invest-text"
          >
            Text (385) 368-7238 — no fees
          </a>
          <Link href="/invest" className="home-invest-btn home-invest-secondary">
            Stripe checkout → (+3.9% fee on you)
          </Link>
        </div>
        <p className="home-invest-sub">
          Paying directly avoids the Stripe processing fee — full amount enters the pool.
          {daysToBirthday > 0 && (
            <span className="home-invest-countdown"> T−{daysToBirthday} days.</span>
          )}
        </p>
        {discount > 0 && (
          <p className="home-invest-discount">
            ${discount} discount found — applied at checkout
          </p>
        )}
      </section>
    </>
  );
}

function WordmarkEgg({ findEgg }: { findEgg: (id: EggId) => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = document.querySelector(".cov-mark");
    if (!el) return;

    const onStart = () => {
      timerRef.current = setTimeout(() => {
        findEgg("egg_1");
      }, 3000);
    };
    const onEnd = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    el.addEventListener("mousedown", onStart);
    el.addEventListener("mouseup", onEnd);
    el.addEventListener("mouseleave", onEnd);
    el.addEventListener("touchstart", onStart);
    el.addEventListener("touchend", onEnd);

    return () => {
      el.removeEventListener("mousedown", onStart);
      el.removeEventListener("mouseup", onEnd);
      el.removeEventListener("mouseleave", onEnd);
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    };
  }, [findEgg]);

  return null;
}
