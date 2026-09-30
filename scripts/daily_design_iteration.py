#!/usr/bin/env python3
"""Daily autonomous design iteration — runs in GitHub Actions.

Reads the design-bank, recent commits, recent auto-design PRs, then asks
Claude to pick ONE small/medium improvement, implement it, and push a PR.

Hard rules enforced by both the prompt AND a post-edit guard:
  - never modifies src/data/portfolio.json or src/data/snapshots/* or src/middleware.ts
  - never commits to main directly
  - npm run build must exit 0 before push
  - one PR per day max
"""
from __future__ import annotations

import datetime as _dt
import json
import os
import pathlib
import re
import subprocess
import sys
from typing import Iterable

import anthropic

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
DESIGN_BANK = REPO_ROOT / "design-bank"

# Files the iterator MUST NOT touch. Enforced post-Claude as a guard.
FORBIDDEN_PATHS = {
    "src/data/portfolio.json",
    "src/data/prediction.json",
    "src/middleware.ts",
    ".github/workflows/daily-design.yml",
    "scripts/daily_design_iteration.py",
}
FORBIDDEN_PREFIXES = (
    "src/data/snapshots/",
    "../polytrader/",
)


def sh(cmd: str, *, check: bool = True, cwd: pathlib.Path | None = None) -> str:
    out = subprocess.run(
        cmd, shell=True, capture_output=True, text=True, cwd=cwd or REPO_ROOT
    )
    if check and out.returncode != 0:
        print(f"$ {cmd}\n{out.stdout}\n{out.stderr}", file=sys.stderr)
        raise SystemExit(out.returncode)
    return (out.stdout + out.stderr).strip()


def read_design_bank() -> str:
    if not DESIGN_BANK.exists():
        return "(empty — no design-bank yet)"
    chunks: list[str] = []
    for p in sorted(DESIGN_BANK.glob("*.md")):
        chunks.append(f"\n\n===== {p.name} =====\n{p.read_text()}")
    return "\n".join(chunks)[:60_000]


def recent_git_log() -> str:
    return sh("git log --oneline -20")


def recent_auto_design_prs() -> str:
    out = sh(
        'gh pr list --search "[auto-design]" --limit 10 --state all --json number,title,state,mergedAt,closedAt',
        check=False,
    )
    if not out or out.startswith("error"):
        return "(no PRs returned)"
    return out


def days_since_last_severity(prs_json: str, sev: int) -> int:
    try:
        items = json.loads(prs_json)
    except Exception:
        return 99
    today = _dt.date.today()
    for it in items:
        m = re.search(rf"sev{sev}", it.get("title", ""))
        if not m:
            continue
        when = it.get("mergedAt") or it.get("closedAt") or ""
        try:
            d = _dt.datetime.fromisoformat(when.replace("Z", "+00:00")).date()
            return (today - d).days
        except Exception:
            continue
    return 99


def build_passes() -> bool:
    out = subprocess.run(
        "npm run build", shell=True, capture_output=True, text=True, cwd=REPO_ROOT
    )
    if out.returncode != 0:
        print("BUILD FAILED:\n", out.stdout[-2000:], "\n", out.stderr[-2000:])
    return out.returncode == 0


def ensure_no_forbidden_changes(changed: Iterable[str]) -> None:
    for f in changed:
        if f in FORBIDDEN_PATHS or any(f.startswith(p) for p in FORBIDDEN_PREFIXES):
            raise SystemExit(f"REFUSED: change touches forbidden path {f!r}")


