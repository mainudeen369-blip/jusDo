import { NextRequest, NextResponse } from "next/server";
import { addScore, buildLeaderboard, buildLeaderboards, getAllScores, storageNote } from "@/lib/scores-store";
import type { QuizDifficulty, QuizScorePayload, StarId } from "@/lib/types";

export async function GET() {
  const scores = await getAllScores();
  const boards = buildLeaderboards(scores, 10);
  return NextResponse.json({
    topEasy: boards.easy,
    topDifficult: boards.difficult,
    /** flat mix kept for older clients */
    top: [...boards.difficult, ...boards.easy].slice(0, 10),
    count: scores.length,
    storageNote: storageNote(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const playerName = String(body.playerName || "").trim().slice(0, 32);
    const club = body.club as StarId;
    const score = Number(body.score);
    const total = Number(body.total);
    const streak = Number(body.streak || 0);
    const guestId = body.guestId ? String(body.guestId).slice(0, 64) : undefined;
    const difficulty: QuizDifficulty =
      body.difficulty === "difficult" ? "difficult" : "easy";

    if (!playerName || (club !== "vijay" && club !== "ajith")) {
      return NextResponse.json({ error: "playerName and club required" }, { status: 400 });
    }
    if (!Number.isFinite(score) || !Number.isFinite(total) || total < 1 || score < 0) {
      return NextResponse.json({ error: "invalid score" }, { status: 400 });
    }

    const entry: QuizScorePayload = {
      playerName,
      club,
      score: Math.min(score, total),
      total,
      streak: Math.max(0, streak),
      at: new Date().toISOString(),
      guestId,
      difficulty,
    };

    const all = await addScore(entry);
    const boards = buildLeaderboards(all, 10);
    return NextResponse.json({
      ok: true,
      topEasy: boards.easy,
      topDifficult: boards.difficult,
      top: buildLeaderboard(all, 10),
      storageNote: storageNote(),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
