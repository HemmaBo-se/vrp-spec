#!/usr/bin/env node
/**
 * Updated-stamp guard.
 *
 * The landing page carries a manual "Public draft v0.1 · updated YYYY-MM-DD"
 * stamp. It went stale once (said 2026-06-24 while five substantive changes
 * landed through 2026-07-08 — caught by the CEO reading the live site).
 * This check makes that class of drift fail CI instead:
 *
 *   If a PR changes spec content (spec/**, schemas/**, contexts/**,
 *   declarations/examples, or any top-level *.html other than the stamp
 *   itself), the stamp line in index.html must ALSO change in the same PR.
 *
 * Usage (CI): node scripts/check-updated-stamp.mjs <base-ref>
 * The base ref defaults to origin/main. Pushes to main (base == HEAD) skip.
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const base = process.argv[2] || "origin/main";

function sh(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

let mergeBase;
try {
  mergeBase = sh(`git merge-base ${base} HEAD`);
} catch {
  console.log(`check-updated-stamp: cannot resolve ${base}; skipping (shallow clone?)`);
  process.exit(0);
}
if (mergeBase === sh("git rev-parse HEAD")) {
  console.log("check-updated-stamp: HEAD == base; nothing to check.");
  process.exit(0);
}

const changed = sh(`git diff --name-only ${mergeBase}..HEAD`)
  .split("\n")
  .filter(Boolean);

const CONTENT = /^(spec\/|schemas\/|contexts\/|examples\/|declarations\/|[^/]+\.html$)/;
const contentChanged = changed.filter(
  (f) => CONTENT.test(f) && f !== "index.html",
);

// index.html itself counts as content when more than the stamp line changed.
const STAMP_RE = /Public draft v[\d.]+ &middot; updated \d{4}-\d{2}-\d{2}/;
if (changed.includes("index.html")) {
  const diff = sh(`git diff ${mergeBase}..HEAD -- index.html`);
  const nonStampEdits = diff
    .split("\n")
    .filter((l) => /^[+-][^+-]/.test(l))
    .filter((l) => !STAMP_RE.test(l));
  if (nonStampEdits.length > 0) contentChanged.push("index.html");
}

if (contentChanged.length === 0) {
  console.log("check-updated-stamp: no spec content changed; stamp may stay.");
  process.exit(0);
}

const baseIndex = sh(`git show ${mergeBase}:index.html`);
const headIndex = readFileSync("index.html", "utf8");
const baseStamp = baseIndex.match(STAMP_RE)?.[0];
const headStamp = headIndex.match(STAMP_RE)?.[0];

if (!headStamp) {
  console.error("check-updated-stamp: FAIL — the stamp line is missing from index.html.");
  process.exit(1);
}
if (baseStamp === headStamp) {
  console.error(
    "check-updated-stamp: FAIL — spec content changed but the landing-page stamp did not.\n" +
      `  Changed content: ${contentChanged.join(", ")}\n` +
      `  Stamp still says: "${headStamp}"\n` +
      "  Bump the 'updated YYYY-MM-DD' date in index.html in this PR.",
  );
  process.exit(1);
}
console.log(`check-updated-stamp: OK — stamp bumped ("${baseStamp}" → "${headStamp}").`);
