"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { StarAnimatic } from "@/components/StarAnimatic";
import { StarPortrait } from "@/components/StarPortrait";
import { CornerToast } from "@/components/CornerToast";
import { DailyChallenge } from "@/components/DailyChallenge";
import { RivalryMeter } from "@/components/RivalryMeter";
import { DownloadExeButton } from "@/components/DownloadExeButton";
import {
  isQuietHour,
  loadRivalry,
  loadSettings,
  saveRivalry,
  shouldFireReminder,
  starLabel,
} from "@/lib/settings";
import type { CompanionMood, JusDoSettings, RivalryStats } from "@/lib/types";

type ToastState = {
  kind: "water" | "general";
  title: string;
  message: string;
} | null;

export function CompanionStage() {
  const [settings, setSettings] = useState<JusDoSettings | null>(null);
  const [rivalry, setRivalry] = useState<RivalryStats | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [mood, setMood] = useState<CompanionMood>("happy");
  const [offeringWater, setOfferingWater] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const lastFiredRef = useRef<Record<string, number>>({});
  const seededRef = useRef(false);

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

    if (!seededRef.current) {
      const seed: Record<string, number> = {};
      const now = Date.now();
      for (const rem of activeReminders) {
        const mode = rem.scheduleMode || "interval";
        if (mode === "interval" && rem.intervalMinutes > 0) seed[rem.id] = now;
      }
      lastFiredRef.current = { ...lastFiredRef.current, ...seed };
      seededRef.current = true;
    }

    const tick = () => {
      if (isQuietHour(settings)) {
        setMood("sleepy");
        return;
      }

      const now = new Date();
      const ms = now.getTime();

      for (const rem of activeReminders) {
        const { fire, key } = shouldFireReminder(rem, now, lastFiredRef.current);
        if (!fire) continue;

        const isWater = rem.kind === "water";
        showReminder(
          rem.customMessage || rem.label,
          isWater ? "water" : "general",
          isWater
            ? `A kind reminder from ${starLabel(settings.star)}`
            : `${starLabel(settings.star)} — reminder`,
        );
        lastFiredRef.current = {
          ...lastFiredRef.current,
          [key]: ms,
          [rem.id]: ms,
        };
      }
    };

    const id = window.setInterval(tick, 10_000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, activeReminders, rivalry]);

  function playChime(water: boolean) {
    if (!settings?.soundEnabled) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = water ? 520 : 660;
      gain.gain.value = 0.04;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // ignore
    }
  }

  function showReminder(text: string, kind: "water" | "general", title: string) {
    setMessage(text);
    setMood(kind === "water" ? "nudge" : "happy");
    setOfferingWater(kind === "water");
    playChime(kind === "water");

    if (settings?.cornerNotifications !== false) {
      setToast({ kind, title, message: text });
    }

    if (
      settings?.systemNotifications !== false &&
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    ) {
      try {
        const n = new Notification(title, {
          body: text,
          silent: !settings?.soundEnabled,
          tag: `jusdo-${kind}`,
        });
        n.onclick = () => {
          window.focus();
          n.close();
        };
      } catch {
        // ignore
      }
    }

    window.setTimeout(() => {
      setMessage(null);
      setOfferingWater(false);
    }, 8000);
  }

  function markWater() {
    if (!rivalry) return;
    const today = new Date().toISOString().slice(0, 10);
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

  function closeToast(acceptedWater: boolean) {
    if (acceptedWater) markWater();
    setToast(null);
    setOfferingWater(false);
    setMessage(acceptedWater ? "Thank you. Stay healthy and keep going with grace." : null);
    if (acceptedWater) setMood("proud");
    window.setTimeout(() => setMessage(null), 4000);
  }

  function offerWaterNow() {
    showReminder(
      "Please drink a glass of water. Take care of your health with the same dedication you give your day.",
      "water",
      `A kind reminder from ${starLabel(settings!.star)}`,
    );
  }

  async function enableDesktopAlerts() {
    const notify = globalThis.Notification;
    if (typeof notify === "undefined") {
      setMessage("This browser does not support desktop notifications.");
      return;
    }
    const perm = await notify.requestPermission();
    if (perm === "granted") {
      new notify("jusDo reminders ready", {
        body: "Corner + system alerts will appear for water and scheduled reminders.",
      });
      setMessage("Desktop alerts enabled. Thank you.");
      window.setTimeout(() => setMessage(null), 4000);
      const s = loadSettings();
      s.systemNotifications = true;
      s.cornerNotifications = true;
      localStorage.setItem("jusdo.settings.v2", JSON.stringify({ ...s }));
      setSettings(s);
    }
  }

  if (!settings || !rivalry) {
    return <div className="p-8 text-slate-400">Loading companion…</div>;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-teal-200/80">Welcome, {settings.displayName}</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-white sm:text-4xl">
          Inspired by {starLabel(settings.star)}
        </h1>
        <p className="max-w-2xl text-sm text-slate-300">
          Set date, time, and frequency in{" "}
          <a href="/settings" className="text-teal-200 underline-offset-2 hover:underline">
            Settings
          </a>
          . Alerts slide in at the bottom-right with a water animatic — same on web and desktop.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <DownloadExeButton />
          <span className="text-xs text-slate-400">
            Windows installer · first install once, then opens in seconds
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <StarPortrait star={settings.star} size={88} />
        <div>
          <p className="text-sm text-slate-300">Your inspiration</p>
          <p className="font-[family-name:var(--font-display)] text-xl text-white">
            {starLabel(settings.star)}
          </p>
          <p className="text-xs text-slate-400">Portrait from public/portraits/{settings.star}.jpg</p>
        </div>
      </div>

      <StarAnimatic
        star={settings.star}
        mood={mood}
        speaking={message}
        offeringWater={offeringWater}
      />

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={offerWaterNow}
          className="rounded-lg bg-teal-400 px-4 py-2 text-sm font-medium text-[#062018] transition hover:bg-teal-300"
        >
          Preview water notification
        </button>
        <button
          type="button"
          onClick={() =>
            showReminder(
              "A short stretch will refresh your mind. Please take a moment for yourself.",
              "general",
              `${starLabel(settings.star)} — stretch reminder`,
            )
          }
          className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-100 hover:bg-white/10"
        >
          Preview stretch toast
        </button>
        <button
          type="button"
          onClick={enableDesktopAlerts}
          className="rounded-lg border border-[#f4c95f]/40 bg-[#f4c95f]/10 px-4 py-2 text-sm text-[#f4c95f] hover:bg-[#f4c95f]/20"
        >
          Enable system alerts
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DailyChallenge star={settings.star} />
        <RivalryMeter stats={rivalry} />
      </div>

      {toast ? (
        <CornerToast
          star={settings.star}
          title={toast.title}
          message={toast.message}
          kind={toast.kind}
          onAccept={() => closeToast(toast.kind === "water")}
          onDismiss={() => closeToast(false)}
        />
      ) : null}
    </div>
  );
}
