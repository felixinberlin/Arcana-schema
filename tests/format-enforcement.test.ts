/**
 * Arcana Schema - Format Enforcement Test Suite
 * Tests that format: "uri" and format: "date-time" are actively asserted (not just annotations)
 * and that errors conform to the standardized ValidationError shape.
 */

import { validateSpread, validateReading } from '../src/validator.ts';
import { PAST_PRESENT_FUTURE_SPREAD } from '../src/schema/catalogData.ts';
import type { TarotReading } from '../src/schema/types.ts';

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

const baseReading: TarotReading = {
  schemaVersion: '1.0.0',
  readingId: '7d9c6b84-48f5-442a-9e12-b9e315538e82',
  spreadId: 'past-present-future',
  drawnAt: '2026-09-26T12:00:00Z',
  cards: [
    { slotId: 'past', cardId: 'major-01', orientation: 'upright' },
    { slotId: 'present', cardId: 'swords-08', orientation: 'reversed' },
    { slotId: 'future', cardId: 'wands-03', orientation: 'upright' },
  ],
};

async function runFormatEnforcementTests() {
  console.log('\n--- Running Format Enforcement Test Suite (Ticket #6) ---\n');

  // 1. Valid Date-Time Passes
  console.log('1. Valid date-time format:');
  const validResult = validateReading(baseReading);
  assert(validResult.valid, 'Valid ISO 8601 UTC date-time passes validation');

  // 2. Malformed Date-Time Fails Validation
  console.log('\n2. Malformed date-time format enforcement:');
  const readingWithBadDate = {
    ...baseReading,
    drawnAt: '2026-13-45 NotADate:99:99',
  };
  const badDateResult = validateReading(readingWithBadDate);
  assert(!badDateResult.valid, 'Malformed date-time fails validation');

  const dateError = badDateResult.errors.find(
    (e) => e.keyword === 'format' && (e.params as any)?.format === 'date-time'
  );
  assert(Boolean(dateError), 'Detected format error with params.format === "date-time"');
  if (dateError) {
    assert(
      dateError.instancePath === '/drawnAt',
      `Error instancePath is '/drawnAt' (actual: '${dateError.instancePath}')`
    );
    assert(
      dateError.message.includes('must match format "date-time"'),
      `Stable message produced: "${dateError.message}"`
    );
  }

  // 3. Valid URI in @context Passes
  console.log('\n3. Valid URI format:');
  const spreadWithValidUri = {
    ...PAST_PRESENT_FUTURE_SPREAD,
    '@context': 'https://arcanaschema.org/contexts/tarot.jsonld',
    '@type': 'DefinedTermSet',
  };
  const validUriResult = validateSpread(spreadWithValidUri);
  assert(validUriResult.valid, 'Valid URI in @context passes validation');

  // 4. Malformed URI Fails Validation
  console.log('\n4. Malformed URI format enforcement:');
  const spreadWithMalformedUri = {
    ...PAST_PRESENT_FUTURE_SPREAD,
    '@context': '::not_a_valid_uri::',
    '@type': 'DefinedTermSet',
  };
  const malformedUriResult = validateSpread(spreadWithMalformedUri);
  assert(!malformedUriResult.valid, 'Malformed URI in @context fails validation');

  // 5. Error output shape adherence to ValidationError interface
  console.log('\n5. Standardized error shape verification:');
  for (const err of badDateResult.errors) {
    assert(typeof err.instancePath === 'string', 'err.instancePath is string');
    assert(typeof err.schemaPath === 'string', 'err.schemaPath is string');
    assert(typeof err.keyword === 'string', 'err.keyword is string');
    assert(typeof err.message === 'string', 'err.message is string');
    assert(typeof err.params === 'object' && err.params !== null, 'err.params is object');
  }

  // 6. Stability test: Identical error messages on two runs
  console.log('\n6. Error stability verification:');
  const run1 = validateReading(readingWithBadDate);
  const run2 = validateReading(readingWithBadDate);
  assert(
    JSON.stringify(run1.errors) === JSON.stringify(run2.errors),
    'Two validation runs with identical input produce byte-for-byte identical error outputs'
  );

  console.log(`\nFormat Enforcement Tests Summary: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runFormatEnforcementTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
