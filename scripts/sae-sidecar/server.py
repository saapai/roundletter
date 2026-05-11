"""
SAE Sidecar Server — Steered inference for debate agents.

Loads Qwen3-8B with pre-computed CAA steering vectors and serves
steered completions via HTTP. The TypeScript debate system calls this
instead of Ollama when feature steering is enabled.

Usage: python server.py [--model Qwen/Qwen3-8B] [--port 8787]
"""

import argparse
import json
import os
import time
import torch
import numpy as np
from pathlib import Path
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM

SCRIPT_DIR = Path(__file__).parent
VECTORS_DIR = SCRIPT_DIR / "steering_vectors"

# ── Global state ─────────────────────────────────────────────────────────

MODEL = None
TOKENIZER = None
STEERING_VECTORS: dict[str, torch.Tensor] = {}
STEERING_LAYER: int = 24
HOOKS: list = []
DEVICE = "mps"

# ── Default alpha (steering strength) per agent ──────────────────────────
# Positive alpha = steer TOWARD the agent's perspective
# Higher alpha = stronger effect (but can degrade coherence above ~3.0)

DEFAULT_ALPHAS = {
    "bull": 1.5,
    "bear": 1.5,
    "macro": 1.2,
    "flow": 1.0,
    "historian": 1.2,
    "moderator": 0.0,  # no steering for moderator
}


# ── Steering hook ────────────────────────────────────────────────────────

class SteeringHook:
    """Hook that modifies residual stream activations during forward pass."""

    def __init__(self):
        self.steering_vector: Optional[torch.Tensor] = None
        self.alpha: float = 0.0
        self.handle = None

    def set(self, vector: torch.Tensor, alpha: float):
        self.steering_vector = vector
        self.alpha = alpha

    def clear(self):
        self.steering_vector = None
        self.alpha = 0.0

    def __call__(self, module, input, output):
        if self.steering_vector is None or self.alpha == 0.0:
            return output
        # output is a tuple: (hidden_states, ...) for transformer layers
        hidden_states = output[0] if isinstance(output, tuple) else output
        # Add steering vector to all token positions
        hidden_states = hidden_states + self.alpha * self.steering_vector.to(hidden_states.device, hidden_states.dtype)
        if isinstance(output, tuple):
            return (hidden_states,) + output[1:]
        return hidden_states


# ── Model loading ────────────────────────────────────────────────────────

def load_model(model_id: str, device: str, dtype: torch.dtype):
    global MODEL, TOKENIZER, STEERING_VECTORS, STEERING_LAYER, HOOKS, DEVICE
    DEVICE = device

    print(f"Loading tokenizer: {model_id}")
    TOKENIZER = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)

    print(f"Loading model: {model_id} (dtype={dtype}, device={device})")
    MODEL = AutoModelForCausalLM.from_pretrained(
        model_id,
        torch_dtype=dtype,
        device_map=device if device != "mps" else None,
        trust_remote_code=True,
    )
    if device == "mps":
        MODEL = MODEL.to("mps")
    MODEL.eval()

    num_layers = MODEL.config.num_hidden_layers
    print(f"Model loaded: {num_layers} layers, hidden_dim={MODEL.config.hidden_size}")

    # Load steering vectors
    meta_path = VECTORS_DIR / "metadata.json"
    if meta_path.exists():
        with open(meta_path) as f:
            meta = json.load(f)
        STEERING_LAYER = meta.get("layer", 24)
        for agent_id, info in meta.get("agents", {}).items():
            vec_path = VECTORS_DIR / info["file"]
            if vec_path.exists():
                vec_np = np.load(vec_path)
                STEERING_VECTORS[agent_id] = torch.from_numpy(vec_np)
                print(f"  Loaded steering vector: {agent_id} (norm={info['norm']:.4f})")
        print(f"  Steering layer: {STEERING_LAYER}")
    else:
        print("  WARNING: No steering vectors found. Run compute_steering.py first.")

    # Install hook on the target layer
    # Access the transformer layer — architecture-dependent
    layers = None
    if hasattr(MODEL, "model") and hasattr(MODEL.model, "layers"):
        layers = MODEL.model.layers  # Qwen, Llama, Mistral
    elif hasattr(MODEL, "transformer") and hasattr(MODEL.transformer, "h"):
        layers = MODEL.transformer.h  # GPT-2 style

    if layers and STEERING_LAYER < len(layers):
        hook = SteeringHook()
        handle = layers[STEERING_LAYER].register_forward_hook(hook)
        hook.handle = handle
        HOOKS.append(hook)
        print(f"  Steering hook installed at layer {STEERING_LAYER}")
    else:
        print(f"  WARNING: Could not install hook at layer {STEERING_LAYER}")


# ── API models ───────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str  # system, user, assistant
    content: str

