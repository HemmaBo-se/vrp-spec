# VRP v0.1 Conformance Vectors

These are **real, verifiable** Ed25519 / compact-JWS and three-state behavior
vectors for VRP v0.1 signed verified stay offers. Unlike the placeholder
examples elsewhere in `examples/`, the signature here is genuine: an independent
implementation can load the JWKS, verify the compact JWS, and reproduce the same
result.

## Files

- [`jwks.v0.1.json`](./jwks.v0.1.json) — host-domain JWKS with the public
  verification key.
- [`verified-stay-offer.signed.v0.1.json`](./verified-stay-offer.signed.v0.1.json)
  — a signed offer envelope whose `signature.jws` verifies against that JWKS.
  This is also the canonical *safe-to-quote* signed offer when evaluated before
  `valid_until` (available, exact price, direct booking URL, quoting permitted).
- [`three-state-verification.v0.1.json`](./three-state-verification.v0.1.json)
  — machine-readable fixtures for Affirmed, Negated, and Unknown verifier
  behavior.

## ⚠️ The key is a throwaway test key — DO NOT USE

The signing key is **not** a real host key. It is deterministically derived from
a fixed, public label and only ever signs offers for the reserved
`example-host.invalid` domain. It MUST NOT be used by any production VRP node.

```text
seed  = SHA-256("VRP v0.1 conformance test vector key - DO NOT USE")
key   = Ed25519 private key with that 32-byte seed
kid   = example-host.invalid-test-vector-2026
```

Because the key is derived, the vectors are fully reproducible. Regenerate them
with:

```bash
npm run generate-vectors
```

A clean checkout produces an empty `git diff`; a non-empty diff means an input
(the base offer or the key label) changed.

## What the verifier checks

`npm test` (or `npm run verify-vectors`) runs
[`scripts/verify-conformance-vectors.mjs`](../../scripts/verify-conformance-vectors.mjs),
which performs a real Ed25519 verification and asserts both the positive case
and the failure modes required by `spec/v0.1.md` §6–§8:

| Case | Expectation |
| --- | --- |
| Committed signature against the JWKS | verifies |
| Decoded JWS payload vs. envelope `offer` | identical (`payload_matches_offer`) |
| Tampered payload | rejected (`signature_mismatch`) |
| `kid` absent from JWKS | rejected (`kid_not_in_jwks`) |
| Different key for the same `kid` | rejected (`signature_mismatch`) |
| Expired `valid_until` | valid signature, but **not fresh** → must not quote |

`npm test` also runs
[`scripts/verify-three-state-fixtures.mjs`](../../scripts/verify-three-state-fixtures.mjs),
which checks the behavioral rules in `spec/v0.1.md` §8–§9:

| Case | Expected state |
| --- | --- |
| Discovery timeout | quoteable facts are `unknown` |
| Invalid signature | signature is `negated`; quoteable facts are `unknown` |
| Expired `valid_until` | freshness is `negated`; current quoteable facts are `unknown` |
| Fresh available offer | availability, price, booking URL, and quote permission are `affirmed` |
| Fresh explicit unavailable offer | availability is `negated`; verified unavailable may be cited |

These vectors are an interoperability aid for implementers. They do not create a
central validator, issuer, registry, certification service, or trust authority.
