"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import styles from "./page.module.css";
import { PLACEMENTS } from "./pieces";

type Piece = {
  id: string;
  title?: string;
  medium?: string;
  date?: string;
  image?: string;
  start_bid?: number;
  current_bid?: number | null;
};

type Meta = {
  round?: string;
  auction_close_label?: string;
  stake_reserved_pct?: number;
  about?: string;
};

function captionMeta(p: Piece): string {
  const parts: string[] = [];
  if (p.medium) parts.push(p.medium);
  const y = yearOf(p.date);
  if (y) parts.push(y);
  return parts.length ? ` · ${parts.join(" · ")}` : "";
}

function fmtMoney(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function yearOf(date?: string): string {
  if (!date) return "";
  const m = date.match(/^(\d{4})/);
  return m ? m[1] : "";
}

export default function SalonWall({ pieces, meta }: { pieces: Piece[]; meta?: Meta }) {
  const reduce = useReducedMotion();

  // Order pieces by manifest (curatorial sequence). Pieces missing from
  // the manifest are appended at the end so we never drop content.
  const ordered = useMemo(() => {
    const byId = new Map(pieces.map((p) => [p.id, p]));
    const placed = PLACEMENTS.map((pl) => ({ pl, p: byId.get(pl.id) })).filter(
      (x): x is { pl: typeof PLACEMENTS[number]; p: Piece } => !!x.p,
    );
    const placedIds = new Set(placed.map((x) => x.p.id));
    const trailing = pieces.filter((p) => !placedIds.has(p.id));
    return { placed, trailing };
  }, [pieces]);

  // Curatorial sequence (manifest order → visible pieces) for keyboard nav.
  const sequence = useMemo(
    () => [...ordered.placed.map((x) => x.p), ...ordered.trailing],
    [ordered],
  );

  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const open = openIdx != null ? sequence[openIdx] : null;

  const close = useCallback(() => setOpenIdx(null), []);
  const next = useCallback(
    () => setOpenIdx((i) => (i == null ? null : (i + 1) % sequence.length)),
    [sequence.length],
  );
  const prev = useCallback(
    () => setOpenIdx((i) => (i == null ? null : (i - 1 + sequence.length) % sequence.length)),
    [sequence.length],
  );

  // Arrow keys + Esc.
  useEffect(() => {
    if (openIdx == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIdx, close, next, prev]);

  // Lock scroll when lightbox open.
  useEffect(() => {
    if (openIdx == null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [openIdx]);

  // Touch swipe — left/right traverse, down closes.
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    touch.current = null;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    if (Math.max(ax, ay) < 40) return;
    if (ax > ay) {
      if (dx < 0) next();
      else prev();
    } else if (dy > 0) {
      close();
    }
  };

  return (
    <>
      <ul className={`${styles.grid} salon-wall`} role="list">
        {ordered.placed.map(({ pl, p }, i) => {
          const stagger = reduce ? 0 : i * 0.06;
          return (
            <li
              key={p.id}
              className={styles.cell}
              style={{
                gridColumn: `${pl.colStart} / span ${pl.colSpan}`,
                gridRow: `span ${pl.rowSpan}`,
                animationDelay: reduce ? undefined : `${stagger}s`,
                ["--m-col-start" as never]: pl.mColStart,
                ["--m-col-span" as never]: pl.mColSpan,
                ["--m-row-span" as never]: pl.mRowSpan,
              }}
            >
              <button
                type="button"
                onClick={() => setOpenIdx(i)}
                className={`${styles.frame} art-frame`}
                aria-label={`open ${p.title || p.id}`}
              >
                <motion.img
                  layoutId={reduce ? undefined : `piece-${p.id}`}
                  src={p.image as string}
                  alt={p.title || p.id}
                  loading={i < 3 ? "eager" : "lazy"}
                  className={styles.img}
                />
              </button>
              <figcaption className={styles.caption}>
                <span className={styles.captionTitle}>{p.title || p.id}</span>
                <span className={styles.captionMeta}>{captionMeta(p)}</span>
              </figcaption>
            </li>
          );
        })}
      </ul>

      {/* COLOPHON — borrowed from ART4. Sequential index closer.
         Surfaces medium + year per row and a "how to bid" line at top. */}
      <section className={styles.colophon} aria-label="colophon">
        <div className={styles.colophonHead}>
          <span>colophon · 12 plates</span>
          <span>
            total ·{" "}
            {fmtMoney(
              sequence.reduce(
                (sum, p) =>
                  sum +
                  (typeof p.current_bid === "number" ? p.current_bid : p.start_bid ?? 0),
                0,
              ),
            )}
          </span>
        </div>
        <p className={styles.colophonHowto}>
          tap any plate above to enlarge. to bid, text saapai $1 over the
          listed start; round 1 closes{" "}
          <strong>{meta?.auction_close_label || "tbd"}</strong>.
        </p>
        <ol className={styles.colophonList}>
          {sequence.map((p, i) => {
            const bid =
              typeof p.current_bid === "number" ? p.current_bid : (p.start_bid ?? 0);
            const subline = [p.medium, yearOf(p.date)].filter(Boolean).join(" · ");
            return (
              <li key={p.id} className={styles.colophonRow}>
                <span className={styles.colophonNum}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={styles.colophonTitleCol}>
                  <span className={styles.colophonTitle}>{p.title || p.id}</span>
                  {subline ? (
                    <span className={styles.colophonSub}>{subline}</span>
                  ) : null}
                </span>
                <span className={styles.colophonBid}>
                  {fmtMoney(bid)}
                  <span className={styles.colophonBidLabel}>
                    {p.current_bid != null ? " bid" : " start"}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={close}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            role="dialog"
            aria-modal="true"
            aria-label={open.title || open.id}
          >
            <button
              type="button"
              className={styles.lightboxClose}
              aria-label="close"
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
            >
              ×
            </button>
            <button
              type="button"
              className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
              aria-label="previous piece"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
            >
              ‹
            </button>
            <button
              type="button"
              className={`${styles.lightboxNav} ${styles.lightboxNext}`}
              aria-label="next piece"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
            >
              ›
            </button>
            <div className={styles.lightboxFrame} onClick={(e) => e.stopPropagation()}>
              <motion.img
                layoutId={reduce ? undefined : `piece-${open.id}`}
                src={open.image as string}
                alt={open.title || open.id}
                className={styles.lightboxImg}
                initial={reduce ? { opacity: 0 } : undefined}
                animate={reduce ? { opacity: 1 } : undefined}
                exit={reduce ? { opacity: 0 } : undefined}
                transition={
                  reduce
                    ? { duration: 0.12 }
                    : { type: "spring", stiffness: 260, damping: 32 }
                }
              />
            </div>
            <div className={styles.lightboxCaption}>
              <div className={styles.lightboxCaptionTitle}>{open.title || open.id}</div>
              <div className={styles.lightboxCaptionMeta}>
                {open.medium ? `${open.medium} · ` : ""}
                {yearOf(open.date)}
                {(() => {
                  const bid =
                    typeof open.current_bid === "number"
                      ? open.current_bid
                      : (open.start_bid ?? 0);
                  return ` · ${fmtMoney(bid)} ${open.current_bid != null ? "bid" : "start"}`;
                })()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
