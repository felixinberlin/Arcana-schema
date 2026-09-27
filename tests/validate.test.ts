/**
 * Arcana Schema Test Suite
 * Tests all canonical spreads, valid examples, and invalid fixtures.
 */

import {
  validateSpreadDefinition,
  validateReadingRecord,
  validateCatalogCollection,
} from '../src/schema/validator.ts';
import {
  CANONICAL_SPREADS,
  CANONICAL_CATALOG,
} from '../src/schema/catalogData.ts';
import fs from 'fs';
import path from 'path';

import type { TarotSpreadDefinition } from '../src/schema/types.ts';

// Test fixtures
const validPastPresentFuture: TarotSpreadDefinition = {
  schemaVersion: "2.0.0",
  id: "past-present-future",
  name: "Past, Present, Future",
  summary: "Classic 3-card linear temporal spread.",
  layoutType: "linear",
  difficulty: "beginner",
  deckContract: {
    minCards: 3,
    deckType: "full_78",
    allowReversals: true
  },
  slots: [
    { id: "past", order: 1, role: "Past Foundations", layout: { x: 0.2, y: 0.5 } },
    { id: "present", order: 2, role: "Present Reality", layout: { x: 0.5, y: 0.5 } },
    { id: "future", order: 3, role: "Future Horizon", layout: { x: 0.8, y: 0.5 } }
  ],
  relations: [
    { source: "past", target: "present", type: "leads_to" },
    { source: "present", target: "future", type: "leads_to" }
  ]
};

const invalidDuplicateSlot = {
  schemaVersion: "2.0.0",
  id: "invalid-duplicate-slot-id",
  name: "Invalid Duplicate Slot",
  deckContract: { minCards: 3 },
  slots: [
    { id: "slot-a", order: 1, role: "One", layout: { x: 0.2, y: 0.5 } },
    { id: "slot-a", order: 2, role: "Two (Dup)", layout: { x: 0.5, y: 0.5 } },
    { id: "slot-b", order: 3, role: "Three", layout: { x: 0.8, y: 0.5 } }
  ],
  relations: []
};

const invalidBrokenRelation = {
  schemaVersion: "2.0.0",
  id: "invalid-broken-relation",
  name: "Invalid Broken Relation",
  deckContract: { minCards: 2 },
  slots: [
    { id: "slot-1", order: 1, role: "One", layout: { x: 0.3, y: 0.5 } },
    { id: "slot-2", order: 2, role: "Two", layout: { x: 0.7, y: 0.5 } }
  ],
  relations: [
    { source: "slot-1", target: "non-existent-slot", type: "leads_to" }
  ]
};

const invalidMinCardsTooSmall = {
  schemaVersion: "2.0.0",
  id: "invalid-mincards",
  name: "Invalid minCards",
  deckContract: { minCards: 2 },
  slots: [
    { id: "slot-1", order: 1, role: "One", layout: { x: 0.2, y: 0.5 } },
    { id: "slot-2", order: 2, role: "Two", layout: { x: 0.5, y: 0.5 } },
    { id: "slot-3", order: 3, role: "Three", layout: { x: 0.8, y: 0.5 } }
  ],
  relations: []
};

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

console.log('\n--- Running Arcana Schema Test Suite ---\n');

// 1. Canonical Spreads
console.log('Validating Canonical Catalog Spreads:');
for (const spread of CANONICAL_SPREADS) {
  const report = validateSpreadDefinition(spread);
  assert(report.valid, `Spread '${spread.id}' validates cleanly (${report.checkedRulesCount} checks)`);
}

// 2. Canonical Catalog Manifest
console.log('\nValidating Catalog Manifest:');
const catalogReport = validateCatalogCollection(CANONICAL_CATALOG);
assert(catalogReport.valid, 'Canonical catalog manifest validates cleanly');

// 3. Valid fixture
console.log('\nValidating Valid Test Fixtures:');
const validReport = validateSpreadDefinition(validPastPresentFuture);
assert(validReport.valid, 'Past-Present-Future fixture passes all rules');

// 4. Invalid fixture: Duplicate Slot ID
console.log('\nValidating Invalid Test Fixtures (Negative Testing):');
const dupReport = validateSpreadDefinition(invalidDuplicateSlot);
assert(!dupReport.valid, 'Duplicate slot ID was properly rejected');
assert(dupReport.errors.some(e => e.code === 'ERR_DUPLICATE_SLOT_ID'), 'Detected ERR_DUPLICATE_SLOT_ID code');

// 5. Invalid fixture: Broken Relation
const brokenRelReport = validateSpreadDefinition(invalidBrokenRelation);
assert(!brokenRelReport.valid, 'Broken relation target was properly rejected');
assert(brokenRelReport.errors.some(e => e.code === 'ERR_RELATION_TARGET_UNRESOLVED'), 'Detected ERR_RELATION_TARGET_UNRESOLVED code');

// 6. Invalid fixture: minCards < slots
const minCardsReport = validateSpreadDefinition(invalidMinCardsTooSmall);
assert(!minCardsReport.valid, 'minCards < slots.length was properly rejected');
assert(minCardsReport.errors.some(e => e.code === 'ERR_MIN_CARDS_LESS_THAN_SLOTS'), 'Detected ERR_MIN_CARDS_LESS_THAN_SLOTS code');

// 7. Valid Reading Record
console.log('\nValidating Reading Record:');
const sampleReading = {
  schemaVersion: "1.0.0",
  readingId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  spreadId: "past-present-future",
  drawnAt: "2026-09-26T12:00:00Z",
  cards: [
    { slotId: "past", cardId: "major-00", orientation: "upright" },
    { slotId: "present", cardId: "cups-03", orientation: "reversed" },
    { slotId: "future", cardId: "swords-10", orientation: "upright" }
  ]
};
const readingReport = validateReadingRecord(sampleReading, validPastPresentFuture);
assert(readingReport.valid, 'Sample reading record validates against past-present-future spread');

console.log(`\nTests Summary: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) {
  process.exit(1);
}
