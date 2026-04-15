import { verifyMedicinePassword } from "./actions";

const CLUES: { text: string; kind: "true" | "herring" | "cryptic" | "pitch" }[] = [
  // TRUE fragmentary clues — together they spell out "medicine"
  { text: "prefix · 3 letters · what every pre-med is already claiming to be", kind: "true" },
  { text: "middle · two of the same letter · the pronoun you always capitalize", kind: "true" },
  { text: "suffix · 4 letters · cinema, without the 'ma'", kind: "true" },
  { text: "length · 8 · if you counted wrong, count the i's", kind: "true" },
  { text: "rhyme · vaccine, obscene, ravine — all inside", kind: "true" },

  // PITCH references — for anyone who's read /pitch
  { text: "slide nine, the final line: \"the method is the ___\"", kind: "pitch" },
  { text: "the thing you take when you don't want to call it the thing", kind: "pitch" },

  // CRYPTIC — half-literal, half-playful
  { text: "first three letters of medical school's ambition", kind: "cryptic" },
  { text: "the cabinet in every bathroom, under various real names", kind: "cryptic" },
  { text: "the english for a Sanskrit 'औषध'", kind: "cryptic" },

  // RED HERRINGS — close but wrong
  { text: "(not: cure · remedy · tonic · balm · dose · pill · rx · pharma)", kind: "herring" },
  { text: "(not: drugs · heal · therapy · salve · capsule)", kind: "herring" },
  { text: "(not: fifty shades of anything)", kind: "herring" },
  { text: "it is not the brand name · it is not the chemical · it is what you call all of it at dinner", kind: "cryptic" },

  // Ambiguous / atmospheric
  { text: "m + e + d · · · · · · · i + c + i + n + e", kind: "cryptic" },
  { text: "half the word is the letter i, twice", kind: "true" },
  { text: "doctors write it in cursive so no one can brute-force their handwriting", kind: "cryptic" },
];

export default function MedicineGate({ err }: { err: boolean }) {
  return (
    <article className="article">
      <div className="eyebrow">closed · behind another door · the cabinet</div>
      <h1 style={{ textAlign: "center" }}>the cabinet</h1>
      <p className="deck">
        A second door, inside the locked room. The password is <em>one word, lowercase, eight letters.</em>
        Some of what follows is true. Some of it is a red herring. Some of it is the password, said sideways.
      </p>

      <form action={verifyMedicinePassword} className="gate-form">
        <input
          name="password"
          type="password"
          placeholder="one word. lowercase. you already know."
          autoComplete="off"
          autoFocus
          className="gate-input"
        />
        <button type="submit" className="gate-submit">enter</button>
      </form>

      {err && <p className="gate-err">not it. the word is under your tongue.</p>}

      <section className="clue-field">
        <div className="clue-heading">clues · in no particular order</div>
        <div className="clue-grid">
          {CLUES.map((c, i) => (
            <div key={i} className={`clue clue-${c.kind}`}>
              <span className="clue-dot" aria-hidden />
              <span className="clue-body">{c.text}</span>
            </div>
          ))}
        </div>
        <p className="clue-footer">
          three of these are the word in three pieces. seven are decoys. five are the word, in different languages.
          exactly one of those numbers is also a lie.
        </p>
      </section>
    </article>
  );
}
