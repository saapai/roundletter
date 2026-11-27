"use client";

import { useEffect, useRef } from "react";

/* PONG (Atari, 1972). Left paddle is you, right is the machine. Five short levels,
   first to 3, each with its own twist: win to climb, lose to replay. */

const W = 800, H = 600;
const PADDLE_W = 12, PADDLE_H = 80, BALL = 12;
const LEFT_X = 40, RIGHT_X = W - 40 - PADDLE_W;
const WIN = 3;
const EGG = "https://www.galactanet.com/oneoff/theegg.html";
const PLAYER_SPEED = 8;
const STEP = 1000 / 60;
const DANCER_R = 36, SUN_R = 135;

/* Dressed after Matisse's paper cut-outs: flat gouache colour, scissored edges. */
const CREAM = "#F2E8D5", BLUE = "#1F3FA6", RED = "#D9432F", YELLOW = "#F4C21F";
const GREEN = "#23855A", PINK = "#E4799A", BLACK = "#171512";

type Pt = [number, number];

// cpu: the machine's top speed. error: how far off centre it may aim
// (above about 1.15 it can miss outright). serve / max: ball speed.
type Twist = "curl" | "pair" | "current" | "dancers" | "sun";
const LEVELS: {
  name: string; twist: Twist; hint: string;
  cpu: number; error: number; serve: number; max: number; ground: string;
}[] = [
  { name: "the snail", twist: "curl", hint: "swipe as you hit to curl the ball",
    cpu: 3.8, error: 1.4, serve: 6, max: 11, ground: CREAM },
  { name: "the parakeets", twist: "pair", hint: "two birds, two balls",
    cpu: 4.8, error: 1.35, serve: 5, max: 9, ground: "#E3E8EF" },
  { name: "the swimmer", twist: "current", hint: "the current pulls the ball in waves",
    cpu: 4.6, error: 1.3, serve: 6, max: 11, ground: "#DCE9DC" },
  { name: "the dancers", twist: "dancers", hint: "the dancers will not get out of the way",
    cpu: 5, error: 1.3, serve: 6, max: 11, ground: "#F4DDD8" },
  { name: "icarus", twist: "sun", hint: "the ball vanishes into the sun",
    cpu: 5.2, error: 1.25, serve: 6.5, max: 12, ground: "#DDE3F2" },
];

// Hand-cut letters and numerals as strokes on a 4×6 grid.
const GLYPHS: Record<string, string[]> = {
  "0": ["2,0 4,1.5 3.8,4.6 2,6 .2,4.5 0,1.4 2,0"], "1": [".8,1.4 2.4,0 2.2,6"],
  "2": [".2,1.4 2,0 3.8,1.5 .2,6 4,5.8"], "3": [".2,.4 3.8,0 1.8,2.6 3.9,4.2 2.2,6 .1,5.2"],
  "4": ["3,6 3.1,0 0,4.2 4,4"], "5": ["3.8,0 .6,.2 .4,2.8 2.8,2.5 4,4.3 2.2,6 .2,5.4"],
  "6": ["3.4,0 .8,2.4 .2,4.5 2,6 3.8,4.5 2.4,3 .5,3.7"], "7": [".1,.3 4,0 1.4,6"],
  "8": ["2,2.9 .5,1.5 2,0 3.5,1.5 2,2.9 .1,4.5 2,6 3.9,4.4 2,2.9"],
  "9": ["3.6,2.2 1.8,3.1 .2,1.7 2,0 3.8,1.5 3.2,4 1,6"],
  P: [".4,6 .3,0 2.8,.2 4,1.6 2.8,3.1 .4,3.3"],
  O: ["2,0 4,1.8 3.7,4.8 1.8,6 0,4.2 .3,1.2 2,0"],
  N: [".3,6 .4,0 3.6,6 3.7,0"],
  G: ["3.8,1 2.2,0 .2,1.8 .2,4.4 2,6 3.9,4.8 3.8,3.2 2.2,3.3"],
};

const jitter = (seed: number) => {
  const n = Math.sin(seed * 127.1) * 43758.5453;
  return n - Math.floor(n) - 0.5;
};

// A closed shape with softly curved edges.
const blob = (pts: Pt[]) => {
  const path = new Path2D();
  const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  path.moveTo(...mid(pts[pts.length - 1], pts[0]));
  pts.forEach((p, i) => path.quadraticCurveTo(...p, ...mid(p, pts[(i + 1) % pts.length])));
  path.closePath();
  return path;
};

