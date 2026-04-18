// Lazy YouTube embed via youtube-nocookie.com to minimize third-party tracking.
// Lazy-loads the iframe via intersection observer so page load isn't blocked.
"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  id: string;          // YouTube video ID
  title: string;       // accessible title
  eyebrow?: string;    // small uppercase label above the frame
  position: "open" | "close";
};

export default function YouTubeEmbed({ id, title, eyebrow, position }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const src = `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&controls=1`;

  return (
    <section className={`v3-video v3-video-${position}`} aria-label={title}>
      {eyebrow && <div className="v3-video-eyebrow">{eyebrow}</div>}
      <div className="v3-video-frame" ref={ref}>
        {visible ? (
          <iframe
            className="v3-video-iframe"
            src={src}
            title={title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <div className="v3-video-placeholder">
            <span>loading the film…</span>
          </div>
        )}
      </div>
    </section>
  );
}
