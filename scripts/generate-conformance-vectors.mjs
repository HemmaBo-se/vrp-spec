// Regenerates the committed VRP JWS conformance vectors from the deterministic
// test seed in scripts/conformance.mjs. Run after intentionally changing the
// base offer or key label:
//
//   node scripts/generate-conformance-vectors.mjs
//
// The output is deterministic, so `git diff` stays empty unless an input changed.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { jwks, signedOfferEnvelope } from "./conformance.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function writeJson(relPath, value) {
  writeFileSync(join(repoRoot, relPath), `${JSON.stringify(value, null, 2)}\n`);
  console.log(`wrote ${relPath}`);
}

writeJson("examples/conformance/jwks.v0.1.json", jwks());
writeJson("examples/conformance/verified-stay-offer.signed.v0.1.json", signedOfferEnvelope());
