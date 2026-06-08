// Regenerates the committed VRP JWS conformance vectors from the deterministic
// test seed in scripts/conformance.mjs. Run after intentionally changing the
// base offer or key label:
//
//   node scripts/generate-conformance-vectors.mjs
//
// The output is deterministic, so `git diff` stays empty unless an input changed.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  attestationDidWebDocument,
  jwks,
  signedAttestationBundle,
  signedOfferEnvelope,
} from "./conformance.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function writeJson(relPath, value) {
  const absPath = join(repoRoot, relPath);
  mkdirSync(dirname(absPath), { recursive: true });
  writeFileSync(absPath, `${JSON.stringify(value, null, 2)}\n`);
  console.log(`wrote ${relPath}`);
}

const loadPayload = (relPath) => JSON.parse(readFileSync(join(repoRoot, relPath), "utf8"));

writeJson("examples/conformance/jwks.v0.1.json", jwks());
writeJson("examples/conformance/verified-stay-offer.signed.v0.1.json", signedOfferEnvelope());

// Portable attestation vectors (real, verifiable VC compact JWS).
writeJson("examples/conformance/attestations/did-web-document.v0.1.json", attestationDidWebDocument());
writeJson(
  "examples/conformance/attestations/attestation-bundle.signed.v0.1.json",
  signedAttestationBundle(loadPayload),
);
