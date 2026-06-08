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

// ---------------------------------------------------------------------------
// Portable attestation conformance vectors (spec/attestations-v0.1.md).
//
// These are real, verifiable Verifiable Credential compact JWS vectors. The
// attestation signing key is a SEPARATE throwaway test key from the offer key
// above: spec/attestations-v0.1.md §3 explicitly allows a host-domain DID to
// use distinct keys (and distinct `kid`s) for offers and for attestations, so
// the attestation vector exercises that separation. Like the offer key it is
// derived from a fixed, public label, is NOT a real host key, MUST NOT be used
// by any production VRP node, and only ever signs credentials issued by the
// reserved `did:web:example-host.invalid` issuer.
//
// Reproduce the seed with:
//   node -e "console.log(require('crypto').createHash('sha256').update('VRP v0.1 attestation conformance test vector key - DO NOT USE').digest('hex'))"

export const ATTESTATION_SEED_LABEL =
  "VRP v0.1 attestation conformance test vector key - DO NOT USE";
export const ATTESTATION_ISSUER_DID = "did:web:example-host.invalid";
export const ATTESTATION_KID = `${ATTESTATION_ISSUER_DID}#attestations-ed25519-2026-05`;

function deriveAttestationKeyPair() {
  const seed = createHash("sha256").update(ATTESTATION_SEED_LABEL).digest();
  const der = Buffer.concat([PKCS8_ED25519_PREFIX, seed]);
  const privateKey = createPrivateKey({ key: der, format: "der", type: "pkcs8" });
  const publicKey = createPublicKey(privateKey);
  return { privateKey, publicKey };
}

export const {
  privateKey: attestationPrivateKey,
  publicKey: attestationPublicKey,
} = deriveAttestationKeyPair();

// The base64url Ed25519 public key (`x`) for the attestation verification key.
export function attestationPublicKeyX() {
  return attestationPublicKey.export({ format: "jwk" }).x;
}

// The compact JWS protected header used for every attestation credential.
export function attestationJwsHeader() {
  return { typ: "vc+jwt", alg: "EdDSA", kid: ATTESTATION_KID };
}

// Sign an unsecured Verifiable Credential payload object into a compact JWS
// (header.payload.signature), exactly as a host-domain attestation issuer would.
export function signCredential(payload, { header = attestationJwsHeader() } = {}) {
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const signature = sign(null, Buffer.from(signingInput), attestationPrivateKey);
  return `${signingInput}.${b64url(signature)}`;
}

// A did:web document for the attestation issuer carrying the real attestation
// verification key. Mirrors examples/attestations/did-web-document.v0.1.json but
// with a genuine public key, and lists only the attestation key it actually
// uses so the vector is self-contained and verifiable.
export function attestationDidWebDocument() {
  return {
    "@context": ["https://www.w3.org/ns/did/v1"],
    id: ATTESTATION_ISSUER_DID,
    verificationMethod: [
      {
        id: ATTESTATION_KID,
        type: "JsonWebKey2020",
        controller: ATTESTATION_ISSUER_DID,
        publicKeyJwk: {
          kty: "OKP",
          crv: "Ed25519",
          kid: ATTESTATION_KID,
          alg: "EdDSA",
          x: attestationPublicKeyX(),
        },
      },
    ],
    assertionMethod: [ATTESTATION_KID],
  };
}

// The credential types and their payload example files, in bundle order.
export const ATTESTATION_CREDENTIALS = [
  {
    type: "VRPHostDomainCredential",
    payloadPath: "examples/attestations/host-domain-credential.payload.v0.1.json",
  },
  {
    type: "VRPPaymentPathCredential",
    payloadPath: "examples/attestations/payment-path-credential.payload.v0.1.json",
  },
  {
    type: "VRPPolicySnapshotCredential",
    payloadPath: "examples/attestations/policy-snapshot-credential.payload.v0.1.json",
  },
  {
    type: "VRPVerifiedStayCredential",
    payloadPath: "examples/attestations/verified-stay-credential.payload.v0.1.json",
  },
];

// Build a real, signed attestation bundle from the committed payload examples.
// `loadPayload` reads and parses a repo-relative JSON file.
export function signedAttestationBundle(loadPayload) {
  return {
    kind: "vrp_attestation_bundle",
    protocol_version: "0.1",
    context: "https://vacationrentalprotocol.com/contexts/v1",
    issuer: ATTESTATION_ISSUER_DID,
    credentials: ATTESTATION_CREDENTIALS.map(({ type, payloadPath }) => ({
      type,
      mediaType: "application/vc+jwt",
      compactJws: signCredential(loadPayload(payloadPath)),
    })),
  };
}

// Verify an attestation compact JWS against a did:web document, resolving the
// verification key by the header `kid` (spec/attestations-v0.1.md §8 steps 1-6).
// Returns { valid, reason, header, payload }.
export function verifyAttestationJws(compactJws, didDocument) {
  const parts = String(compactJws).split(".");
  if (parts.length !== 3) return { valid: false, reason: "malformed_jws" };
  const [b64h, b64p, b64s] = parts;

  let header;
  try {
    header = JSON.parse(Buffer.from(b64h, "base64url").toString("utf8"));
  } catch {
    return { valid: false, reason: "malformed_header" };
  }
  if (header.typ !== "vc+jwt") return { valid: false, reason: "unexpected_typ", header };
  if (header.alg !== "EdDSA") return { valid: false, reason: "unexpected_alg", header };

  const method = (didDocument.verificationMethod || []).find((vm) => vm.id === header.kid);
  if (!method) return { valid: false, reason: "kid_not_in_did_document", header };
  const jwk = method.publicKeyJwk || {};
  if (jwk.crv !== "Ed25519" || jwk.kty !== "OKP") {
    return { valid: false, reason: "unsupported_key", header };
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
