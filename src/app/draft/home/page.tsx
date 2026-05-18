import dynamic from "next/dynamic";

const DraftHomeClient = dynamic(() => import("./client"), { ssr: false });

export default function DraftHomePage() {
  return <DraftHomeClient />;
}