// The many-lobed algae leaf of the cut-outs.
const leaf = (len: number, wide: number, lobes: number) => {
  const side = (dir: number): Pt[] => {
    const pts: Pt[] = [];
    for (let i = 0; i < lobes; i++) {
      const t = (i + 0.5 + (dir > 0 ? 0 : 0.35)) / lobes;
      const reach = wide * (0.5 + 0.5 * Math.sin(Math.PI * t)) * (1 + jitter(i * dir + len) * 0.3);
      const y = -len * t, step = len / lobes;
      pts.push([dir * 5, y + step * 0.45], [dir * reach, y + step * 0.1],
        [dir * reach * 1.05, y - step * 0.35], [dir * 5, y - step * 0.2]);
    }
    return pts;
  };
  return blob([[-6, 0], [6, 0], ...side(1), [0, -len - wide * 0.6], ...side(-1).reverse()]);
};

const star = (r: number, points: number, seed: number) => {
  const path = new Path2D();
  for (let i = 0; i < points * 2; i++) {
    const a = (Math.PI * i) / points + jitter(seed + i) * 0.14;
    const d = i % 2 ? r * 0.42 : r * (1 + jitter(seed * 3 + i) * 0.35);
    path[i ? "lineTo" : "moveTo"](Math.cos(a) * d, Math.sin(a) * d);
  }
  path.closePath();
  return path;
};

// Paddles overhang their hit box very slightly so the edges can wander.
const paddleShape = () => blob([
  [-2, -3], [6, -1], [15, -3], [13, 20], [16, 44], [13, 63], [14, 83],
  [5, 81], [-3, 83], [-1, 60], [-4, 38], [0, 17],
]);

