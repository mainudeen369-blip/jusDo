import { cpSync, existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const standalone = path.join(root, ".next", "standalone");
const staticDir = path.join(root, ".next", "static");
const publicDir = path.join(root, "public");
const packDir = path.join(root, "pack", "standalone");

if (!existsSync(path.join(standalone, "server.js"))) {
  console.error("Missing .next/standalone/server.js — run next build first.");
  process.exit(1);
}

mkdirSync(path.join(standalone, ".next"), { recursive: true });
rmSync(path.join(standalone, ".next", "static"), { recursive: true, force: true });
cpSync(staticDir, path.join(standalone, ".next", "static"), { recursive: true });
rmSync(path.join(standalone, "public"), { recursive: true, force: true });
cpSync(publicDir, path.join(standalone, "public"), { recursive: true });

if (!existsSync(path.join(standalone, "node_modules", "next"))) {
  console.error("standalone/node_modules/next missing — Next standalone build incomplete.");
  process.exit(1);
}

rmSync(packDir, { recursive: true, force: true });
mkdirSync(path.dirname(packDir), { recursive: true });
cpSync(standalone, packDir, { recursive: true });

// electron-builder respects .gitignore and skips folders named node_modules.
// Rename so the runtime deps are actually packaged.
const nm = path.join(packDir, "node_modules");
const vendor = path.join(packDir, "vendor_modules");
if (existsSync(vendor)) rmSync(vendor, { recursive: true, force: true });
renameSync(nm, vendor);

if (!existsSync(path.join(vendor, "next"))) {
  console.error("pack/standalone/vendor_modules/next missing after rename.");
  process.exit(1);
}

writeFileSync(path.join(root, "pack", "READY.txt"), `Prepared ${new Date().toISOString()}\n`);
console.log("Prepared pack/standalone (vendor_modules) for Electron.");
