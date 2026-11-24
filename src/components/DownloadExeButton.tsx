"use client";

import { getExeDownloadUrl } from "@/lib/download";

export function DownloadExeButton({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const href = getExeDownloadUrl();

  return (
    <a
      href={href}
      className={
        className ||
        (compact
          ? "rounded-md bg-[#f4c95f] px-3 py-1.5 text-sm font-semibold text-[#1a1408] transition hover:bg-[#ffd97a]"
          : "inline-flex items-center justify-center rounded-lg bg-[#f4c95f] px-5 py-2.5 text-sm font-semibold text-[#1a1408] shadow-lg shadow-black/20 transition hover:bg-[#ffd97a]")
      }
    >
      {compact ? "Download jusDo" : "Download jusDo (Windows)"}
    </a>
  );
}
