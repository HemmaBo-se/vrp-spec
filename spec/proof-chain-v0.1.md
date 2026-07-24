# VRP Booking Proof Chain — Specification v0.1

**Status:** Public draft

**Published:** 2026-07-23

**Repository:** https://github.com/HemmaBo-se/vrp-spec

**Builds on:** [Core VRP v0.1](./v0.1.md) (signed verified stay offers),
[Receipt Envelope v1](./receipt-v1.md) (issuance wrapper §14, verbatim delivery §15,
verifier walk-through §16), [Transparency Log v0.1](./transparency-log-v0.1.md)
(leaf hashing rule §4.1).

## 1. Scope

This document **names and normatively defines the Booking Proof Chain**: the
single derivation family that binds a booking's offer, payment, receipt, and
confirmation into one recomputable chain. Every link is the same primitive —

> **SHA-256 over the exact bytes of a node-signed compact-JWS artifact.**

The chain gives a booking confirmation the property this specification calls
**identifier-is-proof**: the string a guest or agent holds as their
confirmation is not a label somebody assigned — it is a value anybody can
recompute from the signed artifact and check against public state, with no
trusted party, no central registry, and no judge.

This specification defines no new runtime endpoints and no new string
dialect (see §6). It names, fixes, and makes citable a derivation that
conforming implementations already produce.

## 2. References

- [VRP Receipt Envelope v1](./receipt-v1.md) — the receipt artifact and its
  delivery rules.
- [VRP Transparency Log v0.1](./transparency-log-v0.1.md) — append-only
  anchoring of artifact hashes.
