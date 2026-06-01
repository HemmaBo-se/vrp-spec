# VRP Portable Attestations - Specification v0.1

**Status:** Public draft

**Published:** 2026-05-31

**Canonical context:** https://vacationrentalprotocol.com/contexts/v1

**Repository:** https://github.com/HemmaBo-se/vrp-spec

## 1. Scope

VRP Portable Attestations v0.1 defines privacy-minimized Verifiable Credentials for portable trust history around VRP host nodes, payment paths, policy snapshots, and optionally verified stays.

Core VRP proves that a concrete offer is real. Portable attestations prove selected trust history without making HemmaBo, or any other operator, the authority over truth.

This specification is an open standard layer on top of VRP. It does not define runtime tools, an OTA, a marketplace, a booking intermediary, a central issuer, a central registry, a ranking engine, a trust score, or a HemmaBo certification service.

VRP Portable Attestations v0.1 are intentionally no-gatekeeper. A verifier MAY apply its own trust policy, but the specification MUST NOT require a VRP-operated trusted issuer registry, HemmaBo approval, host accreditation program, certification company, or central discovery index before an attestation can be verified.

## 2. References

Portable Attestations v0.1 uses:

- W3C Verifiable Credentials Data Model 2.0: https://www.w3.org/TR/vc-data-model/
- W3C Securing Verifiable Credentials using JOSE and COSE: https://www.w3.org/TR/vc-jose-cose/
- W3C Decentralized Identifiers (DIDs) 1.0: https://www.w3.org/TR/did-core/
- `did:web` method: https://w3c-ccg.github.io/did-method-web/
- Universal Commerce Protocol (UCP): https://ucp.dev/
- Agent Payments Protocol (AP2): https://ap2-protocol.org/
- Model Context Protocol (MCP): https://modelcontextprotocol.io/
- Agent2Agent Protocol (A2A): https://a2a-protocol.org/

VRP Portable Attestations may compose with adjacent agent-commerce standards, but does not replace them:

- UCP may handle checkout, order lifecycle, and merchant-of-record commerce flows, including lodging flows as the UCP lodging profile matures.
- AP2 may handle cryptographic payment mandates and payment authorization.
- MCP may expose future retrieval or verification behavior as tools, but v0.1 defines no runtime tools.
- A2A may carry future guest-agent and host-agent negotiation, but v0.1 defines no A2A binding.

The keywords MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are to be interpreted as described in RFC 2119 and RFC 8174 when they appear in all capitals.

## 3. Trust Model

Each attestation is issued by the DID controlled by the host-owned domain that controls the relevant VRP node facts.

The v0.1 issuer form is:

```text
did:web:{host-domain}
```

Example:

```text
did:web:villaakerlyckan.se
```

The host-domain DID document is the trust root for attestation verification. Offer signatures and attestation signatures MAY use separate `kid` values and separate private keys as long as the verification keys are controlled by the same host-domain trust root. Implementations MUST NOT require the private key used for VRP offers to be the same private key used for VRP attestations.

For `did:web:{host-domain}`, the DID document is published at:

```text
https://{host-domain}/.well-known/did.json
```

The attestation JWS `kid` MUST be a DID URL controlled by the issuer DID. The referenced verification method SHOULD be listed in `assertionMethod` or otherwise be usable for assertion verification by the issuer DID. A host-domain DID MAY publish separate verification methods for VRP offers and VRP attestations.

Example DID document: [`did-web-document.v0.1.json`](../examples/attestations/did-web-document.v0.1.json).

HemmaBo may publish a reference implementation and help author this standard. HemmaBo MUST NOT be required as an issuer, registry, scorer, booking intermediary, OTA, marketplace, or trust authority for portable attestations to verify.

Self-issued host-domain attestations are appropriate only for facts controlled by the host domain, such as node metadata, discovery URLs, key identifiers, payment-path routing facts, policy hashes, and privacy-minimized stay references. v0.1 MUST NOT treat self-issued host-domain attestations as independent proof of guest identity, right-to-let, local license status, property ownership, insurance coverage, or legal compliance.

Claims that require independent evidence MAY be defined in a future VRP profile as third-party credentials. If such profiles are defined, issuer trust remains a verifier policy decision and MUST NOT require a mandatory HemmaBo or VRP trusted issuer registry.

## 4. Credential Encoding

Portable Attestations v0.1 credentials are Verifiable Credentials conforming to the W3C Verifiable Credentials Data Model 2.0.

The unsecured credential payload MUST include:

- `@context`, including `https://www.w3.org/ns/credentials/v2`
- `@context`, including `https://vacationrentalprotocol.com/contexts/v1`
- `type`, including `VerifiableCredential` and one VRP credential type
- `issuer`, using the host-domain DID
- `iat`, as the registered JWT signing-time claim
- `validFrom`
- `validUntil`
- `credentialSubject`

