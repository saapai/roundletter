import Link from "next/link";

export default function Insignia() {
  return (
    <Link href="/pitch" className="insignia" aria-label="a door, for a friend">
      <span className="insignia-mark">◆</span>
    </Link>
  );
}
