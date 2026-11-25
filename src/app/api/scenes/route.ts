import { NextResponse } from "next/server";
import { getScenes } from "@/lib/scenes-store";

export async function GET() {
  const scenes = await getScenes();
  return NextResponse.json({
    scenes,
    count: scenes.length,
    questionsPerRound: 15,
    setsApprox: Math.floor(scenes.length / 15),
    note: "Tamil movie scene riddles (EN + TA) — Rajini, Kamal, Vijay, Ajith & more.",
  });
}
