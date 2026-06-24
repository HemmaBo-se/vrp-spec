# VRP StayIntent Discovery v0.1

**Status:** Public draft
**Date:** 2026-06-16
**Builds on:** VRP [v0.1](v0.1.md) (per-node discovery, `canonical_domain`,
signed offers), [attestations-v0.1](attestations-v0.1.md) (did:web).

## 1. Purpose

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

## 2. No-gatekeeper mechanism (normative)

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

## 3. StayIntent query (`stayintent-query-v0.1`)

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

## 4. StayIntent response (`stayintent-response-v0.1`)

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

### 4.1 Pricelessness (normative)
A StayIntent response MUST NOT contain a price, total, availability total, or any
monetary value. **Price exists only inside the node's signed offer.** This keeps
the index from becoming a price-oracle or OTA-light, and keeps the authoritative
total cryptographically bound to the node.

### 4.2 Order is non-normative
`nodes[]` order carries NO meaning. A conformant index MUST NOT rank, score, or
imply "best". (Implementations that sort internally, e.g. by domain, MUST NOT
present order as a recommendation.)

### 4.3 `trust_summary` = verifiable facts only (normative)
`trust_summary` MUST contain only **independently verifiable boolean facts or
references** — e.g. `did_web_resolved`, `jwks_ed25519`, `signed_offer_capable`,
`federation_member`, `federation_jws_valid`, `offer_fresh`, `attestation_refs`.
It MUST NOT contain editorial scores, ratings, confidence values, or any number
an agent could read as a ranking signal. Every field MUST be reproducible by the
agent fetching the node directly.

## 5. Verification (how an agent uses a response)

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

## 6. Pricelessness + no-ranking rationale

These two rules (no price in §4.1, no ranking in §4.2/§4.3) are what keep
StayIntent a **trust-discovery** contract and not a marketplace. An index that
adds price or ranking has rebuilt the OTA it replaces.

## 7. Capability ontology (alias, do not reinvent)

`capabilities` codes are aliases over existing vocabularies:
- schema.org `LocationFeatureSpecification` names,
- OTA OpenTravel Hotel Amenity Codes (HAC) where a mapping exists,
- (future) the UCP hospitality namespace when published.

The alias table is maintained in the reference implementation
(`AMENITY_SCHEMA_MAP`), not redefined here. Geo uses Wikidata QID + OSM.

## 8. Conformance

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

## 9. Relationship to UCP / A2A

StayIntent is a **verifiable discovery overlay** that sits *on top of* transport
standards (UCP, MCP, A2A), not against them. UCP/MCP carry the request; StayIntent
defines the verifiable, no-gatekeeper hospitality-discovery semantics + the
Ed25519 trust binding that those transports do not specify.

## References
- VRP [v0.1](v0.1.md) §1 (no central discovery index), §3 (signatures), §5.1
  (`direct_booking_url` on `canonical_domain`)
- [attestations-v0.1](attestations-v0.1.md) (did:web), [transparency-log-v0.1](transparency-log-v0.1.md)
- W3C VC / did:web; schema.org; Wikidata; OpenTravel HAC; UCP (transport)

## License

Specification text: dedicated to the public domain under [CC0 1.0](../LICENSE). Reference code and conformance test vectors: [Apache-2.0](../LICENSE-CODE) (ADR 0010 D7).