PROMPT = """You are a daily design iterator for the user's roundletter site
(aureliex.com + saathvikpai.com). Your job is ONE small/medium improvement,
shipped as a feature-branch PR, every day.

Today: {today}.
Design-bank contents below.
Recent commits below.
Recent auto-design PRs below (skip ideas you already shipped or that are open).

SEVERITY (pick exactly one):
 - 1 (default): typography, spacing, color accent, microcopy. 1-2 files.
 - 2 (every ~3 days): component restyle or new sub-component. 2-4 files.
 - 3 (rare, only if last sev3 was {sev3_gap}d+ ago AND a strong design-bank source supports it): new section/interaction. 3-6 files.

OUTPUT FORMAT — return ONLY this JSON, no prose:
{{
  "skip": false,
  "reason": "one-sentence why this idea (or why skip)",
  "severity": 1,
  "branch": "auto-design/YYYY-MM-DD-kebab-slug",
  "title": "[auto-design] YYYY-MM-DD sev1 · short description",
  "body": "PR body markdown (severity, technique, source citation, files-changed, screenshot suggestion)",
  "commit_msg": "design · short message · cite source",
  "edits": [
    {{"path": "src/components/Foo.tsx", "action": "replace", "content": "...full new file..."}},
    {{"path": "src/app/globals.css", "action": "patch", "find": "old text exact match", "replace": "new text"}}
  ]
}}

HARD RULES:
- NEVER edit: src/data/portfolio.json, src/data/snapshots/*, src/data/prediction.json, src/middleware.ts, package.json (without justification), polytrader/*, .env*
- Branch must start with "auto-design/" and include today's date.
- Title must include "[auto-design]" and "sev{{N}}".
- If no good idea: set skip=true with one-sentence reason. Do not invent busywork.
- Do not duplicate or reverse a recent merged auto-design PR.
- Use techniques from the design-bank; cite source file in PR body.

DESIGN BANK
{design_bank}

RECENT COMMITS
{git_log}

RECENT AUTO-DESIGN PRs
{prs}
"""


def apply_edits(edits: list[dict]) -> list[str]:
    changed: list[str] = []
    for e in edits:
        rel = e["path"].lstrip("/")
        action = e.get("action", "replace")
        full = REPO_ROOT / rel
        if action == "replace":
            full.parent.mkdir(parents=True, exist_ok=True)
            full.write_text(e["content"])
            changed.append(rel)
        elif action == "patch":
            if not full.exists():
                raise SystemExit(f"patch target missing: {rel}")
            text = full.read_text()
            if e["find"] not in text:
                raise SystemExit(f"patch find-string not in {rel}")
            full.write_text(text.replace(e["find"], e["replace"], 1))
            changed.append(rel)
        elif action == "delete":
            full.unlink(missing_ok=True)
            changed.append(rel)
        else:
            raise SystemExit(f"unknown edit action: {action}")
    return changed


def main() -> int:
    sh("git checkout main")
    sh("git pull origin main")

    prs = recent_auto_design_prs()
    sev3_gap = days_since_last_severity(prs, 3)

    client = anthropic.Anthropic()
    resp = client.messages.create(
        model="claude-opus-4-7",  # latest Opus per env
        max_tokens=8000,
        messages=[
            {
                "role": "user",
                "content": PROMPT.format(
                    today=_dt.date.today().isoformat(),
                    design_bank=read_design_bank(),
                    git_log=recent_git_log(),
                    prs=prs,
                    sev3_gap=sev3_gap,
                ),
            }
        ],
    )
    raw = "".join(b.text for b in resp.content if hasattr(b, "text")).strip()
    if raw.startswith("```"):
        raw = re.sub(r"^```(?:json)?\n?|```$", "", raw).strip()

    plan = json.loads(raw)
    print("PLAN:", json.dumps(plan, indent=2)[:2000])

    if plan.get("skip"):
        print(f"SKIPPING today: {plan.get('reason', '(no reason)')}")
        return 0

    branch = plan["branch"]
    if not branch.startswith("auto-design/"):
        raise SystemExit("branch must start with auto-design/")

    sh(f"git checkout -b {branch}")
    changed = apply_edits(plan["edits"])
    ensure_no_forbidden_changes(changed)

    if not build_passes():
        print("ABORT: build failed, no push")
        return 1

    files = " ".join(f'"{p}"' for p in changed)
    sh(f"git add {files}")
    msg = plan["commit_msg"]
    sh(f'git commit -m "{msg}"')
    sh(f"git push -u origin {branch}")

    pr_body = plan["body"].replace('"', '\\"')
    sh(
        f'gh pr create --base main --head {branch} --title "{plan["title"]}" --body "{pr_body}"'
    )
    print("OK: PR opened.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
