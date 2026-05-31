# ADR 0001: VRP Portable Attestations v0.1

**Status:** Proposed
**Date:** 2026-05-31

## Context

Vacation Rental Protocol (VRP) v0.1 proves that a concrete stay offer is real by verifying host-domain discovery metadata, host-domain signing keys, a fresh signed offer, exact price, availability, and the direct booking URL.

VRP also needs a way for agents and clients to understand portable trust history without making HemmaBo, or any other operator, the central issuer, registry, scorer, booking intermediary, OTA, marketplace, or trust authority.

The extension must preserve the core VRP model:

- The host-owned domain remains the source of truth for host-domain facts.
- Verification is cryptographic and decentralized, not reputation scoring.
- HemmaBo may publish a reference implementation and help author the standard, but does not own truth for VRP attestations.
- The existing VRP domain, `vacationrentalprotocol.com`, is the standards home. No new domain is introduced.

## Decision

VRP will define Portable Attestations v0.1 as an open, document-only extension to the core VRP v0.1 specification.

Portable attestations v0.1 will use the W3C Verifiable Credentials Data Model 2.0 and will be secured with VC JOSE/COSE as compact JWS for the v0.1 JSON profile. The protected JWS header for v0.1 credentials MUST include:

```json
{
  "typ": "vc+jwt",
  "alg": "EdDSA",
  "kid": "did:web:example-host.invalid#attestations-ed25519-2026-05"
}
```

The compact JWS envelope is the signature. Credential JSON MUST NOT include its own `signature` or `proof` member.

The JWS payload MUST use the registered JWT `iat` claim for signing time. VRP will not define an `issuedAt` credential property. Credential data validity MUST use `validFrom` and `validUntil`.

The credential `issuer` for v0.1 host attestations is the host-domain DID, such as `did:web:villaakerlyckan.se`. Offer signing keys and attestation signing keys share the same host-domain trust root through the host domain and DID, but they MAY use different key identifiers and different private keys. The standard MUST NOT require the same private key for signed offers and attestations.

VRP-specific terms will be defined in a VRP JSON-LD context at:

```text
https://vacationrentalprotocol.com/contexts/v1
```

Portable Attestations v0.1 will define only privacy-minimized, node-, policy-, and payment-path-oriented credential types:

- `VRPHostDomainCredential`
- `VRPPaymentPathCredential`
- `VRPPolicySnapshotCredential`
- `VRPVerifiedStayCredential`, only when it avoids guest identity and exact identifying stay dates

Portable Attestations v0.1 will explicitly exclude:

- guest reviews
- guest outcomes
- guest risk
- guest scores
- guest history
- guest-held review credentials
- guest-held selective disclosure credentials

Guest-held credentials and reviews are deferred to a future v0.2 design, likely using SD-JWT or another selective disclosure mechanism.

For status and revocation, v0.1 will define `VRPStatusListEntry` instead of claiming W3C `BitstringStatusListEntry` compatibility. If a future VRP version uses `BitstringStatusListEntry`, its status list MUST follow the W3C Bitstring Status List format completely.

This PR does not define or add runtime MCP tools. Future tools, if later specified, should use `snake_case` names such as `verify_vrp_attestations` and `get_vrp_attestation_bundle`. Names such as `issue_certificate`, `hemmabo_trust_score`, and `vrp.attestations.verify` are out of scope for this design.

## Consequences

Portable attestations can travel with a host node, export, or verification bundle without requiring a HemmaBo-operated registry or scoring service.

Verifiers can validate an attestation cryptographically and decide their own trust policy. VRP does not decide trust scores and does not certify hosts centrally.

The v0.1 status model is simpler than W3C Bitstring Status List and therefore easier to document honestly before a full privacy-preserving bitstring implementation exists. The tradeoff is that v0.1 status checks are less privacy-preserving and less compact than a conforming bitstring status list. Short credential validity windows remain important.

Keeping v0.1 away from guest reviews, guest history, and guest-held identity claims reduces GDPR and re-identification risk while leaving room for a stronger selective disclosure design in v0.2.
