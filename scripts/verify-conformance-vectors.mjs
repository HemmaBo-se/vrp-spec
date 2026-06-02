// Exercises the committed VRP JWS conformance vectors with a real Ed25519
// verification (Node crypto), proving the signature is valid and that the
// expected failure modes from spec/v0.1.md §7-§8 are rejected.
//
// Run directly or via `npm test`:
//   node scripts/verify-conformance-vectors.mjs

import { readFileSync } from "node:fs";
import { generateKeyPairSync } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { KID, publicJwk, signOffer, verifyCompactJws, baseOffer } from "./conformance.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (rel) => JSON.parse(readFileSync(join(repoRoot, rel), "utf8"));

const failures = [];
const pass = (name) => console.log(`  ok   ${name}`);
const check = (name, cond) => (cond ? pass(name) : failures.push(name));

const jwks = readJson("examples/conformance/jwks.v0.1.json");
const envelope = readJson("examples/conformance/verified-stay-offer.signed.v0.1.json");

// 0. The committed JWKS matches the deterministic test key (vectors not stale).
check("committed JWKS matches deterministic test key", jwks.keys[0].x === publicJwk().x);

// 1. Positive: the committed signed offer verifies against the JWKS.
const result = verifyCompactJws(envelope.signature.jws, jwks);
check("committed signed offer signature verifies", result.valid);

// 2. Positive: the JWS payload matches the envelope's `offer` (payload_matches_offer).
check(
  "decoded JWS payload matches envelope offer",
  result.valid && JSON.stringify(result.payload) === JSON.stringify(envelope.offer),
);

// 3. Negative: a tampered payload must fail signature verification.
const parts = envelope.signature.jws.split(".");
const tamperedPayload = Buffer.from(
  JSON.stringify({ ...envelope.offer, price: { ...envelope.offer.price, agent_total: 1 } }),
).toString("base64url");
const tamperedJws = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
check("tampered payload is rejected", verifyCompactJws(tamperedJws, jwks).reason === "signature_mismatch");

// 4. Negative: a kid absent from the JWKS must fail (no trusted key).
const wrongKidJws = signOffer(baseOffer, { kid: "example-host.invalid-unknown-kid" });
check("unknown kid is rejected", verifyCompactJws(wrongKidJws, jwks).reason === "kid_not_in_jwks");

// 5. Negative: a JWKS advertising a different (valid) key for the same kid must fail.
const otherX = generateKeyPairSync("ed25519").publicKey.export({ format: "jwk" }).x;
const otherJwks = { keys: [{ ...publicJwk(), x: otherX }] };
check(
  "signature against wrong key is rejected",
  verifyCompactJws(envelope.signature.jws, otherJwks).reason === "signature_mismatch",
);

// 6. Freshness (spec §6/§7): the vector is intentionally expired, so a verifier
//    MUST treat it as non-quoteable even though the signature is valid.
const now = new Date("2026-06-02T13:00:00Z");
const fresh = new Date(envelope.offer.valid_until) > now;
check("expired valid_until is not fresh (must not quote)", result.valid && fresh === false);

if (failures.length > 0) {
  console.error("\nVRP conformance vector verification failed:");
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}
console.log(`\nVRP JWS conformance vectors passed (${6 + 1} checks, kid=${KID}).`);
