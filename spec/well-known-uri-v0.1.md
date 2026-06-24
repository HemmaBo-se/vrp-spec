# VRP Well-Known URI — `vacation-rental-protocol` — Specification v0.1

**Status:** Draft (provisional). IANA registry request:
https://github.com/protocol-registries/well-known-uris/issues/93

**Published:** 2026-06-19

**Change controller:** Vacation Rental Protocol (VRP) — Rouiada Abbas,
author/maintainer; hello@vacationrentalprotocol.com

**Canonical context:** https://vacationrentalprotocol.com/contexts/v1

**Repository:** https://github.com/HemmaBo-se/vrp-spec

## 1. Scope

VRP defines the well-known URI suffix **`vacation-rental-protocol`** (RFC 8615).
A client that already knows a host's domain issues a single request:

```
GET https://{host}/.well-known/vacation-rental-protocol.json
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

## 2. Why this name

The suffix names the **protocol**, not the vertical. We deliberately did **not**
request the generic `vacation-rental`, to avoid squatting a category term
(RFC 8615 §3.1). Node identity is additionally published at the already-registered
`did.json` (`did:web`), whose DID document advertises this resource via a
`service` entry — so it is also reachable from a registered well-known via a
real URL.

## 3. Resource format (informative)

The resource is a self-describing JSON object, versioned by `$schema` and
`schema_version`. Discovery-relevant fields include:

- `protocol`, `protocol_version` — identifies the document as VRP and its version.
- `canonical_domain`, `node_id` — the node's canonical host and stable identifier.
- `identity` / `did` — the node's `did:web` identity (see `/.well-known/did.json`).
- `jwks_url` — public keys (JWKS) used to verify signed artifacts.
- `verified_stay_offer_endpoint` — where a signed, verifiable stay offer is obtained.
- `capabilities`, `endpoints` — supported operations and their URLs.
- `availability`, `pricing`, `policies`, `media` — structured, public property facts.

Clients **MUST** ignore unknown fields and **MUST** treat the document as
advisory metadata only (see §4).

## 4. Trust model (normative)

**Trust is not derived from the well-known location**; its presence confers no
authority. Authoritative offers are **Ed25519-signed on the host's own domain**
and verify standalone against the node's published keys (`jwks_url` / `did:web`),
independent of any central party. An **optional** public append-only Merkle
transparency log (RFC 6962; see
https://vacationrentalprotocol.com/spec/transparency-log-v0.1)
records signed-artifact hashes so that after-the-fact tampering is detectable. A
client **SHOULD** verify signatures; it **MUST NOT** treat the discovery document
itself as proof of any claim.

## 5. Security & privacy considerations

- Served over `https` only.
- The document is public, machine-readable metadata; it **MUST NOT** contain
  guest personal data or secrets.
- Verification keys are published separately (`jwks_url`, `did:web`); key
  rotation is handled there, not in this document.

## 6. Reference implementation

HemmaBo (https://hemmabo.com) is the reference implementation. Live example:

```
curl https://villaakerlyckan.se/.well-known/vacation-rental-protocol.json
```

During transition the same document is also served at the legacy path
`/.well-known/vacation-rental.json`; new clients **SHOULD** use
`vacation-rental-protocol.json`.

## 7. IANA considerations

This document is the specification reference for the **provisional** registration
of the `vacation-rental-protocol` well-known URI suffix in the IANA Well-Known
URIs registry (RFC 8615). Registration request:
https://github.com/protocol-registries/well-known-uris/issues/93

- **URI suffix:** `vacation-rental-protocol`
- **Change controller:** Vacation Rental Protocol (VRP) — Rouiada Abbas;
  hello@vacationrentalprotocol.com
- **Status:** provisional
- **Specification document:** this page.

## License

Specification text: dedicated to the public domain under [CC0 1.0](../LICENSE). Reference code and conformance test vectors: [Apache-2.0](../LICENSE-CODE) (ADR 0010 D7).
