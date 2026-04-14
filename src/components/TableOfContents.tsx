"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Entry = { id: string; level: 2 | 3; text: string };
type Group = { id: string; label: string; title: string; subs: Entry[] };

export default function TableOfContents() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const io = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const rebuild = () => {
      const articles = Array.from(document.querySelectorAll("article.article"));
      const built: Group[] = [];
      for (const a of articles) {
        const h1 = a.querySelector("h1[id]") as HTMLHeadingElement | null;
        if (!h1) continue;
        const eyebrow = a.querySelector(".eyebrow")?.textContent?.trim() ?? h1.textContent?.trim() ?? "";
        const heads = Array.from(a.querySelectorAll("h2[id], h3[id]")) as HTMLHeadingElement[];
        const subs: Entry[] = heads.map(h => ({
          id: h.id,
          level: (h.tagName === "H3" ? 3 : 2) as 2 | 3,
          text: h.textContent?.trim() ?? "",
        }));
        built.push({ id: h1.id, label: eyebrow, title: h1.textContent?.trim() ?? "", subs });
      }
      setGroups(built);
    };
    const id = window.setTimeout(rebuild, 50);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (groups.length === 0) return;
    const ids = groups.flatMap(g => [g.id, ...g.subs.map(s => s.id)]);
    const elements = ids.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    io.current?.disconnect();
    const visible = new Map<string, number>();
    io.current = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.set(e.target.id, e.intersectionRatio);
        else visible.delete(e.target.id);
      }
      const inOrder = elements.filter(el => visible.has(el.id));
      if (inOrder.length > 0) setActiveId(inOrder[0].id);
    }, { rootMargin: "-80px 0px -70% 0px", threshold: [0, 1] });

    elements.forEach(el => io.current?.observe(el));
    return () => io.current?.disconnect();
  }, [groups]);

  const jump = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  const toggleGroup = (id: string) => {
    setCollapsed(s => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const handleKey = useMemo(() => (e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    if (t && /INPUT|TEXTAREA/i.test(t.tagName)) return;
    if (e.key === "t" && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); setOpen(o => !o); }
    if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
      if (!open) setOpen(true);
      setTimeout(() => document.getElementById("toc-search")?.focus(), 50);
      e.preventDefault();
    }
    if (e.key === "Escape") setOpen(false);
  }, [open]);
  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (groups.length === 0) return null;

  const q = query.trim().toLowerCase();
  const matches = (s: string) => !q || s.toLowerCase().includes(q);
  const isFiltering = q.length > 0;

  return (
    <aside className={`toc ${open ? "toc-open" : "toc-collapsed"}`} aria-label="Table of contents">
      <div className="toc-header">
        {open && <span className="toc-title">Contents</span>}
        <button
          className="toc-toggle"
          aria-label={open ? "Close contents" : "Open contents"}
          onClick={() => setOpen(o => !o)}
        >
          {open ? "×" : "⋮"}
        </button>
      </div>
      {open && (
        <>
          <input
            id="toc-search"
            className="toc-search"
            type="text"
            placeholder="Filter…  /  to focus"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <nav className="toc-list">
            {groups.map((g) => {
              const isCollapsed = !isFiltering && collapsed.has(g.id);
              const groupMatches = matches(g.label) || matches(g.title);
              const matchingSubs = g.subs.filter(s => matches(s.text));
              if (isFiltering && !groupMatches && matchingSubs.length === 0) return null;
              const subsToShow = isFiltering ? matchingSubs : g.subs;
              return (
                <div key={g.id} className="toc-group">
                  <div className="toc-group-row">
                    <button
                      className="toc-caret"
                      aria-label={isCollapsed ? "Expand" : "Collapse"}
                      onClick={() => toggleGroup(g.id)}
                      disabled={isFiltering}
                    >
                      <span className={`caret ${isCollapsed ? "down" : "open"}`}>▾</span>
                    </button>
                    <a
                      href={`#${g.id}`}
                      onClick={jump(g.id)}
                      className={`toc-article ${activeId === g.id ? "active" : ""}`}
                      title={g.title}
                    >
                      {g.label}
                    </a>
                  </div>
                  {!isCollapsed && subsToShow.length > 0 && (
                    <ul>
                      {subsToShow.map(sub => (
                        <li key={sub.id}>
                          <a
                            href={`#${sub.id}`}
                            onClick={jump(sub.id)}
                            className={`toc-sub lvl-${sub.level} ${activeId === sub.id ? "active" : ""}`}
                            title={sub.text}
                          >
                            {sub.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </nav>
          <div className="toc-hint">
            <kbd>t</kbd> toggle · <kbd>/</kbd> search · <kbd>f</kbd> reader · <kbd>esc</kbd> close
          </div>
        </>
      )}
    </aside>
  );
}
