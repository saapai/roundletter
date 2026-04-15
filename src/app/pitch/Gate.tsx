import { verifyPitchPassword } from "./actions";

export default function PitchGate({ err }: { err: boolean }) {
  return (
    <article className="article">
      <div className="eyebrow">pitch · invitation only</div>
      <h1 style={{ textAlign: "center" }}>a door, for a friend</h1>
      <p className="deck">
        This one is a pitch, not a letter. If you know the password,
        you were invited. If you don't — the hint is that the name
        ends in <em>-ish</em>.
      </p>
      <form action={verifyPitchPassword} className="gate-form">
        <input
          name="password"
          type="password"
          placeholder="name. lowercase. one word."
          autoComplete="off"
          autoFocus
          className="gate-input"
        />
        <button type="submit" className="gate-submit">enter</button>
      </form>
      {err && <p className="gate-err">not it. try the other spelling.</p>}
    </article>
  );
}
