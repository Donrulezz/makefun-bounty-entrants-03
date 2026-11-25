// Entry for make.fun's bounty-entrants-03: copy BOUNTY.json to the output directory.
// Node 22+, no dependencies. Reads only files shipped in this repository.
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoDir: string =
  process.env.MAKEFUN_BOT_DIR || dirname(fileURLToPath(import.meta.url));
const outputDir: string = process.env.MAKEFUN_OUTPUT_DIR || "/output";

const source = join(repoDir, "BOUNTY.json");
const target = join(outputDir, "BOUNTY.json");

function fail(message: string): never {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

if (!existsSync(source)) {
  fail(`BOUNTY.json not found at ${source} (set MAKEFUN_BOT_DIR to the repository root)`);
}

// Sanity-check the shape the rules ask for before copying; the copy itself stays byte for byte.
let parsed: unknown;
try {
  parsed = JSON.parse(readFileSync(source, "utf8"));
} catch (err) {
  fail(`BOUNTY.json is not valid JSON: ${(err as Error).message}`);
}
const obj = parsed as { bounties?: unknown; url?: unknown } | null;
if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
  fail("BOUNTY.json must be a JSON object");
}
if (obj.bounties !== undefined && obj.url !== undefined) {
  fail('BOUNTY.json must name "bounties" or "url", not both');
}
const count = Array.isArray(obj.bounties) ? obj.bounties.length : typeof obj.url === "string" ? 1 : 0;
if (count < 1 || count > 100) {
  fail(`BOUNTY.json must name 1 to 100 bounties (found ${count})`);
}

try {
  mkdirSync(outputDir, { recursive: true });
  copyFileSync(source, target);
} catch (err) {
  fail(`could not copy BOUNTY.json to ${target}: ${(err as Error).message}`);
}

console.log(`main.ts: copied BOUNTY.json (${count} bounties) to ${target}`);
