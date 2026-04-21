Audio placeholders for the aureliex launch.

Drop real mp3s here (same filenames) to wire in audio. The <audio> elements
silent-fail when a file is missing — the visual site still works.

Home (/) hook — chapter 01 — Magnolia → Jimmy Cooks switch-up:
  magnolia.mp3       — plays on phase A of the hook (Playboi Carti, 2017)
  jimmy-cooks.mp3    — plays on phase B after the switch (Drake + 21 Savage, 2022)

Auction (chapter 04) soundtrack credit only — not played inline:
  nuevayol.mp3       — reserved for the Ovation Hollywood event (Bad Bunny, 2025)

/arc (the cinematic descent):
  ghost-town.mp3     — plays during the /arc overture (Kanye West, 2018)
  let-down.mp3       — plays when the Let Down section scrolls into view (Radiohead, 1997)

All hooks start muted (browser autoplay policy). A "♪ on / off" toggle lets
the visitor unmute; localStorage remembers the choice per track.

Rights note: do not commit copyrighted masters to the repo. Host externally
and swap the src paths if you want to ship this publicly.

Component wiring:
  src/components/HookOverture.tsx      → magnolia.mp3, jimmy-cooks.mp3
  src/components/ArcOverture.tsx       → ghost-town.mp3
  src/components/ArcAmbientAudio.tsx   → any src via prop (used for let-down.mp3 on /arc)

Panel verdict (src/data/hook-debate.json) kept the debate on record:
  hook      = magnolia → jimmy cooks
  runner-up = sprinter (central cee + dave)
  auction   = nuevayol
  for later = ghost town, let down
  retired   = sicko mode
