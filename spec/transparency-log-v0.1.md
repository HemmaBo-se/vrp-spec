# VRP Transparency Log — Specification v0.1

**Status:** Draft (pre-publication)

**Published:** 2026-06-13

**Canonical context:** https://vacationrentalprotocol.com/contexts/v1

**Repository:** https://github.com/HemmaBo-se/vrp-spec

## 1. Scope

VRP Transparency Log v0.1 defines an **optional, append-only, publicly
verifiable log** for VRP artifacts — portable attestations and signed
verified-stay-offer references — so that trust **history** becomes
non-repudiable and tamper-evident.

A transparency log proves two things and nothing more:

1. **Inclusion** — a given artifact was recorded in the log.
2. **Append-only consistency** — the log has only grown; nothing was silently
   rewritten or removed, not by the host, not by the log operator, not by
   HemmaBo.

This specification is an open standard layer on top of VRP. It does **not**
define an OTA, a marketplace, a booking intermediary, a central issuer, a
required registry, a ranking engine, a trust score, an accreditation program,
or a certification company. A log operator is an **auditor of records**, never
an authority over truth.

This layer is the no-gatekeeper alternative to an accredited certification
authority: it provides institution-grade auditability of trust history
**without** anyone needing to approve, accredit, or certify a node before its
attestations can be trusted.

The keywords MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are to be interpreted
as described in RFC 2119 and RFC 8174 when they appear in all capitals.

## 2. References

VRP Transparency Log v0.1 adapts established, proven transparency patterns:

- Certificate Transparency: RFC 6962 and RFC 9162 (CT 2.0): https://www.rfc-editor.org/rfc/rfc9162
- Sigstore / Rekor transparency log: https://docs.sigstore.dev/logging/overview/
- W3C Verifiable Credentials Data Model 2.0: https://www.w3.org/TR/vc-data-model/
- W3C Decentralized Identifiers (DIDs) 1.0: https://www.w3.org/TR/did-core/
- `did:web` method: https://w3c-ccg.github.io/did-method-web/

It composes with the existing VRP layers:

- [VRP v0.1 wire contract](./v0.1.md) — the signed verified stay offer.
- [VRP Portable Attestations v0.1](./attestations-v0.1.md) — the credentials
  whose history this log makes auditable.

## 3. Design Principles (no-gatekeeper)

These principles are normative and exist to prevent the transparency log from
becoming the central authority that core VRP and VRP Portable Attestations
explicitly reject.

1. **Optional.** A VRP attestation or signed offer MUST remain fully
   verifiable standalone — issuer `did:web` document plus Ed25519 signature —
   **without** any transparency log. Log inclusion MUST NOT be a precondition
   for verification.
2. **Multi-operator.** Anyone MAY operate a VRP transparency log. There MUST
   NOT be a single canonical log. HemmaBo MAY operate a reference log; the
   specification MUST NOT require HemmaBo's log, or any specific log, to exist
   or be consulted.
3. **Additive auditability.** A verifier MAY require log inclusion as **its
   own** trust policy. The specification MUST NOT mandate it. Absence from any
   log MUST NOT, by itself, make a valid attestation or offer invalid.
4. **Auditor, not authority.** A log operator is not an issuer, certifier,
   scorer, accreditor, or trust authority. Inclusion in a log MUST NOT be
   interpreted as approval, certification, or a trust score for the logged
   claim. A log records that an artifact existed at a time and that the record
   is append-only — never that the claim is endorsed.

## 4. Log Data Model

A VRP transparency log is a Merkle tree of leaves over VRP artifact hashes.

A log **leaf** SHOULD contain:

- `leaf_version`: `vrp-tlog-v0.1`
- `logged_at`: RFC 3339 UTC timestamp of recording
- `artifact_type`: one of `vrp_attestation`, `vrp_signed_offer`,
  `vrp_status_event`
- `artifact_hash`: the SHA-256 of the **exact compact JWS string** of the
  artifact, encoded as `sha256:{hex}`

A leaf MUST NOT contain the cleartext artifact, credential subject fields, or
any guest data. Only the hash of the signed envelope is logged. This preserves
the data-minimization guarantees of VRP Portable Attestations (Section 9).

A **Signed Tree Head (STH)** MUST contain:

- `log_id`: stable identifier of the log
- `tree_size`: number of leaves
- `root_hash`: Merkle root, base64url
- `timestamp`: RFC 3339 UTC
- and MUST be signed by the log's Ed25519 key as a compact JWS (`alg` `EdDSA`).

An **inclusion proof** is the Merkle audit path proving a leaf is contained in
the tree described by a specific STH. A **consistency proof** proves that the
tree at `tree_size` N1 is a prefix of the tree at `tree_size` N2 — i.e. the log
is append-only.

