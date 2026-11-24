"use client";

import { useEffect, useState } from "react";
import type { StarId } from "@/lib/types";
import { starLabel } from "@/lib/settings";

const NUDGES = [
  "Please finish a glass of water before your next scroll.",
  "Take 10 calm breaths — a quiet pause strengthens focus.",
  "Stand up and walk twenty steps — move with dignity.",
  "Share a kind word with someone in your fan family.",
  "Note one good effort from today — small steps matter.",
];

const TRIVIA_TEASERS = [
  "Which film turned a classroom into a war zone of charisma?",
  "Who holds the racing wheel off-screen as tightly as on-screen?",
  "Arabic Kuthu or Vedalam's Aaluma Doluma — which drops first in your head?",
  "Thala or Thalapathy — can you match titles without blinking?",
];

export function DailyChallenge({ star }: { star: StarId }) {
  const [nudge, setNudge] = useState(NUDGES[0]);
  const [tease, setTease] = useState(TRIVIA_TEASERS[0]);

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const i = Math.floor((now.getTime() - start.getTime()) / 86400000);
    setNudge(NUDGES[i % NUDGES.length]);
    setTease(TRIVIA_TEASERS[i % TRIVIA_TEASERS.length]);
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
