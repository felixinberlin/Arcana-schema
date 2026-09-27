/**
 * Arcana Schema - Ticket #2 Schema.org & JSON-LD Test Suite
 * Tests JSON-LD semantic layer, context validation, and expansion via jsonld.
 */

import fs from 'fs';
import path from 'path';
import jsonld from 'jsonld';
import {
  validateSpreadDefinition,
  validateReadingRecord,
} from '../src/schema/validator.ts';
import { PAST_PRESENT_FUTURE_SPREAD } from '../src/schema/catalogData.ts';
import type { TarotSpreadDefinition, TarotReading } from '../src/schema/types.ts';

let passed = 0;
let failed = 0;

function assert(condition: boolean, desc: string) {
  if (condition) {
    console.log(`  ✓ ${desc}`);
    passed++;
  } else {
    console.error(`  ✗ FAILED: ${desc}`);
    failed++;
  }
}

async function runSchemaOrgTests() {
  console.log('\n--- Running Schema.org & JSON-LD Test Suite (Ticket #2) ---\n');

  // 1. Plain JSON spreads (no @context) still validate cleanly
  console.log('1. Plain JSON validation without @context:');
  const plainSpread = { ...PAST_PRESENT_FUTURE_SPREAD };
  delete (plainSpread as any)['@context'];
  delete (plainSpread as any)['@type'];
  const plainReport = validateSpreadDefinition(plainSpread);
  assert(plainReport.valid, 'Plain spread without @context validates cleanly with 0 errors');

  // 2. JSON-LD spread validates against spread definition schema
  console.log('\n2. JSON-LD spread validation:');
  const spreadJsonldPath = path.resolve('./examples/valid/past-present-future.jsonld');
  const spreadJsonldContent = JSON.parse(fs.readFileSync(spreadJsonldPath, 'utf8'));
  const spreadJsonldReport = validateSpreadDefinition(spreadJsonldContent);
  assert(spreadJsonldReport.valid, 'past-present-future.jsonld passes validation cleanly');
  assert(spreadJsonldReport.errors.length === 0, 'No errors in past-present-future.jsonld');

  // 3. JSON-LD reading validates against reading schema
  console.log('\n3. JSON-LD reading record validation:');
  const readingJsonldPath = path.resolve('./examples/valid/reading-sample.jsonld');
  const readingJsonldContent = JSON.parse(fs.readFileSync(readingJsonldPath, 'utf8'));
  const readingJsonldReport = validateReadingRecord(readingJsonldContent);
  assert(readingJsonldReport.valid, 'reading-sample.jsonld passes validation cleanly');
  assert(readingJsonldReport.errors.length === 0, 'No errors in reading-sample.jsonld');

  // 4. @context without @type fails validation
  console.log('\n4. Missing @type when @context is present:');
  const missingTypeSpread = {
    ...PAST_PRESENT_FUTURE_SPREAD,
    '@context': 'https://arcanaschema.org/contexts/tarot.jsonld',
  };
  delete (missingTypeSpread as any)['@type'];
  const missingTypeReport = validateSpreadDefinition(missingTypeSpread);
  assert(!missingTypeReport.valid, 'Spread with @context but no @type is rejected');
  assert(
    missingTypeReport.errors.some((e) => e.code === 'ERR_JSONLD_TYPE_REQUIRED'),
    'Reports ERR_JSONLD_TYPE_REQUIRED error code'
  );

  // 5. Invalid @type value fails schema validation
  console.log('\n5. Invalid @type validation:');
  const invalidTypeSpread = {
    ...PAST_PRESENT_FUTURE_SPREAD,
    '@context': 'https://arcanaschema.org/contexts/tarot.jsonld',
    '@type': 'InvalidTypeName' as any,
  };
  const invalidTypeReport = validateSpreadDefinition(invalidTypeSpread);
  assert(!invalidTypeReport.valid, 'Spread with invalid @type value is rejected');
  assert(
    invalidTypeReport.errors.some((e) => e.type === 'schema' && e.field.includes('@type')),
    'Schema validator caught invalid @type enum'
  );

  // 6. Generic context warning check
  console.log('\n6. Generic schema.org context advisory warning:');
  const genericContextSpread = {
    ...PAST_PRESENT_FUTURE_SPREAD,
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
  };
  const genericReport = validateSpreadDefinition(genericContextSpread);
  assert(genericReport.valid, 'Generic https://schema.org context is accepted as valid');
  assert(
    genericReport.warnings.some((w) => w.code === 'WARN_GENERIC_SCHEMA_ORG_CONTEXT'),
    'Advisory warning WARN_GENERIC_SCHEMA_ORG_CONTEXT issued for generic context'
  );

  // 7. contexts/tarot.jsonld is itself valid JSON-LD
  console.log('\n7. contexts/tarot.jsonld integrity check:');
  const tarotContextPath = path.resolve('./contexts/tarot.jsonld');
  const tarotContextRaw = JSON.parse(fs.readFileSync(tarotContextPath, 'utf8'));
  assert(tarotContextRaw['@context'] !== undefined, 'contexts/tarot.jsonld contains valid @context object');
  assert(tarotContextRaw['@context']['@version'] === 1.1, 'Declared JSON-LD version 1.1');
  assert(tarotContextRaw['@context']['slots']['@id'] === 'schema:hasDefinedTerm', 'slots mapped to schema:hasDefinedTerm');
  assert(tarotContextRaw['@context']['role'] === 'schema:name', 'role mapped to schema:name');
  assert(tarotContextRaw['@context']['drawnAt']['@id'] === 'schema:startDate', 'drawnAt mapped to schema:startDate');

  // 8. Both example files expand cleanly with jsonld npm package
  console.log('\n8. JSON-LD document expansion via jsonld library:');

  // Custom document loader resolving https://arcanaschema.org/contexts/tarot.jsonld locally
  const customDocumentLoader = async (url: string) => {
    if (
      url === 'https://arcanaschema.org/contexts/tarot.jsonld' ||
      url.endsWith('tarot.jsonld')
    ) {
      return {
        contextUrl: null,
        documentUrl: url,
        document: tarotContextRaw,
      };
    }
    // Fallback to jsonld default loader
    return (jsonld as any).documentLoaders.node()(url);
  };

  try {
    const expandedSpread = await jsonld.expand(spreadJsonldContent, {
      documentLoader: customDocumentLoader,
    });
    assert(Array.isArray(expandedSpread) && expandedSpread.length > 0, 'past-present-future.jsonld expanded into RDF graph');
    assert(
      Boolean(expandedSpread[0]['@type'] && expandedSpread[0]['@type'].includes('https://schema.org/DefinedTermSet')),
      'Expanded spread type is https://schema.org/DefinedTermSet'
    );
  } catch (err) {
    assert(false, `jsonld.expand failed on spread: ${err}`);
  }

  try {
    const expandedReading = await jsonld.expand(readingJsonldContent, {
      documentLoader: customDocumentLoader,
    });
    assert(Array.isArray(expandedReading) && expandedReading.length > 0, 'reading-sample.jsonld expanded into RDF graph');
    assert(
      Boolean(expandedReading[0]['@type'] && expandedReading[0]['@type'].includes('https://schema.org/Event')),
      'Expanded reading type is https://schema.org/Event'
    );
  } catch (err) {
    assert(false, `jsonld.expand failed on reading: ${err}`);
  }

  console.log(`\nSchema.org Tests Summary: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runSchemaOrgTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
