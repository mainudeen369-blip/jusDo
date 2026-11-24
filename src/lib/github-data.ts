/**
 * Shared durable store via GitHub Contents API.
 * When JUSDO_GITHUB_TOKEN (+ repo) are set, admin/quiz data is shared for every player.
 */

const API = "https://api.github.com";

export function githubStoreConfigured(): boolean {
  return Boolean(process.env.JUSDO_GITHUB_TOKEN && githubRepo());
}

function githubRepo(): string | null {
  return process.env.JUSDO_GITHUB_REPO || process.env.GITHUB_REPOSITORY || null;
}

function githubBranch(): string {
  return process.env.JUSDO_GITHUB_BRANCH || "master";
}

function token(): string | null {
  return process.env.JUSDO_GITHUB_TOKEN || process.env.GITHUB_TOKEN || null;
}

function headers(extra?: Record<string, string>): HeadersInit {
  const t = token();
  if (!t) throw new Error("JUSDO_GITHUB_TOKEN is not configured");
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${t}`,
    "X-GitHub-Api-Version": "2022-11-28",
    ...extra,
  };
}

export async function readGithubJsonFile<T>(pathInRepo: string): Promise<T | null> {
  if (!githubStoreConfigured()) return null;
  const repo = githubRepo()!;
  const url = `${API}/repos/${repo}/contents/${pathInRepo}?ref=${encodeURIComponent(githubBranch())}`;
  const res = await fetch(url, {
    headers: headers(),
    // Always fetch latest shared content
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub read failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const body = (await res.json()) as { content?: string; encoding?: string };
  if (!body.content) return null;
  const raw = Buffer.from(body.content, (body.encoding as BufferEncoding) || "base64").toString("utf8");
  return JSON.parse(raw) as T;
}

export async function writeGithubJsonFile(
  pathInRepo: string,
  data: unknown,
  message: string,
): Promise<void> {
  if (!githubStoreConfigured()) {
    throw new Error(
      "Shared storage not configured. Set JUSDO_GITHUB_TOKEN and JUSDO_GITHUB_REPO on Vercel.",
    );
  }
  const repo = githubRepo()!;
  const branch = githubBranch();
  const url = `${API}/repos/${repo}/contents/${pathInRepo}`;

  // Need current sha to update an existing file
  let sha: string | undefined;
  const existing = await fetch(`${url}?ref=${encodeURIComponent(branch)}`, {
    headers: headers(),
    cache: "no-store",
  });
  if (existing.ok) {
    const meta = (await existing.json()) as { sha?: string };
    sha = meta.sha;
  } else if (existing.status !== 404) {
    const text = await existing.text();
    throw new Error(`GitHub meta failed (${existing.status}): ${text.slice(0, 200)}`);
  }

  const content = Buffer.from(JSON.stringify(data, null, 2), "utf8").toString("base64");
  const res = await fetch(url, {
    method: "PUT",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      message,
      content,
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub write failed (${res.status}): ${text.slice(0, 300)}`);
  }
}

export function sharedStorageNote(kind: "questions" | "quiz-config" | "scores"): string {
  if (githubStoreConfigured()) {
    return `Shared for everyone via GitHub (${githubRepo()}/${kind === "quiz-config" ? "data/quiz-config.json" : kind === "scores" ? "data/scores.json" : "data/questions.json"}).`;
  }
  return "Shared GitHub storage is not configured — saves stay on this server only and will not reach every player.";
}
