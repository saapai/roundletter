// Local multi-model inference adapter for Ollama
// Replaces @anthropic-ai/sdk calls with local LLM inference
// Supports model arbitrage: run same prompt on multiple models, pick best output

import { z, type ZodType } from "zod";

export type ModelId =
  | "qwen3:72b"
  | "qwen3:32b"
  | "qwen3:14b"
  | "llama3.3:70b"
  | "deepseek-r1:70b"
  | "mistral-large:123b"
  | "gemma3:27b"
  | "phi4:14b";

export type InferenceProvider = "ollama" | "anthropic";

type OllamaGenerateResponse = {
  model: string;
  response: string;
  done: boolean;
  total_duration?: number;
  eval_count?: number;
};

type OllamaChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OllamaChatResponse = {
  model: string;
  message: { role: string; content: string };
  done: boolean;
  total_duration?: number;
  eval_count?: number;
};

const OLLAMA_BASE = process.env.OLLAMA_HOST ?? "http://localhost:11434";

// ── Core Ollama client ────────────────────────────────────────────────────

async function ollamaChat(
  model: string,
  messages: OllamaChatMessage[],
  opts: {
    format?: "json" | object;
    temperature?: number;
    maxTokens?: number;
    top_p?: number;
    top_k?: number;
    min_p?: number;
    repeat_penalty?: number;
  } = {},
): Promise<string> {
  const body: Record<string, unknown> = {
    model,
    messages,
    stream: false,
    options: {
      temperature: opts.temperature ?? 0.7,
      num_predict: opts.maxTokens ?? 2048,
      ...(opts.top_p !== undefined && { top_p: opts.top_p }),
      ...(opts.top_k !== undefined && { top_k: opts.top_k }),
      ...(opts.min_p !== undefined && { min_p: opts.min_p }),
      ...(opts.repeat_penalty !== undefined && { repeat_penalty: opts.repeat_penalty }),
    },
  };

  // Note: Ollama's format:"json" causes empty {} with some models (qwen3).
  // Instead, we rely on prompt engineering + extractJson() to parse output.
  // Only enable format:"json" for models known to support it well.
  // if (opts.format) { body.format = opts.format; }

  // 10 minute timeout — qwen3:32b with complex prompts can take 3-5 min per inference
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 600_000);

  let res: Response;
  try {
    res = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama ${model} error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as OllamaChatResponse;
  return data.message.content;
}

// ── Structured output with Zod validation ─────────────────────────────────

export async function localParse<T>(opts: {
  model: ModelId;
  system: string;
  userContent: string;
  schema: ZodType<T>;
  maxTokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  min_p?: number;
  repeat_penalty?: number;
  retries?: number;
}): Promise<{ parsed: T; raw: string; model: string }> {
  const maxRetries = opts.retries ?? 3;

  // Build a JSON schema description for the model
  const schemaDesc = zodToPromptDescription(opts.schema);

  const messages: OllamaChatMessage[] = [
    { role: "system", content: opts.system },
    {
      role: "user",
      content: [
        "/no_think",  // Disable qwen3 thinking mode for structured output
        "",
        opts.userContent,
        "",
        "CRITICAL: You MUST respond with ONLY a JSON object using EXACTLY these field names:",
        schemaDesc,
        "",
        "Use EXACTLY these field names. Do NOT use different names. Do NOT add extra fields.",
        "Output ONLY the JSON object — no text before or after it.",
      ].join("\n"),
    },
  ];

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const raw = await ollamaChat(opts.model, messages, {
        temperature: opts.temperature ?? 0.6,
        maxTokens: opts.maxTokens ?? 2048,
        top_p: opts.top_p,
        top_k: opts.top_k,
        min_p: opts.min_p,
        repeat_penalty: opts.repeat_penalty,
      });

      // Extract JSON from response (models sometimes wrap in code fences)
      const jsonStr = extractJson(raw);
      if (process.env.DEBUG_LLM) {
        console.log(`[${opts.model}] raw response (first 500 chars):`, raw.slice(0, 500));
        console.log(`[${opts.model}] extracted JSON:`, jsonStr.slice(0, 300));
      }
      const parsed = JSON.parse(jsonStr);
      const validated = opts.schema.parse(parsed) as T;

      return { parsed: validated, raw: jsonStr, model: opts.model };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`[${opts.model}] attempt ${attempt + 1}/${maxRetries} failed: ${msg}`);
      if (attempt === maxRetries - 1) {
        throw new Error(`[${opts.model}] all ${maxRetries} attempts failed. Last error: ${msg}`);
      }
    }
  }
  throw new Error("unreachable");
}

