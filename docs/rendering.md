# Deterministic Rendering Module for Arcana Schema

The Arcana Schema rendering module converts validated JSON objects (spread definitions, reading records, and catalogs) into human-readable plain text and Markdown.

It is **100% deterministic, zero-dependency (using only native `Intl`), and performs no network calls, I/O, or AI inference.** Given identical inputs and options, every output is byte-for-byte identical.

---

## 🚀 Public API

```typescript
import {
  renderSpread,
  renderReading,
  renderCatalog,
  type RenderOptions,
  type Deck,
  type CardLookup,
} from '@arcana-schema/validator';
```

### 1. `renderSpread(spread, options?)`
Renders a `TarotSpreadDefinition` into a human-readable layout guide.

```typescript
export function renderSpread(
  spread: SpreadDefinition,
  options?: RenderOptions
): string;
```

**Output includes:**
- Spread title and subtitle
- Metadata line: difficulty level, geometric layout type, slot count, minimum deck size
- Summary or description
- Numbered sequence of card positions with positional roles (and optional meanings)
- Relational graph edges described in natural language (e.g. *"The Past leads to the Present."*)
- Practitioner instructions (preparation, shuffle, drawing, synthesis), if present

---

### 2. `renderReading(reading, spread, deck, options?)`
Renders a saved `TarotReading` record into a narrative of the draw.

```typescript
export function renderReading(
  reading: Reading,
  spread: SpreadDefinition,
  deck: Deck | CardLookup,
  options?: RenderOptions
): string;
```

**Output includes:**
- Reading title
- Metadata line: UTC formatted draw timestamp and deck name
- Inquiry question (if present)
- Ordered list of drawn cards by position, including card names and orientation (Upright/Reversed)
- Practitioner interpretation summary
- Querent notes, if included

---

### 3. `renderCatalog(catalog, options?)`
Renders a `TarotSpreadCatalog` manifest into an index of available spreads.

```typescript
export function renderCatalog(
  catalog: SpreadCatalog,
  options?: RenderOptions
): string;
```

**Output includes:**
- Catalog title
- Aggregate metadata: total available spreads and cumulative slot count
- A formatted table (Markdown pipe table or spaced plain text columns) listing ID, Name, Difficulty, Slots, and Layout

---

## ⚙️ Options

```typescript
export interface RenderOptions {
  /** Output format. Default: "markdown". */
  format?: 'text' | 'markdown';
  /** BCP-47 locale tag. Default: "en". */
  locale?: string;
  /** Include the spread's instructions section. Default: true. */
  includeInstructions?: boolean;
  /** Include the reading's free-text notes. Default: true. */
  includeNotes?: boolean;
  /** Include slot meanings alongside roles. Default: false. */
  includeSlotMeanings?: boolean;
  /** Include card orientation explicitly. Default: true. */
  includeOrientation?: boolean;
}
```

---

## 🃏 Pluggable Deck Integration

The reading renderer does not hard-code card names. Any deck dataset can be passed as either a `Deck` object or a `CardLookup` function. If a card ID is not found, the renderer outputs `<cardId>` safely without throwing.

### Example 1: Integrating TarotSchema (`tarotschema.com`)
```typescript
import { renderReading, type Deck } from '@arcana-schema/validator';
import tarotSchemaDeck from './tarotschema-rws.json';

// Map TarotSchema's decks-schema.json format into Arcana Schema Deck
const deck: Deck = {
  name: tarotSchemaDeck.name || 'Rider-Waite-Smith',
  cards: Object.fromEntries(
    tarotSchemaDeck.cards.map((c: any) => [
      c.id, // e.g. "major-01"
      { name: c.name, suit: c.suit, number: c.number }
    ])
  ),
};

const output = renderReading(reading, spread, deck);
```

### Example 2: Integrating Tarotoo (via CardLookup Function)
```typescript
import { renderReading, type CardLookup } from '@arcana-schema/validator';
import tarotooCards from 'tarotoo-dataset';

// Implement CardLookup function
const tarotooLookup: CardLookup = (cardId: string) => {
  const card = tarotooCards.find((c: any) => c.slug === cardId);
  return card ? { name: card.title, suit: card.element } : undefined;
};

const output = renderReading(reading, spread, tarotooLookup, { format: 'text' });
```

---

## 🔒 Determinism & Caching

The renderer is guaranteed to be **byte-for-byte deterministic**:
- **Sorting Invariant:** Slots are always sorted by their numeric `order` (1..N). Cards in a reading are sorted by their corresponding slot order. Relations are iterated in declared array order.
- **Timezone Invariant:** `drawnAt` timestamps are always parsed and formatted in **UTC** (`timeZone: "UTC"`), ensuring identical strings across client browsers, CI servers, and serverless runtimes.
- **Caching:** The output can be safely memoized using a hash of `(JSON.stringify(input) + JSON.stringify(options))`.

---

## 🚫 Why Prose → JSON is Out of Scope

This module intentionally performs **unidirectional rendering** (`JSON → Text / Markdown`).

The inverse direction (`Natural Language Prose → Validated JSON`) is non-deterministic, requires an LLM / AI parser, and cannot guarantee semantic invariants (such as non-overlapping slots or strict schema validity) without heuristics.

Parsing natural language spreads into structured JSON is slated for **Ticket #5** as an optional AI extension.
