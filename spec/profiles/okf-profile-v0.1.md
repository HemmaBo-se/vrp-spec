# VRP Composition Profile — OKF (Open Knowledge Format)

**Profile version:** 0.1
**Layer:** `representation`
**Status:** Draft (provisional). **NOT-BUILT** — this profile defines a target
representation; the reference node does not emit it yet (the node today emits
JSON / JSON-LD / JWS and plain-text `llms.txt` / `ai.txt`, not Markdown +
frontmatter). No existing artifact changes when this lands.
**Canonical context:** https://vacationrentalprotocol.com/contexts/v1
**Sibling profile:** [`mcp-composition-profile.md`](./mcp-composition-profile.md)

## Purpose

This profile defines how a VRP node renders its already-signed
**verified stay offer** (and its discovery facts) as an **Open Knowledge Format
(OKF) document** — Markdown with a YAML frontmatter block — so that any
OKF-speaking agent can read the node with zero format friction.

> OKF is an open, vendor-neutral specification published by Google Cloud (v0.1,
> June 2026; repo `GoogleCloudPlatform/knowledge-catalog`). It standardizes the
> **interoperability surface** only — file structure, a YAML frontmatter schema
> whose single required field is `type`, cross-linking, and reserved filenames —
> and explicitly leaves out storage, serving, governance, and trust. That omission
> is the opening: OKF says *what a concept is*; it has **no way to say whether a
> claim is true**. This profile supplies exactly that missing layer for VRP
> concepts via `vrp_proof`.

It is deliberately the **second** composition profile (after MCP transport): the
node is already a multi-representation emitter — it serves the same source of
truth at `/.well-known/vacation-rental.json` (discovery), `/api/verified-stay-offer`
(signed offer), `/.well-known/agent-traversal.json` (traversal graph), `/llms.txt`
and `/ai.txt`. An OKF document is **one more representation of the same truth**,
not a new truth and not a migration.

This is a **security / constraint profile**, not a taxonomy. Its normative weight
is in *how a reader must verify a rendered offer* (§4), not in naming things.

## The core rule: the Markdown is a rendering, the proof is the JWS

