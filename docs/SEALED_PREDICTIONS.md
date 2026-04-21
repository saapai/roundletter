# Sealed predictions — runbook

## What happened to sp-001

The plaintext that produced the committed SHA-256 hash was not stored in a
recoverable location. When the horizon closed (2026-04-20 16:20 ET), the
reveal could not be verified. sp-001 is now marked `status: "forfeited"` in
`src/data/sealed-predictions.json` and the page surfaces that honestly
instead of staying stuck on "reveal_pending."

This is a **procedural miscalibration**, not a thesis miscalibration. The
prediction itself may have hit or missed — we just can't prove which, and
proving-which is the whole point.

## How to seal sp-002 and onward (never lose plaintext again)

Follow these steps **in order**. The only file that leaves your machine
with the plaintext in it is the environment variable set on Vercel.

### 1. Draft the plaintext

Open a terminal and write the plaintext to a temp file. Conventions:

- **Raw string must be deterministic bytes.** Include a nonce for
  uniqueness (e.g. `"4:22-audition-saapai"`). Don't include trailing
  newlines unless you hash them too.
- **Shape as JSON so the reveal route can parse a `threshold`:**

  ```json
  {"thesis":"<short statement>","threshold":<number>,"nonce":"<unique string>","sealed_at":"<ISO>"}
  ```

Save to `/tmp/sp-002-plaintext.json` (NEVER inside the repo).

### 2. Compute the SHA-256

```bash
PLAINTEXT="$(cat /tmp/sp-002-plaintext.json)"
echo -n "$PLAINTEXT" | shasum -a 256
```

Copy the hex output — this is what goes in the repo.

### 3. Store the plaintext in THREE places before committing the hash

You commit publicly only after you've backed up the plaintext in three
independent locations. This is the rule that would have saved sp-001:

1. **Password manager entry** named `aureliex / sp-<id> / plaintext` with
   the raw bytes in the notes field.
2. **Encrypted local file** (age / gpg / 1Password file attachment) at
   `~/secrets/aureliex-predictions/sp-<id>.txt.age`.
3. **Vercel environment variable** — Project Settings → Environment
   Variables → add `SEALED_PREDICTION_PLAINTEXT_RAW_SP<ID>` with the raw
   plaintext, scope Production + Preview. (The current code reads a single
   unnamespaced env var — see §5 below for the multi-prediction refactor.)

Only after all three are confirmed do you move to step 4.

### 4. Commit the hash publicly

Update `src/data/sealed-predictions.json`:

```jsonc
{
  "id": "sp-002",
  "thesis_public": "<paraphrase of the sealed thesis — narrows the option space without revealing the threshold>",
  "calibration_metric": "<the one number that matters>",
  "baseline": { "as_of": "<ISO>", "cumulative_reads": <N>, "source": "<where you pulled from>" },
  "horizon": { "start": "<ISO>", "end": "<ISO>", "label": "<human label>" },
  "sealed_at": "<ISO>",
  "sha256": "<hex from step 2>",
  "nonce": "<human string inside the plaintext>",
  "status": "sealed"
}
```

Commit and push. The hash is now public record.

### 5. When the horizon closes

The reveal route (`src/app/api/reveal/route.ts`) reads
`SEALED_PREDICTION_PLAINTEXT_RAW` — today that's a single var for sp-001.
For sp-002 onward, either:

- **(a) Rotate the env var** — set the value to the new plaintext the
  moment sp-001 is forfeited/closed.
- **(b) (preferred) Refactor to namespaced vars** — read
  `SEALED_PREDICTION_PLAINTEXT_RAW_<ID_UPPERCASE>` for each prediction.
  One commit, one PR, then every future prediction has its own slot.

The route verifies `sha256(env) === prediction.sha256`. If they match,
the reveal returns plaintext + computed hit/miss against the current view
total. If not, `{ status: "reveal_pending", reason: "plaintext does not
match the sealed hash" }`.

### 6. Never lose the plaintext

If the password manager entry exists, step 5 is one dashboard paste. If
it doesn't — sp-<id> forfeits. Every forfeit is a calibration signal
against the system, not against the thesis. Record it honestly (that's
what the forfeit block in sealed-predictions.json is for).

## The contract with readers

- Plaintext is withheld until the horizon closes.
- At horizon close, the plaintext is published verifiably (sha-256 matches
  the committed seal, anyone can verify with `shasum -a 256`).
- If the plaintext is lost, the prediction is marked `forfeited` and the
  record says so in public. The hash stands as unverifiable commitment.
- Fabricating a plaintext post-hoc to "rescue" a lost commitment would
  undermine every future seal. We don't do that.

The forfeit of sp-001 is the reason this document exists.
