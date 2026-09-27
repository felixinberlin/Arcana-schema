/**
 * Arcana Schema - Backward Compatibility Test Suite
 * Verifies that hardened schemas do not break existing valid files and
 * confirms breaking-change detection catches illegal contract mutations.
 */

import fs from 'fs';
import path from 'path';
import { validateSpreadDefinition, validateReadingRecord } from '../src/schema/validator.ts';
import { CANONICAL_SPREADS } from '../src/schema/catalogData.ts';
import { detectBreakingChanges } from '../scripts/check-breaking.ts';

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

async function runBackwardCompatTests() {
  console.log('\n--- Running Backward Compatibility Test Suite (Ticket #6) ---\n');

  // 1. All 7 Canonical Spreads Still Validate Cleanly
  console.log('1. Validating canonical catalog spreads against hardened v2.0.0 schema:');
  for (const spread of CANONICAL_SPREADS) {
    const report = validateSpreadDefinition(spread);
    assert(report.valid, `Spread '${spread.id}' validates cleanly against hardened schema`);
  }

  // 2. Existing Valid Fixtures Still Validate
  console.log('\n2. Validating example files against hardened schema:');
  const validSpreadJson = JSON.parse(
    fs.readFileSync('./examples/valid/past-present-future.jsonld', 'utf8')
  );
  const spreadReport = validateSpreadDefinition(validSpreadJson);
  assert(spreadReport.valid, 'past-present-future.jsonld passes validation under hardened schema');

  const validReadingJson = JSON.parse(
    fs.readFileSync('./examples/valid/reading-sample.jsonld', 'utf8')
  );
  const readingReport = validateReadingRecord(validReadingJson);
  assert(readingReport.valid, 'reading-sample.jsonld passes validation under hardened schema');

  // 3. check-breaking.ts Logic: No Breaking Changes on Baseline
  console.log('\n3. Verifying self-comparison produces 0 breaking changes:');
  const v2SpreadSchema = JSON.parse(
    fs.readFileSync('./schemas/v2/tarot-spread-definition-2.0.0.schema.json', 'utf8')
  );
  const breakingOnSelf = detectBreakingChanges(v2SpreadSchema, v2SpreadSchema);
  assert(breakingOnSelf.length === 0, 'Comparing schema to itself reports zero breaking changes');

  // 4. Induced Breaking Change Detection (Negative Testing)
  console.log('\n4. Inducing breaking changes to verify detector enforcement:');

  // Induced A: Adding a new required field
  const schemaWithNewRequired = JSON.parse(JSON.stringify(v2SpreadSchema));
  schemaWithNewRequired.required.push('mandatoryProvenanceSignature');
  const breakingA = detectBreakingChanges(v2SpreadSchema, schemaWithNewRequired);
  assert(
    breakingA.some((b) => b.type === 'REQUIRED_FIELD_ADDED'),
    'Correctly detected REQUIRED_FIELD_ADDED when new required field is introduced'
  );

  // Induced B: Removing an optional field
  const schemaWithRemovedProperty = JSON.parse(JSON.stringify(v2SpreadSchema));
  delete schemaWithRemovedProperty.properties.summary;
  const breakingB = detectBreakingChanges(v2SpreadSchema, schemaWithRemovedProperty);
  assert(
    breakingB.some((b) => b.type === 'OPTIONAL_FIELD_REMOVED'),
    'Correctly detected OPTIONAL_FIELD_REMOVED when property is deleted'
  );

  // Induced C: Narrowing an enum
  const schemaWithNarrowedEnum = JSON.parse(JSON.stringify(v2SpreadSchema));
  schemaWithNarrowedEnum.properties.layoutType.enum = ['linear', 'cross']; // removed circular, etc.
  const breakingC = detectBreakingChanges(v2SpreadSchema, schemaWithNarrowedEnum);
  assert(
    breakingC.some((b) => b.type === 'ENUM_VALUE_REMOVED'),
    'Correctly detected ENUM_VALUE_REMOVED when enum values are narrowed'
  );

  console.log(`\nBackward Compatibility Tests Summary: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runBackwardCompatTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
