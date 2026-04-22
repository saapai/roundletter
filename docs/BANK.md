# the bank

Running index of things the document owes but isn't paying today. Each
entry is a deferred decision — captured so the next build pass can
reference it without re-litigating.

This file is the **canonical design + history reference** for the site.
When adding UI work, scan here first.

---

## design inspos · apr 2026 drop (reference while designing)

References saapai sent mid-build. Filed rather than force-applied.

| # | reference                                                               | the pattern                                                                         | candidate surfaces                                                      |
|---|-------------------------------------------------------------------------|-------------------------------------------------------------------------------------|-------------------------------------------------------------------------|
| 1 | "coming soon · 04.25.2026" poster · chromatic motion-blur               | RGB-split + shutter-blur hero with a small dateline bottom-right                    | trailer scene 0 intro · /friday teaser · pre-auction splash             |
| 2 | vagabond-climbing panel-built zip jacket · rust / olive / cream / brown | earth-tone widen — rust accent paired with an olive / tan secondary                 | /positions palette · art-portfolio section · apparatus cards            |
| 3 | kitxhe_/orbstudio.co photoshoot · motion-blurred                        | "shutter too slow, on purpose" — single blurred hero frame                          | trailer scene 1 · auction announcement · art-portfolio lead             |
| 4 | lauryn hill magazine cover via pinterest in imessage                    | cut-paper zine with hand-lettered captions + pinterest-style provenance             | hunt overlay · let-down hero · apparatus thumbnails                     |
| 5 | hand-drawn crayon + watercolor portrait                                 | scanned paper texture, confident unfinished lines                                   | art-portfolio section · /let-down epigraph mark · sealed-prediction seal|
| 6 | arc browser · "radically different" splash                              | single ornamental motif on a soft dark gradient · one-shot, once per session        | /let-down hero · /6969 outro · a first-load screen per new visit        |

**Tone anchor:** when in doubt, paper > glass. Physical textures over
backdrop-blur. One motif per plate.

---

## sentiment + tone references (filed for voice, not layout)

- **Bernie Sanders — "If you paid $1 in federal income taxes this year,
  you paid more than [Walt Disney, Citigroup, CVS, Tesla, PayPal,
  Palantir, Roku, HP, 3M, PG&E, Halliburton]."** Tone: counter-culture
  populist indictment. Good pairing with green-credit's "attention
  rewarded with better reasoning" pitch. Do not quote directly; echo
  the energy.
- **Kendrick / Cole "a lot" — 21 Savage ft. J. Cole (2018).** Trailer
  hook. Frame: "how much money you got?" → "a lot" is the honesty of
  saying the number before posturing.
- **"Just Like Me" — Metro Boomin + Future (2022).** Trailer punchline
  beat. The drop is the reveal of "fucking beautiful."
- **"Nuevayol" — Bad Bunny (2025).** Auction scene music.
- **"Ghost Town" — Kanye West (2018).** `/arc` opener — ghost-town →
  let-down descent.
- **"Let Down" — Radiohead (1997).** The anchor song for `/let-down`.
  The whole site is a derivative of the feeling this song names.
- **"I Took A Pill In Ibiza" — Mike Posner (2015).** Pre-mortem
  register. Filed alongside /let-down. Added to the home verdict as
  the "pre-mortem" row on apr 22 2026.
- **Ted Lasso.** "Be a goldfish." "Believe." "Barbecue sauce." Used as
  epigraphs on the Kalshi + Waymo payout cards + powers the "believe"
  (lasso) egg in the hunt.
- **Tyler, the Creator — "Call Me If You Get Lost" (2021).** The
  numeric-wrong-routes egg (`/67`, `/420`, `/6767`, `/6769`,
  `/677777`) dials this album's title literally — the reward CTA is a
  `tel:` link.
- **Paul Graham.** Cited in agent mandates (Bull quotes "Frighteningly
  Ambitious Startup Ideas", Macro quotes "Cities and Ambition").

---

## historical choices to reconcile (unresolved)

1. **$1,296 → $4,825 savings arc** (jan 2025 → 31 jan 2026). The
   positions hero v2 demoted this into a collapsed `<details>`. If this
   is part of the brand story, it belongs on its own beat at `/6969` or
   `/let-down` rather than a fold-out.
2. **Kanye + Wesley Wang page** — saapai recalls a prior home-like page
   with a Kanye video at the bottom and a Wesley Wang video at the top.
   Likely an earlier variant of the launch home or a `/arc` predecessor.
   Git log candidates: `launch home: yt-framed chapters + hook panel
   verdict` (c7806a8), `merge main into launch-home branch` (35c9f6f).
   Revival pass: diff those commits against current `/arc`, either
   restore or mount a minimal "then and now" surface.
3. **Sealed prediction sp-001 forfeit.** See `docs/SEALED_PREDICTIONS.md`
   for the runbook. sp-002 onward uses stricter plaintext discipline.
4. **"v0 had 550 views by day 4"** — the view-count estimate floor in
   `/api/views` is anchored on this report. If the real datapoint was
   different, update `PUBLISH_ISO` and the decay constants in
   `src/app/api/views/route.ts` rather than hand-tweaking outputs.

---

## ongoing feature bank (queued, not built)

- **Mobile old-TV frame variant** — current frame is desktop-only at
  `≥1024px`. A slimmer, ~24px-border mobile variant could work if
  visual weight is kept below ~6% of viewport.
- **Per-agent daily briefs** — currently the panel produces a single
  consolidated brief. Future: each of Bull/Bear/Macro/Flow/Historian
  writes its own daily log.
- **External-investment onboarding UI** — the Kalshi/Waymo overlays
  both mention "negotiated via text" for investments beyond the
  promotion cap. A proper form (with a phone field + SHA seal + a
  non-binding "interest" button) could replace the text-only path.
- **Art portfolio** — referenced in the Ted Lasso egg overlay + the
  book-composition caption. Surface not opened yet.
- **Bernie-esque "who paid less than $1" line** on `/green-credit` as
  pre-mortem preface. Apr 22 pending.

---

## invariants (do not ship work that breaks these)

- Masthead: Cormorant Garamond italic wordmark, rust dot, monospace
  eyebrows. Change these only deliberately.
- Paper-first: `--paper` (#F4EFE6) is the default background. Dark
  scenes are intentional beats, not decoration.
- Text on cream uses `--ink` (#1C1A17), not pure black. The rust
  accent is `--rust` (#8B3A2E). The cyan accent is `--zine-cyan`
  (#0B6E84). The yellow/amber accent is `--zine-yellow` (#F2C24B).
- The trailer has three resting-state scene-background colors: cyan
  (scenes 0/1), paper (scenes 2/3/4), dark (5/6). Transitions crossfade
  720ms on a `cubic-bezier(0.4, 0, 0.2, 1)` curve — never snap.
- `/6969` is the wayfinder / credits hub. Everything hidden points
  back here.
- The hunt persists per-browser via `localStorage`. `window.__hunt`
  exposes `{found, fire, all}` for testing.

Last updated: apr 22 2026.
