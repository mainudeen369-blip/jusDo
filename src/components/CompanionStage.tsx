"use client";

import { useEffect, useState } from "react";
import { StarAnimatic } from "@/components/StarAnimatic";
import { StarPortrait } from "@/components/StarPortrait";
import { DailyChallenge } from "@/components/DailyChallenge";
import { RivalryMeter } from "@/components/RivalryMeter";
import { DownloadExeButton } from "@/components/DownloadExeButton";
import { TopFansBoard } from "@/components/TopFansBoard";
import { loadGuest } from "@/lib/guest";
import {
  loadRivalry,
  loadSettings,
  saveRivalry,
  starLabel,
} from "@/lib/settings";
import type { CompanionMood, JusDoSettings, RivalryStats } from "@/lib/types";

export function CompanionStage() {
  const [settings, setSettings] = useState<JusDoSettings | null>(null);
  const [rivalry, setRivalry] = useState<RivalryStats | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [mood, setMood] = useState<CompanionMood>("happy");
  const [offeringWater, setOfferingWater] = useState(false);
  const [guestName, setGuestName] = useState<string | null>(null);

  useEffect(() => {
    setSettings(loadSettings());
    setRivalry(loadRivalry());
    setGuestName(loadGuest()?.name || null);
  }, []);

  useEffect(() => {
    const refresh = () => {
      setSettings(loadSettings());
      setRivalry(loadRivalry());
      setGuestName(loadGuest()?.name || null);
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("jusdo:settings-saved", refresh);
    window.addEventListener("jusdo:guest-changed", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("jusdo:settings-saved", refresh);
      window.removeEventListener("jusdo:guest-changed", refresh);
    };
  }, []);

  useEffect(() => {
    const onReminder = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        kind: "water" | "general";
        message: string;
      };
      setMessage(detail.message);
      setMood(detail.kind === "water" ? "nudge" : "happy");
      setOfferingWater(detail.kind === "water");
      window.setTimeout(() => {
        setMessage(null);
        setOfferingWater(false);
      }, 8000);
    };
    const onWater = () => {
      markWater();
      setMood("proud");
      setMessage("Thank you. Stay healthy and keep going with grace.");
      window.setTimeout(() => setMessage(null), 4000);
    };
    window.addEventListener("jusdo:reminder", onReminder);
    window.addEventListener("jusdo:water-accepted", onWater);
    return () => {
      window.removeEventListener("jusdo:reminder", onReminder);
      window.removeEventListener("jusdo:water-accepted", onWater);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rivalry]);

  function markWater() {
    const stats = loadRivalry();
    const today = new Date().toISOString().slice(0, 10);
    if (stats.lastWaterDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yKey = yesterday.toISOString().slice(0, 10);
      stats.waterStreakDays = stats.lastWaterDate === yKey ? stats.waterStreakDays + 1 : 1;
      stats.lastWaterDate = today;
      saveRivalry(stats);
      setRivalry(stats);
    }
  }

  function preview(kind: "water" | "general", message: string, title: string) {
    window.dispatchEvent(
      new CustomEvent("jusdo:preview-reminder", { detail: { kind, message, title } }),
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
        body: "Keep this tab open. Alerts will appear every interval you set.",
      });
      const s = loadSettings();
      s.systemNotifications = true;
      s.cornerNotifications = true;
      localStorage.setItem("jusdo.settings.v2", JSON.stringify(s));
      setSettings(s);
      window.dispatchEvent(new Event("jusdo:settings-saved"));
      setMessage("System alerts enabled. Keep this tab open.");
      window.setTimeout(() => setMessage(null), 4000);
    } else {
      setMessage("Notification permission blocked — corner toast will still show in this tab.");
      window.setTimeout(() => setMessage(null), 5000);
    }
  }

  if (!settings || !rivalry) {
    return <div className="p-8 text-slate-400">Loading companion…</div>;
  }

  const water = settings.reminders.find((r) => r.id === "water");
  const waterHint =
    water?.enabled && (water.scheduleMode || "interval") === "interval"
      ? `Water alert every ${water.intervalMinutes || 60} min — keep any jusDo tab open.`
      : "Configure water alerts in Settings.";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-teal-200/80">
          Welcome, {guestName || settings.displayName}{" "}
          <span className="text-slate-500">(guest)</span>
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-white sm:text-4xl">
          Inspired by {starLabel(settings.star)}
        </h1>
        <p className="max-w-2xl text-sm text-slate-300">
          Set date, time, and frequency in{" "}
          <a href="/settings" className="text-teal-200 underline-offset-2 hover:underline">
            Settings
          </a>
          , then click <strong>Save</strong>. Play{" "}
          <a href="/quiz" className="text-teal-200 underline-offset-2 hover:underline">
            Fan Quiz
          </a>{" "}
          or{" "}
          <a href="/scenes" className="text-[#f4c95f] underline-offset-2 hover:underline">
            Movie Scenes
          </a>{" "}
          (Tamil film riddles). Alerts work while this site tab stays open.
        </p>
        <p className="text-xs text-teal-200/80">{waterHint}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <DownloadExeButton />
          <span className="text-xs text-slate-400">Optional desktop app (office may block unknown .exe)</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <StarPortrait star={settings.star} size={88} />
        <div>
          <p className="text-sm text-slate-300">Your inspiration</p>
          <p className="font-[family-name:var(--font-display)] text-xl text-white">
            {starLabel(settings.star)}
          </p>
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
          onClick={() =>
            preview(
              "water",
              "Please drink a glass of water. Take care of your health with the same dedication you give your day.",
              `A kind reminder from ${starLabel(settings.star)}`,
            )
          }
          className="rounded-lg bg-teal-400 px-4 py-2 text-sm font-medium text-[#062018] transition hover:bg-teal-300"
        >
          Preview water notification
        </button>
        <button
          type="button"
          onClick={enableDesktopAlerts}
          className="rounded-lg border border-[#f4c95f]/40 bg-[#f4c95f]/10 px-4 py-2 text-sm text-[#f4c95f] hover:bg-[#f4c95f]/20"
        >
          Enable system alerts
        </button>
      </div>

      <TopFansBoard />

      <div className="grid gap-4 md:grid-cols-2">
        <DailyChallenge star={settings.star} />
        <RivalryMeter stats={rivalry} />
      </div>
    </div>
  );
}
