# Vacation Rental Protocol (VRP)

**Current public draft: v0.1**

An open protocol for host-domain signed vacation rental offers.

VRP lets AI agents verify that a stay offer came from the host-owned domain, includes fresh availability, exact pricing, and a direct booking URL before quoting.

## Spec

Public overview: [vacationrentalprotocol.com](https://vacationrentalprotocol.com)

Spec draft: [spec/v0.1.md](./spec/v0.1.md)

Portable attestations draft: [spec/attestations-v0.1.md](./spec/attestations-v0.1.md)

VRP JSON-LD context draft: [contexts/v1.jsonld](./contexts/v1.jsonld)

Architecture decision: [ADR 0001 - Portable Attestations v0.1](./docs/adr/0001-portable-attestations-v0.1.md)

## What VRP Is

- An open protocol for vacation rental offer verification
- A versioned protocol (`protocol_version: "0.1"`)
- A host-owned domain model for source identity
- Signed verified stay offers for machine validation
- Ed25519 JWKS for key discovery and signature checks
- Freshness control via `valid_until`
- Exact price fields for quote fidelity
- Safe-to-quote guardrails for agent behavior

## What VRP Is Not

- Not a marketplace
- Not an OTA
- Not a booking portal
- Not a ranking engine
- Not a payment processor
- Not a replacement for host websites

## Reference Implementation

[HemmaBo](https://hemmabo.com) is a reference implementation, provider, and federation using VRP-compatible host-owned domains.

**Live proof node:** [villaakerlyckan.se](https://villaakerlyckan.se)

## Developer Links

- Live MCP endpoint: `https://hemmabo-mcp-server.vercel.app/mcp`
- MCP server repo: [HemmaBo-se/hemmabo-mcp-server](https://github.com/HemmaBo-se/hemmabo-mcp-server)
- Proof node discovery: `https://villaakerlyckan.se/.well-known/vacation-rental.json`
- Proof node JWKS: `https://villaakerlyckan.se/.well-known/jwks.json`
- Contact: info@hemmabo.se

## License

Apache 2.0 — see [LICENSE](./LICENSE)
