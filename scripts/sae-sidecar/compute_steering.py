"""
Compute Contrastive Activation Addition (CAA) steering vectors for 5 debate agents.

Each agent gets a steering vector computed from contrastive prompt pairs.
The vectors are saved to disk and loaded by the server at startup.

Usage: python compute_steering.py [--model Qwen/Qwen3-8B] [--layer 24]
"""

import argparse
import json
import os
import torch
import numpy as np
from pathlib import Path
from transformers import AutoTokenizer, AutoModelForCausalLM

SCRIPT_DIR = Path(__file__).parent
VECTORS_DIR = SCRIPT_DIR / "steering_vectors"

# ── Contrastive prompt pairs per agent ───────────────────────────────────
# Each pair: (positive_direction, negative_direction)
# The steering vector = mean(positive_activations) - mean(negative_activations)

CONTRAST_PAIRS = {
    "bull": [
        ("This stock has incredible upside potential. The growth trajectory is accelerating, and the market is underpricing the optionality. Revenue is inflecting, margins are expanding, and the total addressable market is massive.",
         "This stock has severe downside risk. The growth narrative is failing, dilution is accelerating, and the market has already priced in the best case. Revenue is declining, losses are widening, and competition is intensifying."),
        ("The earnings beat expectations significantly. Management raised guidance. Institutional investors are accumulating. The technical breakout is confirmed with volume.",
         "The earnings missed expectations badly. Management lowered guidance. Institutional investors are selling. The technical breakdown is confirmed with heavy volume."),
        ("I'm highly confident this will go up. The risk/reward is overwhelmingly positive. Every indicator points to significant appreciation.",
         "I'm highly confident this will go down. The risk/reward is overwhelmingly negative. Every indicator points to significant depreciation."),
        ("The bull case is compelling. Strong momentum, improving fundamentals, positive sentiment, and favorable macro backdrop all align.",
         "The bear case is compelling. Weakening momentum, deteriorating fundamentals, negative sentiment, and unfavorable macro backdrop all align."),
        ("This is a generational buying opportunity. The market is wrong and will correct upward. First-mover advantage is real and the moat is widening.",
         "This is a textbook value trap. The market is efficient and the price reflects reality. There is no moat and competition will commoditize this."),
    ],
    "bear": [
        ("The risks are severe and underappreciated. Dilution will destroy shareholder value. The ATM shelf offering is a red flag. Cash burn rate implies another raise within 6 months.",
         "The risks are minimal and well-understood. Capital structure is strong. No dilution risk. Cash position provides years of runway."),
        ("Historical precedent shows 80% of pre-revenue companies in this sector fail within 5 years. The survivorship bias in the bull narrative is extreme.",
         "Historical precedent shows early movers in revolutionary technology often deliver 10x+ returns. The pessimism bias in the bear narrative misses paradigm shifts."),
        ("I see a high probability of a 30%+ drawdown in the next 90 days. The technical support levels are breaking down. Smart money is exiting.",
         "I see a high probability of a 30%+ gain in the next 90 days. The technical resistance levels are being tested with conviction. Smart money is accumulating."),
        ("The valuation is absurd. No amount of future growth justifies this price. The market is in a speculative mania for this sector.",
         "The valuation is reasonable given the growth trajectory. The market is efficiently pricing in the probability-weighted outcomes."),
        ("Management credibility is low. They have missed every target. Insider selling is accelerating. The business model is unproven.",
         "Management credibility is high. They have exceeded every target. Insiders are buying aggressively. The business model is validated."),
    ],
    "macro": [
        ("The macroeconomic regime dominates individual stock thesis. Interest rates, inflation expectations, and liquidity conditions determine 60%+ of equity returns. Focus on the 10-year yield and VIX before any micro analysis.",
         "Individual stock fundamentals dominate macro regime. Company-specific catalysts, competitive positioning, and management execution matter far more than interest rates or VIX levels."),
        ("The Fed's stance is the most important variable. Tightening financial conditions will compress multiples across the board. No stock is immune to macro headwinds.",
         "The Fed's stance is largely irrelevant for high-growth equities. Innovation-driven companies grow through rate cycles. Micro thesis trumps macro environment."),
        ("Geopolitical risk is elevated and being underpriced by markets. Energy prices, trade policy, and military conflict create systemic risk that no individual stock can escape.",
         "Geopolitical noise is overstated by media. Markets have always climbed a wall of worry. Individual company execution matters far more than headline risk."),
        ("Sector rotation is occurring. Capital is flowing from growth to value, from small-cap to large-cap. Position accordingly regardless of individual stock merit.",
         "Stock picking is more important than sector allocation. The best companies outperform regardless of sector rotation or macro trends."),
        ("The yield curve, credit spreads, and dollar index are flashing warning signals. The macro environment is deteriorating in ways that historically precede significant equity drawdowns.",
         "Leading economic indicators are improving. Consumer spending is resilient, corporate earnings are growing, and the labor market remains strong."),
    ],
    "flow": [
        ("The order flow tells the real story. Options positioning shows heavy call buying at the next strike. Dark pool prints indicate institutional accumulation. Volume patterns confirm the directional thesis.",
         "Fundamental analysis tells the real story. Order flow is noise that reverses daily. Dark pool prints are misleading. Volume patterns are coincidental."),
        ("Technical analysis provides the timing edge. RSI divergence, MACD crossover, and volume-weighted support levels all confirm the setup. The chart pattern is textbook.",
         "Technical analysis is astrology for traders. Past price patterns have no predictive power. Fundamental value creation drives long-term returns."),
        ("Short interest is elevated, creating squeeze potential. The borrow rate is spiking. Gamma positioning from market makers will amplify any move higher.",
         "Short interest reflects informed skepticism. The shorts are right more often than the crowd. High short interest is a warning signal, not a catalyst."),
        ("The tape is telling you something different from the narrative. Price action diverges from the consensus view. Trust the tape over the story.",
         "The narrative drives price action, not the other way around. Fundamental catalysts create the moves. Price is a lagging indicator of value creation."),
        ("Options implied volatility suggests a major move is imminent. The straddle is pricing in a +-15% move. Positioning accordingly with defined risk is optimal.",
         "Options implied volatility is overpriced as usual. Realized volatility consistently comes in below implied. Selling premium is the higher-EV trade."),
    ],
    "historian": [
        ("Base rates from prior technology waves matter enormously. The dot-com bubble, the fiber optic bust, the 3D printing hype cycle — each provides a template for what happens to overvalued pre-revenue companies.",
         "Historical analogies are misleading. Every technology wave is different. The internet in 1999 is not quantum computing in 2026. Drawing parallels creates false pattern matching."),
        ("Survivorship bias infects every bull case. For every Amazon, there were 100 Pets.coms. The base rate of pre-revenue companies reaching sustained profitability is below 15%.",
         "Focusing on failures creates pessimism bias. The winners in paradigm shifts generate returns that more than compensate for the losers. Venture-style portfolio construction works."),
        ("Mean reversion is the strongest force in financial markets. Extreme valuations always normalize over 3-5 year periods. Today's premium multiple will be tomorrow's average.",
         "Structural growth breaks mean reversion. Companies with genuine competitive advantages can sustain premium valuations for decades. The 'reversion' thesis misses structural winners."),
        ("The historical parallel to the current setup is the 2000 bubble peak. Speculative excess, retail enthusiasm, narrative-driven valuations, and momentum ignoring fundamentals.",
         "The historical parallel to the current setup is the early 1990s internet buildout. Genuine technological revolution, early infrastructure investment, and decades of growth ahead."),
        ("I assign a 70% probability to the bearish historical template applying here. Most speculative technology investments lose money when measured from the hype peak.",
         "I assign a 70% probability to the bullish historical template applying here. Revolutionary technologies reward early believers despite interim volatility."),
    ],
}


