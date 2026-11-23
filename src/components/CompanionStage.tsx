"use client";

import { useEffect, useMemo, useState } from "react";
import { DoodleWalk } from "@/components/DoodleWalk";
import { DailyChallenge } from "@/components/DailyChallenge";
import { RivalryMeter } from "@/components/RivalryMeter";
import {
  isQuietHour,
  loadRivalry,
  loadSettings,
  saveRivalry,
  starLabel,
} from "@/lib/settings";
import type { CompanionMood, JusDoSettings, RivalryStats } from "@/lib/types";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function CompanionStage() {
  const [settings, setSettings] = useState<JusDoSettings | null>(null);
  const [rivalry, setRivalry] = useState<RivalryStats | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [mood, setMood] = useState<CompanionMood>("happy");
  const [lastFired, setLastFired] = useState<Record<string, number>>({});

  useEffect(() => {
    setSettings(loadSettings());
    setRivalry(loadRivalry());
  }, []);

  useEffect(() => {
    const onStorage = () => {
      setSettings(loadSettings());
      setRivalry(loadRivalry());
    };
    window.addEventListener("focus", onStorage);
    return () => window.removeEventListener("focus", onStorage);
  }, []);

  const activeReminders = useMemo(
    () => settings?.reminders.filter((r) => r.enabled) ?? [],
    [settings],
  );

  useEffect(() => {
    if (!settings || !rivalry) return;

    const tick = () => {
      if (isQuietHour(settings)) {
        setMood("sleepy");
        return;
      }

      const now = new Date();
      const ms = now.getTime();

      for (const rem of activeReminders) {
        if (rem.kind === "alarm" && rem.hour != null && rem.minute != null) {
          if (now.getHours() === rem.hour && now.getMinutes() === rem.minute) {
            const key = `${rem.id}-${todayKey()}-${rem.hour}:${rem.minute}`;
            if (!lastFired[key]) {
              fireReminder(rem.customMessage || rem.label, "nudge");
              setLastFired((prev) => ({ ...prev, [key]: ms }));
            }
          }
          continue;
        }

        if (rem.intervalMinutes > 0) {
          const prev = lastFired[rem.id] ?? ms;
          if (ms - prev >= rem.intervalMinutes * 60_000) {
            fireReminder(rem.customMessage || rem.label, rem.kind === "water" ? "nudge" : "happy");
            setLastFired((prevMap) => ({ ...prevMap, [rem.id]: ms }));
            if (rem.kind === "water") markWater();
          }
        }
      }
    };

    // seed lastFired so first ping waits a full interval
    setLastFired((prev) => {
      if (Object.keys(prev).length) return prev;
      const seed: Record<string, number> = {};
      const now = Date.now();
      for (const rem of activeReminders) {
        if (rem.intervalMinutes > 0) seed[rem.id] = now;
      }
      return seed;
    });

    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, activeReminders, rivalry]);

  function fireReminder(text: string, nextMood: CompanionMood) {
    setMessage(text);
    setMood(nextMood);
    if (settings?.soundEnabled) {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 660;
        gain.gain.value = 0.04;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } catch {
        // ignore autoplay limits
      }
    }
    window.setTimeout(() => setMessage(null), 6000);
  }

  function markWater() {
    if (!rivalry) return;
    const today = todayKey();
    const next = { ...rivalry };
    if (next.lastWaterDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yKey = yesterday.toISOString().slice(0, 10);
      next.waterStreakDays = next.lastWaterDate === yKey ? next.waterStreakDays + 1 : 1;
      next.lastWaterDate = today;
      saveRivalry(next);
      setRivalry(next);
      setMood("proud");
    }
  }

  function quickWater() {
    fireReminder("Nice — water logged. Hero stamina +1.", "proud");
    markWater();
  }

  if (!settings || !rivalry) {
    return <div className="p-8 text-slate-400">Loading companion…</div>;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-teal-200/80">Hey {settings.displayName}</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-white sm:text-4xl">
          {starLabel(settings.star)} is on walk duty
        </h1>
        <p className="max-w-2xl text-sm text-slate-300">
          Your doodle companion paces the stage, pings water & alarms from Settings, then challenges
          the rival fan club in Quiz.
        </p>
      </div>

      <DoodleWalk star={settings.star} mood={mood} speaking={message} />

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={quickWater}
          className="rounded-lg bg-teal-400 px-4 py-2 text-sm font-medium text-[#062018] transition hover:bg-teal-300"
        >
          I drank water
        </button>
        <button
          type="button"
          onClick={() => fireReminder("Stretch those shoulders — interval complete.", "hyped")}
          className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-100 hover:bg-white/10"
        >
          Nudge me now
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DailyChallenge star={settings.star} />
        <RivalryMeter stats={rivalry} />
      </div>
    </div>
  );
}
