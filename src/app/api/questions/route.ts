import { NextRequest, NextResponse } from "next/server";
import {
  assertAdmin,
  deleteQuestion,
  getQuestions,
  replaceAllQuestions,
  upsertQuestion,
} from "@/lib/questions-store";
import type { QuizQuestion } from "@/lib/types";

function adminFrom(req: NextRequest) {
  return req.headers.get("x-admin-password");
}

export async function GET() {
  const questions = await getQuestions();
  return NextResponse.json({ questions });
}

export async function POST(req: NextRequest) {
  try {
    assertAdmin(adminFrom(req));
    const body = await req.json();
    const mode = body.mode as "single" | "json" | "replace" | undefined;

    if (mode === "json" || mode === "replace") {
      const questions = body.questions as QuizQuestion[];
      if (!Array.isArray(questions) || questions.length === 0) {
        return NextResponse.json({ error: "questions array required" }, { status: 400 });
      }
      for (const q of questions) {
        if (!q.id || !q.prompt || !q.options?.length || !q.correctOptionId) {
          return NextResponse.json({ error: "Invalid question shape" }, { status: 400 });
        }
      }
      const saved =
        mode === "replace"
          ? await replaceAllQuestions(questions)
          : await (async () => {
              let all = await getQuestions();
              for (const q of questions) {
                const idx = all.findIndex((x) => x.id === q.id);
                if (idx >= 0) all[idx] = q;
                else all = [...all, q];
              }
              return replaceAllQuestions(all);
            })();
      return NextResponse.json({ ok: true, questions: saved });
    }

    const question = body.question as QuizQuestion;
    if (!question?.id || !question.prompt || !question.options?.length || !question.correctOptionId) {
      return NextResponse.json({ error: "Invalid question" }, { status: 400 });
    }
    const saved = await upsertQuestion(question);
    return NextResponse.json({ ok: true, questions: saved });
  } catch (e) {
    const status = (e as { status?: number }).status || 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    assertAdmin(adminFrom(req));
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const questions = await deleteQuestion(id);
    return NextResponse.json({ ok: true, questions });
  } catch (e) {
    const status = (e as { status?: number }).status || 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
