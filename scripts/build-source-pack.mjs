// Build the VRP Source Pack: one Markdown file containing the full VRP open
// standard, assembled deterministically from the canonical documents so it can
// be dropped into an AI notebook (Google NotebookLM / Gemini Notebook, ChatGPT,
// Claude Projects) or read/cited offline as a single source.
//
//   node scripts/build-source-pack.mjs          # write docs/source-pack.md
//   node scripts/build-source-pack.mjs --check   # fail if the file is stale
//
// Design notes:
// - No build timestamp is embedded, so regeneration is byte-deterministic and
//   the --check drift guard is meaningful in CI.
// - Every internal relative link is rewritten to an absolute URL: docs/ and
//   spec/ pages map to their canonical clean URLs; other repository files map to
//   GitHub blob/tree URLs. A reader in a notebook cannot follow repo-relative
//   links, and this also keeps the repository link checker happy.
// - Link/heading rewriting is fence-aware: fenced code blocks are left verbatim.

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ORIGIN = "https://vacationrentalprotocol.com";
const GH = "https://github.com/HemmaBo-se/vrp-spec";
const OUT = "docs/source-pack.md";

// Ordered, curated manifest — the reader-facing standard. Machine artifacts
// (JSON schemas, examples, contexts) are indexed as links in the appendix, not
// inlined. Internal QA docs and external proposals are intentionally excluded.
const MANIFEST = [
  { file: "docs/what-is-vrp.md", title: "What is VRP?" },
  { file: "spec/v0.1.md", title: "Core specification v0.1" },
  { file: "spec/well-known-uri-v0.1.md", title: "Well-Known URI v0.1" },
  { file: "spec/stayintent-discovery-v0.1.md", title: "StayIntent open discovery v0.1" },
  { file: "spec/structure-declarations-v0.1.md", title: "Node structure declarations v0.1" },
  { file: "spec/attestations-v0.1.md", title: "Portable attestations v0.1" },
  { file: "spec/attestation-status-bitstring-v0.1.md", title: "Attestation status (Bitstring Status List) v0.1" },
  { file: "spec/transparency-log-v0.1.md", title: "Transparency log v0.1" },
  { file: "spec/receipt-v1.md", title: "VRP receipt envelope v1" },
  { file: "docs/implement-vrp.md", title: "Implement VRP signed offers" },
  { file: "docs/implement-attestations.md", title: "Implement portable attestations" },
  { file: "docs/agent-guide.md", title: "Agent integration guide" },
  { file: "docs/interop-and-trust-positioning.md", title: "Interop and trust positioning" },
  { file: "docs/first-mover-evidence-memo.md", title: "First-mover evidence memo" },
];

// Machine artifacts referenced by URL in the appendix (not inlined as JSON).
const MACHINE_ARTIFACTS = [
  ["VRP JSON-LD context", `${ORIGIN}/contexts/v1`],
  ["VRP terms vocabulary", `${ORIGIN}/terms`],
  ["Discovery JSON Schema", `${ORIGIN}/schemas/discovery-v0.1.schema.json`],
  ["JWKS JSON Schema", `${ORIGIN}/schemas/jwks-v0.1.schema.json`],
  ["Signed offer JSON Schema", `${ORIGIN}/schemas/verified-stay-offer-v0.1.schema.json`],
  ["Offer verification-result JSON Schema", `${ORIGIN}/schemas/verified-stay-offer-verification-result-v0.1.schema.json`],
  ["Attestations JSON Schema", `${ORIGIN}/schemas/attestations-v0.1.schema.json`],
  ["Receipt envelope JSON Schema", `${ORIGIN}/schemas/vrp-receipt.v1.schema.json`],
  ["StayIntent query JSON Schema", `${ORIGIN}/schemas/stayintent-query-v0.1.schema.json`],
  ["StayIntent response JSON Schema", `${ORIGIN}/schemas/stayintent-response-v0.1.schema.json`],
  ["Live reference node discovery", "https://villaakerlyckan.se/.well-known/vacation-rental.json"],
  ["In-browser offer verifier", `${ORIGIN}/verify`],
];

const slug = (p) => p.replace(/\.md$/, "");

