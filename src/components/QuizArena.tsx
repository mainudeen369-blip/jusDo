"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { loadGuest } from "@/lib/guest";
import { clubLabel, loadRivalry, loadSettings, saveRivalry, SCORES_KEY } from "@/lib/settings";
import { DEFAULT_QUIZ_CONFIG, type QuizConfig } from "@/lib/quiz-config-shared";
import type {
  QuizDifficulty,
  QuizQuestion,
  QuizScorePayload,
  RivalryStats,
  StarId,
} from "@/lib/types";

type PlayMode = "solo" | "versus";
type Turn = "p1" | "p2" | "reveal";

function questionDifficulty(q: QuizQuestion): QuizDifficulty {
  return q.difficulty === "difficult" ? "difficult" : "easy";
}

function shuffle<T>(arr: T[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function QuizArena() {
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("easy");
  const [playMode, setPlayMode] = useState<PlayMode>("solo");
  const [club, setClub] = useState<StarId>("vijay");
  const [club2, setClub2] = useState<StarId>("ajith");
  const [name, setName] = useState("Player 1");
  const [name2, setName2] = useState("Player 2");
  const [config, setConfig] = useState<QuizConfig>(DEFAULT_QUIZ_CONFIG);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [round, setRound] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState<Turn>("p1");
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [streak1, setStreak1] = useState(0);
  const [streak2, setStreak2] = useState(0);
  const [best1, setBest1] = useState(0);
  const [best2, setBest2] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [locked, setLocked] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rivalry, setRivalry] = useState<RivalryStats | null>(null);
  const timerRef = useRef<number | null>(null);
  const answeringRef = useRef(false);

  useEffect(() => {
    const s = loadSettings();
    const guest = loadGuest();
    setClub(s.star);
    setClub2(s.star === "vijay" ? "ajith" : "vijay");
    setName(guest?.name || s.displayName || "Player 1");
    setRivalry(loadRivalry());
    Promise.all([
      fetch("/api/questions").then((r) => r.json()),
      fetch("/api/quiz-config").then((r) => r.json()),
    ])
      .then(([qData, cData]) => {
        setQuestions(qData.questions || []);
        if (cData.config) setConfig(cData.config);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const current = round[index];
  const pool = useMemo(() => {
    const byDiff = questions.filter((q) => questionDifficulty(q) === difficulty);
    // Difficult set is shared combo trivia — don't shrink it by club.
    if (difficulty === "difficult") return byDiff;
    if (playMode === "versus") {
      return byDiff.filter((q) => q.star === "both" || q.star === club || q.star === club2);
    }
    return byDiff.filter((q) => q.star === club || q.star === "both");
  }, [questions, club, club2, playMode, difficulty]);

  const roundSize = difficulty === "difficult" ? 15 : config.questionsPerRound;

  function clearTimer() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function startTimer(seconds: number) {
    clearTimer();
    answeringRef.current = false;
    setLocked(false);
    setSecondsLeft(seconds);
    setTimedOut(false);
    setPicked(null);
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
    setPicked(null);
    if (playMode === "solo") {
      setStreak1(0);
      setTurn("reveal");
    } else if (turn === "p1") {
      setStreak1(0);
      // hand to p2 after brief beat
      window.setTimeout(() => beginTurn("p2"), 600);
    } else if (turn === "p2") {
      setStreak2(0);
      setTurn("reveal");
    }
  }

  function beginTurn(next: "p1" | "p2") {
    setTurn(next);
    startTimer(config.secondsPerQuestion);
  }

  function startRound() {
    const need = Math.max(1, roundSize);
    // Fill the full round even if the bank is smaller — reshuffle and reuse.
    const pickedQs: QuizQuestion[] = [];
    if (pool.length === 0) return;
    while (pickedQs.length < need) {
      const batch = shuffle(pool);
      for (const q of batch) {
        if (pickedQs.length >= need) break;
        // Fresh id so React/list keys stay unique when a question repeats
        pickedQs.push({ ...q, id: `${q.id}#${pickedQs.length + 1}` });
      }
    }
    setRound(pickedQs);
    setIndex(0);
    setScore1(0);
    setScore2(0);
    setStreak1(0);
    setStreak2(0);
    setBest1(0);
    setBest2(0);
    setDone(false);
    setTurn("p1");
    window.setTimeout(() => startTimer(config.secondsPerQuestion), 50);
  }

  useEffect(() => () => clearTimer(), []);

  function choose(optionId: string) {
    if (!current || answeringRef.current || turn === "reveal" || locked) return;
    answeringRef.current = true;
    setLocked(true);
    clearTimer();
    setPicked(optionId);
    setTimedOut(false);
    const correct = optionId === current.correctOptionId;

    if (playMode === "solo" || turn === "p1") {
      if (correct) {
        const ns = streak1 + 1;
        setScore1((s) => s + 1);
        setStreak1(ns);
        setBest1((b) => Math.max(b, ns));
      } else {
        setStreak1(0);
      }
      if (playMode === "versus") {
        window.setTimeout(() => beginTurn("p2"), 700);
      } else {
        setTurn("reveal");
      }
      return;
    }

    if (turn === "p2") {
      if (correct) {
        const ns = streak2 + 1;
        setScore2((s) => s + 1);
        setStreak2(ns);
        setBest2((b) => Math.max(b, ns));
      } else {
        setStreak2(0);
      }
      setTurn("reveal");
    }
  }

  function nextQuestion() {
    if (index + 1 >= round.length) {
      finish();
      return;
    }
    setIndex((i) => i + 1);
    setTurn("p1");
    setPicked(null);
    setTimedOut(false);
    window.setTimeout(() => startTimer(config.secondsPerQuestion), 50);
  }

  function finish() {
    clearTimer();
    setDone(true);
    const guest = loadGuest();
    const payloads: QuizScorePayload[] = [
      {
        playerName: name,
        club,
        score: score1,
        total: round.length,
        streak: best1,
        at: new Date().toISOString(),
        guestId: guest?.id,
      },
    ];
    if (playMode === "versus") {
      payloads.push({
        playerName: name2,
        club: club2,
        score: score2,
        total: round.length,
        streak: best2,
        at: new Date().toISOString(),
      });
    }
    try {
      const prev = JSON.parse(localStorage.getItem(SCORES_KEY) || "[]") as QuizScorePayload[];
      localStorage.setItem(SCORES_KEY, JSON.stringify([...payloads, ...prev].slice(0, 30)));
    } catch {
      // ignore
    }
    // Publish to shared Top Fans board
    void Promise.all(
      payloads.map((p) =>
        fetch("/api/scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(p),
        }).catch(() => null),
      ),
    ).then(() => {
      window.dispatchEvent(new Event("jusdo:scores-updated"));
    });
    const stats = loadRivalry();
    const winnerClub =
      playMode === "versus"
        ? score1 === score2
          ? null
          : score1 > score2
            ? club
            : club2
        : score1 >= Math.ceil(round.length / 2)
          ? club
          : null;
    if (winnerClub === "vijay") stats.vijayWins += 1;
    if (winnerClub === "ajith") stats.ajithWins += 1;
    stats.lastClub = club;
    stats.bestStreak = Math.max(stats.bestStreak, best1, playMode === "versus" ? best2 : 0);
    saveRivalry(stats);
    setRivalry(stats);
  }

  if (loading) {
    return <div className="p-8 text-slate-400">Loading fan arena…</div>;
  }

  const activeName = turn === "p2" ? name2 : name;
  const activeScore = turn === "p2" ? score2 : score1;
  const activeStreak = turn === "p2" ? streak2 : streak1;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-white">Fan Club Quiz</h1>
        <p className="mt-1 text-sm text-slate-300">
          {difficulty === "difficult" ? "Difficult" : "Easy"} · {roundSize} questions ·{" "}
          {config.secondsPerQuestion}s each · miss the timer = 0 points
        </p>
      </div>

      {!round.length && !done ? (
        <>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">Choose set</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["easy", "Easy", "Fan classics & titles"],
                  ["difficult", "Difficult", "Combos · music · scenes · character shades"],
                ] as [QuizDifficulty, string, string][]
              ).map(([id, label, hint]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDifficulty(id)}
                  className={`rounded-xl px-4 py-3 text-left text-sm transition ${
                    difficulty === id
                      ? id === "difficult"
                        ? "bg-[#f4c95f] text-[#2a1a00]"
                        : "bg-teal-400 text-[#062018]"
                      : "border border-white/10 bg-white/5 text-slate-200"
                  }`}
                >
                  <span className="block font-semibold">{label}</span>
                  <span className={`mt-0.5 block text-[11px] ${difficulty === id ? "opacity-80" : "text-slate-400"}`}>
                    {hint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["solo", "versus"] as PlayMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setPlayMode(m)}
                className={`rounded-lg px-3 py-2 text-sm ${
                  playMode === m
                    ? "bg-teal-400 text-[#062018]"
                    : "border border-white/10 bg-white/5 text-slate-200"
                }`}
              >
                {m === "solo" ? "1 Player" : "2 Players together"}
              </button>
            ))}
          </div>

          <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="text-slate-400">Player 1 name</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="text-sm">
              <span className="text-slate-400">Player 1 club</span>
              <select
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
                value={club}
                onChange={(e) => setClub(e.target.value as StarId)}
              >
                <option value="vijay">{clubLabel("vijay")}</option>
                <option value="ajith">{clubLabel("ajith")}</option>
              </select>
            </label>
            {playMode === "versus" ? (
              <>
                <label className="text-sm">
                  <span className="text-slate-400">Player 2 name</span>
                  <input
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
                    value={name2}
                    onChange={(e) => setName2(e.target.value)}
                  />
                </label>
                <label className="text-sm">
                  <span className="text-slate-400">Player 2 club</span>
                  <select
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
                    value={club2}
                    onChange={(e) => setClub2(e.target.value as StarId)}
                  >
                    <option value="vijay">{clubLabel("vijay")}</option>
                    <option value="ajith">{clubLabel("ajith")}</option>
                  </select>
                </label>
              </>
            ) : null}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-300">
              {difficulty === "difficult" ? "Difficult" : "Easy"} bank: {pool.length} unique · this
              round: {roundSize} Qs · {config.secondsPerQuestion}s timer
              {pool.length > 0 && pool.length < roundSize
                ? ` · repeats allowed to fill ${roundSize}`
                : ""}
            </p>
            <button
              type="button"
              disabled={pool.length === 0}
              onClick={startRound}
              className={`mt-4 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-40 ${
                difficulty === "difficult"
                  ? "bg-[#f4c95f] text-[#2a1a00]"
                  : "bg-teal-400 text-[#062018]"
              }`}
            >
              Start {difficulty} {playMode === "versus" ? "versus" : "solo"} round
            </button>
          </div>
        </>
      ) : null}

      {current && !done ? (
        <div className="rounded-2xl border border-white/10 bg-[#0b1a26] p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>
              Q{index + 1}/{round.length}
              {playMode === "versus" ? ` · ${activeName}'s turn` : ""}
            </span>
            <span>
              {playMode === "versus"
                ? `${name} ${score1} — ${score2} ${name2}`
                : `Score ${activeScore} · Streak ${activeStreak}`}
            </span>
          </div>

          {turn !== "reveal" ? (
            <div className="mb-4">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-teal-200">Time left</span>
                <span className={secondsLeft <= 2 ? "text-rose-300" : "text-white"}>
                  {secondsLeft}s
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/40">
                <div
                  className="h-full bg-teal-400 transition-all duration-1000 linear"
                  style={{
                    width: `${(secondsLeft / Math.max(config.secondsPerQuestion, 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          ) : null}

          <h2 className="text-lg text-white">{current.prompt}</h2>
          <div className="mt-4 grid gap-2">
            {current.options.map((opt) => {
              const show = turn === "reveal" || timedOut;
              const isCorrect = opt.id === current.correctOptionId;
              const isPick = opt.id === picked;
              let cls = "border-white/10 bg-white/5 hover:bg-white/10";
              if (show && isCorrect) cls = "border-teal-400/50 bg-teal-400/20";
              if (show && isPick && !isCorrect) cls = "border-rose-400/50 bg-rose-400/15";
              if (turn === "reveal" || timedOut) cls += " opacity-90";
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={locked || turn === "reveal"}
                  onClick={() => choose(opt.id)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm text-slate-100 ${cls}`}
                >
                  {opt.text}
                </button>
              );
            })}
          </div>

          {turn === "reveal" ? (
            <div className="mt-4 space-y-3">
              {timedOut && !picked ? (
                <p className="text-sm text-rose-300">Time up — no points for this turn.</p>
              ) : null}
              {current.funFact ? (
                <p className="text-sm text-[#f4c95f]">Fun fact: {current.funFact}</p>
              ) : null}
              <button
                type="button"
                onClick={nextQuestion}
                className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
              >
                {index + 1 >= round.length ? "See results" : "Next question"}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {done ? (
        <div className="rounded-2xl border border-teal-400/30 bg-teal-400/10 p-5">
          {playMode === "versus" ? (
            <>
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-white">
                {score1 === score2
                  ? "It's a draw!"
                  : score1 > score2
                    ? `${name} wins!`
                    : `${name2} wins!`}
              </h2>
              <p className="mt-2 text-sm text-slate-200">
                {name} ({clubLabel(club)}): {score1}/{round.length}
              </p>
              <p className="text-sm text-slate-200">
                {name2} ({clubLabel(club2)}): {score2}/{round.length}
              </p>
            </>
          ) : (
            <>
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-white">
                {score1}/{round.length} for {clubLabel(club)}
              </h2>
              <p className="mt-2 text-sm text-slate-300">Best streak: {best1}</p>
            </>
          )}
          {rivalry ? (
            <p className="mt-2 text-xs text-slate-400">
              Club wins — Vijay {rivalry.vijayWins} · Ajith {rivalry.ajithWins}
            </p>
          ) : null}
          <button
            type="button"
            onClick={startRound}
            className="mt-4 rounded-lg border border-white/15 px-4 py-2 text-sm text-white"
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
            className="ml-2 mt-4 rounded-lg bg-white/10 px-4 py-2 text-sm text-white"
          >
            Back to setup
          </button>
        </div>
      ) : null}
    </div>
  );
}