The VRP context defines VRP extension terms only. It does not replace the W3C VC v2 context. Implementations MUST NOT omit `https://www.w3.org/ns/credentials/v2` when using `https://vacationrentalprotocol.com/contexts/v1`.

The unsecured credential payload MUST NOT include:

- `proof`
- `signature`
- `issuedAt`

The compact JWS payload MUST include the registered JWT `iat` claim. The `iat` claim represents the signing time of the JWS envelope. It is distinct from `validFrom` and `validUntil`, which define the validity period of the credential data.

The compact JWS protected header MUST include:

```json
{
  "typ": "vc+jwt",
  "alg": "EdDSA",
  "kid": "did:web:example-host.invalid#attestations-ed25519-2026-05"
}
```

The `kid` MUST identify an Ed25519 verification key controlled by the credential issuer DID. `alg` MUST be `EdDSA`.

The `kid` SHOULD be purpose-specific enough to support key rotation and separation, for example `#attestations-ed25519-2026-05`. A verifier MUST NOT infer a trust score, certification level, or HemmaBo approval from a `kid` value.

The compact JWS envelope is the signature:

```text
BASE64URL(UTF8(protected-header)) "." BASE64URL(UTF8(payload)) "." BASE64URL(signature)
```

Credential JSON MUST NOT duplicate that signature with a `signature` or `proof` property.

## 5. Credential Types

### 5.1 VRPHostDomainCredential

`VRPHostDomainCredential` attests host-domain VRP node facts, such as canonical domain, discovery URL, JWKS URL, and supported VRP protocol version.

The `credentialSubject` SHOULD identify the host-domain DID and SHOULD include:

- `type`: `VRPHostDomain`
- `canonicalDomain`
- `vrpDiscoveryUrl`
- `jwksUrl`
- `protocol`
- `protocolVersion`
- `domainControlAttested`

This credential does not make the issuer a central certifier of other nodes. It is a portable statement by the host-domain DID about its own node facts.

### 5.2 VRPPaymentPathCredential

`VRPPaymentPathCredential` attests payment path facts for a host-domain direct booking flow. It is about routing and control of the payment path, not guest payment outcomes.

The `credentialSubject` SHOULD include:

- `type`: `VRPPaymentPath`
- `canonicalDomain`
- `paymentProcessor`
- `checkoutDomain`
- `directBookingDomain`
- `merchantOfRecord`
- `paymentFactsSource`

This credential MUST NOT include guest identity, booking identity, card data, payment status, refunds, disputes, risk scores, or guest outcomes.

### 5.3 VRPPolicySnapshotCredential

`VRPPolicySnapshotCredential` attests a privacy-minimized snapshot of host-domain policies. It is intended to preserve policy provenance without embedding guest data.

The `credentialSubject` SHOULD include:

- `type`: `VRPPolicySnapshot`
- `canonicalDomain`
- `policyRef`
- `policyUrl`
- `policyHash`
- `policyVersion`
- `appliesTo`

The policy hash SHOULD be computed over the canonical policy artifact or an explicitly documented canonicalization of it. A verifier MUST NOT treat a policy snapshot as proof of a guest-specific outcome.

### 5.4 VRPVerifiedStayCredential

`VRPVerifiedStayCredential` is OPTIONAL in v0.1. If used, it attests that a stay reference is linked to a previously verified VRP offer without identifying the guest.

The `credentialSubject` SHOULD include:

- `type`: `VRPVerifiedStay`
- `stayRef`
- `verifiedOfferHash`
- `coarseStayPeriod`, if a period is included
- `canonicalDomain`
- `propertyRef`, only when it does not identify the guest

`VRPVerifiedStayCredential` MUST NOT include:

- guest name
- guest email
- guest phone number
- guest DID
- payment instrument
- exact stay dates when they could identify a guest
- check-in or check-out timestamps
- review text
- guest outcome
- guest risk
- guest score
- guest history

`stayRef` MUST be opaque and non-reversible. `verifiedOfferHash` SHOULD be the SHA-256 hash of the exact compact JWS string for the verified stay offer that was used for the stay, encoded as `sha256:{hex}` or `sha256:{base64url}`.

Issuers SHOULD omit `coarseStayPeriod` when month-level or season-level disclosure could identify the guest. Guest-held credentials, reviews, and selective disclosure are deferred to v0.2.

## 6. Status and Revocation

Portable Attestations v0.1 defines `VRPStatusListEntry` for simple status and revocation.

This specification does not claim compatibility with W3C `BitstringStatusListEntry`. If a future VRP version uses `BitstringStatusListEntry`, the status list MUST follow the W3C Bitstring Status List format completely, including the required `BitstringStatusListCredential` data model.

A credential MAY include `credentialStatus`:

