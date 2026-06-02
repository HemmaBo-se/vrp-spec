// Verifies the machine-readable VRP three-state conformance fixtures.
//
// The fixtures lock the protocol distinction between:
// - affirmed: a fresh, signed host-domain fact may be relied on
// - negated: a fresh, signed host-domain fact proves a false value
// - unknown: the fact could not be verified and must not be inferred

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { baseOffer, jwks, signOffer, verifyCompactJws } from "./conformance.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (rel) => JSON.parse(readFileSync(join(repoRoot, rel), "utf8"));

const STATES = new Set(["affirmed", "negated", "unknown"]);
const failures = [];

function fail(id, message) {
  failures.push(`${id}: ${message}`);
}

function pass(id) {
  console.log(`  ok   ${id}`);
}

function deepMerge(base, patch) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) return patch;
  const output = structuredClone(base);
  for (const [key, value] of Object.entries(patch)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      output[key] &&
      typeof output[key] === "object" &&
      !Array.isArray(output[key])
    ) {
      output[key] = deepMerge(output[key], value);
    } else {
      output[key] = value;
    }
  }
  return output;
}

function compactJwsForFixture(input) {
  if (input.kind !== "signed_offer") return null;

  const offer = deepMerge(baseOffer, input.offer_overrides || {});
  const jws = signOffer(offer);

  if (input.mutation === "tamper_payload_without_resigning") {
    const parts = jws.split(".");
    const tamperedPayload = Buffer.from(
      JSON.stringify({
        ...offer,
        price: { ...offer.price, agent_total: 1 },
      }),
    ).toString("base64url");
    return `${parts[0]}.${tamperedPayload}.${parts[2]}`;
  }

  return jws;
}

function unknownResultForNoResponse() {
  return {
    facts: {
      canonical_domain: "unknown",
      verified_stay_offer_endpoint: "unknown",
      availability: "unknown",
      price: "unknown",
      direct_booking_url: "unknown",
    },
    safe_to_quote_official_direct_offer: false,
    safe_to_cite_verified_unavailable: false,
    must_fetch_fresh_offer: true,
  };
}

function evaluateFixture(fixture) {
  if (fixture.input.kind === "discovery_timeout") return unknownResultForNoResponse();

  const verification = verifyCompactJws(compactJwsForFixture(fixture.input), jwks());
  if (!verification.valid) {
    return {
      facts: {
        signature: "negated",
        availability: "unknown",
        price: "unknown",
        direct_booking_url: "unknown",
        agent_permission: "unknown",
      },
      safe_to_quote_official_direct_offer: false,
      safe_to_cite_verified_unavailable: false,
      must_fetch_fresh_offer: true,
    };
  }

  const offer = verification.payload;
  const fresh = new Date(offer.valid_until) > new Date(fixture.evaluation_time);
  if (!fresh) {
    return {
      facts: {
        signature: "affirmed",
        offer_freshness: "negated",
        availability: "unknown",
        price: "unknown",
        direct_booking_url: "unknown",
      },
      safe_to_quote_official_direct_offer: false,
      safe_to_cite_verified_unavailable: false,
      must_fetch_fresh_offer: true,
    };
  }

  const available = offer.availability?.available === true;
  const unavailable = offer.availability?.available === false;
  const exactPrice =
    available &&
    offer.price?.exact === true &&
    Number.isInteger(offer.price?.public_total) &&
    Number.isInteger(offer.price?.agent_total);
  const quotePermission = offer.agent_permission?.may_quote_as_official_direct_offer === true;
  const hasBookingUrl = typeof offer.booking?.direct_booking_url === "string" && offer.booking.direct_booking_url.startsWith("https://");
  const safeToQuote = available && exactPrice && quotePermission && hasBookingUrl;

  return {
    facts: {
      signature: "affirmed",
      offer_freshness: "affirmed",
      "availability.available": available ? "affirmed" : "negated",
      price: exactPrice ? "affirmed" : "unknown",
      direct_booking_url: safeToQuote ? "affirmed" : "unknown",
      agent_permission: quotePermission ? "affirmed" : "negated",
    },
    safe_to_quote_official_direct_offer: safeToQuote,
    safe_to_cite_verified_unavailable: unavailable,
    must_fetch_fresh_offer: false,
  };
}

function assertStateFixtureShape(fixture) {
  if (!fixture.id || typeof fixture.id !== "string") fail("<unknown>", "fixture id must be a non-empty string");
  if (!fixture.input || typeof fixture.input !== "object") fail(fixture.id, "input must be an object");
  if (!fixture.expected || typeof fixture.expected !== "object") fail(fixture.id, "expected must be an object");

  for (const [fact, state] of Object.entries(fixture.expected?.facts || {})) {
    if (!STATES.has(state)) fail(fixture.id, `expected fact ${fact} has invalid state ${state}`);
  }
}

function assertMatchesExpected(fixture, actual) {
  for (const [fact, expectedState] of Object.entries(fixture.expected.facts)) {
    if (actual.facts[fact] !== expectedState) {
      fail(fixture.id, `${fact}: expected ${expectedState}, got ${actual.facts[fact] ?? "<missing>"}`);
    }
  }

  for (const key of [
    "safe_to_quote_official_direct_offer",
    "safe_to_cite_verified_unavailable",
    "must_fetch_fresh_offer",
  ]) {
    if (actual[key] !== fixture.expected[key]) {
      fail(fixture.id, `${key}: expected ${fixture.expected[key]}, got ${actual[key]}`);
    }
  }
}

const fixtureDocument = readJson("examples/conformance/three-state-verification.v0.1.json");
if (fixtureDocument.kind !== "vrp_three_state_conformance_fixtures") {
  fail("document", "unexpected fixture document kind");
}
if (fixtureDocument.protocol_version !== "0.1") {
  fail("document", "unexpected protocol_version");
}

for (const state of fixtureDocument.state_values || []) {
  if (!STATES.has(state)) fail("document", `unexpected state value ${state}`);
}

for (const fixture of fixtureDocument.fixtures || []) {
  const before = failures.length;
  assertStateFixtureShape(fixture);
  assertMatchesExpected(fixture, evaluateFixture(fixture));
  if (failures.length === before) pass(fixture.id);
}

if (failures.length > 0) {
  console.error("\nVRP three-state fixture verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`\nVRP three-state fixtures passed (${fixtureDocument.fixtures.length} cases).`);
