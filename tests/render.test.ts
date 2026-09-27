/**
 * Arcana Schema - Render Module Test Suite
 * Tests determinism, format emitters, card lookups, and snapshot verification.
 */

import fs from 'fs';
import path from 'path';
import {
  renderSpread,
  renderReading,
  renderCatalog,
  t,
  type Deck,
  type CardLookup,
} from '../src/render/index.ts';
import {
  PAST_PRESENT_FUTURE_SPREAD,
  CANONICAL_CATALOG,
} from '../src/schema/catalogData.ts';
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

// Sample deck for reading tests
const sampleDeck: Deck = {
  name: 'Smith-Waite Centennial Tarot Deck',
  cards: {
    'major-01-the-magician': { name: 'I. The Magician', suit: 'Major', number: 1 },
    'swords-08': { name: 'Eight of Swords', suit: 'Swords', number: 8 },
    'wands-03': { name: 'Three of Wands', suit: 'Wands', number: 3 },
  },
};

const sampleReading: TarotReading = {
  schemaVersion: '1.0.0',
  readingId: '7d9c6b84-48f5-442a-9e12-b9e315538e82',
  spreadId: 'past-present-future',
  drawnAt: '2026-09-26T12:00:00Z',
  startDate: '2026-09-26T12:00:00Z',
  question: 'How should I navigate open source specification development?',
  deck: {
    name: 'Smith-Waite Centennial Tarot Deck',
    reversals: true,
  },
  cards: [
    {
      slotId: 'past',
      cardId: 'major-01-the-magician',
      orientation: 'upright',
      notes: 'Foundational technical skills and clear intention.',
    },
    {
      slotId: 'present',
      cardId: 'swords-08',
      orientation: 'reversed',
      notes: 'Stepping out of perceived blindfolds and isolation.',
    },
    {
      slotId: 'future',
      cardId: 'wands-03',
      orientation: 'upright',
      notes: 'Collaboration and ships arriving across the open sea.',
    },
  ],
  interpretation: {
    summary: 'Mastery of tools frees the querent from hesitation, establishing wide open-source adoption.',
  },
  notes: 'Reading conducted with focused breath meditation.',
};

