// Exercises the committed VRP Portable Attestation conformance vectors with a
// real Ed25519 verification (Node crypto), proving the credential compact JWS
// values verify against the issuer did:web document and that the verification
// steps and failure modes from spec/attestations-v0.1.md §8 are enforced.
//
// Run directly or via `npm test`:
//   node scripts/verify-attestation-vectors.mjs

import { readFileSync } from "node:fs";
import { generateKeyPairSync } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  ATTESTATION_CREDENTIALS,
  ATTESTATION_ISSUER_DID,
  ATTESTATION_KID,
  attestationPublicKeyX,
  signCredential,
  verifyAttestationJws,
} from "./conformance.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (rel) => JSON.parse(readFileSync(join(repoRoot, rel), "utf8"));

const failures = [];
const pass = (name) => console.log(`  ok   ${name}`);
const check = (name, cond) => (cond ? pass(name) : failures.push(name));

const didDocument = readJson("examples/conformance/attestations/did-web-document.v0.1.json");
const bundle = readJson("examples/conformance/attestations/attestation-bundle.signed.v0.1.json");

// Validity window is fixed in the payloads (validFrom/validUntil). Evaluate at a
// time inside that window so the "current" check is meaningful and reproducible.
const evaluationTime = new Date("2026-06-02T12:00:00Z");

// 0. The committed did:web document carries the deterministic attestation key
//    (vectors not stale).
check(
  "committed did:web document matches deterministic attestation key",
  didDocument.verificationMethod?.[0]?.publicKeyJwk?.x === attestationPublicKeyX(),
);

// 1. Bundle shape: issuer is the host-domain DID and there is one credential per
//    defined type, in order.
check("bundle issuer is the host-domain DID", bundle.issuer === ATTESTATION_ISSUER_DID);
check(
  "bundle carries one credential per VRP credential type",
  Array.isArray(bundle.credentials) &&
    bundle.credentials.length === ATTESTATION_CREDENTIALS.length &&
    bundle.credentials.every((c, i) => c.type === ATTESTATION_CREDENTIALS[i].type),
);

// 2. Per-credential verification against the did:web document (spec §8).
for (const [index, entry] of bundle.credentials.entries()) {
  const spec = ATTESTATION_CREDENTIALS[index];
  const label = entry.type;

  // 2a. Media type is the JOSE VC media type.
  check(`${label}: mediaType is application/vc+jwt`, entry.mediaType === "application/vc+jwt");

  // 2b. The compact JWS verifies against the issuer did:web document (steps 1-6).
  const result = verifyAttestationJws(entry.compactJws, didDocument);
  check(`${label}: compact JWS signature verifies`, result.valid);
  if (!result.valid) continue;

  // 2c. Protected header is correct (typ vc+jwt, alg EdDSA, issuer-controlled kid).
  check(`${label}: header typ is vc+jwt`, result.header.typ === "vc+jwt");
  check(`${label}: header alg is EdDSA`, result.header.alg === "EdDSA");
  check(`${label}: header kid is the issuer attestation key`, result.header.kid === ATTESTATION_KID);

  // 2d. Decoded payload matches the committed unsecured payload example exactly.
  const payloadExample = readJson(spec.payloadPath);
  check(
    `${label}: decoded payload matches committed payload example`,
    JSON.stringify(result.payload) === JSON.stringify(payloadExample),
  );

  // 2e. Context, type, and the issuer claim (steps 4, 7, 8).
  const payload = result.payload;
  check(
    `${label}: payload includes W3C VC v2 and VRP v1 contexts`,
    Array.isArray(payload["@context"]) &&
      payload["@context"].includes("https://www.w3.org/ns/credentials/v2") &&
      payload["@context"].includes("https://vacationrentalprotocol.com/contexts/v1"),
  );
  check(
    `${label}: payload type includes VerifiableCredential and ${label}`,
    Array.isArray(payload.type) &&
      payload.type.includes("VerifiableCredential") &&
      payload.type.includes(label),
  );
  check(`${label}: payload issuer matches bundle issuer`, payload.issuer === bundle.issuer);

  // 2f. Validity window present and current (step 9).
  const validFrom = new Date(payload.validFrom);
  const validUntil = new Date(payload.validUntil);
  check(
    `${label}: validFrom/validUntil present and current`,
    payload.validFrom != null &&
      payload.validUntil != null &&
      validFrom <= evaluationTime &&
      validUntil > evaluationTime,
  );

  // 2g. No embedded proof/signature/issuedAt in the credential JSON (step 10).
  check(
    `${label}: payload has no embedded proof/signature/issuedAt`,
    !("proof" in payload) && !("signature" in payload) && !("issuedAt" in payload),
  );
}

