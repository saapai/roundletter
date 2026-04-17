"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import s from "./trailer.module.css";
import {
  FUNNELS,
  META_WHISPER,
  DEADLINE_ISO,
  type FunnelCut,
  type FunnelId,
  detectFunnel,
  seededShuffle,
  ALL_SCENE_IDS,
} from "./funnels";

type Phase = "boot" | "scene" | "coda";

const SCENE_DURATION = 5000;
const BOOT_DURATION = 2400;

// Each reference caption links to the actual source of the punchline —
// YouTube clip when a canonical one exists; otherwise the primary-source
// page (Wikiquote, Wikipedia, the org's own archive). Users click the
// attribution to verify the reference. Swap a URL here to repin a source.
const SCENE_LINKS: Record<string, string> = {
  shotmeter: "https://en.wikiquote.org/wiki/Ford_v_Ferrari",
  matrix: "https://en.wikipedia.org/wiki/Matrix_digital_rain",
  iverson: "https://www.youtube.com/watch?v=eGDBR2L5kzI",
  eeao: "https://www.youtube.com/results?search_query=everything+everywhere+bagel+scene",
  feynman: "https://www.youtube.com/results?search_query=richard+feynman+bongos",
  lasso: "https://www.youtube.com/results?search_query=ted+lasso+be+curious+not+judgmental",
  roosevelt: "https://www.theodorerooseveltcenter.org/encyclopedia/culture-and-society/man-in-the-arena/",
  moneyball: "https://www.youtube.com/results?search_query=moneyball+adapt+or+die",
};

function Source({ id, children }: { id: string; children: React.ReactNode }) {
  const href = SCENE_LINKS[id];
  if (!href) return <span className={s.attribution}>{children}</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={s.attribution}>
      {children}
    </a>
  );
}

// ════════════════════════════════════════════════════
// SCENE COMPONENTS
// ════════════════════════════════════════════════════

function ShotMeter() {
  return (
    <div className={`${s.scene} ${s.shotmeter}`}>
      <div className={s.shotmeterRow}>
        <div className={s.shotmeterMeter} aria-hidden />
        <div>
          <p className={s.bigLine}>
            <em>green. / 7,000 rpm.</em>
          </p>
          <p className={s.subLine}>
            <em>the float point. the felt texture of a great run. on a shot meter, you call it green.</em>
          </p>
        </div>
        <div className={s.shotmeterTach} aria-hidden>
          <div className={s.shotmeterNeedle} />
          <span className={s.shotmeterTachLabel}>7000</span>
        </div>
      </div>
      <Source id="shotmeter">// ford v ferrari × nba 2k</Source>
    </div>
  );
}

function MatrixRain() {
  const cols = useMemo(() => {
    const N = 32;
    const rng = (n: number) => (Math.sin(n * 13.37) + 1) / 2;
    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEFの無限光龍";
    return Array.from({ length: N }, (_, i) => {
      const len = 18 + Math.floor(rng(i * 3.1) * 22);
      const col: string[] = [];
      for (let k = 0; k < len; k++) col.push(chars[Math.floor(rng(i * 7.7 + k * 11.3) * chars.length)]);
      return {
        chars: col.join("\n"),
        left: (i / (N - 1)) * 100,
        delay: rng(i * 2.1) * -6,
        duration: 4 + rng(i * 5.2) * 5,
        opacity: 0.45 + rng(i * 1.9) * 0.55,
      };
    });
  }, []);
  return (
    <div className={`${s.scene} ${s.matrix}`}>
      <div className={s.matrixRain} aria-hidden>
        {cols.map((c, i) => (
          <div
            key={i}
            className={s.matrixCol}
            style={{
              left: `${c.left}%`,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
              opacity: c.opacity,
            }}
          >
            {c.chars}
          </div>
        ))}
      </div>
      <div className={s.matrixContent}>
        <p className={s.bigLine}>
          <em>dye in the water.</em>
        </p>
        <p className={s.subLine}>
          <em>every revolution needs its counterculture. mark the difference. choose dye.</em>
        </p>
      </div>
      <Source id="matrix">// the matrix · 1999</Source>
    </div>
  );
}

