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


## Source truth: sync to origin/main BEFORE reading or building

A stale local clone is the single most likely cause of a wrong conclusion —
reading old file content, or mistaking one repo's facts for another's. Before you
read source to make a claim, or start building:

- Run `git fetch origin && git switch main && git reset --hard origin/main`.
- Create the work branch FROM origin/main: `git switch -c <prefix>/<task> origin/main`.
- Do this for EVERY repo you touch — `vrp-spec`, `hemmabo-mcp-server`,
  `hemmabo-smart-stays` — because cross-repo claims require all of them current.
- NEVER assert a file's content, license, or status from a local clone without
  confirming it against origin/main (or prod). A stale clone is not evidence.
- Don't confuse repos: `vrp-spec` = CC0 (spec text); `hemmabo-mcp-server` =
  Apache-2.0 (reference code). Different licenses, different layers.
