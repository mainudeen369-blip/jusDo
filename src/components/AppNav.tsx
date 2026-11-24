"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DownloadExeButton } from "@/components/DownloadExeButton";

const LINKS = [
  { href: "/", label: "Companion" },
  { href: "/quiz", label: "Fan Quiz" },
  { href: "/settings", label: "Settings" },
  { href: "/admin", label: "Admin" },
];

export function AppNav() {
  const pathname = usePathname();

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
