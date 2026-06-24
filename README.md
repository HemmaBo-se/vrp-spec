# Vacation Rental Protocol (VRP)

**Vacation Rental Protocol (VRP) is an open standard for host-domain, cryptographically signed vacation-rental offers** — so AI agents and guests can verify directly from a host's own domain that a stay offer is authentic, available, and correctly priced, with no intermediary and no booking commission.

Created and maintained by Rouiada Abbas. Anyone may implement it; HemmaBo is the reference implementation. Current public draft: v0.1.

VRP lets AI agents verify that a stay offer came from the host-owned domain, includes fresh availability, exact pricing, and a direct booking URL before quoting.

Core VRP proves the offer is real. Portable attestations prove selected trust history without making HemmaBo, or any other operator, the authority over truth.

## Spec

Public overview: [vacationrentalprotocol.com](https://vacationrentalprotocol.com)

Live proof: [reference-implementation](https://vacationrentalprotocol.com/reference-implementation)

Evidence memo: [docs/first-mover-evidence-memo.md](./docs/first-mover-evidence-memo.md)

Spec draft: [spec/v0.1.md](./spec/v0.1.md)

Portable attestations draft: [spec/attestations-v0.1.md](./spec/attestations-v0.1.md)

Receipt envelope v1: [spec/receipt-v1.md](./spec/receipt-v1.md)

VRP JSON-LD context draft: [contexts/v1.jsonld](./contexts/v1.jsonld)

Architecture decision: [ADR 0001 - Portable Attestations v0.1](./docs/adr/0001-portable-attestations-v0.1.md)

Trust and interop decision: [ADR 0002 - No-Gatekeeper Trust and Interop Positioning](./docs/adr/0002-no-gatekeeper-trust-and-interop.md)

Interop and trust positioning: [docs/interop-and-trust-positioning.md](./docs/interop-and-trust-positioning.md)

Attestation implementation guide: [docs/implement-attestations.md](./docs/implement-attestations.md)

Core schemas: [schemas/discovery-v0.1.schema.json](./schemas/discovery-v0.1.schema.json), [schemas/jwks-v0.1.schema.json](./schemas/jwks-v0.1.schema.json), [schemas/verified-stay-offer-v0.1.schema.json](./schemas/verified-stay-offer-v0.1.schema.json)

Attestation schema: [schemas/attestations-v0.1.schema.json](./schemas/attestations-v0.1.schema.json)

Conformance vectors: [examples/conformance](./examples/conformance)

## What VRP Is

- An open protocol for vacation rental offer verification
- A versioned protocol (`protocol_version: "0.1"`)
- A host-owned domain model for source identity
- Signed verified stay offers for machine validation
- Ed25519 JWKS for key discovery and signature checks
- Freshness control via `valid_until`
- Exact price fields for quote fidelity
- Safe-to-quote guardrails for agent behavior
- A no-gatekeeper trust model where verifiers choose their own trust policy

## What VRP Is Not

- Not a marketplace
- Not an OTA
- Not a booking portal
- Not a ranking engine
- Not a payment processor
- Not a central issuer, trusted issuer registry, or accreditation program
- Not a replacement for host websites

## Interop Position

VRP is deliberately narrower than a full booking or commerce stack. It can
compose with UCP for checkout and order lifecycle, including lodging flows as
the UCP lodging profile matures, AP2 for payment mandates, MCP for future tool
exposure, and A2A for future agent-to-agent bindings. VRP v0.1 does not define
those runtime flows.

Self-issued host-domain attestations are appropriate for domain-control, node,
payment-path, and policy facts. Claims that need independent evidence, such as
guest identity or right-to-let, belong in future optional third-party credential
profiles where each verifier chooses which issuers to trust.

## Reference Implementation

[HemmaBo](https://hemmabo.com) is a reference implementation, provider, and federation using VRP-compatible host-owned domains.

**Live proof node:** [villaakerlyckan.se](https://villaakerlyckan.se)

## Developer Links

- Live HemmaBo MCP endpoint: `https://www.hemmabo.com/mcp`
- MCP server repo: [HemmaBo-se/hemmabo-mcp-server](https://github.com/HemmaBo-se/hemmabo-mcp-server)
- Proof node discovery: `https://villaakerlyckan.se/.well-known/vacation-rental.json`
- Proof node JWKS: `https://villaakerlyckan.se/.well-known/jwks.json`
- Contact: info@hemmabo.se

The HemmaBo MCP server is an implementation-specific integration, not a VRP
runtime tool defined by the v0.1 specification.

## License

VRP uses a dual-license boundary (ADR 0010 D7), so the standard is free to implement while the reference code carries an explicit patent grant:

| Path | License | What |
| --- | --- | --- |
| `spec/`, `schemas/`, `contexts/`, this `README` and the site pages | [CC0 1.0](./LICENSE) (public domain) | The **specification text** and machine-readable spec artifacts — copy and implement the standard freely. |
| `scripts/`, `examples/` (incl. `examples/conformance/` vectors) | [Apache-2.0](./LICENSE-CODE) | The **reference verification code** and **conformance test vectors** — Apache-2.0, which includes the royalty-free patent grant (§3). |

See also the spec-text patent non-assertion commitment in [`PATENTS.md`](./PATENTS.md).
