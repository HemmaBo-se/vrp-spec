# VRP Receipt v1 conformance vectors

Apache-2.0 — see [`LICENSE-CODE`](../../../LICENSE-CODE).

These vectors exercise the v1 receipt envelope verifier
([`lib/vrp-receipt.mjs`](../../../lib/vrp-receipt.mjs)), mirrored from the reference
implementation (`hemmabo-mcp-server` `spec/vectors/`).

## Test key (D6 — not production)

All vectors share one throwaway Ed25519 public key:

- `kid`: `vrp-vectors-2026-01-01-01`
- Published inline in each vector's `jwks` field

**Do not** reuse this key on any live host node.

## Review spotlight

| File | What it proves |
| --- | --- |
| `01-offer-transport-verified.json` | Two-attestation happy path → `fully_verified`; offer + transport `verified` |
| `03-tampered-signature.json` | One corrupted signature byte → `sig_invalid` |

## Full set

| File | Scenario |
| --- | --- |
| `02-partial-payment-unverifiable.json` | Offer verified; unsigned payment → `unverifiable`, not `fully_verified` |
| `04-expired-window.json` | Valid signature, past `valid_until` → `sig_expired` |
| `05-unsupported-version.json` | `vrp_receipt_version` ≠ `1.0` → `unsupported_version` |
| `06-malformed-empty-attestations.json` | Empty `attestations[]` → `malformed_receipt` |

Run: `node scripts/verify-receipt-vectors.mjs` or `npm test`.
