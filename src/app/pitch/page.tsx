import PitchGate from "./Gate";
import Deck from "./Deck";
import { verifyToken } from "./token";

export const dynamic = "force-dynamic";

export default function PitchPage({
  searchParams,
}: {
  searchParams: { err?: string; k?: string };
}) {
  if (verifyToken(searchParams?.k)) return <Deck />;
  return <PitchGate err={searchParams?.err === "1"} />;
}
