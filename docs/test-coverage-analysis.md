# VRP Spec — Test Coverage Analysis

**Date:** 2026-06-02
**Scope:** `hemmabo-se/vrp-spec` (protocol specification, JSON Schema, JSON-LD
context, example payloads, and the published website).

This document analyzes the current automated-verification coverage of the
repository and proposes prioritized areas for improvement. It is an analysis and
backlog, not a set of finished tests.

## Follow-up status

The first validation gate now exists: `npm test` parses JSON/JSON-LD artifacts,
validates Portable Attestations examples against
`schemas/attestations-v0.1.schema.json`, and runs negative privacy/proof
guardrails. This follow-up adds core schemas for discovery, JWKS, signed
offers, and verifier results. Real Ed25519/JWS conformance vectors now also
exist under `examples/conformance/`, verified end-to-end by `npm test` together
with their failure modes (tampered payload, unknown `kid`, wrong key, expired
`valid_until`).

The remaining high-value gaps are three-state conformance fixtures,
context/vocabulary consistency checks, link checks, and live route checks.

## Baseline before validation PRs

Before the first validation PRs, the repository had **no automated tests and no
CI**:

- No `package.json`, test runner, or test directory.
- No `.github/workflows/` — nothing runs on push or pull request.
- The only machine-readable validation artifact is
  `schemas/attestations-v0.1.schema.json`, but nothing exercises it.

What ships in the repo that *is* mechanically checkable today:

- 1 JSON Schema (`schemas/attestations-v0.1.schema.json`, Draft 2020-12).
- 1 JSON-LD context (`contexts/v1.jsonld`).
- 13 example JSON payloads under `examples/` (8 attestation, 5 core/protocol).
- Normative spec text with explicit `MUST`/`SHOULD` rules in `spec/v0.1.md`
  and `spec/attestations-v0.1.md`.
- A static website (`index.html`, `styles.css`, `terms.html`) and routing
  config (`vercel.json`).

Baseline observations from a one-off manual check (not yet automated):

- All 8 attestation examples **currently validate** against the attestations
  schema. This is good — but it is not guarded, so it can silently regress.
- The two `verified-stay-offer.*` examples have **divergent shapes** (see
  Gap 3 below) and are covered by **no schema at all**.

## Coverage gaps and proposed test areas

### Priority 1 — Stand up a CI validation gate (foundational)

Everything below depends on having a place to run checks. Add a GitHub Actions
workflow (and a thin `package.json` or a Python script) that runs on every PR
and:

- Asserts every `*.json` / `*.jsonld` file parses as valid JSON.
- Validates each `examples/attestations/*.json` against
  `schemas/attestations-v0.1.schema.json` (e.g. `ajv-cli` or Python
  `jsonschema`).
- Fails the build on any error.

This converts the currently-implicit "the examples happen to be valid" into an
enforced invariant. It is the single highest-leverage addition.

### Priority 1 — Schema coverage for the *core* protocol artifacts

The JSON Schema only covers the Portable Attestations layer. The core VRP
artifacts defined normatively in `spec/v0.1.md` §2–§5 have **no machine-readable
schema**:

- Discovery document (`spec/v0.1.md` §2 — required: `protocol`,
  `protocol_version`, `canonical_domain`, `jwks_url`,
  `verified_stay_offer_endpoint`). Example: `examples/discovery.v0.1.json`.
- JWKS (`§3`). Example: `examples/jwks.v0.1.json`.
- Signed verified stay offer envelope + payload (`§5`). Examples:
  `examples/verified-stay-offer.*.json`.

Proposed: author `schemas/discovery-v0.1.schema.json`,
`schemas/jwks-v0.1.schema.json`, `schemas/verified-stay-offer-v0.1.schema.json`,
and `schemas/verified-stay-offer-verification-result-v0.1.schema.json`, then
validate the core examples against them in CI. Without these, the most important
interop surface (what an agent actually fetches and verifies) is unguarded.

### Priority 2 — Example/spec drift (already-present inconsistencies)

Tests would have caught these baseline issues; follow-up validation now covers
the resolved structure:

1. **Two incompatible `verified-stay-offer` shapes.**
   `verified-stay-offer.not-quoteable.v0.1.json` is the *signed-offer envelope*
   shape (`kind`, `protocol_version`, `offer`, `signature`).
   `verified-stay-offer-verification-result.safe-to-quote.v0.1.json` is a
   different *verification-result* shape (`verified`, `agent_citation`,
   `official_offer_summary`, `agent_guardrails`). These are now named as
   distinct object kinds and pinned by separate schemas.

