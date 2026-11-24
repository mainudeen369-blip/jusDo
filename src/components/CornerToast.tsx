"use client";

import { useEffect, useState } from "react";
import { StarPortrait } from "@/components/StarPortrait";
import { getAlertMedia, type AlertMediaItem } from "@/lib/alert-media";
import { loadSettings, resolveAlertMediaId, starLabel } from "@/lib/settings";
import type { StarId } from "@/lib/types";

export function CornerToast({
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
  const [clip, setClip] = useState<AlertMediaItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    const settings = loadSettings();
    const id = resolveAlertMediaId(settings, star);
    if (!id || settings.alertAnimaticMode !== "upload") {
      setClip(null);
      return;
    }
    getAlertMedia(id).then((item) => {
      if (!cancelled) setClip(item);
    });
    return () => {
      cancelled = true;
    };
  }, [star, kind]);

  const showUpload = Boolean(clip);

  return (
    <div
      className="corner-toast pointer-events-auto fixed bottom-4 right-4 z-[80] w-[min(100vw-1.5rem,400px)]"
      role="status"
      aria-live="polite"
    >
      <div className="overflow-hidden rounded-xl border border-white/15 bg-[#0f1c28]/95 shadow-2xl shadow-black/50 backdrop-blur-md">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] ${
            star === "vijay" ? "bg-[#f4c95f]/20 text-[#f4c95f]" : "bg-[#9fb7d4]/20 text-[#9fb7d4]"
          }`}
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-teal-300" />
          jusDo · {starLabel(star)}
        </div>

        {showUpload ? (
          <div className="relative max-h-52 w-full overflow-hidden bg-black">
            {clip!.kind === "video" ? (
              <video
                key={clip!.id}
                src={clip!.dataUrl}
                autoPlay
                muted
                loop
                playsInline
                className="max-h-52 w-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={clip!.dataUrl}
                alt=""
                className="max-h-52 w-full object-cover animate-[corner-in_0.5s_ease]"
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f1c28] via-transparent to-transparent" />
          </div>
        ) : null}

        <div className="flex gap-3 p-3">
          {!showUpload ? (
            <div className="relative shrink-0">
              <StarPortrait star={star} size={64} />
              {kind === "water" ? (
                <div className="toast-water-hand absolute -right-1 bottom-0" aria-hidden>
                  <svg width="36" height="44" viewBox="0 0 36 44">
                    <rect x="12" y="0" width="10" height="8" rx="2" fill="#99f6e4" />
                    <rect
                      x="8"
                      y="8"
                      width="18"
                      height="26"
                      rx="4"
                      fill="#5eead4"
                      className="toast-bottle"
                    />
                    <rect x="13" y="12" width="8" height="14" rx="1" fill="#ccfbf1" opacity="0.7" />
                    <circle className="toast-drop" cx="17" cy="38" r="3" fill="#67e8f9" />
                    <circle
                      className="toast-drop toast-drop-delay"
                      cx="24"
                      cy="40"
                      r="2"
                      fill="#67e8f9"
                    />
                  </svg>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{title}</p>
            <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-slate-300">{message}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onAccept}
                className="rounded-md bg-teal-400 px-2.5 py-1 text-xs font-semibold text-[#062018] hover:bg-teal-300"
              >
                {kind === "water" ? "I drank water" : "Got it"}
              </button>
              <button
                type="button"
                onClick={onDismiss}
                className="rounded-md border border-white/15 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/5"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
