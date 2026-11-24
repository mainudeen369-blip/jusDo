import { promises as fs } from "fs";
import {
  githubStoreConfigured,
  readGithubJsonFile,
  sharedStorageNote,
  writeGithubJsonFile,
} from "./github-data";
import { DEFAULT_QUIZ_CONFIG, type QuizConfig } from "./quiz-config-shared";
import { seedDataPath, writableDataPath } from "./runtime-fs";

export type { QuizConfig };
export { DEFAULT_QUIZ_CONFIG };

const WRITE_PATH = () => writableDataPath("quiz-config.json");
const SEED_PATH = () => seedDataPath("quiz-config.json");
const GITHUB_PATH = "data/quiz-config.json";

function normalize(parsed: Partial<QuizConfig>): QuizConfig {
  return {
    questionsPerRound: Math.max(
      1,
      Number(parsed.questionsPerRound) || DEFAULT_QUIZ_CONFIG.questionsPerRound,
    ),
    secondsPerQuestion: Math.max(
      1,
      Number(parsed.secondsPerQuestion) || DEFAULT_QUIZ_CONFIG.secondsPerQuestion,
    ),
  };
}

async function readConfig(filePath: string): Promise<QuizConfig | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return normalize(JSON.parse(raw) as Partial<QuizConfig>);
  } catch {
    return null;
  }
}

async function writeLocalCache(config: QuizConfig) {
  const target = WRITE_PATH();
  const dir = target.includes("\\")
    ? target.slice(0, target.lastIndexOf("\\"))
    : target.slice(0, target.lastIndexOf("/"));
  try {
    await fs.mkdir(dir || "/tmp", { recursive: true });
    await fs.writeFile(target, JSON.stringify(config, null, 2), "utf8");
  } catch {
    // best-effort
  }
}

export async function getQuizConfig(): Promise<QuizConfig> {
  if (githubStoreConfigured()) {
    try {
      const remote = await readGithubJsonFile<Partial<QuizConfig>>(GITHUB_PATH);
      if (remote) {
        const next = normalize(remote);
        await writeLocalCache(next);
        return next;
      }
    } catch {
      // fall through
    }
  }

  return (
    (await readConfig(WRITE_PATH())) ||
    (await readConfig(SEED_PATH())) || { ...DEFAULT_QUIZ_CONFIG }
  );
}

export async function saveQuizConfig(config: QuizConfig): Promise<QuizConfig> {
  const next: QuizConfig = {
    questionsPerRound: Math.max(1, Math.min(50, Math.floor(config.questionsPerRound))),
    secondsPerQuestion: Math.max(1, Math.min(120, Math.floor(config.secondsPerQuestion))),
  };

  if (githubStoreConfigured()) {
    await writeGithubJsonFile(GITHUB_PATH, next, "jusDo admin: update quiz rules");
    await writeLocalCache(next);
    return next;
  }

  await writeLocalCache(next);
  return next;
}

export function quizConfigStorageNote() {
  return sharedStorageNote("quiz-config");
}
