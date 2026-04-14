"use client";
import { useEffect } from "react";

export default function ReaderMode() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /INPUT|TEXTAREA/i.test(t.tagName)) return;
      if (e.key === "f" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        document.body.classList.toggle("reader-mode");
      } else if (e.key === "Escape") {
        document.body.classList.remove("reader-mode");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
