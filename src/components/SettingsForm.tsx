"use client";

import { useEffect, useState } from "react";
import { defaultSettings, loadSettings, saveSettings, starLabel } from "@/lib/settings";
import type { JusDoSettings, ReminderConfig, StarId } from "@/lib/types";

export function SettingsForm() {
  const [settings, setSettings] = useState<JusDoSettings>(defaultSettings());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
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

  function onSave() {
    saveSettings(settings);
    setSaved(true);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-300">Pick your star, tune reminders, protect quiet hours.</p>
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

      <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
        <span>Reminder sound</span>
        <input
          type="checkbox"
          checked={settings.soundEnabled}
          onChange={(e) => update({ soundEnabled: e.target.checked })}
        />
      </label>

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
        <h2 className="text-lg text-teal-100">Reminders</h2>
        {settings.reminders.map((rem) => (
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
            {rem.kind === "alarm" ? (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="text-sm">
                  <span className="text-slate-400">Hour</span>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
                    value={rem.hour ?? 21}
                    onChange={(e) => updateReminder(rem.id, { hour: Number(e.target.value) })}
                  />
                </label>
                <label className="text-sm">
                  <span className="text-slate-400">Minute</span>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
                    value={rem.minute ?? 0}
                    onChange={(e) => updateReminder(rem.id, { minute: Number(e.target.value) })}
                  />
                </label>
              </div>
            ) : (
              <label className="mt-3 flex flex-col gap-1 text-sm">
                <span className="text-slate-400">Every N minutes</span>
                <input
                  type="number"
                  min={1}
                  className="rounded-lg border border-white/10 bg-black/30 px-3 py-2"
                  value={rem.intervalMinutes}
                  onChange={(e) =>
                    updateReminder(rem.id, { intervalMinutes: Number(e.target.value) })
                  }
                />
              </label>
            )}
          </div>
        ))}
      </section>

      <button
        type="button"
        onClick={onSave}
        className="rounded-lg bg-[#f4c95f] px-4 py-2.5 text-sm font-semibold text-[#1a1408] hover:bg-[#ffd97a]"
      >
        Save settings
      </button>
      {saved ? <p className="text-sm text-teal-300">Saved on this device.</p> : null}
    </div>
  );
}
