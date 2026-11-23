"use client";

import { useMemo } from "react";
import type { StarId } from "@/lib/types";
import { starLabel } from "@/lib/settings";

const NUDGES = [
  "Finish a glass of water before your next scroll.",
  "Take 10 deep breaths — interval training for calm.",
  "Stand up and walk 20 steps with your doodle energy.",
  "Send a kind ping to a friend in your fan club.",
  "Log one win from today — tiny counts.",
];

const TRIVIA_TEASERS = [
  "Which film turned a classroom into a war zone of charisma?",
  "Who holds the racing wheel off-screen as tightly as on-screen?",
  "Arabic Kuthu or Vikram BGM — which drops first in your head?",
  "Thala or Thalapathy — can you match titles without blinking?",
];

function dayIndex() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

export function DailyChallenge({ star }: { star: StarId }) {
  const { nudge, tease } = useMemo(() => {
    const i = dayIndex();
    return {
      nudge: NUDGES[i % NUDGES.length],
      tease: TRIVIA_TEASERS[i % TRIVIA_TEASERS.length],
    };
  }, []);

  return (
    <section className="rounded-2xl border border-teal-400/20 bg-gradient-to-br from-teal-500/10 to-transparent p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-teal-200/80">Daily from {starLabel(star)}</p>
      <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl text-white">Challenge card</h2>
      <p className="mt-2 text-sm text-slate-200">{nudge}</p>
      <p className="mt-3 rounded-xl bg-black/25 px-3 py-2 text-sm text-[#f4c95f]">Trivia tease: {tease}</p>
    </section>
  );
}
