"use client";

import { useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════
   Interactive Ticket — tear · fold · crush · drag/throw · flip
   Pure CSS transforms + vanilla JS. No libraries.
   ═══════════════════════════════════════════════════════════ */

const TEAR_SNAP = 100;
const LONG_PRESS = 500;
const DECAY = 0.92;
const BOUNCE = -0.5;

function rand(a: number, b: number) { return a + Math.random() * (b - a); }

function crushPoly(): string {
  const pts: string[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const r = rand(35, 48);
    pts.push(`${(50 + r * Math.cos(a)).toFixed(1)}% ${(50 + r * Math.sin(a)).toFixed(1)}%`);
  }
  return `polygon(${pts.join(", ")})`;
}

export default function InteractiveTicket() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const ticketRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const stubRef = useRef<HTMLDivElement>(null);
  const tearRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const s = useRef({
    // drag
    dragging: false, dx: 0, dy: 0, px: 0, py: 0,
    vx: 0, vy: 0, lx: 0, ly: 0, mraf: 0,
    // tear
    tearing: false, torn: false, tsx: 0, tdx: 0,
    // stub drag (post-tear)
    sd: false, sdx: 0, sdy: 0, ssx: 0, ssy: 0,
    svx: 0, svy: 0, slx: 0, sly: 0, smraf: 0,
    // fold/crush/flip
    folded: false, crushed: false, lpt: 0, flipped: false,
    swiping: false, swY: 0,
  });

  /* ── DRAG (whole ticket, throwable with bounce) ── */
  const applyPos = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const { px, py, vx } = s.current;
    const tilt = Math.max(-12, Math.min(12, vx * 0.7));
    el.style.transform = `translate(${px}px, ${py}px) rotate(${tilt}deg)`;
  }, []);

  const momentum = useCallback(() => {
    const c = s.current;
    cancelAnimationFrame(c.mraf);
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.parentElement?.getBoundingClientRect();
    const step = () => {
      c.vx *= DECAY; c.vy *= DECAY;
      c.px += c.vx; c.py += c.vy;
      // Bounce off parent edges
      if (rect) {
        if (c.px < -rect.width / 2) { c.px = -rect.width / 2; c.vx *= BOUNCE; }
        if (c.px > rect.width / 2) { c.px = rect.width / 2; c.vx *= BOUNCE; }
        if (c.py < -rect.height / 2) { c.py = -rect.height / 2; c.vy *= BOUNCE; }
        if (c.py > rect.height / 2) { c.py = rect.height / 2; c.vy *= BOUNCE; }
      }
      applyPos();
      if (Math.abs(c.vx) > 0.3 || Math.abs(c.vy) > 0.3) c.mraf = requestAnimationFrame(step);
    };
    c.mraf = requestAnimationFrame(step);
  }, [applyPos]);

  const onDragDown = useCallback((e: React.PointerEvent) => {
    if (s.current.tearing) return;
    const c = s.current;
    c.dragging = true; c.dx = e.clientX - c.px; c.dy = e.clientY - c.py;
    c.lx = e.clientX; c.ly = e.clientY;
    cancelAnimationFrame(c.mraf);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onDragMove = useCallback((e: React.PointerEvent) => {
    const c = s.current;
    if (!c.dragging) return;
    c.vx = e.clientX - c.lx; c.vy = e.clientY - c.ly;
    c.lx = e.clientX; c.ly = e.clientY;
    c.px = e.clientX - c.dx; c.py = e.clientY - c.dy;
    applyPos();
  }, [applyPos]);

  const onDragUp = useCallback(() => {
    if (!s.current.dragging) return;
    s.current.dragging = false;
    momentum();
  }, [momentum]);

  /* ── TEAR ── */
  const snapTear = useCallback(() => {
    const stub = stubRef.current;
    const body = bodyRef.current;
    const tear = tearRef.current;
    if (!stub || !body || !tear) return;
    const c = s.current;
    c.torn = true; c.tearing = false;
    stub.style.transition = "transform 0.35s cubic-bezier(0.175,0.885,0.32,1.275)";
    stub.style.transform = `translateX(${TEAR_SNAP + 40}px) rotate(${rand(4, 9)}deg)`;
    body.classList.add("it-body--torn");
    tear.style.opacity = "0";
    setTimeout(() => { stub.style.transition = ""; stub.style.cursor = "grab"; }, 360);
  }, []);

  const onStubDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    const c = s.current;
    if (c.torn) {
      c.sd = true; c.ssx = e.clientX - c.sdx; c.ssy = e.clientY - c.sdy;
      c.slx = e.clientX; c.sly = e.clientY;
      cancelAnimationFrame(c.smraf);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      return;
    }
    c.tearing = true; c.tsx = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const stubMomentum = useCallback(() => {
    const c = s.current;
    cancelAnimationFrame(c.smraf);
    const step = () => {
      c.svx *= DECAY; c.svy *= DECAY;
      if (Math.abs(c.svx) < 0.3 && Math.abs(c.svy) < 0.3) return;
      c.sdx += c.svx; c.sdy += c.svy;
      const stub = stubRef.current;
      if (stub) {
        const tilt = Math.max(-12, Math.min(12, c.svx * 0.8));
        stub.style.transform = `translate(${c.sdx}px, ${c.sdy}px) rotate(${6 + tilt}deg)`;
      }
      c.smraf = requestAnimationFrame(step);
    };
    c.smraf = requestAnimationFrame(step);
  }, []);

  const onStubMove = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    const c = s.current;
    if (c.torn && c.sd) {
      c.svx = e.clientX - c.slx; c.svy = e.clientY - c.sly;
      c.slx = e.clientX; c.sly = e.clientY;
      c.sdx = e.clientX - c.ssx; c.sdy = e.clientY - c.ssy;
      const stub = stubRef.current;
      if (stub) stub.style.transform = `translate(${c.sdx}px, ${c.sdy}px) rotate(${6 + c.svx * 0.8}deg)`;
      return;
    }
    if (!c.tearing) return;
    const dx = Math.max(0, e.clientX - c.tsx);
    c.tdx = dx;
    const stub = stubRef.current;
    const tear = tearRef.current;
    if (stub) {
      const r = Math.min(1, dx / TEAR_SNAP);
      stub.style.transform = `translateX(${dx}px) rotate(${r * 5}deg)`;
      stub.style.boxShadow = r > 0.1 ? `-${2 + r * 8}px 0 ${r * 14}px rgba(0,0,0,${0.1 + r * 0.2})` : "";
    }
    if (tear) tear.style.opacity = `${1 - Math.min(1, dx / TEAR_SNAP) * 0.8}`;
    if (dx >= TEAR_SNAP) snapTear();
  }, [snapTear]);

  const onStubUp = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    const c = s.current;
    if (c.torn && c.sd) { c.sd = false; stubMomentum(); return; }
    if (!c.tearing) return;
    c.tearing = false;
    const stub = stubRef.current;
    const tear = tearRef.current;
    if (stub) {
      stub.style.transition = "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease";
      stub.style.transform = ""; stub.style.boxShadow = "";
    }
    if (tear) { tear.style.transition = "opacity 0.4s ease"; tear.style.opacity = ""; }
    setTimeout(() => {
      if (stub) stub.style.transition = "";
      if (tear) tear.style.transition = "";
    }, 420);
  }, [stubMomentum]);

  /* ── FOLD ── */
  const onFold = useCallback(() => {
    const c = s.current;
    const top = topRef.current;
    if (!top) return;
    c.folded = !c.folded;
    top.style.transition = "transform 0.5s cubic-bezier(0.4,0,0.2,1)";
    top.style.transform = c.folded ? "rotateX(175deg)" : "rotateX(0deg)";
  }, []);

  /* ── CRUSH ── */
  const onCrushStart = useCallback(() => {
    const c = s.current;
    c.lpt = window.setTimeout(() => {
      c.crushed = true;
      const el = ticketRef.current;
      if (!el) return;
      el.style.clipPath = crushPoly();
      el.style.transform = "scale(0.82)";
      el.style.opacity = "0.78";
      el.style.transition = "clip-path 0.15s ease, transform 0.15s ease, opacity 0.15s ease";
    }, LONG_PRESS);
  }, []);

  const onCrushEnd = useCallback(() => {
    const c = s.current;
    clearTimeout(c.lpt);
    if (!c.crushed) return;
    c.crushed = false;
    const el = ticketRef.current;
    if (!el) return;
    el.style.transition = "clip-path 1.5s cubic-bezier(0.34,1.56,0.64,1), transform 1.5s cubic-bezier(0.34,1.56,0.64,1), opacity 1.5s ease";
    el.style.clipPath = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
    el.style.transform = "";
    el.style.opacity = "1";
  }, []);

  /* ── FLIP (swipe up or press F) ── */
  const flip = useCallback(() => {
    const c = s.current;
    const el = ticketRef.current;
    if (!el) return;
    c.flipped = !c.flipped;
    el.classList.toggle("it--flipped", c.flipped);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "f" || e.key === "F") flip(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flip]);

  return (
    <div className="it-stage">
      <p className="it-hint">drag & throw · pull stub to tear · double-click to fold · long-press to crush · press F to flip</p>
      <div
        ref={wrapRef}
        className="it-wrap"
        onPointerDown={onDragDown}
        onPointerMove={onDragMove}
        onPointerUp={onDragUp}
        onPointerCancel={onDragUp}
      >
        <div
          ref={ticketRef}
          className="it"
          onTouchStart={(e) => { s.current.swiping = true; s.current.swY = e.touches[0].clientY; }}
          onTouchEnd={(e) => {
            if (s.current.swiping && s.current.swY - e.changedTouches[0].clientY > 60) flip();
            s.current.swiping = false;
          }}
        >
          {/* Front face */}
          <div className="it-face it-front">
            <div className="it-scene" style={{ perspective: "600px" }}>
              <div ref={topRef} className="it-top" style={{ transformOrigin: "bottom center" }}>
                <div className="it-body-top">
                  <span className="it-eyebrow">live event</span>
                  <span className="it-title">the liquidity event</span>
                </div>
              </div>
              <div className="it-bottom">
                <div
                  ref={bodyRef}
                  className="it-body-bottom"
                  onDoubleClick={onFold}
                  onPointerDown={(e) => { e.stopPropagation(); onCrushStart(); onDragDown(e); }}
                  onPointerUp={(e) => { onCrushEnd(); onDragUp(); }}
                  onPointerCancel={onCrushEnd}
                  onPointerLeave={onCrushEnd}
                >
                  <span className="it-date">june 20, 2026 · salt lake city</span>
                  <span className="it-cta">rsvp →</span>
                </div>
              </div>
            </div>

            {/* Tear line */}
            <div ref={tearRef} className="it-tear">
              <div className="it-tear-hole it-tear-t" />
              <div className="it-tear-dash" />
              <div className="it-tear-hole it-tear-b" />
            </div>

            {/* Stub */}
            <div
              ref={stubRef}
              className="it-stub"
              onPointerDown={onStubDown}
              onPointerMove={onStubMove}
              onPointerUp={onStubUp}
              onPointerCancel={onStubUp}
            >
              <div className="it-barcode">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="it-bar" style={{ height: `${6 + ((i * 7 + 3) % 12)}px` }} />
                ))}
              </div>
              <span className="it-admit">ADMIT ONE</span>
            </div>
          </div>

          {/* Back face */}
          <div className="it-face it-back">
            <span className="it-watermark">aureliex.</span>
            <span className="it-back-note">not investment advice</span>
          </div>
        </div>
      </div>
    </div>
  );
}
