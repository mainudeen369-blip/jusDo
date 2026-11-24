"use client";

import { useEffect, useState } from "react";
import { AlertMediaSettings } from "@/components/AlertMediaSettings";
import { defaultSettings, loadSettings, saveSettings, starLabel } from "@/lib/settings";
import type { JusDoSettings, ReminderConfig, ScheduleMode, StarId } from "@/lib/types";

export function SettingsForm() {
  const [settings, setSettings] = useState<JusDoSettings>(defaultSettings());
  const [saved, setSaved] = useState(false);
  const [today, setToday] = useState("");

  useEffect(() => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const todayLocal = `${d.getFullYear()}-${m}-${day}`;
    setToday(todayLocal);

    const loaded = loadSettings();
    // Fill missing schedule dates on the client only (avoid prerender Date())
    loaded.reminders = loaded.reminders.map((r) =>
      r.scheduleMode === "daily" || r.scheduleMode === "once"
        ? { ...r, scheduleDate: r.scheduleDate || todayLocal }
        : r,
    );
    setSettings(loaded);
  }, []);

  function update(partial: Partial<JusDoSettings>) {
    setSettings((s) => ({ ...s, ...partial }));
    setSaved(false);
  }

  function updateReminder(id: string, partial: Partial<ReminderConfig>) {
    setSettings((s) => ({
      ...s,
      reminders: s.reminders.map((r) => (r.id === id ? { ...r, ...partial } : r)),
    }));
    setSaved(false);
  }

  async function onSave() {
    saveSettings(settings);
    if (settings.systemNotifications && typeof Notification !== "undefined") {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
    }
    // Restart reminder clocks from now (so "every 1 min" starts after Save)
    window.dispatchEvent(new Event("jusdo:settings-saved"));
    setSaved(true);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-300">
          Set date, time, and frequency for alerts. Notifications appear in the bottom-right corner
          (Teams-style) on web and desktop, with an optional system tray toast.
        </p>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-400">Display name</span>
        <input
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
          value={settings.displayName}
          onChange={(e) => update({ displayName: e.target.value })}
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm text-slate-400">Companion star</legend>
        <div className="flex gap-3">
          {(["vijay", "ajith"] as StarId[]).map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => update({ star })}
              className={`rounded-xl border px-4 py-3 text-sm transition ${
                settings.star === star
                  ? "border-[#f4c95f] bg-[#f4c95f]/15 text-[#f4c95f]"
                  : "border-white/10 bg-white/5 text-slate-200"
              }`}
            >
              {starLabel(star)}
            </button>
          ))}
        </div>
      </fieldset>

      <AlertMediaSettings settings={settings} onChange={update} />

      <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-medium text-teal-100">Notification style</p>
        <label className="flex items-center justify-between text-sm">
          <span>Corner toast (animatic water hand-off)</span>
          <input
            type="checkbox"
            checked={settings.cornerNotifications}
            onChange={(e) => update({ cornerNotifications: e.target.checked })}
          />
        </label>
        <label className="flex items-center justify-between text-sm">
          <span>System / OS notification (like Teams)</span>
          <input
            type="checkbox"
            checked={settings.systemNotifications}
            onChange={(e) => update({ systemNotifications: e.target.checked })}
          />
        </label>
        <label className="flex items-center justify-between text-sm">
          <span>Reminder sound</span>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => update({ soundEnabled: e.target.checked })}
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-400">Quiet hours start (0–23)</span>
          <input
            type="number"
            min={0}
            max={23}
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2"
            value={settings.quietHoursStart}
            onChange={(e) => update({ quietHoursStart: Number(e.target.value) })}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-400">Quiet hours end (0–23)</span>
          <input
            type="number"
            min={0}
            max={23}
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2"
            value={settings.quietHoursEnd}
            onChange={(e) => update({ quietHoursEnd: Number(e.target.value) })}
          />
        </label>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg text-teal-100">Reminders — date, time & frequency</h2>
        {settings.reminders.map((rem) => {
          const mode = (rem.scheduleMode ||
            (rem.kind === "alarm" ? "daily" : "interval")) as ScheduleMode;
          return (
            <div key={rem.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-white">{rem.label}</p>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  On
                  <input
                    type="checkbox"
                    checked={rem.enabled}
                    onChange={(e) => updateReminder(rem.id, { enabled: e.target.checked })}
                  />
                </label>
              </div>

              <label className="mt-3 flex flex-col gap-1 text-sm">
                <span className="text-slate-400">Message</span>
                <input
                  className="rounded-lg border border-white/10 bg-black/30 px-3 py-2"
                  value={rem.customMessage || ""}
                  onChange={(e) => updateReminder(rem.id, { customMessage: e.target.value })}
                />
              </label>

              <label className="mt-3 flex flex-col gap-1 text-sm">
                <span className="text-slate-400">Frequency</span>
                <select
                  className="rounded-lg border border-white/10 bg-black/30 px-3 py-2"
                  value={mode}
                  onChange={(e) =>
                    updateReminder(rem.id, {
                      scheduleMode: e.target.value as ScheduleMode,
                      scheduleDate: rem.scheduleDate || today,
                      hour: rem.hour ?? 9,
                      minute: rem.minute ?? 0,
                    })
                  }
                >
                  <option value="interval">Every N minutes</option>
                  <option value="daily">Every day at a time</option>
                  <option value="once">Once — specific date & time</option>
                </select>
              </label>

              {mode === "interval" ? (
                <label className="mt-3 flex flex-col gap-1 text-sm">
                  <span className="text-slate-400">Every N minutes</span>
                  <input
                    type="number"
                    min={1}
                    className="rounded-lg border border-white/10 bg-black/30 px-3 py-2"
                    value={rem.intervalMinutes || 60}
                    onChange={(e) =>
                      updateReminder(rem.id, { intervalMinutes: Number(e.target.value) })
                    }
                  />
                </label>
              ) : (
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <label className="flex flex-col gap-1 text-sm sm:col-span-1">
                    <span className="text-slate-400">
                      {mode === "once" ? "Date" : "Start from date"}
                    </span>
                    <input
                      type="date"
                      className="rounded-lg border border-white/10 bg-black/30 px-3 py-2"
                      value={rem.scheduleDate || today}
                      onChange={(e) => updateReminder(rem.id, { scheduleDate: e.target.value })}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-slate-400">Hour</span>
                    <input
                      type="number"
                      min={0}
                      max={23}
                      className="rounded-lg border border-white/10 bg-black/30 px-3 py-2"
                      value={rem.hour ?? 9}
                      onChange={(e) => updateReminder(rem.id, { hour: Number(e.target.value) })}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-slate-400">Minute</span>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      className="rounded-lg border border-white/10 bg-black/30 px-3 py-2"
                      value={rem.minute ?? 0}
                      onChange={(e) => updateReminder(rem.id, { minute: Number(e.target.value) })}
                    />
                  </label>
                </div>
              )}
            </div>
          );
        })}
      </section>

      <button
        type="button"
        onClick={onSave}
        className="rounded-lg bg-[#f4c95f] px-4 py-2.5 text-sm font-semibold text-[#1a1408] hover:bg-[#ffd97a]"
      >
        Save settings
      </button>
      {saved ? (
        <div className="space-y-1 text-sm text-teal-300">
          <p>Saved. Reminder timer restarted from now.</p>
          <p className="text-slate-400">
            Keep this tab open (Settings or Companion). For “every 1 min”, the first corner toast
            should appear in about 1 minute. Use Companion → Preview water notification to test
            immediately.
          </p>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => {
          const s = loadSettings();
          window.dispatchEvent(
            new CustomEvent("jusdo:preview-reminder", {
              detail: {
                kind: "water",
                title: `A kind reminder from ${starLabel(s.star)}`,
                message:
                  s.reminders.find((r) => r.id === "water")?.customMessage ||
                  "Please drink a glass of water.",
              },
            }),
          );
        }}
        className="rounded-lg border border-teal-300/40 bg-teal-400/10 px-4 py-2.5 text-sm text-teal-100"
      >
        Test water alert now
      </button>
    </div>
  );
}
