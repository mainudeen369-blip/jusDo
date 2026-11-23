import { promises as fs } from "fs";
import path from "path";
import { SEED_QUESTIONS } from "./seed-questions";
import type { QuizQuestion } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "questions.json");

async function readFileQuestions(): Promise<QuizQuestion[] | null> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as QuizQuestion[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // missing or invalid
  }
  return null;
}

export async function getQuestions(): Promise<QuizQuestion[]> {
  return (await readFileQuestions()) ?? SEED_QUESTIONS;
}

export async function saveQuestions(questions: QuizQuestion[]): Promise<QuizQuestion[]> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(questions, null, 2), "utf8");
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
