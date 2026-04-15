import Link from "next/link";
import { cookies } from "next/headers";

export default function Insignia() {
  const authed = cookies().get("aureliex-pitch")?.value === "1";
  return (
    <Link
      href="/pitch"
      className={`insignia${authed ? " insignia-open" : ""}`}
      aria-label={authed ? "the door is open" : "a door, for a friend"}
      title={authed ? "the door is open." : undefined}
    >
      <span className="insignia-mark">◆</span>
    </Link>
  );
}
