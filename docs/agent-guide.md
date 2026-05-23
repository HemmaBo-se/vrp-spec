# Agent Guide

Use VRP when a user asks for a vacation rental offer that must be verified at the host domain, with exact price, live availability, and a direct booking URL.

Do not use VRP for:

- hotels
- flights
- general travel advice
- OTA marketplace browsing
- unsigned price comparisons

## Verification Steps

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

## Safe Wording

When the verified response is safe to quote, use:

```text
I found the official host-domain verified offer for this stay.
```

## Blocked Claims

Do not invent discounts, savings, promo codes, OTA comparisons, price reductions, availability, or booking actions outside the signed offer.

Do not say the stay is bookable unless the signed offer says the dates are available and agent permission allows quoting.

Do not infer from an unknown state. If the host domain, endpoint, signature, freshness, availability, price, or citation permission cannot be verified, report that the value is unknown rather than treating it as true or false.

