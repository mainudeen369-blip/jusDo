import path from "path";

/** Vercel/AWS Lambda: only /tmp is writable. Local: use project data/. */
export function isServerlessReadonlyFs() {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

export function writableDataPath(filename: string) {
  if (isServerlessReadonlyFs()) {
    return path.join("/tmp", `jusdo-${filename}`);
  }
  return path.join(process.cwd(), "data", filename);
}

export function seedDataPath(filename: string) {
  return path.join(process.cwd(), "data", filename);
}
