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

  const remote = getRemoteExeFallbackUrl();
  const url = new URL(req.url);
  const forceRemote = url.searchParams.get("remote") === "1";

  // Only follow remote when explicitly requested AND configured (avoid GitHub 404 loop)
  if (forceRemote && process.env.NEXT_PUBLIC_EXE_DOWNLOAD_URL?.trim()) {
    return NextResponse.redirect(remote, 302);
  }

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>jusDo Windows download</title>
  <style>
    body { font-family: system-ui, sans-serif; background:#07131f; color:#e8eef5; margin:0; min-height:100vh; display:grid; place-items:center; padding:24px; }
    .card { max-width:560px; background:#0f1c28; border:1px solid rgba(255,255,255,.12); border-radius:16px; padding:24px; }
    h1 { margin:0 0 8px; color:#f4c95f; font-size:1.5rem; }
    p { color:#cbd5e1; line-height:1.5; }
    code { background:#0006; padding:2px 6px; border-radius:6px; color:#99f6e4; }
    a { color:#5eead4; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Windows installer not hosted online yet</h1>
    <p>The GitHub Release for the <code>.exe</code> has not been uploaded, so the public download link is not ready.</p>
    <p>On this PC, install from:</p>
    <p><code>c:\\hajaWorkingFolder\\jusdo\\dist-exe\\jusDo-Setup-0.1.0.exe</code></p>
    <p>Or open the website locally (<code>npm run dev</code>) and use Download — that streams the file from your machine.</p>
    <p><a href="/">← Back to jusDo</a></p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
