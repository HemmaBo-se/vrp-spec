# VRP Attestation Status — W3C Bitstring Status List binding v0.1

**Status:** Public draft
**Date:** 2026-06-16

## 1. Purpose

This document profiles the [W3C Bitstring Status List v1.0](https://www.w3.org/TR/vc-bitstring-status-list/)
as the standards-conformant status and revocation mechanism for VRP Portable
Attestations. It fulfils the forward hook in [attestations-v0.1](attestations-v0.1.md)
§6, which states that *"if a future VRP version uses `BitstringStatusListEntry`,
the status list MUST follow the W3C Bitstring Status List format completely."*

It does not introduce a new VRP status format. It **binds** VRP to the W3C
standard, constraining only: the issuer (a `did:web` host domain), the signature
(Ed25519, the same key family as VRP signed offers and attestations), the
unknown-status fail-safe, the no-guest-data rule, and the credential layer it
applies to.

## 2. Scope — attestations only, not stay offers

This mechanism applies to **long-lived credentials**: VRP Portable Attestations.

It MUST NOT be applied to the signed verified stay offer (vrp-spec [v0.1](v0.1.md)).
A stay offer is ephemeral — it carries a short `valid_until` and is invalidated
by **expiry**, not by a status list. Revocation infrastructure for a 15-minute
credential is unnecessary and MUST NOT be required.

## 3. `credentialStatus` in an attestation

A VRP Portable Attestation MAY include a `credentialStatus` of type
`BitstringStatusListEntry`:

```json
{
  "id": "https://villaakerlyckan.se/.well-known/vrp/status/attestations-bitstring-v0.1.json#94",
  "type": "BitstringStatusListEntry",
  "statusPurpose": "revocation",
  "statusListIndex": "94",
  "statusListCredential": "https://villaakerlyckan.se/.well-known/vrp/status/attestations-bitstring-v0.1.json"
}
```

- `type` MUST be `BitstringStatusListEntry`.
- `statusPurpose` MUST be `revocation` or `suspension`.
- `statusListIndex` MUST be a base-10 string encoding an integer ≥ 0, unique
  within the referenced list.
- `statusListCredential` MUST be an HTTPS URL controlled by the issuer host
  domain, resolving to a `BitstringStatusListCredential`.

## 4. The status list credential

The status list MUST be a `BitstringStatusListCredential` per the W3C spec,
signed by the issuer host domain (Ed25519, `did:web`):

```json
{
  "@context": ["https://www.w3.org/ns/credentials/v2"],
  "type": ["VerifiableCredential", "BitstringStatusListCredential"],
  "issuer": "did:web:villaakerlyckan.se",
  "validFrom": "2026-06-16T00:00:00Z",
  "credentialSubject": {
    "id": "https://villaakerlyckan.se/.well-known/vrp/status/attestations-bitstring-v0.1.json#list",
    "type": "BitstringStatusList",
    "statusPurpose": "revocation",
    "encodedList": "uH4sIAAAAAAAAA-3BMQ..."
  }
}
```

- `credentialSubject.type` MUST be `BitstringStatusList`.
- `credentialSubject.statusPurpose` MUST match the entry's `statusPurpose`.
- `encodedList` MUST be the multibase base64url (no padding, `u` prefix)
  encoding of the GZIP-compressed bitstring. The **uncompressed** bitstring MUST
  be at least 16 KB (131,072 bits) — the W3C default minimum for herd privacy.
- The credential MUST be Ed25519-signed by the issuer `did:web` so verifiers
  authenticate it without trusting transport alone.
- It MUST be served over HTTPS on the issuer host domain, and SHOULD be
  `no-store` or short-cache so revocations propagate quickly.

## 5. Verification

A verifier:

1. Resolves `statusListCredential` and verifies its signature against the issuer
   `did:web` JWKS.
2. Decodes `encodedList` (multibase → GZIP-inflate → bitstring) and reads the bit
   at `statusListIndex`.
3. For `statusPurpose: revocation`, a set bit (1) means **revoked**; for
   `suspension`, a set bit means **suspended**.

**Unknown-status fail-safe (carried from [attestations-v0.1](attestations-v0.1.md) §6):**
if the status list is absent, stale, unreachable, malformed, unsigned, or not
controlled by the issuer host domain, the verifier MUST treat the credential
status as **unknown**. Unknown status MUST NOT be converted into either revoked
or not-revoked.

## 6. No-gatekeeper and privacy

- **Optional and additive.** A VRP attestation verifies standalone (`did:web` +
  signature). A status check is an additional layer and MUST NOT be a
  precondition for the protocol or a gate operated by any central party.
- **Privacy.** The bitstring discloses only revoked/not-revoked per index. The
  ≥16 KB herd minimum means one fetch covers many credentials and the issuer
  does not learn which credential a verifier checked. The status list MUST NOT
  contain guest identity, booking identity, or any guest data.

## 7. Relationship to the transparency log

A status list is **mutable by design** — revocation flips a bit. This is
**complementary to, not in conflict with**, the append-only
[transparency log](transparency-log-v0.1.md):

- **Transparency log** — immutable record that a credential *was issued*
  (append-only, tamper-evident).
- **Status list** — current, mutable record of whether a credential *is still
  valid* (revocation/suspension).

This mirrors the web PKI model (append-only Certificate Transparency logs
alongside CRL/OCSP revocation). The two layers answer different questions and
both are optional and host-operated.

## 8. Migration from `VRPStatusListEntry`

[attestations-v0.1](attestations-v0.1.md) §6 defines an interim
`VRPStatusListEntry` / `VRPStatusList` shape. Issuers adopting this profile:

- SHOULD migrate `credentialStatus` from `VRPStatusListEntry` to
  `BitstringStatusListEntry`.
- MAY serve both during transition (the legacy `VRPStatusList` JSON and the
  `BitstringStatusListCredential`).
- Verifiers SHOULD prefer `BitstringStatusListEntry` when present.

## 9. Conformance

Implementations MUST follow [W3C Bitstring Status List v1.0](https://www.w3.org/TR/vc-bitstring-status-list/)
completely for the entry and credential data model and the `encodedList`
encoding. This profile only adds the VRP constraints in §§3–6 (issuer =
`did:web` host domain; Ed25519 signature; unknown-status fail-safe; no guest
data; attestations-only scope).

## References

- [W3C Bitstring Status List v1.0](https://www.w3.org/TR/vc-bitstring-status-list/)
- [W3C Verifiable Credentials Data Model v2.0](https://www.w3.org/TR/vc-data-model-2.0/)
- VRP Portable Attestations: [attestations-v0.1](attestations-v0.1.md) (§6 Status and Revocation)
- VRP Transparency Log: [transparency-log-v0.1](transparency-log-v0.1.md)
- VRP core: [v0.1](v0.1.md)

## License

Specification text: dedicated to the public domain under [CC0 1.0](../LICENSE). Reference code and conformance test vectors: [Apache-2.0](../LICENSE-CODE) (ADR 0010 D7).
