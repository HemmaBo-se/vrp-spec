// Checks that public VRP documentation routes, links, and Vercel rewrites stay
// consistent. This is a repository/publication check, not a runtime tool.

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const canonicalOrigin = "https://vacationrentalprotocol.com";
const live = process.argv.includes("--live") || process.env.VRP_LIVE_ROUTE_CHECK === "1";
const failures = [];

function readText(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function readJson(relPath) {
  return JSON.parse(readText(relPath));
}

function walk(dir, result = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === ".vercel") continue;
    const absPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(absPath, result);
    } else {
      result.push(path.relative(root, absPath).replace(/\\/g, "/"));
    }
  }
  return result;
}

function fail(message) {
  failures.push(message);
}

function fileExists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

function routePathFromUrl(url) {
  const parsed = new URL(url);
  if (parsed.origin !== canonicalOrigin) fail(`${url}: expected origin ${canonicalOrigin}`);
  let pathname = parsed.pathname || "/";
  if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);
  return pathname;
}

function extractCanonicalUrls(relPath) {
  const text = readText(relPath);
  const matches = text.match(/https:\/\/vacationrentalprotocol\.com[^\s<>"')]+/g) || [];
  return [...new Set(matches.map((url) => url.replace(/[.,;:]+$/, "")))];
}

function sitemapUrls() {
  return [...readText("sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

function requiredCanonicalUrls() {
  return [
    `${canonicalOrigin}/contexts/v1.jsonld`,
    `${canonicalOrigin}/llms.txt`,
    `${canonicalOrigin}/robots.txt`,
    `${canonicalOrigin}/sitemap.xml`,
  ];
}

function markdownFiles() {
  return walk(root).filter((file) => file.endsWith(".md"));
}

function normalizeMarkdownTarget(rawTarget) {
  let target = rawTarget.trim();
  if (target.startsWith("<") && target.includes(">")) {
    target = target.slice(1, target.indexOf(">"));
  } else {
    target = target.split(/\s+/)[0];
  }
  return target;
}

function checkMarkdownLinks() {
  const localLinkPattern = /!?\[[^\]]*]\(([^)]+)\)/g;

  for (const file of markdownFiles()) {
    const text = readText(file);
    let match;
    while ((match = localLinkPattern.exec(text)) !== null) {
      const target = normalizeMarkdownTarget(match[1]);
      if (!target || target.startsWith("#")) continue;
      if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue;

      const withoutFragment = target.split("#")[0].split("?")[0];
      if (!withoutFragment) continue;

      const absTarget = path.resolve(root, path.dirname(file), decodeURIComponent(withoutFragment));
      const relTarget = path.relative(root, absTarget).replace(/\\/g, "/");
      if (relTarget.startsWith("..") || path.isAbsolute(relTarget)) {
        fail(`${file}: local link escapes repository: ${target}`);
        continue;
      }
      if (!fs.existsSync(absTarget)) fail(`${file}: broken local link: ${target}`);
    }
  }
}

const vercel = readJson("vercel.json");

function stripLeadingSlash(value) {
  return value.replace(/^\//, "");
}

function routeMatchesSource(route, source) {
  if (source.includes("(.*)")) {
    const [prefix, suffix] = source.split("(.*)");
    return route.startsWith(prefix) && route.endsWith(suffix);
  }
  return route === source;
}

function rewriteDestination(route) {
  const rewrite = (vercel.rewrites || []).find((item) => item.source === route);
  return rewrite?.destination || null;
}

function resolveRoute(route) {
  if (route === "/") return "index.html";

  const destination = rewriteDestination(route);
  if (destination) return stripLeadingSlash(destination);

  const direct = stripLeadingSlash(route);
  if (fileExists(direct)) return direct;

  if (vercel.cleanUrls) {
    for (const extension of [".html", ".md"]) {
      if (fileExists(`${direct}${extension}`)) return `${direct}${extension}`;
    }
  }

  return null;
}

function headerContentType(route) {
  const values = [];
  for (const entry of vercel.headers || []) {
    if (!routeMatchesSource(route, entry.source)) continue;
    const contentType = entry.headers?.find((header) => header.key.toLowerCase() === "content-type");
    if (contentType) values.push(contentType.value);
  }
  return values.at(-1) || null;
}

function expectedContentType(route, resolvedPath) {
  if (route === "/") return null;
  if (route === "/contexts/v1" || route.endsWith(".jsonld")) return "application/ld+json";
  if (route === "/terms" || resolvedPath?.endsWith(".html")) return "text/html";
  if (route === "/sitemap.xml") return "application/xml";
  if (route === "/llms.txt" || route === "/robots.txt") return "text/plain";
  if (route.startsWith("/schemas/")) return "application/schema+json";
  if (route.startsWith("/examples/") && route.endsWith(".json")) return "application/json";
  if (route.startsWith("/spec/") || route.startsWith("/docs/")) return "text/markdown";
  return null;
}

function checkPublicRoutes() {
  const urls = new Set([
    ...requiredCanonicalUrls(),
    ...sitemapUrls(),
    ...extractCanonicalUrls("README.md"),
    ...extractCanonicalUrls("llms.txt"),
  ]);

  const sitemapRoutes = new Set(sitemapUrls().map(routePathFromUrl));
  const llmsRoutes = new Set(extractCanonicalUrls("llms.txt").map(routePathFromUrl));

  for (const route of llmsRoutes) {
    if (!sitemapRoutes.has(route)) fail(`llms.txt: canonical route missing from sitemap.xml: ${route}`);
  }

  for (const url of urls) {
    const route = routePathFromUrl(url);
    const resolvedPath = resolveRoute(route);
    if (!resolvedPath) {
      fail(`${url}: no local file or Vercel rewrite resolves route ${route}`);
      continue;
    }
    if (!fileExists(resolvedPath)) fail(`${url}: resolved file does not exist: ${resolvedPath}`);

    const expectedType = expectedContentType(route, resolvedPath);
    if (!expectedType) continue;

    const configuredType = headerContentType(route);
    if (!configuredType) {
      fail(`${url}: missing Vercel Content-Type header for route ${route}`);
    } else if (!configuredType.startsWith(expectedType)) {
      fail(`${url}: expected Content-Type ${expectedType}, got ${configuredType}`);
    }
  }
}

async function checkLiveRoutes() {
  const urls = [...new Set([...requiredCanonicalUrls(), ...sitemapUrls()])];
  const jsonLdUrl = `${canonicalOrigin}/contexts/v1.jsonld`;
  let jsonLdBody = null;
  const bodyMustMatchRepository = new Map([
    ["/contexts/v1", "contexts/v1.jsonld"],
    ["/contexts/v1.jsonld", "contexts/v1.jsonld"],
    ["/llms.txt", "llms.txt"],
    ["/sitemap.xml", "sitemap.xml"],
    ["/terms", "terms.html"],
  ]);

  for (const url of urls) {
    const route = routePathFromUrl(url);
    const response = await fetch(url, { redirect: "manual" });
    if (response.status !== 200) {
      fail(`${url}: live route returned HTTP ${response.status}`);
      continue;
    }
    if (response.status >= 300 && response.status < 400) {
      fail(`${url}: live route redirected; canonical public routes should answer directly`);
    }

    const expectedType = expectedContentType(route, resolveRoute(route));
    const actualType = response.headers.get("content-type") || "";
    if (expectedType && !actualType.startsWith(expectedType)) {
      fail(`${url}: live Content-Type expected ${expectedType}, got ${actualType || "<missing>"}`);
    }

    let body = null;
    if (bodyMustMatchRepository.has(route) || url === jsonLdUrl || url === `${canonicalOrigin}/contexts/v1`) {
      body = await response.text();
    }

    const repositoryPath = bodyMustMatchRepository.get(route);
    if (repositoryPath) {
      const expectedBody = readText(repositoryPath).replace(/\r\n/g, "\n");
      const actualBody = body.replace(/\r\n/g, "\n");
      if (actualBody !== expectedBody) fail(`${url}: live body does not match repository file ${repositoryPath}`);
    }

    if (url === jsonLdUrl) jsonLdBody = body;
    if (url === `${canonicalOrigin}/contexts/v1`) {
      const contextBody = body;
      if (jsonLdBody !== null && contextBody !== jsonLdBody) {
        fail(`${url}: /contexts/v1 and /contexts/v1.jsonld returned different bodies`);
      }
    }
  }
}

checkMarkdownLinks();
checkPublicRoutes();
if (live) await checkLiveRoutes();

if (failures.length > 0) {
  console.error("VRP public route/link check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`VRP public route/link check passed${live ? " with live route verification" : ""}.`);
