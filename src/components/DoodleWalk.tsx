"use client";

import type { CompanionMood, StarId } from "@/lib/types";

const MOOD_FACE: Record<CompanionMood, string> = {
  happy: "^_^",
  sleepy: "-_-",
  hyped: "^o^",
  proud: "★_★",
  nudge: "•_•",
};

export function DoodleWalk({
  star,
  mood,
  speaking,
}: {
  star: StarId;
  mood: CompanionMood;
  speaking?: string | null;
}) {
  const isVijay = star === "vijay";
  const body = isVijay ? "from-[#f4c95f] to-[#e8a838]" : "from-[#9fb7d4] to-[#6d8fb8]";
  const accent = isVijay ? "bg-[#1a1a1a]" : "bg-[#243447]";

  return (
    <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#0c2233] to-[#081018]">
      <div className="pointer-events-none absolute inset-x-0 bottom-8 h-px bg-white/15" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,#2dd4bf22,transparent_40%),radial-gradient(circle_at_80%_0%,#f4c95f22,transparent_35%)]" />

      <div className="doodle-walk absolute bottom-6 flex items-end gap-2">
        <div className="relative">
          <div
            className={`flex h-16 w-16 flex-col items-center justify-center rounded-full bg-gradient-to-br ${body} shadow-lg shadow-black/40`}
          >
            <span className="font-mono text-sm text-[#0b1520]">{MOOD_FACE[mood]}</span>
            <span className={`mt-1 h-1.5 w-8 rounded-full ${accent}`} />
          </div>
          <div className="mx-auto mt-1 flex w-12 justify-between">
            <span className={`doodle-leg h-3 w-2 rounded-sm ${accent}`} />
            <span className={`doodle-leg doodle-leg-delay h-3 w-2 rounded-sm ${accent}`} />
          </div>
          {speaking ? (
            <div className="absolute -top-10 left-1/2 w-48 -translate-x-1/2 rounded-xl border border-white/15 bg-[#102433]/95 px-3 py-2 text-center text-xs text-teal-50 shadow-lg">
              {speaking}
            </div>
          ) : null}
        </div>
      </div>

      <div className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-wider text-slate-200">
        {isVijay ? "Thalapathy mode" : "Thala mode"}
      </div>
    </div>
  );
}