export default function Pong() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let mode: "title" | "play" | "cleared" | "lost" | "won" = "title";
    let level = 0;
    let readyAt = 0; // ignore input briefly so a result card isn't skipped by accident
    let player = (H - PADDLE_H) / 2, cpu = player;
    let score = [0, 0];
    type Ball = { x: number; y: number; vx: number; vy: number; curl: number; wait: number; aim: number };
    let balls: Ball[] = [];
    let tick = 0, intro = 0;
    let playerPush = 0, cpuPush = 0; // recent paddle speed, used to curl the ball
    let target: number | null = null; // mouse / touch destination
    const keys = new Set<string>();
    let audio: AudioContext | null = null;
    const serif = getComputedStyle(document.body).fontFamily;

    const beep = (freq: number, ms: number) => {
      if (!audio) return;
      const osc = audio.createOscillator(), gain = audio.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      gain.gain.value = 0.04;
      osc.connect(gain).connect(audio.destination);
      osc.start();
      osc.stop(audio.currentTime + ms / 1000);
    };

    const aim = () => (Math.random() - 0.5) * PADDLE_H * LEVELS[level].error;

    const serve = (ball: Ball, dir: number, wait: number) => {
      ball.x = (W - BALL) / 2;
      ball.y = H * (0.25 + Math.random() * 0.5);
      ball.vx = LEVELS[level].serve * dir;
      ball.vy = (Math.random() * 2 - 1) * 3.5;
      ball.curl = 0;
      ball.aim = aim();
      ball.wait = wait;
    };

    const start = () => {
      audio ??= new AudioContext();
      void audio.resume();
      if (mode === "play" || performance.now() < readyAt) return;
      if (mode === "cleared") level++;
      else if (mode === "won") level = 0;
      score = [0, 0];
      mode = "play";
      intro = 110;
      const first = Math.random() < 0.5 ? -1 : 1;
      // the second parakeet leaves later, in the other direction
      balls = (LEVELS[level].twist === "pair" ? [first, -first] : [first]).map((dir, i) => {
        const ball = { x: 0, y: 0, vx: 0, vy: 0, curl: 0, wait: 0, aim: 0 };
        serve(ball, dir, intro + i * 55);
        return ball;
      });
    };

    const clamp = (v: number) => Math.max(0, Math.min(H - PADDLE_H, v));

    const dancers = () => [0, 1].map((i) => ({
      x: W / 2 + (i ? 100 : -100),
      y: H / 2 + Math.sin(tick * 0.017 + i * Math.PI * 0.8) * 190,
    }));

    // Where the ball strikes the paddle sets the return angle.
    const bounce = (ball: Ball, paddleY: number, push: number, dir: number) => {
      const hit = (ball.y + BALL / 2 - (paddleY + PADDLE_H / 2)) / ((PADDLE_H + BALL) / 2);
      const speed = Math.min(LEVELS[level].max, Math.hypot(ball.vx, ball.vy) + 0.4);
      const angle = hit * (Math.PI / 3.2);
      ball.vx = Math.cos(angle) * speed * dir;
      ball.vy = Math.sin(angle) * speed;
      ball.curl = LEVELS[level].twist === "curl" ? Math.max(-8, Math.min(8, push)) * 0.022 : 0;
      ball.aim = aim();
      beep(460, 60);
    };

    const move = (ball: Ball) => {
      const { twist } = LEVELS[level];
      const prevX = ball.x;
      ball.vy = Math.max(-10, Math.min(10, ball.vy + ball.curl));
      ball.curl *= 0.98;
      ball.x += ball.vx;
      ball.y += ball.vy;
      if (twist === "current") ball.y += Math.sin(ball.x / 65 + tick * 0.025) * 3;
      if (ball.y <= 0 || ball.y >= H - BALL) {
        const away = ball.y <= 0 ? 1 : -1;
        ball.y = Math.max(0, Math.min(H - BALL, ball.y));
        ball.vy = Math.abs(ball.vy) * away;
        ball.curl = 0;
        beep(230, 40);
      }

      if (twist === "dancers") {
        for (const d of dancers()) {
          const dx = ball.x + BALL / 2 - d.x, dy = ball.y + BALL / 2 - d.y;
          const gap = Math.hypot(dx, dy), reach = DANCER_R + BALL / 2;
          if (gap === 0 || gap >= reach) continue;
          const nx = dx / gap, ny = dy / gap, into = ball.vx * nx + ball.vy * ny;
          ball.x += nx * (reach - gap);
          ball.y += ny * (reach - gap);
          if (into >= 0) continue;
          ball.vx -= 2 * into * nx;
          ball.vy -= 2 * into * ny;
          // never let a deflection leave the ball drifting straight up and down
          if (Math.abs(ball.vx) < 3.5) ball.vx = 3.5 * (Math.sign(ball.vx) || Math.sign(nx) || 1);
          beep(330, 50);
        }
      }

      const overlaps = (p: number) => ball.y + BALL >= p && ball.y <= p + PADDLE_H;
      if (ball.vx < 0 && prevX >= LEFT_X + PADDLE_W && ball.x <= LEFT_X + PADDLE_W && overlaps(player)) {
        ball.x = LEFT_X + PADDLE_W;
        bounce(ball, player, playerPush, 1);
      } else if (ball.vx > 0 && prevX + BALL <= RIGHT_X && ball.x + BALL >= RIGHT_X && overlaps(cpu)) {
        ball.x = RIGHT_X - BALL;
        bounce(ball, cpu, cpuPush, -1);
      }
    };

    const update = () => {
      const before = player, cpuBefore = cpu;
      const up = keys.has("arrowup") || keys.has("w");
      const down = keys.has("arrowdown") || keys.has("s");
      if (up || down) {
        target = null;
        player = clamp(player + (Number(down) - Number(up)) * PLAYER_SPEED);
      } else if (target !== null) {
        player = clamp(target - PADDLE_H / 2);
      }
      playerPush = playerPush * 0.7 + (player - before) * 0.3;
      if (mode !== "play") return;
      tick++;
      if (intro > 0) intro--;

      // the machine chases whichever ball will reach it first
      const eta = (b: Ball) => (RIGHT_X - b.x) / b.vx + b.wait;
      const threat = balls.filter((b) => b.vx > 0).sort((a, b) => eta(a) - eta(b))[0];
      const goal = threat ? threat.y + BALL / 2 + threat.aim : H / 2;
      const delta = goal - (cpu + PADDLE_H / 2);
      const reach = LEVELS[level].cpu;
      cpu = clamp(cpu + Math.max(-reach, Math.min(reach, delta)));
      cpuPush = cpuPush * 0.7 + (cpu - cpuBefore) * 0.3;

      for (const ball of balls) {
        if (ball.wait > 0) { ball.wait--; continue; }
        move(ball);
        if (ball.x >= -BALL && ball.x <= W) continue;
        const scorer = ball.x > W ? 0 : 1;
        score[scorer]++;
        beep(110, 250);
        if (score[scorer] >= WIN) {
          mode = scorer === 1 ? "lost" : level === LEVELS.length - 1 ? "won" : "cleared";
          readyAt = performance.now() + 800;
          return;
        }
        serve(ball, scorer === 0 ? 1 : -1, 45);
      }
    };

    const paint = (path: Path2D, color: string, x: number, y: number, turn = 0) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(turn);
      ctx.fillStyle = color;
      ctx.fill(path);
      ctx.restore();
    };

    const word = (s: string, cx: number, y: number, unit: number, colors: string[], weight: number) => {
      const advance = unit * 4 + weight * 1.5;
      const left = cx - (s.length * advance - weight * 1.5) / 2;
      ctx.lineWidth = weight;
      ctx.lineCap = "butt";
      ctx.lineJoin = "bevel";
      [...s].forEach((c, i) => {
        ctx.strokeStyle = colors[i % colors.length];
        for (const stroke of GLYPHS[c]) {
          ctx.beginPath();
          stroke.split(" ").forEach((pair, k) => {
            const [gx, gy] = pair.split(",").map(Number);
            ctx[k ? "lineTo" : "moveTo"](left + i * advance + gx * unit, y + gy * unit);
          });
          ctx.stroke();
        }
      });
    };

    const caption = (s: string, y: number, size: number) => {
      ctx.font = `italic 600 ${size}px ${serif}`;
      ctx.textAlign = "center";
      ctx.fillStyle = BLACK;
      ctx.fillText(s, W / 2, y);
    };

    const panel = (pts: Pt[], color: string) => paint(blob(pts), color, 0, 0);
    const card = (x: number, y: number, w: number, h: number, color: string) => {
      const path = new Path2D();
      path.moveTo(x, y + 7);
      path.lineTo(x + w - 5, y);
      path.lineTo(x + w, y + h - 8);
      path.lineTo(x + 6, y + h);
      path.closePath();
      paint(path, color, 0, 0);
    };

    // The backdrop never changes, so cut it once.
    const fronds = [leaf(150, 38, 4), leaf(120, 30, 3), leaf(95, 26, 3)];
    const backdrop = () => {
      ctx.fillStyle = LEVELS[level].ground;
      ctx.fillRect(0, 0, W, H);
      card(-10, -10, 150, 138, BLUE);
      card(W - 128, -8, 140, 112, PINK);
      card(-8, H - 118, 118, 130, YELLOW);
      card(W - 158, H - 142, 170, 156, GREEN);
      paint(fronds[0], LEVELS[level].ground, W - 78, H + 4, -0.2);
      paint(fronds[1], BLUE, 52, H + 6, 0.28);
      paint(fronds[2], RED, W - 62, -6, Math.PI + 0.3);
      paint(star(40, 8, 4), YELLOW, 62, 58, 0.2);
      paint(star(17, 6, 9), BLACK, 184, H - 62);
      paint(star(13, 5, 2), RED, W - 192, 150);
      panel([[210, -30], [262, 18], [300, 4], [322, -30]], RED);
      panel([[500, H + 30], [526, H - 30], [566, H - 8], [590, H - 40], [622, H + 30]], PINK);
    };

    // A torn blue ribbon in place of the dashed net.
    const net = () => {
      for (let i = 0, y = 12; y < H - 60; i++, y += 42) {
        const lean = Math.sin(i * 0.9) * 7;
        panel([
          [W / 2 - 4 + lean, y], [W / 2 + 5 + lean, y + 3],
          [W / 2 + 3 + lean * 0.6, y + 24], [W / 2 - 6 + lean * 0.6, y + 21],
        ], BLUE);
      }
    };

    const sun = star(15, 8, 11);
    const paddle = paddleShape();
    let spin = 0;
    const figure = leaf(62, 20, 3);
    const rays = star(SUN_R + 22, 18, 5);
    const drawBall = (ball: Ball) => {
      const x = ball.x + BALL / 2, y = ball.y + BALL / 2;
      paint(sun, YELLOW, x, y, spin);
      ctx.beginPath();
      ctx.arc(x, y, BALL / 2, 0, Math.PI * 2);
      ctx.fillStyle = BLACK; // keeps the ball legible against every colour
      ctx.fill();
    };
    const disc = (x: number, y: number, r: number, color: string) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    };

    const draw = () => {
      backdrop();
      if (mode === "play") net();
      word(String(score[0]), W / 4 + 20, 36, 12, [RED], 16);
      word(String(score[1]), (W * 3) / 4 - 20, 36, 12, [BLUE], 16);
      paint(paddle, RED, LEFT_X, player);
      paint(paddle, BLUE, RIGHT_X, cpu);
      const heading = `level ${level + 1} · ${LEVELS[level].name}`;
      if (mode === "play") {
        spin += 0.05;
        balls.forEach(drawBall);
        if (LEVELS[level].twist === "dancers") {
          // the disc is what the ball bounces off; the figure dances on it
          dancers().forEach((d, i) => {
            disc(d.x, d.y, DANCER_R, i ? BLUE : RED);
            paint(figure, CREAM, d.x, d.y + 28, Math.sin(tick * 0.05 + i * 2) * 0.5);
          });
        }
        if (LEVELS[level].twist === "sun") {
          paint(rays, YELLOW, W / 2, H / 2, tick * 0.003);
          disc(W / 2, H / 2, SUN_R, YELLOW);
        }
        // name the level and its twist before the first serve
        if (intro > 0) {
          panel([[170, 118], [400, 104], [630, 120], [644, 188], [622, 246], [400, 258], [178, 244], [156, 182]], CREAM);
          caption(heading, 172, 40);
          caption(LEVELS[level].hint, 218, 28);
        } else caption(`${level + 1} / ${LEVELS.length}`, H - 18, 22);
        return;
      }
      panel([[160, 150], [400, 120], [650, 160], [680, 330], [640, 505], [390, 530], [150, 495], [122, 320]], CREAM);
      if (mode === "title") {
        word("PONG", W / 2, 190, 22, [BLUE, RED, GREEN, BLACK], 30);
        caption("click, tap or press space", 400, 38);
        caption("mouse · touch · ↑↓ · W S", 442, 24);
        caption(`${LEVELS.length} levels · first to ${WIN} · each plays differently`, 476, 24);
        return;
      }
      const [headline, next] = {
        cleared: ["level cleared", `next: ${LEVELS[level + 1]?.hint}`],
        lost: ["game over", `to retry level ${level + 1}`],
        won: ["you win", "to play again from level 1"],
      }[mode];
      caption(headline, 290, 82);
      caption(heading, 350, 30);
      caption("click, tap or press space", 420, 34);
      caption(next, 462, 24);
    };

    const toBoard = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
    };
    // Either score is a hidden door.
    const onScore = (e: MouseEvent) => {
      const { x, y } = toBoard(e);
      return y >= 24 && y <= 120 && [W / 4 + 20, (W * 3) / 4 - 20].some((c) => Math.abs(x - c) <= 44);
    };
    const point = (e: PointerEvent) => {
      target = toBoard(e).y;
      canvas.style.cursor = onScore(e) ? "pointer" : "default";
    };
    const onDown = (e: PointerEvent) => {
      if (onScore(e)) return;
      point(e);
      start();
    };
    const onClick = (e: MouseEvent) => {
      if (onScore(e)) window.location.assign(EGG);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "w", "s"].includes(k)) {
        e.preventDefault();
        keys.add(k);
      } else if (k === " ") {
        e.preventDefault();
        start();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
    const onBlur = () => keys.clear();

    window.addEventListener("pointermove", point);
    window.addEventListener("pointerdown", onDown);
    canvas.addEventListener("click", onClick);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    let frame = 0, last = performance.now(), acc = 0;
    const loop = (now: number) => {
      acc += Math.min(100, now - last); // don't fast-forward after a hidden tab
      last = now;
      while (acc >= STEP) { update(); acc -= STEP; }
      draw();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", point);
      window.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      void audio?.close();
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 40, background: CREAM,
        display: "flex", alignItems: "center", justifyContent: "center",
        touchAction: "none", userSelect: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        aria-label="Pong. Move your paddle with the mouse, touch, arrow keys or W and S."
        style={{ width: "min(100vw, calc(100dvh * 4 / 3))", aspectRatio: "4 / 3" }}
      />
    </div>
  );
}
