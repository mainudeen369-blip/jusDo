"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
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

function playerKey() {
  if (typeof window === "undefined") return "p";
  const k = "jusdo.scene.playerId";
  let id = localStorage.getItem(k);
  if (!id) {
    id = `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(k, id);
  }
  return id;
}

type RoomView = {
  code: string;
  hostId: string;
  players: { id: string; name: string }[];
  status: string;
  questionIndex: number;
  totalQuestions: number;
  answersCount: number;
  answeredBy: string[];
  lastResults: Record<string, "correct" | "wrong">;
  scores: Record<string, number>;
  question: {
    id: string;
    prompt: string;
    promptTa?: string;
    options: { id: string; text: string; textTa?: string }[];
  } | null;
  teamFull: boolean;
  canStart: boolean;
};

export function SceneArena() {
  const search = useSearchParams();
  const [mode, setMode] = useState<"solo" | "team">("solo");
  const [bank, setBank] = useState<QuizQuestion[]>([]);
  const [bankCount, setBankCount] = useState(0);
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
  const [pid, setPid] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [room, setRoom] = useState<RoomView | null>(null);
  const [teamErr, setTeamErr] = useState<string | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);
  const timerRef = useRef<number | null>(null);
  const answeringRef = useRef(false);
  const scoreRef = useRef(0);
  const bestRef = useRef(0);

  useEffect(() => {
    const s = loadSettings();
    const guest = loadGuest();
    setName(guest?.name || s.displayName || "Fan");
    setClub(s.star);
    setPid(playerKey());
    const roomQ = search.get("room");
    if (roomQ) {
      setMode("team");
      setJoinCode(roomQ.toUpperCase());
    }
    fetch("/api/scenes")
      .then((r) => r.json())
      .then((data) => {
        setBank(data.scenes || []);
        setBankCount(data.count || (data.scenes || []).length);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search]);

  // Auto-join from invite link once player id is ready
  useEffect(() => {
    const roomQ = search.get("room");
    if (!roomQ || !pid || loading) return;
    if (room?.code === roomQ.toUpperCase()) return;
    setMode("team");
    void (async () => {
      const res = await fetch("/api/scene-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          code: roomQ.toUpperCase(),
          playerId: pid,
          playerName: name,
        }),
      });
      const data = await res.json();
      if (res.ok && data.room) setRoom(data.room);
      else if (data.error) setTeamErr(data.error);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid, loading]);

  // Team polling
  useEffect(() => {
    if (mode !== "team" || !room?.code) return;
    const t = window.setInterval(() => {
      fetch(`/api/scene-rooms?code=${encodeURIComponent(room.code)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.room) setRoom(d.room);
        })
        .catch(() => null);
    }, 2000);
    return () => window.clearInterval(t);
  }, [mode, room?.code]);

  const current = round[index];

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

  function startSolo() {
    if (bank.length === 0) return;
    const pickedQs = shuffle(bank).slice(0, Math.min(ROUND_SIZE, bank.length));
    setRound(pickedQs);
    setIndex(0);
    setScore(0);
    scoreRef.current = 0;
    setStreak(0);
    setBest(0);
    bestRef.current = 0;
    setDone(false);
    window.setTimeout(() => startTimer(), 50);
  }

  useEffect(() => () => clearTimer(), []);

  function chooseSolo(optionId: string) {
    if (!current || answeringRef.current || reveal || locked) return;
    answeringRef.current = true;
    setLocked(true);
    clearTimer();
    setPicked(optionId);
    setTimedOut(false);
    const correct = optionId === current.correctOptionId;
    if (correct) {
      const ns = streak + 1;
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setStreak(ns);
      bestRef.current = Math.max(bestRef.current, ns);
      setBest(bestRef.current);
    } else {
      setStreak(0);
    }
    setReveal(true);
  }

  function nextSolo() {
    if (index + 1 >= round.length) {
      finishSolo();
      return;
    }
    setIndex((i) => i + 1);
    window.setTimeout(() => startTimer(), 50);
  }

  function finishSolo() {
    clearTimer();
    setDone(true);
    const guest = loadGuest();
    const payload: QuizScorePayload = {
      playerName: name,
      club,
      score: scoreRef.current,
      total: round.length,
      streak: bestRef.current,
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

  async function api(action: string, extra: Record<string, unknown> = {}) {
    setTeamErr(null);
    const res = await fetch("/api/scene-rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, playerId: pid, playerName: name, ...extra }),
    });
    const data = await res.json();
    if (!res.ok) {
      setTeamErr(data.error || "Request failed");
      return null;
    }
    setRoom(data.room);
    return data.room as RoomView;
  }

  async function createTeam() {
    const r = await api("create");
    if (r?.code) {
      const url = `${window.location.origin}/scenes?room=${r.code}`;
      try {
        await navigator.clipboard.writeText(url);
        setInviteCopied(true);
      } catch {
        setInviteCopied(false);
      }
    }
  }

  async function joinTeam() {
    if (!joinCode.trim()) return;
    await api("join", { code: joinCode.trim().toUpperCase() });
  }

  async function startTeam() {
    if (!room) return;
    await api("start", { code: room.code });
  }

  async function answerTeam(optionId: string) {
    if (!room || room.status !== "playing") return;
    if (room.answeredBy?.includes(pid)) return;
    setPicked(optionId);
    await api("answer", { code: room.code, optionId });
  }

  const inviteUrl = useMemo(() => {
    if (!room?.code || typeof window === "undefined") return "";
    return `${window.location.origin}/scenes?room=${room.code}`;
  }, [room?.code]);

  if (loading) {
    return <div className="p-8 text-slate-400">Loading movie scenes…</div>;
  }

  const rank = done ? rateFan(scoreRef.current, round.length || ROUND_SIZE, club, name) : null;
  const iAnswered = Boolean(room && room.answeredBy?.includes(pid));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#f4c95f]">Tamil cinema</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-white">Movie Scenes</h1>
        <p className="mt-1 text-sm text-slate-300">
          {bankCount} riddles · EN + தமிழ் · Rajini, Kamal, Vijay, Ajith & more · 15 per round
          (shuffled)
        </p>
      </div>

      {!round.length && !done && !(room && room.status !== "lobby") ? (
        <>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["solo", "Solo"],
                ["team", "3-Player Team"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setMode(id);
                  setRoom(null);
                  setTeamErr(null);
                }}
                className={`rounded-lg px-3 py-2 text-sm ${
                  mode === id
                    ? "bg-[#f4c95f] text-[#2a1a00]"
                    : "border border-white/10 bg-white/5 text-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === "solo" ? (
            <div className="rounded-2xl border border-[#f4c95f]/25 bg-[#f4c95f]/10 p-5">
              <p className="text-sm text-slate-200">
                Play as <strong>{name}</strong> · bank {bankCount} · each run picks a fresh 15
              </p>
              <button
                type="button"
                disabled={!bankCount}
                onClick={startSolo}
                className="mt-4 rounded-lg bg-[#f4c95f] px-4 py-2 text-sm font-semibold text-[#2a1a00] disabled:opacity-40"
              >
                Start Difficult scenes
              </button>
            </div>
          ) : (
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-300">
                Create a room, share invite link / code. When 3 join, host starts. Everyone answers
                the same scene; after all three pick, you see who was right/wrong (not the answer),
                then move together.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={createTeam}
                  className="rounded-lg bg-[#f4c95f] px-4 py-2 text-sm font-semibold text-[#2a1a00]"
                >
                  Create team room
                </button>
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <label className="text-sm">
                  <span className="text-slate-400">Join code</span>
                  <input
                    className="mt-1 block rounded-lg border border-white/10 bg-black/30 px-3 py-2 uppercase tracking-widest"
                    value={joinCode}
                    maxLength={6}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  />
                </label>
                <button
                  type="button"
                  onClick={joinTeam}
                  className="rounded-lg border border-teal-300/40 bg-teal-400/10 px-4 py-2 text-sm text-teal-100"
                >
                  Join
                </button>
              </div>
              {teamErr ? <p className="text-sm text-rose-300">{teamErr}</p> : null}
              {room ? (
                <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm">
                  <p className="text-[#f4c95f]">
                    Room <span className="font-mono text-lg tracking-widest">{room.code}</span>
                  </p>
                  {inviteUrl ? (
                    <p className="mt-2 break-all text-xs text-slate-400">
                      Invite: {inviteUrl}
                      {inviteCopied ? " · copied" : ""}
                    </p>
                  ) : null}
                  <ul className="mt-3 space-y-1">
                    {room.players.map((p, i) => (
                      <li key={p.id} className="text-slate-200">
                        {i + 1}. {p.name}
                        {p.id === room.hostId ? " (host)" : ""}
                        {p.id === pid ? " · you" : ""}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-slate-500">
                    {room.players.length}/3 players
                  </p>
                  {room.canStart && pid === room.hostId ? (
                    <button
                      type="button"
                      onClick={startTeam}
                      className="mt-3 rounded-lg bg-teal-400 px-4 py-2 text-sm font-semibold text-[#062018]"
                    >
                      Start 15 scenes together
                    </button>
                  ) : null}
                  {room.teamFull && pid !== room.hostId ? (
                    <p className="mt-2 text-xs text-teal-200">Waiting for host to start…</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
        </>
      ) : null}

      {/* Solo play */}
      {mode === "solo" && current && !done ? (
        <QuestionCard
          index={index}
          total={round.length}
          score={score}
          streak={streak}
          secondsLeft={secondsLeft}
          reveal={reveal}
          timedOut={timedOut}
          locked={locked}
          picked={picked}
          prompt={current.prompt}
          promptTa={current.promptTa}
          options={current.options}
          correctOptionId={current.correctOptionId}
          funFact={current.funFact}
          showCorrectOnReveal
          onChoose={chooseSolo}
          onNext={nextSolo}
          nextLabel={index + 1 >= round.length ? "See results" : "Next scene"}
        />
      ) : null}

      {/* Team play */}
      {mode === "team" && room && (room.status === "playing" || room.status === "question_result") && room.question ? (
        <div className="rounded-2xl border border-white/10 bg-[#0b1a26] p-5">
          <div className="mb-3 flex flex-wrap justify-between gap-2 text-xs text-slate-400">
            <span>
              Scene {room.questionIndex + 1}/{room.totalQuestions} · Room {room.code}
            </span>
            <span>
              Answered {room.answersCount}/{room.players.length}
            </span>
          </div>
          <h2 className="text-lg leading-relaxed text-white">{room.question.prompt}</h2>
          {room.question.promptTa ? (
            <p className="mt-2 text-sm leading-relaxed text-[#f4c95f]/90">{room.question.promptTa}</p>
          ) : null}
          <div className="mt-4 grid gap-2">
            {room.question.options.map((opt) => {
              const mine = picked === opt.id || (iAnswered && room.answeredBy.includes(pid) && picked === opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={iAnswered || room.status !== "playing"}
                  onClick={() => answerTeam(opt.id)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm ${
                    mine
                      ? "border-[#f4c95f]/50 bg-[#f4c95f]/15 text-white"
                      : "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                  } disabled:opacity-70`}
                >
                  <span className="block">{opt.text}</span>
                  {opt.textTa ? <span className="mt-0.5 block text-xs text-slate-400">{opt.textTa}</span> : null}
                </button>
              );
            })}
          </div>
          {room.status === "playing" && iAnswered ? (
            <p className="mt-4 text-sm text-teal-200">Saved — waiting for teammates…</p>
          ) : null}
          {room.status === "question_result" ? (
            <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-xs uppercase tracking-wide text-[#f4c95f]">Round check (no spoiler)</p>
              <ul className="mt-2 space-y-1 text-sm">
                {room.players.map((p) => {
                  const r = room.lastResults[p.id];
                  return (
                    <li key={p.id} className="text-slate-200">
                      <strong>{p.name}</strong>{" "}
                      {r === "correct" ? (
                        <span className="text-teal-300">answered correct</span>
                      ) : (
                        <span className="text-rose-300">answered wrong</span>
                      )}
                      {p.id === pid ? " · you" : ""}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 text-xs text-slate-500">Next scene unlocks together in a few seconds…</p>
              <p className="mt-2 text-xs text-slate-400">
                Scores:{" "}
                {room.players.map((p) => `${p.name} ${room.scores[p.id] || 0}`).join(" · ")}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {mode === "team" && room?.status === "finished" ? (
        <>
          <CrackerBurst active />
          <div className="fan-rank-card rounded-2xl border border-[#f4c95f]/40 bg-[#f4c95f]/10 p-5">
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-white">Team finished!</h2>
            <ul className="mt-3 space-y-1 text-sm text-slate-200">
              {room.players.map((p) => (
                <li key={p.id}>
                  {p.name}: {room.scores[p.id] || 0}/{room.totalQuestions}
                  {p.id === pid ? " · you" : ""}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => {
                setRoom(null);
                setPicked(null);
              }}
              className="mt-4 rounded-lg bg-[#f4c95f] px-4 py-2 text-sm font-semibold text-[#2a1a00]"
            >
              Back to lobby
            </button>
          </div>
        </>
      ) : null}

      {mode === "solo" && done && rank ? (
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
              {scoreRef.current}/{round.length} · best streak {bestRef.current}
            </p>
            <div className="mt-4 rounded-xl border border-[#f4c95f]/40 bg-black/20 p-4">
              <p className="font-[family-name:var(--font-display)] text-2xl text-[#f4c95f]">
                {rank.title}
              </p>
              <p className="mt-2 text-sm text-slate-200">{rank.tagline}</p>
            </div>
            <button
              type="button"
              onClick={startSolo}
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

function QuestionCard(props: {
  index: number;
  total: number;
  score: number;
  streak: number;
  secondsLeft: number;
  reveal: boolean;
  timedOut: boolean;
  locked: boolean;
  picked: string | null;
  prompt: string;
  promptTa?: string;
  options: { id: string; text: string; textTa?: string }[];
  correctOptionId: string;
  funFact?: string;
  showCorrectOnReveal: boolean;
  onChoose: (id: string) => void;
  onNext: () => void;
  nextLabel: string;
}) {
  const {
    index,
    total,
    score,
    streak,
    secondsLeft,
    reveal,
    timedOut,
    locked,
    picked,
    prompt,
    promptTa,
    options,
    correctOptionId,
    funFact,
    showCorrectOnReveal,
    onChoose,
    onNext,
    nextLabel,
  } = props;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1a26] p-5">
      <div className="mb-3 flex justify-between text-xs text-slate-400">
        <span>
          Scene {index + 1}/{total}
        </span>
        <span>
          Score {score} · Streak {streak}
        </span>
      </div>
      {!reveal ? (
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-[#f4c95f]">Time left</span>
            <span className={secondsLeft <= 2 ? "text-rose-300" : "text-white"}>{secondsLeft}s</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-black/40">
            <div
              className="h-full bg-[#f4c95f] transition-all duration-1000 linear"
              style={{ width: `${(secondsLeft / SECONDS) * 100}%` }}
            />
          </div>
        </div>
      ) : null}
      <h2 className="text-lg leading-relaxed text-white">{prompt}</h2>
      {promptTa ? (
        <p className="mt-2 text-sm leading-relaxed text-[#f4c95f]/90">{promptTa}</p>
      ) : null}
      <div className="mt-4 grid gap-2">
        {options.map((opt) => {
          const show = reveal || timedOut;
          const isCorrect = opt.id === correctOptionId;
          const isPick = opt.id === picked;
          let cls = "border-white/10 bg-white/5 hover:bg-white/10";
          if (show && showCorrectOnReveal && isCorrect) cls = "border-teal-400/50 bg-teal-400/20";
          if (show && isPick && !isCorrect) cls = "border-rose-400/50 bg-rose-400/15";
          return (
            <button
              key={opt.id}
              type="button"
              disabled={locked || reveal}
              onClick={() => onChoose(opt.id)}
              className={`rounded-xl border px-4 py-3 text-left text-sm text-slate-100 ${cls}`}
            >
              <span className="block">{opt.text}</span>
              {opt.textTa ? (
                <span className="mt-0.5 block text-xs text-slate-400">{opt.textTa}</span>
              ) : null}
            </button>
          );
        })}
      </div>
      {reveal ? (
        <div className="mt-4 space-y-3">
          {timedOut && !picked ? <p className="text-sm text-rose-300">Time up — no points.</p> : null}
          {funFact ? <p className="text-sm text-[#f4c95f]">Fun fact: {funFact}</p> : null}
          <button
            type="button"
            onClick={onNext}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
          >
            {nextLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
