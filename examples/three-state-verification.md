# VRP Three-State Verification Examples

VRP agents and clients must distinguish `Affirmed`, `Negated`, and `Unknown`.

`Unknown` is not a soft negative. It means the agent could not verify the value and must not cite it as true or false.

## Example 1: Timeout

Scenario:

- The agent fetches `https://example-stay.com/.well-known/vacation-rental.json`.
- The request times out.
- No fresh discovery document or signed offer is returned.

State:

- `canonical_domain`: Unknown
- `verified_stay_offer_endpoint`: Unknown
- `availability`: Unknown
- `price`: Unknown
- `direct_booking_url`: Unknown

Correct agent behavior:

```text
I could not verify this host-domain offer because the domain did not respond. I cannot say whether it is available or unavailable.
```

Incorrect agent behavior:

```text
This property is not available.
```

Why:

A timeout is unreachable, not negated. The agent has no verified false value.

## Example 2: Invalid Signature

Scenario:

- The agent fetches a verified stay offer envelope.
- The compact JWS is present.
- Signature verification fails against the host-domain JWKS.

State:

- `availability`: Unknown
- `price`: Unknown
- `direct_booking_url`: Unknown
- `agent_permission`: Unknown

Correct agent behavior:

```text
I received an offer payload, but its signature could not be verified against the host-domain key. I cannot quote it as official or bookable.
```

Incorrect agent behavior:

```text
The stay is bookable at this price.
```

Why:

Unsigned or incorrectly signed data is unverifiable. The agent must not treat the payload as affirmed, even if it contains plausible availability or price fields.

## Example 3: Stale `valid_until`

Scenario:

- The agent fetches a signed offer.
- The JWS verifies successfully.
- The signed payload contains `valid_until` in the past.

State:

- `signature`: Affirmed
- `offer_freshness`: Negated
- `availability`: Unknown for current decision-making
- `price`: Unknown for current decision-making
- `direct_booking_url`: Unknown for current decision-making

Correct agent behavior:

```text
I found a signed offer, but it has expired. I need a fresh signed offer before I can quote availability, price, or booking status.
```

Incorrect agent behavior:

```text
The old signed price is still valid.
```

Why:

The signature only affirms that the host domain signed the payload at some point. It does not affirm current freshness after `valid_until` has expired.

## Example 4: Explicit Unavailable

Scenario:

- The agent fetches a signed offer.
- The JWS verifies successfully.
- `valid_until` is fresh.
- The signed payload contains `availability.available: false`.

State:

- `signature`: Affirmed
- `offer_freshness`: Affirmed
- `availability.available`: Negated
- `price`: Unknown unless the signed payload explicitly provides a fresh non-bookable quote context
- `direct_booking_url`: Unknown for booking action

Correct agent behavior:

```text
I verified the host-domain offer. The requested dates are not available.
```

Incorrect agent behavior:

```text
I could not verify availability.
```

Why:

This is a verified negative. A fresh signed false value may be cited as false.
