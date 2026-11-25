export type StarId = "vijay" | "ajith";

export type ReminderKind = "water" | "stretch" | "custom" | "alarm";

export type CompanionMood = "happy" | "sleepy" | "hyped" | "proud" | "nudge";

/** How the reminder repeats */
export type ScheduleMode = "interval" | "daily" | "once";

export interface ReminderConfig {
  id: string;
  kind: ReminderKind;
  label: string;
  enabled: boolean;
  /** interval mode: every N minutes */
  intervalMinutes: number;
  customMessage?: string;
  /** daily / once / alarm clock time */
  hour?: number;
  minute?: number;
  /** scheduling */
  scheduleMode?: ScheduleMode;
  /** YYYY-MM-DD — once mode date, or daily start-from date */
  scheduleDate?: string;
  /** ISO timestamp of last fire (client) */
  lastFiredAt?: string;
}

export type AlertAnimaticMode = "builtin" | "upload";

export interface JusDoSettings {
  star: StarId;
  soundEnabled: boolean;
  quietHoursStart: number;
  quietHoursEnd: number;
  reminders: ReminderConfig[];
  displayName: string;
  /** Prefer OS / Teams-style corner toasts */
  cornerNotifications: boolean;
  systemNotifications: boolean;
  /** builtin SVG animatic vs uploaded dance/clip */
  alertAnimaticMode: AlertAnimaticMode;
  /** IndexedDB id of preferred uploaded clip (any star) */
  alertMediaId?: string;
  /** optional per-star clip overrides */
  alertMediaIdVijay?: string;
  alertMediaIdAjith?: string;
}

export interface QuizOption {
  id: string;
  text: string;
}

export type QuizDifficulty = "easy" | "difficult";

export interface QuizQuestion {
  id: string;
  star: StarId | "both";
  /** easy = current fan bank; difficult = deeper combo / scene / music trivia */
  difficulty?: QuizDifficulty;
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
  /** Guest session id for leaderboard dedupe */
  guestId?: string;
  /** Quiz set used for this score */
  difficulty?: QuizDifficulty;
  /** fan = Vijay/Ajith quiz; scenes = Tamil movie riddle game */
  game?: "fan" | "scenes";
}

export interface RivalryStats {
  vijayWins: number;
  ajithWins: number;
  lastClub?: StarId;
  bestStreak: number;
  waterStreakDays: number;
  lastWaterDate?: string;
}
