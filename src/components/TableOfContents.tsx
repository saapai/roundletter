"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Entry = { id: string; level: 1 | 2; text: string };
type Section = { article: Entry; subs: Entry[] };

export default function TableOfContents() {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(true);
  const io = useRef<IntersectionObserver | null>(null);

  // Build the tree once, after content mounts
  useEffect(() => {
    if (typeof window === "undefined") return;
    const rebuild = () => {
      const articles = Array.from(document.querySelectorAll("article.article"));
      const built: Section[] = [];
      for (const a of articles) {
        const h1 = a.querySelector("h1[id]") as HTMLHeadingElement | null;
        if (!h1) continue;
        const article: Entry = { id: h1.id, level: 1, text: h1.textContent?.trim() ?? "" };
        const subs: Entry[] = Array.from(a.querySelectorAll("h2[id]")).map(h => ({
          id: (h as HTMLHeadingElement).id,
          level: 2,
          text: h.textContent?.trim() ?? "",
        }));
        built.push({ article, subs });
      }
      setSections(built);
    };
    // Defer so hydrated content is present
    const id = window.setTimeout(rebuild, 50);
    return () => window.clearTimeout(id);
  }, []);

  // Scroll-spy: highlight the heading nearest to the top of viewport
  useEffect(() => {
    if (sections.length === 0) return;
    const ids = sections.flatMap(s => [s.article.id, ...s.subs.map(x => x.id)]);
    const elements = ids.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    io.current?.disconnect();
    const visible = new Map<string, number>();
    io.current = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.set(e.target.id, e.intersectionRatio);
        else visible.delete(e.target.id);
      }
      // Pick the first (topmost) intersecting heading
      const inOrder = elements.filter(el => visible.has(el.id));
      if (inOrder.length > 0) setActiveId(inOrder[0].id);
    }, { rootMargin: "-80px 0px -70% 0px", threshold: [0, 1] });

    elements.forEach(el => io.current?.observe(el));
    return () => io.current?.disconnect();
  }, [sections]);

  const jump = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  const handleKey = useMemo(() => (e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    if (t && /INPUT|TEXTAREA/i.test(t.tagName)) return;
    if (e.key === "t" && !e.metaKey && !e.ctrlKey && !e.altKey) setOpen(o => !o);
  }, []);
  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (sections.length === 0) return null;

  return (
    <aside className={`toc ${open ? "toc-open" : "toc-collapsed"}`} aria-label="Table of contents">
      <div className="toc-header">
        <span className="toc-title">Contents</span>
        <button
          className="toc-toggle"
          aria-label={open ? "Collapse contents" : "Expand contents"}
          onClick={() => setOpen(o => !o)}
        >
          {open ? "−" : "+"}
        </button>
      </div>
      {open && (
        <nav className="toc-list">
          {sections.map((s, i) => (
            <div key={s.article.id + i} className="toc-group">
              <a
                href={`#${s.article.id}`}
                onClick={jump(s.article.id)}
                className={`toc-article ${activeId === s.article.id ? "active" : ""}`}
              >
                {s.article.text}
              </a>
              <ul>
                {s.subs.map(sub => (
                  <li key={sub.id}>
                    <a
                      href={`#${sub.id}`}
                      onClick={jump(sub.id)}
                      className={`toc-sub ${activeId === sub.id ? "active" : ""}`}
                    >
                      {sub.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="toc-hint">press <kbd>t</kbd> to toggle · <kbd>f</kbd> reader</div>
        </nav>
      )}
    </aside>
  );
}
