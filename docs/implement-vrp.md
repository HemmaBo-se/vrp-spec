# Implement VRP

A host or provider can implement VRP without becoming a marketplace. The host-owned domain remains the source of truth.

## Minimum Implementation

1. Publish `/.well-known/vacation-rental.json`.
2. Publish `/.well-known/jwks.json` with an Ed25519 public key.
3. Expose a verified stay offer endpoint.
4. Sign verified stay offer payloads with the matching host-domain private key.
5. Include availability, exact price, currency, `valid_until`, direct booking URL, and agent citation permission.
6. Return explicit signed false values when a request is unavailable.
7. Fail closed when any verification requirement cannot be satisfied.

## Discovery Checklist

Your discovery document should include:

- `protocol`
- `protocol_version`
- `canonical_domain`
- `node_id`
- `jwks_url`
- `verified_stay_offer_endpoint`
- `capabilities`

## Offer Checklist

Your signed offer should include:

- stay request
- property identity
- availability status
- price object with currency and exactness
- direct booking URL
- validity window
- agent permission
- compact JWS signature

## Interoperability

VRP implementers should keep field names stable and machine-readable. Agents should be able to verify the offer without relying on page text, screenshots, cached listing data, or marketplace mirrors.

If a value cannot be verified, agents must treat it as unknown. A missing endpoint, failed fetch, invalid JSON response, failed signature, or stale `valid_until` must never be interpreted as a confirmed negative or a confirmed positive.

