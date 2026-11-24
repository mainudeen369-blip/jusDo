"use client";

import { useEffect, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { GuestLogin } from "@/components/GuestLogin";
import { ReminderHost } from "@/components/ReminderHost";
import { loadGuest } from "@/lib/guest";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [hasGuest, setHasGuest] = useState(false);

  useEffect(() => {
    setHasGuest(Boolean(loadGuest()));
    setReady(true);
    const onGuest = () => setHasGuest(Boolean(loadGuest()));
    window.addEventListener("jusdo:guest-changed", onGuest);
    return () => window.removeEventListener("jusdo:guest-changed", onGuest);
  }, []);

  return (
    <>
      <AppNav />
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="border-t border-white/5 px-4 py-4 text-center text-xs text-slate-500">
        jusDo · companion + fan quiz · deploy on Vercel
      </footer>
      <ReminderHost />
      {ready && !hasGuest ? <GuestLogin onDone={() => setHasGuest(true)} /> : null}
    </>
  );
}
