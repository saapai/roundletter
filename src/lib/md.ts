function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const isItalicOnly = (s: string) => /^\*[^*].+\*$/.test(s.trim());

export function renderMarkdown(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inPara = false;
  let paraClass = "";
  let ledeEmitted = false;
  let deckEmitted = false;
  let sawH1 = false;
  let sawFirstHr = false;

  const closePara = () => {
    if (inPara) { out.push("</p>"); inPara = false; paraClass = ""; }
  };

  const openPara = (cls: string) => {
    paraClass = cls;
    out.push(cls ? `<p class="${cls}">` : "<p>");
    inPara = true;
  };

  const inlineFormat = (s: string) =>
    esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, (_: string, c: string) => {
        if (/^\/[\w\-\/#?=&]*$/.test(c)) {
          return `<a class="pathlink" href="${c}">${c}</a>`;
        }
        return `<code>${c}</code>`;
      });

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.startsWith("# ")) {
      closePara();
      sawH1 = true;
      out.push(`<h1>${esc(line.slice(2))}</h1>`);
      continue;
    }
    if (line.startsWith("## ")) {
      closePara();
      out.push(`<h2>${esc(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("> ")) {
      closePara();
      out.push(`<blockquote>${inlineFormat(line.slice(2))}</blockquote>`);
      continue;
    }
    if (line.startsWith("- ")) {
      closePara();
      out.push(`<li class="list-disc ml-6">${inlineFormat(line.slice(2))}</li>`);
      continue;
    }
    if (line === "---") {
      closePara();
      sawFirstHr = true;
      out.push("<hr/>");
      continue;
    }
    if (line === "") { closePara(); continue; }

    if (!inPara) {
      // First italic-only paragraph right after H1 → deck (subtitle)
      if (sawH1 && !deckEmitted && !sawFirstHr && isItalicOnly(line)) {
        openPara("deck");
        deckEmitted = true;
        out.push(esc(line.slice(1, -1)) + " ");
        continue;
      }
      // First normal paragraph → lede (gets drop cap)
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
