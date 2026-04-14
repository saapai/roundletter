function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const isItalicOnly = (s: string) => /^\*[^*].*\*$/.test(s.trim());

export function renderMarkdown(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inPara = false;
  let ledeEmitted = false;
  let currentIsLede = false;

  const openPara = () => {
    currentIsLede = !ledeEmitted;
    if (currentIsLede) ledeEmitted = true;
    out.push(`<p${currentIsLede ? ' class="lede"' : ""}>`);
    inPara = true;
  };
  const closePara = () => { if (inPara) { out.push("</p>"); inPara = false; currentIsLede = false; } };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.startsWith("# "))  { closePara(); out.push(`<h1>${esc(line.slice(2))}</h1>`); continue; }
    if (line.startsWith("## ")) { closePara(); out.push(`<h2>${esc(line.slice(3))}</h2>`); continue; }

    if (line.startsWith("> ")) {
      closePara();
      const inner = esc(line.slice(2))
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/`(.+?)`/g, "<code>$1</code>");
      out.push(`<blockquote>${inner}</blockquote>`);
      continue;
    }

    if (line.startsWith("- ")) {
      closePara();
      const inner = esc(line.slice(2))
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/`(.+?)`/g, "<code>$1</code>");
      out.push(`<li class="ml-5 list-disc mt-1">${inner}</li>`);
      continue;
    }

    if (line === "---") { closePara(); out.push("<hr/>"); continue; }
    if (line === "") { closePara(); continue; }

    // Pure italic intro line → paragraph, but never counts as lede
    if (!inPara) {
      if (isItalicOnly(line)) {
        out.push('<p class="italic text-graphite">');
        inPara = true;
        currentIsLede = false;
      } else {
        openPara();
      }
    }

    const formatted = esc(line)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>");
    out.push(formatted + " ");
  }
  closePara();
  return out.join("");
}
