"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════
   ARTICLE — "Alcohol"

   Magazine-editorial article page.
   Click "aureliex." to toggle edit mode.
   ═══════════════════════════════════════════════════════ */

type Section = {
  id: string;
  title: string;
  content: string;
};

const INITIAL_SECTIONS: Section[] = [
  {
    id: "alcohol",
    title: "Alcohol",
    content: `I think most people are aware that alcohol is really bad for you, yet it\u2019s so normalized that people don\u2019t mind that cost to have fun at a party.


This isn\u2019t a criticism of that mindset, but it\u2019s to establish the premise that this exists pretty much everywhere; someone with high cholesterol eats red meat regularly because they\u2019d rather live a shorter life in which they enjoyed what they ate.


In the specific case of alcohol, it\u2019s been proven time and again that no amount of alcohol is good for you and there\u2019s no medical use case for it. In the image above you can see alcohol\u2019s harm level is on par with some of the worst drugs (crack, meth, heroin).`,
  },
  {
    id: "drugs-i-like",
    title: "The Drugs I Like",
    content: `So it confuses me when people are taken aback with my embracement of psychoactive substances (weed, shrooms, LSD).


I\u2019ve found that these substances can often by profoundly helpful with creative lines of thought and introspection. From the above example, the negative harm of these substances to me are the equivalent of what most people would see in drinking at a party.


Now, shrooms and especially LSD have this huge stigmatization (which seems to be reducing now). They\u2019re the \u201ccrazy\u201d drug that can do \u201ccrazy\u201d things to you. And yes, admittedly people with certain predispositions such as schizophrenia or PTSD have a risk of psychosis (basically losing contact with reality), but I view this risk as an extension of the alcohol/party example.


I\u2019m basically willing to take the negatives of psychedelics because of the profound creativity and flow it uncovers for sober me.


A not too uncommon result of drinking can be alcohol poisoning (getting hospitalized or your stomach pumped) or even death/killing others (drunk driving), but not too many people hold that against the act of drinking.


Why? Because if you\u2019re not stupid when you drink most of those things never happen. A more apt analogy could also be people not drinking when they\u2019re on medication. So I view taking psychedelics the same way. You should be a little responsible with the conditions/history that you have and be responsible with the dosage/environment to avoid the negatives.


Well what about someone taking shrooms and jumping off a building because they suddenly thought they could fly? If u take shrooms on top of a building, natural selection.


However, most of these negatives are actually a really small edge case and in reality the average person actually has nothing to worry about when taking psychedelics. There is no physiological harm that mushrooms or LSD do to your body, and in fact no known cases of overdoses or deaths resulting from the substance being in your body.


Also, shrooms don\u2019t affect any dopamine receptors so you cannot get chemically addicted to it, and LSD has an addiction rate of about 0.1% (for reference weed is about 10%, alcohol is 20%, and heroin is 25%).


Now, the positive stories of psychedelics are far more interesting.


My friend\u2019s dad had brain damage when he was younger and started to have tremors later in his life and was diagnosed with early onset Parkinson\u2019s and then entered a shrooms trial and all the tremors went away.


I know of many cases of people whose alcohol, tobacco, and other drug addictions were cured. People whose depression gets cured.


The far more interesting cases (to me) of beautiful music (the Beatles, Pink Floyd, A$AP Rocky, Tame Impala), literature (Aldous Huxley, Terrence Mckenna), and creations (Steve Jobs and Apple), which in my opinion had an immense ripple effect on the rest of the world just by being at the creative frontier.


All of these psychedelics were criminalized in the 60s-70s because the government was worried they couldn\u2019t control the new wave of so called \u201chippies\u201d who just did what they wanted, which in it of itself should be a reason they are good. Because the reason the government was afraid of the substance was that people stopped fighting, stopped going to jobs they realized they hated, and stopped listening to authority they realized they didn\u2019t need.


This is not an endorsement of shrooms or LSD as the magic drug that solves all, because I think a lot of the creative benefits come from some type of alignment with it, because I know plenty of people for whom it\u2019s just fun, but I think the world would be a better place if everyone tripped, and there\u2019s few things that deserve the same sentiment.`,
  },
  {
    id: "also",
    title: "Also",
    content: `I think my entire argument for psychedelics is reasonable even if alcohol and psychedelics were identical in their harm, but interestingly enough, they\u2019re not. So here\u2019s the full image from the beginning.`,
  },
];

