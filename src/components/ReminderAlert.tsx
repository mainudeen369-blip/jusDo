"use client";

import { StarPortrait } from "@/components/StarPortrait";
import { starLabel } from "@/lib/settings";
import type { StarId } from "@/lib/types";

export function ReminderAlert({
  star,
  title,
  message,
  kind,
  onAccept,
  onDismiss,
}: {
  star: StarId;
  title: string;
  message: string;
  kind: "water" | "general";
  onAccept: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminder-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-[#0b1a26] shadow-2xl">
        <div
          className={`px-5 py-3 text-center text-xs uppercase tracking-[0.2em] ${
            star === "vijay" ? "bg-[#f4c95f]/15 text-[#f4c95f]" : "bg-[#9fb7d4]/15 text-[#9fb7d4]"
          }`}
        >
          Reminder with respect · {starLabel(star)}
        </div>

        <div className="flex flex-col items-center gap-4 px-6 py-6 text-center">
          <StarPortrait star={star} size={120} />
          <div>
            <h2 id="reminder-title" className="font-[family-name:var(--font-display)] text-2xl text-white">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{message}</p>
          </div>

          {kind === "water" ? (
            <div className="flex items-end gap-3 text-teal-200">
              <span className="text-3xl" aria-hidden>
                💧
              </span>
              <p className="pb-1 text-xs text-slate-400">Please take a glass of water now.</p>
            </div>
          ) : null}

          <div className="mt-2 flex w-full flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={onAccept}
              className="rounded-lg bg-teal-400 px-4 py-2.5 text-sm font-semibold text-[#062018] hover:bg-teal-300"
            >
              {kind === "water" ? "Thank you — I drank water" : "Got it"}
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-lg border border-white/15 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
