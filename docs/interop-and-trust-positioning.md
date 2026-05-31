# VRP Interop and Trust Positioning

**Status:** Public draft
**Date:** 2026-05-31

## Summary

VRP is the host-domain offer verification layer for vacation rentals.

Core VRP proves that a concrete offer is real. Portable Attestations prove
selected trust history without making HemmaBo, or any other operator, the
authority over truth.

VRP is intentionally not a complete booking, payment, guest identity, legal
verification, or discovery-index protocol. It is designed to compose with those
layers while keeping the host-owned domain first-class.

## No Central Issuer

VRP's trust model is no-gatekeeper by design.

VRP does not require:

- HemmaBo as issuer, verifier, registry, scorer, OTA, marketplace, booking
  intermediary, or trust authority.
- A VRP-operated trusted issuer registry.
- A VRP-operated host accreditation program.
- A VRP-operated certification company.
- A central discovery index before an offer or attestation can verify.

Verification starts from the host-owned domain:

1. Fetch the host-domain VRP discovery document.
2. Resolve the host-domain keys or DID document.
3. Verify the signed offer or attestation.
4. Apply protocol rules for freshness, exact price, availability, privacy, and
   status.
5. Apply the verifier's own trust policy.

A verifier may still use a trust policy. That policy can include local legal
requirements, insurer requirements, municipal registries, payment providers,
property managers, identity verification providers, or allowlists chosen by the
verifier. Those choices are not HemmaBo approval and not VRP-wide
certification.

## Self-Attestation Boundary

Self-issued host-domain credentials are appropriate for facts controlled by the
host domain, including:

- host-domain control
- VRP node metadata
- discovery URLs
- signing key identifiers
- payment path routing facts
- direct booking domains
- policy snapshot hashes
- privacy-minimized verified stay references

Self-issued host-domain credentials are not enough for claims that require
independent evidence, including:

- guest identity verification
- guest payment guarantees
- right-to-let
- local short-term-rental license status
- property ownership
- insurance coverage
- legal compliance

Future VRP versions may define optional third-party credential profiles for
those claims. The issuer trust decision should remain verifier-chosen, not
centralized in HemmaBo or the VRP standards site.

## Relationship to Adjacent Standards

VRP should compose with the agent-commerce stack instead of replacing it.

| Layer | VRP position |
| --- | --- |
| UCP | Complementary. UCP can handle checkout, order lifecycle, and merchant-of-record commerce flows, including lodging flows as the UCP lodging profile matures. VRP proves the host-domain offer and can hand off through a signed direct booking URL or future optional UCP manifest reference. |
| AP2 | Complementary. AP2 can handle cryptographic payment mandates and payment authorization. VRP v0.1 does not define payment mandates or raw payment processing. |
| MCP | Complementary. MCP can expose retrieval or verification behavior as tools in a future profile. VRP v0.1 defines documents and verification rules, not runtime tools. |
| A2A | Complementary. A2A can carry future guest-agent and host-agent negotiation. VRP v0.1 does not define an A2A binding. |
| W3C VC 2.0 | Used by VRP Portable Attestations. |
| VC JOSE/COSE | Canonical v0.1 security format for VRP Portable Attestations as compact JWS with `typ: "vc+jwt"` and `alg: "EdDSA"`. |
| W3C Data Integrity | Possible future interoperability mapping. VRP v0.1 does not use embedded `proof` objects. |

## What VRP Should Not Copy

VRP should not add a mandatory central trusted issuer registry merely to look
more complete.

VRP should not publish a HemmaBo trust score.

VRP should not call host-domain self-attestation "right-to-let verification" or
"legal compliance verification."

VRP should not publish guest reviews, guest risk, guest outcome, guest scores,
or guest history in v0.1.

VRP should not define runtime MCP tools until the document layer is stable and
there is at least one interoperable verifier profile.

## Roadmap Gaps

The verified gaps are real and should be named directly:

- Guest identity verification is out of scope for v0.1.
- Right-to-let and local license verification are out of scope for v0.1.
- Payment mandates are out of scope for v0.1.
- Full autonomous booking confirmation is out of scope for v0.1.
- Centralized search discovery is out of scope for v0.1.

The recommended path is not to make HemmaBo the missing authority. The
recommended path is to add optional profiles that let independent issuers,
payment providers, search indexes, and host tools interoperate while VRP keeps
the host-domain offer proof gatekeeper-free.