function useLocalSections(key: string, fallback: Section[]) {
  const [sections, setSections] = useState<Section[]>(fallback);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as Section[];
        if (Array.isArray(parsed) && parsed.length === fallback.length) {
          setSections(parsed);
        }
      }
    } catch { /* noop */ }
    loaded.current = true;
  }, [key, fallback]);

  const update = useCallback(
    (fn: (prev: Section[]) => Section[]) => {
      setSections((prev) => {
        const next = fn(prev);
        try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* noop */ }
        return next;
      });
    },
    [key],
  );

  return [sections, update] as const;
}

export default function ArticlePage() {
  const [editing, setEditing] = useState(false);
  const [sections, updateSections] = useLocalSections("ax-article-sections", INITIAL_SECTIONS);
  const editableRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sectionsRef = useRef(sections);
  sectionsRef.current = sections;

  /* populate contentEditable divs when entering edit mode */
  useEffect(() => {
    if (!editing) return;
    for (const s of sectionsRef.current) {
      const el = editableRefs.current[s.id];
      if (el) el.innerText = s.content;
    }
  }, [editing]);

  const toggleEdit = useCallback(() => {
    setEditing((prev) => {
      if (prev) {
        /* leaving edit mode — flush all contentEditable text to state */
        updateSections((old) =>
          old.map((s) => {
            const el = editableRefs.current[s.id];
            return el ? { ...s, content: el.innerText || "" } : s;
          }),
        );
      }
      return !prev;
    });
  }, [updateSections]);

  return (
    <div className="ax-article" data-editing={editing || undefined}>
      <style>{CSS}</style>

      {/* ── MASTHEAD TITLE (click to toggle edit) ── */}
      <header className="ax-mast">
        <button className="ax-brand" onClick={toggleEdit} title={editing ? "Exit edit mode" : "Enter edit mode"}>
          aureliex<span className="ax-dot">.</span>
        </button>
        {editing && <span className="ax-mode-badge">editing</span>}
      </header>

      {/* ── HERO IMAGE — cropped to top half (Alcohol) ── */}
      <figure className="ax-hero">
        <div className="ax-hero-crop">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/harm-chart.gif"
            alt="Harm caused by drugs — The Lancet, David Nutt et al. Cropped to Alcohol."
            className="ax-hero-img"
          />
        </div>
      </figure>

      {/* ── ARTICLE BODY ── */}
      <article className="ax-body">
        {sections.map((section, idx) => (
          <section key={section.id} className="ax-section">
            <h2 className="ax-h2">
              <span className="ax-h2-num">{String(idx + 1).padStart(2, "0")}</span>
              {section.title}
            </h2>
            <div className="ax-rule" />
            {editing ? (
              <div
                ref={(el) => { editableRefs.current[section.id] = el; }}
                className="ax-editable"
                contentEditable
                suppressContentEditableWarning
                data-placeholder="Start writing..."
              />
            ) : (
              <div className="ax-prose">
                {section.content ? (
                  section.content.split("\n").map((line, i) => (
                    <p key={i} className={line.trim() === "" ? "ax-blank" : undefined}>
                      {line || "\u00A0"}
                    </p>
                  ))
                ) : (
                  <p className="ax-empty">&nbsp;</p>
                )}
              </div>
            )}
          </section>
        ))}
      </article>

      {/* ── FULL IMAGE AT BOTTOM ── */}
      <figure className="ax-full-image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/harm-chart.gif"
          alt="Harm caused by drugs — full chart. Source: The Lancet, David Nutt et al."
          className="ax-full-img"
        />
        <figcaption className="ax-caption">
          Source: &ldquo;Drug harms in the UK,&rdquo; by David Nutt et al. <em>The Lancet</em>
        </figcaption>
      </figure>

      {/* ── COLOPHON ── */}
      <footer className="ax-colophon">
        <div className="ax-col-rule" />
        <span className="ax-col-mark">aureliex.</span>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════ */
const CSS = `
/* ── TOKENS ── */
.ax-article {
  --paper:       #F4EFE6;
  --ink:         #1C1A17;
  --graphite:    #6B6560;
  --rust:        #8B3A2E;
  --parchment:   #EDE5D5;
  --accent-cyan: #1ba4c4;
  --accent-navy: #1a3a5c;
  --rule-color:  rgba(28,26,23,0.18);
  --hero-overlay: linear-gradient(
    to bottom,
    rgba(244,239,230,0) 0%,
    rgba(244,239,230,0.03) 60%,
    rgba(244,239,230,1) 97%
  );

  min-height: 100vh;
  background: var(--paper);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  font-feature-settings: "liga" 1, "kern" 1;
  overflow-x: hidden;
  word-break: break-word;
  -webkit-text-size-adjust: 100%;
}

/* ── MASTHEAD ── */
.ax-mast {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: clamp(1rem, 2.5vw, 1.6rem) clamp(1.25rem, 4vw, 2rem);
  background: rgba(244, 239, 230, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.ax-brand {
  all: unset;
  cursor: pointer;
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-style: italic;
  font-weight: 500;
  font-size: clamp(1.4rem, 1rem + 1.5vw, 2rem);
  letter-spacing: 0.04em;
  color: var(--ink);
  transition: color 0.3s ease, transform 0.3s ease;
  user-select: none;
}
.ax-brand:hover {
  color: var(--rust);
  transform: scale(1.02);
}
.ax-dot {
  color: var(--rust);
}
.ax-mode-badge {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 9px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--rust);
  border: 1px solid rgba(139, 58, 46, 0.3);
  padding: 3px 10px;
  border-radius: 2px;
  animation: ax-badge-in 0.4s ease both;
}
@keyframes ax-badge-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── HERO (cropped top half) ── */
.ax-hero {
  margin: 0;
  padding: 0 clamp(1.25rem, 4vw, 3rem);
  max-width: 52rem;
  margin: 0 auto;
}
.ax-hero-crop {
  position: relative;
  width: 100%;
  height: clamp(140px, 28vw, 260px);
  overflow: hidden;
  border-radius: 3px;
  box-shadow:
    0 2px 20px rgba(28, 26, 23, 0.08),
    0 0 0 1px rgba(28, 26, 23, 0.06);
}
.ax-hero-crop::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--hero-overlay);
  pointer-events: none;
}
.ax-hero-img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
  object-position: top left;
  transform: scale(1.02);
  transition: transform 8s ease;
}
.ax-hero:hover .ax-hero-img {
  transform: scale(1.0);
}

/* ── ARTICLE BODY ── */
.ax-body {
  max-width: 44rem;
  margin: 0 auto;
  padding: clamp(2rem, 5vw, 4rem) clamp(1.25rem, 4vw, 2rem);
}

/* ── SECTIONS ── */
.ax-section {
  margin-bottom: clamp(3rem, 6vw, 5rem);
}
.ax-section:last-child {
  margin-bottom: clamp(2rem, 4vw, 3rem);
}

.ax-h2 {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-style: italic;
  font-weight: 500;
  font-size: clamp(2rem, 1.5rem + 2.5vw, 3.4rem);
  line-height: 1.12;
  letter-spacing: -0.015em;
  color: var(--ink);
  margin: 0 0 0.6rem;
  position: relative;
}
.ax-h2-num {
  display: block;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-style: normal;
  font-weight: 400;
  font-size: 10px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--accent-cyan);
  margin-bottom: 8px;
  opacity: 0.7;
}

.ax-rule {
  width: 48px;
  height: 2.5px;
  background: linear-gradient(90deg, var(--accent-cyan), var(--accent-navy));
  border-radius: 2px;
  margin-bottom: clamp(1.2rem, 2.5vw, 2rem);
  opacity: 0.6;
}

/* ── PROSE (read mode) ── */
.ax-prose {
  font-family: var(--font-body, 'EB Garamond'), Georgia, serif;
  font-size: clamp(1.05rem, 0.95rem + 0.4vw, 1.2rem);
  line-height: 1.82;
  color: var(--ink);
}
.ax-prose p {
  margin: 0 0 0.1em;
}
.ax-prose .ax-blank {
  height: 1.82em;
}
.ax-empty {
  min-height: 2em;
}

/* ── EDITABLE (edit mode) ── */
.ax-editable {
  font-family: var(--font-body, 'EB Garamond'), Georgia, serif;
  font-size: clamp(1.05rem, 0.95rem + 0.4vw, 1.2rem);
  line-height: 1.82;
  color: var(--ink);
  outline: none;
  min-height: 4em;
  padding: 1rem 1.25rem;
  border-radius: 3px;
  background: rgba(237, 229, 213, 0.5);
  border: 1.5px solid transparent;
  transition: border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
  cursor: text;
  white-space: pre-wrap;
  word-wrap: break-word;
}
.ax-editable:focus {
  border-color: rgba(27, 164, 196, 0.35);
  background: rgba(237, 229, 213, 0.75);
  box-shadow: 0 0 0 3px rgba(27, 164, 196, 0.08);
}
.ax-editable:empty::before {
  content: attr(data-placeholder);
  color: var(--graphite);
  opacity: 0.5;
  font-style: italic;
  pointer-events: none;
}

/* Edit mode subtle indicator */
.ax-article[data-editing] .ax-section {
  position: relative;
}
.ax-article[data-editing] .ax-h2::after {
  content: '';
  position: absolute;
  left: -16px;
  top: 50%;
  width: 3px;
  height: 60%;
  transform: translateY(-50%);
  background: var(--accent-cyan);
  border-radius: 2px;
  opacity: 0.3;
}

/* ── FULL IMAGE ── */
.ax-full-image {
  margin: 0;
  padding: clamp(1rem, 3vw, 2rem) clamp(1.25rem, 4vw, 3rem) clamp(2rem, 4vw, 3rem);
  max-width: 52rem;
  margin: 0 auto;
}
.ax-full-img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 3px;
  box-shadow:
    0 4px 30px rgba(28, 26, 23, 0.1),
    0 0 0 1px rgba(28, 26, 23, 0.06);
  transition: transform 0.6s ease, box-shadow 0.6s ease;
}
.ax-full-img:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 40px rgba(28, 26, 23, 0.14),
    0 0 0 1px rgba(28, 26, 23, 0.08);
}
.ax-caption {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.6rem;
  letter-spacing: 0.06em;
  color: var(--graphite);
  margin-top: 12px;
  text-align: right;
  opacity: 0.6;
}
.ax-caption em {
  font-style: italic;
}

/* ── COLOPHON ── */
.ax-colophon {
  max-width: 44rem;
  margin: 0 auto;
  padding: clamp(2rem, 4vw, 4rem) clamp(1.25rem, 4vw, 2rem) clamp(3rem, 6vw, 5rem);
  text-align: center;
}
.ax-col-rule {
  width: 100%;
  height: 1px;
  background: var(--rule-color);
  margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
}
.ax-col-mark {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-style: italic;
  font-weight: 400;
  font-size: 1rem;
  letter-spacing: 0.12em;
  color: var(--graphite);
  opacity: 0.4;
}

/* ── RESPONSIVE ── */
@media (max-width: 640px) {
  .ax-article {
    overflow-x: hidden;
  }
  .ax-hero {
    padding: 0 1rem;
  }
  .ax-hero-crop {
    height: clamp(100px, 32vw, 180px);
  }
  .ax-body {
    padding: 1.5rem 1rem;
  }
  .ax-h2 {
    font-size: clamp(1.6rem, 1.2rem + 3vw, 2.4rem);
  }
  .ax-prose {
    font-size: 1rem;
    line-height: 1.75;
    overflow-wrap: break-word;
  }
  .ax-prose p {
    margin: 0 0 0.15em;
  }
  .ax-article[data-editing] .ax-h2::after {
    left: -10px;
  }
  .ax-editable {
    padding: 0.8rem 1rem;
    font-size: 1rem;
  }
  .ax-full-image {
    padding: 1rem 1rem 2rem;
  }
  .ax-colophon {
    padding: 2rem 1rem 3rem;
  }
}

/* ── REDUCED MOTION ── */
@media (prefers-reduced-motion: reduce) {
  .ax-hero-img { transition: none; transform: none; }
  .ax-full-img { transition: none; }
  .ax-mode-badge { animation: none; }
}
`;
