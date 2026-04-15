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

  for (const raw of lines) {
    const line = raw.trimEnd();

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
