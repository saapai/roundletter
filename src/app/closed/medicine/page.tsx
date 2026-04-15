import { cookies } from "next/headers";
import MedicineGate from "./Gate";
import MedicineContent from "./Content";

export const dynamic = "force-dynamic";

export default function MedicinePage({
  searchParams,
}: {
  searchParams: { err?: string };
}) {
  // Two doors deep: must have BOTH the outer /closed cookie AND the medicine cookie
  const outer = cookies().get("aureliex-inner")?.value === "1";
  const inner = cookies().get("aureliex-medicine")?.value === "1";

  // If they don't have the outer cookie, they haven't even gotten through the polymarket door.
  // Send them back to /closed — but don't tell them that's where they'll land; the redirect
  // just feels like the gate resetting.
  if (!outer) {
    return <MedicineGate err={searchParams?.err === "1"} />;
  }

  if (inner) return <MedicineContent />;
  return <MedicineGate err={searchParams?.err === "1"} />;
}