function Iverson() {
  return (
    <div className={`${s.scene} ${s.iverson}`}>
      <div className={s.iversonSpot} aria-hidden />
      <p className={s.iversonHuge}>practice.</p>
      <p className={s.subLine}>
        <em>not a round. not the ballot. practice.</em>
      </p>
      <Source id="iverson">// allen iverson · may 7, 2002</Source>
    </div>
  );
}

function EEAO() {
  return (
    <div className={`${s.scene} ${s.eeao}`}>
      <div className={s.eeaoBagel} aria-hidden>
        <span className={s.eeaoRock} style={{ left: "30%" }} />
        <span className={s.eeaoRock} style={{ left: "62%" }} />
      </div>
      <p className={s.bigLine}>
        <em>i convened a panel on myself.</em>
      </p>
      <p className={s.subLine}>
        <em>they could not agree. i published the disagreement. the disagreement is the statement.</em>
      </p>
      <Source id="eeao">// everything everywhere all at once · 2022</Source>
    </div>
  );
}

function Feynman() {
  return (
    <div className={`${s.scene} ${s.feynman}`}>
      <svg className={s.feynmanDiagram} viewBox="0 0 400 220" aria-hidden>
        {/* Feynman-style QED vertex — two fermion lines, wavy photon */}
        <line x1="20" y1="40" x2="190" y2="110" stroke="#F4EFE6" strokeWidth="1.4" />
        <line x1="20" y1="180" x2="190" y2="110" stroke="#F4EFE6" strokeWidth="1.4" />
        <line x1="210" y1="110" x2="380" y2="40" stroke="#F4EFE6" strokeWidth="1.4" />
        <line x1="210" y1="110" x2="380" y2="180" stroke="#F4EFE6" strokeWidth="1.4" />
        <path
          d="M 190 110 Q 200 95 210 110 Q 220 125 230 110 Q 240 95 250 110 Q 260 125 270 110 Q 280 95 290 110 Q 300 125 310 110"
          stroke="#F4EFE6"
          strokeWidth="1.4"
          fill="none"
        />
        <polygon points="30,40 26,36 34,36" fill="#F4EFE6" />
        <polygon points="30,180 26,184 34,184" fill="#F4EFE6" />
        <polygon points="370,40 374,44 366,44" fill="#F4EFE6" />
        <polygon points="370,180 374,176 366,176" fill="#F4EFE6" />
      </svg>
      <p className={s.bigLine}>
        <em>first principles.</em>
      </p>
      <p className={s.subLine}>
        <em>nobel laureate at thirty-seven. bongo player at forty. ρ &lt; 1, on the only proof that mattered.</em>
      </p>
      <Source id="feynman">// richard feynman · caltech · cracked safes, played drums</Source>
    </div>
  );
}

function TedLasso() {
  return (
    <div className={`${s.scene} ${s.lasso}`}>
      <div className={s.lassoSign}>
        <span className={`${s.lassoTape} ${s.lassoTapeTL}`} aria-hidden />
        <span className={`${s.lassoTape} ${s.lassoTapeTR}`} aria-hidden />
        <span className={`${s.lassoTape} ${s.lassoTapeBL}`} aria-hidden />
        <span className={`${s.lassoTape} ${s.lassoTapeBR}`} aria-hidden />
        <p className={s.lassoBelieve}>believe</p>
      </div>
      <p className={s.subLine}>
        <em>be curious. not judgmental. the bear was wrong about q1. next round.</em>
      </p>
      <Source id="lasso">// afc richmond · the locker room</Source>
    </div>
  );
}

function Roosevelt() {
  return (
    <div className={`${s.scene} ${s.arena}`}>
      <div className={s.arenaTexture} aria-hidden />
      <p className={s.bigLine}>
        <em>
          the credit belongs to the one who is actually in the arena — whose face is marred by dust and sweat and blood; who errs and comes short again and again; who at the worst, if he fails, at least fails while daring greatly.
        </em>
      </p>
      <Source id="roosevelt">// theodore roosevelt · sorbonne · april 23, 1910</Source>
    </div>
  );
}

