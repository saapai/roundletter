Audio placeholders for the Ghost Town → Let Down arc.

Drop these files here (same filenames) to wire in real audio:

  ghost-town.mp3   — plays during the overture (beat-drop intro)
  let-down.mp3     — plays ambiently when the Let Down section scrolls into view

Both tracks start muted on page load (browser autoplay policy). A small sound
toggle lets the user unmute. If a file is missing, the <audio> element fails
silently — the visual arc still plays.

Rights note: don't commit copyrighted masters to the repo. These files are
.gitignored via the site's existing ignore rules, or you can host them
externally and swap the src paths in:

  src/components/ArcOverture.tsx       (ghost-town.mp3)
  src/components/ArcAmbientAudio.tsx   (let-down.mp3)
