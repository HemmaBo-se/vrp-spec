# VRP Schemas

This directory contains machine-readable schemas for VRP draft artifacts.

Core VRP v0.1 schemas:

```text
https://vacationrentalprotocol.com/schemas/discovery-v0.1.schema.json
https://vacationrentalprotocol.com/schemas/jwks-v0.1.schema.json
https://vacationrentalprotocol.com/schemas/verified-stay-offer-v0.1.schema.json
https://vacationrentalprotocol.com/schemas/verified-stay-offer-verification-result-v0.1.schema.json
```

Repository copies:

- [`discovery-v0.1.schema.json`](./discovery-v0.1.schema.json)
- [`jwks-v0.1.schema.json`](./jwks-v0.1.schema.json)
- [`verified-stay-offer-v0.1.schema.json`](./verified-stay-offer-v0.1.schema.json)
- [`verified-stay-offer-verification-result-v0.1.schema.json`](./verified-stay-offer-verification-result-v0.1.schema.json)

Portable Attestations v0.1 schema:

```text
https://vacationrentalprotocol.com/schemas/attestations-v0.1.schema.json
```

Repository copy: [`attestations-v0.1.schema.json`](./attestations-v0.1.schema.json)

VRP Receipt v1 schema (ADR 0010 — the receipt envelope that wraps offer + transport attestations):

```text
https://vacationrentalprotocol.com/schemas/vrp-receipt.v1.schema.json
```

Repository copy: [`vrp-receipt.v1.schema.json`](./vrp-receipt.v1.schema.json)

> **Drift contract.** `vrp-receipt.v1.schema.json` is mirrored **byte-equal** from the reference implementation (`hemmabo-mcp-server` `spec/vrp-receipt.v1.schema.json`, the schema consumed by the `verifyReceipt` reference verifier). The two copies MUST stay byte-identical; the receipt conformance vector validates against this copy.

These schemas are interoperability aids for implementers and examples. They are not a registry, issuer service, certification service, scoring service, OTA, marketplace, or booking intermediary.
