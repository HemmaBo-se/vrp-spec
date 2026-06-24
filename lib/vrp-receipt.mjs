/**
 * VRP receipt envelope — v1 reference verifier (ADR 0010).
 * Apache-2.0 — see LICENSE-CODE. Behavior MUST match hemmabo-mcp-server lib/vrp-receipt.ts.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { verifyCompactJws } from "./vrp-jws.mjs";

export const VRP_RECEIPT_VERSION = "1.0";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
export const VRP_RECEIPT_V1_SCHEMA = JSON.parse(
  readFileSync(join(repoRoot, "schemas/vrp-receipt.v1.schema.json"), "utf8"),
);

function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function parseInstant(value) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : t;
}

function deref(schema, root) {
  let guard = 0;
  while (schema && schema.$ref && guard++ < 50) {
    const parts = schema.$ref.replace(/^#\//, "").split("/");
    let s = root;
    for (const p of parts) s = s?.[p];
    schema = s;
  }
  return schema;
}

function validateReceiptShape(receipt, root = VRP_RECEIPT_V1_SCHEMA) {
  const schema = deref(root, root);
  if (!schema || schema.type !== "object") return false;
  const record = asRecord(receipt);
  if (!record) return false;

  for (const key of schema.required || []) {
    if (!(key in record)) return false;
  }
  if (record.vrp_receipt_version !== VRP_RECEIPT_VERSION) return false;
  if (!asRecord(record.subject) || !asRecord(record.issuer)) return false;
  if (!Array.isArray(record.attestations) || record.attestations.length < 1) return false;

  const attSchema = deref(schema.properties?.attestations?.items, root);
  if (!attSchema) return false;
  for (const att of record.attestations) {
    const attRecord = asRecord(att);
    if (!attRecord) return false;
    for (const key of attSchema.required || []) {
      if (!(key in attRecord)) return false;
    }
    if (typeof attRecord.layer !== "string" || attRecord.layer.length < 1) return false;
  }
  return true;
}

function verifyAttestation(att, index, opts) {
  const layer = typeof att.layer === "string" ? att.layer : "";
  const base = { index, layer, kid: null };

  const from = parseInstant(att.valid_from);
  const until = parseInstant(att.valid_until);
  if (from === null || until === null) {
    return { ...base, status: "invalid", error: "missing_validity_window" };
  }

  if (typeof att.signature !== "string" || att.signature.trim() === "") {
    return { ...base, status: "unverifiable", error: "layer_unverifiable" };
  }

  const jwks = opts.resolveJwks(att.source, att);
  if (!asRecord(jwks)) {
    return { ...base, status: "unverifiable", error: "key_unresolvable" };
  }

  let kid = null;
  try {
    kid = verifyCompactJws(att.signature, jwks).kid;
  } catch {
    return { ...base, status: "invalid", error: "sig_invalid" };
  }

  const now = opts.now ?? Date.now();
  if (now < from) return { ...base, kid, status: "expired", error: "not_yet_valid" };
  if (now > until) return { ...base, kid, status: "expired", error: "sig_expired" };
  return { ...base, kid, status: "verified", error: null };
}

/** @typedef {(source: string|undefined, attestation: object) => object|null} JwksResolver */

/**
 * Verify a VRP receipt envelope (ADR 0010 D1–D5, D4 partial verification).
 * @param {unknown} receipt
 * @param {{ resolveJwks: JwksResolver, now?: number }} opts
 */
export function verifyReceipt(receipt, opts) {
  const record = asRecord(receipt);
  if (record && record.vrp_receipt_version !== VRP_RECEIPT_VERSION) {
    return { receipt_valid: false, fully_verified: false, attestations: [], errors: ["unsupported_version"] };
  }

  if (!validateReceiptShape(receipt)) {
    return { receipt_valid: false, fully_verified: false, attestations: [], errors: ["malformed_receipt"] };
  }

  const valid = /** @type {{ attestations: object[] }} */ (receipt);
  const attestations = valid.attestations.map((att, i) => verifyAttestation(att, i, opts));
  const fully_verified = attestations.every((a) => a.status === "verified");
  return { receipt_valid: true, fully_verified, attestations, errors: [] };
}