async function runRenderTests() {
  console.log('\n--- Running Arcana Schema Render Module Test Suite ---\n');

  // 1. Generate & Verify Snapshot Files
  console.log('1. Snapshot file generation and comparison:');
  const renderedDir = path.resolve('./examples/rendered');
  if (!fs.existsSync(renderedDir)) {
    fs.mkdirSync(renderedDir, { recursive: true });
  }

  const spreadMd = renderSpread(PAST_PRESENT_FUTURE_SPREAD, { format: 'markdown' });
  const spreadTxt = renderSpread(PAST_PRESENT_FUTURE_SPREAD, { format: 'text' });
  const readingMd = renderReading(sampleReading, PAST_PRESENT_FUTURE_SPREAD, sampleDeck, {
    format: 'markdown',
  });
  const readingTxt = renderReading(sampleReading, PAST_PRESENT_FUTURE_SPREAD, sampleDeck, {
    format: 'text',
  });

  const spreadMdPath = path.join(renderedDir, 'past-present-future.spread.md');
  const spreadTxtPath = path.join(renderedDir, 'past-present-future.spread.txt');
  const readingMdPath = path.join(renderedDir, 'reading-sample.md');
  const readingTxtPath = path.join(renderedDir, 'reading-sample.txt');

  // If files don't exist yet, write them out
  if (!fs.existsSync(spreadMdPath)) fs.writeFileSync(spreadMdPath, spreadMd, 'utf8');
  if (!fs.existsSync(spreadTxtPath)) fs.writeFileSync(spreadTxtPath, spreadTxt, 'utf8');
  if (!fs.existsSync(readingMdPath)) fs.writeFileSync(readingMdPath, readingMd, 'utf8');
  if (!fs.existsSync(readingTxtPath)) fs.writeFileSync(readingTxtPath, readingTxt, 'utf8');

  // Assert exact byte-for-byte equality with committed files
  assert(
    fs.readFileSync(spreadMdPath, 'utf8') === spreadMd,
    'past-present-future.spread.md matches rendered output byte-for-byte'
  );
  assert(
    fs.readFileSync(spreadTxtPath, 'utf8') === spreadTxt,
    'past-present-future.spread.txt matches rendered output byte-for-byte'
  );
  assert(
    fs.readFileSync(readingMdPath, 'utf8') === readingMd,
    'reading-sample.md matches rendered output byte-for-byte'
  );
  assert(
    fs.readFileSync(readingTxtPath, 'utf8') === readingTxt,
    'reading-sample.txt matches rendered output byte-for-byte'
  );

  // 2. Determinism Test
  console.log('\n2. Determinism verification:');
  const call1 = renderReading(sampleReading, PAST_PRESENT_FUTURE_SPREAD, sampleDeck);
  const call2 = renderReading(sampleReading, PAST_PRESENT_FUTURE_SPREAD, sampleDeck);
  assert(call1 === call2, 'Two identical calls produce identical strings');

  const spreadCall1 = renderSpread(PAST_PRESENT_FUTURE_SPREAD);
  const spreadCall2 = renderSpread(PAST_PRESENT_FUTURE_SPREAD);
  assert(spreadCall1 === spreadCall2, 'renderSpread is strictly deterministic');

  // 3. Card Lookup Function vs Deck Object
  console.log('\n3. CardLookup function vs Deck object support:');
  const lookupFn: CardLookup = (cardId: string) => sampleDeck.cards[cardId];
  const renderedFromFn = renderReading(sampleReading, PAST_PRESENT_FUTURE_SPREAD, lookupFn);
  assert(
    renderedFromFn.includes('I. The Magician') && renderedFromFn.includes('Eight of Swords'),
    'renderReading correctly resolves cards using CardLookup function'
  );

  // 4. Missing Card ID Safety (Angle Brackets & No Throw)
  console.log('\n4. Missing card ID fallback handling:');
  const incompleteDeck: Deck = { name: 'Sparse Deck', cards: {} };
  let missingIdRendered = '';
  try {
    missingIdRendered = renderReading(sampleReading, PAST_PRESENT_FUTURE_SPREAD, incompleteDeck);
    assert(true, 'Renderer did not throw on missing card IDs');
  } catch (err) {
    assert(false, `Renderer threw on missing card IDs: ${err}`);
  }
  assert(
    missingIdRendered.includes('<major-01-the-magician>') &&
      missingIdRendered.includes('<swords-08>'),
    'Missing card IDs are rendered in angle brackets (<cardId>)'
  );

  // 5. Missing Translation Fallback
  console.log('\n5. i18n missing key fallback:');
  const fallbackResult = t('non_existent_key_123', {}, 'de');
  assert(fallbackResult === 'non_existent_key_123', 'Missing translation key returns raw key without throwing');

  const englishFallback = t('catalog.title', {}, 'fr');
  assert(englishFallback === 'Spread Catalog', 'Missing locale falls back to English translation');

  // 6. Format Differences (Markdown vs Plain Text)
  console.log('\n6. Markdown vs Plain Text formatting:');
  assert(spreadMd.startsWith('# Past, Present, Future'), 'Markdown spread begins with # title');
  assert(spreadTxt.includes('Past, Present, Future\n====================='), 'Plain text spread has = underline');
  assert(spreadMd.includes('**Past Foundations**'), 'Markdown positions use bold');
  assert(!spreadTxt.includes('**Past Foundations**') && spreadTxt.includes('Past Foundations'), 'Plain text positions do not contain markdown asterisks');

  // 7. Catalog Rendering
  console.log('\n7. Catalog rendering:');
  const catalogMd = renderCatalog(CANONICAL_CATALOG, { format: 'markdown' });
  const catalogTxt = renderCatalog(CANONICAL_CATALOG, { format: 'text' });

  assert(catalogMd.includes('# Spread Catalog'), 'Markdown catalog has # title');
  assert(catalogMd.includes('| ID | Name | Difficulty | Slots | Layout |'), 'Markdown catalog has pipe table');
  assert(catalogTxt.includes('Spread Catalog\n=============='), 'Plain text catalog has = underline');
  assert(catalogTxt.includes('single-card') && catalogTxt.includes('celtic-cross'), 'Catalog output contains spreads');

  console.log(`\nRender Tests Summary: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runRenderTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
