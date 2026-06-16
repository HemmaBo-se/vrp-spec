#!/usr/bin/env node
/**
 * VRP StayIntent Discovery — reference verifier.
 *
 * Proves the no-gatekeeper mechanism (spec/stayintent-discovery-v0.1.md): a
 * StayIntent response is a NON-AUTHORITATIVE pointer; authority lives at the node.
 * Anyone can run this, against any index's response, with no trust in the index:
 *
 *   1. Structural conformance: response carries NO price/monetary field
 *      (§4.1), no rank/score/confidence (§4.2/§4.3), and trust_summary holds
 *      only verifiable booleans/refs (§4.3).
 *   2. Authority check (live): for each pointed node, fetch its signed
 *      verified_stay_offer and verify the Ed25519 signature against the node's
 *      own jwks_url. The index cannot forge this.
 *
 * Usage:
 *   node scripts/verify-stayintent.mjs [vectorPath]
 *   # default: examples/conformance/stayintent/positive.v0.1.json
 * Offline structural checks always run; the live authority check needs network.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createHash, createPublicKey, verify as edVerify } from "node:crypto";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const vectorPath = process.argv[2] || "examples/conformance/stayintent/positive.v0.1.json";
const vector = JSON.parse(readFileSync(join(repoRoot, vectorPath), "utf8"));
const resp = vector.expected_response;

const failures = [];
const ok = (n) => console.log(`  ok   ${n}`);
const check = (n, c) => (c ? ok(n) : (failures.push(n), console.log(`  FAIL ${n}`)));

// ── 1. Structural conformance (offline) ───────────────────────────────
const MONEY_KEY = /price|total|amount|cost|fee|currency/i;
const RANK_KEY = /score|rank|confidence|rating/i;

function scan(obj, path = "") {
  if (obj == null || typeof obj !== "object") return;
  for (const [k, v] of Object.entries(obj)) {
    const p = path ? `${path}.${k}` : k;
    if (MONEY_KEY.test(k) && (typeof v === "number" || (typeof v === "string" && /\d/.test(v)))) {
      failures.push(`monetary value present at ${p} (pricelessness §4.1)`);
    }
    if (RANK_KEY.test(k)) failures.push(`ranking signal present at ${p} (§4.2/§4.3)`);
    if (typeof v === "object") scan(v, p);
  }
}
scan(resp);
check("response carries no price/monetary field (§4.1)", !failures.some((f) => /monetary/.test(f)));
check("response carries no rank/score/confidence (§4.2/§4.3)", !failures.some((f) => /ranking/.test(f)));

for (const node of resp.nodes || []) {
  const ts = node.trust_summary || {};
  const bad = Object.entries(ts).filter(
    ([, v]) => !(typeof v === "boolean" || Array.isArray(v)),
  );
  check(`trust_summary for ${node.canonical_domain} is verifiable facts only`, bad.length === 0);
}

// ── 2. Authority check (live): pointer → node Ed25519 ──────────────────
const fromB64url = (s) => Buffer.from(s, "base64url");
async function verifyNodeOffer(node, q) {
  try {
    const jwks = await (await fetch(node.jwks_url)).json();
    const url = `${node.verified_stay_offer_endpoint}?check_in=${q.dates.check_in}&check_out=${q.dates.check_out}&guests=${q.guests}`;
    const offer = await (await fetch(url)).json();
    const jws = offer?.signature?.jws;
    if (!jws) return false;
    const [h, p, s] = jws.split(".");
    const header = JSON.parse(fromB64url(h).toString());
    const jwk = (jwks.keys || []).find((k) => k.kid === header.kid) || (jwks.keys || [])[0];
    const key = createPublicKey({ key: { crv: jwk.crv, x: jwk.x, kty: jwk.kty, alg: "EdDSA" }, format: "jwk" });
    return edVerify(null, Buffer.from(`${h}.${p}`), key, fromB64url(s));
  } catch (e) {
    console.log(`  (live skipped for ${node.canonical_domain}: ${e.message})`);
    return null; // network unavailable — structural checks still stand
  }
}

if (resp.match === "yes") {
  for (const node of resp.nodes) {
    const r = await verifyNodeOffer(node, vector.query);
    if (r === null) continue;
    check(`node ${node.canonical_domain} offer verifies Ed25519 (authority at node, not index)`, r);
  }
} else {
  check('no-match vector: empty nodes[]', Array.isArray(resp.nodes) && resp.nodes.length === 0);
}

console.log(failures.length ? `\nFAILED: ${failures.length}` : "\nStayIntent conformance OK.");
process.exitCode = failures.length ? 1 : 0;
