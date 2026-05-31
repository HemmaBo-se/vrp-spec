# Implement VRP Portable Attestations

This guide describes how a host-owned domain can publish VRP Portable Attestations v0.1 without relying on HemmaBo, a central registry, a marketplace, an OTA, a booking intermediary, or a trust scoring service.

Portable attestations do not replace core VRP offer verification. A fresh signed offer is still required before an agent may quote availability, exact price, or a direct booking URL.

## Minimum Publishing Profile

1. Publish a `did:web` DID document for the host domain.
2. Include an Ed25519 verification method for attestation JWS verification.
3. Use a `kid` controlled by the host-domain DID, such as `did:web:example-host.invalid#attestations-ed25519-2026-05`.
4. Sign credentials as compact JWS with `typ: "vc+jwt"` and `alg: "EdDSA"`.
5. Include the W3C VC v2 context and the VRP context in the JWS payload.
6. Use `iat` for JWS signing time, and `validFrom` / `validUntil` for credential validity.
7. Do not include `proof`, `signature`, or `issuedAt` in the credential JSON.
8. Publish status only as `VRPStatusListEntry` unless a future version defines a full W3C Bitstring Status List profile.

## DID Web Document

For issuer `did:web:example-host.invalid`, the DID document is published at:

```text
https://example-host.invalid/.well-known/did.json
```

The DID document should include an attestation verification method that is controlled by the host-domain DID. The same host-domain trust root may also control a separate offer-signing key. The private keys do not need to be the same.

Example: [did-web-document.v0.1.json](../examples/attestations/did-web-document.v0.1.json).

## Context Publishing

VRP terms are defined by the VRP context:

```text
https://vacationrentalprotocol.com/contexts/v1
```

The repository copy is [contexts/v1.jsonld](../contexts/v1.jsonld). Deployments should serve the canonical extensionless URL above and may also serve `/contexts/v1.jsonld` as an equivalent copy. Both should return the same JSON-LD document.

## Privacy Checklist

Do not publish guest reviews, guest outcomes, guest risk, guest scores, or guest history in v0.1.

`VRPVerifiedStayCredential`, if used, must stay privacy-minimized:

- use an opaque `stayRef`
- use `verifiedOfferHash`
- omit guest name, email, phone, guest DID, and payment details
- omit exact stay dates when they could identify the guest
- omit review text and guest outcome data

Guest-held credentials and reviews are deferred to a future v0.2 design with selective disclosure.
