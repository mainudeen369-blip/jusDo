import { NextResponse } from "next/server";
import { getScenes } from "@/lib/scenes-store";

export async function GET() {
  const scenes = await getScenes();
  return NextResponse.json({
    scenes,
    questionsPerRound: 15,
    note: "Tamil movie scene riddles — guess the film.",
  });
}
