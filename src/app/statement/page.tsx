import type { Metadata } from "next";
import s from "./statement.module.css";

export const metadata: Metadata = {
  title: "A personal statement, by panel — saathvikpai",
  description:
    "One voice, then two, then four, then sixteen. A moderator arrives at two, breaks at sixteen. The disagreement is the statement.",
  openGraph: {
    title: "A personal statement, by panel",
    description:
      "Convened a panel on myself. They could not agree. I published the disagreement.",
    type: "article",
  },
};

type Line = { who: string; text: string; mod?: boolean };

const round1: Line[] = [
  {
    who: "Agent 1",
    text: "He is nineteen. He has $3,453.83 and a birthday on 6/21. He publishes the pre-mortem before he fails.",
  },
];

const round2: Line[] = [
  { who: "Agent 1", text: "He is a boy keeping score." },
  { who: "Agent 2", text: "He is a boy keeping a receipt." },
  {
    who: "Moderator",
    text: "Score and receipt are different verbs. The panel is now a panel. We continue.",
    mod: true,
  },
];

const round3: Line[] = [
  {
    who: "Agent 1",
    text: "He judges debate the way pharaohs judged oracles — tech over truth, less intervention. That is a spine.",
  },
  {
    who: "Agent 2",
    text: "He judges debate the way tourists photograph monuments — present, uninvolved, archival. That is a style.",
  },
  { who: "Agent 3", text: "He thinks 3,453 is a cipher for 17. That is a superstition, which is a spine." },
  { who: "Agent 4", text: "He likes the number 17. That is a taste, which is a style." },
  {
    who: "Moderator",
    text: "Two say spine. Two say style. A tie, this early, is the first real evidence. We continue.",
    mod: true,
  },
];

const round4: Line[] = [
  { who: "Agent 1", text: "Spine — the portfolio is real money." },
  { who: "Agent 2", text: "Style — the portfolio is published." },
  { who: "Agent 3", text: "Spine — Roosevelt's arena, Iverson's practice, Gil Scott-Heron going upstream." },
  { who: "Agent 4", text: "Style — every boy who quotes Roosevelt is in the arena by implication, which is to say, not." },
  { who: "Agent 5", text: "Spine — the EEAO bagel. The nothing is chosen on purpose." },
  { who: "Agent 6", text: "Style — 7000 RPM is a line from a movie." },
  { who: "Agent 7", text: "Spine — he runs toward the loss." },
  { who: "Agent 8", text: "Style — he runs toward the audience." },
  {
    who: "Moderator",
    text: "Four and four. I no longer trust the question. I continue because I was built to.",
    mod: true,
  },
];

const round5: Line[] = [
  { who: "A1", text: "Pharaoh." },
  { who: "A2", text: "Pimp." },
  { who: "A3", text: "Judge." },
  { who: "A4", text: "Defendant." },
  { who: "A5", text: "Author." },
  { who: "A6", text: "Character." },
  { who: "A7", text: "Architect." },
  { who: "A8", text: "Tourist." },
  { who: "A9", text: "The one who builds the arena." },
  { who: "A10", text: "The one who quotes the arena." },
  { who: "A11", text: "His father's son." },
  { who: "A12", text: "Not his father's son." },
  { who: "A13", text: "He is nineteen." },
  { who: "A14", text: "He is older than that." },
  { who: "A15", text: "He is younger than that." },
  { who: "A16", text: "He is —" },
];

function LineRow({ line }: { line: Line }) {
  return (
    <span className={line.mod ? s.modLine : s.line}>
      <span className={`${s.agent} ${line.mod ? s.mod : ""}`}>{line.who}.</span>
      {line.text}
    </span>
  );
}

function Round({
  numeral,
  label,
  children,
}: {
  numeral: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className={s.round}>
      <div className={s.roundHead}>
        <span className={s.numeral}>{numeral}</span>
        <span className={s.label}>{label}</span>
        <span className={s.hairline} />
      </div>
      {children}
    </section>
  );
}

export default function Statement() {
  return (
    <div className={s.root}>
      <div className={s.wrap}>
        <div className={s.eyebrow}>saathvikpai · a personal statement, by panel</div>
        <h1 className={s.title}>I convened a panel on myself.</h1>
        <p className={s.deck}>
          They could not agree. I published the disagreement. The disagreement is the statement.
        </p>

        <Round numeral="I" label="one voice">
          {round1.map((l, i) => (
            <LineRow key={i} line={l} />
          ))}
        </Round>

        <Round numeral="II" label="two voices · the moderator arrives">
          {round2.map((l, i) => (
            <LineRow key={i} line={l} />
          ))}
        </Round>

        <Round numeral="III" label="four voices">
          {round3.map((l, i) => (
            <LineRow key={i} line={l} />
          ))}
        </Round>

        <Round numeral="IV" label="eight voices · the register drops">
          {round4.map((l, i) => (
            <LineRow key={i} line={l} />
          ))}
        </Round>

        <Round numeral="V" label="sixteen voices">
          <div className={s.cacophony}>
            {round5.map((l, i) => (
              <LineRow key={i} line={l} />
            ))}
          </div>
          <div className={s.break}>Moderator. Enough.</div>
          <div className={s.break}>The argument is pointless.</div>
          <div className={s.break}>That is the point.</div>
        </Round>

        <section className={s.coda}>
          <div className={s.eyebrow} style={{ marginBottom: "1.5rem" }}>
            coda · one voice
          </div>
          <p className={s.codaLine}>
            I convened the panel knowing the panel could not agree.
          </p>
          <p className={s.codaLine}>I held the room for five rounds to prove it.</p>
          <p className={s.codaShort}>I am nineteen.</p>
          <p className={s.codaShort}>I have $3,453.83 and no job.</p>
          <p className={s.codaShort}>I keep the receipt.</p>
          <div className={s.codaKicker}>— saathvikpai</div>
        </section>

        <div className={s.colophon}>
          method borrowed from{" "}
          <a href="https://aureliex.com/about-the-method" rel="noopener">
            aureliex.com/about-the-method
          </a>
        </div>
      </div>
    </div>
  );
}
