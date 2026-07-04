# VRP Node Structure Declarations — Specification v0.1

**Status:** Public draft
**Published:** 2026-07-04
**Canonical URL:** https://vacationrentalprotocol.com/spec/structure-declarations-v0.1
**Repository:** https://github.com/HemmaBo-se/vrp-spec

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are to be
interpreted as described in RFC 2119.

## 1. Scope

This section defines **falsifiable node structure declarations**: a small set
of binary commercial-structure claims a VRP node publishes about itself, where
**every claim ships with its own verification procedure** that any agent — or
any human with a browser — can execute against the node itself. No third
party, no issuer, no registry.

Core VRP proves that a concrete offer is real (signature, freshness, exact
price). Structure declarations answer the question an agent asks *before*
quoting a node at all: *what kind of commercial thing is this?* Is it a
marketplace? Does it take a commission? Is anyone gatekeeping the traversal?
Each answer is published as a claim that is either **verifiable by
execution** or **attested by the node** — and the two are never allowed to
look alike.

Non-goals, inherited from VRP's core scope (v0.1 §1):

- No central issuer, no certification program, no accreditation, and no
  scoring or ranking of nodes. A verifier chooses its own trust policy; this
  section only standardizes **what a claim means and how to falsify it**.
- No new trust semantics for payment rails (see the reserved
  `booking.payment_options` slot).
- No new runtime endpoints. Declarations ride in the existing discovery
  document.

## 2. Location

Structure declarations are published as the OPTIONAL top-level object
`structure_declarations` in the node's discovery document
`/.well-known/vacation-rental.json` (see the
[Well-Known URI specification](./well-known-uri-v0.1.md) §3).

```jsonc
"structure_declarations": {
  "is_marketplace":    { "value": false, "class": "verifiable",
    "verify": "Booking and checkout endpoints resolve on canonical_domain; the traversal contains no third-party redirect." },
  "commission_pct":    { "value": 0, "class": "verifiable",
    "verify": "In the signed verified_stay_offer, agent_total equals the amount charged; the pay-to destination is bound to the host's account inside the signed payload." },
  "source_of_truth":   { "value": true, "class": "verifiable",
    "verify": "did:web resolves on this domain; the JWKS is live; the offer signature validates against the domain's published keys." },
  "gatekeeper":        { "value": "none", "class": "verifiable",
    "verify": "The full agent traversal (discover → verify keys → signed offer → checkout) completes with zero external authority, registry, or API key." },
  "price_integrity":   { "value": "single_total", "class": "verifiable",
    "verify": "The total in the signed offer equals the total at checkout; no add-on fees appear between offer and payment." },
  "surface_consistency": { "value": "contract-tested", "class": "attested",
    "verify": "Agent-facing surfaces read attested claims only, never free text; enforced by the node's CI contract tests. Host-attested — not independently executable." }
}
```

The trust model of the Well-Known URI specification (§4) applies unchanged:
the discovery document's location confers no authority, and a client MUST NOT
treat the document itself as proof of any claim. A structure declaration
earns trust in exactly one of two ways, by class:

- a **verifiable** declaration earns trust when a party **executes its
  procedure** against the live node and the procedure does not falsify it;
- an **attested** declaration carries the node's word. A node SHOULD
  additionally carry attested-class declarations inside a signed portable
  attestation ([Portable Attestations](./attestations-v0.1.md)) so the word is
  at least bound to the node's `did:web` identity; either way it MUST be
  presented as the node's own statement, never as a verified fact (§4).

## 3. Field definitions

`structure_declarations` is a JSON object. Each member maps a **declaration
key** (§6) to a **declaration object** with exactly these members:

- `value` (REQUIRED) — the claim's answer. It MUST be a JSON boolean, number,
  or string. The set of admissible values for each registered key is defined
  below; extension keys define their own.
- `class` (REQUIRED) — one of `verifiable`, `attested`, `reputational` (§4).
- `verify` (REQUIRED) — the verification procedure (§5).

Clients MUST ignore unknown members of a declaration object.

### 3.1 Registered declaration keys (v0.1)

| Key | Value type | Meaning when declared |
| --- | --- | --- |
| `is_marketplace` | boolean | `false`: the node is a single host-owned origin selling its own inventory — not a venue listing third-party inventory. |
| `commission_pct` | number | The percentage taken by any party between the guest's payment and the host for a direct booking on this node. `0` means the host receives the full amount charged. |
| `source_of_truth` | boolean | `true`: this domain is the authoritative source for its own offers — identity, keys, and signatures all resolve here. |
| `gatekeeper` | string | `"none"`: no external authority, registry, membership, or API key is required at any step of the agent traversal. |
| `price_integrity` | string | `"single_total"`: the signed offer's total is the checkout total; no fees are added between offer and payment. |
| `surface_consistency` | string | `"contract-tested"`: agent-facing surfaces render only attested claims, never free text; the guarantee is the node's own CI, hence attested-class. |

