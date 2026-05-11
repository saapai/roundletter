/**
 * Steered inference client — routes debate agent calls through the
 * Python SAE sidecar for Contrastive Activation Addition (CAA) steering.
 *
 * When the sidecar is running (localhost:8787), agents get genuinely
 * different internal computations instead of the same model with
 * different prompts. When the sidecar is down, falls back to Ollama.
 */

import type { AgentId } from "./agent-debate";

const SIDECAR_BASE = process.env.SIDECAR_URL ?? "http://localhost:8787";

type SidecarMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type SteeredChatResponse = {
  content: string;
  agent_id: string;
  alpha_used: number;
  steering_active: boolean;
  generation_time_ms: number;
  tokens_generated: number;
};

type SidecarHealth = {
  status: string;
  model: string;
  steering_vectors: string[];
  steering_layer: number;
  device: string;
};

let _sidecarAvailable: boolean | null = null;
let _lastHealthCheck = 0;

/**
 * Check if the sidecar is running. Caches result for 60 seconds.
 */
export async function isSidecarAvailable(): Promise<boolean> {
  const now = Date.now();
  if (_sidecarAvailable !== null && now - _lastHealthCheck < 60_000) {
    return _sidecarAvailable;
  }

  try {
    const res = await fetch(`${SIDECAR_BASE}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = (await res.json()) as SidecarHealth;
      _sidecarAvailable = data.status === "ok" && data.steering_vectors.length > 0;
      console.log(
        `[steered] sidecar: ${_sidecarAvailable ? "ACTIVE" : "NO VECTORS"} (${data.model}, ${data.steering_vectors.length} vectors, layer ${data.steering_layer})`,
      );
    } else {
      _sidecarAvailable = false;
    }
  } catch {
    _sidecarAvailable = false;
  }
  _lastHealthCheck = now;
  return _sidecarAvailable;
}

/**
 * Run steered inference through the sidecar.
 * Returns the generated text with the agent's steering vector applied.
 */
export async function steeredChat(opts: {
  agentId: AgentId | "moderator";
  system: string;
  userContent: string;
  alpha?: number;
  maxTokens?: number;
  temperature?: number;
}): Promise<{ content: string; steered: boolean; generationMs: number }> {
  const messages: SidecarMessage[] = [
    { role: "system", content: opts.system },
    { role: "user", content: opts.userContent },
  ];

  // 10 minute timeout (same as Ollama)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 600_000);

  try {
    const res = await fetch(`${SIDECAR_BASE}/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        agent_id: opts.agentId,
        alpha: opts.alpha,
        max_tokens: opts.maxTokens ?? 2048,
        temperature: opts.temperature ?? 0.7,
        top_p: 0.9,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Sidecar error ${res.status}: ${text}`);
    }

    const data = (await res.json()) as SteeredChatResponse;
    return {
      content: data.content,
      steered: data.steering_active,
      generationMs: data.generation_time_ms,
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Get info about available steering vectors and their default alphas.
 */
export async function getSteeredVectors(): Promise<
  Record<string, { norm: number; shape: number[]; default_alpha: number }>
> {
  const res = await fetch(`${SIDECAR_BASE}/vectors`);
  if (!res.ok) throw new Error(`Failed to get vectors: ${res.status}`);
  return res.json();
}
