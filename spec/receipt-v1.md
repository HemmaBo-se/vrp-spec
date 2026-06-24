# VRP Receipt Envelope — Specification v1

**Status:** Public draft (WO-2 rev B, PR-2)

**Published:** 2026-06-24

**Envelope version:** `1.0`

**Repository:** https://github.com/HemmaBo-se/vrp-spec

**Machine-readable schema:** [`schemas/vrp-receipt.v1.schema.json`](../schemas/vrp-receipt.v1.schema.json)

**Reference verifier:** [`lib/vrp-receipt.mjs`](../lib/vrp-receipt.mjs) (Apache-2.0; mirrors `hemmabo-mcp-server` `lib/vrp-receipt.ts`)

## 1. Scope

VRP Receipt v1 defines a versioned **verifiable booking record**: a flat array of
signed attestations from independent trust layers (`offer`, `transport`, `payment`, …)
assembled by a host node. It composes the existing VRP signed stay offer ([`v0.1.md`](./v0.1.md))
and composition profiles ([`profiles/mcp-composition-profile.md`](./profiles/mcp-composition-profile.md))
without making HemmaBo or any operator a gatekeeper.

This specification is **not** a runtime tool surface, OTA, marketplace, central registry,
or booking intermediary. It does not change Portable Attestations v0.1
([`attestations-v0.1.md`](./attestations-v0.1.md)) — especially not its §3 trust model.

The keywords MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are interpreted as in RFC 2119
and RFC 8174 when capitalized.

## 2. References

- Core VRP v0.1: [`v0.1.md`](./v0.1.md) — JWKS discovery (§3), signed offers (§5)
- Portable Attestations v0.1: [`attestations-v0.1.md`](./attestations-v0.1.md) — `did:web` VC layer (§3–§8)
- MCP composition profile: [`profiles/mcp-composition-profile.md`](./profiles/mcp-composition-profile.md) — `transport` layer (D6)
- Receipt JSON Schema: [`schemas/vrp-receipt.v1.schema.json`](../schemas/vrp-receipt.v1.schema.json)
- Conformance vectors: [`examples/conformance/receipt/`](../examples/conformance/receipt/)
- ADR 0010 (reference repo): receipt envelope decisions D1–D7
- ADR 0011 (reference repo): key lifecycle K1–K6 (forward spec; §8 below)

## 3. Envelope shape (D1)

A v1 receipt MUST be a JSON object with:

| Field | Required | Description |
| --- | --- | --- |
| `vrp_receipt_version` | MUST | Exactly `"1.0"` for v1 verifiers |
| `subject` | MUST | What the receipt is about (property, stay window, offer id — generic object) |
| `issuer` | MUST | Node identity that assembled the receipt |
| `attestations` | MUST | **Flat** array; min length 1 |

Each attestation object MUST include:

| Field | Required | Description |
| --- | --- | --- |
| `layer` | MUST | Open vocabulary string, e.g. `offer`, `transport`, `payment` |
| `valid_from` | MUST | ISO 8601 date-time (D2) |
| `valid_until` | MUST | ISO 8601 date-time (D2) |

Each attestation object MAY include:

| Field | Description |
| --- | --- |
| `source` | URL where the verifying public key is published (typically host JWKS) |
| `signature` | Compact JWS over the layer artifact (D5) |
| `ref` | Opaque correlator (offer id, transaction id, …) |
| `tlog` | Optional transparency-log inclusion proof (D3) |
| `sub_receipt` | **Reserved v2** — recursive sub-receipt; v1 verifiers MUST NOT recurse |
| `disclosure` | **Reserved v2** — selective-disclosure pointer; v1 verifiers MUST NOT interpret |

A new trust layer = a new `attestations[]` entry. No central approval is required.

## 4. Per-attestation freshness (D2)

Every attestation MUST carry `valid_from` and `valid_until`. A v1 verifier MUST reject
an attestation whose verification time is before `valid_from` (`not_yet_valid`) or after
`valid_until` (`sig_expired`) **after** the JWS signature is validated.