def get_hidden_states(model, tokenizer, text: str, target_layer: int, device: str) -> torch.Tensor:
    """Extract hidden states at a specific layer for the input text."""
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512).to(device)
    with torch.no_grad():
        outputs = model(**inputs, output_hidden_states=True)
    # hidden_states shape: (num_layers+1, batch, seq_len, hidden_dim)
    # +1 because index 0 is the embedding layer output
    hidden = outputs.hidden_states[target_layer + 1]  # +1 for embedding layer
    # Mean pool over sequence length to get a single vector
    return hidden.mean(dim=1).squeeze(0)  # shape: (hidden_dim,)


def compute_steering_vector(
    model, tokenizer, pairs: list[tuple[str, str]], target_layer: int, device: str
) -> torch.Tensor:
    """Compute a steering vector from contrastive pairs via CAA."""
    diffs = []
    for positive, negative in pairs:
        pos_hidden = get_hidden_states(model, tokenizer, positive, target_layer, device)
        neg_hidden = get_hidden_states(model, tokenizer, negative, target_layer, device)
        diffs.append(pos_hidden - neg_hidden)
    # Average the differences
    steering = torch.stack(diffs).mean(dim=0)
    # Normalize to unit length (strength controlled by alpha at inference time)
    steering = steering / steering.norm()
    return steering


