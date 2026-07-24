# VRP Node Seal — Specification v0.1

**Status:** Public draft — the pattern is named and its bytes are fixed; this
version requires no new runtime behavior from agents or payment rails (see
§1 and §9).

**Published:** 2026-07-24

**Repository:** https://github.com/HemmaBo-se/vrp-spec

**Builds on:** [Core VRP v0.1](./v0.1.md) (`did:web` node identity, signed
offers), [Well-Known URI v0.1](./well-known-uri-v0.1.md) (discovery layout),
[Booking Proof Chain v0.1](./proof-chain-v0.1.md) (supersession semantics §7).

## 1. Scope

This document **names and normatively defines the Node Seal**: a
two-directional, independently verifiable binding between a node's **domain
identity** and its **payment-receiving key**.

The gap it closes: agentic payment ecosystems index and pay sellers by bare
payment address, with no proof of who an address belongs to. The funded
agent-payment stack verifies the **buyer**; nothing verifies that the address
an agent is about to pay belongs to the domain whose offer the agent just
read. The seal is the seller-side answer, spoken in the payment ecosystem's
own dialect:

> **The promise comes from the same key that receives the money.**

The node's Ed25519 offer signature says *the domain promises*. The seal says
*the payment recipient promises*. A verifier that checks both has closed the
loop: mouth and hand are the same party.

This version defines the seal artifact, its location, its verification, and
its lifecycle. It deliberately requires nothing new at runtime: it fixes the
bytes so that when a consuming rail or indexer exists, conforming nodes
already agree on what to publish and verifiers on what to check.

## 2. References

