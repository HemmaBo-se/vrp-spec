// License drift-guard (ADR 0010 D7 — WO-2 #4e).
//
// Enforces the dual-license boundary so it cannot silently regress:
//   - spec text  → CC0 1.0   (LICENSE)
//   - code/vectors → Apache-2.0 (LICENSE-CODE, incl. §3 patent grant)
//
// Run directly or via `npm test`:  node scripts/check-license-boundary.mjs
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(repoRoot, rel), "utf8");
const failures = [];
const ok = (name) => console.log(`  ok   ${name}`);
const check = (name, cond) => (cond ? ok(name) : failures.push(name));

// 1. The two license files exist and are the right licenses.
check("LICENSE is CC0 1.0 (spec text)", read("LICENSE").includes("CC0 1.0 Universal"));
check(
  "LICENSE-CODE is Apache-2.0 (reference code + vectors)",
  /Apache License/.test(read("LICENSE-CODE")) && /Version 2\.0/.test(read("LICENSE-CODE")),
);

// 2. No spec doc may carry the old "Apache 2.0 - see [LICENSE]" footer
//    (spec text is CC0; only the code side is Apache).
const specDir = join(repoRoot, "spec");
const specDocs = readdirSync(specDir).filter((f) => f.endsWith(".md"));
for (const doc of specDocs) {
  const body = readFileSync(join(specDir, doc), "utf8");
  check(
    `spec/${doc}: no stale "Apache 2.0 - see [LICENSE]" footer`,
    !/Apache 2\.0\s*[-—]\s*see \[LICENSE\]\(\.\.\/LICENSE\)/.test(body),
  );
  check(
    `spec/${doc}: carries a CC0 spec-text license footer`,
    /CC0 1\.0\]\(\.\.\/LICENSE\)/.test(body),
  );
}

// 3. README states the dual-license boundary.
const readme = read("README.md");
check("README references CC0 1.0 for spec text", /CC0 1\.0\]\(\.\/LICENSE\)/.test(readme));
check("README references Apache-2.0 (LICENSE-CODE) for code/vectors", /LICENSE-CODE/.test(readme));

if (failures.length > 0) {
  console.error("\nLicense boundary check failed:");
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}
console.log(`\nLicense boundary OK (${specDocs.length} spec docs checked; CC0 spec text + Apache-2.0 code).`);
