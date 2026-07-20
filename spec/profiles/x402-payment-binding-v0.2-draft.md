# VRP x402 Payment Binding — v0.2 DRAFT

**Status: DRAFT — NOT NORMATIVE.** This document proposes the concrete binding
for the `booking.payment_options[]` slot reserved in
[`v0.1.md`](../v0.1.md) §5.2. Until the activation criteria in §2 are met, a
node MUST NOT publish `payment_options` and an agent MUST NOT treat its
presence as a defined, honorable payment path — exactly as v0.1 specifies.
Nothing in this draft weakens v0.1.

The keywords MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are interpreted as in
RFC 2119 and RFC 8174 when capitalized.

## 1. Why now

v0.1 §5.2 reserved the slot until "a winning rail and a non-US settlement path
exist." Both conditions have since moved:

- **Rail:** x402 was contributed to the Linux Foundation; the x402 Foundation
  launched operationally on 2026-07-14 with premier members including Adyen,
  AWS, Amex, Circle, Cloudflare, Coinbase, Google, Mastercard, Shopify,
  Stripe, and Visa. Spec v2 (2025-12-09) is stable enough to bind against.
- **Non-US settlement:** USDC/EURC are MiCA-compliant e-money tokens; an
  EU/Swedish host accepting stablecoin for its own stays requires no CASP
  licence (merchant self-acceptance is not a regulated crypto-asset service).
- **Payer capability:** an AI agent autonomously producing a valid EIP-3009
  `transferWithAuthorization` — the x402 v2 `exact`-scheme primitive — has
  been demonstrated (HemmaBo payer spike, 2026-07-20).

What has NOT yet been demonstrated is live settlement to a real host node.
Hence: draft, with activation criteria.

## 2. Activation criteria

This binding becomes eligible for normative status (v0.2) only when ALL hold:

1. At least one live node has received an on-chain x402 settlement for a real
   stay, to the host's own wallet, verified end to end.
2. A facilitator path (hosted or self-hosted) is confirmed available to the
   node's jurisdiction under terms compatible with public documentation.
3. The reference verifier validates the §5 receipt binding against live bytes.

## 3. The `payment_options[]` entry (proposed shape)

```json
{
  "rail": "x402",
  "x402_version": 2,
  "scheme": "exact",
  "network": "eip155:8453",
  "asset": "0x…",
  "asset_eip712": { "name": "EURC", "version": "2" },
  "pay_to": "0x…",
  "amount_atomic": "1430000000",
  "currency": "EURC",
  "offer_binding": "sha256-jws"
}
```

- `network` is CAIP-2. `amount_atomic` is a base-10 string in the asset's
  atomic units and MUST equal the signed `price` converted at no spread —
  the one-honest-total rule applies across rails.
- `asset_eip712` is REQUIRED for the `exact`/EVM scheme: the asset
  contract's EIP-712 domain (`name`, `version`), which the payer signs
  against and the wire-level `PaymentRequirements.extra` must carry —
  live facilitators reject requirements without it (proven in the
  2026-07-20 Base Sepolia settlement run). Publishing it inside the
  signed offer means the payer never has to fetch or guess the domain:
  a node MUST publish values that match the asset contract's own
  `name()`/`version()`.
- **`pay_to` MUST be the host's own wallet.** Never an intermediary, OTA, or
  infrastructure operator. This restates the v0.1 §5.2 invariant; a verifier
  MUST fail an offer whose `pay_to` is attested to belong to anyone but the
  host of `canonical_domain`.
- Rails MUST NOT gate discovery, verification, or offer retrieval
  (no-gatekeeper, v0.1 §1). `payment_options` is additive next to
  `direct_booking_url`, never a replacement.
- The entry rides INSIDE the signed offer payload (verifiable class, v0.1
  §5.4): the same Ed25519 JWS that pins the price pins the payment rail.

## 4. Offer-hash binding (the chain that makes the chain)

Without binding, a payment and an offer are only narratively linked. The
binding rule:

- **`offer_hash`** = lowercase hex SHA-256 over the offer's **compact-JWS
  bytes as received** — the same no-recanonicalization input rule as receipt
  D5 ([`receipt-v1.md`](../receipt-v1.md) §7).
- For the `exact` scheme on EVM networks, the EIP-3009 `nonce` (bytes32)
  MUST equal `offer_hash`.

Consequences, both intended:

1. The on-chain authorization is cryptographically bound to exactly one
   signed offer — the signature the payer's wallet produces covers the nonce,
   so no post-hoc relabeling can attach the payment to a different offer.
2. EIP-3009 contracts reject nonce reuse per payer, so **one offer settles at
   most once per payer** — replay of a paid offer fails on-chain, at the
   asset contract, with no protocol machinery.

Rejected alternative: carrying `offer_hash` in an unsigned x402 payload
extension field. The EIP-3009 signature does not cover extension fields, so
the binding would be assertable but not cryptographic.

Offer-request freshness (agent-supplied nonce echoed inside the signed offer)
is a complementary, separately scoped proposal and is NOT part of this
binding; `valid_until` remains the freshness bound (v0.1 §6).

## 5. Receipt attestation (`layer: "payment"`)

Receipt v1's open `layer` vocabulary already admits `payment`
([`receipt-v1.md`](../receipt-v1.md) §3) — no envelope change. The x402
profile of that layer asserts:

```json
{
  "layer": "payment",
  "valid_from": "…",
  "valid_until": "…",
  "ref": "0x<settlement transaction hash>",
  "signature": "<compact JWS over the assertion below>"
}
```

The signed assertion MUST include: `offer_hash`, `tx_hash`, `network`,
`payer`, `pay_to`, `amount_atomic`, `asset`. A profile-aware verifier MUST
check: `offer_hash` matches the receipt's offer-layer JWS bytes; `pay_to` and
`amount_atomic` match the signed offer's `payment_options` entry; and, when
chain access is available, that `tx_hash` is a finalized transfer matching
all of the above. Per-attestation status stays four-valued
(`verified|expired|unverifiable|invalid`) — chain-unreachable yields
`unverifiable`, never a fabricated pass.

## 6. Out of scope for v0.2

- **Refund settlement on-rail.** `rules.refund_schedule` (v0.1 §5.3) remains
  the computable predicate deciding *how much*; by which rail a refund is
  returned stays host-operational. A rail with no chargeback primitive makes
  the signed, computable schedule MORE load-bearing, not less.
- Sessions/`upto`/batch schemes; non-EVM networks (the `exact`/EVM binding
  comes first because it is what live facilitators settle today).
- Any custody, pooling, or forwarding construction. There is deliberately no
  shape in which funds pass through an intermediary.
