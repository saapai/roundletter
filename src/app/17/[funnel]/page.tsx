import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Trailer from "../Trailer";
import { FUNNELS, type FunnelId } from "../funnels";

// Per-funnel pretty paths: /17/sep, /17/debate, /17/fintwit, /17/ai,
// /17/poly, /17/keys. Each share surface gets its own URL so recipients
// see the cut was chosen for them (per virality agent's note).

export function generateStaticParams() {
  return (Object.keys(FUNNELS).filter((id) => id !== "default")).map((funnel) => ({
    funnel,
  }));
}

export function generateMetadata({ params }: { params: { funnel: string } }): Metadata {
  const id = params.funnel.toLowerCase();
  const f = (id in FUNNELS ? FUNNELS[id as FunnelId] : null);
  if (!f) return { title: "seventeen. — aureliex trailer" };
  return {
    title: `${f.whisper} — aureliex cut for ${f.id}`,
    description: `${f.whisper} ${f.subWhisper ?? ""}`.trim(),
    openGraph: {
      title: f.whisper,
      description: f.subWhisper ?? "",
      url: `https://aureliex.com/17/${f.id}`,
      type: "video.other",
    },
    twitter: {
      card: "summary_large_image",
      title: f.whisper,
      description: f.subWhisper ?? "",
      creator: "@saapai",
    },
  };
}

export default function FunnelTrailerPage({ params }: { params: { funnel: string } }) {
  const id = params.funnel.toLowerCase();
  if (!(id in FUNNELS) || id === "default") notFound();
  return <Trailer initialFunnel={id as FunnelId} />;
}
