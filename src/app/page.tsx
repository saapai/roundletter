"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

/* PONG (Atari, 1972). Left paddle is you, right is the machine. First to 11.
   The previous homepage lives at /classic. */

const W = 800, H = 600;
const PADDLE_W = 12, PADDLE_H = 80, BALL = 12;
const LEFT_X = 40, RIGHT_X = W - 40 - PADDLE_W;
const WIN = 11;
const PLAYER_SPEED = 8, CPU_SPEED = 5;
const SERVE_SPEED = 6, MAX_SPEED = 14;
const STEP = 1000 / 60;

// 3×5 blocky score digits
const DIGITS = [
  "111101101101111", "010110010010111", "111001111100111", "111001111001111", "101101111001001",
  "111100111001111", "111100111101111", "111001001001001", "111101111101111", "111101111001111",
];

export default function Pong() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let mode: "title" | "play" | "over" = "title";
    let player = (H - PADDLE_H) / 2, cpu = player;
    let score = [0, 0];
    const ball = { x: 0, y: 0, vx: 0, vy: 0 };
    let wait = 0, cpuAim = 0;
    let target: number | null = null; // mouse / touch destination
    const keys = new Set<string>();
    let audio: AudioContext | null = null;

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

    const serve = (dir: number) => {
      ball.x = (W - BALL) / 2;
      ball.y = H * (0.25 + Math.random() * 0.5);
      ball.vx = SERVE_SPEED * dir;
      ball.vy = (Math.random() * 2 - 1) * 4;
      cpuAim = (Math.random() - 0.5) * PADDLE_H;
      wait = 50;
    };

    const start = () => {
      audio ??= new AudioContext();
      void audio.resume();
      if (mode === "play") return;
      score = [0, 0];
      mode = "play";
      serve(Math.random() < 0.5 ? -1 : 1);
    };

    const clamp = (v: number) => Math.max(0, Math.min(H - PADDLE_H, v));

    // Where the ball strikes the paddle sets the return angle.
    const bounce = (paddleY: number, dir: number) => {
      const hit = (ball.y + BALL / 2 - (paddleY + PADDLE_H / 2)) / ((PADDLE_H + BALL) / 2);
      const speed = Math.min(MAX_SPEED, Math.hypot(ball.vx, ball.vy) + 0.45);
      const angle = hit * (Math.PI / 3.2);
      ball.vx = Math.cos(angle) * speed * dir;
      ball.vy = Math.sin(angle) * speed;
      cpuAim = (Math.random() - 0.5) * PADDLE_H * 1.15;
      beep(460, 60);
    };

    const update = () => {
      const up = keys.has("arrowup") || keys.has("w");
      const down = keys.has("arrowdown") || keys.has("s");
      if (up || down) {
        target = null;
        player = clamp(player + (Number(down) - Number(up)) * PLAYER_SPEED);
      } else if (target !== null) {
        player = clamp(target - PADDLE_H / 2);
      }
      if (mode !== "play") return;

      const goal = ball.vx > 0 ? ball.y + BALL / 2 + cpuAim : H / 2;
      const delta = goal - (cpu + PADDLE_H / 2);
      cpu = clamp(cpu + Math.max(-CPU_SPEED, Math.min(CPU_SPEED, delta)));

      if (wait > 0) { wait--; return; }

      const prevX = ball.x;
      ball.x += ball.vx;
      ball.y += ball.vy;
      if (ball.y <= 0 || ball.y >= H - BALL) {
        ball.y = Math.max(0, Math.min(H - BALL, ball.y));
        ball.vy *= -1;
        beep(230, 40);
      }

      const overlaps = (p: number) => ball.y + BALL >= p && ball.y <= p + PADDLE_H;
      if (ball.vx < 0 && prevX >= LEFT_X + PADDLE_W && ball.x <= LEFT_X + PADDLE_W && overlaps(player)) {
        ball.x = LEFT_X + PADDLE_W;
        bounce(player, 1);
      } else if (ball.vx > 0 && prevX + BALL <= RIGHT_X && ball.x + BALL >= RIGHT_X && overlaps(cpu)) {
        ball.x = RIGHT_X - BALL;
        bounce(cpu, -1);
      }

      if (ball.x < -BALL || ball.x > W) {
        const scorer = ball.x > W ? 0 : 1;
        score[scorer]++;
        beep(110, 250);
        if (score[scorer] >= WIN) mode = "over";
        else serve(scorer === 0 ? 1 : -1);
      }
    };

    const digit = (n: number, x: number, y: number) => {
      [...DIGITS[n]].forEach((on, i) => {
        if (on === "1") ctx.fillRect(x + (i % 3) * 14, y + Math.floor(i / 3) * 14, 14, 14);
      });
    };

    const number = (n: number, center: number) => {
      const chars = String(n).split("");
      const width = chars.length * 42 + (chars.length - 1) * 14;
      chars.forEach((c, i) => digit(Number(c), center - width / 2 + i * 56, 36));
    };

    const text = (s: string, y: number, size: number) => {
      ctx.font = `bold ${size}px ui-monospace, Menlo, monospace`;
      const width = ctx.measureText(s).width + 32;
      ctx.fillStyle = "#000";
      ctx.fillRect((W - width) / 2, y - size, width, size * 1.5);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText(s, W / 2, y);
    };

    const draw = () => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#fff";
      for (let y = 6; y < H; y += 28) ctx.fillRect(W / 2 - 3, y, 6, 14);
      number(score[0], W / 4);
      number(score[1], (W * 3) / 4);
      ctx.fillRect(LEFT_X, player, PADDLE_W, PADDLE_H);
      ctx.fillRect(RIGHT_X, cpu, PADDLE_W, PADDLE_H);
      if (mode === "play") {
        ctx.fillRect(ball.x, ball.y, BALL, BALL);
        return;
      }
      if (mode === "title") {
        text("PONG", 240, 88);
      } else {
        text(score[0] > score[1] ? "YOU WIN" : "GAME OVER", 240, 64);
      }
      text("CLICK, TAP OR PRESS SPACE", 380, 26);
      text("MOUSE · TOUCH · ↑↓ · W S", 430, 20);
      text(`FIRST TO ${WIN}`, 468, 20);
    };

    const point = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      target = ((e.clientY - r.top) / r.height) * H;
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("a")) return;
      point(e);
      start();
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
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      void audio?.close();
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 40, background: "#000",
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
      <Link
        href="/classic"
        style={{
          position: "absolute", bottom: 12, right: 16, color: "#777",
          font: "11px ui-monospace, Menlo, monospace", letterSpacing: "0.15em",
        }}
      >
        AURELIEX →
      </Link>
    </div>
  );
}
