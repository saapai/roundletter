import { logoutPitch } from "./actions";

export default function Deck() {
  return (
    <main className="pitch-root">
      <PitchModeBody />
      <div className="pitch-deck">

        {/* 01 — Title */}
        <section className="pitch-slide" id="s1">
          <span className="pitch-page">01 / 09</span>
          <h1 className="pitch-title">a quiet case.</h1>
          <div className="pitch-rule" />
          <p className="pitch-sub">// built mostly from git history.</p>
          <p className="pitch-meta">sep · spring 2026 · saapai</p>
        </section>

        {/* 02 — Thesis */}
        <section className="pitch-slide" id="s2">
          <span className="pitch-page">02 / 09</span>
          <p className="pitch-eyebrow"># thesis</p>
          <h2 className="pitch-h2">sep is the frat where smart ucla students build real things.</h2>
          <div className="pitch-rule pitch-rule-muted" />
          <p className="pitch-line muted">we are strong on the first half of that sentence.</p>
          <p className="pitch-line accent">this pitch is about the second half.</p>
        </section>

        {/* 03 — Receipts */}
        <section className="pitch-slide" id="s3">
          <span className="pitch-page">03 / 09</span>
          <p className="pitch-eyebrow"># receipts / three rush cycles</p>
          <h2 className="pitch-h2 small">what i have built for us, quietly.</h2>
          <table className="pitch-table">
            <thead>
              <tr><th>repo</th><th>when</th><th>commits</th><th>what</th></tr>
            </thead>
            <tbody>
              <tr><td>rush-react</td><td>fall 2024 → fall 2025</td><td className="accent">45</td><td>rush notes + elo, live across 3 rushes</td></tr>
              <tr><td>sep-ats-checkin</td><td>fall 2025 rush week</td><td className="accent">28</td><td>photo check-in, live during rush</td></tr>
              <tr><td>sep-ats</td><td>spring 2026 rush</td><td className="accent">55</td><td>gpt-tagged notes + imessage bot (friday)</td></tr>
            </tbody>
          </table>
          <div className="pitch-rule pitch-rule-muted" />
          <p className="pitch-line">résumés lie. commit counts don't.</p>
          <p className="pitch-comment accent">// ball don't lie.</p>
        </section>

        {/* 04 — Punchline */}
        <section className="pitch-slide" id="s4">
          <span className="pitch-page">04 / 09</span>
          <p className="pitch-hero muted">these are not three things.</p>
          <p className="pitch-hero">they are one thing —</p>
          <p className="pitch-hero accent">sep's infrastructure.</p>
          <div className="pitch-rule pitch-rule-muted" />
          <p className="pitch-comment">built by one person, quietly, across three rushes.</p>
        </section>

        {/* 05 — Range */}
        <section className="pitch-slide" id="s5">
          <span className="pitch-page">05 / 09</span>
          <p className="pitch-eyebrow"># range / outside the frat, twelve months</p>
          <h2 className="pitch-h2 small">what i build when no one is asking.</h2>
          <ul className="pitch-list">
            <li><span className="name">canvas-diary</span><span className="count accent">600</span><span className="desc">llm-organized infinite-canvas journal</span></li>
            <li><span className="name">jarvis</span><span className="count accent">353</span><span className="desc">sms + llm assistant with rag knowledge-base</span></li>
            <li><span className="name">polytrader</span><span className="count accent">115</span><span className="desc">live prediction-market trading</span></li>
            <li><span className="name">bruin_match</span><span className="count accent">73</span><span className="desc">ucla dating app</span></li>
            <li><span className="name">aureliex.com</span><span className="count accent">live</span><span className="desc">public portfolio-letter site, 5-agent editorial</span></li>
          </ul>
          <div className="pitch-rule pitch-rule-muted" />
          <p className="pitch-line">none of this is sep. all of it is rehearsal for what sep could be.</p>
        </section>

        {/* 06 — Cities and Ambition */}
        <section className="pitch-slide" id="s6">
          <span className="pitch-page">06 / 09</span>
          <p className="pitch-eyebrow"># cities and ambition / a microcosm</p>
          <h2 className="pitch-h2">every city whispers what it rewards.</h2>
          <p className="pitch-sub muted">new york whispers money. cambridge whispers know-more. the valley whispers power.</p>
          <div className="pitch-rule pitch-rule-muted" />
          <h2 className="pitch-h2">every frat whispers too.</h2>
          <p className="pitch-line muted">right now, sep whispers <strong>smart</strong>.</p>
          <p className="pitch-line accent"><strong>i want us to whisper ship.</strong></p>
          <p className="pitch-comment">// paul graham, 2008. the president sets the next whisper.</p>
        </section>

        {/* 07 — Three Moves + [04] */}
        <section className="pitch-slide" id="s7">
          <span className="pitch-page">07 / 09</span>
          <p className="pitch-eyebrow"># three moves / to change the whisper</p>
          <h2 className="pitch-h2 small">if i'm president —</h2>
          <ol className="pitch-moves">
            <li><span className="num accent">[01]</span><span className="body">every pledge class ships one real thing, together, publicly.</span></li>
            <li><span className="num accent">[02]</span><span className="body">the tool suite becomes actively-owned — a rotating tech-deacon role.</span></li>
            <li><span className="num accent">[03]</span><span className="body">rush becomes an apprenticeship in shipping, not only a social screen.</span></li>
          </ol>
          <div className="implicit-four">
            <span className="num">[04]</span>
            <div>
              <span className="body">and the layer underneath — social memory on imessage, opt-in.</span>
              <span className="comment">// built on friday + jarvis. i'll show anyone who asks.</span>
            </div>
          </div>
        </section>

        {/* 08 — Reframe */}
        <section className="pitch-slide" id="s8">
          <span className="pitch-page">08 / 09</span>
          <p className="pitch-eyebrow"># on not making this about me</p>
          <h2 className="pitch-h2">the presidency is not the product of my labor.</h2>
          <h2 className="pitch-h2 accent">the tooling is. it already exists.</h2>
          <div className="pitch-rule pitch-rule-muted" />
          <p className="pitch-line muted small">
            i'll keep maintaining rush-react, sep-ats, and the check-in system whether you elect me or not. they are infrastructure, not résumé. the only thing the presidency adds is a mandate to train the next person to be invisible the way i have been.
          </p>
        </section>

        {/* 09 — Close */}
        <section className="pitch-slide" id="s9">
          <span className="pitch-page">09 / 09</span>
          <p className="pitch-hero muted">i have been building for us for two years without being asked.</p>
          <p className="pitch-hero accent">i am asking for the year where i train someone else to.</p>
          <div className="pitch-rule" />
          <p className="pitch-comment">— saapai · 04.2026 · aureliex.com</p>

          <form action={logoutPitch} className="pitch-footer-form">
            <button type="submit" className="pitch-logout">close the door</button>
          </form>
        </section>

      </div>
    </main>
  );
}

function PitchModeBody() {
  // Sets body class so layout chrome (masthead, footer, insignia, toc) hides on /pitch
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `document.body.classList.add("pitch-mode");
                 window.addEventListener("beforeunload", () => document.body.classList.remove("pitch-mode"));`,
      }}
    />
  );
}