Suggested verification procedures for the verifiable keys are given in the
example in §2; a node MAY word its procedures differently, subject to §5.
`surface_consistency` is inherently attested-class: its guarantee lives in
the node's internal CI and cannot be executed by an outside party.

All keys are OPTIONAL. A node SHOULD declare only what it is prepared to
stand behind: **a key that is absent is Unknown** — a verifier MUST NOT infer
an absent declaration as either true or false (the same tri-state discipline
as attested claims, [Portable Attestations](./attestations-v0.1.md) §5).

## 4. Three-class taxonomy (normative)

Every declaration MUST carry exactly one `class`, and classes MUST NOT be
conflated in presentation:

- **`verifiable`** — the `verify` procedure can be executed by any party
  against the live node, using only the node's public interfaces. Executing
  the procedure either passes or **falsifies the claim**.
- **`attested`** — the claim is the node's own signed word but is not
  independently executable (for example, guarantees enforced by the node's
  internal CI).
- **`reputational`** — third-party signals such as reviews. Out of scope for
  this specification; the class name is **reserved** here so that
  implementations never launder reputation into either of the other classes.

Rules:

- A verifier MUST NOT present an attested claim as verified.
- A node MUST NOT declare a claim `verifiable` unless the stated procedure,
  executed against the live node, actually falsifies the claim when the claim
  is false.
- A node MUST NOT publish `reputational` declarations under this section in
  v0.1.

## 5. Verification procedures (v0.1: prose)

In v0.1 the `verify` member is **prose**: a human-auditable, plain-language
description of the procedure. Machine-executable descriptors (for example
HTTP request templates with assertions) are deferred to a later revision and
will be additive when they come.

A `verify` procedure MUST:

- describe steps that any party can execute against the **live node** using
  only public interfaces (HTTP, the discovery document, JWKS, `did:web`, the
  signed offer endpoint, checkout traversal) — no credentials, no contacting
  the operator, no third-party service;
- be **falsifying**: it names the observable outcome that, if absent, proves
  the claim false — a procedure that can only confirm and never refute does
  not qualify a claim as `verifiable`;
- be self-contained enough that a verifier can execute it without reading
  this specification's registry entry for the key.

For `attested`-class declarations the `verify` member MUST instead state
plainly **what guarantees the claim and why it is not independently
executable** (see `surface_consistency` in §2 for the canonical form).

## 6. Extensibility and naming discipline

Extension keys follow the claim-key discipline of
[Portable Attestations](./attestations-v0.1.md) §5, adapted to typed values:

- A declaration key MUST match `^[a-z][a-z0-9_]*$` (lowercase snake_case).
- A key MUST name the structural property **affirmatively and neutrally**;
  the answer lives in `value`, never in the key. Keys that encode a negation
  (a `no_`/`not_` prefix, `_not_` anywhere, or a
  `_forbidden`/`_prohibited`/`_banned`/`_disallowed` suffix) MUST NOT be
  used: declare `is_marketplace` with `value: false`, never `not_marketplace`.
  This keeps two nodes' declarations comparable — the reason to standardize
  at all.
- The `structure_declarations` object MUST NOT contain the same key more than
  once; a verifier that encounters a duplicate MUST treat the object as
  malformed.
- Declaration keys describe the **node's commercial structure**. They are a
  separate namespace from property-level attested claim keys (amenities and
  policies, [Portable Attestations](./attestations-v0.1.md) §5): an extension
  key MUST NOT restate a property-level claim, and property-level claim keys
  MUST NOT be mirrored here.
- Clients MUST ignore declaration keys they do not recognize.

## 7. Verifier presentation

A verifier that surfaces structure declarations:

- MUST present each claim with its class visible or implied unambiguously —
  at minimum, distinguishing "verified" (a verifiable claim whose procedure
  was executed and passed) from "declared" (anything else, including
  attested claims and verifiable claims whose procedure was not executed);
- MUST treat a verifiable claim whose executed procedure fails as
  **falsified** and, if it surfaces the claim at all, present it as failed —
  not as unknown, and not silently omitted while other results are shown;
- MUST treat absent keys as Unknown (§3.1).

Whether a node MUST keep its declarations consistent with observable
behavior as a **conformance criterion** — and how conformance failures are
reported — is deliberately left open in v0.1 (issue #60, open question 3).
The falsifiability requirement in §5 already gives every verifier the tool
to answer the question for itself.

## 8. Reference

Villa Åkerlyckan (villaakerlyckan.se) is the intended first live node for
structure declarations. Publication on the node and the in-browser verifier
extension are implementation steps tracked separately (issue #60, scope items
3–4); this document intentionally precedes them.

## License

Specification text: dedicated to the public domain under [CC0 1.0](../LICENSE). Reference code and conformance test vectors: [Apache-2.0](../LICENSE-CODE) (ADR 0010 D7).
