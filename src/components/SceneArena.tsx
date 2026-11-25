"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CrackerBurst } from "@/components/CrackerBurst";
import { loadGuest } from "@/lib/guest";
import { rateFan } from "@/lib/fan-rank";
import { loadSettings } from "@/lib/settings";
import type { QuizQuestion, QuizScorePayload, StarId } from "@/lib/types";

const ROUND_SIZE = 15;
const SECONDS = 12;

function shuffle<T>(arr: T[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function SceneArena() {
  const [bank, setBank] = useState<QuizQuestion[]>([]);
  const [round, setRound] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [locked, setLocked] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(SECONDS);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("Fan");
  const [club, setClub] = useState<StarId>("vijay");
  const timerRef = useRef<number | null>(null);
  const answeringRef = useRef(false);

  useEffect(() => {
    const s = loadSettings();
    const guest = loadGuest();
    setName(guest?.name || s.displayName || "Fan");
    setClub(s.star);
    fetch("/api/scenes")
      .then((r) => r.json())
      .then((data) => {
        setBank(data.scenes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const current = round[index];

  const pool = useMemo(() => bank, [bank]);

  function clearTimer() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function startTimer() {
    clearTimer();
    answeringRef.current = false;
    setLocked(false);
    setReveal(false);
    setPicked(null);
    setTimedOut(false);
    setSecondsLeft(SECONDS);
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearTimer();
          onTimeout();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  function onTimeout() {
    if (answeringRef.current) return;
    answeringRef.current = true;
    setLocked(true);
    setTimedOut(true);
    setStreak(0);
    setReveal(true);
  }

  function startRound() {
    if (pool.length === 0) return;
    const need = ROUND_SIZE;
    const pickedQs: QuizQuestion[] = [];
    while (pickedQs.length < need) {
      for (const q of shuffle(pool)) {
        if (pickedQs.length >= need) break;
        pickedQs.push({ ...q, id: `${q.id}#${pickedQs.length + 1}` });
      }
    }
    setRound(pickedQs);
    setIndex(0);
    setScore(0);
    setStreak(0);
    setBest(0);
    setDone(false);
    window.setTimeout(() => startTimer(), 50);
  }

  useEffect(() => () => clearTimer(), []);

  function choose(optionId: string) {
    if (!current || answeringRef.current || reveal || locked) return;
    answeringRef.current = true;
    setLocked(true);
    clearTimer();
    setPicked(optionId);
    setTimedOut(false);
    const correct = optionId === current.correctOptionId;
    if (correct) {
      const ns = streak + 1;
      setScore((s) => s + 1);
      setStreak(ns);
      setBest((b) => Math.max(b, ns));
    } else {
      setStreak(0);
    }
    setReveal(true);
  }

  function next() {
    if (index + 1 >= round.length) {
      finish();
      return;
    }
    setIndex((i) => i + 1);
    window.setTimeout(() => startTimer(), 50);
  }

  function finish() {
    clearTimer();
    setDone(true);
    const guest = loadGuest();
    const payload: QuizScorePayload = {
      playerName: name,
      club,
      score,
      total: round.length,
      streak: best,
      at: new Date().toISOString(),
      guestId: guest?.id,
      difficulty: "difficult",
      game: "scenes",
    };
    void fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(() => window.dispatchEvent(new Event("jusdo:scores-updated")));
  }

  if (loading) {
    return <div className="p-8 text-slate-400">Loading movie scenes…</div>;
  }

  const rank = done ? rateFan(score, round.length, club, name) : null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#f4c95f]">New game</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-white">
          Movie Scenes
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Famous Tamil stories told sideways — guess the film. 15 riddles · {SECONDS}s each ·
          Difficult
        </p>
      </div>

      {!round.length && !done ? (
        <div className="rounded-2xl border border-[#f4c95f]/25 bg-[#f4c95f]/10 p-5">
          <p className="text-sm text-slate-200">
            Bank: {pool.length} scene riddles · play as <strong>{name}</strong>
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Example vibe: dual role — hero machine / villain machine who loves the hero’s girl →
            Enthiran.
          </p>
          <button
            type="button"
            disabled={pool.length === 0}
            onClick={startRound}
            className="mt-4 rounded-lg bg-[#f4c95f] px-4 py-2 text-sm font-semibold text-[#2a1a00] disabled:opacity-40"
          >
            Start Difficult scenes
          </button>
        </div>
      ) : null}

      {current && !done ? (
        <div className="rounded-2xl border border-white/10 bg-[#0b1a26] p-5">
          <div className="mb-3 flex justify-between text-xs text-slate-400">
            <span>
              Scene {index + 1}/{round.length}
            </span>
            <span>
              Score {score} · Streak {streak}
            </span>
          </div>
          {!reveal ? (
            <div className="mb-4">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-[#f4c95f]">Time left</span>
                <span className={secondsLeft <= 2 ? "text-rose-300" : "text-white"}>
                  {secondsLeft}s
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/40">
                <div
                  className="h-full bg-[#f4c95f] transition-all duration-1000 linear"
                  style={{ width: `${(secondsLeft / SECONDS) * 100}%` }}
                />
              </div>
            </div>
          ) : null}
          <h2 className="text-lg leading-relaxed text-white">{current.prompt}</h2>
          <div className="mt-4 grid gap-2">
            {current.options.map((opt) => {
              const show = reveal || timedOut;
              const isCorrect = opt.id === current.correctOptionId;
              const isPick = opt.id === picked;
              let cls = "border-white/10 bg-white/5 hover:bg-white/10";
              if (show && isCorrect) cls = "border-teal-400/50 bg-teal-400/20";
              if (show && isPick && !isCorrect) cls = "border-rose-400/50 bg-rose-400/15";
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={locked || reveal}
                  onClick={() => choose(opt.id)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm text-slate-100 ${cls}`}
                >
                  {opt.text}
                </button>
              );
            })}
          </div>
          {reveal ? (
            <div className="mt-4 space-y-3">
              {timedOut && !picked ? (
                <p className="text-sm text-rose-300">Time up — no points.</p>
              ) : null}
              {current.funFact ? (
                <p className="text-sm text-[#f4c95f]">Fun fact: {current.funFact}</p>
              ) : null}
              <button
                type="button"
                onClick={next}
                className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
              >
                {index + 1 >= round.length ? "See results" : "Next scene"}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {done && rank ? (
        <>
          <CrackerBurst active={done} />
          <div className="fan-rank-card rounded-2xl border border-[#f4c95f]/40 bg-gradient-to-br from-[#f4c95f]/15 via-teal-400/10 to-transparent p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#f4c95f]">
              Movie Scenes · Difficult
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-white">
              Bravo, {name}!
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              {score}/{round.length} films cracked · best streak {best}
            </p>
            <div className="mt-4 rounded-xl border border-[#f4c95f]/40 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-wide text-slate-400">Scene detective rank</p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[#f4c95f]">
                {rank.title}
              </p>
              <p className="mt-2 text-sm text-slate-200">{rank.tagline}</p>
              <p className="mt-3 text-xl text-[#f4c95f]">
                {"★".repeat(rank.stars)}
                <span className="text-slate-600">{"★".repeat(Math.max(0, 5 - rank.stars))}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={startRound}
              className="mt-4 rounded-lg bg-[#f4c95f] px-4 py-2 text-sm font-semibold text-[#2a1a00]"
            >
              Play again
            </button>
            <button
              type="button"
              onClick={() => {
                clearTimer();
                setRound([]);
                setDone(false);
              }}
              className="ml-2 mt-4 rounded-lg border border-white/15 px-4 py-2 text-sm text-white"
            >
              Back
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