function Moneyball() {
  return (
    <div className={`${s.scene} ${s.moneyball}`}>
      <div className={s.moneyballStats}>
        <div className={s.moneyballRow}>{">"} ACCOUNT ......................... $3,453.83</div>
        <div className={s.moneyballRow}>{">"} TARGET .......................... $100,000</div>
        <div className={s.moneyballRow}>{">"} REQUIRED MULTIPLE ............... 29x</div>
        <div className={s.moneyballRow}>{">"} S&amp;P 25-YEAR MULTIPLE .......... 10x</div>
        <div className={s.moneyballRow}>{">"} GPA_FALL ........................ 4.74 → 3.156</div>
        <div className={s.moneyballRow}>{">"} COURSE_PRICE .................... $0</div>
      </div>
      <p className={s.bigLine}>
        <em>the gap is the entire joke. and the entire point.</em>
      </p>
      <Source id="moneyball">// moneyball · show your work</Source>
    </div>
  );
}

const SCENE_MAP: Record<string, () => React.ReactNode> = {
  shotmeter: () => <ShotMeter />,
  matrix: () => <MatrixRain />,
  iverson: () => <Iverson />,
  eeao: () => <EEAO />,
  feynman: () => <Feynman />,
  lasso: () => <TedLasso />,
  roosevelt: () => <Roosevelt />,
  moneyball: () => <Moneyball />,
};

const SCENE_DURATION_OVERRIDES: Record<string, number> = {
  eeao: SCENE_DURATION + 800,
  roosevelt: SCENE_DURATION + 1800,
  moneyball: SCENE_DURATION + 1000,
};

// ════════════════════════════════════════════════════
// BOOT — 2K-style green flash, meta-whisper + funnel whisper
// ════════════════════════════════════════════════════

function Boot({ funnel }: { funnel: FunnelCut }) {
  return (
    <div className={`${s.scene} ${s.boot}`}>
      <div className={s.bootVignette} aria-hidden />
      <div className={s.bootMeterTrack} aria-hidden>
        <div className={s.bootMeterTickWindow} />
        <div className={s.bootMeterFill} />
      </div>
      <span className={s.bootMeterLabel}>green</span>
      <div className={s.bootFlash} aria-hidden />
      <div className={s.bootTitle}>
        <span className={s.bootMeta}>{META_WHISPER}</span>
        <p className={s.bootWhisper}>
          <em>{funnel.whisper}</em>
        </p>
        {funnel.subWhisper && (
          <p className={s.bootSubWhisper}>
            <em>{funnel.subWhisper}</em>
          </p>
        )}
      </div>
    </div>
  );
}

