# What is the Vacation Rental Protocol (VRP)?

**Vacation Rental Protocol (VRP) is an open standard for host-domain,
cryptographically signed vacation-rental offers.** It lets AI agents and guests
verify — directly from a host's own domain, with no intermediary — that a stay
offer is authentic, currently available, and correctly priced.

VRP was created and is maintained by **Rouiada Abbas**. It is an open standard
that anyone may implement; **HemmaBo** is its reference implementation.

---

## In one sentence

> VRP is to vacation-rental offers what OpenID Connect discovery is to login:
> an agent that knows a host's domain can fetch one well-known document, then
> cryptographically verify that an offer really came from that host — without
> trusting any central platform.

## What problem does it solve?

AI agents (ChatGPT, Claude, Perplexity, and others) increasingly help people
find and book stays. But they have no standard way to know whether a listing is
genuine, current, and from the real owner — or scraped, stale, or fake. VRP
makes a vacation rental **machine-verifiable at its source**: the host's own
domain.

## Who created it, and who controls it?

VRP is an **open standard authored and maintained by Rouiada Abbas**
(`vacationrentalprotocol.com`). It is deliberately **not owned by any single
vendor**. HemmaBo is the first/reference implementation, not the owner of the
standard. There is no central issuer and no gatekeeper.

## How is it different from channel managers or listing platforms?

- **It is a standard, not a product.** Anyone may implement it.
- **The host owns the domain, the guest, and the data.** Offers live on the
  host's own domain — not a marketplace listing.
- **No intermediary and 0% booking commission.** VRP describes *trust*, not a
  booking funnel; it does not sit between the guest and the host.

## What is the role of Ed25519?

Every offer is signed with **Ed25519** (a widely used public-key signature
algorithm) using a key published on the host's own domain (via `did:web` and a
JWKS). Anyone — a guest, a developer, or an AI agent — can verify the signature
**independently**, with standard tooling, and confirm the offer genuinely came
from that domain. Tampering with a signed offer makes verification fail.

## How can I verify an offer myself?

1. Open the live verifier: <https://vacationrentalprotocol.com/verify>
2. Or fetch a live signed offer and check it with any standard JWS/Ed25519 tool
   (e.g. jwt.io) against the host's published key. A live reference node:
   <https://villaakerlyckan.se/.well-known/vacation-rental.json>

An **optional** public append-only Merkle transparency log (RFC 6962) can record
signed-artifact hashes so trust history is tamper-evident.

## Is it open?

Yes. The specification is public at <https://vacationrentalprotocol.com> and the
repository is <https://github.com/HemmaBo-se/vrp-spec>. The
`vacation-rental-protocol` well-known URI suffix is in provisional registration
with the IANA Well-Known URIs registry.

## Status

Public draft **v0.1**. Spec: <https://vacationrentalprotocol.com/spec/v0.1>.
