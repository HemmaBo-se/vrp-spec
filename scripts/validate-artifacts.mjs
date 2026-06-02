import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

function readJson(relPath) {
  const absPath = path.join(root, relPath);
  try {
    return JSON.parse(fs.readFileSync(absPath, "utf8"));
  } catch (error) {
    failures.push(`${relPath}: invalid JSON (${error.message})`);
    return undefined;
  }
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

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function dataType(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  if (Number.isInteger(value)) return "integer";
  if (typeof value === "number") return "number";
  return typeof value;
}

function resolvePointer(document, ref) {
  if (!ref.startsWith("#/")) throw new Error(`Only local JSON Schema refs are supported: ${ref}`);
  return ref
    .slice(2)
    .split("/")
    .reduce((cursor, part) => cursor?.[part.replace(/~1/g, "/").replace(/~0/g, "~")], document);
}

function validate(schema, value, state, at = "$") {
  const errors = [];
  const add = (message) => errors.push(`${at}: ${message}`);

  if (schema.$ref) {
    return validate(resolvePointer(state.rootSchema, schema.$ref), value, state, at);
  }

  if (schema.oneOf) {
    const matches = schema.oneOf
      .map((candidate) => validate(candidate, value, state, at))
      .filter((candidateErrors) => candidateErrors.length === 0);
    if (matches.length !== 1) add(`must match exactly one schema in oneOf (matched ${matches.length})`);
  }

  if (schema.anyOf) {
    const matches = schema.anyOf
      .map((candidate) => validate(candidate, value, state, at))
      .filter((candidateErrors) => candidateErrors.length === 0);
    if (matches.length === 0) add("must match at least one schema in anyOf");
  }

  if (schema.allOf) {
    for (const [index, candidate] of schema.allOf.entries()) {
      errors.push(...validate(candidate, value, state, `${at}.allOf[${index}]`));
    }
  }

  if (schema.not) {
    const candidateErrors = validate(schema.not, value, state, at);
    if (candidateErrors.length === 0) add("must not match forbidden schema");
  }

  if (schema.if) {
    const conditionErrors = validate(schema.if, value, state, at);
    if (conditionErrors.length === 0 && schema.then) {
      errors.push(...validate(schema.then, value, state, at));
    }
  }

  if (schema.type) {
    const allowed = Array.isArray(schema.type) ? schema.type : [schema.type];
    const actual = dataType(value);
    const ok = allowed.some((expected) => expected === actual || (expected === "number" && actual === "integer"));
    if (!ok) add(`expected type ${allowed.join("|")}, got ${actual}`);
  }

  if (Object.prototype.hasOwnProperty.call(schema, "const") && !deepEqual(value, schema.const)) {
    add(`expected const ${JSON.stringify(schema.const)}, got ${JSON.stringify(value)}`);
  }

  if (schema.enum && !schema.enum.some((candidate) => deepEqual(candidate, value))) {
    add(`expected one of ${JSON.stringify(schema.enum)}, got ${JSON.stringify(value)}`);
  }

  if (typeof value === "number" && schema.minimum !== undefined && value < schema.minimum) {
    add(`expected minimum ${schema.minimum}, got ${value}`);
  }

  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      add(`expected minLength ${schema.minLength}`);
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      add(`does not match pattern ${schema.pattern}`);
    }
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    if (schema.required) {
      for (const key of schema.required) {
        if (!Object.prototype.hasOwnProperty.call(value, key)) add(`missing required property ${key}`);
      }
    }

    const definedProperties = schema.properties || {};
    for (const [key, propertySchema] of Object.entries(definedProperties)) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        errors.push(...validate(propertySchema, value[key], state, `${at}.${key}`));
      }
    }

    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.prototype.hasOwnProperty.call(definedProperties, key)) {
          add(`unexpected additional property ${key}`);
        }
      }
    }
  }

  if (Array.isArray(value)) {
    if (schema.contains) {
      const containsMatch = value.some((item, index) => validate(schema.contains, item, state, `${at}[${index}]`).length === 0);
      if (!containsMatch) add("array does not contain a required matching item");
    }
    if (schema.items) {
      for (const [index, item] of value.entries()) {
        errors.push(...validate(schema.items, item, state, `${at}[${index}]`));
      }
    }
  }

  return errors;
}

function assertSchemaValid(schema, value, label) {
  const errors = validate(schema, value, { rootSchema: schema });
  if (errors.length > 0) {
    failures.push(`${label}: schema validation failed\n  ${errors.slice(0, 20).join("\n  ")}`);
  }
}

