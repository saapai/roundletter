export function slugify(s: string): string {
  return s.toLowerCase()
    .replace(/[^\w\s-]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const isItalicOnly = (s: string) => /^\*[^*].+\*$/.test(s.trim());

const AGENT_LABEL: Record<string, string> = {
  bull: "the Bull",
  bear: "the Bear",
  macro: "Macro",
  flow: "Flow",
  historian: "the Historian",
};

function formatPlain(s: string): string {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, (_, c: string) => {
      if (/^\/[\w\-\/#?=&]*$/.test(c)) return `<a class="pathlink" href="${c}">${c}</a>`;
      return `<code>${c}</code>`;
    })
    // Auto-link any occurrence of "polymarket" (case-insensitive, whole word) to /argument
    .replace(
      /\b(polymarket)\b/gi,
      '<a class="polymarket-link" href="/argument">$1</a>',
    );
}

function renderAnno(agent: string, note: string): string {
  const label = AGENT_LABEL[agent] ?? agent;
  const inner = formatPlain(note);
  return (
    `<span class="anno anno-${agent}" tabindex="0" role="note" aria-label="${label} note">` +
      `<span class="anno-dot" aria-hidden="true"></span>` +
      `<span class="anno-note">` +
        `<span class="anno-name">${label}</span>` +
        `<span class="anno-body">${inner}</span>` +
      `</span>` +
    `</span>`
  );
}

function inlineFormat(s: string): string {
  const re = /\[\[([a-z]+):\s*([^\[\]]+?)\]\]/g;
  const parts: string[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    parts.push(formatPlain(s.slice(last, m.index)));
    parts.push(renderAnno(m[1], m[2]));
    last = re.lastIndex;
  }
  parts.push(formatPlain(s.slice(last)));
  return parts.join("");
}

function splitRow(line: string): string[] {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map((c) => c.trim());
}

function isTableSep(line: string): boolean {
  const cells = splitRow(line);
  return cells.length > 0 && cells.every((c) => /^:?-{3,}:?$/.test(c));
}

export function renderMarkdown(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inPara = false;
  let ledeEmitted = false;
  let deckEmitted = false;
  let sawH1 = false;
  let sawFirstHr = false;

  const closePara = () => {
    if (inPara) { out.push("</p>"); inPara = false; }
  };
  const openPara = (cls: string) => {
    out.push(cls ? `<p class="${cls}">` : "<p>");
    inPara = true;
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();

    if (line.startsWith("|") && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      closePara();
      const header = splitRow(line);
      i += 1;
      const rows: string[][] = [];
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith("|")) {
        i += 1;
        rows.push(splitRow(lines[i]));
      }
      const head = header.map((c) => `<th>${inlineFormat(c)}</th>`).join("");
      const body = rows.map((r) => `<tr>${r.map((c) => `<td>${inlineFormat(c)}</td>`).join("")}</tr>`).join("");
      out.push(`<table class="md-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`);
      continue;
    }

    if (line.startsWith("# "))  { closePara(); sawH1 = true; const t = line.slice(2); out.push(`<h1 id="${slugify(t)}">${esc(t)}</h1>`); continue; }
    if (line.startsWith("## ")) { closePara(); const t = line.slice(3); out.push(`<h2 id="${slugify(t)}">${esc(t)}</h2>`); continue; }
    if (line.startsWith("### ")) { closePara(); const t = line.slice(4); out.push(`<h3 id="${slugify(t)}">${esc(t)}</h3>`); continue; }
    if (line.startsWith("> "))  { closePara(); out.push(`<blockquote>${inlineFormat(line.slice(2))}</blockquote>`); continue; }
    if (line.startsWith("- "))  { closePara(); out.push(`<li class="list-disc ml-6">${inlineFormat(line.slice(2))}</li>`); continue; }
    if (line === "---")         { closePara(); sawFirstHr = true; out.push("<hr/>"); continue; }
    if (line === "")            { closePara(); continue; }

    if (!inPara) {
      if (sawH1 && !deckEmitted && !sawFirstHr && isItalicOnly(line)) {
        openPara("deck");
        deckEmitted = true;
        out.push(esc(line.slice(1, -1)) + " ");
        continue;
      }
      if (!ledeEmitted && !isItalicOnly(line)) {
        openPara("lede");
        ledeEmitted = true;
      } else {
        openPara("");
      }
    }

    out.push(inlineFormat(line) + " ");
  }
  closePara();
  return out.join("");
}
