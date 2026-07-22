# ADR 0002: No-Gatekeeper Trust and Interop Positioning

**Status:** Accepted
**Date:** 2026-05-31 (proposed) · 2026-07-22 (accepted)

## Context

VRP is entering an agent-commerce landscape that includes UCP, AP2, A2A, MCP,
W3C Verifiable Credentials, DID methods, and short-term-rental-specific
protocol work.

Some trust models for agentic lodging use trusted issuer registries,
accreditation programs, or certification companies to decide which credentials
count as verified. Those models can support strong independent claims, such as
guest identity verification or right-to-let verification, but they introduce a
gatekeeper between an independent host and agent trust.

VRP's core purpose is narrower: prove that a concrete vacation rental offer is
real because it was signed by the host-owned domain, and let privacy-minimized
attestations travel with the host node without making HemmaBo or the VRP
standards site the authority over truth.

## Decision

VRP will keep a no-gatekeeper trust model.

VRP specifications MUST NOT require:

- HemmaBo as issuer, verifier, registry, scorer, booking intermediary,
  marketplace, OTA, or trust authority.
- A VRP-operated trusted issuer registry.
- A VRP-operated host accreditation program.
- A VRP-operated certification company.
- A central discovery index as a prerequisite for offer or attestation
  verification.

VRP verification MUST remain possible from the host-owned domain, the published
discovery artifacts, the host-controlled keys, the signed offer or credential,
and the relevant public specifications.

Relying parties MAY apply their own trust policies. A trust policy MAY include
allowlists, deny lists, local legal requirements, insurers, payment providers,
municipal registries, property managers, identity verification providers, or
other third-party credential issuers. Those policies are outside VRP and MUST
NOT be presented as HemmaBo approval or VRP-wide certification.

VRP v0.1 will treat self-issued host-domain credentials as appropriate for
host-domain, node, payment-path, and policy-snapshot facts controlled by the
host domain. VRP v0.1 will not claim that a host can self-attest facts that need
independent evidence, such as guest identity, right-to-let, property license,
insurance coverage, or legal compliance.

Future versions MAY define optional third-party credential profiles for
right-to-let, license, insurance, payment guarantees, or guest-held selective
disclosure. If they do, the issuer trust decision will remain verifier-chosen.
VRP will not introduce a mandatory central issuer registry.

VRP will position itself as complementary to adjacent agent-commerce standards:

- UCP may handle checkout, order lifecycle, and merchant-of-record commerce
  flows, including lodging flows as the UCP lodging profile matures.
- AP2 may handle payment mandates and cryptographic payment authorization.
- MCP may expose VRP verification or retrieval behavior as tools in future
  profiles, using `snake_case` tool names.
- A2A may carry host-agent and guest-agent negotiation in future bindings.

This ADR does not add runtime tools, payment flows, booking automation, guest
identity verification, or right-to-let verification.

VC JOSE/COSE compact JWS remains the canonical v0.1 credential security format
for VRP Portable Attestations. Future versions MAY define an interoperability
mapping for W3C Data Integrity proofs, but v0.1 does not require embedded
`proof` objects.

## Consequences

An independent host can be first-class in VRP as soon as the host controls a
domain, publishes VRP artifacts, signs offers, and publishes valid portable
attestations.

VRP's strongest distinction is not that it tries to replace full booking,
payment, guest-IDV, or legal-verification systems. Its distinction is that the
core offer and host-domain attestation layer does not depend on a central
issuer, registry, or accreditation gatekeeper.

Claims that need independent evidence still need independent issuers. The
difference is that VRP lets verifiers choose those issuers through their own
policy instead of inheriting a single registry from HemmaBo or the VRP standards
site.

Discovery can be provided by search engines, crawlers, directories, host sites,
agent indexes, or commercial products. Discovery providers do not become VRP
trust authorities merely by indexing VRP nodes.

This keeps v0.1 implementable by a single live node while leaving room for
stronger future credentials without changing VRP into a centralized
certification business.