function assertSchemaInvalid(schema, value, label) {
  const errors = validate(schema, value, { rootSchema: schema });
  if (errors.length === 0) {
    failures.push(`${label}: expected schema validation to fail, but it passed`);
  }
}

const jsonFiles = walk(root).filter((file) => file.endsWith(".json") || file.endsWith(".jsonld"));
for (const file of jsonFiles) readJson(file);

const schema = readJson("schemas/attestations-v0.1.schema.json");
if (schema) {
  const attestationExamples = walk(path.join(root, "examples", "attestations"))
    .filter((file) => file.endsWith(".json"))
    .sort();

  for (const file of attestationExamples) {
    const example = readJson(file);
    if (example !== undefined) assertSchemaValid(schema, example, file);
  }

  const verifiedStay = readJson("examples/attestations/verified-stay-credential.payload.v0.1.json");
  if (verifiedStay) {
    const withGuestEmail = structuredClone(verifiedStay);
    withGuestEmail.credentialSubject.guestEmail = "guest@example.invalid";
    assertSchemaInvalid(schema, withGuestEmail, "negative: verified stay must reject guestEmail");

    const withExactDate = structuredClone(verifiedStay);
    withExactDate.credentialSubject.checkIn = "2026-06-01";
    assertSchemaInvalid(schema, withExactDate, "negative: verified stay must reject exact checkIn");
  }

  const hostDomain = readJson("examples/attestations/host-domain-credential.payload.v0.1.json");
  if (hostDomain) {
    const withEmbeddedProof = structuredClone(hostDomain);
    withEmbeddedProof.proof = { type: "DataIntegrityProof" };
    assertSchemaInvalid(schema, withEmbeddedProof, "negative: credential payload must reject embedded proof");
  }
}

const coreExampleSchemas = [
  ["schemas/discovery-v0.1.schema.json", "examples/discovery.v0.1.json"],
  ["schemas/jwks-v0.1.schema.json", "examples/jwks.v0.1.json"],
  ["schemas/verified-stay-offer-v0.1.schema.json", "examples/verified-stay-offer.not-quoteable.v0.1.json"],
  [
    "schemas/verified-stay-offer-verification-result-v0.1.schema.json",
    "examples/verified-stay-offer-verification-result.safe-to-quote.v0.1.json",
  ],
];

for (const [schemaPath, examplePath] of coreExampleSchemas) {
  const coreSchema = readJson(schemaPath);
  const example = readJson(examplePath);
  if (coreSchema && example !== undefined) assertSchemaValid(coreSchema, example, examplePath);
}

const discoverySchema = readJson("schemas/discovery-v0.1.schema.json");
const discoveryExample = readJson("examples/discovery.v0.1.json");
if (discoverySchema && discoveryExample) {
  const withoutJwks = structuredClone(discoveryExample);
  delete withoutJwks.jwks_url;
  assertSchemaInvalid(discoverySchema, withoutJwks, "negative: discovery must require jwks_url");
}

const offerSchema = readJson("schemas/verified-stay-offer-v0.1.schema.json");
const offerExample = readJson("examples/verified-stay-offer.not-quoteable.v0.1.json");
if (offerSchema && offerExample) {
  const wrongAlg = structuredClone(offerExample);
  wrongAlg.signature.alg = "RS256";
  assertSchemaInvalid(offerSchema, wrongAlg, "negative: signed offer must reject non-EdDSA alg");

  const withoutDirectBookingUrl = structuredClone(offerExample);
  delete withoutDirectBookingUrl.offer.booking.direct_booking_url;
  assertSchemaInvalid(
    offerSchema,
    withoutDirectBookingUrl,
    "negative: signed offer must require direct_booking_url",
  );
}

const jwksSchema = readJson("schemas/jwks-v0.1.schema.json");
const jwksExample = readJson("examples/jwks.v0.1.json");
if (jwksSchema && jwksExample) {
  const withExtraMember = structuredClone(jwksExample);
  withExtraMember.keys[0].x5t = "ignored-standard-jwk-member";
  assertSchemaValid(jwksSchema, withExtraMember, "jwks must allow standard extra JWK members");

  const wrongCurve = structuredClone(jwksExample);
  wrongCurve.keys[0].crv = "P-256";
  assertSchemaInvalid(jwksSchema, wrongCurve, "negative: jwks must reject non-Ed25519 curve");
}

if (failures.length > 0) {
  console.error("VRP artifact validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`VRP artifact validation passed (${jsonFiles.length} JSON/JSON-LD files checked).`);