- [DIF Well-Known DID Configuration](https://identity.foundation/.well-known/resources/did-configuration/)
  (informative) — "Domain Linkage": the same bidirectional
  domain-⇄-key architecture, here applied to a payment key.
- [did:pkh](https://github.com/w3c-ccg/did-pkh) (informative, draft) —
  payment accounts as DID subjects.
- [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) (informative) — nearest
  active neighbor (on-chain agent identity registry). The seal is off-chain
  and requires no transaction.
- [EIP-191](https://eips.ethereum.org/EIPS/eip-191) — `personal_sign` message
  signing. [CAIP-10](https://chainagnostic.org/CAIPs/caip-10) — account
  identifiers.
- RFC 8615 (well-known URIs), RFC 6234 (SHA-256).
- UCP seller key publication (`/.well-known/ucp`, ES256 + JCS) — convergent
  seller-side pattern; see §8.

## 3. The seal artifact (normative)

A seal is a JSON document served from the node's **own canonical origin**
over `https`, with media type `application/json`, at:

```
/.well-known/vrp/node-seal/v0.1/seal.json
```

It MUST NOT be served via a cross-origin redirect (the node's apex origin is
the trust root, exactly as for `did:web`).

```json
{
  "vrp_node_seal": "0.1",
  "domain": "node.example",
  "did": "did:web:node.example",
  "payment_address": "eip155:1:0x0000000000000000000000000000000000000001",
  "statement": "VRP Node Seal v0.1\ndomain: node.example\ndid: did:web:node.example\npayment_address: eip155:1:0x0000000000000000000000000000000000000001\nissued_at: 2026-07-24T00:00:00Z",
  "signature": "0x…",
  "issued_at": "2026-07-24T00:00:00Z",
  "supersedes": null
}
```

*(Example values; the signature shown is a placeholder and does not verify.)*

### 3.1 Statement bytes

The `statement` is the **exact byte sequence** signed. It is reconstructed
from the document's own fields as five lines joined by single `\n` (LF), no
trailing newline, UTF-8:

```
VRP Node Seal v0.1
domain: <domain>
did: <did>
payment_address: <payment_address>
issued_at: <issued_at>
```

Field values MUST match the JSON fields byte-for-byte. A verifier MUST
reconstruct the statement from the fields and compare it to `statement`;
any difference is a verification failure. This is the same
no-re-canonicalization discipline as the rest of VRP: what is verified is
the exact bytes, never a re-serialization.

### 3.2 Signature

`signature` is an [EIP-191] `personal_sign` signature over the statement
bytes. The address recovered from the signature MUST equal the account
component of `payment_address`. Signing is an offline operation: the
address needs no on-chain history, no funds, and no transaction.

### 3.3 The two directions

Both directions MUST hold; either alone is not a seal:

1. **Domain → key.** The document is served from the node's canonical
   origin under TLS — the same trust root `did:web` uses. Serving it *is*
   the domain's declaration of the address.
2. **Key → domain.** The payment key signs the statement naming the domain
   and DID. Any holder of standard EVM tooling can recover the signer and
   check it — without knowing anything about `did:web`.

### 3.4 Consistency with other surfaces

If the node advertises an agent-payable address on any other machine
surface for the same rail (payment configuration, checkout metadata), that
address MUST equal `payment_address`. One seal document binds one address;
multiple simultaneous addresses are out of scope for v0.1.

## 4. Verification (normative)

A verifier:

1. fetches the seal from the node's canonical origin (`https`, no
   cross-origin redirect);
2. reconstructs the statement bytes from the JSON fields (§3.1) and
   byte-compares with `statement`;
3. recovers the signer from `signature` over the statement bytes (§3.2) and
   compares with `payment_address`;
4. resolves `/.well-known/did.json` on the same origin and checks that
   `did` matches;
5. where another surface advertises a payment address (§3.4), checks that
   it equals the sealed one.

Any mismatch at any step is a seal failure. Freshness: the seal currently
served is the current seal; verifiers MUST NOT rely on cached seals beyond
ordinary HTTP cache semantics.

## 5. Lifecycle: rotation, supersession, revocation (normative)

Key lifecycle is the expensive part of any signing scheme — it is specified
here from the start, not retrofitted.

- `issued_at` is REQUIRED.
- **Rotation / address change:** publish a new seal whose `supersedes` is
  `"sha256:" + lowercase-hex(SHA-256(superseded statement bytes))` — the
  same recomputable-reference discipline as the Booking Proof Chain.
  Supersession chains follow Booking Proof Chain v0.1 §7: forks and cycles
  are verification failures.
- **Revocation without replacement:** the node serves HTTP **410 Gone** at
  the seal path. Verifiers MUST treat 410 as an explicit revocation
  (distinct from 404, which means no seal was published).
- **Compromised payment key:** the node MUST stop advertising the address
  on all surfaces and MUST revoke or supersede the seal. The consistency
  check (§3.4) then fails closed for verifiers. The seal binds identity; it
  cannot recover funds — key custody is out of scope.
- Nodes SHOULD re-issue the seal at least every 12 months as a freshness
  signal, and MUST re-issue on any field change.

## 6. Never a gate (normative)

The seal is **seller-side evidence for payment-side verifiers** — it points
from the node outward, never back at agents:

- A node MUST NOT condition content, offers, availability, or booking flows
  on any agent presenting seal-related material.
- Verifying the seal is always optional; a node MUST serve all agents
  identically whether or not they verify anything.
- Verifiers SHOULD NOT interpret the absence of a seal as a negative signal
  about a node: v0.1 is optional and newly published.

*(Rationale, informative: most production agents do not sign their
requests. Any gate built on agent-side cryptography excludes the very
consumers this specification serves.)*

## 7. Non-goals (normative)

- **No chain, no mainnet, no funds.** Nothing here requires an on-chain
  transaction or an address that has ever transacted.
- **Not a badge.** The seal proves a key–domain binding — never quality,
  legitimacy of the business, or any property of the stay.
- **No new confirmation dialect.** Booking Proof Chain v0.1 §6 stands
  unchanged.
- **No payment semantics.** Rails and their guarantees are out of scope.
- **No central registry.** A seal lives in exactly one place: the node's
  own origin. There is nothing to submit and nobody to ask.

## 8. Dialect interoperability (informative)

EIP-191 `personal_sign` is chosen because it is the dialect the agentic
payment ecosystems already parse natively. Where seller-side signing exists
elsewhere in the wild, the dialect is ES256 + JCS (UCP publishes seller
`signing_keys` under `/.well-known/ucp` on the seller's own domain; AP2
merchant JWTs are ES256). The binding semantics are identical; a future
profile MAY express the same statement as an ES256/JCS-signed JWS for those
consumers. Verifiers compare **bindings**, never encodings. Nothing in this
version changes any existing VRP signature: offers and receipts remain
Ed25519 compact JWS.

## 9. Deployment status (informative)

As of publication, no payment rail or indexer verifies domain↔address
bindings — sellers are indexed by bare `payTo`. This specification
therefore ships as fixed ground rather than as a runtime requirement: nodes
MAY publish seals today; the reference implementation will publish its seal
alongside the first consuming rail or indexer.

**Reserved for future versions:** *sealed statements* — statements about
specific offers or commitments, signed by the same payment key in the same
dialect, so that the receiving key can speak about what it is receiving
payment *for*. The name and the concept are reserved here; the format is
deliberately not fixed in v0.1.

## 10. Conformance

A node conforms to Node Seal v0.1 if:

1. its seal is served at the defined path from its canonical origin (§3);
2. the statement reconstructs byte-exactly from the document fields (§3.1);
3. the signature recovers to the sealed address (§3.2);
4. `did` matches the origin's `/.well-known/did.json` (§4);
5. every agent-payable address it advertises equals the sealed address
   (§3.4);
6. rotation, supersession, and revocation follow §5;
7. it gates nothing on the seal (§6).

## 11. Neutrality

The spec is vendor-neutral. HemmaBo is a reference implementer, not an
approval authority. Any node, on any stack, can publish and any party can
verify a Node Seal without permission from anyone.

## 12. License

Specification text: dedicated to the public domain under [CC0 1.0](../LICENSE).
