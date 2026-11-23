import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/questions-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    assertAdmin(body.password);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const status = (e as { status?: number }).status || 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
