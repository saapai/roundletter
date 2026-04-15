"use client";
import { useEffect } from "react";

export default function SlideReveal() {
  useEffect(() => {
    const slides = document.querySelectorAll(".pitch-slide");
    if (slides.length === 0) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add("in-view");
        }
      }
    }, { rootMargin: "-10% 0px -10% 0px", threshold: 0.01 });
    slides.forEach(s => io.observe(s));
    return () => io.disconnect();
  }, []);
  return null;
}