function Countdown() {
  const [text, setText] = useState("");
  useEffect(() => {
    const deadline = new Date(DEADLINE_ISO).getTime();
    const tick = () => {
      const now = Date.now();
      const ms = Math.max(0, deadline - now);
      const days = Math.floor(ms / 86400000);
      const hours = Math.floor((ms % 86400000) / 3600000);
      const mins = Math.floor((ms % 3600000) / 60000);
      if (ms <= 0) setText("the logbook is closed.");
      else if (days > 0) setText(`${days} days · ${hours}h · ${mins}m`);
      else setText(`${hours}h · ${mins}m · closing`);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);
  return <span className={s.codaCountdown}>{text}</span>;
}

function Coda({ funnel }: { funnel: FunnelCut }) {
  const [copied, setCopied] = useState(false);
  const onShare = async () => {
    try {
      const url = `${window.location.origin}/17/${funnel.id === "default" ? "" : funnel.id}`.replace(/\/$/, "");
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };
  return (
    <div className={`${s.scene} ${s.coda}`}>
      <div className={s.codaInk} aria-hidden />
      <p className={s.codaEndCard}>
        <em>june 21, 2026 — the logbook closes.</em>
      </p>
      <Countdown />
      <div className={s.codaRule} aria-hidden />
      <p className={s.codaLine}>
        <em>i am nineteen. i have $3,453.83 and no job.</em>
      </p>
      <p className={s.codaReceipt}>
        <em>i keep the receipt.</em>
      </p>
      <div className={s.codaActions}>
        <Link href={funnel.nextUrl.href} className={s.nextLink}>
          {funnel.nextUrl.label}
        </Link>
        {funnel.id !== "default" && (
          <button type="button" className={s.shareButton} onClick={onShare}>
            {copied ? "copied." : "↪ send this cut"}
          </button>
        )}
      </div>
      <span className={s.attribution}>// the disagreement is the statement · aureliex.com</span>
    </div>
  );
}

// ════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════

export default function Trailer({ initialFunnel }: { initialFunnel?: FunnelId }) {
  const [phase, setPhase] = useState<Phase>("boot");
  const [sceneIdx, setSceneIdx] = useState(0);
  const [funnel, setFunnel] = useState<FunnelCut>(FUNNELS[initialFunnel ?? "default"]);
  const [visit, setVisit] = useState(1);

  useEffect(() => {
    let v = 0;
    try {
      v = parseInt(localStorage.getItem("17:visits") || "0", 10) || 0;
      localStorage.setItem("17:visits", String(v + 1));
    } catch {
      v = Math.floor(Math.random() * 1000);
    }
    setVisit(v + 1);

    const params = new URLSearchParams(window.location.search);
    const referrer = document.referrer || "";
    const id = initialFunnel ?? detectFunnel(params, referrer);
    const resolved = { ...FUNNELS[id] };

    if (id === "default" || resolved.scenes.length === 0) {
      const shuffled = seededShuffle(ALL_SCENE_IDS, v);
      resolved.scenes = shuffled.slice(0, 4);
    }
    setFunnel(resolved);
  }, [initialFunnel]);

  useEffect(() => {
    if (phase !== "boot") return;
    const t = setTimeout(() => setPhase("scene"), BOOT_DURATION);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "scene" || funnel.scenes.length === 0) return;
    const currentId = funnel.scenes[sceneIdx];
    const dur = SCENE_DURATION_OVERRIDES[currentId] ?? SCENE_DURATION;
    const t = setTimeout(() => {
      if (sceneIdx + 1 >= funnel.scenes.length) setPhase("coda");
      else setSceneIdx((i) => i + 1);
    }, dur);
    return () => clearTimeout(t);
  }, [phase, sceneIdx, funnel]);

  const currentSceneId = funnel.scenes[sceneIdx];
  const renderScene = currentSceneId ? SCENE_MAP[currentSceneId] : null;

  return (
    <div
      className={s.viewport}
      role="region"
      aria-label="aureliex trailer, auto-playing"
    >
      {/* Skip link for keyboard users */}
      <Link href={funnel.nextUrl.href} className={s.skipLink}>
        Skip trailer · {funnel.nextUrl.label}
      </Link>

      {phase === "boot" && <Boot funnel={funnel} />}
      {phase === "scene" && renderScene && (
        <div
          key={`${currentSceneId}-${sceneIdx}`}
          style={{ position: "absolute", inset: 0 }}
          aria-live="polite"
          aria-atomic="true"
        >
          {renderScene()}
        </div>
      )}
      {phase === "coda" && <Coda funnel={funnel} />}

      {phase !== "boot" && (
        <div className={s.chrome}>
          <span>aureliex → saathvikpai · {funnel.label}</span>
          <span className={s.chromeRight}>
            visit {visit} · scene {phase === "coda" ? funnel.scenes.length + 1 : sceneIdx + 1}/{funnel.scenes.length + 1}
          </span>
        </div>
      )}

      {phase === "coda" && (
        <div className={s.reloadHint}>↻ reload for another cut</div>
      )}
    </div>
  );
}