OKF Markdown has **no native signing**. A rendered document is therefore **not**
an authoritative artifact and a reader **MUST NOT** treat its prose, frontmatter,
or location as proof of any claim (mirrors [`well-known-uri-v0.1.md`](../well-known-uri-v0.1.md)
§4 and the MCP profile's "sign the assertion, not the transport").

Authority comes from a single embedded field:

> `vrp_proof` — the **compact Ed25519 JWS** of the VRP signed verified stay offer
> (`schemas/verified-stay-offer-v0.1.schema.json` → `signature.jws`), verifiable
> standalone against the node's published keys (`did:web` / JWKS), independent of
> any central party.

The OKF document carries the proof; it does not become the proof.

## `type` alignment — NORMATIVE

The frontmatter `type` **MUST** be the schema.org noun **`VacationRental`**. VRP
does **not** mint a parallel noun for "vacation rental" — that vocabulary is owned
by schema.org and is already emitted by the reference node
(`PropertySchemaOrg` → `"@type": "VacationRental"`). VRP's contribution is the
**verbs** (verify, sign, book direct), expressed as the `vrp_proof` extension and
the verification behavior in §4 — layered *on top of* the schema.org type, never
in competition with it.

A producer **MUST NOT** emit an invented type such as `VacationRentalProperty` or
`VRPOffer` in the `type` field; VRP-specific structure lives under the
`vrp` extension key, not in the schema.org noun.

## Document shape (informative)

```markdown
---
type: VacationRental                       # OKF required field == schema.org noun (NORMATIVE)
title: "Villa Åkerlyckan"                  # OKF recommended
description: "Verified direct stay offer · 8–10 Sep 2026 · 6 guests · signed by the host domain"  # OKF recommended
resource: https://villaakerlyckan.se       # OKF recommended — canonical URI of the underlying asset
timestamp: 2026-06-26T16:03:26Z            # OKF recommended — ISO 8601, last meaningful change
tags: [vacation-rental, verified, direct-booking]   # OKF recommended
# --- VRP trust extension (OKF preserves unknown frontmatter keys; the trust verbs live here) ---
vrp:
  protocol_version: "0.1"
  issuer: did:web:villaakerlyckan.se
  canonical_domain: villaakerlyckan.se
  jwks_url: https://villaakerlyckan.se/.well-known/jwks.json
  discovery_url: https://villaakerlyckan.se/.well-known/vacation-rental.json
  offer:
    request: { check_in: 2026-09-08, check_out: 2026-09-10, guests: 6 }
    price: { currency: SEK, public_total: 6800, agent_total: 6460, minor_unit: false, exact: true }
    valid_until: 2026-06-26T16:18:26Z
    direct_booking_url: https://villaakerlyckan.se/book?checkIn=2026-09-08&checkOut=2026-09-10&guests=6&channel=agent
    agent_permission: { may_quote_as_official_direct_offer: true }
  # The ONLY authoritative field. Everything above is a convenience rendering of it.
  vrp_proof: "<compact Ed25519 JWS — schemas/verified-stay-offer-v0.1.schema.json signature.jws>"
---

# Villa Åkerlyckan — verified direct stay offer

Human-readable body (host description, amenities, policies). Advisory only.
```

Notes:
- **OKF-idiomatic fields.** `type` (required), `title`, `description`, `resource`,
  `tags`, `timestamp` are OKF's small queryable surface and carry the human/SEO
  layer. All VRP trust facts live under the single `vrp` extension key — OKF
  consumers MUST preserve unknown keys, so a non-VRP agent reads the concept fine
  and a VRP-aware agent finds the proof. The file path is the concept's identity
  (OKF's own model); VRP adds *who signed it*, not a new addressing scheme.
- The frontmatter mirrors fields the node already signs inside the JWS; the
  rendering is **derived from**, and reconciles to, `vrp_proof`. On any
  discrepancy between a frontmatter value and the verified JWS payload, the
  **verified JWS payload wins** and the frontmatter value is discarded.
- `price.agent_total` is the host's signed direct price; `public_total` is the
  website total. An agent **SHOULD** quote `agent_total` (offer-schema rule:
  "Agents SHOULD quote agent_total as the direct total"). The saving is the
  verifiable difference `public_total − agent_total`, both signed — no separate
  discount field is invented (`must_not_invent_discounts`).

## Verification behavior — NORMATIVE (fail-closed)

A reader that intends to act on a rendered OKF document (quote it, book from it)
**MUST** perform, in order:

1. **Locate the proof.** Read `vrp.vrp_proof`. If absent, the document is
   **untrusted metadata**: it MAY be read for description but MUST NOT be quoted
   as an official, verified, or priced offer.
2. **Resolve keys.** Resolve `vrp.issuer` (`did:web:<domain>`) and fetch the node's
   JWKS (`vrp.jwks_url` / `/.well-known/jwks.json`).
3. **Verify the signature** over the **JWS bytes as received** (Ed25519 / `EdDSA`).
   Never re-canonicalize or re-serialize the payload before verifying.
4. **Bind to origin.** The verified payload's `canonical_domain` (and the
   `booking.direct_booking_url` host) **MUST** equal the origin the document was
   served from. A document served on origin A that carries a proof for domain B is
   **untrusted**.
5. **Check freshness.** Reject if the verified `valid_until` has passed
   (`spec/v0.1.md` §6).
6. **Fail closed.** **If `vrp_proof` is present but does not verify, or the origin
   does not match, or the offer is stale → the document MUST be treated as
   untrusted (`unverifiable` / `invalid`), never as a booked or quotable offer.**
   This is identical to the three-state model in `spec/v0.1.md` §8–§9: trust is
   the verifier's result, never an offer- or document-asserted value.

A reader **MUST NOT** derive any trust from the document's path or `.well-known`
location (`well-known-uri-v0.1.md` §4). Location aids *discovery*, never *trust*.

## Price provenance — NORMATIVE

The single thing OKF, schema.org, and `llms.txt` cannot provide is proof that
**the price came from the host's own domain.** That is VRP's reason to exist, so
it is normative here:

- A reader **MUST NOT** quote, display, or charge any price taken from the
  frontmatter (`vrp.offer.price`) or the Markdown body **on its own** — those are a
  convenience rendering, not authority.
- A price is trustworthy **only** as the value carried inside the verified
  `vrp_proof` payload (`price.public_total` / `price.agent_total`), and **only
  after** the §4 signature + origin + freshness checks pass.
- If the rendered price and the verified JWS price disagree, the **verified JWS
  price wins** and the rendered value is discarded — never treated as a second
  opinion or an average.
- `agent_total` is actionable as the direct price **only** when the verified
  `agent_permission.may_quote_as_official_direct_offer` is `true`. The saving is
  the signed difference `public_total − agent_total`; an agent **MUST NOT** invent
  a discount not present in the signed payload (`must_not_invent_discounts`).

Net: **price provenance is a property of the signature, not of the format, the
page, or the path.** A marketplace that re-hosts the concept cannot forge this —
it cannot produce a JWS that verifies against the host domain's `did:web` keys.

## Path-as-identity & discovery (NORMATIVE for producers)

- An OKF document is identified by its **stable HTTPS path** on the node's
  `canonical_domain` (path-as-identity). The path is the document's identity; the
  `issuer`/`canonical_domain` inside the verified proof is the *trust* identity.
- Emitting an OKF document is **purely additive**. A producer **MUST NOT** alter
  or remove `/.well-known/agent-traversal.json`, `/.well-known/vacation-rental.json`,
  `/.well-known/jwks.json`, or `/api/verified-stay-offer` to add it. Those are the
  authoritative graph and are untouched.
- A node that serves an OKF document **SHOULD** advertise it as one additional
  entry in the discovery document's `endpoints` map (e.g. `endpoints.okf`),
  exactly as `agent_traversal` and `verified_stay_offer` are listed today — never
  as a replacement for them.

## Non-goals

- **Not a trust source.** OKF (like schema.org) is descriptive; this profile adds
  trust strictly via `vrp_proof` + §4, not via the format.
- **Not a migration.** The node's JSON / JSON-LD / JWS and `.well-known` graph are
  LIVE and authoritative; OKF is an extra rendering. If OKF is later abandoned,
  nothing authoritative is lost.
- **Not a new noun.** `type` is schema.org `VacationRental`; VRP adds verbs, not a
  competing taxonomy.

## Security & privacy considerations

- Served over `https` only; the document is public, machine-readable metadata and
  **MUST NOT** contain guest personal data or secrets.
- Key publication, rotation, and revocation happen at `jwks_url` / `did:web`, not
  in the document.
- The single moat key signs the offer; the OKF document only *carries* that proof.
  Key rotation must preserve historical verifiability of previously rendered
  proofs (cf. MCP profile "key blast radius").

## Reference implementation

**Pending (NOT-BUILT).** The reference node (`hemmabo-smart-stays`) emits the
signed offer (`api/verified-stay-offer.ts`) and the discovery/traversal graph
today; an OKF renderer that produces this document **additively** — reading
through the node's truth resolvers (Lag 3) and embedding the existing
`signature.jws` as `vrp_proof` — is the implementation step that follows this
profile. This profile MUST describe only what the node can already sign; it adds a
representation, never a new claim.

## License

Specification text: dedicated to the public domain under [CC0 1.0](../../LICENSE). Reference code and conformance test vectors: [Apache-2.0](../../LICENSE-CODE).
