export type StarId = "vijay" | "ajith";

export type ReminderKind = "water" | "stretch" | "custom" | "alarm";

export type CompanionMood = "happy" | "sleepy" | "hyped" | "proud" | "nudge";

export interface ReminderConfig {
  id: string;
  kind: ReminderKind;
  label: string;
  enabled: boolean;
  intervalMinutes: number;
  customMessage?: string;
  hour?: number;
  minute?: number;
}

export interface JusDoSettings {
  star: StarId;
  soundEnabled: boolean;
  quietHoursStart: number;
  quietHoursEnd: number;
  reminders: ReminderConfig[];
  displayName: string;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  star: StarId | "both";
  prompt: string;
  options: QuizOption[];
  correctOptionId: string;
  funFact?: string;
}

export interface QuizScorePayload {
  playerName: string;
  club: StarId;
  score: number;
  total: number;
  streak: number;
  at: string;
}

export interface RivalryStats {
  vijayWins: number;
  ajithWins: number;
  lastClub?: StarId;
  bestStreak: number;
  waterStreakDays: number;
  lastWaterDate?: string;
}
