"use client";

import { useEffect, useMemo, useState } from "react";
import { clubLabel, loadRivalry, loadSettings, saveRivalry, SCORES_KEY } from "@/lib/settings";
import type { QuizQuestion, QuizScorePayload, RivalryStats, StarId } from "@/lib/types";

const ROUND_SIZE = 5;

function shuffle<T>(arr: T[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function QuizArena() {
  const [club, setClub] = useState<StarId>("vijay");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [round, setRound] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rivalry, setRivalry] = useState<RivalryStats | null>(null);
  const [name, setName] = useState("Fan");

  useEffect(() => {
    const s = loadSettings();
    setClub(s.star);
    setName(s.displayName || "Fan");
    setRivalry(loadRivalry());
    fetch("/api/questions")
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data.questions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const current = round[index];

  const pool = useMemo(() => {
    return questions.filter((q) => q.star === club || q.star === "both");
  }, [questions, club]);

  function startRound() {
    const pickedQs = shuffle(pool).slice(0, Math.min(ROUND_SIZE, pool.length));
    setRound(pickedQs);
    setIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setPicked(null);
    setDone(false);
  }

  function choose(optionId: string) {
    if (!current || picked) return;
    setPicked(optionId);
    const correct = optionId === current.correctOptionId;
    const nextStreak = correct ? streak + 1 : 0;
    const nextBest = correct ? Math.max(bestStreak, nextStreak) : bestStreak;
    const nextScore = correct ? score + 1 : score;
    if (correct) {
      setScore(nextScore);
      setStreak(nextStreak);
      setBestStreak(nextBest);
    } else {
      setStreak(0);
    }
  }

  function next() {
    if (index + 1 >= round.length) {
      finish(score, bestStreak);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  }

  function finish(finalScore: number, finalBestStreak: number) {
    setDone(true);
    const payload: QuizScorePayload = {
      playerName: name,
      club,
      score: finalScore,
      total: round.length,
      streak: finalBestStreak,
      at: new Date().toISOString(),
    };
    try {
      const prev = JSON.parse(localStorage.getItem(SCORES_KEY) || "[]") as QuizScorePayload[];
      localStorage.setItem(SCORES_KEY, JSON.stringify([payload, ...prev].slice(0, 20)));
    } catch {
      // ignore
    }
    const stats = loadRivalry();
    if (finalScore >= Math.ceil(round.length / 2)) {
      if (club === "vijay") stats.vijayWins += 1;
      else stats.ajithWins += 1;
    }
    stats.lastClub = club;
    stats.bestStreak = Math.max(stats.bestStreak, finalBestStreak);
    saveRivalry(stats);
    setRivalry(stats);
  }

  function shareText() {
    return `I scored ${score}/${round.length} for ${clubLabel(club)} on jusDo! Best streak ${bestStreak}. Thala vs Thalapathy — your move.`;
  }

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(shareText());
      alert("Score card copied — paste anywhere.");
    } catch {
      alert(shareText());
    }
  }

  if (loading) {
    return <div className="p-8 text-slate-400">Loading fan arena…</div>;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-white">Fan Club Quiz</h1>
        <p className="mt-1 text-sm text-slate-300">
          Vijay Fans Club vs Ajith Fans Club — movie history, titles, and bragging rights.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["vijay", "ajith"] as StarId[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setClub(id)}
            className={`rounded-lg px-3 py-2 text-sm ${
              club === id
                ? id === "vijay"
                  ? "bg-[#f4c95f] text-[#1a1408]"
                  : "bg-[#9fb7d4] text-[#101820]"
                : "border border-white/10 bg-white/5 text-slate-200"
            }`}
          >
            {clubLabel(id)}
          </button>
        ))}
      </div>

      {!round.length && !done ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-300">
            {pool.length} questions ready for {clubLabel(club)}. Play {Math.min(ROUND_SIZE, pool.length)}{" "}
            each round.
          </p>
          <button
            type="button"
            disabled={pool.length === 0}
            onClick={startRound}
            className="mt-4 rounded-lg bg-teal-400 px-4 py-2 text-sm font-semibold text-[#062018] disabled:opacity-40"
          >
            Start round
          </button>
        </div>
      ) : null}

      {current && !done ? (
        <div className="rounded-2xl border border-white/10 bg-[#0b1a26] p-5">
          <div className="mb-3 flex justify-between text-xs text-slate-400">
            <span>
              Q{index + 1}/{round.length}
            </span>
            <span>
              Score {score} · Streak {streak}
            </span>
          </div>
          <h2 className="text-lg text-white">{current.prompt}</h2>
          <div className="mt-4 grid gap-2">
            {current.options.map((opt) => {
              const show = Boolean(picked);
              const isCorrect = opt.id === current.correctOptionId;
              const isPick = opt.id === picked;
              let cls = "border-white/10 bg-white/5 hover:bg-white/10";
              if (show && isCorrect) cls = "border-teal-400/50 bg-teal-400/20";
              if (show && isPick && !isCorrect) cls = "border-rose-400/50 bg-rose-400/15";
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={Boolean(picked)}
                  onClick={() => choose(opt.id)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm text-slate-100 ${cls}`}
                >
                  {opt.text}
                </button>
              );
            })}
          </div>
          {picked ? (
            <div className="mt-4 space-y-3">
              {current.funFact ? (
                <p className="text-sm text-[#f4c95f]">Fun fact: {current.funFact}</p>
              ) : null}
              <button
                type="button"
                onClick={next}
                className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
              >
                {index + 1 >= round.length ? "See results" : "Next"}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {done ? (
        <div className="rounded-2xl border border-teal-400/30 bg-teal-400/10 p-5">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-white">
            {score}/{round.length} for {clubLabel(club)}
          </h2>
          <p className="mt-2 text-sm text-slate-300">Best streak this round: {bestStreak}</p>
          {rivalry ? (
            <p className="mt-1 text-xs text-slate-400">
              Club wins — Vijay {rivalry.vijayWins} · Ajith {rivalry.ajithWins}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyShare}
              className="rounded-lg bg-[#f4c95f] px-4 py-2 text-sm font-semibold text-[#1a1408]"
            >
              Copy score card
            </button>
            <button
              type="button"
              onClick={startRound}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white"
            >
              Play again
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
