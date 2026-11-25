import { promises as fs } from "fs";
import {
  githubStoreConfigured,
  readGithubJsonFile,
  writeGithubJsonFile,
} from "./github-data";
import { seedDataPath, writableDataPath } from "./runtime-fs";
import { SEED_SCENES } from "./seed-scenes";
import type { QuizQuestion } from "./types";

const WRITE_PATH = () => writableDataPath("scenes.json");
const SEED_PATH = () => seedDataPath("scenes.json");
const GITHUB_PATH = "data/scenes.json";

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

function pathDirname(filePath: string) {
  const i = Math.max(filePath.lastIndexOf("/"), filePath.lastIndexOf("\\"));
  return i >= 0 ? filePath.slice(0, i) : ".";
}

async function writeLocalCache(scenes: QuizQuestion[]) {
  const target = WRITE_PATH();
  try {
    await fs.mkdir(pathDirname(target), { recursive: true });
    await fs.writeFile(target, JSON.stringify(scenes, null, 2), "utf8");
  } catch {
    // best-effort
  }
}

export async function getScenes(): Promise<QuizQuestion[]> {
  if (githubStoreConfigured()) {
    try {
      const remote = await readGithubJsonFile<QuizQuestion[]>(GITHUB_PATH);
      if (Array.isArray(remote) && remote.length > 0) {
        await writeLocalCache(remote);
        return remote;
      }
    } catch {
      // fall through
    }
  }
  return (await readJsonFile(WRITE_PATH())) || (await readJsonFile(SEED_PATH())) || SEED_SCENES;
}

export async function saveScenes(scenes: QuizQuestion[]): Promise<QuizQuestion[]> {
  if (githubStoreConfigured()) {
    await writeGithubJsonFile(GITHUB_PATH, scenes, "jusDo: update movie scene riddles");
  }
  await writeLocalCache(scenes);
  return scenes;
}
