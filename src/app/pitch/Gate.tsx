import { verifyPitchPassword } from "./actions";

const MESSAGES: Record<string, { head: string; sub?: string }> = {
  cold:      { head: "not even close.", sub: "the password is a name. two syllables, concatenated." },
  warm:      { head: "warmer, but no." },
  close:     { head: "one letter off. look again." },
  typo:      { head: "you have both halves. the spelling is wrong." },
  half:      { head: "half of it. there's another half." },
  wrongdoor: { head: "wrong door.", sub: "that password opens a different room on this site." },
  empty:     { head: "the box is empty." },
};

export default function PitchGate({
  err,
  attempt,
}: {
  err?: string;
  attempt?: string;
}) {
  const msg = err && MESSAGES[err] ? MESSAGES[err] : null;
  return (
    <article className="article">
      <div className="eyebrow">pitch · invitation only</div>
      <h1 style={{ textAlign: "center" }}>a door, for a friend</h1>
      <p className="deck">
        This one is a pitch, not a letter. If you know the password, you were
        invited. The password is a name &mdash; two names really, concatenated, lowercase.
      </p>
      <form action={verifyPitchPassword} className="gate-form" key={attempt ?? "0"}>
        <input
          name="password"
          type="password"
          placeholder="name. lowercase. one word."
          autoComplete="off"
          autoFocus
          defaultValue=""
          className="gate-input"
        />
        <button type="submit" className="gate-submit">enter</button>
      </form>
      {msg && (
        <div className="gate-err-block" key={`e-${err}-${attempt ?? "0"}`}>
          <p className="gate-err">{msg.head}</p>
          {msg.sub && <p className="gate-err-sub">{msg.sub}</p>}
        </div>
      )}
    </article>
  );
}
