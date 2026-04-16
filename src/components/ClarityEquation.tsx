// Maclaurin-series visualization: each derivative of reasoning
// approaches clarity but never reaches it.

const TERMS: Array<{ n: number; label: string; era: string; sup: string }> = [
  { n: 0, label: "data", era: "the computer", sup: "" },
  { n: 1, label: "thesis", era: "the dot-com bubble", sup: "′" },
  { n: 2, label: "reasoning", era: "artificial intelligence", sup: "″" },
  { n: 3, label: "the reasoning\nabout the reasoning", era: "?", sup: "‴" },
];

function factorial(n: number): number {
  return n <= 1 ? 1 : n * factorial(n - 1);
}

export default function ClarityEquation() {
  return (
    <div className="clarity-eq">
      <div className="clarity-eq-series">
        <span className="clarity-eq-lhs">
          <span className="clarity-eq-fn">clarity</span>
          <span className="clarity-eq-paren">(</span>
          <span className="clarity-eq-var">x</span>
          <span className="clarity-eq-paren">)</span>
          <span className="clarity-eq-approx">&nbsp;≈&nbsp;</span>
        </span>

        <span className="clarity-eq-terms">
          {TERMS.map((t, i) => {
            const opacity = 1 - i * 0.18;
            return (
              <span key={t.n} className="clarity-eq-term" style={{ opacity }}>
                {i > 0 && <span className="clarity-eq-plus">+</span>}
                <span className="clarity-eq-frac">
                  <span className="clarity-eq-num">
                    <span className="clarity-eq-R">R</span>
                    <sup>{t.sup}</sup>
                    <span className="clarity-eq-eval">
                      <span className="clarity-eq-paren">(</span>0<span className="clarity-eq-paren">)</span>
                    </span>
                    {t.n > 0 && (
                      <>
                        ·<span className="clarity-eq-var">x</span>
                        {t.n > 1 && <sup>{t.n}</sup>}
                      </>
                    )}
                  </span>
                  {t.n > 1 && (
                    <span className="clarity-eq-den">{factorial(t.n)}!</span>
                  )}
                </span>
                <span className="clarity-eq-label">{t.label}</span>
                <span className="clarity-eq-era">{t.era}</span>
              </span>
            );
          })}

          <span className="clarity-eq-term clarity-eq-ellipsis" style={{ opacity: 0.28 }}>
            <span className="clarity-eq-plus">+</span>
            <span className="clarity-eq-dots">···</span>
            <span className="clarity-eq-label">∞</span>
          </span>
        </span>
      </div>

      <div className="clarity-eq-limit">
        <span className="clarity-eq-lim">
          <span className="clarity-eq-lim-word">lim</span>
          <span className="clarity-eq-lim-sub">n→∞</span>
        </span>
        <span className="clarity-eq-lim-body">
          C<sub>n</sub>(x) → C<sup>*</sup>
        </span>
      </div>

      <p className="clarity-eq-coda">
        but C<sup>*</sup> ∉ ℝ — clarity is approached, never held.<br />
        the question is <em>how much.</em>
      </p>
    </div>
  );
}
