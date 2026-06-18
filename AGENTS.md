# AGENTS.md — vrp-spec

The Vacation Rental Protocol (VRP) specification: a static website
(`index.html`, `verify.html`, `styles.css`, …, deployed on Vercel), the spec
docs (`spec/`), JSON schemas (`schemas/`), JSON-LD contexts, and conformance
test vectors (`examples/conformance`). Node.js scripts validate the artifacts.

## Cursor Cloud specific instructions

- **No dependencies to install** — `package.json` declares none and there is no
  lockfile; the validation scripts use only Node's standard library. The startup
  update script intentionally does nothing for this repo.
- **Tests (offline):** `npm test` runs the full validation suite —
  `validate` + `verify-vectors` + `verify-attestations` + `verify-three-state` +
  `check-public-routes`, all against local fixtures (no network). Add the `:live`
  variants (e.g. `npm run check-public-routes:live`) to hit live URLs.
- **No build step.** To preview the site locally, serve the repo root with any
  static file server (e.g. `python3 -m http.server 4180`) and open `index.html` /
  `verify.html`.