Freshness is evaluated **per attestation**, not once for the whole receipt.

## 5. Transparency log field (D3)

Each attestation MAY carry a `tlog` inclusion proof. A v1 verifier MUST:

- Treat a **missing** `tlog` as signature-only verification — not a failure.
- NOT claim log-anchored properties for an attestation without `tlog`.

Phase-5 dispute/insurance receipts that must survive key revocation MAY require `tlog`
(see §8 K4).

## 6. Verification result and error registry (D4)

A v1 verifier MUST return **partial verification**: per-attestation status, not a single
boolean. Envelope-level fields:

| Field | Meaning |
| --- | --- |
| `receipt_valid` | Structurally valid v1 receipt (version + schema) |
| `fully_verified` | `true` only when **every** attestation has status `verified` |
| `attestations[]` | Per-layer `{ index, layer, status, error, kid }` |
| `errors[]` | Envelope-level codes when `receipt_valid` is false |

Per-attestation `status` values:

| Status | Meaning |
| --- | --- |
| `verified` | Signature valid and inside freshness window |
| `expired` | Signature valid but outside freshness window |
| `invalid` | Signature check failed (e.g. `sig_invalid`) |
| `unverifiable` | Layer present but cannot be checked (missing signature or key) |

`unverifiable` is **distinct** from `verified`. A receipt MUST NOT represent an
unverifiable layer as verified.

### 6.1 Normative error codes (v1)

**Envelope / signature level:**

- `unsupported_version` — `vrp_receipt_version` ≠ `"1.0"`
- `malformed_receipt` — fails schema / empty `attestations[]`
- `malformed_attestation`
- `missing_validity_window`
- `sig_invalid`
- `sig_expired`
- `not_yet_valid`
- `key_unresolvable`
- `layer_unverifiable`
- `canonicalization_mismatch`

**VRP offer-layer** (reused from core offer verification):

- `agent_permission_denied`, `not_available`, `price_not_exact`, `direct_booking_url_missing`

**AP2 payment-layer** (reused from AP2 mandate verification):

- `mandate_expired`, `mandate_missing_amount`, `invalid_charge_amount`,
  `amount_exceeds_mandate`, `currency_mismatch`, `merchant_mismatch`, `cart_mismatch`

The reference verifier in [`lib/vrp-receipt.mjs`](../lib/vrp-receipt.mjs) implements the
envelope-level codes above for v1 receipt verification. Layer-specific offer/AP2 codes
apply when a profile-aware verifier interprets attestation payloads.

## 7. Signature input rule (D5)

The signature MUST be verified over the **compact-JWS bytes as received**. A v1 verifier
MUST NOT re-canonicalize JSON to re-derive the signing input.

Where canonical JSON is required for **non-JWS correlators** (e.g. MCP
`arguments_sha256`), implementations MUST use JCS (RFC 8785). That canonicalization
applies only to the hash input — not to JWS verification. See
[`profiles/mcp-composition-profile.md`](./profiles/mcp-composition-profile.md).

## 8. Composition profiles (D6)

Composition profiles define how an external interaction becomes an attestation entry.
The first normative profile is MCP `transport` — see
[`profiles/mcp-composition-profile.md`](./profiles/mcp-composition-profile.md).

Profiles MUST sign an **assertion about the interaction**, not unsigned transport bytes.
Additional profiles (e.g. AP2 `payment`) follow the same envelope rules.

### 8.1 Argument key casing (cross-link #7)

For MCP transport assertions, tool-call argument keys that feed `arguments_sha256`
MUST be **`snake_case`**: `check_in`, `check_out`, `guests` — matching core VRP endpoint
parameters ([`v0.1.md`](./v0.1.md) §4). This is **distinct** from camelCase booking URL
query parameters ([`v0.1.md`](./v0.1.md) §5.1). Normalization before hashing is the
caller's responsibility; see the normative pin in the MCP profile.

## 9. Key-discovery layer separation (#5)

VRP uses **two key-discovery paths**. Implementers MUST NOT conflate them:

| Layer | Artifact | Key discovery | Typical `kid` form |
| --- | --- | --- | --- |
| **Offer + receipt attestations** | Compact JWS (`offer`, `transport`, …) | Fetch `https://{host}/.well-known/jwks.json` directly ([`v0.1.md`](./v0.1.md) §3) | Plain string `kid` matched against JWKS |
| **Portable Attestations (VC)** | `application/vc+jwt` credentials | Resolve issuer `did:web:{host}` → `https://{host}/.well-known/did.json` ([`attestations-v0.1.md`](./attestations-v0.1.md) §3) | DID URL `kid` on verification method |

The live reference verifier for **receipt v1** resolves keys via **`attestation.source`
→ JWKS** and matches JWS `kid` — it does **not** resolve `did:web` documents for receipt
layers. Portable Attestations remain a separate verification path with their own
conformance vectors ([`examples/conformance/attestations/`](../examples/conformance/attestations/)).

Offer signatures and attestation VC signatures MAY use separate private keys as long as
each verifying key is published under the host-domain trust root
([`attestations-v0.1.md`](./attestations-v0.1.md) §3 — unchanged by this document).

## 10. Key lifecycle — forward spec (K1–K6)

The v1 receipt verifier implements **signature + freshness only**. The following rules
are **forward spec** for Phase-5 dispute/insurance positioning (ADR 0011). They do not
change v1 verifier behavior today.

| Rule | Summary |
| --- | --- |
| **K1** | Every signature carries JWS `kid`; receipts surface verifying `kid` per attestation |
| **K2** | JWKS MUST retain **retired** public keys for the receipt-retention horizon; metadata: `vrp_key_status` (`active` · `retired` · `revoked`), `vrp_not_before`, `vrp_not_after` |
| **K3** | Rotation is additive with overlap — retired keys remain resolvable |
| **K4** | Revocation ≠ rotation; `vrp_compromised_at` anchors fail-closed rules; Phase-5 receipts intended to survive revocation MUST carry `tlog` |
| **K5** | Per-layer key separation is permitted (`payment` MAY use a distinct `kid` from `offer`) |
| **K6** | Phase-5 lifecycle-aware codes: `key_retired_out_of_window`, `key_revoked`, `tlog_required` |

Until a lifecycle-aware verifier ships, public copy MUST NOT claim long-term
post-revocation verifiability.

## 11. Licensing (D7)

- **Specification text** (this document): [CC0 1.0](../LICENSE)
- **Reference code + conformance vectors**: [Apache-2.0](../LICENSE-CODE) with explicit patent grant

## 12. Conformance

Conformance vectors live in [`examples/conformance/receipt/`](../examples/conformance/receipt/).
They use a **shared throwaway Ed25519 test key** (`kid`: `vrp-vectors-2026-01-01-01`) —
never a production host key (D6 test isolation).

Every `npm test` run executes [`scripts/verify-receipt-vectors.mjs`](../scripts/verify-receipt-vectors.mjs),
which MUST pass at minimum:

| Vector | Expectation |
| --- | --- |
| `01-offer-transport-verified.json` | `fully_verified: true`; `offer` + `transport` both `verified` |
| `03-tampered-signature.json` | Manipulated JWS byte → `sig_invalid`; `fully_verified: false` |

Additional vectors cover partial verification (`02`), expiry (`04`), unsupported version
(`05`), and malformed envelope (`06`).

Implementers SHOULD treat vector output equality with [`lib/vrp-receipt.mjs`](../lib/vrp-receipt.mjs)
as the interoperability bar for v1 receipt verification.

## 13. Neutrality (D8)

The spec, schema, and vectors are vendor-neutral. HemmaBo is a reference implementer,
not an approval authority. Composition profiles are published, not centrally granted.

## 14. License

Specification text: dedicated to the public domain under [CC0 1.0](../LICENSE).
Reference code and conformance test vectors: [Apache-2.0](../LICENSE-CODE) (ADR 0010 D7).
