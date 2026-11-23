import type { JusDoSettings, ReminderConfig, RivalryStats, StarId } from "./types";

export const SETTINGS_KEY = "jusdo.settings.v1";
export const RIVALRY_KEY = "jusdo.rivalry.v1";
export const SCORES_KEY = "jusdo.scores.v1";

export function defaultReminders(): ReminderConfig[] {
  return [
    {
      id: "water",
      kind: "water",
      label: "Drink water",
      enabled: true,
      intervalMinutes: 60,
      customMessage: "Sip time! Your star says hydrate like a hero.",
    },
    {
      id: "stretch",
      kind: "stretch",
      label: "Stretch break",
      enabled: true,
      intervalMinutes: 90,
      customMessage: "Interval stretch — keep that walk energy going.",
    },
    {
      id: "alarm",
      kind: "alarm",
      label: "Evening wind-down",
      enabled: false,
      intervalMinutes: 0,
      hour: 21,
      minute: 0,
      customMessage: "Cut-off alarm — log off and rest, champ.",
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

export function loadSettings(): JusDoSettings {
  if (typeof window === "undefined") return defaultSettings();
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings();
    return { ...defaultSettings(), ...JSON.parse(raw) };
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
