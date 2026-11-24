/**
 * Site download button hits this first.
 * - Local: `/api/download-exe` streams dist-exe/*.exe
 * - Production (Vercel): that route redirects to GitHub Releases / CDN
 * Override CDN with NEXT_PUBLIC_EXE_DOWNLOAD_URL.
 */
export function getExeDownloadUrl(): string {
  // Prefer same-origin API so localhost works without GitHub Release
  if (typeof window !== "undefined") {
    return "/api/download-exe";
  }

  const fromEnv = process.env.NEXT_PUBLIC_EXE_DOWNLOAD_URL?.trim();
  if (fromEnv) return fromEnv;

  return "/api/download-exe";
}

export function getRemoteExeFallbackUrl(): string {
  return (
    process.env.NEXT_PUBLIC_EXE_DOWNLOAD_URL?.trim() ||
    "https://github.com/mainudeen369-blip/jusDo/releases/latest/download/jusDo-Setup-0.1.0.exe"
  );
}
