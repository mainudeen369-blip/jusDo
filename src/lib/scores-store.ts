import { promises as fs } from "fs";
import {
  githubStoreConfigured,
  readGithubJsonFile,
  sharedStorageNote,
  writeGithubJsonFile,
} from "./github-data";
import { seedDataPath, writableDataPath } from "./runtime-fs";
import type { QuizDifficulty, QuizScorePayload, StarId } from "./types";

export interface LeaderboardEntry {
  playerName: string;
  guestId?: string;
  club: StarId;
  score: number;
  total: number;
  percent: number;
  streak: number;
  at: string;
  difficulty: QuizDifficulty;
}

const WRITE_PATH = () => writableDataPath("scores.json");
const SEED_PATH = () => seedDataPath("scores.json");
const GITHUB_PATH = "data/scores.json";
const MAX_ENTRIES = 200;
const TOP_N = 10;

function normalizeDifficulty(d?: string): QuizDifficulty {
  return d === "difficult" ? "difficult" : "easy";
}

function difficultyRank(d: QuizDifficulty): number {
  // Difficult wins outrank Easy at the same percent
  return d === "difficult" ? 2 : 1;
}

function isBetter(a: LeaderboardEntry, b: LeaderboardEntry): boolean {
  const da = difficultyRank(a.difficulty);
  const db = difficultyRank(b.difficulty);
  if (da !== db) return da > db;
  if (a.percent !== b.percent) return a.percent > b.percent;
  if (a.score !== b.score) return a.score > b.score;
  if (a.total !== b.total) return a.total > b.total;
  return a.streak > b.streak;
}

async function readJsonFile(filePath: string): Promise<QuizScorePayload[] | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as QuizScorePayload[];
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // missing / invalid
  }
  return null;
}

function pathDirname(filePath: string) {
  const i = Math.max(filePath.lastIndexOf("/"), filePath.lastIndexOf("\\"));
  return i >= 0 ? filePath.slice(0, i) : ".";
}

async function writeLocalCache(scores: QuizScorePayload[]) {
  const target = WRITE_PATH();
  try {
    await fs.mkdir(pathDirname(target), { recursive: true });
    await fs.writeFile(target, JSON.stringify(scores, null, 2), "utf8");
  } catch {
    // best-effort
  }
}

export async function getAllScores(): Promise<QuizScorePayload[]> {
  if (githubStoreConfigured()) {
    try {
      const remote = await readGithubJsonFile<QuizScorePayload[]>(GITHUB_PATH);
      if (Array.isArray(remote)) {
        await writeLocalCache(remote);
        return remote;
      }
    } catch {
      // fall through
    }
  }

  return (await readJsonFile(WRITE_PATH())) || (await readJsonFile(SEED_PATH())) || [];
}

export async function addScore(entry: QuizScorePayload): Promise<QuizScorePayload[]> {
  const all = await getAllScores();
  const next = [entry, ...all].slice(0, MAX_ENTRIES);

  if (githubStoreConfigured()) {
    await writeGithubJsonFile(
      GITHUB_PATH,
      next,
      `jusDo: score ${entry.playerName} ${entry.score}/${entry.total} (${entry.difficulty || "easy"})`,
    );
    await writeLocalCache(next);
    return next;
  }

  await writeLocalCache(next);
  return next;
}

function buildBoardForDifficulty(
  scores: QuizScorePayload[],
  difficulty: QuizDifficulty,
  limit: number,
): LeaderboardEntry[] {
  const best = new Map<string, LeaderboardEntry>();

  for (const s of scores) {
    if (normalizeDifficulty(s.difficulty) !== difficulty) continue;
    const total = Math.max(1, s.total || 1);
    const percent = Math.round((s.score / total) * 100);
    const who = s.guestId || s.playerName.toLowerCase();
    const row: LeaderboardEntry = {
      playerName: s.playerName,
      guestId: s.guestId,
      club: s.club,
      score: s.score,
      total,
      percent,
      streak: s.streak || 0,
      at: s.at,
      difficulty,
    };
    const prev = best.get(who);
    if (!prev || isBetter(row, prev)) {
      best.set(who, row);
    }
  }

  return [...best.values()]
    .sort((a, b) => {
      if (a.percent !== b.percent) return b.percent - a.percent;
      if (a.score !== b.score) return b.score - a.score;
      if (a.total !== b.total) return b.total - a.total;
      return b.streak - a.streak;
    })
    .slice(0, limit);
}

/** Separate Easy and Difficult boards. */
export function buildLeaderboards(scores: QuizScorePayload[], limit = TOP_N) {
  return {
    easy: buildBoardForDifficulty(scores, "easy", limit),
    difficult: buildBoardForDifficulty(scores, "difficult", limit),
  };
}

/** @deprecated use buildLeaderboards — kept for any callers expecting a flat list */
export function buildLeaderboard(scores: QuizScorePayload[], limit = TOP_N): LeaderboardEntry[] {
  const { difficult, easy } = buildLeaderboards(scores, limit);
  return [...difficult, ...easy].slice(0, limit);
}

export function storageNote() {
  return sharedStorageNote("scores");
}
