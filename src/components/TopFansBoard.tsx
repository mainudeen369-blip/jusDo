"use client";

import { useEffect, useState } from "react";
import { clubLabel } from "@/lib/settings";
import type { QuizDifficulty, StarId } from "@/lib/types";

interface TopFan {
  playerName: string;
  club: StarId;
  score: number;
  total: number;
  percent: number;
  streak: number;
  at?: string;
  difficulty?: QuizDifficulty;
}

function FanList({
  title,
  accent,
  rows,
}: {
  title: string;
  accent: "gold" | "teal";
  rows: TopFan[];
}) {
  const border =
    accent === "gold" ? "border-[#f4c95f]/30 bg-[#f4c95f]/10" : "border-teal-400/30 bg-teal-400/10";
  const label = accent === "gold" ? "text-[#f4c95f]" : "text-teal-200";

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className={`font-[family-name:var(--font-display)] text-lg ${label}`}>{title}</h3>
        <span className="text-[10px] uppercase tracking-wide text-slate-500">top {rows.length || 0}</span>
      </div>

      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">No {title.toLowerCase()} scores yet.</p>
      ) : (
        <>
          <div className={`mt-3 rounded-lg border px-3 py-2 ${border}`}>
            <p className={`text-[10px] uppercase tracking-[0.16em] ${label}`}>#1</p>
            <p className="mt-0.5 font-semibold text-white">{rows[0].playerName}</p>
            <p className="text-xs text-slate-300">
              {rows[0].score}/{rows[0].total} ({rows[0].percent}%) · {clubLabel(rows[0].club)}
            </p>
          </div>
          <ol className="mt-2 space-y-1.5">
            {rows.map((row, i) => (
              <li
                key={`${title}-${row.playerName}-${row.at || i}`}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-black/25 px-3 py-2 text-sm"
              >
                <span
                  className={`w-6 shrink-0 text-center font-semibold ${
                    i === 0 ? label : "text-slate-500"
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
    </div>
  );
}

export function TopFansBoard() {
  const [easy, setEasy] = useState<TopFan[]>([]);
  const [difficult, setDifficult] = useState<TopFan[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    fetch("/api/scores")
      .then((r) => r.json())
      .then((data) => {
        setEasy(data.topEasy || []);
        setDifficult(data.topDifficult || []);
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

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-white">Top Fans</h2>
        <span className="text-[10px] uppercase tracking-wide text-slate-500">
          Easy & Difficult separate
        </span>
      </div>

      {loading ? (
        <p className="mt-3 text-sm text-slate-400">Loading board…</p>
      ) : (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <FanList title="Difficult" accent="gold" rows={difficult} />
          <FanList title="Easy" accent="teal" rows={easy} />
        </div>
      )}
    </section>
  );
}
