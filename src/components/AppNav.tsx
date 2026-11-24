"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { DownloadExeButton } from "@/components/DownloadExeButton";
import { createGuestSession, loadGuest, randomGuestName, saveGuest, type GuestSession } from "@/lib/guest";
import { loadSettings, saveSettings } from "@/lib/settings";

const LINKS = [
  { href: "/", label: "Companion" },
  { href: "/quiz", label: "Fan Quiz" },
  { href: "/settings", label: "Settings" },
  { href: "/admin", label: "Admin" },
];

export function AppNav() {
  const pathname = usePathname();
  const [guest, setGuest] = useState<GuestSession | null>(null);

  useEffect(() => {
    setGuest(loadGuest());
    const onGuest = () => setGuest(loadGuest());
    window.addEventListener("jusdo:guest-changed", onGuest);
    return () => window.removeEventListener("jusdo:guest-changed", onGuest);
  }, []);

  function switchGuest() {
    const next = createGuestSession(randomGuestName());
    saveGuest(next);
    const settings = loadSettings();
    settings.displayName = next.name;
    saveSettings(settings);
    window.dispatchEvent(new Event("jusdo:settings-saved"));
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07131f]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-[#f4c95f]">
            jusDo
          </span>
          <span className="hidden text-xs text-teal-100/70 sm:inline">remind · respect · play</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {guest ? (
            <button
              type="button"
              title="Switch guest name"
              onClick={switchGuest}
              className="mr-1 max-w-[9rem] truncate rounded-md border border-teal-400/30 bg-teal-400/10 px-2 py-1 text-xs text-teal-100 hover:bg-teal-400/20 sm:max-w-[12rem]"
            >
              {guest.name}
            </button>
          ) : null}
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 transition ${
                  active
                    ? "bg-teal-400/20 text-teal-100"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <DownloadExeButton compact />
        </nav>
      </div>
    </header>
  );
}
