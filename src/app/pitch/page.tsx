import PitchGate from "./Gate";
import Deck from "./Deck";
import { verifyToken } from "./token";

export const dynamic = "force-dynamic";

export default function PitchPage({
  searchParams,
}: {
  searchParams: { e?: string; k?: string; t?: string; err?: string };
}) {
  if (verifyToken(searchParams?.k)) return <Deck />;
  // Support both old (`err=1`) and new (`e=<class>`) param names
  const errClass = searchParams?.e ?? (searchParams?.err === "1" ? "cold" : undefined);
  return <PitchGate err={errClass} attempt={searchParams?.t} />;
}
