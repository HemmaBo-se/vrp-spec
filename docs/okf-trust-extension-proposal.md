# Draft: OKF trust-extension proposal (ready to post to `GoogleCloudPlatform/knowledge-catalog`)

**Status:** Draft — not yet posted. This is the text to open as a GitHub issue (or
discussion) on the OKF repo when we decide to plant the flag. It positions VRP as
the **trust/verifiability layer** OKF deliberately left out — for *all* OKF
concept types, not just vacation rentals.

**Why this matters for VRP (internal note, do not paste):** as of 2026-06-26 the
`vrp-spec` repo has 0 forks / 1 star / 0 issues and ADR `0010` lists "implementer
#2" as still-open. There is **no inbound partner interest yet**. OKF is Google's
distribution surface for agent-readable knowledge; getting a `proof` convention in
front of that ecosystem is a cheap way to reach the very builders who could become
implementer #2 — it does not depend on HemmaBo signing nodes first.

---

## Issue title

> Proposal: an opt-in `proof` extension convention for verifiable OKF concepts

## Body (paste from here)

### Summary

OKF v0.1 standardizes how a concept is *described* (markdown + YAML frontmatter,
required `type`, consumers preserve unknown keys) but is explicit that trust,
governance, and serving are out of scope. For a growing class of concepts —
priced offers, datasets, metrics, API contracts — a consuming agent needs to know
not just *what the concept says* but *whether it provably came from the claimed
source*. OKF has no convention for that today.

This proposes a **minimal, opt-in, schema-free convention** (not a spec change):
a reserved-by-convention `proof` frontmatter key carrying a detached signature, so
that any producer can make a concept *verifiable* and any consumer can fail closed
on an invalid one — while non-verifying consumers ignore it exactly as OKF already
requires for unknown keys.

### Non-goals (kept faithful to OKF's minimalism)

- **No new required field.** `type` stays the only requirement. `proof` is opt-in.
- **No central authority, no registry, no runtime.** Verification is standalone
  against keys the producer publishes (e.g. `did:web` / JWKS), consistent with
  OKF's "no central authority" stance.
- **No domain schema.** The convention says *how to carry and verify a proof*, not
  what any concept type means.

### Proposed convention

```yaml
---
type: VacationRental
title: "Example property"
resource: https://example.com
proof:
  alg: EdDSA                       # signature algorithm
  kid: <key id>                    # key identifier in the producer's key set
  keys: https://example.com/.well-known/jwks.json   # how to resolve verification keys
  issuer: did:web:example.com      # who is asserting this concept
  sig: <compact JWS over the concept's signed payload>
---
```

### Consumer rules (fail-closed)

1. If `proof` is absent → treat the concept as **descriptive only** (today's
   behavior; unchanged).
2. If `proof` is present, a consumer that intends to *act* on the concept MUST:
   resolve `issuer`/`keys`, verify `sig` over the signed payload, and confirm the
   `issuer`/origin matches where the concept was served.
3. If `proof` is present but does not verify (bad signature, origin mismatch,
   expired) → the concept MUST be treated as **untrusted**, never as verified.
4. Trust is the verifier's result — never asserted by the document, the `type`, or
   the file path.

### Reference implementation

The **Vacation Rental Protocol** (https://vacationrentalprotocol.com, spec under
CC0) is a working instance of exactly this pattern for `type: VacationRental`
concepts: a host domain serves a signed offer, and an agent verifies the price and
availability came from that domain before quoting or booking — 0% intermediary.
Live: `curl https://villaakerlyckan.se/.well-known/vacation-rental.json`. VRP's
profile mapping OKF ↔ proof is published at
`spec/profiles/okf-profile-v0.1.md` in `HemmaBo-se/vrp-spec`.

We are offering this as a generalizable convention because the trust gap is not
specific to rentals — any priced or sourced OKF concept has it.

### Question for maintainers

Would the OKF project accept (a) a documented `proof` convention in the spec's
"extension keys" guidance, or (b) at minimum a link from OKF docs to independent
trust profiles like VRP that demonstrate it? Happy to open a PR for whichever
shape fits OKF's minimalism.
