import { NextRequest, NextResponse } from "next/server";

/*  /api/hero/generate
 *
 *  Generates the homepage cover illustration via DALL-E 3 and commits
 *  the result to /public/hero/cover.jpg in the repo via the GitHub
 *  contents API.  Vercel detects the commit and redeploys, and the
 *  homepage's <picture> element picks up the new JPG automatically
 *  (falling back to /public/hero/cover.svg only if the JPG is missing).
 *
 *  Required environment variables:
 *    OPENAI_API_KEY          · OpenAI project key (rotate after exposure!)
 *    GITHUB_TOKEN            · fine-grained PAT with contents:write on the repo
 *    GITHUB_REPO             · "owner/repo" · e.g. "saapai/roundletter"
 *    HERO_GENERATE_SECRET    · shared secret · required in ?key=... or
 *                              Authorization: Bearer <secret>
 *
 *  Usage:
 *    GET /api/hero/generate?key=<HERO_GENERATE_SECRET>
 *    GET /api/hero/generate?key=<SECRET>&prompt=<optional override>
 *    POST /api/hero/generate with { prompt?: string } + auth header
 *
 *  Returns a JSON summary of what it did.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const DEFAULT_PROMPT =
  "A vast vertical megacity wall at sunset, with thousands of tiny illuminated amber windows stacked in dense irregular architecture. Cinematic perspective receding toward a vanishing point on the right. Warm golden glowing windows against a deep violet-to-orange sunset sky. Silhouetted dark mountain ridge on the horizon. Reflective dark water below with a vertical sun-reflection streak. Tiny silhouetted figures walking along a foreground pier for scale. Painterly digital illustration in the style of dense hand-drawn architectural illustrations, warm amber vs deep navy color contrast, painterly gradients, hand-drawn feel, no text, no logos.";

const FILE_PATH = "public/hero/cover.jpg";
const COMMIT_MESSAGE = "cover · regenerate via DALL-E 3 · auto";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`missing env var: ${name}`);
  return v;
}

function authorized(req: NextRequest): boolean {
  const expected = process.env.HERO_GENERATE_SECRET;
  if (!expected) return false; // no secret configured → deny all
  const qKey = req.nextUrl.searchParams.get("key");
  if (qKey && qKey === expected) return true;
  const header = req.headers.get("authorization");
  if (header && header === `Bearer ${expected}`) return true;
  return false;
}

async function generateImageUrl(prompt: string): Promise<{ url: string; revisedPrompt?: string }> {
  const key = requireEnv("OPENAI_API_KEY");
  const r = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1792x1024",
      quality: "hd",
      style: "vivid",
      response_format: "url",
    }),
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`OpenAI image generation failed: ${r.status} ${text.slice(0, 500)}`);
  }
  const j = (await r.json()) as { data?: Array<{ url?: string; revised_prompt?: string }> };
  const url = j.data?.[0]?.url;
  if (!url) throw new Error("OpenAI returned no image URL");
  return { url, revisedPrompt: j.data?.[0]?.revised_prompt };
}

async function downloadAsBase64(url: string): Promise<string> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`failed to download generated image: ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  return buf.toString("base64");
}

async function commitToRepo(base64Content: string): Promise<{ sha: string; committed: boolean }> {
  const token = requireEnv("GITHUB_TOKEN");
  const repo = requireEnv("GITHUB_REPO");
  const path = FILE_PATH;

  // Get existing file SHA (if present) so we can update vs create.
  let existingSha: string | undefined;
  try {
    const g = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (g.ok) {
      const j = (await g.json()) as { sha?: string };
      existingSha = j.sha;
    }
  } catch { /* first time, no prior file */ }

  const put = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: COMMIT_MESSAGE,
      content: base64Content,
      sha: existingSha,
    }),
  });
  if (!put.ok) {
    const text = await put.text();
    throw new Error(`GitHub commit failed: ${put.status} ${text.slice(0, 500)}`);
  }
  const result = (await put.json()) as { content?: { sha?: string } };
  return { sha: result.content?.sha ?? "", committed: true };
}

async function run(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let prompt = DEFAULT_PROMPT;
  const override = req.nextUrl.searchParams.get("prompt");
  if (override && override.length > 20) prompt = override;
  if (req.method === "POST") {
    try {
      const body = (await req.json()) as { prompt?: string };
      if (body.prompt && body.prompt.length > 20) prompt = body.prompt;
    } catch { /* no body or not JSON */ }
  }

  try {
    const { url: imageUrl, revisedPrompt } = await generateImageUrl(prompt);
    const b64 = await downloadAsBase64(imageUrl);
    const { sha } = await commitToRepo(b64);
    return NextResponse.json({
      ok: true,
      committed: true,
      path: FILE_PATH,
      sha,
      bytes: Math.round((b64.length * 3) / 4),
      revised_prompt: revisedPrompt,
      note: "cover committed to repo. Vercel will redeploy automatically; the homepage will pick up the new JPG within a few minutes.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) { return run(req); }
export async function POST(req: NextRequest) { return run(req); }