// Map a repo-relative path to a public URL: docs/ and spec/ → canonical clean
// URL; anything else → GitHub blob (file) or tree (directory).
function repoPathToUrl(repoPath) {
  const clean = repoPath.replace(/^\.\//, "");
  if (/^docs\/.+\.md$/.test(clean) || /^spec\/.+\.md$/.test(clean)) {
    return `${ORIGIN}/${slug(clean)}`;
  }
  if (clean.endsWith("/")) return `${GH}/tree/main/${clean.replace(/\/$/, "")}`;
  return `${GH}/blob/main/${clean}`;
}

// Resolve a link target found in `srcFile` to an absolute URL (or return it
// unchanged if already absolute / an in-page anchor).
function resolveTarget(target, srcFile) {
  const raw = target.trim();
  if (!raw || raw.startsWith("#")) return target;
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return target; // http:, https:, mailto:, ...

  const hashIndex = raw.search(/[#?]/);
  const pathPart = hashIndex === -1 ? raw : raw.slice(0, hashIndex);
  const suffix = hashIndex === -1 ? "" : raw.slice(hashIndex);
  if (!pathPart) return target;

  let repoPath;
  if (pathPart.startsWith("/")) {
    repoPath = pathPart.replace(/^\/+/, "");
  } else {
    repoPath = path.posix.normalize(path.posix.join(path.posix.dirname(srcFile), pathPart));
  }
  const url = repoPathToUrl(repoPath);
  // Keep the fragment only for canonical doc/spec pages (same rendered page).
  return url.startsWith(ORIGIN) ? url + suffix : url;
}

const LINK_RE = /(!?\[[^\]]*\])\(([^)\s]+)((?:\s+"[^"]*")?)\)/g;

// Rewrite links + demote headings by two levels, skipping fenced code blocks.
function transform(body, srcFile) {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  let inFence = false;
  return lines
    .map((line) => {
      const fence = line.match(/^\s*(`{3,}|~{3,})/);
      if (fence) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      let out = line.replace(/^(#{1,6})(\s)/, (m, hashes, sp) => "#".repeat(Math.min(6, hashes.length + 2)) + sp);
      out = out.replace(LINK_RE, (m, label, tgt, title) => `${label}(${resolveTarget(tgt, srcFile)}${title})`);
      return out;
    })
    .join("\n");
}

function build() {
  const parts = [];
  parts.push(`# Vacation Rental Protocol (VRP) — Source Pack

**One file containing the full VRP open standard**, assembled for AI notebooks
(Google NotebookLM / Gemini Notebook, ChatGPT, Claude Projects) and for offline
reading and citation.

- Standard: **Vacation Rental Protocol (VRP)**, public draft **v0.1**
- Author & maintainer: **Rouiada Abbas** — VRP is an open standard with no central gatekeeper
- Reference implementation: **HemmaBo** (not the owner of the standard)
- Canonical site: <${ORIGIN}>
- Repository: <${GH}>
- Specification text is dedicated to the public domain under **CC0 1.0** (see <${GH}/blob/main/LICENSE>); reference code: <${GH}/blob/main/LICENSE-CODE>.

This pack is generated from the canonical documents; each section links to its
live source. If anything here disagrees with the canonical site, **the canonical
URL is authoritative.**

## How to use this in an AI notebook

- **Google NotebookLM / Gemini Notebook:** Add source → Website, and paste
  <${ORIGIN}/docs/source-pack> — or download this file and upload it.
- **ChatGPT / Claude Projects:** attach this file, or paste the URL above.
- The pack is plain Markdown, so any tool that reads text or Markdown can ingest
  the whole standard in one step.

## Contents
`);
  MANIFEST.forEach((m, i) => {
    parts.push(`${i + 1}. [${m.title}](${ORIGIN}/${slug(m.file)})`);
  });
  parts.push(`${MANIFEST.length + 1}. Appendix: machine artifacts (schemas, context, live node)`);

  MANIFEST.forEach((m, i) => {
    const abs = path.join(root, m.file);
    const body = fs.readFileSync(abs, "utf8").trimEnd();
    parts.push(`
${"=".repeat(72)}
## ${i + 1}. ${m.title}

*Canonical source: <${ORIGIN}/${slug(m.file)}>*
${"=".repeat(72)}

${transform(body, m.file)}`);
  });

  parts.push(`
${"=".repeat(72)}
## ${MANIFEST.length + 1}. Appendix — machine artifacts

The documents above are the human-readable standard. The following machine
artifacts are referenced by URL rather than inlined; fetch them directly when
implementing or verifying.
`);
  for (const [label, url] of MACHINE_ARTIFACTS) {
    parts.push(`- ${label}: <${url}>`);
  }

  parts.push(`
---

*End of the Vacation Rental Protocol Source Pack (v0.1). Canonical: <${ORIGIN}>.*
`);

  return parts.join("\n").replace(/\n{4,}/g, "\n\n\n").trimEnd() + "\n";
}

const content = build();
const outPath = path.join(root, OUT);

if (process.argv.includes("--check")) {
  const current = fs.existsSync(outPath) ? fs.readFileSync(outPath, "utf8") : "";
  if (current !== content) {
    console.error(`✗ ${OUT} is stale. Run: npm run build-source-pack`);
    process.exit(1);
  }
  console.log(`✓ ${OUT} is up to date`);
} else {
  fs.writeFileSync(outPath, content);
  console.log(`✓ wrote ${OUT} (${content.length} bytes, ${MANIFEST.length} sections)`);
}
