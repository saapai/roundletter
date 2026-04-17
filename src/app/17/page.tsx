import type { Metadata } from "next";
import Trailer from "./Trailer";
import { FUNNELS, type FunnelId } from "./funnels";

export const metadata: Metadata = {
  title: "seventeen. — aureliex → saathvikpai trailer",
  description:
    "$3,453.83 → seventeen. The 2K green-release boot, then a cut from the bank — funnel-aware. Iverson, EEAO, Roosevelt, the Matrix, Moneyball, 7,000 RPM.",
};

export default function SeventeenPage({
  searchParams,
}: {
  searchParams?: { for?: string; utm_source?: string };
}) {
  const raw = (searchParams?.for || searchParams?.utm_source || "").toLowerCase();
  const initialFunnel: FunnelId | undefined = raw in FUNNELS ? (raw as FunnelId) : undefined;
  return <Trailer initialFunnel={initialFunnel} />;
}
