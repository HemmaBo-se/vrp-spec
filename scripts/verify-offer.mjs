#!/usr/bin/env node
/**
 * VRP signed verified-stay-offer structural conformance check.
 *
 * Zero-dependency (only node:fs) so it runs in any CI without installing a
 * JSON-schema library. It walks the published schema and flags the two drift
 * classes that `additionalProperties: false` schemas are meant to catch:
 *   - EXTRA   : a key present in the payload but not declared in the schema
 *   - MISSING : a `required` key absent from the payload
 *
 * It is intentionally structural (shape drift), not a full JSON-Schema type
 * validator — that is what catches a re-introduced `confidence`, a stray
 * `badge_text`, or a missing `property_id`, which is the whole point.
 *
 * Usage:  node scripts/verify-offer.mjs <schema.json> <payload.json> [...more payloads]
 * Exit:   0 = all payloads conform, 1 = drift found, 2 = bad input.
 */
import { readFileSync } from "node:fs";

function deref(schema, root) {
  let guard = 0;
  while (schema && schema.$ref && guard++ < 50) {
    const parts = schema.$ref.replace(/^#\//, "").split("/");
    let s = root;
    for (const p of parts) s = s?.[p];
    schema = s;
  }
  return schema;
}

function walk(schema, data, path, root, errs) {
  schema = deref(schema, root);
  if (!schema) return;
  if (data !== null && typeof data === "object" && !Array.isArray(data)) {
    const props = schema.properties || {};
    if (schema.additionalProperties === false) {
      for (const k of Object.keys(data)) {
        if (!(k in props)) errs.push(`EXTRA    ${path}.${k}`);
      }
    }
    for (const r of schema.required || []) {
      if (!(r in data)) errs.push(`MISSING  ${path}.${r}`);
    }
    for (const k of Object.keys(props)) {
      if (k in data) walk(props[k], data[k], `${path}.${k}`, root, errs);
    }
  } else if (Array.isArray(data) && schema.items) {
    data.forEach((it, i) => walk(schema.items, it, `${path}[${i}]`, root, errs));
  }
}

function main() {
  const [, , schemaPath, ...payloadPaths] = process.argv;
  if (!schemaPath || payloadPaths.length === 0) {
    console.error("usage: verify-offer.mjs <schema.json> <payload.json> [...]");
    process.exit(2);
  }
  let schema;
  try {
    schema = JSON.parse(readFileSync(schemaPath, "utf8"));
  } catch (e) {
    console.error(`cannot read schema ${schemaPath}: ${e.message}`);
    process.exit(2);
  }
  let failed = 0;
  for (const p of payloadPaths) {
    let data;
    try {
      data = JSON.parse(readFileSync(p, "utf8"));
    } catch (e) {
      console.error(`cannot read payload ${p}: ${e.message}`);
      process.exit(2);
    }
    const errs = [];
    walk(schema, data, "root", schema, errs);
    if (errs.length === 0) {
      console.log(`PASS  ${p}`);
    } else {
      failed++;
      console.log(`FAIL  ${p}  (${errs.length} drift)`);
      for (const e of errs) console.log(`        ${e}`);
    }
  }
  process.exit(failed ? 1 : 0);
}

main();
