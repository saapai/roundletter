import { cookies } from "next/headers";
import PitchGate from "./Gate";
import Deck from "./Deck";

export const dynamic = "force-dynamic";

export default function PitchPage({ searchParams }: { searchParams: { err?: string } }) {
  const authed = cookies().get("aureliex-pitch")?.value === "1";
  if (!authed) return <PitchGate err={searchParams?.err === "1"} />;
  return <Deck />;
}
