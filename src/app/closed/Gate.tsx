import { verifyPassword } from "./actions";

export default function Gate({ err }: { err: boolean }) {
  return (
    <article className="article">
      <div className="eyebrow">closed · password required</div>
      <h1 style={{ textAlign: "center" }}>the locked room</h1>
      <p className="deck">
        One of the letters on this site is not public. If you know the password,
        you are probably a close friend. If you're guessing, the hint is in v1.
      </p>
      <form action={verifyPassword} className="gate-form">
        <input
          name="password"
          type="password"
          placeholder="password"
          autoComplete="off"
          autoFocus
          className="gate-input"
        />
        <button type="submit" className="gate-submit">enter</button>
      </form>
      {err && <p className="gate-err">that's not it. try another one.</p>}
    </article>
  );
}
