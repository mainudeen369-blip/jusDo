import { createReadStream, existsSync } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { NextResponse } from "next/server";
import { getRemoteExeFallbackUrl } from "@/lib/download";

const CANDIDATES = ["jusDo-Setup-0.1.0.exe", "jusDo-0.1.0-portable.exe"];

export async function GET(req: Request) {
  const localPath = CANDIDATES.map((name) => path.join(process.cwd(), "dist-exe", name)).find(
    (p) => existsSync(p),
  );

  if (localPath) {
    const info = await stat(localPath);
    const fileName = path.basename(localPath);
    const nodeStream = createReadStream(localPath);
    const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream;

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(info.size),
        "Cache-Control": "no-store",
      },
    });
  }

  // Production / no local dist-exe: redirect to GitHub Releases
  return NextResponse.redirect(getRemoteExeFallbackUrl(), 302);
}
