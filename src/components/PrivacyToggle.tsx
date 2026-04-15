"use client";
import { useEffect, useState } from "react";

export default function PrivacyToggle() {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /INPUT|TEXTAREA/i.test(t.tagName)) return;
      if (e.key === "p" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        const isOff = localStorage.getItem("aureliex-no-heat") === "1";
        if (isOff) {
          localStorage.removeItem("aureliex-no-heat");
          setToast("attention tracking · on");
        } else {
          localStorage.setItem("aureliex-no-heat", "1");
          setToast("attention tracking · off (until you press p again)");
        }
        window.clearTimeout((window as any).__prTimer);
        (window as any).__prTimer = window.setTimeout(() => setToast(null), 2800);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!toast) return null;
  return <div className="privacy-toast">{toast}</div>;
}