```json
{
  "id": "https://example-host.invalid/.well-known/vrp/status/attestations-v0.1.json#host-domain-2026-05",
  "type": "VRPStatusListEntry",
  "statusPurpose": "revocation",
  "statusListUrl": "https://example-host.invalid/.well-known/vrp/status/attestations-v0.1.json",
  "statusRef": "host-domain-2026-05"
}
```

For `VRPStatusListEntry`:

- `type` MUST be `VRPStatusListEntry`.
- `statusPurpose` MUST be `revocation` or `suspension`.
- `statusListUrl` MUST be an HTTPS URL controlled by the issuer host domain.
- `statusRef` MUST be opaque and unique within the referenced status list.

The status list document SHOULD use this shape:

```json
{
  "@context": ["https://vacationrentalprotocol.com/contexts/v1"],
  "type": "VRPStatusList",
  "issuer": "did:web:example-host.invalid",
  "statusPurpose": "revocation",
  "validFrom": "2026-05-31T00:00:00Z",
  "validUntil": "2026-06-30T00:00:00Z",
  "entries": [
    {
      "statusRef": "host-domain-2026-05",
      "status": "valid"
    }
  ]
}
```

If status is absent, stale, unreachable, malformed, or not controlled by the issuer host domain, verifiers MUST treat the credential status as unknown. Unknown status MUST NOT be converted into either revoked or not revoked.

## 7. Bundles

A VRP attestation bundle is a transport container for one or more compact JWS credentials. A bundle does not create trust by itself.

Bundle entries SHOULD include:

- `type`
- `mediaType`: `application/vc+jwt`
- `compactJws`

Bundle entries MUST NOT require a HemmaBo endpoint or registry. Future retrieval mechanisms may be defined later, but this v0.1 specification does not define MCP tools or new runtime endpoints.

If future MCP tools are specified, their names SHOULD use `snake_case`, such as:

- `verify_vrp_attestations`
- `get_vrp_attestation_bundle`

The following names are out of scope for VRP Portable Attestations:

- `issue_certificate`
- `hemmabo_trust_score`
- `vrp.attestations.verify`

## 8. Verification

A verifier of a v0.1 portable attestation MUST:

1. Decode the compact JWS protected header and payload.
2. Confirm `typ` is `vc+jwt`.
3. Confirm `alg` is `EdDSA`.
4. Resolve the issuer DID from the credential `issuer`.
5. Confirm the `kid` identifies an Ed25519 verification key controlled by that issuer DID.
6. Verify the compact JWS signature.
7. Confirm the credential includes the W3C VC v2 context and the VRP v1 context.
8. Confirm the credential type is one of the v0.1 VRP credential types.
9. Confirm `validFrom` and `validUntil` are present and current.
10. Confirm there is no `proof`, `signature`, or `issuedAt` property in the credential JSON.
11. Apply the privacy rules for the credential type.
12. Resolve and check `credentialStatus` when present.

Attestations do not replace core VRP offer verification. A valid attestation MUST NOT make an unsigned, expired, unavailable, inexact, or non-quoteable VRP offer safe to quote.

## 9. Privacy and GDPR

Portable Attestations v0.1 uses data minimization as a protocol requirement.

Credentials MUST NOT publish guest reviews, guest outcomes, guest risk, guest scores, or guest history.

Credentials MUST NOT include direct guest identifiers such as name, email address, phone number, payment instrument, guest DID, or exact stay dates that can identify the guest.

`VRPVerifiedStayCredential`, if used, MUST use `stayRef`, `verifiedOfferHash`, and at most a coarse non-identifying period such as a month or season. Issuers SHOULD omit the period when it could identify the guest.

Guest-held credentials and reviews are out of scope for v0.1 and are deferred to v0.2, where selective disclosure such as SD-JWT can be evaluated.

## 10. Machine-Readable Schema

The JSON Schema profile for v0.1 examples and payload artifacts is:

```text
https://vacationrentalprotocol.com/schemas/attestations-v0.1.schema.json
```

Repository copy: [`schemas/attestations-v0.1.schema.json`](../schemas/attestations-v0.1.schema.json).

The schema is an interoperability aid. It does not create a central validator, registry, issuer service, certification service, marketplace, OTA, booking intermediary, or trust authority.

## 11. Examples

Example files are in [`examples/attestations`](../examples/attestations/):

- `did-web-document.v0.1.json`
- `jws-header.ed25519.v0.1.json`
- `host-domain-credential.payload.v0.1.json`
- `payment-path-credential.payload.v0.1.json`
- `policy-snapshot-credential.payload.v0.1.json`
- `verified-stay-credential.payload.v0.1.json`
- `status-list.v0.1.json`
- `attestation-bundle.v0.1.json`

The payload examples are unsigned JWS payload examples. Production credentials are compact JWS envelopes over those payloads.

## 12. License

Apache 2.0 - see [LICENSE](../LICENSE).
