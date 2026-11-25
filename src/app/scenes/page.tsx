import { Suspense } from "react";
import { SceneArena } from "@/components/SceneArena";

export default function ScenesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading Movie Scenes…</div>}>
      <SceneArena />
    </Suspense>
  );
}
