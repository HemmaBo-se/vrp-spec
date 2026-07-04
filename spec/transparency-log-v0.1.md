# VRP Transparency Log — Specification v0.1

**Status:** Draft (pre-publication)

**Published:** 2026-06-13

**Updated:** 2026-07-04 — receipt leaves (`vrp_receipt`), leaf hashing rule,
operator key discovery, STH archival, node read-through proxy, honest
guarantee wording (issue #60-adjacent; per-booking inclusion proofs)

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
  `vrp_status_event`, `vrp_receipt`, `vrp_spec`
- `artifact_hash`: the SHA-256 of the **exact compact JWS string** of the
  artifact, encoded as `sha256:{hex}`

Registered artifact types:

- `vrp_attestation` — a [Portable Attestation](./attestations-v0.1.md)
  credential JWS.
- `vrp_signed_offer` — a signed verified-stay-offer JWS
  ([core VRP](./v0.1.md) §5).
- `vrp_status_event` — a signed status/booking event JWS (for example the
  privacy-minimized booking event of the reference implementation).
- `vrp_receipt` — the compact JWS **wrapping a VRP Receipt v1 envelope**
  ([Receipt v1](./receipt-v1.md) §14). This is what makes a booking's promised
  terms provable after the fact.
- `vrp_spec` — the one non-JWS artifact type: the SHA-256 of a **published
  specification document file**, byte-exact as served, used for
  tamper-evident first-publication timestamping. The artifact is already
  public, so the file bytes are the directly re-hashable form.

A leaf MUST NOT contain the cleartext artifact, credential subject fields, or
any guest data. Only the hash of the signed envelope is logged. This preserves
the data-minimization guarantees of VRP Portable Attestations (Section 9).

### 4.1 Leaf hashing rule (normative)

For every JWS artifact type, `artifact_hash` MUST be computed over the
**exact compact JWS string as issued** — the ASCII bytes of
`header.payload.signature` exactly as they left the signer.

- An implementation MUST NOT re-serialize, re-encode, pretty-print, or
  canonicalize (for example JCS/RFC 8785) an artifact before hashing.
- A verifier MUST NOT attempt to reconstruct the hashable form from parsed
  JSON. There is exactly **one** hashable form of an artifact: its signed
  bytes as issued.
- Consequence: an artifact whose bytes were mutated in transport — line
  wrapping, whitespace normalization, character substitution — has a
  different hash and is unprovable against the log even though its signature
  may still validate. Delivery surfaces MUST therefore preserve the exact
  bytes (see [Receipt v1](./receipt-v1.md) §15).

This is the same signature-input discipline as Receipt v1 D5 (verify over the
JWS bytes as received, never re-canonicalize), applied to hashing. JSON
canonicalization exists in VRP only for non-JWS correlators (for example MCP
`arguments_sha256`) and never as a preprocessing step for leaf hashing.

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

### 5.1 Operator key discovery

A log MUST publish its Ed25519 verification key at a stable HTTPS URL on the
**log operator's own domain**, and a verifier MUST validate every STH
signature against the key published there.

The trust anchor for log statements is the operator's published key — never a
key published by a host node, and never key material served through a node's
read-through proxy (§7.2). A node cannot become an authority over its own
history by re-serving the log.

Reference log (HemmaBo-operated):

- `log_id`: `did:web:www.hemmabo.com`
- Verification key: `https://www.hemmabo.com/.well-known/federation-key.pub`
  (Ed25519, PEM), key id (`kid`) carried in the STH signature header.

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

The reference log serves these operations at
`https://www.hemmabo.com/api/vrp-tlog` (latest STH; `?hash=` inclusion proof;
`?first=&second=` consistency proof), with an archived-STH listing per §7.1.

### 7.1 STH archival

A log SHOULD persist a **signed STH for every append** and MUST make archived
STHs publicly retrievable when it archives them.

Archived STHs are what make third-party append-only auditing possible without
running a continuous monitor: any two archived STHs can be checked against a
consistency proof at any later time, so a rewrite of history is
cryptographically detectable against **any** earlier archived STH — not only
against tree heads an external monitor happened to capture. A log that mints
STHs only on demand provides inclusion proofs but leaves consistency auditing
entirely to external observers; archival closes that gap from the log's first
leaf.

### 7.2 Node read-through proxy (non-authoritative)

A host node MAY re-serve its log's **read** operations on the node's own
domain, so that a guest or agent can fetch a proof where they booked:

- `GET https://{node}/.well-known/vrp/log/v0.1/sth`
- `GET https://{node}/.well-known/vrp/log/v0.1/proof?hash=sha256:...`
- `GET https://{node}/.well-known/vrp/log/v0.1/consistency?first=N1&second=N2`

Normative rules:

- The proxy MUST pass the log's responses through **byte-verbatim**. It MUST
  NOT mint, alter, filter, or re-sign STHs or proofs.
- A verifier MUST validate the STH signature against the log operator's
  published key (§5.1) **regardless of which surface served the response**.
  The node's proxy and the operator's endpoint are interchangeable precisely
  because neither surface is trusted — only the operator's signature is.
- The proxy is a **convenience surface, never an authority**. Serving proofs
  does not make the node a log operator, and a node cannot make its own
  history provable by proxying: the proof chain terminates at the operator's
  key and the archived STH history, not at the node.
- A node SHOULD advertise its proxy endpoints in its discovery document
  (`/.well-known/vacation-rental.json`).

This split preserves the two-class architecture: the log stays
federation-shared and operator-run (an auditor of records, §3), while the
node remains the single origin for its own offers and receipts.

## 8. Verification

To verify **inclusion** of an artifact, a verifier MUST:

1. Compute `sha256:{hex}` over the exact compact JWS of the artifact.
2. Obtain an STH for the chosen log and verify the STH's Ed25519 signature
   against that log's published key.
3. Obtain and verify the Merkle inclusion proof for the artifact hash against
   the STH `root_hash` and `tree_size`.

To audit **append-only** behavior over time, a verifier (or an independent
monitor) MUST obtain two STHs and verify the consistency proof between their
`tree_size` values. Archived STHs (§7.1) serve as the earlier tree head when
no independently captured STH is available.

For the receipt-specific verifier walk-through (obtain verbatim → verify node
signature → hash exact bytes → inclusion proof → operator-key STH check →
consistency), see [Receipt v1](./receipt-v1.md) §16.

### 8.1 What a proof removes trust in — and what it does not

The guarantee formulation is deliberately layered and MUST NOT be overstated:

- **"Without trusting the node" holds directly.** A verified inclusion proof
  plus a valid operator-signed STH proves that the exact artifact existed and
  was recorded no later than the STH timestamp. The node cannot forge,
  backdate, or silently replace it — the verifier never has to take the
  node's word.
- **"Without trusting the log operator" holds via consistency auditing.**
  A single STH still carries the operator's word about the tree. To remove
  it, verify a **consistency proof** between two tree heads (archived, §7.1,
  or independently observed). Any rewrite is then cryptographically
  detectable. This is the Certificate Transparency trust model: the operator
  is untrusted; **detection** is the guarantee.

A log is **tamper-evident**, never "immutable": an operator with storage
access can physically rewrite bytes, but not undetectably against any
previously published or archived STH. Implementations and verifiers MUST use
the tamper-evident/cryptographically-detectable framing in user-facing
language.

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

Specification text: dedicated to the public domain under [CC0 1.0](../LICENSE). Reference code and conformance test vectors: [Apache-2.0](../LICENSE-CODE) (ADR 0010 D7).