// ── Multi-model arbitrage ─────────────────────────────────────────────────
// Run the same prompt on N models, validate all outputs, pick the best one
// based on confidence score + schema compliance + response quality

export type ArbitrageResult<T> = {
  winner: { parsed: T; model: string; score: number };
  all: Array<{ parsed: T; model: string; score: number; raw: string }>;
  method: "confidence" | "consensus" | "first_valid";
};

export async function arbitrageInference<T extends { confidence?: number }>(opts: {
  models: ModelId[];
  system: string;
  userContent: string;
  schema: ZodType<T>;
  maxTokens?: number;
  strategy?: "highest_confidence" | "consensus" | "fastest";
}): Promise<ArbitrageResult<T>> {
  const strategy = opts.strategy ?? "highest_confidence";

  // Run all models in parallel
  const results = await Promise.allSettled(
    opts.models.map((model) =>
      localParse({
        model,
        system: opts.system,
        userContent: opts.userContent,
        schema: opts.schema,
        maxTokens: opts.maxTokens,
      }),
    ),
  );

  const valid: Array<{ parsed: T; model: string; score: number; raw: string }> = [];

  for (const r of results) {
    if (r.status === "fulfilled") {
      const { parsed, model, raw } = r.value;
      // Score based on confidence field if present, else default to 0.5
      const confidence = (parsed as any).confidence ?? 0.5;
      // Bonus for longer, more detailed warrants
      const detailBonus = Math.min(0.2, (raw.length / 2000) * 0.1);
      valid.push({ parsed, model, score: confidence + detailBonus, raw });
    }
  }

  if (valid.length === 0) {
    throw new Error(`All ${opts.models.length} models failed to produce valid output`);
  }

  let winner: (typeof valid)[0];

  switch (strategy) {
    case "highest_confidence":
      winner = valid.reduce((a, b) => (a.score > b.score ? a : b));
      break;
    case "consensus": {
      // Group by prediction field if present, pick the majority
      const predictions = valid.map((v) => (v.parsed as any).prediction).filter(Boolean);
      const counts = predictions.reduce(
        (acc, p) => ({ ...acc, [p]: (acc[p] ?? 0) + 1 }),
        {} as Record<string, number>,
      );
      const majorityPred = Object.entries(counts).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0];
      winner =
        valid.find((v) => (v.parsed as any).prediction === majorityPred) ?? valid[0];
      break;
    }
    case "fastest":
    default:
      winner = valid[0];
  }

  return {
    winner: { parsed: winner.parsed, model: winner.model, score: winner.score },
    all: valid,
    method: strategy === "consensus" ? "consensus" : strategy === "highest_confidence" ? "confidence" : "first_valid",
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────

function extractJson(raw: string): string {
  let text = raw.trim();

  // Strip qwen3 <think>...</think> blocks
  text = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

  // Try raw first
  if (text.startsWith("{") || text.startsWith("[")) return text;

  // Extract from code fences
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) return fenceMatch[1].trim();

  // Find first { to last }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) return text.slice(start, end + 1);

  return text;
}

function zodToPromptDescription(schema: ZodType<unknown>): string {
  // Generate a human-readable schema description with example values
  try {
    const def = (schema as any)._zod ?? (schema as any)._def;
    if (!def) return JSON.stringify({ note: "match the expected JSON structure" });
    const desc = describeZodShape(schema, 0);
    // Also generate an example object to make it crystal clear
    const example = generateExample(schema);
    return `${desc}\n\nExample (use this EXACT format):\n${example}`;
  } catch {
    return "{ /* match the expected JSON structure */ }";
  }
}

