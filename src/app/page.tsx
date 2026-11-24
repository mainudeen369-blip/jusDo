import { Suspense } from "react";
import { CompanionStage } from "@/components/CompanionStage";

export default function Home() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading companion…</div>}>
      <CompanionStage />
    </Suspense>
  );
}