2. **Signed payload missing `SHOULD` fields.** The `not-quoteable` offer
   previously omitted `request` and `property`, which `spec/v0.1.md` lists in
   the signed payload. The example now includes them, and the signed-offer
   schema validates their shape when present without making SHOULD-level fields
   mandatory.

### Priority 2 — Schema ↔ context ↔ vocabulary consistency

`contexts/v1.jsonld` and `schemas/attestations-v0.1.schema.json` must stay in
lockstep, and every term must resolve at `…/terms`. Proposed tests:

- Every credential `type` and `credentialSubject` property name allowed by the
  schema has a matching term in `contexts/v1.jsonld`. (Manual check today shows
  they match — worth locking down.)
- The JSON-LD context expands without error (run it through a JSON-LD
  processor).
- Every `vrp:` term in the context has a corresponding anchor on the published
  `/terms` vocabulary page (`terms.html`).

### Priority 2 — Cryptographic / JWS test vectors (done)

Signing and verification (compact JWS, EdDSA over Ed25519) is the heart of the
protocol. The placeholder examples elsewhere (`"<compact JWS>"`,
`"<base64url-public-key>"`) are now complemented by real, verifiable vectors:

- `examples/conformance/` holds a real (test-only) Ed25519 key pair, a signed
  offer, and the matching JWKS. `scripts/verify-conformance-vectors.mjs` does a
  genuine end-to-end Ed25519 verification in CI.
- Negative vectors are covered: signature over a mutated payload, `kid` absent
  from JWKS, a different key for the same `kid`, and an expired `valid_until`
  (valid signature but not fresh). These directly back the §7/§8 rules.

This gives independent implementers something concrete to test their verifiers
against, which is the whole point of an interop spec.

### Priority 3 — Behavioral / conformance vectors for agent rules

`spec/v0.1.md` defines precise behavioral `MUST`s (Safe-to-Quote §7,
Fail-Closed §8, Three-State Verification §9) and `examples/three-state-
verification.md` already works through four scenarios in prose. Proposed:

- Turn those scenarios (Timeout, Invalid Signature, Stale `valid_until`,
  Explicit Unavailable) into a machine-readable conformance fixture set:
  `{ input artifacts } -> { expected state: affirmed | negated | unknown,
  may_quote: bool }`.
- This is consumable by any implementation's verifier as a conformance suite and
  keeps the prose examples honest.

### Priority 3 — Status list / revocation round-trip

`spec/attestations-v0.1.md` §6 and `examples/attestations/status-list.v0.1.json`
define revocation/suspension. Add tests that a credential's `credentialStatus`
→ `statusListUrl` / `statusRef` resolves into the status list and yields a
defined status (`valid` / `revoked` / `suspended`).

### Priority 3 — Privacy guardrails as explicit negative tests

The schema already forbids guest PII in `VRPVerifiedStay` subjects (`not`
clauses for `guestName`, `guestEmail`, `checkIn`, `guestScore`, etc.). Add
explicit **negative** fixtures (payloads that *should fail*) so these guardrails
are proven to reject, not just silently pass on clean examples. A schema with
only positive examples is half-tested.

### Priority 4 — Docs, links, and deployment routing

- Link-check all Markdown cross-references and the canonical URLs in `README`,
  `llms.txt`, `sitemap.xml` (broken internal links are easy to introduce).
- Validate `vercel.json` routes actually serve the documented endpoints:
  `/contexts/v1` and `/contexts/v1.jsonld` return the same JSON-LD with
  `application/ld+json`; `/terms`, `/.well-known/*`, and schema URLs resolve.
- Sitemap/robots sanity (URLs listed actually exist as routes).

## Suggested sequencing

1. Done: CI workflow + JSON parse + attestations-schema validation (P1).
2. Done in follow-up: core-artifact schemas (discovery, JWKS, signed offer,
   verifier result) + validate examples (P1).
3. Partly done: resolve the `verified-stay-offer` shape drift and add negative
   PII fixtures (P2).
4. Done: real JWS test vectors + signature verification in CI (P2).
5. Next: three-state conformance fixtures; context/vocabulary consistency
   (P2-P3).
6. Next: link checking and Vercel route checks (P4).

Steps 1–2 alone move the repo from "examples are validated by hand, sometimes"
to "every PR proves the published artifacts are internally consistent," which is
the core promise of an interoperability spec.