function generateExample(schema: ZodType<unknown>): string {
  try {
    const shape = (schema as any).shape ?? (schema as any)._zod?.def?.shape ?? {};
    const obj: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(shape)) {
      const fieldDef = (val as any)._zod ?? (val as any)._def;
      const fieldType = fieldDef?.typeName ?? fieldDef?.def?.type ?? "";
      if (fieldType === "ZodEnum" || fieldType === "enum") {
        const values = fieldDef?.entries ?? fieldDef?.values ?? [];
        obj[key] = values[0] ?? "value";
      } else if (fieldType === "ZodNumber" || fieldType === "number") {
        obj[key] = 0.5;
      } else if (fieldType === "ZodString" || fieldType === "string") {
        obj[key] = `your ${key} here`;
      } else if (fieldType === "ZodOptional" || fieldType === "optional") {
        obj[key] = `optional ${key}`;
      } else {
        obj[key] = `value`;
      }
    }
    return JSON.stringify(obj, null, 2);
  } catch {
    return "{}";
  }
}

function describeZodShape(schema: ZodType<unknown>, depth: number): string {
  const indent = "  ".repeat(depth);
  const def = (schema as any)._zod ?? (schema as any)._def;
  if (!def) return `${indent}unknown`;

  const typeName = def.typeName ?? def.def?.type ?? "";

  if (typeName === "ZodObject" || typeName === "object") {
    const shape = (schema as any).shape ?? (schema as any)._zod?.def?.shape ?? {};
    const entries = Object.entries(shape);
    if (entries.length === 0) return "{}";
    const fields = entries.map(([key, val]) => {
      const fieldSchema = val as ZodType<unknown>;
      const desc = (fieldSchema as any).description ?? (fieldSchema as any)._zod?.def?.description ?? "";
      const fieldDef = (fieldSchema as any)._zod ?? (fieldSchema as any)._def;
      const fieldType = fieldDef?.typeName ?? fieldDef?.def?.type ?? "any";

      if (fieldType === "ZodEnum" || fieldType === "enum") {
        const values = (fieldSchema as any)._zod?.def?.entries ?? (fieldSchema as any)._def?.values ?? [];
        return `${indent}  "${key}": one of [${values.map((v: string) => `"${v}"`).join(", ")}]${desc ? ` // ${desc}` : ""}`;
      }
      if (fieldType === "ZodNumber" || fieldType === "number") {
        return `${indent}  "${key}": number${desc ? ` // ${desc}` : ""}`;
      }
      if (fieldType === "ZodString" || fieldType === "string") {
        return `${indent}  "${key}": string${desc ? ` // ${desc}` : ""}`;
      }
      if (fieldType === "ZodOptional" || fieldType === "optional") {
        return `${indent}  "${key}": string (optional)${desc ? ` // ${desc}` : ""}`;
      }
      return `${indent}  "${key}": ${fieldType}${desc ? ` // ${desc}` : ""}`;
    });
    return `{\n${fields.join(",\n")}\n${indent}}`;
  }

  return `${typeName}`;
}

// ── Model management ──────────────────────────────────────────────────────

export async function listModels(): Promise<string[]> {
  const res = await fetch(`${OLLAMA_BASE}/api/tags`);
  if (!res.ok) throw new Error(`Failed to list models: ${res.status}`);
  const data = (await res.json()) as { models: Array<{ name: string }> };
  return data.models.map((m) => m.name);
}

export async function isModelAvailable(model: string): Promise<boolean> {
  try {
    const models = await listModels();
    return models.some((m) => m.startsWith(model.split(":")[0]));
  } catch {
    return false;
  }
}

export async function pullModel(model: string): Promise<void> {
  console.log(`Pulling ${model}...`);
  const res = await fetch(`${OLLAMA_BASE}/api/pull`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: model, stream: false }),
  });
  if (!res.ok) throw new Error(`Failed to pull ${model}: ${res.status}`);
  console.log(`${model} ready`);
}