class SteeredChatRequest(BaseModel):
    messages: list[ChatMessage]
    agent_id: str = "moderator"  # which agent's steering vector to apply
    alpha: Optional[float] = None  # override default alpha
    max_tokens: int = 2048
    temperature: float = 0.7
    top_p: float = 0.9

class SteeredChatResponse(BaseModel):
    content: str
    agent_id: str
    alpha_used: float
    steering_active: bool
    generation_time_ms: float
    tokens_generated: int

class HealthResponse(BaseModel):
    status: str
    model: str
    steering_vectors: list[str]
    steering_layer: int
    device: str


# ── FastAPI app ──────────────────────────────────────────────────────────

def create_app(model_id: str, device: str, dtype: torch.dtype) -> FastAPI:

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        load_model(model_id, device, dtype)
        yield
        # Cleanup hooks
        for hook in HOOKS:
            if hook.handle:
                hook.handle.remove()

    app = FastAPI(title="SAE Sidecar", lifespan=lifespan)

    @app.get("/health")
    async def health() -> HealthResponse:
        return HealthResponse(
            status="ok",
            model=model_id,
            steering_vectors=list(STEERING_VECTORS.keys()),
            steering_layer=STEERING_LAYER,
            device=DEVICE,
        )

    @app.post("/v1/chat")
    async def steered_chat(req: SteeredChatRequest) -> SteeredChatResponse:
        if MODEL is None or TOKENIZER is None:
            raise RuntimeError("Model not loaded")

        # Set up steering
        alpha = req.alpha if req.alpha is not None else DEFAULT_ALPHAS.get(req.agent_id, 0.0)
        steering_active = False

        if HOOKS and req.agent_id in STEERING_VECTORS and alpha != 0.0:
            HOOKS[0].set(STEERING_VECTORS[req.agent_id], alpha)
            steering_active = True
        elif HOOKS:
            HOOKS[0].clear()

        # Build prompt from messages
        # Use the chat template if available, otherwise manual formatting
        try:
            prompt_text = TOKENIZER.apply_chat_template(
                [{"role": m.role, "content": m.content} for m in req.messages],
                tokenize=False,
                add_generation_prompt=True,
            )
        except Exception:
            # Fallback: manual format
            parts = []
            for m in req.messages:
                if m.role == "system":
                    parts.append(f"<|im_start|>system\n{m.content}<|im_end|>")
                elif m.role == "user":
                    parts.append(f"<|im_start|>user\n{m.content}<|im_end|>")
                elif m.role == "assistant":
                    parts.append(f"<|im_start|>assistant\n{m.content}<|im_end|>")
            parts.append("<|im_start|>assistant\n")
            prompt_text = "\n".join(parts)

        inputs = TOKENIZER(prompt_text, return_tensors="pt", truncation=True, max_length=4096)
        inputs = {k: v.to(DEVICE) for k, v in inputs.items()}
        input_len = inputs["input_ids"].shape[1]

        # Generate
        t0 = time.time()
        with torch.no_grad():
            outputs = MODEL.generate(
                **inputs,
                max_new_tokens=req.max_tokens,
                temperature=req.temperature,
                top_p=req.top_p,
                do_sample=True,
                pad_token_id=TOKENIZER.eos_token_id,
            )
        t1 = time.time()

        # Decode only the new tokens
        new_tokens = outputs[0][input_len:]
        content = TOKENIZER.decode(new_tokens, skip_special_tokens=True)

        # Clear steering after generation
        if HOOKS:
            HOOKS[0].clear()

        return SteeredChatResponse(
            content=content,
            agent_id=req.agent_id,
            alpha_used=alpha,
            steering_active=steering_active,
            generation_time_ms=(t1 - t0) * 1000,
            tokens_generated=len(new_tokens),
        )

    @app.get("/vectors")
    async def list_vectors():
        return {
            agent_id: {
                "norm": float(vec.norm().item()),
                "shape": list(vec.shape),
                "default_alpha": DEFAULT_ALPHAS.get(agent_id, 0.0),
            }
            for agent_id, vec in STEERING_VECTORS.items()
        }

    return app


# ── Main ─────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="SAE Sidecar Server")
    parser.add_argument("--model", default="Qwen/Qwen3-8B", help="HuggingFace model ID")
    parser.add_argument("--port", type=int, default=8787, help="Server port")
    parser.add_argument("--device", default="mps", help="Device: mps, cpu, cuda")
    parser.add_argument("--dtype", default="float16", choices=["float16", "bfloat16", "float32"])
    args = parser.parse_args()

    dtype_map = {"float16": torch.float16, "bfloat16": torch.bfloat16, "float32": torch.float32}
    dtype = dtype_map[args.dtype]

    app = create_app(args.model, args.device, dtype)

    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=args.port)


if __name__ == "__main__":
    main()
