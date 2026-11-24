import { Suspense } from "react";
import { SettingsForm } from "@/components/SettingsForm";

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading settings…</div>}>
      <SettingsForm />
    </Suspense>
  );
}