- [EIP-3009](https://eips.ethereum.org/EIPS/eip-3009) (informative) —
  `transferWithAuthorization` nonces, used by the x402 payment-binding
  profile in §4.
- RFC 7515 (JWS), RFC 6234 (SHA-256).

## 3. The chain (normative)

The Booking Proof Chain consists of three links. All hashes are SHA-256 over
the **exact bytes of the compact-JWS string as issued** — never over
re-serialized or re-canonicalized JSON (Receipt Envelope v1 §7 rule applies
chain-wide).

### 3.1 Link 1 — Offer hash (`offer_hash`)

```
offer_hash = SHA-256(offer compact-JWS bytes)
```

The verified stay offer is a node-signed compact JWS (Core VRP v0.1). Its
hash is the chain's root: it commits to the exact promised property, dates,
party size, and price.

### 3.2 Link 2 — Payment binding (rail profiles)

A payment is **chain-bound** when the settlement carries `offer_hash` in a
slot the rail preserves. Rail profiles:

- **x402 / EIP-3009 profile:** the 32-byte `nonce` of
  `transferWithAuthorization` equals `offer_hash`. Because consumed nonces
  are public on-chain state (`authorizationState(authorizer, nonce)` and the
  indexed `AuthorizationUsed` event), anyone who recomputes `offer_hash`
  from the offer JWS can confirm, permissionlessly, that exactly that offer
  was paid and by which address. *(Informative note: EIP-3009 verifiers
  treat the nonce as opaque; the binding is recomputable by any party told
  this rule, and enforced by uniqueness — a given offer can be paid this
  way at most once per payer.)*
- **Custodial rails (card / account-to-account):** the rail itself carries
  no artifact binding. A conforming node MUST retain the association
  between the settlement identifier and `offer_hash` in its booking
  records, and SHOULD carry `offer_hash` (full or truncated per §5) in any
  merchant-controlled reference or metadata slot the rail preserves.

*(Interoperability note, informative: Mastercard/Google "Verifiable Intent"
independently binds payment mandates via `transaction_id =
B64U(SHA-256(checkout_jwt))` — hash-of-a-merchant-signed-artifact is the
converging cross-industry pattern. The digest value is identical; only the
text encoding differs — see §5.)*

### 3.3 Link 3 — Receipt artifact hash: the confirmation reference

```
artifact_hash = "sha256:" + lowercase-hex( SHA-256(receipt wrapper-JWS bytes) )
```

The receipt (Receipt Envelope v1 §14) is the node-signed record of the
promise a confirmed booking settles. Its artifact hash is simultaneously:

1. the **transparency-log leaf** (Transparency Log v0.1 §4.1),
2. the **inclusion-proof lookup key** (`…/proof?hash=<artifact_hash>`), and
3. the **booking confirmation reference** — the chain's public face.

A booking confirmation under this specification **is** Link 3: a value
recomputable by any holder of the receipt JWS, resolvable against the
public log, and impossible to fabricate for a booking that does not exist.

## 4. Identifier-is-proof (normative)

Derived proof strings are only consumed in practice when verification is a
side effect of ordinary use. Conforming implementations therefore:

- MUST use `artifact_hash` as the functional lookup key for the receipt's
  inclusion proof on the issuing node's log surfaces;
- MUST deliver the full receipt wrapper-JWS to the booking's holder
  byte-verbatim (Receipt Envelope v1 §15) — **a bare hash proves nothing
  without the retained artifact it commits to**;
- MUST NOT present a booking as chain-confirmed on the strength of a
  hash-shaped string alone: verification is (a) recompute the hash from the
  retained JWS, (b) verify the JWS against the node's published keys,
  (c) check log inclusion;
- SHOULD carry the confirmation reference wherever the booking is
  represented to agents (status responses, machine-readable confirmation
  surfaces), so that the string a consumer encounters is always the
  recomputable one.

## 5. Encodings and truncation (normative)

- Canonical display form: `sha256:` + lowercase hex (64 hex chars).
- The same digest MAY be carried base64url-encoded where a carrier
  requires it. Verifiers MUST compare **digest bytes**, never string forms
  across encodings.
- Carriers with length limits (payment references, human-facing codes) MAY
  carry a **truncated** digest plus an error-detection code appropriate to
  the carrier. A truncated value is a *locator*, not a proof: verification
  is always recompute-then-compare against the full digest.

## 6. Non-goals (normative)

- **No new confirmation dialect.** This specification deliberately defines
  no wallet-address-shaped, branded, or otherwise novel confirmation
  format. No consumer parses such a format today, and address-shaped
  strings invite misdirected funds. The chain's strings are plain SHA-256
  digests riding in existing carriers (reservation-number fields, payment
  references, URLs) unchanged.
- **No settlement semantics.** Payment rails and their guarantees are out
  of scope (Core VRP v0.1 §5.2 reservation stands); §3.2 defines only how
  a settlement, once made, is bound to the chain.
- **No central verifier.** Anyone may verify; nobody must be asked.

## 7. Supersession (normative)

Lodging bookings mutate: reschedules, renegotiated totals, cancellations.
The chain handles mutation by **superseding receipts**, never by editing:

- A receipt issued because a prior receipt's promise changed SHOULD include
  `supersedes: "<artifact_hash of the prior receipt>"` at the envelope's
  top level.
- Both receipts remain anchored in the log. The superseded receipt remains
  valid **evidence of the promise that held before the change**; the
  superseding receipt states the promise that holds now.
- The **current** confirmation reference for a booking is the artifact hash
  of its latest unsuperseded receipt. Verifiers resolving a chain of
  `supersedes` links MUST treat a cycle or a fork (two unsuperseded
  receipts claiming the same predecessor) as a verification failure.
- A cancellation is a superseding receipt whose subject records the
  cancelled state; it does not remove history.

*(Receipts issued before this specification carry no `supersedes` field and
are unaffected.)*

## 8. Verifier walk-through (informative)

An agent holding a confirmation reference and receipt JWS for a booking:

1. Recompute `artifact_hash` from the exact receipt-JWS bytes; compare with
   the reference held.
2. Verify the wrapper JWS and inner attestations against the node's
   published keys (`/.well-known/jwks.json`, resolvable via the node's
   `did:web` document).
3. Fetch the inclusion proof for `artifact_hash` from the log; verify
   against a signed tree head.
4. If the receipt carries `supersedes`, walk to the referenced hash to
   reconstruct the booking's history; confirm no fork.
5. Where the payment used the x402 profile: recompute `offer_hash` from the
   offer JWS and check `authorizationState(payer, offer_hash)` on-chain.

At no step is any party asked to vouch. Every step is recomputation against
published, signed, or on-chain state.

## 9. Conformance

A node conforms to Booking Proof Chain v0.1 if:

1. its offers and receipts are node-signed compact JWS artifacts whose
   hashes follow §3;
2. receipt artifact hashes are log-anchored and serve as inclusion-proof
   lookup keys (§4);
3. receipt delivery is byte-verbatim to the holder (§4);
4. superseding receipts, where issued, follow §7;
5. it introduces no alternative confirmation dialect presented as
   chain-verified (§6).

## 10. Neutrality

The spec is vendor-neutral. HemmaBo is a reference implementer, not an
approval authority. Any node, on any stack, can produce and any party can
verify a Booking Proof Chain without permission from anyone.

## 11. License

Specification text: dedicated to the public domain under [CC0 1.0](../LICENSE).
