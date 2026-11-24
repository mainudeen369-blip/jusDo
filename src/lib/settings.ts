import type { JusDoSettings, ReminderConfig, RivalryStats, StarId } from "./types";

export const SETTINGS_KEY = "jusdo.settings.v2";
export const RIVALRY_KEY = "jusdo.rivalry.v1";
export const SCORES_KEY = "jusdo.scores.v1";

export function defaultReminders(): ReminderConfig[] {
  return [
    {
      id: "water",
      kind: "water",
      label: "Drink water",
      enabled: true,
      scheduleMode: "interval",
      intervalMinutes: 60,
      customMessage:
        "Please drink a glass of water. Take care of your health with quiet discipline.",
    },
    {
      id: "stretch",
      kind: "stretch",
      label: "Stretch break",
      enabled: true,
      scheduleMode: "interval",
      intervalMinutes: 90,
      customMessage: "Please take a short stretch. A calm pause keeps the mind clear.",
    },
    {
      id: "alarm",
      kind: "alarm",
      label: "Evening wind-down",
      enabled: false,
      scheduleMode: "daily",
      intervalMinutes: 0,
      hour: 21,
      minute: 0,
      customMessage: "Evening reminder — please rest well and recharge for tomorrow.",
    },
  ];
}

export function defaultSettings(): JusDoSettings {
  return {
    star: "vijay",
    soundEnabled: true,
    quietHoursStart: 23,
    quietHoursEnd: 7,
    reminders: defaultReminders(),
    displayName: "Fan",
    cornerNotifications: true,
    systemNotifications: true,
    alertAnimaticMode: "builtin",
    alertMediaId: undefined,
    alertMediaIdVijay: undefined,
    alertMediaIdAjith: undefined,
  };
}

export function defaultRivalry(): RivalryStats {
  return {
    vijayWins: 0,
    ajithWins: 0,
    bestStreak: 0,
    waterStreakDays: 0,
  };
}

function migrateSettings(raw: Partial<JusDoSettings> & { reminders?: ReminderConfig[] }): JusDoSettings {
  const base = defaultSettings();
  const reminders = (raw.reminders?.length ? raw.reminders : base.reminders).map((r) => ({
    ...r,
    scheduleMode:
      r.scheduleMode ||
      (r.kind === "alarm" || (r.hour != null && r.intervalMinutes === 0) ? "daily" : "interval"),
  }));
  return {
    ...base,
    ...raw,
    reminders,
    cornerNotifications: raw.cornerNotifications ?? true,
    systemNotifications: raw.systemNotifications ?? true,
    alertAnimaticMode: raw.alertAnimaticMode === "upload" ? "upload" : "builtin",
    alertMediaId: raw.alertMediaId,
    alertMediaIdVijay: raw.alertMediaIdVijay,
    alertMediaIdAjith: raw.alertMediaIdAjith,
  };
}

/** Resolve which uploaded clip id to use for this star (if any). */
export function resolveAlertMediaId(settings: JusDoSettings, star: StarId): string | undefined {
  if (settings.alertAnimaticMode !== "upload") return undefined;
  if (star === "vijay" && settings.alertMediaIdVijay) return settings.alertMediaIdVijay;
  if (star === "ajith" && settings.alertMediaIdAjith) return settings.alertMediaIdAjith;
  return settings.alertMediaId;
}

export function loadSettings(): JusDoSettings {
  if (typeof window === "undefined") return defaultSettings();
  try {
    const raw =
      localStorage.getItem(SETTINGS_KEY) || localStorage.getItem("jusdo.settings.v1");
    if (!raw) return defaultSettings();
    return migrateSettings(JSON.parse(raw));
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(settings: JusDoSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadRivalry(): RivalryStats {
  if (typeof window === "undefined") return defaultRivalry();
  try {
    const raw = localStorage.getItem(RIVALRY_KEY);
    if (!raw) return defaultRivalry();
    return { ...defaultRivalry(), ...JSON.parse(raw) };
  } catch {
    return defaultRivalry();
  }
}

export function saveRivalry(stats: RivalryStats) {
  localStorage.setItem(RIVALRY_KEY, JSON.stringify(stats));
}

export function starLabel(star: StarId) {
  return star === "vijay" ? "Thalapathy Vijay" : "Thala Ajith";
}

export function clubLabel(star: StarId) {
  return star === "vijay" ? "Vijay Fans Club" : "Ajith Fans Club";
}

export function isQuietHour(settings: JusDoSettings, date = new Date()) {
  const h = date.getHours();
  const { quietHoursStart: start, quietHoursEnd: end } = settings;
  if (start === end) return false;
  if (start < end) return h >= start && h < end;
  return h >= start || h < end;
}

/** Returns true when this reminder should fire at `now`. */
export function shouldFireReminder(
  rem: ReminderConfig,
  now: Date,
  lastFiredKeys: Record<string, number>,
): { fire: boolean; key: string } {
  const mode = rem.scheduleMode || (rem.kind === "alarm" ? "daily" : "interval");
  const ms = now.getTime();

  if (mode === "interval") {
    if (rem.intervalMinutes <= 0) return { fire: false, key: rem.id };
    const prev = lastFiredKeys[rem.id] ?? ms;
    return {
      fire: ms - prev >= rem.intervalMinutes * 60_000,
      key: rem.id,
    };
  }

  const hour = rem.hour ?? 9;
  const minute = rem.minute ?? 0;
  const dateStr = rem.scheduleDate || now.toISOString().slice(0, 10);
  const dayKey = now.toISOString().slice(0, 10);

  if (mode === "once") {
    const key = `${rem.id}-once-${dateStr}-${hour}:${minute}`;
    if (lastFiredKeys[key]) return { fire: false, key };
    if (dayKey !== dateStr) return { fire: false, key };
    if (now.getHours() === hour && now.getMinutes() === minute) {
      return { fire: true, key };
    }
    return { fire: false, key };
  }

  // daily
  const key = `${rem.id}-daily-${dayKey}-${hour}:${minute}`;
  if (lastFiredKeys[key]) return { fire: false, key };
  if (rem.scheduleDate && dayKey < rem.scheduleDate) return { fire: false, key };
  if (now.getHours() === hour && now.getMinutes() === minute) {
    return { fire: true, key };
  }
  return { fire: false, key };
}
