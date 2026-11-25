import { NextRequest, NextResponse } from "next/server";
import {
  createRoom,
  getRoomView,
  joinRoom,
  startRoom,
  submitAnswer,
} from "@/lib/scene-rooms";

export async function GET(req: NextRequest) {
  try {
    const code = new URL(req.url).searchParams.get("code");
    if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });
    const room = await getRoomView(code);
    return NextResponse.json({ room });
  } catch (e) {
    const status = (e as { status?: number }).status || 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = String(body.action || "");
    const playerId = String(body.playerId || "").slice(0, 64);
    const playerName = String(body.playerName || "Player").slice(0, 24);
    if (!playerId) return NextResponse.json({ error: "playerId required" }, { status: 400 });

    if (action === "create") {
      const room = await createRoom(playerId, playerName);
      const view = await getRoomView(room.code);
      return NextResponse.json({ ok: true, room: view });
    }
    if (action === "join") {
      const code = String(body.code || "").toUpperCase();
      await joinRoom(code, playerId, playerName);
      const view = await getRoomView(code);
      return NextResponse.json({ ok: true, room: view });
    }
    if (action === "start") {
      const code = String(body.code || "").toUpperCase();
      await startRoom(code, playerId);
      const view = await getRoomView(code);
      return NextResponse.json({ ok: true, room: view });
    }
    if (action === "answer") {
      const code = String(body.code || "").toUpperCase();
      const optionId = String(body.optionId || "");
      if (!optionId) return NextResponse.json({ error: "optionId required" }, { status: 400 });
      await submitAnswer(code, playerId, optionId);
      const view = await getRoomView(code);
      return NextResponse.json({ ok: true, room: view });
    }
    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (e) {
    const status = (e as { status?: number }).status || 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
