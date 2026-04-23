"use client";

import { useEffect, useState } from "react";
import art from "@/data/art-portfolio.json";
import { HUNT_PHONE_DISPLAY, HUNT_PHONE_TEL } from "@/lib/hunt";

// Art-portfolio gallery · COMING SOON state.
//
// Fourteen pieces by saapai p. (2015–present). Images are intentionally
// withheld until the portfolio unlocks — each tile shows a locked
// "coming soon" card with an AI-generated textual preview + the panel's
// starting bid (and current high, if any).
//
// Tapping any tile opens the native Messages composer pre-filled with a
// bid of $1 over the current bid (or $1 over the starting bid if no
// one has bid yet). Offers are verified over text and committed to the
// manifest as the ledger grows.

type Piece = {
  id: string;
  title: string;
  medium: string;
  date: string;
  note?: string;
  image: string;
  start_bid: number;
  current_bid: number | null;
  bid_count: number;
  status: "open" | "closed" | "hold";
  tags?: string[];
  locked_preview?: string;
};

type Manifest = {
  meta: {
    round: string;
    stake_reserved_pct: number;
    auction_close_iso: string;
    auction_close_label: string;
    state?: "coming_soon" | "live" | "closed";
    about: string;
  };
  pieces: Piece[];
};

function fmt$(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function nextBid(piece: Piece): number {
  const floor = piece.current_bid ?? piece.start_bid;
  return floor + 1;
}

function bidSmsUrl(piece: Piece): string {
  const offer = nextBid(piece);
  const floor = piece.current_bid ?? piece.start_bid;
  const body = [
    `bid · ${piece.id}`,
    `piece · ${piece.title}`,
    `offer · ${fmt$(offer)} (+$1 over ${piece.current_bid == null ? "starting" : "current"} ${fmt$(floor)})`,
    "",
    "— via aureliex.com/#art",
  ].join("\n");
  const num = HUNT_PHONE_TEL.replace(/^tel:/, "");
  return `sms:${num}?&body=${encodeURIComponent(body)}`;
}

function daysHoursUntil(iso: string): string {
  const target = Date.parse(iso);
  if (Number.isNaN(target)) return "";
  const ms = Math.max(0, target - Date.now());
  if (ms === 0) return "closed";
  const d = Math.floor(ms / (1000 * 60 * 60 * 24));
  const h = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
}

// Color seed for the locked-tile gradient — one consistent hue per
// piece id so the gallery has variety without being random per render.
function hueFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return h;
}

export default function ArtPortfolio() {
  const data = art as Manifest;
  const [countdown, setCountdown] = useState(
    daysHoursUntil(data.meta.auction_close_iso),
  );
  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(daysHoursUntil(data.meta.auction_close_iso));
    }, 30 * 1000);
    return () => clearInterval(t);
  }, [data.meta.auction_close_iso]);

  return (
    <section className="art-portfolio" id="art" aria-label="art portfolio · locked · coming soon">
      <div className="art-portfolio-head">
        <div>
          <div className="art-portfolio-eye">
            // art portfolio · coming soon · {data.meta.round}
          </div>
          <h2 className="art-portfolio-title">fourteen pieces, under lock.</h2>
          <p className="art-portfolio-sub">
            previews only. tap any tile to offer <strong>$1 over</strong> the
            current ask via imessage. winners get <strong>file + physical</strong>,
            shipped insured.
          </p>
        </div>
        <div className="art-portfolio-close">
          <div className="art-portfolio-close-k">closes</div>
          <div className="art-portfolio-close-v">{countdown || "—"}</div>
          <div className="art-portfolio-close-s">{data.meta.auction_close_label}</div>
        </div>
      </div>

      <div className="art-grid">
        {data.pieces.map((piece) => {
          const floor = piece.current_bid ?? piece.start_bid;
          const offer = floor + 1;
          const hue = hueFromId(piece.id);
          return (
            <a
              key={piece.id}
              className="art-card art-card-locked"
              href={bidSmsUrl(piece)}
              aria-label={`bid ${fmt$(offer)} on ${piece.title}`}
            >
              <div
                className="art-card-frame art-card-frame-locked"
                style={{
                  ["--art-h" as string]: `${hue}`,
                }}
                aria-hidden="true"
              >
                <span className="art-card-lock">
                  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                    <path
                      d="M7 10V7a5 5 0 0 1 10 0v3h1.5A1.5 1.5 0 0 1 20 11.5v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19.5v-8A1.5 1.5 0 0 1 5.5 10H7zm2 0h6V7a3 3 0 1 0-6 0v3z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <span className="art-card-coming">coming soon</span>
                <span className="art-card-date">{piece.date}</span>
              </div>
              <div className="art-card-body">
                <div className="art-card-kicker">{piece.medium}</div>
                <h3 className="art-card-title">{piece.title}</h3>
                {piece.locked_preview ? (
                  <p className="art-card-note"><em>{piece.locked_preview}</em></p>
                ) : null}
                <div className="art-card-bidline">
                  <div className="art-card-bid-k">
                    {piece.current_bid == null ? "starting at" : "current"}
                  </div>
                  <div className="art-card-bid-v">{fmt$(floor)}</div>
                  <div className="art-card-bid-n">
                    {piece.bid_count} {piece.bid_count === 1 ? "bid" : "bids"}
                  </div>
                </div>
                <span className="art-card-cta">
                  bid {fmt$(offer)} · +$1
                </span>
              </div>
            </a>
          );
        })}
      </div>

      <details className="art-portfolio-expand">
        <summary>settlement + shipping · how winners get the piece</summary>
        <p>
          <em>
            bids verified over text at {HUNT_PHONE_DISPLAY}. images unlock
            when the portfolio unlocks. winners receive the full file
            (high-res jpg or tiff via text / airdrop) plus the physical
            original, usps priority mail, tracked + insured, at my cost.
            shipping details negotiated by text.
          </em>
        </p>
      </details>
    </section>
  );
}
