"""
Quick test: verify steering vectors produce genuinely different outputs.

Sends the same prompt through all 5 agent steering vectors and compares
the outputs. If steering works, you should see meaningfully different
predictions and reasoning — not the same 4-1 split.

Usage: python test_steering.py [--url http://localhost:8787]
"""

import argparse
import json
import requests
import sys


def test_steering(base_url: str):
    # Check health
    try:
        health = requests.get(f"{base_url}/health", timeout=5).json()
        print(f"Sidecar status: {health['status']}")
        print(f"Model: {health['model']}")
        print(f"Vectors: {health['steering_vectors']}")
        print(f"Layer: {health['steering_layer']}")
    except Exception as e:
        print(f"ERROR: Sidecar not reachable at {base_url}: {e}")
        sys.exit(1)

    # Same prompt for all agents
    system = "You are a stock analyst. Respond with JSON: {\"prediction\": \"up\"/\"down\"/\"flat\", \"confidence\": 0.0-1.0, \"reasoning\": \"your reasoning\"}"
    user = """IONQ reported 755% revenue growth but posted a wider loss than expected.
The stock sold off 5% after hours. Quantum computing conference season starts in June.
Morgan Stanley raised their price target to $47.

Should you buy, hold, or sell IONQ at $47.81?

Respond with ONLY valid JSON: {"prediction": "up"/"down"/"flat", "confidence": 0.0-1.0, "reasoning": "2-3 sentences"}"""

    agents = ["bull", "bear", "macro", "flow", "historian"]
    results = {}

    for agent_id in agents:
        print(f"\n{'='*60}")
        print(f"Agent: {agent_id.upper()}")
        print(f"{'='*60}")

        try:
            resp = requests.post(
                f"{base_url}/v1/chat",
                json={
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": user},
                    ],
                    "agent_id": agent_id,
                    "max_tokens": 512,
                    "temperature": 0.7,
                },
                timeout=300,
            )
            data = resp.json()
            print(f"Steered: {data['steering_active']} (alpha={data['alpha_used']})")
            print(f"Time: {data['generation_time_ms']:.0f}ms ({data['tokens_generated']} tokens)")
            print(f"Response:\n{data['content'][:500]}")
            results[agent_id] = data
        except Exception as e:
            print(f"ERROR: {e}")
            results[agent_id] = None

    # Summary
    print(f"\n{'='*60}")
    print("DIVERSITY SUMMARY")
    print(f"{'='*60}")

    predictions = {}
    for agent_id, data in results.items():
        if data:
            content = data["content"]
            # Try to extract prediction from JSON
            try:
                start = content.index("{")
                end = content.rindex("}") + 1
                parsed = json.loads(content[start:end])
                pred = parsed.get("prediction", "unknown")
                conf = parsed.get("confidence", "?")
                predictions[agent_id] = (pred, conf)
                print(f"  {agent_id:10s}: {pred:5s} @ {conf}")
            except Exception:
                predictions[agent_id] = ("parse_error", "?")
                print(f"  {agent_id:10s}: [parse error]")

    # Check diversity
    pred_values = [p for p, _ in predictions.values() if p not in ("unknown", "parse_error")]
    unique = set(pred_values)
    if len(unique) == 1:
        print(f"\nWARNING: All agents predicted '{pred_values[0]}' — steering may not be strong enough.")
        print("Try increasing alpha values in server.py DEFAULT_ALPHAS.")
    elif len(unique) >= 3:
        print(f"\nGENUINE DIVERSITY: {len(unique)} distinct predictions!")
    else:
        print(f"\nPARTIAL DIVERSITY: {len(unique)} distinct predictions ({unique})")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://localhost:8787")
    args = parser.parse_args()
    test_steering(args.url)
