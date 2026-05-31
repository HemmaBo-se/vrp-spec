# VRP Contexts

The canonical VRP Portable Attestations v0.1 context URL is:

```text
https://vacationrentalprotocol.com/contexts/v1
```

The repository copy is [`v1.jsonld`](./v1.jsonld).

Static deployments should serve `/contexts/v1` and may also serve `/contexts/v1.jsonld`. Both URLs should return the same JSON-LD document. Recommended response headers:

```text
Content-Type: application/ld+json
Cache-Control: public, max-age=3600
```

The context defines VRP terms only. It does not create a registry, issuer service, marketplace, OTA, booking intermediary, or trust authority.
