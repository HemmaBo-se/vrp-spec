/**
 * Minimal Ed25519 compact-JWS verification for VRP receipt v1 (ADR 0010 D5).
 * Apache-2.0 — see LICENSE-CODE. Mirrored from hemmabo-mcp-server lib/vrp.ts.
 */
import { createPublicKey, verify as cryptoVerify } from "node:crypto";

export const VRP_JWS_ALG = "EdDSA";

function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function stringValue(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function base64urlDecode(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4);
  return Buffer.from(padded, "base64");
}

function parseBase64urlJson(value) {
  const parsed = JSON.parse(base64urlDecode(value).toString("utf8"));
  const record = asRecord(parsed);
  if (!record) throw new Error("JWS part must decode to a JSON object");
  return record;
}

/** Verify compact JWS over JWKS Ed25519 keys; signature input is the JWS bytes as received (D5). */
export function verifyCompactJws(jws, jwks) {
  const parts = jws.split(".");
  if (parts.length !== 3) throw new Error("signed_verified_stay_offer must be compact JWS");
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = parseBase64urlJson(encodedHeader);
  const payload = parseBase64urlJson(encodedPayload);
  if (header.alg !== VRP_JWS_ALG) throw new Error(`Unsupported JWS alg: ${String(header.alg)}`);

  const keys = Array.isArray(jwks.keys) ? jwks.keys : [];
  const kid = stringValue(header.kid);
  const candidates = keys
    .map((candidate) => asRecord(candidate))
    .filter(Boolean)
    .filter((candidate) => candidate.kty === "OKP" && candidate.crv === "Ed25519")
    .filter((candidate) => !kid || candidate.kid === kid);

  if (candidates.length === 0) throw new Error("No matching Ed25519 key found for JWS kid");
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = base64urlDecode(encodedSignature);

  for (const jwk of candidates) {
    const publicKey = createPublicKey({ key: jwk, format: "jwk" });
    if (cryptoVerify(null, Buffer.from(signingInput), publicKey, signature)) {
      return { header, payload, kid };
    }
  }
  throw new Error("JWS signature verification failed");
}
