"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CornerToast } from "@/components/CornerToast";
import {
  isQuietHour,
  loadSettings,
  shouldFireReminder,
  starLabel,
} from "@/lib/settings";
import type { JusDoSettings, StarId } from "@/lib/types";

type ToastState = {
  kind: "water" | "general";
  title: string;
  message: string;
  star: StarId;
} | null;

/**
 * Global reminder engine — runs on every page (not only Companion).
 * Keeps 1‑minute / scheduled alerts working while you stay on Settings.
 */
export function ReminderHost() {
  const [toast, setToast] = useState<ToastState>(null);
  const settingsRef = useRef<JusDoSettings>(loadSettings());
  const lastFiredRef = useRef<Record<string, number>>({});

  const resetIntervalClocks = useCallback(() => {
    const s = loadSettings();
    settingsRef.current = s;
    const now = Date.now();
    const next: Record<string, number> = { ...lastFiredRef.current };
    for (const rem of s.reminders) {
      if (!rem.enabled) continue;
      const mode = rem.scheduleMode || "interval";
      if (mode === "interval" && rem.intervalMinutes > 0) {
        next[rem.id] = now;
      }
    }
    lastFiredRef.current = next;
  }, []);

  const fire = useCallback((text: string, kind: "water" | "general", title: string, star: StarId) => {
    const s = settingsRef.current;

    if (s.cornerNotifications !== false) {
      setToast({ kind, title, message: text, star });
    }

    if (s.soundEnabled) {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = kind === "water" ? 520 : 660;
        gain.gain.value = 0.05;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } catch {
        // ignore
      }
    }

    if (
      s.systemNotifications !== false &&
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    ) {
      try {
        const n = new Notification(title, {
          body: text,
          tag: `jusdo-${kind}-${Date.now()}`,
          silent: !s.soundEnabled,
        });
        n.onclick = () => {
          window.focus();
          n.close();
        };
      } catch {
        // ignore
      }
    }

    window.dispatchEvent(
      new CustomEvent("jusdo:reminder", { detail: { kind, title, message: text, star } }),
    );
  }, []);

  useEffect(() => {
    resetIntervalClocks();

    const onSaved = () => resetIntervalClocks();
    const onFocus = () => {
      settingsRef.current = loadSettings();
    };
    window.addEventListener("jusdo:settings-saved", onSaved);
    window.addEventListener("focus", onFocus);

    const id = window.setInterval(() => {
      const settings = loadSettings();
      settingsRef.current = settings;

      if (isQuietHour(settings)) return;

      const now = new Date();
      const ms = now.getTime();
      const active = settings.reminders.filter((r) => r.enabled);

      for (const rem of active) {
        const { fire: should, key } = shouldFireReminder(rem, now, lastFiredRef.current);
        if (!should) continue;

        const isWater = rem.kind === "water";
        fire(
          rem.customMessage || rem.label,
          isWater ? "water" : "general",
          isWater
            ? `A kind reminder from ${starLabel(settings.star)}`
            : `${starLabel(settings.star)} — reminder`,
          settings.star,
        );
        lastFiredRef.current = {
          ...lastFiredRef.current,
          [key]: ms,
          [rem.id]: ms,
        };
      }
    }, 5_000);

    return () => {
      window.clearInterval(id);
      window.removeEventListener("jusdo:settings-saved", onSaved);
      window.removeEventListener("focus", onFocus);
    };
  }, [fire, resetIntervalClocks]);

  // Expose manual preview for other pages
  useEffect(() => {
    const onPreview = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        kind: "water" | "general";
        message: string;
        title: string;
      };
      const s = loadSettings();
      fire(detail.message, detail.kind, detail.title, s.star);
    };
    window.addEventListener("jusdo:preview-reminder", onPreview);
    return () => window.removeEventListener("jusdo:preview-reminder", onPreview);
  }, [fire]);

  if (!toast) return null;

  return (
    <CornerToast
      star={toast.star}
      title={toast.title}
      message={toast.message}
      kind={toast.kind}
      onAccept={() => {
        if (toast.kind === "water") {
          window.dispatchEvent(new CustomEvent("jusdo:water-accepted"));
        }
        setToast(null);
      }}
      onDismiss={() => setToast(null)}
    />
  );
}
