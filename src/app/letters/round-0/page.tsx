import { getLetter } from "@/lib/data";

function render(md: string) {
  const lines = md.split("\n");
  const out: string[] = [];
  let inPara = false;
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("# ")) { if (inPara) { out.push("</p>"); inPara=false; } out.push(`<h1 class="text-4xl font-serif mt-6">${esc(line.slice(2))}</h1>`); continue; }
    if (line.startsWith("## ")) { if (inPara) { out.push("</p>"); inPara=false; } out.push(`<h2 class="text-2xl font-serif mt-8">${esc(line.slice(3))}</h2>`); continue; }
    if (line.startsWith("**") && line.endsWith("**")) { if (inPara) { out.push("</p>"); inPara=false; } out.push(`<p class="mt-3 font-bold">${esc(line.slice(2,-2))}</p>`); continue; }
    if (line === "---") { if (inPara) { out.push("</p>"); inPara=false; } out.push('<hr class="ink-rule my-5"/>'); continue; }
    if (line === "") { if (inPara) { out.push("</p>"); inPara=false; } continue; }
    if (!inPara) { out.push('<p class="mt-3 text-[17px] leading-[1.7]">'); inPara = true; }
    const formatted = esc(line).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/`(.+?)`/g,'<code class="font-mono text-[15px]">$1</code>');
    out.push(formatted + " ");
  }
  if (inPara) out.push("</p>");
  return out.join("");
}
function esc(s: string) { return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

export default function RoundZeroLetter() {
  const letter = getLetter("round-0");
  if (!letter) return <div>letter not found</div>;
  return (
    <article className="prose max-w-none">
      <div className="text-xs text-graphite uppercase tracking-widest">Round Letter · {letter.frontmatter.round}</div>
      <div className="text-xs text-graphite mt-1">{letter.frontmatter.date}</div>
      <div dangerouslySetInnerHTML={{ __html: render(letter.body) }} />
    </article>
  );
}