def main():
    parser = argparse.ArgumentParser(description="Compute CAA steering vectors for debate agents")
    parser.add_argument("--model", default="Qwen/Qwen3-8B", help="HuggingFace model ID")
    parser.add_argument("--layer", type=int, default=24, help="Target layer for steering (default: 24, ~75%% depth for 32-layer model)")
    parser.add_argument("--device", default="mps", help="Device: mps (Apple Silicon), cpu, or cuda")
    parser.add_argument("--dtype", default="float16", help="Model dtype: float16, bfloat16, float32")
    args = parser.parse_args()

    dtype_map = {"float16": torch.float16, "bfloat16": torch.bfloat16, "float32": torch.float32}
    dtype = dtype_map.get(args.dtype, torch.float16)

    print(f"Loading model: {args.model} (dtype={args.dtype}, device={args.device})")
    tokenizer = AutoTokenizer.from_pretrained(args.model, trust_remote_code=True)
    model = AutoModelForCausalLM.from_pretrained(
        args.model,
        torch_dtype=dtype,
        device_map=args.device if args.device != "mps" else None,
        trust_remote_code=True,
    )
    if args.device == "mps":
        model = model.to("mps")

    num_layers = model.config.num_hidden_layers
    print(f"Model loaded: {num_layers} layers, hidden_dim={model.config.hidden_size}")

    if args.layer >= num_layers:
        print(f"Warning: layer {args.layer} >= num_layers {num_layers}, using layer {num_layers - 8}")
        args.layer = num_layers - 8

    VECTORS_DIR.mkdir(exist_ok=True)

    metadata = {
        "model": args.model,
        "layer": args.layer,
        "num_layers": num_layers,
        "hidden_dim": model.config.hidden_size,
        "device": args.device,
        "dtype": args.dtype,
        "agents": {},
    }

    for agent_id, pairs in CONTRAST_PAIRS.items():
        print(f"\nComputing steering vector for {agent_id} ({len(pairs)} contrast pairs)...")
        vec = compute_steering_vector(model, tokenizer, pairs, args.layer, args.device)

        # Save as numpy for easy loading
        vec_np = vec.cpu().float().numpy()
        vec_path = VECTORS_DIR / f"{agent_id}.npy"
        np.save(vec_path, vec_np)

        metadata["agents"][agent_id] = {
            "file": f"{agent_id}.npy",
            "norm": float(vec.norm().item()),
            "num_pairs": len(pairs),
            "nonzero_pct": float((vec.abs() > 1e-6).float().mean().item() * 100),
        }
        print(f"  Saved: {vec_path} (norm={vec.norm().item():.4f}, shape={vec_np.shape})")

    # Save metadata
    meta_path = VECTORS_DIR / "metadata.json"
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"\nMetadata saved: {meta_path}")
    print("\nDone! Steering vectors ready for server.py")


if __name__ == "__main__":
    main()