// 2h. VRPPropertyAttestedClaimsCredential normative rules (spec §5.5): claim
//     keys are lowercase snake_case and unique within the manifest; state is
//     affirmed|negated; verified_at, when present, is an ISO date and never null.
const claimsIndex = ATTESTATION_CREDENTIALS.findIndex(
  (c) => c.type === "VRPPropertyAttestedClaimsCredential",
);
if (claimsIndex >= 0) {
  const claimsResult = verifyAttestationJws(bundle.credentials[claimsIndex].compactJws, didDocument);
  check("property-claims: compact JWS verifies", claimsResult.valid);
  const claims = claimsResult.payload?.credentialSubject?.claims;
  const keyPattern = /^[a-z][a-z0-9_]*$/;
  const datePattern = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
  const keys = Array.isArray(claims) ? claims.map((c) => c.claim) : [];
  check("property-claims: claims is a non-empty array", Array.isArray(claims) && claims.length > 0);
  check(
    "property-claims: every claim key is lowercase snake_case",
    keys.every((k) => typeof k === "string" && keyPattern.test(k)),
  );
  // Polarity rule (spec §5.5): keys name the property affirmatively; state alone
  // carries polarity. Best-effort guard — the normative rule is the prose MUST.
  // Blocks no_/not_ prefix, _not_ anywhere (e.g. pets_not_allowed), and
  // _forbidden/_prohibited/_banned/_disallowed suffix.
  const polarityBlock = /^(no_|not_)|_not_|_(forbidden|prohibited|banned|disallowed)$/;
  check(
    "property-claims: no name-encoded negations (affirmative naming)",
    keys.every((k) => typeof k === "string" && !polarityBlock.test(k)),
  );
  check("property-claims: claim keys are unique", new Set(keys).size === keys.length);
  check(
    "property-claims: every state is affirmed or negated",
    (claims || []).every((c) => c.state === "affirmed" || c.state === "negated"),
  );
  check(
    "property-claims: verified_at, when present, is a date and never null",
    (claims || []).every(
      (c) => !("verified_at" in c) || (typeof c.verified_at === "string" && datePattern.test(c.verified_at)),
    ),
  );
  // The canonical example carries the real incident that motivated the layer:
  // dogs affirmed, cats negated (a confident, signed negation).
  const byKey = Object.fromEntries((claims || []).map((c) => [c.claim, c]));
  check(
    "property-claims: canonical cat case (pets_dogs affirmed, pets_cats negated)",
    byKey.pets_dogs?.state === "affirmed" && byKey.pets_cats?.state === "negated",
  );
}

// 3. Negative: a tampered payload must fail signature verification.
const firstParts = bundle.credentials[0].compactJws.split(".");
const tamperedPayload = Buffer.from(
  JSON.stringify({ ...readJson(ATTESTATION_CREDENTIALS[0].payloadPath), issuer: "did:web:attacker.invalid" }),
).toString("base64url");
const tamperedJws = `${firstParts[0]}.${tamperedPayload}.${firstParts[2]}`;
check(
  "tampered credential payload is rejected",
  verifyAttestationJws(tamperedJws, didDocument).reason === "signature_mismatch",
);

// 4. Negative: a kid absent from the did:web document must fail (no trusted key).
const wrongKidJws = signCredential(readJson(ATTESTATION_CREDENTIALS[0].payloadPath), {
  header: { typ: "vc+jwt", alg: "EdDSA", kid: `${ATTESTATION_ISSUER_DID}#unknown-key` },
});
check(
  "unknown kid is rejected",
  verifyAttestationJws(wrongKidJws, didDocument).reason === "kid_not_in_did_document",
);

// 5. Negative: a did:web document advertising a different key for the same kid
//    must fail signature verification.
const otherX = generateKeyPairSync("ed25519").publicKey.export({ format: "jwk" }).x;
const otherDidDocument = structuredClone(didDocument);
otherDidDocument.verificationMethod[0].publicKeyJwk.x = otherX;
check(
  "signature against wrong key is rejected",
  verifyAttestationJws(bundle.credentials[0].compactJws, otherDidDocument).reason === "signature_mismatch",
);

if (failures.length > 0) {
  console.error("\nVRP attestation vector verification failed:");
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}
console.log(
  `\nVRP attestation conformance vectors passed (${bundle.credentials.length} credentials verified, kid=${ATTESTATION_KID}).`,
);
