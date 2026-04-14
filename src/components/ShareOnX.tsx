"use client";

export default function ShareOnX({ text, url }: { text: string; url?: string }) {
  const href = (() => {
    const u = url || (typeof window !== "undefined" ? window.location.href : "https://aureliex.com/");
    const q = new URLSearchParams({ text, url: u });
    return `https://x.com/intent/post?${q.toString()}`;
  })();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-[12px] font-body tracking-wide border border-ink/40 rounded-full px-3 py-1 hover:bg-ink hover:text-paper transition"
    >
      post on <span className="font-semibold">X</span> →
    </a>
  );
}
