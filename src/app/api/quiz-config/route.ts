import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/questions-store";
import { getQuizConfig, quizConfigStorageNote, saveQuizConfig } from "@/lib/quiz-config";

export async function GET() {
  const config = await getQuizConfig();
  return NextResponse.json({ config, storageNote: quizConfigStorageNote() });
}

export async function POST(req: NextRequest) {
  try {
    assertAdmin(req.headers.get("x-admin-password"));
    const body = await req.json();
    const config = await saveQuizConfig({
      questionsPerRound: Number(body.questionsPerRound),
      secondsPerQuestion: Number(body.secondsPerQuestion),
    });
    return NextResponse.json({
      ok: true,
      config,
      storageNote: quizConfigStorageNote(),
    });
  } catch (e) {
    const status = (e as { status?: number }).status || 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
