import { promises as fs } from "fs";
import { seedDataPath, writableDataPath } from "./runtime-fs";
import type { QuizQuestion } from "./types";

const WRITE_PATH = () => writableDataPath("scenes.json");
const SEED_PATH = () => seedDataPath("scenes.json");

let memoryCache: QuizQuestion[] | null = null;

async function readJsonFile(filePath: string): Promise<QuizQuestion[] | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as QuizQuestion[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // missing
  }
  return null;
}

/** 1500-scene bank from committed data/scenes.json (bundled on Vercel). */
export async function getScenes(): Promise<QuizQuestion[]> {
  if (memoryCache) return memoryCache;
  const scenes =
    (await readJsonFile(SEED_PATH())) ||
    (await readJsonFile(WRITE_PATH())) ||
    [];
  if (scenes.length) memoryCache = scenes;
  return scenes;
}

export function shuffleScenes<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickRound(scenes: QuizQuestion[], size = 15): QuizQuestion[] {
  return shuffleScenes(scenes).slice(0, Math.min(size, scenes.length));
}
