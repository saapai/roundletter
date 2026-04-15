import { logoutPitch } from "./actions";
import AutoScroll from "@/components/AutoScroll";
import SlideReveal from "@/components/SlideReveal";

export default function Deck() {
  return (
    <main className="pitch-root">
      <PitchModeBody />
      <AutoScroll />
      <SlideReveal />
      <div className="pitch-deck">

        {/* 01 — Title · zone-dark */}
        <section className="pitch-slide zone-dark" id="s1">
          <span className="pitch-page">01 / 10</span>
          <h1 className="pitch-title">a quiet case.</h1>
          <div className="pitch-rule" />
          <p className="pitch-sub">// built mostly from git history.</p>
          <p className="pitch-meta">sep · spring 2026 · saapai</p>
        </section>

        {/* 02 — Thesis · zone-dark */}
        <section className="pitch-slide zone-dark" id="s2">
          <span className="pitch-page">02 / 10</span>
          <p className="pitch-eyebrow"># thesis</p>
          <h2 className="pitch-h2">sep is the frat where smart ucla students build real things.</h2>
          <div className="pitch-rule pitch-rule-muted" />
          <p className="pitch-line muted">we are strong on the first half of that sentence.</p>
          <p className="pitch-line accent">this pitch is about the second half.</p>
        </section>

        {/* 03 — Receipts · zone-dark */}
        <section className="pitch-slide zone-dark" id="s3">
          <span className="pitch-page">03 / 10</span>
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

        {/* 04 — Punchline · zone-dark (last full-dark slide) */}
        <section className="pitch-slide zone-dark" id="s4">
          <span className="pitch-page">04 / 10</span>
          <p className="pitch-hero muted">these are not three things.</p>
          <p className="pitch-hero">they are one thing —</p>
          <p className="pitch-hero accent">sep's infrastructure.</p>
          <div className="pitch-rule pitch-rule-muted" />
          <p className="pitch-comment">built by one person, quietly, across three rushes.</p>
        </section>

        {/* 05 — Range · zone-warm-dark (first warming) */}
        <section className="pitch-slide zone-warm-dark" id="s5">
          <span className="pitch-page">05 / 10</span>
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

        {/* 06 — Cities and Ambition · zone-pivot (gradient + mixed type) */}
        <section className="pitch-slide zone-pivot" id="s6">
          <span className="pitch-page">06 / 10</span>
          <div className="pivot-top">
            <p className="pitch-eyebrow"># cities and ambition — a microcosm</p>
            <h2 className="mono-h2">every city whispers what it rewards.</h2>
            <p className="mono-sub">new york whispers money. cambridge whispers know-more. the valley whispers power.</p>
          </div>
          <div className="pivot-bottom">
            <h2 className="serif-h2"><em>every frat whispers too.</em></h2>
            <p className="serif-line muted">right now, sep whispers <em>smart</em>.</p>
            <p className="serif-line accent"><em>i want us to whisper ship — and more.</em></p>
            <p className="serif-comment">— paul graham, 2008. the president sets the next whisper.</p>
          </div>
        </section>

        {/* 07 — Three Moves · zone-warm-cream (serif starts winning) */}
        <section className="pitch-slide zone-warm-cream" id="s7">
          <span className="pitch-page">07 / 10</span>
          <p className="warm-eyebrow">three moves — to change the whisper</p>
          <h2 className="warm-h2">if i'm president —</h2>

          <ol className="warm-moves">
            <li>
              <span className="num">[01]</span>
              <span className="body"><em>every pledge class ships one real thing, together, publicly.</em></span>
            </li>
            <li>
              <span className="num">[02]</span>
              <span className="body"><em>the tool suite becomes actively-owned — a rotating tech-deacon role.</em></span>
            </li>
            <li>
              <span className="num">[03]</span>
              <span className="body"><em>rush becomes an apprenticeship in doing, not only a social screen.</em></span>
            </li>
          </ol>

          <div className="warm-four">
            <span className="num faint">[04]</span>
            <div>
              <span className="body faint"><em>and the layer underneath — social memory on imessage, opt-in.</em></span>
              <span className="comment faint">// built on friday + jarvis. i'll show anyone who asks.</span>
            </div>
          </div>
        </section>

        {/* 08 — Reframe · zone-cream (compressed to two italic lines) */}
        <section className="pitch-slide zone-cream" id="s8">
          <span className="pitch-page">08 / 10</span>
          <p className="cream-eyebrow">on not making this about me</p>
          <h2 className="cream-hero"><em>the presidency is not the product of my labor.</em></h2>
          <h2 className="cream-hero accent"><em>the tooling is. it already exists.</em></h2>
          <div className="cream-rule" />
          <p className="cream-line">
            <em>i'll keep maintaining the tools whether you elect me or not. the presidency only adds a mandate — to train the next person to be as invisible as i have been.</em>
          </p>
        </section>

        {/* 09 — Manifesto + Ask · zone-cream-final (penultimate) */}
        <section className="pitch-slide zone-cream-final" id="s9">
          <span className="pitch-page">09 / 10</span>
          <p className="cream-eyebrow">what sep is, when you take the surface away</p>

          <div className="manifesto">
            <p className="manifesto-line"><em>sep is not a tech frat.</em></p>
            <p className="manifesto-line muted"><em>startups are the surface.</em></p>

            <p className="manifesto-line"><em>underneath — a way of attention.</em></p>
            <p className="manifesto-line"><em>a counterculture for the ai revolution.</em></p>
            <p className="manifesto-line muted"><em>the revolution will not be televised.<br/>that is why this letter is not a post.</em></p>

            <p className="manifesto-line muted"><em>people doing the hard, weird thing together,<br/>even when the city whispers otherwise.</em></p>

            <p className="manifesto-line"><em>a way to communicate across cities. across dimensions.</em></p>

            <p className="manifesto-line accent"><em>even when the work is bullshit — especially then.<br/>the method is the medicine.</em></p>
          </div>

          <div className="cream-rule" />

          <div className="close-ask">
            <p className="close-line muted"><em>i have been building for us for two years without being asked.</em></p>
            <p className="close-line accent"><em>i am asking for the year where i train someone else to.</em></p>
          </div>
        </section>

        {/* 10 — Final · zone-aurora (love + resolution) */}
        <section className="pitch-slide zone-aurora" id="s10">
          <span className="pitch-page">10 / 10</span>

          <div className="aurora-wrap">
            <div className="love-stack">
              <p className="love-line"><em>a little love in the heart — and good things happen.</em></p>
              <p className="love-line muted"><em>i love love. so love is inevitable.</em></p>
              <p className="love-line faint"><em>especially because i love the people who love loving love.</em></p>
            </div>

            <div className="love-rule" />

            <p className="aurora-line"><em>let's cut through the bullshit.</em></p>
            <p className="aurora-tag"><em>together.</em></p>
          </div>

          <p className="aurora-sig">— saapai · 04.2026 · aureliex.com</p>

          <form action={logoutPitch} className="pitch-footer-form">
            <button type="submit" className="pitch-logout-cream">close the door</button>
          </form>
        </section>

      </div>
    </main>
  );
}

function PitchModeBody() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `document.body.classList.add("pitch-mode");
                 window.addEventListener("beforeunload", () => document.body.classList.remove("pitch-mode"));`,
      }}
    />
  );
}
