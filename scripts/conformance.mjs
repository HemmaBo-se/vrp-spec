// Shared helpers and constants for VRP v0.1 JWS conformance vectors.
//
// SECURITY: The key material here is a throwaway test vector derived from a
// public, documented label. It is NOT a real host key, MUST NOT be used by any
// production VRP node, and signs only offers for the reserved `example-host.invalid`
// domain. See examples/conformance/README.md.

import { createHash, createPrivateKey, createPublicKey, sign, verify } from "node:crypto";

// Deterministic test seed: sha256 of a fixed, documented label.
// Reproduce with: node -e "console.log(require('crypto').createHash('sha256').update('VRP v0.1 conformance test vector key - DO NOT USE').digest('hex'))"
export const SEED_LABEL = "VRP v0.1 conformance test vector key - DO NOT USE";
export const KID = "example-host.invalid-test-vector-2026";
export const CANONICAL_DOMAIN = "example-host.invalid";

const PKCS8_ED25519_PREFIX = Buffer.from("302e020100300506032b657004220420", "hex");

function deriveKeyPair() {
  const seed = createHash("sha256").update(SEED_LABEL).digest();
  const der = Buffer.concat([PKCS8_ED25519_PREFIX, seed]);
  const privateKey = createPrivateKey({ key: der, format: "der", type: "pkcs8" });
  const publicKey = createPublicKey(privateKey);
  return { privateKey, publicKey };
}

export const { privateKey, publicKey } = deriveKeyPair();

export function publicJwk() {
  const jwk = publicKey.export({ format: "jwk" }); // { kty, crv, x }
  return {
    kty: jwk.kty,
    crv: jwk.crv,
    kid: KID,
    use: "sig",
    alg: "EdDSA",
    key_ops: ["verify"],
    x: jwk.x,
  };
}

export function jwks() {
  return { keys: [publicJwk()] };
}

function b64url(buf) {
  return Buffer.from(buf).toString("base64url");
}

// Sign an offer payload object into a compact JWS (header.payload.signature).
export function signOffer(offer, { kid = KID } = {}) {
  const header = { alg: "EdDSA", typ: "JWT", kid };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(offer))}`;
  const signature = sign(null, Buffer.from(signingInput), privateKey);
  return `${signingInput}.${b64url(signature)}`;
}

// Verify a compact JWS against a JWKS, resolving the key by the header `kid`.
// Returns { valid, reason, header, payload }.
export function verifyCompactJws(compactJws, jwksDoc) {
  const parts = String(compactJws).split(".");
  if (parts.length !== 3) return { valid: false, reason: "malformed_jws" };
  const [b64h, b64p, b64s] = parts;

  let header;
  try {
    header = JSON.parse(Buffer.from(b64h, "base64url").toString("utf8"));
  } catch {
    return { valid: false, reason: "malformed_header" };
  }
  if (header.alg !== "EdDSA") return { valid: false, reason: "unexpected_alg" };

  const jwk = (jwksDoc.keys || []).find((k) => k.kid === header.kid);
  if (!jwk) return { valid: false, reason: "kid_not_in_jwks" };
  if (jwk.crv !== "Ed25519" || jwk.kty !== "OKP") {
    return { valid: false, reason: "unsupported_key" };
  }

  let key;
  try {
    key = createPublicKey({ key: { kty: jwk.kty, crv: jwk.crv, x: jwk.x }, format: "jwk" });
  } catch {
    return { valid: false, reason: "unsupported_key", header };
  }
  const ok = verify(null, Buffer.from(`${b64h}.${b64p}`), key, Buffer.from(b64s, "base64url"));
  if (!ok) return { valid: false, reason: "signature_mismatch", header };

  let payload;
  try {
    payload = JSON.parse(Buffer.from(b64p, "base64url").toString("utf8"));
  } catch {
    return { valid: false, reason: "malformed_payload", header };
  }
  return { valid: true, reason: null, header, payload };
}

// The canonical offer payload used by the committed positive vector.
export const baseOffer = {
  kind: "verified_stay_offer",
  protocol_version: "0.1",
  canonical_domain: CANONICAL_DOMAIN,
  node_id: CANONICAL_DOMAIN,
  generated_at: "2026-06-02T12:00:00Z",
  valid_until: "2026-06-02T12:10:00Z",
  request: { check_in: "2026-09-12", check_out: "2026-09-15", guests: 2 },
  property: {
    property_id: "example-property",
    name: "Example Host Stay",
    url: "https://example-host.invalid/",
  },
  availability: { available: true, source: "official_host_domain" },
  price: {
    currency: "EUR",
    public_total: 123400,
    agent_total: 123400,
    minor_unit: true,
    exact: true,
  },
  booking: { direct_booking_url: "https://example-host.invalid/book?offer_id=test-vector" },
  agent_permission: {
    may_quote_as_official_direct_offer: true,
    must_not_claim_ota_comparison_without_signed_ota_price: true,
  },
};

export function signedOfferEnvelope() {
  const jws = signOffer(baseOffer);
  return {
    kind: "signed_verified_stay_offer",
    protocol_version: "0.1",
    offer: baseOffer,
    signature: { format: "jws_compact", alg: "EdDSA", kid: KID, jws },
  };
}
