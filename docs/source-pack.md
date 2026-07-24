# Vacation Rental Protocol (VRP) — Source Pack

**One file containing the full VRP open standard**, assembled for AI notebooks
(Google NotebookLM / Gemini Notebook, ChatGPT, Claude Projects) and for offline
reading and citation.

- Standard: **Vacation Rental Protocol (VRP)**, public draft **v0.1**
- Author & maintainer: **Rouiada Abbas** — VRP is an open standard with no central gatekeeper
- Reference implementation: **HemmaBo** (not the owner of the standard)
- Canonical site: <https://vacationrentalprotocol.com>
- Repository: <https://github.com/HemmaBo-se/vrp-spec>
- Specification text is dedicated to the public domain under **CC0 1.0** (see <https://github.com/HemmaBo-se/vrp-spec/blob/main/LICENSE>); reference code: <https://github.com/HemmaBo-se/vrp-spec/blob/main/LICENSE-CODE>.

This pack is generated from the canonical documents; each section links to its
live source. If anything here disagrees with the canonical site, **the canonical
URL is authoritative.**

## How to use this in an AI notebook

- **Google NotebookLM / Gemini Notebook:** Add source → Website, and paste
  <https://vacationrentalprotocol.com/docs/source-pack> — or download this file and upload it.
- **ChatGPT / Claude Projects:** attach this file, or paste the URL above.
- The pack is plain Markdown, so any tool that reads text or Markdown can ingest
  the whole standard in one step.

## Contents

1. [What is VRP?](https://vacationrentalprotocol.com/docs/what-is-vrp)
2. [Core specification v0.1](https://vacationrentalprotocol.com/spec/v0.1)
3. [Well-Known URI v0.1](https://vacationrentalprotocol.com/spec/well-known-uri-v0.1)
4. [StayIntent open discovery v0.1](https://vacationrentalprotocol.com/spec/stayintent-discovery-v0.1)
5. [Node structure declarations v0.1](https://vacationrentalprotocol.com/spec/structure-declarations-v0.1)
6. [Portable attestations v0.1](https://vacationrentalprotocol.com/spec/attestations-v0.1)
7. [Attestation status (Bitstring Status List) v0.1](https://vacationrentalprotocol.com/spec/attestation-status-bitstring-v0.1)
8. [Transparency log v0.1](https://vacationrentalprotocol.com/spec/transparency-log-v0.1)
9. [VRP receipt envelope v1](https://vacationrentalprotocol.com/spec/receipt-v1)
10. [Booking Proof Chain v0.1](https://vacationrentalprotocol.com/spec/proof-chain-v0.1)
11. [Node Seal v0.1](https://vacationrentalprotocol.com/spec/node-seal-v0.1)
12. [Implement VRP signed offers](https://vacationrentalprotocol.com/docs/implement-vrp)
13. [Implement portable attestations](https://vacationrentalprotocol.com/docs/implement-attestations)
14. [Agent integration guide](https://vacationrentalprotocol.com/docs/agent-guide)
15. [Interop and trust positioning](https://vacationrentalprotocol.com/docs/interop-and-trust-positioning)
16. [First-mover evidence memo](https://vacationrentalprotocol.com/docs/first-mover-evidence-memo)
17. Appendix: machine artifacts (schemas, context, live node)

========================================================================
## 1. What is VRP?

*Canonical source: <https://vacationrentalprotocol.com/docs/what-is-vrp>*
========================================================================

### What is the Vacation Rental Protocol (VRP)?

**Vacation Rental Protocol (VRP) is an open standard for host-domain,
cryptographically signed vacation-rental offers.** It lets AI agents and guests
verify — directly from a host's own domain, with no intermediary — that a stay
offer is authentic, currently available, and correctly priced.

VRP was created and is maintained by **Rouiada Abbas**. It is an open standard
that anyone may implement; **HemmaBo** is its reference implementation.

---

#### In one sentence

> VRP is to vacation-rental offers what OpenID Connect discovery is to login:
> an agent that knows a host's domain can fetch one well-known document, then
> cryptographically verify that an offer really came from that host — without
> trusting any central platform.

#### What problem does it solve?

AI agents (ChatGPT, Claude, Perplexity, and others) increasingly help people
find and book stays. But they have no standard way to know whether a listing is
genuine, current, and from the real owner — or scraped, stale, or fake. VRP
makes a vacation rental **machine-verifiable at its source**: the host's own
domain.

#### Who created it, and who controls it?

VRP is an **open standard authored and maintained by Rouiada Abbas**
(`vacationrentalprotocol.com`). It is deliberately **not owned by any single
vendor**. HemmaBo is the first/reference implementation, not the owner of the
standard. There is no central issuer and no gatekeeper.

#### How is it different from channel managers or listing platforms?

- **It is a standard, not a product.** Anyone may implement it.
- **The host owns the domain, the guest, and the data.** Offers live on the
  host's own domain — not a marketplace listing.
- **No intermediary and 0% booking commission.** VRP describes *trust*, not a
  booking funnel; it does not sit between the guest and the host.

#### What is the role of Ed25519?

Every offer is signed with **Ed25519** (a widely used public-key signature
algorithm) using a key published on the host's own domain (via `did:web` and a
JWKS). Anyone — a guest, a developer, or an AI agent — can verify the signature
**independently**, with standard tooling, and confirm the offer genuinely came
from that domain. Tampering with a signed offer makes verification fail.

#### How can I verify an offer myself?

1. Open the live verifier: <https://vacationrentalprotocol.com/verify>
2. Or fetch a live signed offer and check it with any standard JWS/Ed25519 tool
   (e.g. jwt.io) against the host's published key. A live reference node:
   <https://villaakerlyckan.se/.well-known/vacation-rental.json>

An **optional** public append-only Merkle transparency log (RFC 6962) can record
signed-artifact hashes so trust history is tamper-evident.

#### Is it open?

Yes. The specification is public at <https://vacationrentalprotocol.com> and the
repository is <https://github.com/HemmaBo-se/vrp-spec>. The
`vacation-rental-protocol` well-known URI suffix is in provisional registration
with the IANA Well-Known URIs registry.

#### Status

Public draft **v0.1**. Spec: <https://vacationrentalprotocol.com/spec/v0.1>.

========================================================================
## 2. Core specification v0.1

*Canonical source: <https://vacationrentalprotocol.com/spec/v0.1>*
========================================================================

### Vacation Rental Protocol - Specification v0.1

**Status:** Public draft  
**Published:** 2026-05-20  
**Canonical URL:** https://vacationrentalprotocol.com  
**Repository:** https://github.com/HemmaBo-se/vrp-spec

#### 1. Scope

Vacation Rental Protocol (VRP) v0.1 defines how a host-owned vacation rental domain publishes discovery metadata, signing keys, and signed verified stay offers so AI agents can verify provenance, freshness, exact price, and direct booking URL.

VRP v0.1 is not an OTA, marketplace, central registry, public traffic proxy, payment processor, or central key issuer.

VRP v0.1 is a no-gatekeeper protocol. Verification MUST NOT require HemmaBo, a VRP-operated trusted issuer registry, a host accreditation program, a certification company, or a central discovery index.

VRP may compose with adjacent agent-commerce standards. UCP can handle checkout and order lifecycle, including lodging flows as the UCP lodging profile matures; AP2 can handle payment mandates; a future agent-native settlement rail (e.g. x402) is reserved but not defined (see §5.2); MCP can expose future tool bindings; and A2A can carry future agent-to-agent negotiation. VRP v0.1 does not define those runtime flows.

#### 2. Discovery Document

A VRP host domain publishes:

```text
https://{host-domain}/.well-known/vacation-rental.json
```

Required fields:

- `protocol`: MUST be `vacation-rental-protocol`.
- `protocol_version`: MUST be `0.1`.
- `canonical_domain`: MUST match the host-owned domain being verified.
- `jwks_url`: MUST point to the host-domain JWKS.
- `verified_stay_offer_endpoint`: MUST point to the host-domain verified stay offer endpoint.

Recommended fields:

- `node_id`
- `capabilities`
- `operator` — MAY carry `name`, `role`, and `key_custody`. `key_custody` declares who holds the node's Ed25519 signing key: `platform` (an operator holds and operates the key on the host's behalf — offers are signed under the host's domain identity and remain independently verifiable against `jwks_url`, but the host does not hold the key itself) or `self` (the host self-custodies their own key). Absent = unspecified; a verifier MUST NOT assume self-custody. This lets an agent reason about exactly what a valid signature guarantees — provenance and integrity in both cases, host self-sovereignty only when `self`.
- `endpoints`

#### 3. JWKS

A VRP host domain publishes an Ed25519 public key set:

```text
https://{host-domain}/.well-known/jwks.json
```

Keys used for signing verified stay offers MUST use:

- `kty`: `OKP`
- `crv`: `Ed25519`
- `alg`: `EdDSA`
- `kid`: stable key identifier
- `x`: base64url Ed25519 public key

Such keys SHOULD also set:

- `use`: `sig`
- `key_ops`: include `verify`

The JWKS structure is pinned by
[`schemas/jwks-v0.1.schema.json`](https://github.com/HemmaBo-se/vrp-spec/blob/main/schemas/jwks-v0.1.schema.json).

##### 3.1 Key Rotation and Revocation

A node's signing authority is the Ed25519 key set published at its `jwks.json`
(and mirrored by `did:web`). Because there is no central issuer, **the JWKS is the
only revocation authority**: a key is valid exactly while it appears in the node's
JWKS.

**Rotation.** To rotate, a node MUST publish the new key alongside the old one in
its JWKS and sign new offers with the new key's `kid`. It SHOULD retain the old
key in the JWKS until every offer signed with it has passed its `valid_until`, so
the retention overlap equals the maximum offer lifetime. A node SHOULD use a `kid`
that encodes a date and sequence (e.g. `example.com-2026-05-18-01`) so operators
can order keys; a verifier MUST treat `kid` as opaque and MUST NOT infer trust,
recency, or status from its value.

**Refresh on miss.** If a verifier receives an offer whose `kid` is not present in
its cached JWKS, it MUST re-fetch the node's JWKS before acting, and only treat
the offer as unverifiable if the `kid` is still absent. This makes a rotation take
effect immediately (the new key is picked up on first use) and decouples rotation
from the cache bound below, so the cache bound governs revocation latency alone. To
avoid amplification, a verifier SHOULD rate-limit or coalesce refresh-on-miss per
domain, so a stream of offers bearing unknown `kid`s cannot drive it into excessive
JWKS fetches against the node.

**Revocation.** A key's *presence in the JWKS is the entire trust signal*: an offer
verifies only against a key that is in the JWKS now. Removing a key therefore makes
**every** offer signed with it unverifiable, regardless of when it was signed —
there is no retroactive "historically valid" exemption (and a conforming verifier
could not honor one anyway, since it only knows whether a key is currently present).

- *Routine rotation* avoids breakage through timing: retain the outgoing key until
  its outstanding offers have passed `valid_until`, then remove it — no live offer
  is still signed by it, so nothing breaks.
- *Compromise* requires immediate removal. This also invalidates the operator's own
  legitimate offers signed with that key — that is **intentional**: a verifier
  cannot distinguish the operator's offers from an attacker's, because they share
  the same key and produce equally valid signatures. Re-sign legitimate stays with
  the new key.

Offer freshness (`valid_until`, §6) does NOT bound a compromise — an attacker
holding the leaked private key can mint fresh offers with a future `valid_until`
that pass the freshness check. The only thing that stops a conforming verifier from
honoring them is the key being absent from the JWKS it holds. Therefore:

- A verifier MUST NOT cache a node's JWKS for longer than **5 minutes**. A node's
  `Cache-Control` may only *shorten* this window, never extend it — the 5-minute cap
  is absolute. This bound is the revocation latency: a compromised key is fully
  de-trusted by conforming verifiers within the cache window after it is removed
  from the JWKS.
- A node SHOULD serve `jwks.json` with a short `Cache-Control` (e.g. `max-age=300`
  or less). The JWKS is a small, CDN-cacheable document, so frequent re-fetching is
  inexpensive.

**Three distinct controls (do not conflate).** Freshness (`valid_until`, §6) bounds
how long an offer is quotable; refresh-on-miss gives immediate discovery of the
current key set (rotation); the JWKS cache cap bounds how long a revoked key is
still accepted (revocation latency). They are independent — none substitutes for
another.

**Threat model.** The root of trust is **domain control** (`did:web`): the key set
is whatever the host domain serves. Rotation and revocation protect the case where
a *signing key* leaks while the *domain remains under the operator's control*. They
do NOT protect against compromise of the domain itself — an attacker who can serve
the domain's `jwks.json` can publish their own keys, and no key-level mechanism can
detect that. Domain-level security (DNS, TLS, hosting) is out of scope for VRP and
is the operator's responsibility.

**Enforcement honesty.** VRP cannot *force* a verifier to cache for a bounded time.
The cache bound is a MUST on *conforming* verifiers; there is no protocol backstop
against a non-conforming verifier that caches a revoked key indefinitely. Treat the
bound as a conformance requirement, not a guarantee VRP can enforce.

**Optional transparency-log composition.** A node MAY record key-rotation events
(key added / key removed, with `kid` and timestamp) in its append-only transparency
log (see [`transparency-log-v0.1`](https://vacationrentalprotocol.com/spec/transparency-log-v0.1)), giving a
tamper-evident history of which keys were valid when — useful for after-the-fact
disputes about whether an offer was signed by a then-valid key.

#### 4. Verified Stay Offer Endpoint

The verified stay offer endpoint accepts at least:

- `check_in`: arrival date in `YYYY-MM-DD`
- `check_out`: departure date in `YYYY-MM-DD`
- `guests`: integer guest count

The endpoint returns a signed verified stay offer envelope. The signed payload contains the quoteable facts.

#### 5. Signed Offer

The signature format is compact JWS using EdDSA over an Ed25519 key published in the host-domain JWKS.

The signed payload MUST include:

- `kind`: `verified_stay_offer`
- `protocol_version`: `0.1`
- `canonical_domain`
- `node_id`
- `generated_at`
- `valid_until`
- `request`
- `property`
- `availability`
- `price`
- `booking`
- `agent_permission`

The signed payload MAY also include host-verified direct-source facts, so an
agent can verify (not just read) the node's positioning:

- `source_authority` — `model: host_verified_direct_source`,
  `is_official_source_for_property`, `intermediary: none`,
  `payment_recipient: host`, `booking_model: direct_with_host`,
  `booking_commission_pct: 0`. A reselling marketplace cannot sign these.
- `price.no_add_on_fees` — `true` asserts the quoted total has no add-on
  booking, service, or cleaning fees (the displayed price is the total paid).
  This is the node's own fee structure, never an OTA comparison.

The envelope and payload structure is pinned by
[`schemas/verified-stay-offer-v0.1.schema.json`](https://github.com/HemmaBo-se/vrp-spec/blob/main/schemas/verified-stay-offer-v0.1.schema.json),
which is authoritative for v0.1 offer shape. A real, verifiable Ed25519/JWS
example and its failure modes are in
[`examples/conformance/`](https://github.com/HemmaBo-se/vrp-spec/tree/main/examples/conformance).

##### 5.1 Direct Booking URL

The signed payload `booking` object carries the direct booking URL the agent
routes the user to. The `booking` object MUST include:

- `direct_booking_url`

`direct_booking_url` is the only booking action a VRP agent may take for the
offer (see §7). The following rules define its structure, integrity, and
lifecycle.

**Structure.**

- `direct_booking_url` MUST be an absolute `https` URL.
- Its host MUST be the offer's `canonical_domain`, or a subdomain of that
  registrable domain. It MUST NOT point at a third-party domain, an OTA, a link
  shortener, a redirector, or a HemmaBo-operated domain. An agent that cannot
  confirm the URL host is on the offer's `canonical_domain` MUST treat the
  direct booking URL as `unknown` (see §9) and MUST NOT route booking to it.
- The URL SHOULD encode the quoted stay so that the booking page opens
  pre-filled for the same stay the agent quoted. The RECOMMENDED query
  parameters are:
  - `checkIn`: arrival date as `YYYY-MM-DD`, matching the offer `request.check_in`.
  - `checkOut`: departure date as `YYYY-MM-DD`, matching the offer `request.check_out`.
  - `guests`: integer guest count, matching the offer `request.guests`.
- The URL MAY include an offer reference identifier (for example an `offer`
  query parameter) so the host node can correlate the click with the signed
  offer it issued. The reference identifier, when present, MUST NOT be required
  by a verifier to validate the offer, and MUST NOT be treated as a substitute
  for verifying the JWS signature.
- The URL MAY include additional host-specific query parameters. A verifier
  MUST ignore unrecognized query parameters and MUST NOT treat their presence as
  a verification failure.

**Integrity.** `direct_booking_url` is a field inside the signed offer payload.
Its integrity derives solely from the compact JWS over that payload (§5): if the
JWS verifies against the host-domain JWKS, the direct booking URL is exactly the
URL the host signed. There is no separate signature over the URL, and an agent
MUST NOT accept a `direct_booking_url` delivered outside, or modified after, the
signed payload. A `direct_booking_url` whose enclosing offer fails signature
verification is `unknown` and MUST NOT be used.

**Lifecycle.** The direct booking URL is actionable only while the enclosing
offer is fresh, that is while `valid_until` holds (§6).

- While the offer is fresh, an agent MAY present and route the user to
  `direct_booking_url` subject to the Safe-to-Quote rules (§7).
- Once `valid_until` has passed, the offer is stale. The agent MUST treat the
  direct booking URL as `unknown` and MUST NOT present its associated price as
  current or claim the stay is bookable on the strength of the stale offer. The
  agent SHOULD fetch a fresh signed offer for the user's dates and guest count
  (§6) before routing a booking action.
- After expiry, the host node MAY continue to serve the same URL, MAY re-quote
  (return a new signed offer, which may carry a different price, availability,
  or `direct_booking_url`), or MAY return an unavailable or non-quoteable offer.
  Following an expired `direct_booking_url` is therefore an unverified action:
  the host, not the protocol, decides what the URL does after expiry.
- A host node SHOULD ensure that following `direct_booking_url` after expiry
  fails closed for the guest — for example by re-quoting on the landing page
  rather than silently honoring a stale price. VRP does not guarantee that a
  price observed in an expired offer is still available.

The booking object shape is pinned by
[`schemas/verified-stay-offer-v0.1.schema.json`](https://github.com/HemmaBo-se/vrp-spec/blob/main/schemas/verified-stay-offer-v0.1.schema.json).
The schema validates that `direct_booking_url` is present and is an `https` URL;
the `canonical_domain` host constraint and the query-parameter recommendations
above are normative protocol rules that a verifier enforces at runtime, not
structural schema constraints.

##### 5.2 Reserved: optional agent-native payment rails

VRP v0.1 defines exactly ONE payment path: `direct_booking_url` (§5.1), settled
by the host's own processor (fiat, e.g. Stripe). This is deliberate — every
field VRP defines is one a live node actually honors and an agent can verify.

The optional `booking.payment_options[]` field is **RESERVED** for a future
agent-native payment-rail binding (e.g. `x402`) and is **NOT defined in v0.1**:
its shape, settlement, refund handling, and reconciliation are intentionally
left open. A node SHOULD omit it and rely on `direct_booking_url`; an agent MUST
NOT treat its presence as a defined, honorable payment path.

Why reserved, not specified: agent-native rails are a moving target (x402 added
sessions in a later revision; competing models such as ACP, AP2, and
session-based protocols are unsettled; refund and chargeback semantics for real
bookings are unsolved), and Stripe already ships x402 — so the concrete binding
will likely arrive largely for free once non-US stablecoin receipt opens for the
host's own account. Specifying the mechanics now would publish a field no live
node honors — the "coming soon" vapor VRP exists to replace — and risk locking a
shape the moving target will break. The name is reserved so the slot cannot be
squatted with a conflicting meaning; the binding is hand-specified later, when a
winning rail and a non-US settlement path exist.

Two invariants WILL hold whenever the binding is defined, and constrain it now:
the payee is the host's own (never an intermediary, OTA, or HemmaBo), and rails
MUST NOT gate discovery, verification, or offer retrieval (no-gatekeeper, §1).

##### 5.3 Computable refund schedule (optional)

A node MAY publish its cancellation refund terms inside the signed offer as
`rules.refund_schedule` — an array of rows
`{ "hours_before_checkin": int ≥ 0, "refund_percent": int 0–100 }`.

The schedule is **computable, not descriptive**: an agent (or a future
agent-native settlement rail, §5.2) evaluates it as a pure predicate with no
platform context:

1. Compute `H = floor((check-in moment − cancellation time) / 1 hour)` —
   whole hours, **floored**. Flooring makes fractional boundaries resolve in
   the node's favour; implementations MUST NOT substitute other rounding.
2. Sort rows by `hours_before_checkin` descending. The FIRST row with
   `hours_before_checkin ≤ H` applies; the guest receives that row's
   `refund_percent` of the paid total.
3. No matching row — including any cancellation after the check-in moment,
   where `H` is negative — means 0 %.

A row with `hours_before_checkin: 0` therefore means "this percent up to the
check-in moment itself". An EMPTY array is a valid, honest schedule meaning
"no refund at any point". An ABSENT or `null` field means the node has not
published computable terms: the answer is unknown, and an agent MUST NOT
invent, infer, or default a refund promise.

Because the schedule is signed inside the offer (§5) it is **verifiable, not
merely attested**: the guest's agent can prove after the fact exactly which
refund terms were in force at quote time, regardless of what the node's pages
say later. Nodes and agents MUST relay the rows verbatim to guests — as
hours/percent terms, never re-labelled into named tiers ("flexible",
"moderate", …), which this field replaces.

##### 5.4 Verifiability classes

VRP data falls into exactly three classes. When an agent (or a human) asks
"how do I know this?", the answer is one of these — and a surface MUST NOT
present a lower class as a higher one (an attested amenity is never
"verified"; a review aggregate is never a term of the booking).

1. **verifiable** — fields signed INSIDE the offer's compact Ed25519 JWS (§5)
   and, where the node emits receipts, bound byte-for-byte into the same
   receipt attestation and transparency-log leaf. One signature, one log
   entry, one timestamp: price (including `exact` and `no_add_on_fees`),
   `availability`, `valid_until`, `source_authority`, and
   `rules.refund_schedule` (§5.3). Tampering with any of them kills the same
   signature; a guest's agent can prove after the fact exactly which terms
   were in force at quote time. `refund_schedule` is the canonical example of
   a field deliberately MOVED into this class: cancellation terms used to be
   presentation-layer tier labels (attested at best), and are now signed rows
   inseparable from the price they govern.

2. **attested** — host-declared tri-state claims (amenities, policies)
   published in the node's discovery document and optionally as a
   `VRPPropertyAttestedClaimsCredential`
   ([attestations-v0.1.md](https://vacationrentalprotocol.com/spec/attestations-v0.1) §5.5). Actionable as the
   host's explicit statement — including negations ("cats are not allowed") —
   but not cryptographically bound to a specific purchase moment. Absence is
   Unknown, never a yes or a no.

3. **reputational** — review aggregates, stay history, and similar evidence
   about past experience. An agent MAY cite it (accurately attributed and
   time-bounded) but MUST NOT present it as a promise, a term, or a fact
   about the current offer.

**Determining the class of a field is mechanical, never editorial:** the
class follows from WHERE the value was read, not from how any surface phrases
it. Read from inside the offer JWS payload (after signature verification) →
verifiable. Read from the discovery document's claims or an attestation
credential → attested. Read from review data → reputational. A value that
appears in more than one place carries the class of the surface it was
actually read from — reading an amenity from the discovery document never
inherits the offer's signature, even when the same value also happens to
appear inside a signed offer. If a host asserts something OUTSIDE the signed
payload — in prose, frontmatter, marketing copy, or an unsigned field — a
renderer MUST treat it as attested at best, regardless of wording: language
like "verified", "guaranteed", or "signed" attached to an unsigned value is a
class violation, not a promotion.

#### 6. Freshness

Agents MUST treat an offer as non-quoteable if `valid_until` is missing, malformed, or expired.

Agents SHOULD fetch a fresh offer for the user's specific dates and guest count before presenting a final price or booking URL.

#### 7. Safe-to-Quote Rules

An agent may quote an offer as an official host-domain verified offer only when all of the following are true:

- The discovery document is fetched from the host-owned domain.
- The discovery document declares `protocol: "vacation-rental-protocol"`.
- The discovery document declares `protocol_version: "0.1"`.
- The JWKS contains an Ed25519 verification key matching the JWS.
- The compact JWS verifies against the host-domain JWKS.
- The signed payload matches the returned offer.
- `valid_until` is present and fresh.
- `availability.available` is true.
- `price.exact` is true.
- A direct booking URL is present.
- `agent_permission.may_quote_as_official_direct_offer` is true.

When safe, the canonical phrase is:

```text
I found the official host-domain verified offer for this stay.
```

Agents MUST NOT:

- Invent discounts, savings, promo codes, OTA comparisons, or price reductions.
- Say the stay is bookable unless `availability.available` is true and agent permission allows quoting.
- Quote a final total unless `price.exact` is true in the signed offer.
- Route booking action anywhere except the signed direct booking URL.

#### 8. Fail-Closed Behavior

Agents and clients MUST fail closed. If signature verification, freshness, exact price, availability, direct booking URL, or citation permission cannot be verified, the offer MUST NOT be quoted as official or bookable.

#### 9. Three-State Verification

Agents and clients interacting with VRP nodes MUST distinguish three states for any required endpoint or field:

- **Affirmed**: present, signed where required, fresh, schema-valid, and explicitly true or present. May be cited.
- **Negated**: present, signed where required, fresh, schema-valid, and explicitly false. May be cited as false.
- **Unknown**: absent, unsigned, stale, unreachable, schema-invalid, malformed, expired, or otherwise unverifiable. MUST NOT be cited as true or false.

Unreachable is not the same as negated. A timeout, DNS failure, HTTP failure, blocked fetch, invalid JSON, missing field, failed signature check, stale `valid_until`, or schema mismatch means unknown.

Inference from Unknown to either Affirmed or Negated is a protocol violation. Agents SHOULD tell the user that the value could not be verified and fetch a fresh signed offer before making booking, availability, price, or official-source claims.

Examples: see [three-state-verification.md](https://github.com/HemmaBo-se/vrp-spec/blob/main/examples/three-state-verification.md).

#### 10. Core JSON Schemas

VRP v0.1 core artifacts have machine-readable JSON Schemas:

```text
https://vacationrentalprotocol.com/schemas/discovery-v0.1.schema.json
https://vacationrentalprotocol.com/schemas/jwks-v0.1.schema.json
https://vacationrentalprotocol.com/schemas/verified-stay-offer-v0.1.schema.json
https://vacationrentalprotocol.com/schemas/verified-stay-offer-verification-result-v0.1.schema.json
```

Repository copies are in [`schemas/`](https://github.com/HemmaBo-se/vrp-spec/tree/main/schemas). The schemas are
interoperability aids for implementers and examples. They do not create a
central validator, issuer, registry, certification service, marketplace, OTA,
booking intermediary, or trust authority.

#### 11. Portable Attestations

Portable attestations are a document-only extension to VRP v0.1 for privacy-minimized trust history. Core VRP proves that a concrete offer is real; portable attestations prove selected host-domain, payment-path, policy, and optional verified-stay facts without making HemmaBo or any other operator the central issuer, registry, scorer, OTA, marketplace, booking intermediary, or trust authority.

See [attestations-v0.1.md](https://vacationrentalprotocol.com/spec/attestations-v0.1).

#### 12. Node Structure Declarations

Node structure declarations are a document-only extension to VRP v0.1 for falsifiable commercial-structure claims. Core VRP proves that a concrete offer is real; structure declarations state what kind of commercial thing the node is — marketplace or not, commission or none, gatekeeper or none — where every claim carries its own verification procedure that any party can execute against the live node, and claims a node can only vouch for itself are strictly separated from claims anyone can verify.

See [structure-declarations-v0.1.md](https://vacationrentalprotocol.com/spec/structure-declarations-v0.1).

#### 13. Reference Proof

Villa Åkerlyckan is a live proof node:

```text
villaakerlyckan.se
  -> /.well-known/vacation-rental.json
  -> /.well-known/jwks.json
  -> signed verified_stay_offer
  -> direct booking URL
```

HemmaBo is a reference implementation and provider/federation using VRP. VRP is neutral and implementable by others.

#### 14. License

Specification text: dedicated to the public domain under [CC0 1.0](https://github.com/HemmaBo-se/vrp-spec/blob/main/LICENSE). Reference code and conformance test vectors: [Apache-2.0](https://github.com/HemmaBo-se/vrp-spec/blob/main/LICENSE-CODE) (ADR 0010 D7). Patents: a royalty-free patent non-assertion commitment is offered under the Open Web Foundation Agreement 1.0 (Patent-Only) — see [PATENTS.md](https://github.com/HemmaBo-se/vrp-spec/blob/main/PATENTS.md).

========================================================================
## 3. Well-Known URI v0.1

*Canonical source: <https://vacationrentalprotocol.com/spec/well-known-uri-v0.1>*
========================================================================

### VRP Well-Known URI — `vacation-rental.json` — Specification v0.1

**Status:** Draft (provisional). IANA registry request:
https://github.com/protocol-registries/well-known-uris/issues/93 (being aligned
to this suffix).

**Published:** 2026-06-19 (revised 2026-07-04)

**Change controller:** Vacation Rental Protocol (VRP) — Rouiada Abbas,
author/maintainer; hello@vacationrentalprotocol.com

**Canonical context:** https://vacationrentalprotocol.com/contexts/v1

**Repository:** https://github.com/HemmaBo-se/vrp-spec

#### 1. Scope

VRP defines the well-known URI suffix **`vacation-rental.json`** (RFC 8615).
A client that already knows a host's domain issues a single request:

```
GET https://{host}/.well-known/vacation-rental.json
```

to discover, in one site-wide document, that the origin is a bookable
vacation-rental node and how to interact with it. The model mirrors OpenID
Connect discovery (`/.well-known/openid-configuration`): probe one URL, receive
a structured configuration, with no per-host hard-coding.

- Applicable scheme(s): **`https` only**.
- Media type: **`application/json`**.
- **One origin per node.** Each property is its own host-owned origin, so the
  document describes the whole site — the site-wide case RFC 8615 is intended
  for. There is no multi-publisher / shared-host concern.

#### 2. The name

`vacation-rental.json` is the **descriptive discovery document** for a VRP node:
it names the resource (a vacation-rental node's site-wide configuration), and it
is the suffix the core VRP specification ([`v0.1.md`](https://vacationrentalprotocol.com/spec/v0.1) §2) defines and
that the reference implementation and verifier fetch in practice. It is
registered by the Vacation Rental Protocol — the standard that defines it — as a
descriptive resource name (cf. `security.txt`, `assetlinks.json`), not a generic
land-grab.

For transition compatibility a node MAY additionally serve the same document at
the longer alias `/.well-known/vacation-rental-protocol.json`; clients
**SHOULD** use `vacation-rental.json`. Node identity is additionally published
at the already-registered `did.json` (`did:web`), whose DID document advertises
this resource via a `service` entry.

#### 3. Resource format (informative)

The resource is a self-describing JSON object, versioned by `$schema` and
`schema_version`. Discovery-relevant fields include:

- `protocol`, `protocol_version` — identifies the document as VRP and its version.
- `canonical_domain`, `node_id` — the node's canonical host and stable identifier.
- `identity` / `did` — the node's `did:web` identity (see `/.well-known/did.json`).
- `jwks_url` — public keys (JWKS) used to verify signed artifacts.
- `verified_stay_offer_endpoint` — where a signed, verifiable stay offer is obtained.
- `capabilities`, `endpoints` — supported operations and their URLs.
- `availability`, `pricing`, `policies`, `media` — structured, public property facts.
- `structure_declarations` — falsifiable commercial-structure claims, each
  carrying its own class and verification procedure (see
  [`structure-declarations-v0.1.md`](https://vacationrentalprotocol.com/spec/structure-declarations-v0.1)). Like
  every other field here, declarations gain no authority from this location
  (§4): verifiable-class claims are trusted by executing their procedures.

Clients **MUST** ignore unknown fields and **MUST** treat the document as
advisory metadata only (see §4).

#### 4. Trust model (normative)

**Trust is not derived from the well-known location**; its presence confers no
authority. Authoritative offers are **Ed25519-signed on the host's own domain**
and verify standalone against the node's published keys (`jwks_url` / `did:web`),
independent of any central party. An **optional** public append-only Merkle
transparency log (RFC 6962; see
https://vacationrentalprotocol.com/spec/transparency-log-v0.1)
records signed-artifact hashes so that after-the-fact tampering is detectable. A
client **SHOULD** verify signatures; it **MUST NOT** treat the discovery document
itself as proof of any claim.

#### 5. Security & privacy considerations

- Served over `https` only.
- The document is public, machine-readable metadata; it **MUST NOT** contain
  guest personal data or secrets.
- Verification keys are published separately (`jwks_url`, `did:web`); key
  rotation is handled there, not in this document.

#### 6. Reference implementation

HemmaBo (https://hemmabo.com) is the reference implementation. Live example:

```
curl https://villaakerlyckan.se/.well-known/vacation-rental.json
```

The same document is also served at the alias path
`/.well-known/vacation-rental-protocol.json` for transition; new clients
**SHOULD** use `vacation-rental.json`.

#### 7. IANA considerations

This document is the specification reference for the **provisional** registration
of the `vacation-rental.json` well-known URI suffix in the IANA Well-Known
URIs registry (RFC 8615). Registration request:
https://github.com/protocol-registries/well-known-uris/issues/93 (being aligned
to this suffix).

- **URI suffix:** `vacation-rental.json`
- **Change controller:** Vacation Rental Protocol (VRP) — Rouiada Abbas;
  hello@vacationrentalprotocol.com
- **Status:** provisional
- **Specification document:** this page.

#### License

Specification text: dedicated to the public domain under [CC0 1.0](https://github.com/HemmaBo-se/vrp-spec/blob/main/LICENSE). Reference code and conformance test vectors: [Apache-2.0](https://github.com/HemmaBo-se/vrp-spec/blob/main/LICENSE-CODE) (ADR 0010 D7).

========================================================================
## 4. StayIntent open discovery v0.1

*Canonical source: <https://vacationrentalprotocol.com/spec/stayintent-discovery-v0.1>*
========================================================================

### VRP StayIntent Discovery v0.1

**Status:** Public draft
**Date:** 2026-06-16
**Builds on:** VRP [v0.1](https://vacationrentalprotocol.com/spec/v0.1) (per-node discovery, `canonical_domain`,
signed offers), [attestations-v0.1](https://vacationrentalprotocol.com/spec/attestations-v0.1) (did:web).

#### 1. Purpose

VRP v0.1 specifies how a **known** host-owned node publishes its facts and signs
offers. It deliberately does **not** specify how an agent *finds* which node
matches a natural request ("villa near Lund, dog, hot tub, 6 guests"). v0.1 §1
states verification MUST NOT require *"a central discovery index"*.

StayIntent Discovery fills that gap **without** a central index. It defines an
open, **federatable** query/response contract for verifiable hospitality
discovery: a deterministic capability+geo match that returns **non-authoritative
pointers** to host nodes, where authority is established only by verifying the
node's own Ed25519 signed offer at its `canonical_domain`.

This is the DNS model, not a catalog: anyone may run a StayIntent index; multiple
indexes coexist; HemmaBo runs a **reference implementation**, not the index.

#### 2. No-gatekeeper mechanism (normative)

- A StayIntent **index response is non-authoritative.** It MAY only return
  pointers (a node's `canonical_domain` + its VRP discovery endpoints +
  verifiable trust facts). It MUST NOT be required to verify or book.
- **Authority lives at the node.** An agent establishes truth by fetching the
  node's signed `verified_stay_offer` and verifying its Ed25519 signature against
  the node's `jwks_url` / `did:web` document (VRP v0.1 §3). An index that lies or
  omits can be detected and routed around — it cannot forge a node's signature.
- **No index is privileged.** Any operator MAY run an index over the same nodes;
  responses are independently verifiable regardless of which index answered.
  Conformance MUST NOT depend on a specific index or operator.

#### 3. StayIntent query (`stayintent-query-v0.1`)

A deterministic, structured intent — capability + geo + dates + guests:

```json
{
  "protocol": "vrp-stayintent",
  "protocol_version": "0.1",
  "geo": { "near_wikidata": "Q2167", "radius_km": 15 },
  "capabilities": ["pets_allowed", "hot_tub"],
  "dates": { "check_in": "2026-11-14", "check_out": "2026-11-16" },
  "guests": 6
}
```

- `geo` MUST use Wikidata QID (`near_wikidata`) and/or `{lat, lng, radius_km}`.
  No bespoke geo ontology — adopt Wikidata + OSM.
- `capabilities` are codes aliased to schema.org / OTA HAC (see §7); unknown codes
  are ignored, never an error.
- The query is **deterministic**: the same query MUST yield the same match set
  (subject to live availability). No free-text NL is required at this layer.

#### 4. StayIntent response (`stayintent-response-v0.1`)

```json
{
  "protocol": "vrp-stayintent",
  "protocol_version": "0.1",
  "match": "yes",
  "nodes": [
    {
      "canonical_domain": "villaakerlyckan.se",
      "discovery": "https://villaakerlyckan.se/.well-known/vacation-rental.json",
      "jwks_url": "https://villaakerlyckan.se/.well-known/jwks.json",
      "verified_stay_offer_endpoint": "https://villaakerlyckan.se/api/verified-stay-offer",
      "trust_summary": {
        "did_web_resolved": true,
        "jwks_ed25519": true,
        "signed_offer_capable": true,
        "federation_member": true,
        "attestation_refs": ["vrp/attestations/v0.1/bundle.json"]
      }
    }
  ],
  "note": "Not ranked. Deterministic match. Verify each node's signed offer (Ed25519) before quoting price or booking."
}
```

##### 4.1 Pricelessness (normative)
A StayIntent response MUST NOT contain a price, total, availability total, or any
monetary value. **Price exists only inside the node's signed offer.** This keeps
the index from becoming a price-oracle or OTA-light, and keeps the authoritative
total cryptographically bound to the node.

##### 4.2 Order is non-normative
`nodes[]` order carries NO meaning. A conformant index MUST NOT rank, score, or
imply "best". (Implementations that sort internally, e.g. by domain, MUST NOT
present order as a recommendation.)

##### 4.3 `trust_summary` = verifiable facts only (normative)
`trust_summary` MUST contain only **independently verifiable boolean facts or
references** — e.g. `did_web_resolved`, `jwks_ed25519`, `signed_offer_capable`,
`federation_member`, `federation_jws_valid`, `offer_fresh`, `attestation_refs`.
It MUST NOT contain editorial scores, ratings, confidence values, or any number
an agent could read as a ranking signal. Every field MUST be reproducible by the
agent fetching the node directly.

#### 5. Verification (how an agent uses a response)

1. Treat the response as **pointers only**.
2. For each node: fetch `verified_stay_offer_endpoint` for the dates/guests;
   verify the offer's Ed25519 signature against `jwks_url` (and/or the `did:web`
   document). VRP v0.1 §3.
3. Read price, availability, and `direct_booking_url` **only** from the verified
   signed offer. Per VRP v0.1 §5.1, `direct_booking_url` MUST be on the node's
   `canonical_domain` — never an OTA, never the index, never HemmaBo.
4. **found ≠ bookable.** A node appearing in a StayIntent response means it
   *matched the intent*, not that it is bookable. Bookability requires a fresh,
   signature-valid offer with availability.

#### 6. Pricelessness + no-ranking rationale

These two rules (no price in §4.1, no ranking in §4.2/§4.3) are what keep
StayIntent a **trust-discovery** contract and not a marketplace. An index that
adds price or ranking has rebuilt the OTA it replaces.

#### 7. Capability ontology (alias, do not reinvent)

`capabilities` codes are aliases over existing vocabularies:
- schema.org `LocationFeatureSpecification` names,
- OTA OpenTravel Hotel Amenity Codes (HAC) where a mapping exists,
- (future) the UCP hospitality namespace when published.

The alias table is maintained in the reference implementation
(`AMENITY_SCHEMA_MAP`), not redefined here. Geo uses Wikidata QID + OSM.

#### 8. Conformance

- **Positive vector** (`examples/conformance/stayintent/positive.v0.1.json`):
  a query (Lund 15 km, pets, hot_tub, 6 guests) → a response with the reference
  node, whose signed offer then verifies (Ed25519).
- **Negative vector** (`.../no-match.v0.1.json`): a query that matches nothing →
  `match: "no"`, empty `nodes`. (Mirrors VRP's failure-mode fixtures.)
- **Reference verifier** (`scripts/verify-stayintent.mjs`): independently checks a
  response shape + that a pointed node's offer verifies — anyone can run it.
- **Reference implementation:** the deterministic capability+geo filter
  (HemmaBo `api/search-properties.ts`, pure DB, no LLM) is the normative conformant
  surface. HemmaBo's free-text `api/federation/search` (LLM upstream) is a
  **non-normative** convenience layer and is NOT the StayIntent contract until its
  upstream is deterministic.

#### 9. Relationship to UCP / A2A

StayIntent is a **verifiable discovery overlay** that sits *on top of* transport
standards (UCP, MCP, A2A), not against them. UCP/MCP carry the request; StayIntent
defines the verifiable, no-gatekeeper hospitality-discovery semantics + the
Ed25519 trust binding that those transports do not specify.

#### References
- VRP [v0.1](https://vacationrentalprotocol.com/spec/v0.1) §1 (no central discovery index), §3 (signatures), §5.1
  (`direct_booking_url` on `canonical_domain`)
- [attestations-v0.1](https://vacationrentalprotocol.com/spec/attestations-v0.1) (did:web), [transparency-log-v0.1](https://vacationrentalprotocol.com/spec/transparency-log-v0.1)
- W3C VC / did:web; schema.org; Wikidata; OpenTravel HAC; UCP (transport)

#### License

Specification text: dedicated to the public domain under [CC0 1.0](https://github.com/HemmaBo-se/vrp-spec/blob/main/LICENSE). Reference code and conformance test vectors: [Apache-2.0](https://github.com/HemmaBo-se/vrp-spec/blob/main/LICENSE-CODE) (ADR 0010 D7).

========================================================================
## 5. Node structure declarations v0.1

*Canonical source: <https://vacationrentalprotocol.com/spec/structure-declarations-v0.1>*
========================================================================

### VRP Node Structure Declarations — Specification v0.1

**Status:** Public draft
**Published:** 2026-07-04
**Canonical URL:** https://vacationrentalprotocol.com/spec/structure-declarations-v0.1
**Repository:** https://github.com/HemmaBo-se/vrp-spec

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are to be
interpreted as described in RFC 2119.

#### 1. Scope

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

#### 2. Location

Structure declarations are published as the OPTIONAL top-level object
`structure_declarations` in the node's discovery document
`/.well-known/vacation-rental.json` (see the
[Well-Known URI specification](https://vacationrentalprotocol.com/spec/well-known-uri-v0.1) §3).

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
  attestation ([Portable Attestations](https://vacationrentalprotocol.com/spec/attestations-v0.1)) so the word is
  at least bound to the node's `did:web` identity; either way it MUST be
  presented as the node's own statement, never as a verified fact (§4).

#### 3. Field definitions

`structure_declarations` is a JSON object. Each member maps a **declaration
key** (§6) to a **declaration object** with exactly these members:

- `value` (REQUIRED) — the claim's answer. It MUST be a JSON boolean, number,
  or string. The set of admissible values for each registered key is defined
  below; extension keys define their own.
- `class` (REQUIRED) — one of `verifiable`, `attested`, `reputational` (§4).
- `verify` (REQUIRED) — the verification procedure (§5).

Clients MUST ignore unknown members of a declaration object.

##### 3.1 Registered declaration keys (v0.1)

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
as attested claims, [Portable Attestations](https://vacationrentalprotocol.com/spec/attestations-v0.1) §5).

#### 4. Three-class taxonomy (normative)

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

#### 5. Verification procedures (v0.1: prose)

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

#### 6. Extensibility and naming discipline

Extension keys follow the claim-key discipline of
[Portable Attestations](https://vacationrentalprotocol.com/spec/attestations-v0.1) §5, adapted to typed values:

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
  policies, [Portable Attestations](https://vacationrentalprotocol.com/spec/attestations-v0.1) §5): an extension
  key MUST NOT restate a property-level claim, and property-level claim keys
  MUST NOT be mirrored here.
- Clients MUST ignore declaration keys they do not recognize.

#### 7. Verifier presentation

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

#### 8. Reference

Villa Åkerlyckan (villaakerlyckan.se) is the intended first live node for
structure declarations. Publication on the node and the in-browser verifier
extension are implementation steps tracked separately (issue #60, scope items
3–4); this document intentionally precedes them.

#### License

Specification text: dedicated to the public domain under [CC0 1.0](https://github.com/HemmaBo-se/vrp-spec/blob/main/LICENSE). Reference code and conformance test vectors: [Apache-2.0](https://github.com/HemmaBo-se/vrp-spec/blob/main/LICENSE-CODE) (ADR 0010 D7).

========================================================================
## 6. Portable attestations v0.1

*Canonical source: <https://vacationrentalprotocol.com/spec/attestations-v0.1>*
========================================================================

### VRP Portable Attestations - Specification v0.1

**Status:** Public draft

**Published:** 2026-05-31

**Canonical context:** https://vacationrentalprotocol.com/contexts/v1

**Repository:** https://github.com/HemmaBo-se/vrp-spec

#### 1. Scope

VRP Portable Attestations v0.1 defines privacy-minimized Verifiable Credentials for portable trust history around VRP host nodes, payment paths, policy snapshots, and optionally verified stays.

Core VRP proves that a concrete offer is real. Portable attestations prove selected trust history without making HemmaBo, or any other operator, the authority over truth.

This specification is an open standard layer on top of VRP. It does not define runtime tools, an OTA, a marketplace, a booking intermediary, a central issuer, a central registry, a ranking engine, a trust score, or a HemmaBo certification service.

VRP Portable Attestations v0.1 are intentionally no-gatekeeper. A verifier MAY apply its own trust policy, but the specification MUST NOT require a VRP-operated trusted issuer registry, HemmaBo approval, host accreditation program, certification company, or central discovery index before an attestation can be verified.

#### 2. References

Portable Attestations v0.1 uses:

- W3C Verifiable Credentials Data Model 2.0: https://www.w3.org/TR/vc-data-model/
- W3C Securing Verifiable Credentials using JOSE and COSE: https://www.w3.org/TR/vc-jose-cose/
- W3C Decentralized Identifiers (DIDs) 1.0: https://www.w3.org/TR/did-core/
- `did:web` method: https://w3c-ccg.github.io/did-method-web/
- Universal Commerce Protocol (UCP): https://ucp.dev/
- Agent Payments Protocol (AP2): https://ap2-protocol.org/
- Model Context Protocol (MCP): https://modelcontextprotocol.io/
- Agent2Agent Protocol (A2A): https://a2a-protocol.org/

VRP Portable Attestations may compose with adjacent agent-commerce standards, but does not replace them:

- UCP may handle checkout, order lifecycle, and merchant-of-record commerce flows, including lodging flows as the UCP lodging profile matures.
- AP2 may handle cryptographic payment mandates and payment authorization.
- MCP may expose future retrieval or verification behavior as tools, but v0.1 defines no runtime tools.
- A2A may carry future guest-agent and host-agent negotiation, but v0.1 defines no A2A binding.

The keywords MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are to be interpreted as described in RFC 2119 and RFC 8174 when they appear in all capitals.

#### 3. Trust Model

Each attestation is issued by the DID controlled by the host-owned domain that controls the relevant VRP node facts.

The v0.1 issuer form is:

```text
did:web:{host-domain}
```

Example:

```text
did:web:villaakerlyckan.se
```

The host-domain DID document is the trust root for attestation verification. Offer signatures and attestation signatures MAY use separate `kid` values and separate private keys as long as the verification keys are controlled by the same host-domain trust root. Implementations MUST NOT require the private key used for VRP offers to be the same private key used for VRP attestations.

For `did:web:{host-domain}`, the DID document is published at:

```text
https://{host-domain}/.well-known/did.json
```

The attestation JWS `kid` MUST be a DID URL controlled by the issuer DID. The referenced verification method SHOULD be listed in `assertionMethod` or otherwise be usable for assertion verification by the issuer DID. A host-domain DID MAY publish separate verification methods for VRP offers and VRP attestations.

Example DID document: [`did-web-document.v0.1.json`](https://github.com/HemmaBo-se/vrp-spec/blob/main/examples/attestations/did-web-document.v0.1.json).

HemmaBo may publish a reference implementation and help author this standard. HemmaBo MUST NOT be required as an issuer, registry, scorer, booking intermediary, OTA, marketplace, or trust authority for portable attestations to verify.

Self-issued host-domain attestations are appropriate only for facts controlled by the host domain, such as node metadata, discovery URLs, key identifiers, payment-path routing facts, policy hashes, and privacy-minimized stay references. v0.1 MUST NOT treat self-issued host-domain attestations as independent proof of guest identity, right-to-let, local license status, property ownership, insurance coverage, or legal compliance.

Claims that require independent evidence MAY be defined in a future VRP profile as third-party credentials. If such profiles are defined, issuer trust remains a verifier policy decision and MUST NOT require a mandatory HemmaBo or VRP trusted issuer registry.

#### 4. Credential Encoding

Portable Attestations v0.1 credentials are Verifiable Credentials conforming to the W3C Verifiable Credentials Data Model 2.0.

The unsecured credential payload MUST include:

- `@context`, including `https://www.w3.org/ns/credentials/v2`
- `@context`, including `https://vacationrentalprotocol.com/contexts/v1`
- `type`, including `VerifiableCredential` and one VRP credential type
- `issuer`, using the host-domain DID
- `iat`, as the registered JWT signing-time claim
- `validFrom`
- `validUntil`
- `credentialSubject`

The VRP context defines VRP extension terms only. It does not replace the W3C VC v2 context. Implementations MUST NOT omit `https://www.w3.org/ns/credentials/v2` when using `https://vacationrentalprotocol.com/contexts/v1`.

The unsecured credential payload MUST NOT include:

- `proof`
- `signature`
- `issuedAt`

The compact JWS payload MUST include the registered JWT `iat` claim. The `iat` claim represents the signing time of the JWS envelope. It is distinct from `validFrom` and `validUntil`, which define the validity period of the credential data.

The compact JWS protected header MUST include:

```json
{
  "typ": "vc+jwt",
  "alg": "EdDSA",
  "kid": "did:web:example-host.invalid#attestations-ed25519-2026-05"
}
```

The `kid` MUST identify an Ed25519 verification key controlled by the credential issuer DID. `alg` MUST be `EdDSA`.

The `kid` SHOULD be purpose-specific enough to support key rotation and separation, for example `#attestations-ed25519-2026-05`. A verifier MUST NOT infer a trust score, certification level, or HemmaBo approval from a `kid` value.

The compact JWS envelope is the signature:

```text
BASE64URL(UTF8(protected-header)) "." BASE64URL(UTF8(payload)) "." BASE64URL(signature)
```

Credential JSON MUST NOT duplicate that signature with a `signature` or `proof` property.

#### 5. Credential Types

##### 5.1 VRPHostDomainCredential

`VRPHostDomainCredential` attests host-domain VRP node facts, such as canonical domain, discovery URL, JWKS URL, and supported VRP protocol version.

The `credentialSubject` SHOULD identify the host-domain DID and SHOULD include:

- `type`: `VRPHostDomain`
- `canonicalDomain`
- `vrpDiscoveryUrl`
- `jwksUrl`
- `protocol`
- `protocolVersion`
- `domainControlAttested`

This credential does not make the issuer a central certifier of other nodes. It is a portable statement by the host-domain DID about its own node facts.

##### 5.2 VRPPaymentPathCredential

`VRPPaymentPathCredential` attests payment path facts for a host-domain direct booking flow. It is about routing and control of the payment path, not guest payment outcomes.

The `credentialSubject` SHOULD include:

- `type`: `VRPPaymentPath`
- `canonicalDomain`
- `paymentProcessor`
- `checkoutDomain`
- `directBookingDomain`
- `merchantOfRecord`
- `paymentFactsSource`

This credential MUST NOT include guest identity, booking identity, card data, payment status, refunds, disputes, risk scores, or guest outcomes.

##### 5.3 VRPPolicySnapshotCredential

`VRPPolicySnapshotCredential` attests a privacy-minimized snapshot of host-domain policies. It is intended to preserve policy provenance without embedding guest data.

The `credentialSubject` SHOULD include:

- `type`: `VRPPolicySnapshot`
- `canonicalDomain`
- `policyRef`
- `policyUrl`
- `policyHash`
- `policyVersion`
- `appliesTo`

The policy hash SHOULD be computed over the canonical policy artifact or an explicitly documented canonicalization of it. A verifier MUST NOT treat a policy snapshot as proof of a guest-specific outcome.

##### 5.4 VRPVerifiedStayCredential

`VRPVerifiedStayCredential` is OPTIONAL in v0.1. If used, it attests that a stay reference is linked to a previously verified VRP offer without identifying the guest.

The `credentialSubject` SHOULD include:

- `type`: `VRPVerifiedStay`
- `stayRef`
- `verifiedOfferHash`
- `coarseStayPeriod`, if a period is included
- `canonicalDomain`
- `propertyRef`, only when it does not identify the guest

`VRPVerifiedStayCredential` MUST NOT include:

- guest name
- guest email
- guest phone number
- guest DID
- payment instrument
- exact stay dates when they could identify a guest
- check-in or check-out timestamps
- review text
- guest outcome
- guest risk
- guest score
- guest history

`stayRef` MUST be opaque and non-reversible. `verifiedOfferHash` SHOULD be the SHA-256 hash of the exact compact JWS string for the verified stay offer that was used for the stay, encoded as `sha256:{hex}` or `sha256:{base64url}`.

Issuers SHOULD omit `coarseStayPeriod` when month-level or season-level disclosure could identify the guest. Guest-held credentials, reviews, and selective disclosure are deferred to v0.2.

##### 5.5 VRPPropertyAttestedClaimsCredential

`VRPPropertyAttestedClaimsCredential` attests a host-signed, tri-state manifest of per-property claims — amenities and policies the host affirms or negates. Its purpose is to let an agent rely on a host-domain fact, including a **negation**, with the same confidence as an affirmation. A negation an OTA cannot publish on the host's behalf ("cats are not allowed") is as actionable to an agent as a yes.

**Scope.** This credential proves **host attestation and integrity** — that the host domain asserted these claims and that the manifest is tamper-evident under the issuer's key. It does not prove third-party-verified truth. As with every VRP attestation, no operator is the authority over truth; a verifier applies its own trust policy (§3).

The `credentialSubject` SHOULD include:

- `type`: `VRPPropertyClaimsManifest`
- `canonicalDomain`
- `appliesTo`, carrying the `propertyRef` the manifest describes
- `claims`: an array of claim objects

Each entry in `claims` MUST include:

- `claim`: an opaque claim key. It MUST match `^[a-z][a-z0-9_]*$` (lowercase snake_case) and MUST name the amenity or policy affirmatively (see **Polarity** below). Nodes SHOULD use keys from the (non-normative) VRP amenity/policy key registry when one exists for the property, and MAY mint their own key for a property the registry does not cover.
- `state`: either `affirmed` (the host asserts the claim is true) or `negated` (the host asserts the claim is false).

**Polarity.** A claim key MUST name the property or policy affirmatively; the `state` field alone carries polarity. Keys that encode a negation in the name MUST NOT be used — for example a `no_`/`not_` prefix, `_not_` anywhere (such as `pets_not_allowed`), or a `_forbidden`/`_prohibited`/`_banned`/`_disallowed` suffix. Assert `pets_cats` with `state: negated`, never `no_cats`, `pets_not_allowed`, or `cats_forbidden`. The schema and conformance verifier reject these forms as a best-effort guard; the normative requirement is affirmative naming, which a pattern cannot fully enumerate. This keeps `affirmed`/`negated` the single source of polarity so two nodes' manifests stay comparable (the reason to federate at all).

Each entry MAY include:

- `verified_at`: an ISO 8601 calendar date (`YYYY-MM-DD`) on which the host last attested this specific claim. When the host has not attested the claim, `verified_at` MUST be omitted — it MUST NOT be present as `null`. It is distinct from the credential's `validFrom`/`validUntil`, which bound the signature's validity.

**Tri-state semantics.** A claim key present with `state: affirmed` is Affirmed. A claim key present with `state: negated` is Negated. A claim key **absent** from `claims` is Unknown: a verifier MUST NOT infer it as either true or false. Unknown is never encoded as a stored value.

**Uniqueness.** A `claims` array MUST NOT contain the same `claim` key more than once. A verifier that encounters a duplicate key MUST treat the manifest as malformed.

**Supersession.** When an issuer publishes more than one `VRPPropertyAttestedClaimsCredential` for the same `appliesTo.propertyRef`, the manifest with the latest `validFrom` governs, and a verifier MUST prefer it. Issuers SHOULD revoke superseded manifests through the status list (§6) so a stale manifest cannot be replayed as current.

The credential is signed and verified exactly as every other VRP portable attestation (§3, §4, §8): a compact Ed25519 JWS whose protected header carries `typ: "vc+jwt"`, `alg: "EdDSA"`, and a `kid` resolving to an assertion key in the issuer's `did:web` document. A verifier MUST verify the signature over the compact-JWS bytes as received and MUST NOT re-canonicalize the payload.

##### 5.6 VRPRegulatoryRegistrationCredential

`VRPRegulatoryRegistrationCredential` attests the node's short-term-rental
registration identifier for its jurisdiction, carried with an explicit
**evidence level** so the credential is exactly as trustworthy as the checking
that stands behind it — never more.

`credentialSubject` fields:

- `id` — the node's `did:web` identity.
- `type` — `VRPRegulatoryRegistration`.
- `canonicalDomain` — the node's canonical host.
- `registrationId` — the registration identifier as issued under the
  jurisdiction's scheme.
- `authority` (optional) — the registering authority, as declared.
- `jurisdiction` — the property's jurisdiction (country name or code).
  Jurisdiction-neutral by construction: the field is a declaration, never an
  enumeration; a node in any country carries its registration the same way.
- `evidence` — one of:
  - `self_declared` — the host provided the identifier; it has been checked
    against nothing. The subject then MUST carry a `disclaimer`, and a
    verifier MUST NOT treat the credential as independent proof of
    registration or local license status (the §3 trust model is unchanged:
    the signature proves the node *published* exactly this claim, not that a
    state agrees with it).
  - `registry_verified` — the identifier was checked against the
    jurisdiction's machine-queryable register; `verifiedAt` is then REQUIRED.
  - `state_attested` — RESERVED: the authority itself issued a credential
    for the registration (eIDAS QEAA-class). Not reachable in v0.1; listed
    so the gradient is stable when it arrives.
- `verifiedAt` (required at `registry_verified`) — when the register check
  was performed.
- `disclaimer` (required at `self_declared`).

The evidence level upgrades **in place**: the same credential shape moves
from `self_declared` to `registry_verified` when a jurisdiction's register
becomes machine-checkable, with no change for consumers. Signing never
upgrades evidence.

*(Informative: registration identifiers on listings are a legal requirement
in a growing set of jurisdictions — e.g. EU Regulation 2024/1028 as member
states bring registers online. This credential gives such an identifier a
signed, revocable, portable carrier.)*

#### 6. Status and Revocation

Portable Attestations v0.1 defines `VRPStatusListEntry` for simple status and revocation.

This specification does not claim compatibility with W3C `BitstringStatusListEntry`. If a future VRP version uses `BitstringStatusListEntry`, the status list MUST follow the W3C Bitstring Status List format completely, including the required `BitstringStatusListCredential` data model.

A credential MAY include `credentialStatus`:

```json
{
  "id": "https://example-host.invalid/.well-known/vrp/status/attestations-v0.1.json#host-domain-2026-05",
  "type": "VRPStatusListEntry",
  "statusPurpose": "revocation",
  "statusListUrl": "https://example-host.invalid/.well-known/vrp/status/attestations-v0.1.json",
  "statusRef": "host-domain-2026-05"
}
```

For `VRPStatusListEntry`:

- `type` MUST be `VRPStatusListEntry`.
- `statusPurpose` MUST be `revocation` or `suspension`.
- `statusListUrl` MUST be an HTTPS URL controlled by the issuer host domain.
- `statusRef` MUST be opaque and unique within the referenced status list.

The status list document SHOULD use this shape:

```json
{
  "@context": ["https://vacationrentalprotocol.com/contexts/v1"],
  "type": "VRPStatusList",
  "issuer": "did:web:example-host.invalid",
  "statusPurpose": "revocation",
  "validFrom": "2026-05-31T00:00:00Z",
  "validUntil": "2026-06-30T00:00:00Z",
  "entries": [
    {
      "statusRef": "host-domain-2026-05",
      "status": "valid"
    }
  ]
}
```

If status is absent, stale, unreachable, malformed, or not controlled by the issuer host domain, verifiers MUST treat the credential status as unknown. Unknown status MUST NOT be converted into either revoked or not revoked.

#### 7. Bundles

A VRP attestation bundle is a transport container for one or more compact JWS credentials. A bundle does not create trust by itself.

Bundle entries SHOULD include:

- `type`
- `mediaType`: `application/vc+jwt`
- `compactJws`

Bundle entries MUST NOT require a HemmaBo endpoint or registry. Future retrieval mechanisms may be defined later, but this v0.1 specification does not define MCP tools or new runtime endpoints.

If future MCP tools are specified, their names SHOULD use `snake_case`, such as:

- `verify_vrp_attestations`
- `get_vrp_attestation_bundle`

The following names are out of scope for VRP Portable Attestations:

- `issue_certificate`
- `hemmabo_trust_score`
- `vrp.attestations.verify`

#### 8. Verification

A verifier of a v0.1 portable attestation MUST:

1. Decode the compact JWS protected header and payload.
2. Confirm `typ` is `vc+jwt`.
3. Confirm `alg` is `EdDSA`.
4. Resolve the issuer DID from the credential `issuer`.
5. Confirm the `kid` identifies an Ed25519 verification key controlled by that issuer DID.
6. Verify the compact JWS signature.
7. Confirm the credential includes the W3C VC v2 context and the VRP v1 context.
8. Confirm the credential type is one of the v0.1 VRP credential types.
9. Confirm `validFrom` and `validUntil` are present and current.
10. Confirm there is no `proof`, `signature`, or `issuedAt` property in the credential JSON.
11. Apply the privacy rules for the credential type.
12. Resolve and check `credentialStatus` when present.

Attestations do not replace core VRP offer verification. A valid attestation MUST NOT make an unsigned, expired, unavailable, inexact, or non-quoteable VRP offer safe to quote.

#### 9. Privacy and GDPR

Portable Attestations v0.1 uses data minimization as a protocol requirement.

Credentials MUST NOT publish guest reviews, guest outcomes, guest risk, guest scores, or guest history.

Credentials MUST NOT include direct guest identifiers such as name, email address, phone number, payment instrument, guest DID, or exact stay dates that can identify the guest.

`VRPVerifiedStayCredential`, if used, MUST use `stayRef`, `verifiedOfferHash`, and at most a coarse non-identifying period such as a month or season. Issuers SHOULD omit the period when it could identify the guest.

Guest-held credentials and reviews are out of scope for v0.1 and are deferred to v0.2, where selective disclosure such as SD-JWT can be evaluated.

#### 10. Machine-Readable Schema

The JSON Schema profile for v0.1 examples and payload artifacts is:

```text
https://vacationrentalprotocol.com/schemas/attestations-v0.1.schema.json
```

Repository copy: [`schemas/attestations-v0.1.schema.json`](https://github.com/HemmaBo-se/vrp-spec/blob/main/schemas/attestations-v0.1.schema.json).

The schema is an interoperability aid. It does not create a central validator, registry, issuer service, certification service, marketplace, OTA, booking intermediary, or trust authority.

#### 11. Examples

Example files are in [`examples/attestations`](https://github.com/HemmaBo-se/vrp-spec/tree/main/examples/attestations):

- `did-web-document.v0.1.json`
- `jws-header.ed25519.v0.1.json`
- `host-domain-credential.payload.v0.1.json`
- `payment-path-credential.payload.v0.1.json`
- `policy-snapshot-credential.payload.v0.1.json`
- `verified-stay-credential.payload.v0.1.json`
- `regulatory-registration-credential.payload.v0.1.json`
- `status-list.v0.1.json`
- `attestation-bundle.v0.1.json`

The payload examples are unsigned JWS payload examples. Production credentials are compact JWS envelopes over those payloads.

The `did-web-document.v0.1.json` and `attestation-bundle.v0.1.json` files in
`examples/attestations/` are **illustrative only**: their public key `x` value
and their `compactJws` values are non-cryptographic placeholders (`<…>`) that
show the document shape. They MUST NOT be used to validate the attestation
layer.

A **real, verifiable** Ed25519 / compact-JWS vector — an issuer `did:web`
document with a genuine verification key and a signed attestation bundle whose
`compactJws` values verify against it — is in
[`examples/conformance/attestations/`](https://github.com/HemmaBo-se/vrp-spec/tree/main/examples/conformance/attestations).
That vector is checked on every run by `npm test` (see step 8 verification
above); it uses a documented throwaway test key for the reserved
`example-host.invalid` domain and MUST NOT be used by any production node.

#### 12. License

Specification text: dedicated to the public domain under [CC0 1.0](https://github.com/HemmaBo-se/vrp-spec/blob/main/LICENSE). Reference code and conformance test vectors: [Apache-2.0](https://github.com/HemmaBo-se/vrp-spec/blob/main/LICENSE-CODE) (ADR 0010 D7).

========================================================================
## 7. Attestation status (Bitstring Status List) v0.1

*Canonical source: <https://vacationrentalprotocol.com/spec/attestation-status-bitstring-v0.1>*
========================================================================

### VRP Attestation Status — W3C Bitstring Status List binding v0.1

**Status:** Public draft
**Date:** 2026-06-16

#### 1. Purpose

This document profiles the [W3C Bitstring Status List v1.0](https://www.w3.org/TR/vc-bitstring-status-list/)
as the standards-conformant status and revocation mechanism for VRP Portable
Attestations. It fulfils the forward hook in [attestations-v0.1](https://vacationrentalprotocol.com/spec/attestations-v0.1)
§6, which states that *"if a future VRP version uses `BitstringStatusListEntry`,
the status list MUST follow the W3C Bitstring Status List format completely."*

It does not introduce a new VRP status format. It **binds** VRP to the W3C
standard, constraining only: the issuer (a `did:web` host domain), the signature
(Ed25519, the same key family as VRP signed offers and attestations), the
unknown-status fail-safe, the no-guest-data rule, and the credential layer it
applies to.

#### 2. Scope — attestations only, not stay offers

This mechanism applies to **long-lived credentials**: VRP Portable Attestations.

It MUST NOT be applied to the signed verified stay offer (vrp-spec [v0.1](https://vacationrentalprotocol.com/spec/v0.1)).
A stay offer is ephemeral — it carries a short `valid_until` and is invalidated
by **expiry**, not by a status list. Revocation infrastructure for a 15-minute
credential is unnecessary and MUST NOT be required.

#### 3. `credentialStatus` in an attestation

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

#### 4. The status list credential

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

#### 5. Verification

A verifier:

1. Resolves `statusListCredential` and verifies its signature against the issuer
   `did:web` JWKS.
2. Decodes `encodedList` (multibase → GZIP-inflate → bitstring) and reads the bit
   at `statusListIndex`.
3. For `statusPurpose: revocation`, a set bit (1) means **revoked**; for
   `suspension`, a set bit means **suspended**.

**Unknown-status fail-safe (carried from [attestations-v0.1](https://vacationrentalprotocol.com/spec/attestations-v0.1) §6):**
if the status list is absent, stale, unreachable, malformed, unsigned, or not
controlled by the issuer host domain, the verifier MUST treat the credential
status as **unknown**. Unknown status MUST NOT be converted into either revoked
or not-revoked.

#### 6. No-gatekeeper and privacy

- **Optional and additive.** A VRP attestation verifies standalone (`did:web` +
  signature). A status check is an additional layer and MUST NOT be a
  precondition for the protocol or a gate operated by any central party.
- **Privacy.** The bitstring discloses only revoked/not-revoked per index. The
  ≥16 KB herd minimum means one fetch covers many credentials and the issuer
  does not learn which credential a verifier checked. The status list MUST NOT
  contain guest identity, booking identity, or any guest data.

#### 7. Relationship to the transparency log

A status list is **mutable by design** — revocation flips a bit. This is
**complementary to, not in conflict with**, the append-only
[transparency log](https://vacationrentalprotocol.com/spec/transparency-log-v0.1):

- **Transparency log** — append-only, tamper-evident record that a credential *was issued*
  (append-only, tamper-evident).
- **Status list** — current, mutable record of whether a credential *is still
  valid* (revocation/suspension).

This mirrors the web PKI model (append-only Certificate Transparency logs
alongside CRL/OCSP revocation). The two layers answer different questions and
both are optional and host-operated.

#### 8. Migration from `VRPStatusListEntry`

[attestations-v0.1](https://vacationrentalprotocol.com/spec/attestations-v0.1) §6 defines an interim
`VRPStatusListEntry` / `VRPStatusList` shape. Issuers adopting this profile:

- SHOULD migrate `credentialStatus` from `VRPStatusListEntry` to
  `BitstringStatusListEntry`.
- MAY serve both during transition (the legacy `VRPStatusList` JSON and the
  `BitstringStatusListCredential`).
- Verifiers SHOULD prefer `BitstringStatusListEntry` when present.

#### 9. Conformance

Implementations MUST follow [W3C Bitstring Status List v1.0](https://www.w3.org/TR/vc-bitstring-status-list/)
completely for the entry and credential data model and the `encodedList`
encoding. This profile only adds the VRP constraints in §§3–6 (issuer =
`did:web` host domain; Ed25519 signature; unknown-status fail-safe; no guest
data; attestations-only scope).

#### References

- [W3C Bitstring Status List v1.0](https://www.w3.org/TR/vc-bitstring-status-list/)
- [W3C Verifiable Credentials Data Model v2.0](https://www.w3.org/TR/vc-data-model-2.0/)
- VRP Portable Attestations: [attestations-v0.1](https://vacationrentalprotocol.com/spec/attestations-v0.1) (§6 Status and Revocation)
- VRP Transparency Log: [transparency-log-v0.1](https://vacationrentalprotocol.com/spec/transparency-log-v0.1)
- VRP core: [v0.1](https://vacationrentalprotocol.com/spec/v0.1)

#### License

Specification text: dedicated to the public domain under [CC0 1.0](https://github.com/HemmaBo-se/vrp-spec/blob/main/LICENSE). Reference code and conformance test vectors: [Apache-2.0](https://github.com/HemmaBo-se/vrp-spec/blob/main/LICENSE-CODE) (ADR 0010 D7).

========================================================================
## 8. Transparency log v0.1

*Canonical source: <https://vacationrentalprotocol.com/spec/transparency-log-v0.1>*
========================================================================

### VRP Transparency Log — Specification v0.1

**Status:** Draft (pre-publication)

**Published:** 2026-06-13

**Updated:** 2026-07-04 — receipt leaves (`vrp_receipt`), leaf hashing rule,
operator key discovery, STH archival, node read-through proxy, honest
guarantee wording (issue #60-adjacent; per-booking inclusion proofs)

**Canonical context:** https://vacationrentalprotocol.com/contexts/v1

**Repository:** https://github.com/HemmaBo-se/vrp-spec

#### 1. Scope

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

#### 2. References

VRP Transparency Log v0.1 adapts established, proven transparency patterns:

- Certificate Transparency: RFC 6962 and RFC 9162 (CT 2.0): https://www.rfc-editor.org/rfc/rfc9162
- Sigstore / Rekor transparency log: https://docs.sigstore.dev/logging/overview/
- W3C Verifiable Credentials Data Model 2.0: https://www.w3.org/TR/vc-data-model/
- W3C Decentralized Identifiers (DIDs) 1.0: https://www.w3.org/TR/did-core/
- `did:web` method: https://w3c-ccg.github.io/did-method-web/

It composes with the existing VRP layers:

- [VRP v0.1 wire contract](https://vacationrentalprotocol.com/spec/v0.1) — the signed verified stay offer.
- [VRP Portable Attestations v0.1](https://vacationrentalprotocol.com/spec/attestations-v0.1) — the credentials
  whose history this log makes auditable.

#### 3. Design Principles (no-gatekeeper)

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

#### 4. Log Data Model

A VRP transparency log is a Merkle tree of leaves over VRP artifact hashes.

A log **leaf** SHOULD contain:

- `leaf_version`: `vrp-tlog-v0.1`
- `logged_at`: RFC 3339 UTC timestamp of recording
- `artifact_type`: one of `vrp_attestation`, `vrp_signed_offer`,
  `vrp_status_event`, `vrp_receipt`, `vrp_spec`
- `artifact_hash`: the SHA-256 of the **exact compact JWS string** of the
  artifact, encoded as `sha256:{hex}`

Registered artifact types:

- `vrp_attestation` — a [Portable Attestation](https://vacationrentalprotocol.com/spec/attestations-v0.1)
  credential JWS.
- `vrp_signed_offer` — a signed verified-stay-offer JWS
  ([core VRP](https://vacationrentalprotocol.com/spec/v0.1) §5).
- `vrp_status_event` — a signed status/booking event JWS (for example the
  privacy-minimized booking event of the reference implementation).
- `vrp_receipt` — the compact JWS **wrapping a VRP Receipt v1 envelope**
  ([Receipt v1](https://vacationrentalprotocol.com/spec/receipt-v1) §14). This is what makes a booking's promised
  terms provable after the fact.
- `vrp_spec` — the one non-JWS artifact type: the SHA-256 of a **published
  specification document file**, byte-exact as served, used for
  tamper-evident first-publication timestamping. The artifact is already
  public, so the file bytes are the directly re-hashable form.

A leaf MUST NOT contain the cleartext artifact, credential subject fields, or
any guest data. Only the hash of the signed envelope is logged. This preserves
the data-minimization guarantees of VRP Portable Attestations (Section 9).

##### 4.1 Leaf hashing rule (normative)

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
  bytes (see [Receipt v1](https://vacationrentalprotocol.com/spec/receipt-v1) §15).

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

#### 5. Log Identity and Keys

Each log has a `log_id` and publishes its Ed25519 public verification key. The
`log_id` SHOULD be derived from the log's key or expressed as a `did:web` of
the log's own operator domain, for example `did:web:example-log.invalid`.

STHs and entry promises MUST be signed with the log's Ed25519 key (`EdDSA`). A
verifier MUST NOT infer a trust level, certification, or HemmaBo approval from a
`log_id`.

##### 5.1 Operator key discovery

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

#### 6. Submission and Signed Entry Promise

An issuer (a host-domain DID) MAY submit an artifact hash to one or more logs.
On acceptance, a log returns a **Signed Entry Promise (SEP)** — a signed
commitment to include the entry within a stated Maximum Merge Delay (MMD),
analogous to a Certificate Transparency SCT.

An issuer MAY embed received SEPs in its
[VRP Portable Attestation](https://vacationrentalprotocol.com/spec/attestations-v0.1) bundle so that a verifier can
check the promise offline without contacting the log live. The SEP is a
promise, not a proof of final inclusion; final inclusion is confirmed against an
STH and an inclusion proof.

#### 7. Log Endpoints (proposed)

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

##### 7.1 STH archival

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

##### 7.2 Node read-through proxy (non-authoritative)

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

#### 8. Verification

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
consistency), see [Receipt v1](https://vacationrentalprotocol.com/spec/receipt-v1) §16.

##### 8.1 What a proof removes trust in — and what it does not

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

#### 9. Privacy and GDPR

Leaves contain only the SHA-256 of a signed envelope — never cleartext
credentials, credential subject fields, or guest data. The log therefore
reveals only that "an artifact with this hash was recorded at time T", never its
contents.

This layer MUST uphold every data-minimization rule of VRP Portable
Attestations v0.1 (Section 9): no guest name, email, phone number, payment
instrument, guest DID, exact identifying stay dates, reviews, outcomes, risk, or
scores may be derivable from a log entry.

#### 10. Relationship to Other VRP Layers

- The transparency log records hashes of
  [VRP Portable Attestation](https://vacationrentalprotocol.com/spec/attestations-v0.1) credentials and/or
  [signed verified-stay-offer](https://vacationrentalprotocol.com/spec/v0.1) references.
- It **complements** the attestation status list, it does not replace it. The
  status list answers "valid or revoked now"; the transparency log answers
  "here is the complete append-only history, with no silent rewrites".
- It does not change the trust root. The host-domain `did:web` remains the trust
  root for issuance; the log is an external auditor of records, never the
  issuer.

#### 11. Conformance

A future revision will publish signed conformance vectors under
`examples/conformance/log/`: a documented test log key, a signed STH, an
inclusion proof for a known leaf, and a consistency proof between two tree
sizes — verifiable the same way the attestation vectors are. For this v0.1
draft, conformance vectors are deferred.

#### 12. Non-Goals

VRP Transparency Log v0.1 is explicitly **not**:

- a central, canonical, or required log;
- an issuer, certifier, accreditor, or certification company;
- a node registry, discovery index, ranking engine, or trust score;
- a marketplace, OTA, or booking intermediary;
- a HemmaBo trust authority.

It is the decentralized, no-gatekeeper alternative to an accredited certifying
authority: verifiable, non-forgeable trust history that no single party —
including HemmaBo — can rewrite.

#### 13. License

Specification text: dedicated to the public domain under [CC0 1.0](https://github.com/HemmaBo-se/vrp-spec/blob/main/LICENSE). Reference code and conformance test vectors: [Apache-2.0](https://github.com/HemmaBo-se/vrp-spec/blob/main/LICENSE-CODE) (ADR 0010 D7).

========================================================================
## 9. VRP receipt envelope v1

*Canonical source: <https://vacationrentalprotocol.com/spec/receipt-v1>*
========================================================================

### VRP Receipt Envelope — Specification v1

**Status:** Public draft (WO-2 rev B, PR-2)

**Updated:** 2026-07-04 — §14 issuance wrapper & log anchoring, §15 delivery (verbatim rule), §16 verifier walk-through

**Published:** 2026-06-24 (revised 2026-07-04)

**Envelope version:** `1.0`

**Repository:** https://github.com/HemmaBo-se/vrp-spec

**Machine-readable schema:** [`schemas/vrp-receipt.v1.schema.json`](https://github.com/HemmaBo-se/vrp-spec/blob/main/schemas/vrp-receipt.v1.schema.json)

**Reference verifier:** [`lib/vrp-receipt.mjs`](https://github.com/HemmaBo-se/vrp-spec/blob/main/lib/vrp-receipt.mjs) (Apache-2.0; mirrors `hemmabo-mcp-server` `lib/vrp-receipt.ts`)

#### 1. Scope

VRP Receipt v1 defines a versioned **verifiable booking record**: a flat array of
signed attestations from independent trust layers (`offer`, `transport`, `payment`, …)
assembled by a host node. It composes the existing VRP signed stay offer ([`v0.1.md`](https://vacationrentalprotocol.com/spec/v0.1))
and composition profiles ([`profiles/mcp-composition-profile.md`](https://vacationrentalprotocol.com/spec/profiles/mcp-composition-profile))
without making HemmaBo or any operator a gatekeeper.

This specification is **not** a runtime tool surface, OTA, marketplace, central registry,
or booking intermediary. It does not change Portable Attestations v0.1
([`attestations-v0.1.md`](https://vacationrentalprotocol.com/spec/attestations-v0.1)) — especially not its §3 trust model.

The keywords MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are interpreted as in RFC 2119
and RFC 8174 when capitalized.

#### 2. References

- Core VRP v0.1: [`v0.1.md`](https://vacationrentalprotocol.com/spec/v0.1) — JWKS discovery (§3), signed offers (§5)
- Portable Attestations v0.1: [`attestations-v0.1.md`](https://vacationrentalprotocol.com/spec/attestations-v0.1) — `did:web` VC layer (§3–§8)
- MCP composition profile: [`profiles/mcp-composition-profile.md`](https://vacationrentalprotocol.com/spec/profiles/mcp-composition-profile) — `transport` layer (D6)
- Receipt JSON Schema: [`schemas/vrp-receipt.v1.schema.json`](https://github.com/HemmaBo-se/vrp-spec/blob/main/schemas/vrp-receipt.v1.schema.json)
- Conformance vectors: [`examples/conformance/receipt/`](https://github.com/HemmaBo-se/vrp-spec/tree/main/examples/conformance/receipt)
- ADR 0010 (reference repo): receipt envelope decisions D1–D7
- ADR 0011 (reference repo): key lifecycle K1–K6 (forward spec; §8 below)

#### 3. Envelope shape (D1)

A v1 receipt MUST be a JSON object with:

| Field | Required | Description |
| --- | --- | --- |
| `vrp_receipt_version` | MUST | Exactly `"1.0"` for v1 verifiers |
| `subject` | MUST | What the receipt is about (property, stay window, offer id — generic object) |
| `issuer` | MUST | Node identity that assembled the receipt |
| `attestations` | MUST | **Flat** array; min length 1 |

Each attestation object MUST include:

| Field | Required | Description |
| --- | --- | --- |
| `layer` | MUST | Open vocabulary string, e.g. `offer`, `transport`, `payment` |
| `valid_from` | MUST | ISO 8601 date-time (D2) |
| `valid_until` | MUST | ISO 8601 date-time (D2) |

Each attestation object MAY include:

| Field | Description |
| --- | --- |
| `source` | URL where the verifying public key is published (typically host JWKS) |
| `signature` | Compact JWS over the layer artifact (D5) |
| `ref` | Opaque correlator (offer id, transaction id, …) |
| `tlog` | Optional transparency-log inclusion proof (D3) |
| `sub_receipt` | **Reserved v2** — recursive sub-receipt; v1 verifiers MUST NOT recurse |
| `disclosure` | **Reserved v2** — selective-disclosure pointer; v1 verifiers MUST NOT interpret |

A new trust layer = a new `attestations[]` entry. No central approval is required.

#### 4. Per-attestation freshness (D2)

Every attestation MUST carry `valid_from` and `valid_until`. A v1 verifier MUST reject
an attestation whose verification time is before `valid_from` (`not_yet_valid`) or after
`valid_until` (`sig_expired`) **after** the JWS signature is validated.

Freshness is evaluated **per attestation**, not once for the whole receipt.

#### 5. Transparency log field (D3)

Each attestation MAY carry a `tlog` inclusion proof. A v1 verifier MUST:

- Treat a **missing** `tlog` as signature-only verification — not a failure.
- NOT claim log-anchored properties for an attestation without `tlog`.

Phase-5 dispute/insurance receipts that must survive key revocation MAY require `tlog`
(see §8 K4).

#### 6. Verification result and error registry (D4)

A v1 verifier MUST return **partial verification**: per-attestation status, not a single
boolean. Envelope-level fields:

| Field | Meaning |
| --- | --- |
| `receipt_valid` | Structurally valid v1 receipt (version + schema) |
| `fully_verified` | `true` only when **every** attestation has status `verified` |
| `attestations[]` | Per-layer `{ index, layer, status, error, kid }` |
| `errors[]` | Envelope-level codes when `receipt_valid` is false |

Per-attestation `status` values:

| Status | Meaning |
| --- | --- |
| `verified` | Signature valid and inside freshness window |
| `expired` | Signature valid but outside freshness window |
| `invalid` | Signature check failed (e.g. `sig_invalid`) |
| `unverifiable` | Layer present but cannot be checked (missing signature or key) |

`unverifiable` is **distinct** from `verified`. A receipt MUST NOT represent an
unverifiable layer as verified.

##### 6.1 Normative error codes (v1)

**Envelope / signature level:**

- `unsupported_version` — `vrp_receipt_version` ≠ `"1.0"`
- `malformed_receipt` — fails schema / empty `attestations[]`
- `malformed_attestation`
- `missing_validity_window`
- `sig_invalid`
- `sig_expired`
- `not_yet_valid`
- `key_unresolvable`
- `layer_unverifiable`
- `canonicalization_mismatch`

**VRP offer-layer** (reused from core offer verification):

- `agent_permission_denied`, `not_available`, `price_not_exact`, `direct_booking_url_missing`

**AP2 payment-layer** (reused from AP2 mandate verification):

- `mandate_expired`, `mandate_missing_amount`, `invalid_charge_amount`,
  `amount_exceeds_mandate`, `currency_mismatch`, `merchant_mismatch`, `cart_mismatch`

The reference verifier in [`lib/vrp-receipt.mjs`](https://github.com/HemmaBo-se/vrp-spec/blob/main/lib/vrp-receipt.mjs) implements the
envelope-level codes above for v1 receipt verification. Layer-specific offer/AP2 codes
apply when a profile-aware verifier interprets attestation payloads.

#### 7. Signature input rule (D5)

The signature MUST be verified over the **compact-JWS bytes as received**. A v1 verifier
MUST NOT re-canonicalize JSON to re-derive the signing input.

Where canonical JSON is required for **non-JWS correlators** (e.g. MCP
`arguments_sha256`), implementations MUST use JCS (RFC 8785). That canonicalization
applies only to the hash input — not to JWS verification. See
[`profiles/mcp-composition-profile.md`](https://vacationrentalprotocol.com/spec/profiles/mcp-composition-profile).

#### 8. Composition profiles (D6)

Composition profiles define how an external interaction becomes an attestation entry.
The first normative profile is MCP `transport` — see
[`profiles/mcp-composition-profile.md`](https://vacationrentalprotocol.com/spec/profiles/mcp-composition-profile).

Profiles MUST sign an **assertion about the interaction**, not unsigned transport bytes.
Additional profiles (e.g. AP2 `payment`) follow the same envelope rules.

##### 8.1 Argument key casing (cross-link #7)

For MCP transport assertions, tool-call argument keys that feed `arguments_sha256`
MUST be **`snake_case`**: `check_in`, `check_out`, `guests` — matching core VRP endpoint
parameters ([`v0.1.md`](https://vacationrentalprotocol.com/spec/v0.1) §4). This is **distinct** from camelCase booking URL
query parameters ([`v0.1.md`](https://vacationrentalprotocol.com/spec/v0.1) §5.1). Normalization before hashing is the
caller's responsibility; see the normative pin in the MCP profile.

#### 9. Key-discovery layer separation (#5)

VRP uses **two key-discovery paths**. Implementers MUST NOT conflate them:

| Layer | Artifact | Key discovery | Typical `kid` form |
| --- | --- | --- | --- |
| **Offer + receipt attestations** | Compact JWS (`offer`, `transport`, …) | Fetch `https://{host}/.well-known/jwks.json` directly ([`v0.1.md`](https://vacationrentalprotocol.com/spec/v0.1) §3) | Plain string `kid` matched against JWKS |
| **Portable Attestations (VC)** | `application/vc+jwt` credentials | Resolve issuer `did:web:{host}` → `https://{host}/.well-known/did.json` ([`attestations-v0.1.md`](https://vacationrentalprotocol.com/spec/attestations-v0.1) §3) | DID URL `kid` on verification method |

The live reference verifier for **receipt v1** resolves keys via **`attestation.source`
→ JWKS** and matches JWS `kid` — it does **not** resolve `did:web` documents for receipt
layers. Portable Attestations remain a separate verification path with their own
conformance vectors ([`examples/conformance/attestations/`](https://github.com/HemmaBo-se/vrp-spec/tree/main/examples/conformance/attestations)).

Offer signatures and attestation VC signatures MAY use separate private keys as long as
each verifying key is published under the host-domain trust root
([`attestations-v0.1.md`](https://vacationrentalprotocol.com/spec/attestations-v0.1) §3 — unchanged by this document).

#### 10. Key lifecycle — forward spec (K1–K6)

The v1 receipt verifier implements **signature + freshness only**. The following rules
are **forward spec** for Phase-5 dispute/insurance positioning (ADR 0011). They do not
change v1 verifier behavior today.

| Rule | Summary |
| --- | --- |
| **K1** | Every signature carries JWS `kid`; receipts surface verifying `kid` per attestation |
| **K2** | JWKS MUST retain **retired** public keys for the receipt-retention horizon; metadata: `vrp_key_status` (`active` · `retired` · `revoked`), `vrp_not_before`, `vrp_not_after` |
| **K3** | Rotation is additive with overlap — retired keys remain resolvable |
| **K4** | Revocation ≠ rotation; `vrp_compromised_at` anchors fail-closed rules; Phase-5 receipts intended to survive revocation MUST carry `tlog` |
| **K5** | Per-layer key separation is permitted (`payment` MAY use a distinct `kid` from `offer`) |
| **K6** | Phase-5 lifecycle-aware codes: `key_retired_out_of_window`, `key_revoked`, `tlog_required` |

Until a lifecycle-aware verifier ships, public copy MUST NOT claim long-term
post-revocation verifiability.

#### 11. Licensing (D7)

- **Specification text** (this document): [CC0 1.0](https://github.com/HemmaBo-se/vrp-spec/blob/main/LICENSE)
- **Reference code + conformance vectors**: [Apache-2.0](https://github.com/HemmaBo-se/vrp-spec/blob/main/LICENSE-CODE) with explicit patent grant

#### 12. Conformance

Conformance vectors live in [`examples/conformance/receipt/`](https://github.com/HemmaBo-se/vrp-spec/tree/main/examples/conformance/receipt).
They use a **shared throwaway Ed25519 test key** (`kid`: `vrp-vectors-2026-01-01-01`) —
never a production host key (D6 test isolation).

Every `npm test` run executes [`scripts/verify-receipt-vectors.mjs`](https://github.com/HemmaBo-se/vrp-spec/blob/main/scripts/verify-receipt-vectors.mjs),
which MUST pass at minimum:

| Vector | Expectation |
| --- | --- |
| `01-offer-transport-verified.json` | `fully_verified: true`; `offer` + `transport` both `verified` |
| `03-tampered-signature.json` | Manipulated JWS byte → `sig_invalid`; `fully_verified: false` |

Additional vectors cover partial verification (`02`), expiry (`04`), unsupported version
(`05`), and malformed envelope (`06`).

Implementers SHOULD treat vector output equality with [`lib/vrp-receipt.mjs`](https://github.com/HemmaBo-se/vrp-spec/blob/main/lib/vrp-receipt.mjs)
as the interoperability bar for v1 receipt verification.

#### 13. Neutrality (D8)

The spec, schema, and vectors are vendor-neutral. HemmaBo is a reference implementer,
not an approval authority. Composition profiles are published, not centrally granted.

#### 14. Issuance wrapper and log anchoring (envelope level)

An issued receipt MUST be delivered as a **compact JWS signed by the issuing
node's key** — the same `did:web`-published key material as the node's other
VRP artifacts — whose payload is the v1 envelope (§3). This wrapper is what
makes the receipt log-anchorable at the envelope level:

- The transparency-log leaf for a receipt is `sha256:{hex}` over the **exact
  wrapper-JWS string as issued**
  ([Transparency Log](https://vacationrentalprotocol.com/spec/transparency-log-v0.1) §4.1), recorded with
  `artifact_type: vrp_receipt`. No JSON canonicalization is ever applied —
  the signed bytes are the one hashable form.
- Envelope-level anchoring is **external by hash**: the inclusion proof is
  fetched from the log by leaf hash and lives outside the receipt. It cannot
  live inside the receipt — the leaf hash does not exist until the receipt's
  bytes are final. The per-attestation `tlog` member (§5) is unchanged and
  remains available for anchoring individual layer artifacts.
- Wrapper verification follows D5 (§7): over the JWS bytes as received,
  never re-canonicalized.

The wrapper does not alter the envelope's trust semantics: attestations
inside the receipt still verify per layer (§6), and log inclusion never makes
an invalid attestation valid ([Transparency Log](https://vacationrentalprotocol.com/spec/transparency-log-v0.1)
§8).

#### 15. Delivery (normative)

Because the log leaf binds the receipt's **exact bytes** (§14), delivery MUST
preserve them:

- A receipt wrapper JWS MUST be delivered to its holder **byte-verbatim**.
- A receipt wrapper JWS MUST NOT be embedded inline in the flowing text of
  an email body, chat message, or any medium that re-wraps or re-encodes
  text. Line wrapping, whitespace normalization, or character substitution
  silently change the bytes — the signature may even still validate after
  trimming, but the leaf hash will not match, making a correctly issued
  receipt unprovable against the log.
- The holder-facing message SHOULD instead carry a **link** to a surface
  that serves the JWS string verbatim with a copy affordance (for example
  the node's own guest surface), together with the verification link.

#### 16. Proving a receipt against the log (verifier walk-through)

Any party can execute this procedure with the receipt and public interfaces
only — no credentials, no contacting the node's operator:

1. Obtain the receipt wrapper JWS **verbatim** (§15).
2. Verify the wrapper signature against the issuing node's published keys
   (`did:web` / JWKS). This proves who issued the receipt and that its
   content is intact.
3. Compute `sha256:{hex}` over the exact JWS string. This is the leaf
   identity.
4. Fetch the inclusion proof and an STH for that hash — from the node's
   read-through proxy or from the log operator directly; the two surfaces
   are interchangeable because of step 5.
5. Verify the STH signature against the **log operator's** published key
   ([Transparency Log](https://vacationrentalprotocol.com/spec/transparency-log-v0.1) §5.1) — never against a
   key the node serves.
6. Recompute the Merkle root from the leaf hash, leaf index, tree size, and
   audit path (RFC 6962 §2.1.1). The inclusion claim holds **iff** the
   recomputed root equals the STH's `root_hash`; a failed recomputation
   falsifies it.
7. To additionally remove trust in the log operator, obtain a second tree
   head (archived, [Transparency Log](https://vacationrentalprotocol.com/spec/transparency-log-v0.1) §7.1, or
   independently observed) and verify the consistency proof between the two
   tree sizes.

What this proves, in the layered formulation of
[Transparency Log](https://vacationrentalprotocol.com/spec/transparency-log-v0.1) §8.1: the exact promised
terms — price, conditions, issuer, time — existed and were recorded in the
log no later than the STH timestamp, tamper-evidently; steps 1–6 require no
trust in the node, and step 7 removes the remaining trust in the log
operator by making any rewrite cryptographically detectable.

#### 17. License

Specification text: dedicated to the public domain under [CC0 1.0](https://github.com/HemmaBo-se/vrp-spec/blob/main/LICENSE).
Reference code and conformance test vectors: [Apache-2.0](https://github.com/HemmaBo-se/vrp-spec/blob/main/LICENSE-CODE) (ADR 0010 D7).

========================================================================
## 10. Booking Proof Chain v0.1

*Canonical source: <https://vacationrentalprotocol.com/spec/proof-chain-v0.1>*
========================================================================

### VRP Booking Proof Chain — Specification v0.1

**Status:** Public draft

**Published:** 2026-07-23

**Repository:** https://github.com/HemmaBo-se/vrp-spec

**Builds on:** [Core VRP v0.1](https://vacationrentalprotocol.com/spec/v0.1) (signed verified stay offers),
[Receipt Envelope v1](https://vacationrentalprotocol.com/spec/receipt-v1) (issuance wrapper §14, verbatim delivery §15,
verifier walk-through §16), [Transparency Log v0.1](https://vacationrentalprotocol.com/spec/transparency-log-v0.1)
(leaf hashing rule §4.1).

#### 1. Scope

This document **names and normatively defines the Booking Proof Chain**: the
single derivation family that binds a booking's offer, payment, receipt, and
confirmation into one recomputable chain. Every link is the same primitive —

> **SHA-256 over the exact bytes of a node-signed compact-JWS artifact.**

The chain gives a booking confirmation the property this specification calls
**identifier-is-proof**: the string a guest or agent holds as their
confirmation is not a label somebody assigned — it is a value anybody can
recompute from the signed artifact and check against public state, with no
trusted party, no central registry, and no judge.

This specification defines no new runtime endpoints and no new string
dialect (see §6). It names, fixes, and makes citable a derivation that
conforming implementations already produce.

#### 2. References

- [VRP Receipt Envelope v1](https://vacationrentalprotocol.com/spec/receipt-v1) — the receipt artifact and its
  delivery rules.
- [VRP Transparency Log v0.1](https://vacationrentalprotocol.com/spec/transparency-log-v0.1) — append-only
  anchoring of artifact hashes.
- [EIP-3009](https://eips.ethereum.org/EIPS/eip-3009) (informative) —
  `transferWithAuthorization` nonces, used by the x402 payment-binding
  profile in §4.
- RFC 7515 (JWS), RFC 6234 (SHA-256).

#### 3. The chain (normative)

The Booking Proof Chain consists of three links. All hashes are SHA-256 over
the **exact bytes of the compact-JWS string as issued** — never over
re-serialized or re-canonicalized JSON (Receipt Envelope v1 §7 rule applies
chain-wide).

##### 3.1 Link 1 — Offer hash (`offer_hash`)

```
offer_hash = SHA-256(offer compact-JWS bytes)
```

The verified stay offer is a node-signed compact JWS (Core VRP v0.1). Its
hash is the chain's root: it commits to the exact promised property, dates,
party size, and price.

##### 3.2 Link 2 — Payment binding (rail profiles)

A payment is **chain-bound** when the settlement carries `offer_hash` in a
slot the rail preserves. Rail profiles:

- **x402 / EIP-3009 profile:** the 32-byte `nonce` of
  `transferWithAuthorization` equals `offer_hash`. Because consumed nonces
  are public on-chain state (`authorizationState(authorizer, nonce)` and the
  indexed `AuthorizationUsed` event), anyone who recomputes `offer_hash`
  from the offer JWS can confirm, permissionlessly, that exactly that offer
  was paid and by which address. *(Informative note: EIP-3009 verifiers
  treat the nonce as opaque; the binding is recomputable by any party told
  this rule, and enforced by uniqueness — a given offer can be paid this
  way at most once per payer.)*
- **Custodial rails (card / account-to-account):** the rail itself carries
  no artifact binding. A conforming node MUST retain the association
  between the settlement identifier and `offer_hash` in its booking
  records, and SHOULD carry `offer_hash` (full or truncated per §5) in any
  merchant-controlled reference or metadata slot the rail preserves.

*(Interoperability note, informative: Mastercard/Google "Verifiable Intent"
independently binds payment mandates via `transaction_id =
B64U(SHA-256(checkout_jwt))` — hash-of-a-merchant-signed-artifact is the
converging cross-industry pattern. The digest value is identical; only the
text encoding differs — see §5.)*

##### 3.3 Link 3 — Receipt artifact hash: the confirmation reference

```
artifact_hash = "sha256:" + lowercase-hex( SHA-256(receipt wrapper-JWS bytes) )
```

The receipt (Receipt Envelope v1 §14) is the node-signed record of the
promise a confirmed booking settles. Its artifact hash is simultaneously:

1. the **transparency-log leaf** (Transparency Log v0.1 §4.1),
2. the **inclusion-proof lookup key** (`…/proof?hash=<artifact_hash>`), and
3. the **booking confirmation reference** — the chain's public face.

A booking confirmation under this specification **is** Link 3: a value
recomputable by any holder of the receipt JWS, resolvable against the
public log, and impossible to fabricate for a booking that does not exist.

#### 4. Identifier-is-proof (normative)

Derived proof strings are only consumed in practice when verification is a
side effect of ordinary use. Conforming implementations therefore:

- MUST use `artifact_hash` as the functional lookup key for the receipt's
  inclusion proof on the issuing node's log surfaces;
- MUST deliver the full receipt wrapper-JWS to the booking's holder
  byte-verbatim (Receipt Envelope v1 §15) — **a bare hash proves nothing
  without the retained artifact it commits to**;
- MUST NOT present a booking as chain-confirmed on the strength of a
  hash-shaped string alone: verification is (a) recompute the hash from the
  retained JWS, (b) verify the JWS against the node's published keys,
  (c) check log inclusion;
- SHOULD carry the confirmation reference wherever the booking is
  represented to agents (status responses, machine-readable confirmation
  surfaces), so that the string a consumer encounters is always the
  recomputable one.

#### 5. Encodings and truncation (normative)

- Canonical display form: `sha256:` + lowercase hex (64 hex chars).
- The same digest MAY be carried base64url-encoded where a carrier
  requires it. Verifiers MUST compare **digest bytes**, never string forms
  across encodings.
- Carriers with length limits (payment references, human-facing codes) MAY
  carry a **truncated** digest plus an error-detection code appropriate to
  the carrier. A truncated value is a *locator*, not a proof: verification
  is always recompute-then-compare against the full digest.

#### 6. Non-goals (normative)

- **No new confirmation dialect.** This specification deliberately defines
  no wallet-address-shaped, branded, or otherwise novel confirmation
  format. No consumer parses such a format today, and address-shaped
  strings invite misdirected funds. The chain's strings are plain SHA-256
  digests riding in existing carriers (reservation-number fields, payment
  references, URLs) unchanged.
- **No settlement semantics.** Payment rails and their guarantees are out
  of scope (Core VRP v0.1 §5.2 reservation stands); §3.2 defines only how
  a settlement, once made, is bound to the chain.
- **No central verifier.** Anyone may verify; nobody must be asked.

#### 7. Supersession (normative)

Lodging bookings mutate: reschedules, renegotiated totals, cancellations.
The chain handles mutation by **superseding receipts**, never by editing:

- A receipt issued because a prior receipt's promise changed SHOULD include
  `supersedes: "<artifact_hash of the prior receipt>"` at the envelope's
  top level.
- Both receipts remain anchored in the log. The superseded receipt remains
  valid **evidence of the promise that held before the change**; the
  superseding receipt states the promise that holds now.
- The **current** confirmation reference for a booking is the artifact hash
  of its latest unsuperseded receipt. Verifiers resolving a chain of
  `supersedes` links MUST treat a cycle or a fork (two unsuperseded
  receipts claiming the same predecessor) as a verification failure.
- A cancellation is a superseding receipt whose subject records the
  cancelled state; it does not remove history.

*(Receipts issued before this specification carry no `supersedes` field and
are unaffected.)*

#### 8. Verifier walk-through (informative)

An agent holding a confirmation reference and receipt JWS for a booking:

1. Recompute `artifact_hash` from the exact receipt-JWS bytes; compare with
   the reference held.
2. Verify the wrapper JWS and inner attestations against the node's
   published keys (`/.well-known/jwks.json`, resolvable via the node's
   `did:web` document).
3. Fetch the inclusion proof for `artifact_hash` from the log; verify
   against a signed tree head.
4. If the receipt carries `supersedes`, walk to the referenced hash to
   reconstruct the booking's history; confirm no fork.
5. Where the payment used the x402 profile: recompute `offer_hash` from the
   offer JWS and check `authorizationState(payer, offer_hash)` on-chain.

At no step is any party asked to vouch. Every step is recomputation against
published, signed, or on-chain state.

#### 9. Conformance

A node conforms to Booking Proof Chain v0.1 if:

1. its offers and receipts are node-signed compact JWS artifacts whose
   hashes follow §3;
2. receipt artifact hashes are log-anchored and serve as inclusion-proof
   lookup keys (§4);
3. receipt delivery is byte-verbatim to the holder (§4);
4. superseding receipts, where issued, follow §7;
5. it introduces no alternative confirmation dialect presented as
   chain-verified (§6).

#### 10. Neutrality

The spec is vendor-neutral. HemmaBo is a reference implementer, not an
approval authority. Any node, on any stack, can produce and any party can
verify a Booking Proof Chain without permission from anyone.

#### 11. License

Specification text: dedicated to the public domain under [CC0 1.0](https://github.com/HemmaBo-se/vrp-spec/blob/main/LICENSE).

========================================================================
## 11. Node Seal v0.1

*Canonical source: <https://vacationrentalprotocol.com/spec/node-seal-v0.1>*
========================================================================

### VRP Node Seal — Specification v0.1

**Status:** Public draft — the pattern is named and its bytes are fixed; this
version requires no new runtime behavior from agents or payment rails (see
§1 and §9).

**Published:** 2026-07-24

**Repository:** https://github.com/HemmaBo-se/vrp-spec

**Builds on:** [Core VRP v0.1](https://vacationrentalprotocol.com/spec/v0.1) (`did:web` node identity, signed
offers), [Well-Known URI v0.1](https://vacationrentalprotocol.com/spec/well-known-uri-v0.1) (discovery layout),
[Booking Proof Chain v0.1](https://vacationrentalprotocol.com/spec/proof-chain-v0.1) (supersession semantics §7).

#### 1. Scope

This document **names and normatively defines the Node Seal**: a
two-directional, independently verifiable binding between a node's **domain
identity** and its **payment-receiving key**.

The gap it closes: agentic payment ecosystems index and pay sellers by bare
payment address, with no proof of who an address belongs to. The funded
agent-payment stack verifies the **buyer**; nothing verifies that the address
an agent is about to pay belongs to the domain whose offer the agent just
read. The seal is the seller-side answer, spoken in the payment ecosystem's
own dialect:

> **The promise comes from the same key that receives the money.**

The node's Ed25519 offer signature says *the domain promises*. The seal says
*the payment recipient promises*. A verifier that checks both has closed the
loop: mouth and hand are the same party.

This version defines the seal artifact, its location, its verification, and
its lifecycle. It deliberately requires nothing new at runtime: it fixes the
bytes so that when a consuming rail or indexer exists, conforming nodes
already agree on what to publish and verifiers on what to check.

#### 2. References

- [DIF Well-Known DID Configuration](https://identity.foundation/.well-known/resources/did-configuration/)
  (informative) — "Domain Linkage": the same bidirectional
  domain-⇄-key architecture, here applied to a payment key.
- [did:pkh](https://github.com/w3c-ccg/did-pkh) (informative, draft) —
  payment accounts as DID subjects.
- [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) (informative) — nearest
  active neighbor (on-chain agent identity registry). The seal is off-chain
  and requires no transaction.
- [EIP-191](https://eips.ethereum.org/EIPS/eip-191) — `personal_sign` message
  signing. [CAIP-10](https://chainagnostic.org/CAIPs/caip-10) — account
  identifiers.
- RFC 8615 (well-known URIs), RFC 6234 (SHA-256).
- UCP seller key publication (`/.well-known/ucp`, ES256 + JCS) — convergent
  seller-side pattern; see §8.

#### 3. The seal artifact (normative)

A seal is a JSON document served from the node's **own canonical origin**
over `https`, with media type `application/json`, at:

```
/.well-known/vrp/node-seal/v0.1/seal.json
```

It MUST NOT be served via a cross-origin redirect (the node's apex origin is
the trust root, exactly as for `did:web`).

```json
{
  "vrp_node_seal": "0.1",
  "domain": "node.example",
  "did": "did:web:node.example",
  "payment_address": "eip155:1:0x0000000000000000000000000000000000000001",
  "statement": "VRP Node Seal v0.1\ndomain: node.example\ndid: did:web:node.example\npayment_address: eip155:1:0x0000000000000000000000000000000000000001\nissued_at: 2026-07-24T00:00:00Z",
  "signature": "0x…",
  "issued_at": "2026-07-24T00:00:00Z",
  "supersedes": null
}
```

*(Example values; the signature shown is a placeholder and does not verify.)*

##### 3.1 Statement bytes

The `statement` is the **exact byte sequence** signed. It is reconstructed
from the document's own fields as five lines joined by single `\n` (LF), no
trailing newline, UTF-8:

```
VRP Node Seal v0.1
domain: <domain>
did: <did>
payment_address: <payment_address>
issued_at: <issued_at>
```

Field values MUST match the JSON fields byte-for-byte. A verifier MUST
reconstruct the statement from the fields and compare it to `statement`;
any difference is a verification failure. This is the same
no-re-canonicalization discipline as the rest of VRP: what is verified is
the exact bytes, never a re-serialization.

##### 3.2 Signature

`signature` is an [EIP-191] `personal_sign` signature over the statement
bytes. The address recovered from the signature MUST equal the account
component of `payment_address`. Signing is an offline operation: the
address needs no on-chain history, no funds, and no transaction.

##### 3.3 The two directions

Both directions MUST hold; either alone is not a seal:

1. **Domain → key.** The document is served from the node's canonical
   origin under TLS — the same trust root `did:web` uses. Serving it *is*
   the domain's declaration of the address.
2. **Key → domain.** The payment key signs the statement naming the domain
   and DID. Any holder of standard EVM tooling can recover the signer and
   check it — without knowing anything about `did:web`.

##### 3.4 Consistency with other surfaces

If the node advertises an agent-payable address on any other machine
surface for the same rail (payment configuration, checkout metadata), that
address MUST equal `payment_address`. One seal document binds one address;
multiple simultaneous addresses are out of scope for v0.1.

#### 4. Verification (normative)

A verifier:

1. fetches the seal from the node's canonical origin (`https`, no
   cross-origin redirect);
2. reconstructs the statement bytes from the JSON fields (§3.1) and
   byte-compares with `statement`;
3. recovers the signer from `signature` over the statement bytes (§3.2) and
   compares with `payment_address`;
4. resolves `/.well-known/did.json` on the same origin and checks that
   `did` matches;
5. where another surface advertises a payment address (§3.4), checks that
   it equals the sealed one.

Any mismatch at any step is a seal failure. Freshness: the seal currently
served is the current seal; verifiers MUST NOT rely on cached seals beyond
ordinary HTTP cache semantics.

#### 5. Lifecycle: rotation, supersession, revocation (normative)

Key lifecycle is the expensive part of any signing scheme — it is specified
here from the start, not retrofitted.

- `issued_at` is REQUIRED.
- **Rotation / address change:** publish a new seal whose `supersedes` is
  `"sha256:" + lowercase-hex(SHA-256(superseded statement bytes))` — the
  same recomputable-reference discipline as the Booking Proof Chain.
  Supersession chains follow Booking Proof Chain v0.1 §7: forks and cycles
  are verification failures.
- **Revocation without replacement:** the node serves HTTP **410 Gone** at
  the seal path. Verifiers MUST treat 410 as an explicit revocation
  (distinct from 404, which means no seal was published).
- **Compromised payment key:** the node MUST stop advertising the address
  on all surfaces and MUST revoke or supersede the seal. The consistency
  check (§3.4) then fails closed for verifiers. The seal binds identity; it
  cannot recover funds — key custody is out of scope.
- Nodes SHOULD re-issue the seal at least every 12 months as a freshness
  signal, and MUST re-issue on any field change.

#### 6. Never a gate (normative)

The seal is **seller-side evidence for payment-side verifiers** — it points
from the node outward, never back at agents:

- A node MUST NOT condition content, offers, availability, or booking flows
  on any agent presenting seal-related material.
- Verifying the seal is always optional; a node MUST serve all agents
  identically whether or not they verify anything.
- Verifiers SHOULD NOT interpret the absence of a seal as a negative signal
  about a node: v0.1 is optional and newly published.

*(Rationale, informative: most production agents do not sign their
requests. Any gate built on agent-side cryptography excludes the very
consumers this specification serves.)*

#### 7. Non-goals (normative)

- **No chain, no mainnet, no funds.** Nothing here requires an on-chain
  transaction or an address that has ever transacted.
- **Not a badge.** The seal proves a key–domain binding — never quality,
  legitimacy of the business, or any property of the stay.
- **No new confirmation dialect.** Booking Proof Chain v0.1 §6 stands
  unchanged.
- **No payment semantics.** Rails and their guarantees are out of scope.
- **No central registry.** A seal lives in exactly one place: the node's
  own origin. There is nothing to submit and nobody to ask.

#### 8. Dialect interoperability (informative)

EIP-191 `personal_sign` is chosen because it is the dialect the agentic
payment ecosystems already parse natively. Where seller-side signing exists
elsewhere in the wild, the dialect is ES256 + JCS (UCP publishes seller
`signing_keys` under `/.well-known/ucp` on the seller's own domain; AP2
merchant JWTs are ES256). The binding semantics are identical; a future
profile MAY express the same statement as an ES256/JCS-signed JWS for those
consumers. Verifiers compare **bindings**, never encodings. Nothing in this
version changes any existing VRP signature: offers and receipts remain
Ed25519 compact JWS.

#### 9. Deployment status (informative)

As of publication, no payment rail or indexer verifies domain↔address
bindings — sellers are indexed by bare `payTo`. This specification
therefore ships as fixed ground rather than as a runtime requirement: nodes
MAY publish seals today; the reference implementation will publish its seal
alongside the first consuming rail or indexer.

**Reserved for future versions:** *sealed statements* — statements about
specific offers or commitments, signed by the same payment key in the same
dialect, so that the receiving key can speak about what it is receiving
payment *for*. The name and the concept are reserved here; the format is
deliberately not fixed in v0.1.

#### 10. Conformance

A node conforms to Node Seal v0.1 if:

1. its seal is served at the defined path from its canonical origin (§3);
2. the statement reconstructs byte-exactly from the document fields (§3.1);
3. the signature recovers to the sealed address (§3.2);
4. `did` matches the origin's `/.well-known/did.json` (§4);
5. every agent-payable address it advertises equals the sealed address
   (§3.4);
6. rotation, supersession, and revocation follow §5;
7. it gates nothing on the seal (§6).

#### 11. Neutrality

The spec is vendor-neutral. HemmaBo is a reference implementer, not an
approval authority. Any node, on any stack, can publish and any party can
verify a Node Seal without permission from anyone.

#### 12. License

Specification text: dedicated to the public domain under [CC0 1.0](https://github.com/HemmaBo-se/vrp-spec/blob/main/LICENSE).

========================================================================
## 12. Implement VRP signed offers

*Canonical source: <https://vacationrentalprotocol.com/docs/implement-vrp>*
========================================================================

### Implement VRP

A host or provider can implement VRP without becoming a marketplace. The host-owned domain remains the source of truth.

#### Minimum Implementation

1. Publish `/.well-known/vacation-rental.json`.
2. Publish `/.well-known/jwks.json` with an Ed25519 public key.
3. Expose a verified stay offer endpoint.
4. Sign verified stay offer payloads with the matching host-domain private key.
5. Include availability, exact price, currency, `valid_until`, direct booking URL, and agent citation permission.
6. Return explicit signed false values when a request is unavailable.
7. Fail closed when any verification requirement cannot be satisfied.

#### Discovery Checklist

Your discovery document should include:

- `protocol`
- `protocol_version`
- `canonical_domain`
- `node_id`
- `jwks_url`
- `verified_stay_offer_endpoint`
- `capabilities`

#### Offer Checklist

Your signed offer should include:

- stay request
- property identity
- availability status
- price object with currency and exactness
- direct booking URL
- validity window
- agent permission
- compact JWS signature

#### Interoperability

VRP implementers should keep field names stable and machine-readable. Agents should be able to verify the offer without relying on page text, screenshots, cached listing data, or marketplace mirrors.

If a value cannot be verified, agents must treat it as unknown. A missing endpoint, failed fetch, invalid JSON response, failed signature, or stale `valid_until` must never be interpreted as a confirmed negative or a confirmed positive.

========================================================================
## 13. Implement portable attestations

*Canonical source: <https://vacationrentalprotocol.com/docs/implement-attestations>*
========================================================================

### Implement VRP Portable Attestations

This guide describes how a host-owned domain can publish VRP Portable Attestations v0.1 without relying on HemmaBo, a central registry, a marketplace, an OTA, a booking intermediary, or a trust scoring service.

Portable attestations do not replace core VRP offer verification. A fresh signed offer is still required before an agent may quote availability, exact price, or a direct booking URL.

#### Minimum Publishing Profile

1. Publish a `did:web` DID document for the host domain.
2. Include an Ed25519 verification method for attestation JWS verification.
3. Use a `kid` controlled by the host-domain DID, such as `did:web:example-host.invalid#attestations-ed25519-2026-05`.
4. Sign credentials as compact JWS with `typ: "vc+jwt"` and `alg: "EdDSA"`.
5. Include the W3C VC v2 context and the VRP context in the JWS payload.
6. Use `iat` for JWS signing time, and `validFrom` / `validUntil` for credential validity.
7. Do not include `proof`, `signature`, or `issuedAt` in the credential JSON.
8. Publish status only as `VRPStatusListEntry` unless a future version defines a full W3C Bitstring Status List profile.

#### DID Web Document

For issuer `did:web:example-host.invalid`, the DID document is published at:

```text
https://example-host.invalid/.well-known/did.json
```

The DID document should include an attestation verification method that is controlled by the host-domain DID. The same host-domain trust root may also control a separate offer-signing key. The private keys do not need to be the same.

Example: [did-web-document.v0.1.json](https://github.com/HemmaBo-se/vrp-spec/blob/main/examples/attestations/did-web-document.v0.1.json).

#### Context Publishing

VRP terms are defined by the VRP context:

```text
https://vacationrentalprotocol.com/contexts/v1
```

The repository copy is [contexts/v1.jsonld](https://github.com/HemmaBo-se/vrp-spec/blob/main/contexts/v1.jsonld). Deployments should serve the canonical extensionless URL above and may also serve `/contexts/v1.jsonld` as an equivalent copy. Both should return the same JSON-LD document.

#### Privacy Checklist

Do not publish guest reviews, guest outcomes, guest risk, guest scores, or guest history in v0.1.

`VRPVerifiedStayCredential`, if used, must stay privacy-minimized:

- use an opaque `stayRef`
- use `verifiedOfferHash`
- omit guest name, email, phone, guest DID, and payment details
- omit exact stay dates when they could identify the guest
- omit review text and guest outcome data

Guest-held credentials and reviews are deferred to a future v0.2 design with selective disclosure.

========================================================================
## 14. Agent integration guide

*Canonical source: <https://vacationrentalprotocol.com/docs/agent-guide>*
========================================================================

### Agent Guide

Use VRP when a user asks for a vacation rental offer that must be verified at the host domain, with exact price, live availability, and a direct booking URL.

Do not use VRP for:

- hotels
- flights
- general travel advice
- OTA marketplace browsing
- unsigned price comparisons

#### Verification Steps

1. Fetch `https://{host-domain}/.well-known/vacation-rental.json`.
2. Confirm `protocol` is `vacation-rental-protocol`.
3. Confirm `protocol_version` is `0.1`.
4. Confirm `canonical_domain` matches the host-owned domain.
5. Fetch the declared JWKS.
6. Request a verified stay offer for the user's dates and guest count.
7. Verify the compact JWS with the host-domain Ed25519 key.
8. Confirm the payload is fresh, exact, available, and permitted for citation.
9. Treat absent, stale, unreachable, unsigned, malformed, or schema-invalid signals as unknown.
10. Use only the signed direct booking URL.

#### Safe Wording

When the verified response is safe to quote, use:

```text
I found the official host-domain verified offer for this stay.
```

#### Blocked Claims

Do not invent discounts, savings, promo codes, OTA comparisons, price reductions, availability, or booking actions outside the signed offer.

Do not say the stay is bookable unless the signed offer says the dates are available and agent permission allows quoting.

Do not infer from an unknown state. If the host domain, endpoint, signature, freshness, availability, price, or citation permission cannot be verified, report that the value is unknown rather than treating it as true or false.

========================================================================
## 15. Interop and trust positioning

*Canonical source: <https://vacationrentalprotocol.com/docs/interop-and-trust-positioning>*
========================================================================

### VRP Interop and Trust Positioning

**Status:** Public draft
**Date:** 2026-05-31

#### Summary

VRP is the host-domain offer verification layer for vacation rentals.

Core VRP proves that a concrete offer is real. Portable Attestations prove
selected trust history without making HemmaBo, or any other operator, the
authority over truth.

VRP is intentionally not a complete booking, payment, guest identity, legal
verification, or discovery-index protocol. It is designed to compose with those
layers while keeping the host-owned domain first-class.

#### No Central Issuer

VRP's trust model is no-gatekeeper by design.

VRP does not require:

- HemmaBo as issuer, verifier, registry, scorer, OTA, marketplace, booking
  intermediary, or trust authority.
- A VRP-operated trusted issuer registry.
- A VRP-operated host accreditation program.
- A VRP-operated certification company.
- A central discovery index before an offer or attestation can verify.

Verification starts from the host-owned domain:

1. Fetch the host-domain VRP discovery document.
2. Resolve the host-domain keys or DID document.
3. Verify the signed offer or attestation.
4. Apply protocol rules for freshness, exact price, availability, privacy, and
   status.
5. Apply the verifier's own trust policy.

A verifier may still use a trust policy. That policy can include local legal
requirements, insurer requirements, municipal registries, payment providers,
property managers, identity verification providers, or allowlists chosen by the
verifier. Those choices are not HemmaBo approval and not VRP-wide
certification.

#### Self-Attestation Boundary

Self-issued host-domain credentials are appropriate for facts controlled by the
host domain, including:

- host-domain control
- VRP node metadata
- discovery URLs
- signing key identifiers
- payment path routing facts
- direct booking domains
- policy snapshot hashes
- privacy-minimized verified stay references

Self-issued host-domain credentials are not enough for claims that require
independent evidence, including:

- guest identity verification
- guest payment guarantees
- right-to-let
- local short-term-rental license status
- property ownership
- insurance coverage
- legal compliance

Future VRP versions may define optional third-party credential profiles for
those claims. The issuer trust decision should remain verifier-chosen, not
centralized in HemmaBo or the VRP standards site.

#### Relationship to Adjacent Standards

VRP should compose with the agent-commerce stack instead of replacing it.

| Layer | VRP position |
| --- | --- |
| UCP | Complementary. UCP can handle checkout, order lifecycle, and merchant-of-record commerce flows, including lodging flows as the UCP lodging profile matures. VRP proves the host-domain offer and can hand off through a signed direct booking URL or future optional UCP manifest reference. |
| AP2 | Complementary. AP2 can handle cryptographic payment mandates and payment authorization. VRP v0.1 does not define payment mandates or raw payment processing. |
| MCP | Complementary. MCP can expose retrieval or verification behavior as tools in a future profile. VRP v0.1 defines documents and verification rules, not runtime tools. |
| A2A | Complementary. A2A can carry future guest-agent and host-agent negotiation. VRP v0.1 does not define an A2A binding. |
| W3C VC 2.0 | Used by VRP Portable Attestations. |
| VC JOSE/COSE | Canonical v0.1 security format for VRP Portable Attestations as compact JWS with `typ: "vc+jwt"` and `alg: "EdDSA"`. |
| W3C Data Integrity | Possible future interoperability mapping. VRP v0.1 does not use embedded `proof` objects. |

#### What VRP Should Not Copy

VRP should not add a mandatory central trusted issuer registry merely to look
more complete.

VRP should not publish a HemmaBo trust score.

VRP should not call host-domain self-attestation "right-to-let verification" or
"legal compliance verification."

VRP should not publish guest reviews, guest risk, guest outcome, guest scores,
or guest history in v0.1.

VRP should not define runtime MCP tools until the document layer is stable and
there is at least one interoperable verifier profile.

#### Roadmap Gaps

The verified gaps are real and should be named directly:

- Guest identity verification is out of scope for v0.1.
- Right-to-let and local license verification are out of scope for v0.1.
- Payment mandates are out of scope for v0.1.
- Full autonomous booking confirmation is out of scope for v0.1.
- Centralized search discovery is out of scope for v0.1.

The recommended path is not to make HemmaBo the missing authority. The
recommended path is to add optional profiles that let independent issuers,
payment providers, search indexes, and host tools interoperate while VRP keeps
the host-domain offer proof gatekeeper-free.

========================================================================
## 16. First-mover evidence memo

*Canonical source: <https://vacationrentalprotocol.com/docs/first-mover-evidence-memo>*
========================================================================

### First-mover evidence memo — Vacation Rental Protocol

**Status:** Published evidence memo  
**Date:** 2026-06-14  
**Protocol draft:** v0.1  
**Public site:** https://vacationrentalprotocol.com  
**Repository:** https://github.com/HemmaBo-se/vrp-spec

#### Permitted claim

> To our knowledge, Vacation Rental Protocol is the first open protocol focused on host-domain signed, AI-agent-readable vacation rental stay offers.

Do not use absolute wording such as "world's first" without separate legal review.

#### Search methodology (reproducible)

Reviewed on 2026-05-17 and refreshed 2026-06-14:

| Source type | Examples checked |
|-------------|------------------|
| AI commerce protocols | UCP (ucp.dev), AP2 (Google agentic commerce), MCP (modelcontextprotocol.io) |
| Lodging semantics | Schema.org Hotels / Offer vocabulary |
| OTA AI integrations | OpenAI Apps SDK announcement (Booking.com, Expedia as app partners) |
| Vacation rental trust | No open host-domain signed stay-offer protocol with JWKS + freshness + direct booking URL found |

**Gap identified:** OTA apps enter ChatGPT; MCP provides generic tools; Schema.org describes entities — none define a host-owned, signed, fresh stay offer with `valid_until`, exact price, and direct booking permission.

#### Live proof (2026-06-14)

All endpoints returned HTTP 200 when probed from production:

```text
GET https://vacationrentalprotocol.com/spec/v0.1
GET https://vacationrentalprotocol.com/schemas/verified-stay-offer-v0.1.schema.json
GET https://www.villaakerlyckan.se/.well-known/vacation-rental.json
GET https://www.villaakerlyckan.se/.well-known/jwks.json
GET https://www.villaakerlyckan.se/api/verified-stay-offer?check_in=2026-11-24&check_out=2026-11-26&guests=2
```

Proof node path:

```text
villaakerlyckan.se
-> /.well-known/vacation-rental.json
-> /.well-known/jwks.json
-> /api/verified-stay-offer
-> signed verified_stay_offer (EdDSA JWS)
-> direct booking URL on host domain
```

#### Reference implementation

- **Protocol:** Vacation Rental Protocol v0.1 (this repository)
- **Runtime:** [HemmaBo](https://hemmabo.com) — infrastructure, not trust root for offers
- **Proof node:** [villaakerlyckan.se](https://villaakerlyckan.se)

HemmaBo is a reference implementation and standards contributor, not a central issuer, registry, OTA, marketplace, or booking intermediary.

#### Non-goals

VRP does not replace UCP checkout, Stripe payments, MCP tools, or search engines. It verifies that a stay offer came from the host-owned domain before an agent quotes or routes checkout.

#### Related documents

- [Reference implementation page](https://vacationrentalprotocol.com/reference-implementation)
- [Interop and trust positioning](https://vacationrentalprotocol.com/docs/interop-and-trust-positioning)
- [Core spec v0.1](https://vacationrentalprotocol.com/spec/v0.1)

========================================================================
## 17. Appendix — machine artifacts

The documents above are the human-readable standard. The following machine
artifacts are referenced by URL rather than inlined; fetch them directly when
implementing or verifying.

- VRP JSON-LD context: <https://vacationrentalprotocol.com/contexts/v1>
- VRP terms vocabulary: <https://vacationrentalprotocol.com/terms>
- Discovery JSON Schema: <https://vacationrentalprotocol.com/schemas/discovery-v0.1.schema.json>
- JWKS JSON Schema: <https://vacationrentalprotocol.com/schemas/jwks-v0.1.schema.json>
- Signed offer JSON Schema: <https://vacationrentalprotocol.com/schemas/verified-stay-offer-v0.1.schema.json>
- Offer verification-result JSON Schema: <https://vacationrentalprotocol.com/schemas/verified-stay-offer-verification-result-v0.1.schema.json>
- Attestations JSON Schema: <https://vacationrentalprotocol.com/schemas/attestations-v0.1.schema.json>
- Receipt envelope JSON Schema: <https://vacationrentalprotocol.com/schemas/vrp-receipt.v1.schema.json>
- StayIntent query JSON Schema: <https://vacationrentalprotocol.com/schemas/stayintent-query-v0.1.schema.json>
- StayIntent response JSON Schema: <https://vacationrentalprotocol.com/schemas/stayintent-response-v0.1.schema.json>
- Live reference node discovery: <https://villaakerlyckan.se/.well-known/vacation-rental.json>
- In-browser offer verifier: <https://vacationrentalprotocol.com/verify>

---

*End of the Vacation Rental Protocol Source Pack (v0.1). Canonical: <https://vacationrentalprotocol.com>.*