## 5. Log Identity and Keys

Each log has a `log_id` and publishes its Ed25519 public verification key. The
`log_id` SHOULD be derived from the log's key or expressed as a `did:web` of
the log's own operator domain, for example `did:web:example-log.invalid`.

STHs and entry promises MUST be signed with the log's Ed25519 key (`EdDSA`). A
verifier MUST NOT infer a trust level, certification, or HemmaBo approval from a
`log_id`.

## 6. Submission and Signed Entry Promise

An issuer (a host-domain DID) MAY submit an artifact hash to one or more logs.
On acceptance, a log returns a **Signed Entry Promise (SEP)** — a signed
commitment to include the entry within a stated Maximum Merge Delay (MMD),
analogous to a Certificate Transparency SCT.

An issuer MAY embed received SEPs in its
[VRP Portable Attestation](./attestations-v0.1.md) bundle so that a verifier can
check the promise offline without contacting the log live. The SEP is a
promise, not a proof of final inclusion; final inclusion is confirmed against an
STH and an inclusion proof.

## 7. Log Endpoints (proposed)

A log MAY expose the following read endpoints on its own operator domain. These
are proposed for v0.1 and are illustrated with the reserved, non-resolving
`example-log.invalid` domain:

- `GET  https://example-log.invalid/.well-known/vrp/log/v0.1/sth` — latest STH
- `GET  https://example-log.invalid/.well-known/vrp/log/v0.1/proof?hash=sha256:...` — inclusion proof by leaf hash
- `GET  https://example-log.invalid/.well-known/vrp/log/v0.1/consistency?first=N1&second=N2` — consistency proof
- `POST https://example-log.invalid/.well-known/vrp/log/v0.1/add` — submit an artifact hash; returns an SEP

A log MUST serve these from a domain it controls. A log MUST NOT require a
HemmaBo endpoint, registry, or approval.

## 8. Verification

To verify **inclusion** of an artifact, a verifier MUST:

1. Compute `sha256:{hex}` over the exact compact JWS of the artifact.
2. Obtain an STH for the chosen log and verify the STH's Ed25519 signature
   against that log's published key.
3. Obtain and verify the Merkle inclusion proof for the artifact hash against
   the STH `root_hash` and `tree_size`.

To audit **append-only** behavior over time, a verifier (or an independent
monitor) MUST obtain two STHs and verify the consistency proof between their
`tree_size` values.

Normative limits:

- A verifier MUST NOT treat log inclusion as proof that the logged claim is
  approved, certified, or higher-trust — only that it was recorded and the
  record is tamper-evident.
- Log inclusion MUST NOT make an unsigned, expired, unavailable, inexact, or
  non-quoteable VRP offer safe to quote. Core VRP offer verification and VRP
  Portable Attestation verification still apply unchanged.
- Absence from any log MUST NOT, by itself, make a valid artifact invalid.

## 9. Privacy and GDPR

Leaves contain only the SHA-256 of a signed envelope — never cleartext
credentials, credential subject fields, or guest data. The log therefore
reveals only that "an artifact with this hash was recorded at time T", never its
contents.

This layer MUST uphold every data-minimization rule of VRP Portable
Attestations v0.1 (Section 9): no guest name, email, phone number, payment
instrument, guest DID, exact identifying stay dates, reviews, outcomes, risk, or
scores may be derivable from a log entry.

## 10. Relationship to Other VRP Layers

- The transparency log records hashes of
  [VRP Portable Attestation](./attestations-v0.1.md) credentials and/or
  [signed verified-stay-offer](./v0.1.md) references.
- It **complements** the attestation status list, it does not replace it. The
  status list answers "valid or revoked now"; the transparency log answers
  "here is the complete append-only history, with no silent rewrites".
- It does not change the trust root. The host-domain `did:web` remains the trust
  root for issuance; the log is an external auditor of records, never the
  issuer.

## 11. Conformance

A future revision will publish signed conformance vectors under
`examples/conformance/log/`: a documented test log key, a signed STH, an
inclusion proof for a known leaf, and a consistency proof between two tree
sizes — verifiable the same way the attestation vectors are. For this v0.1
draft, conformance vectors are deferred.

## 12. Non-Goals

VRP Transparency Log v0.1 is explicitly **not**:

- a central, canonical, or required log;
- an issuer, certifier, accreditor, or certification company;
- a node registry, discovery index, ranking engine, or trust score;
- a marketplace, OTA, or booking intermediary;
- a HemmaBo trust authority.

It is the decentralized, no-gatekeeper alternative to an accredited certifying
authority: verifiable, non-forgeable trust history that no single party —
including HemmaBo — can rewrite.

## 13. License

Apache 2.0 — see [LICENSE](../LICENSE).
