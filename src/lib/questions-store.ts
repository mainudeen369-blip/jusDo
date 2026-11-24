import { promises as fs } from "fs";
import {
  githubStoreConfigured,
  readGithubJsonFile,
  sharedStorageNote,
  writeGithubJsonFile,
} from "./github-data";
import { SEED_QUESTIONS } from "./seed-questions";
import { isServerlessReadonlyFs, seedDataPath, writableDataPath } from "./runtime-fs";
import type { QuizQuestion } from "./types";

const WRITE_PATH = () => writableDataPath("questions.json");
const SEED_PATH = () => seedDataPath("questions.json");
const GITHUB_PATH = "data/questions.json";

async function readJsonFile(filePath: string): Promise<QuizQuestion[] | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as QuizQuestion[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // missing / invalid
  }
  return null;
}

function pathDirname(filePath: string) {
  const i = Math.max(filePath.lastIndexOf("/"), filePath.lastIndexOf("\\"));
  return i >= 0 ? filePath.slice(0, i) : ".";
}

async function writeLocalCache(questions: QuizQuestion[]) {
  const target = WRITE_PATH();
  try {
    await fs.mkdir(pathDirname(target), { recursive: true });
    await fs.writeFile(target, JSON.stringify(questions, null, 2), "utf8");
  } catch {
    // cache is best-effort
  }
}

export async function getQuestions(): Promise<QuizQuestion[]> {
  if (githubStoreConfigured()) {
    try {
      const remote = await readGithubJsonFile<QuizQuestion[]>(GITHUB_PATH);
      if (Array.isArray(remote) && remote.length > 0) {
        await writeLocalCache(remote);
        return remote;
      }
    } catch {
      // fall through to local
    }
  }

  return (
    (await readJsonFile(WRITE_PATH())) ||
    (await readJsonFile(SEED_PATH())) ||
    SEED_QUESTIONS
  );
}

export async function saveQuestions(questions: QuizQuestion[]): Promise<QuizQuestion[]> {
  if (githubStoreConfigured()) {
    await writeGithubJsonFile(GITHUB_PATH, questions, "jusDo admin: update quiz questions");
    await writeLocalCache(questions);
    return questions;
  }

  const target = WRITE_PATH();
  try {
    await fs.mkdir(pathDirname(target), { recursive: true });
    await fs.writeFile(target, JSON.stringify(questions, null, 2), "utf8");
  } catch (e) {
    const msg = (e as Error).message || String(e);
    const err = new Error(
      isServerlessReadonlyFs()
        ? `Could not save on server (${msg}). Configure JUSDO_GITHUB_TOKEN so all players get the same questions.`
        : msg,
    );
    throw err;
  }
  return questions;
}

export async function upsertQuestion(question: QuizQuestion): Promise<QuizQuestion[]> {
  const all = await getQuestions();
  const idx = all.findIndex((q) => q.id === question.id);
  if (idx >= 0) all[idx] = question;
  else all.push(question);
  return saveQuestions(all);
}

export async function replaceAllQuestions(questions: QuizQuestion[]): Promise<QuizQuestion[]> {
  return saveQuestions(questions);
}

export async function deleteQuestion(id: string): Promise<QuizQuestion[]> {
  const all = await getQuestions();
  return saveQuestions(all.filter((q) => q.id !== id));
}

export function assertAdmin(password: string | null | undefined) {
  const expected = process.env.ADMIN_PASSWORD || "jusdo-admin";
  if (!password || password !== expected) {
    const err = new Error("Unauthorized");
    (err as Error & { status: number }).status = 401;
    throw err;
  }
}

export function storageNote() {
  return sharedStorageNote("questions");
}
