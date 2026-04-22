import { redirect } from "next/navigation";

// /archives/v3 was the old homepage pattern (PortfolioChart + BettableOdds +
// manifesto + Marx coda + YouTube bookends) before the magazine-collage
// launch trailer replaced it. Now a permanent redirect so the orphan URL
// doesn't surface stale content. Same thesis, the new home is where it lives.
export default function ArchivesV3Redirect() {
  redirect("/");
}
