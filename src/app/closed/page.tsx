import { cookies } from "next/headers";
import Gate from "./Gate";
import Content from "./Content";

export const dynamic = "force-dynamic";

export default function Closed({ searchParams }: { searchParams: { err?: string } }) {
  const authed = cookies().get("aureliex-inner")?.value === "1";
  if (!authed) return <Gate err={searchParams?.err === "1"} />;
  return <Content />;
}
