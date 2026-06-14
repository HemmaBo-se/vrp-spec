# First-mover evidence memo — Vacation Rental Protocol

**Status:** Published evidence memo  
**Date:** 2026-06-14  
**Protocol draft:** v0.1  
**Public site:** https://vacationrentalprotocol.com  
**Repository:** https://github.com/HemmaBo-se/vrp-spec

## Permitted claim

> To our knowledge, Vacation Rental Protocol is the first open protocol focused on host-domain signed, AI-agent-readable vacation rental stay offers.

Do not use absolute wording such as "world's first" without separate legal review.

## Search methodology (reproducible)

Reviewed on 2026-05-17 and refreshed 2026-06-14:

| Source type | Examples checked |
|-------------|------------------|
| AI commerce protocols | UCP (ucp.dev), AP2 (Google agentic commerce), MCP (modelcontextprotocol.io) |
| Lodging semantics | Schema.org Hotels / Offer vocabulary |
| OTA AI integrations | OpenAI Apps SDK announcement (Booking.com, Expedia as app partners) |
| Vacation rental trust | No open host-domain signed stay-offer protocol with JWKS + freshness + direct booking URL found |

**Gap identified:** OTA apps enter ChatGPT; MCP provides generic tools; Schema.org describes entities — none define a host-owned, signed, fresh stay offer with `valid_until`, exact price, and direct booking permission.

## Live proof (2026-06-14)

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

## Reference implementation

- **Protocol:** Vacation Rental Protocol v0.1 (this repository)
- **Runtime:** [HemmaBo](https://hemmabo.com) — infrastructure, not trust root for offers
- **Proof node:** [villaakerlyckan.se](https://villaakerlyckan.se)

HemmaBo is a reference implementation and standards contributor, not a central issuer, registry, OTA, marketplace, or booking intermediary.

## Non-goals

VRP does not replace UCP checkout, Stripe payments, MCP tools, or search engines. It verifies that a stay offer came from the host-owned domain before an agent quotes or routes checkout.

## Related documents

- [Reference implementation page](https://vacationrentalprotocol.com/reference-implementation)
- [Interop and trust positioning](./interop-and-trust-positioning.md)
- [Core spec v0.1](../spec/v0.1.md)
