"use server";
import { redirect } from "next/navigation";
import { signToken } from "./token";

const PASSWORD = "quinnanish";

function levenshtein(a: string, b: string): number {
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const m: number[][] = Array.from({ length: b.length + 1 }, () =>
    new Array(a.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) m[0][i] = i;
  for (let j = 0; j <= b.length; j++) m[j][0] = j;
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      m[j][i] = Math.min(m[j - 1][i] + 1, m[j][i - 1] + 1, m[j - 1][i - 1] + cost);
    }
  }
  return m[b.length][a.length];
}

function classify(raw: string): string {
  const pw = raw.trim().toLowerCase();
  if (!pw) return "empty";
  if (pw === PASSWORD) return "correct";

  // Other gates' passwords
  if (["polymarket", "medicine"].includes(pw)) return "wrongdoor";

  const hasQuinn = pw.includes("quinn");
  const hasAnish = pw.includes("anish");
  if (hasQuinn && hasAnish) return "typo"; // both halves, typo somewhere
  if (hasQuinn || hasAnish) return "half";  // one half

  const d = levenshtein(pw, PASSWORD);
  if (d <= 2) return "close";
  if (d <= 4) return "warm";

  return "cold";
}

export async function verifyPitchPassword(formData: FormData) {
  const raw = (formData.get("password") ?? "").toString();
  const result = classify(raw);
  if (result === "correct") {
    redirect(`/pitch?k=${encodeURIComponent(signToken())}`);
  }
  // Include a nonce so the URL is always new → browser always re-renders
  redirect(`/pitch?e=${result}&t=${Date.now()}`);
}

export async function logoutPitch() {
  redirect("/pitch");
}
