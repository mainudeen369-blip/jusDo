"use client";

import type { RivalryStats } from "@/lib/types";

export function RivalryMeter({ stats }: { stats: RivalryStats }) {
  const total = stats.vijayWins + stats.ajithWins;
  const vPct = total === 0 ? 50 : Math.round((stats.vijayWins / total) * 100);
  const aPct = 100 - vPct;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-[#f4c95f]">Vijay club {stats.vijayWins}</span>
        <span className="text-xs uppercase tracking-wide text-slate-400">Rivalry meter</span>
        <span className="text-[#9fb7d4]">Ajith club {stats.ajithWins}</span>
      </div>
      <div className="flex h-3 overflow-hidden rounded-full bg-black/40">
        <div className="bg-[#f4c95f] transition-all duration-700" style={{ width: `${vPct}%` }} />
        <div className="bg-[#9fb7d4] transition-all duration-700" style={{ width: `${aPct}%` }} />
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Best quiz streak: <span className="text-teal-200">{stats.bestStreak}</span> · Water streak:{" "}
        <span className="text-teal-200">{stats.waterStreakDays}d</span>
      </p>
    </section>
  );
}
