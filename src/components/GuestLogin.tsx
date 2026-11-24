"use client";

import { useState } from "react";
import { createGuestSession, randomGuestName, saveGuest } from "@/lib/guest";
import { loadSettings, saveSettings } from "@/lib/settings";

export function GuestLogin({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState(() => randomGuestName());
  const [busy, setBusy] = useState(false);

  function enter() {
    setBusy(true);
    const guest = createGuestSession(name);
    saveGuest(guest);
    const settings = loadSettings();
    settings.displayName = guest.name;
    saveSettings(settings);
    window.dispatchEvent(new Event("jusdo:settings-saved"));
    onDone();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07131f]/92 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0f1c28] p-6 shadow-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-teal-300/80">jusDo</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-white">
          Continue as Guest
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          No password needed. Pick a random fan name — your quiz scores go on the Top Fans board.
        </p>

        <label className="mt-5 block text-sm">
          <span className="text-slate-400">Guest name</span>
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-white"
            value={name}
            maxLength={32}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") enter();
            }}
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setName(randomGuestName())}
            className="rounded-lg border border-white/15 px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
          >
            New random name
          </button>
          <button
            type="button"
            disabled={busy || !name.trim()}
            onClick={enter}
            className="rounded-lg bg-teal-400 px-4 py-2 text-sm font-semibold text-[#062018] hover:bg-teal-300 disabled:opacity-50"
          >
            Enter jusDo
          </button>
        </div>
      </div>
    </div>
  );
}
