import crypto from "node:crypto";

const SECRET = process.env.PITCH_SECRET || "aureliex-pitch-secret-v1-do-not-commit-real-ones";
export const TOKEN_TTL_MS = 10_000; // 10-second entry window — not a session

export function signToken(): string {
  const ts = Date.now().toString();
  const mac = crypto.createHmac("sha256", SECRET).update(ts).digest("hex").slice(0, 20);
  return `${ts}.${mac}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [ts, mac] = token.split(".");
  if (!ts || !mac) return false;
  const expected = crypto.createHmac("sha256", SECRET).update(ts).digest("hex").slice(0, 20);
  if (mac !== expected) return false;
  const age = Date.now() - parseInt(ts, 10);
  return age >= 0 && age < TOKEN_TTL_MS;
}
