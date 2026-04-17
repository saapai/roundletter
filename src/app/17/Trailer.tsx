"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import s from "./trailer.module.css";
import { FUNNELS, type FunnelCut, type FunnelId, detectFunnel, seededShuffle, ALL_SCENE_IDS } from "./funnels";

type Phase = "boot" | "scene" | "coda";

const SCENE_DURATION = 6200;
const BOOT_DURATION = 3500;

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
      <span className={s.attribution}>// ford v ferrari × nba 2k · the green release</span>
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
      <span className={s.attribution}>// the matrix · 1999</span>
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
      <span className={s.attribution}>// allen iverson · may 7, 2002 · the podium</span>
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
      <span className={s.attribution}>// everything everywhere all at once · 2022</span>
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
      <span className={s.attribution}>// ted lasso · afc richmond · the locker room</span>
    </div>
  );
}

function Roosevelt() {
  return (
    <div className={`${s.scene} ${s.arena}`}>
      <div className={s.arenaTexture} aria-hidden />
      <p className={s.bigLine}>
        <em>
          the credit belongs to the one who is actually in the arena — whose face is marred by dust and sweat and blood; who strives valiantly; who errs and comes short again and again; who at the worst, if he fails, at least fails while daring greatly.
        </em>
      </p>
      <span className={s.attribution}>// theodore roosevelt · sorbonne · april 23, 1910</span>
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
        <div className={s.moneyballRow}>{">"} GRADIENT ........................ 4.74 → 3.156</div>
        <div className={s.moneyballRow}>{">"} COURSE_PRICE .................... $0</div>
      </div>
      <p className={s.bigLine}>
        <em>the gap is the entire joke. and the entire point.</em>
      </p>
      <span className={s.attribution}>// moneyball · billy beane · show your work</span>
    </div>
  );
}

const SCENE_MAP: Record<string, () => React.ReactNode> = {
  shotmeter: () => <ShotMeter />,
  matrix: () => <MatrixRain />,
  iverson: () => <Iverson />,
  eeao: () => <EEAO />,
  lasso: () => <TedLasso />,
  roosevelt: () => <Roosevelt />,
  moneyball: () => <Moneyball />,
};

const SCENE_DURATION_OVERRIDES: Record<string, number> = {
  eeao: SCENE_DURATION + 600,
  roosevelt: SCENE_DURATION + 1400,
  moneyball: SCENE_DURATION + 800,
};

// ════════════════════════════════════════════════════
// BOOT — 2K-style green animation, funnel-aware whisper
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
        <span className={s.bootKicker}>aureliex → saathvikpai · {funnel.label}</span>
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

function Coda({ funnel }: { funnel: FunnelCut }) {
  return (
    <div className={`${s.scene} ${s.coda}`}>
      <div className={s.codaInk} aria-hidden />
      <p className={s.codaLine}>
        <em>i am nineteen. i have $3,453.83 and no job.</em>
      </p>
      <p className={s.codaReceipt}>
        <em>i keep the receipt.</em>
      </p>
      <span className={s.attribution}>
        // the disagreement is the statement · aureliex.com
      </span>
      <Link href={funnel.nextUrl.href} className={s.nextLink}>
        {funnel.nextUrl.label}
      </Link>
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

  // Resolve funnel on mount (client-side: URL + referrer + visit-count seed).
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

    // For default, fill scenes via seeded shuffle.
    if (id === "default" || resolved.scenes.length === 0) {
      const shuffled = seededShuffle(ALL_SCENE_IDS, v);
      resolved.scenes = shuffled.slice(0, 4);
    }
    setFunnel(resolved);
  }, [initialFunnel]);

  // Boot timer
  useEffect(() => {
    if (phase !== "boot") return;
    const t = setTimeout(() => setPhase("scene"), BOOT_DURATION);
    return () => clearTimeout(t);
  }, [phase]);

  // Scene timer
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
    <div className={s.viewport}>
      {phase === "boot" && <Boot funnel={funnel} />}
      {phase === "scene" && renderScene && (
        <div key={`${currentSceneId}-${sceneIdx}`} style={{ position: "absolute", inset: 0 }}>
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
