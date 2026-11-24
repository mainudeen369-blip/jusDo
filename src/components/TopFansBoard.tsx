"use client";

import { useEffect, useState } from "react";
import { clubLabel } from "@/lib/settings";
import type { StarId } from "@/lib/types";

interface TopFan {
  playerName: string;
  club: StarId;
  score: number;
  total: number;
  percent: number;
  streak: number;
  at?: string;
}

export function TopFansBoard() {
  const [top, setTop] = useState<TopFan[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    fetch("/api/scores")
      .then((r) => r.json())
      .then((data) => {
        setTop(data.top || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    window.addEventListener("jusdo:scores-updated", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("jusdo:scores-updated", onFocus);
    };
  }, []);

  const champ = top[0];

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-white">Top Fans</h2>
        <span className="text-[10px] uppercase tracking-wide text-slate-500">highest quiz marks</span>
      </div>

      {loading ? (
        <p className="mt-3 text-sm text-slate-400">Loading board…</p>
      ) : top.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">
          No scores yet — play the Fan Quiz to claim #1.
        </p>
      ) : (
        <>
          {champ ? (
            <div className="mt-3 rounded-xl border border-[#f4c95f]/30 bg-[#f4c95f]/10 px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#f4c95f]">#1 fan</p>
              <p className="mt-0.5 text-lg font-semibold text-white">{champ.playerName}</p>
              <p className="text-xs text-slate-300">
                {champ.score}/{champ.total} ({champ.percent}%) · {clubLabel(champ.club)}
              </p>
            </div>
          ) : null}

          <ol className="mt-3 space-y-1.5">
            {top.map((row, i) => (
              <li
                key={`${row.playerName}-${row.at || i}`}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-sm"
              >
                <span
                  className={`w-6 shrink-0 text-center font-semibold ${
                    i === 0 ? "text-[#f4c95f]" : i === 1 ? "text-slate-200" : i === 2 ? "text-amber-700" : "text-slate-500"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-white">{row.playerName}</p>
                  <p className="text-[11px] text-slate-400">{clubLabel(row.club)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-teal-200">
                    {row.score}/{row.total}
                  </p>
                  <p className="text-[11px] text-slate-500">{row.percent}%</p>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
