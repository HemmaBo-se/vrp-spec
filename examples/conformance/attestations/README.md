# VRP v0.1 Portable Attestation Conformance Vectors

These are **real, verifiable** Ed25519 / compact-JWS Verifiable Credential
vectors for VRP Portable Attestations v0.1. Unlike the illustrative
[`examples/attestations/attestation-bundle.v0.1.json`](../../attestations/attestation-bundle.v0.1.json),
whose `compactJws` values are `<…>` placeholders, every `compactJws` here is a
genuine signature: an independent implementation can load the issuer `did:web`
document, resolve the verification key by `kid`, and verify each credential.

## Files

- [`did-web-document.v0.1.json`](./did-web-document.v0.1.json) — the issuer
  `did:web:example-host.invalid` DID document carrying the real attestation
  verification key (`assertionMethod`).
- [`attestation-bundle.signed.v0.1.json`](./attestation-bundle.signed.v0.1.json)
  — a bundle of four signed credentials (`VRPHostDomainCredential`,
  `VRPPaymentPathCredential`, `VRPPolicySnapshotCredential`,
  `VRPVerifiedStayCredential`). Each `compactJws` verifies against the DID
  document above and decodes to the matching unsecured payload example in
  [`examples/attestations/`](../../attestations/).

## ⚠️ The key is a throwaway test key — DO NOT USE

The attestation signing key is **not** a real host key. It is a separate test
key from the offer key (the offer key signs verified stay offers; this one signs
attestations — VRP allows the two to differ). It is deterministically derived
from a fixed, public label and only ever signs credentials issued by the
reserved `did:web:example-host.invalid` issuer. It MUST NOT be used by any
production VRP node.

```text
seed  = SHA-256("VRP v0.1 attestation conformance test vector key - DO NOT USE")
key   = Ed25519 private key with that 32-byte seed
kid   = did:web:example-host.invalid#attestations-ed25519-2026-05
```

Because the key is derived and Ed25519 signatures are deterministic, the vectors
are fully reproducible. Regenerate them with:

```bash
npm run generate-vectors
```

A clean checkout produces an empty `git diff`; a non-empty diff means an input
(a payload example, the JWS header, or the key label) changed.

## What the verifier checks

`npm test` (or `npm run verify-attestations`) runs
[`scripts/verify-attestation-vectors.mjs`](../../../scripts/verify-attestation-vectors.mjs),
which performs a real Ed25519 verification and asserts the verification steps and
failure modes required by [`spec/attestations-v0.1.md`](../../../spec/attestations-v0.1.md)
§8:

| Case | Expectation |
| --- | --- |
| Committed DID document key vs. deterministic key | identical (vectors not stale) |
| Each credential `compactJws` against the DID document | verifies |
| Decoded payload vs. committed payload example | identical |
| `typ` / `alg` / context / type / `validFrom`–`validUntil` / no embedded proof | enforced |
| Tampered payload | rejected (`signature_mismatch`) |
| `kid` absent from DID document | rejected (`kid_not_in_did_document`) |
| Different key for the same `kid` | rejected (`signature_mismatch`) |

These vectors are an interoperability aid for implementers. They do not create a
central validator, issuer, registry, certification service, or trust authority.
