# VRP Contexts

The canonical VRP Portable Attestations v0.1 context URL is:

```text
https://vacationrentalprotocol.com/contexts/v1
```

The repository copy is [`v1.jsonld`](./v1.jsonld).

The `vrp:` namespace in that context expands to:

```text
https://vacationrentalprotocol.com/terms#
```

The dereferenceable vocabulary page for those term IRIs is:

```text
https://vacationrentalprotocol.com/terms
```

Static deployments should serve `/contexts/v1` and may also serve `/contexts/v1.jsonld`. Both URLs should return the same JSON-LD document. Recommended response headers:

```text
Content-Type: application/ld+json
Cache-Control: public, max-age=3600
```

Credential payloads using the VRP attestation profile must list both the W3C VC v2 context and this VRP context:

```json
[
  "https://www.w3.org/ns/credentials/v2",
  "https://vacationrentalprotocol.com/contexts/v1"
]
```

The context and vocabulary define VRP terms only. They do not create a registry, issuer service, marketplace, OTA, booking intermediary, or trust authority.
