# Contributing

VRP is intended to be implementable by independent hosts, booking providers, and agent developers.

## Proposal Process

1. Open an issue describing the problem.
2. Include examples of host-domain discovery, signed offers, or agent behavior when possible.
3. For protocol changes, explain whether the change is backward-compatible with v0.1.
4. Keep HemmaBo-specific implementation details out of the protocol unless they are needed as reference examples.

## Design Principles

- Host-owned domains are the source of truth.
- Verification must be possible without trusting a marketplace mirror.
- Agents must fail closed.
- Pricing, availability, and booking URLs must be quoteable only when signed, fresh, exact, and permitted.

