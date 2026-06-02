# VRP v0.1 JWS Conformance Vectors

These are **real, verifiable** Ed25519 / compact-JWS test vectors for VRP v0.1
signed verified stay offers. Unlike the placeholder examples elsewhere in
`examples/`, the signature here is genuine: an independent implementation can
load the JWKS, verify the compact JWS, and reproduce the same result.

## Files

- [`jwks.v0.1.json`](./jwks.v0.1.json) — host-domain JWKS with the public
  verification key.
- [`verified-stay-offer.signed.v0.1.json`](./verified-stay-offer.signed.v0.1.json)
  — a signed offer envelope whose `signature.jws` verifies against that JWKS.
  This is also the canonical *safe-to-quote* signed offer (available, exact
  price, direct booking URL, quoting permitted).

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

These vectors are an interoperability aid for implementers. They do not create a
central validator, issuer, registry, certification service, or trust authority.
