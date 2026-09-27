# Schema.org & JSON-LD Semantic Mapping for Arcana Schema

This document details the semantic interoperability layer of **Arcana Schema**, enabling tarot spread definitions and reading records to be published as first-class linked data on the open semantic web and ingested by AI crawlers, knowledge graphs, and search engines.

---

## 🏛️ The Two-Layer Architecture

Arcana Schema uses a complementary **two-layer model**:

```text
┌─────────────────────────────────────────────────────────────┐
│                 SEMANTIC LINKED DATA LAYER                  │
│   Schema.org JSON-LD (@context, @type: DefinedTermSet /     │
│   Event, hasDefinedTerm, startDate, object)                 │
│   → Target: Search Engines, AI Crawlers, Knowledge Graphs   │
├─────────────────────────────────────────────────────────────┤
│                 STRUCTURAL VALIDATION LAYER                 │
│   JSON Schema Draft 2020-12 + Cross-Field Invariant Engine  │
│   (Unique IDs, sequence continuity, graph edge resolution)  │
│   → Target: TypeScript Apps, Databases, Mobile Frontends    │
└─────────────────────────────────────────────────────────────┘
```

1. **The Validation Layer (JSON Schema Draft 2020-12)**: Provides strict type definitions, regex format checks, coordinate boundary validations, and cross-field graph integrity checks so applications never crash on malformed data.
2. **The Semantic Layer (Schema.org JSON-LD)**: Provides an optional `@context` and `@type` header mapping custom tarot properties into standard Schema.org terms (`DefinedTermSet`, `DefinedTerm`, `Event`, `Action`). Plain JSON instances remain 100% valid without modifying existing applications.

---

## 🗺️ Complete Property Mapping Table

The canonical `@context` is hosted at `https://arcanaschema.org/contexts/tarot.jsonld` (defined in `contexts/tarot.jsonld`):

| Arcana Schema Term | Schema.org Vocabulary Term | RDF Type / Container | Semantic Description |
| :--- | :--- | :--- | :--- |
| `id` | `@id` | IRI / URI-safe slug | Canonical entity URI / slug identifier |
| `name` | `schema:name` | `Text` | Display title of the spread or card |
| `description` | `schema:description` | `Text` | Conceptual or position description |
| `summary` | `schema:abstract` | `Text` | Concise overview of purpose |
| `author` | `schema:author` | `Person` or `Organization` | Creator or historical lineage |
| `license` | `schema:license` | `URL` | Content usage license (e.g. CC-BY-4.0) |
| `tags` | `schema:keywords` | `Text` | Search and categorization tags |
| `slots` | `schema:hasDefinedTerm` | `@set` of `DefinedTerm` | Position slots defining the spread |
| `role` *(within slot)* | `schema:name` | `Text` | Positional role title (e.g., "The Root") |
| `meaning` *(within slot)* | `schema:description` | `Text` | Positional interpretive guidance |
| `order` *(within slot)* | `schema:position` | `Integer` | 1-indexed drawing sequence |
| `relations` | `schema:additionalProperty` | `@set` of `PropertyValue` | Directional graph edges between slots |
| `deckContract` | `schema:additionalProperty` | `PropertyValue` | Required deck size and constraints |
| `readingVariants` | `schema:sameAs` | `@set` of `URL` / `DefinedTermSet` | Alternative interpretation frameworks |
| `drawnAt` | `schema:startDate` | `schema:DateTime` | ISO 8601 reading timestamp |
| `startDate` | `schema:startDate` | `schema:DateTime` | Alias for drawnAt |
| `question` | `schema:about` | `Thing` / `Text` | Query inquiry focal topic |
| `querent` | `schema:attendee` | `Person` | Participant receiving reading |
| `reader` | `schema:performer` | `Person` | Practitioner conducting draw |
| `deck` | `schema:instrument` | `Product` / `Thing` | Deck edition utilized |
| `cards` | `schema:object` | `@set` of `Thing` | Cards drawn into positions |
| `interpretation` | `schema:result` | `Review` / `Text` | Synthesis and actionable advice |
| `notes` | `schema:disambiguatingDescription` | `Text` | Querent reflection commentary |

---

## 🔍 Worked Example: Plain JSON vs. JSON-LD

### 1. Plain JSON (Standard Arcana Schema)
```json
{
  "schemaVersion": "2.0.0",
  "id": "past-present-future",
  "name": "Past, Present, Future",
  "layoutType": "linear",
  "difficulty": "beginner",
  "deckContract": { "minCards": 3 },
  "slots": [
    { "id": "past", "order": 1, "role": "Past Foundations", "layout": { "x": 0.2, "y": 0.5 } },
    { "id": "present", "order": 2, "role": "Present Reality", "layout": { "x": 0.5, "y": 0.5 } },
    { "id": "future", "order": 3, "role": "Future Horizon", "layout": { "x": 0.8, "y": 0.5 } }
  ],
  "relations": [
    { "source": "past", "target": "present", "type": "leads_to" },
    { "source": "present", "target": "future", "type": "leads_to" }
  ]
}
```

### 2. The Same Spread as Schema.org JSON-LD
```json
{
  "@context": "https://arcanaschema.org/contexts/tarot.jsonld",
  "@type": "DefinedTermSet",
  "schemaVersion": "2.0.0",
  "id": "past-present-future",
  "name": "Past, Present, Future",
  "summary": "Classic 3-card linear temporal progression mapping timeline development.",
  "layoutType": "linear",
  "difficulty": "beginner",
  "deckContract": { "minCards": 3 },
  "slots": [
    { "id": "past", "order": 1, "role": "Past Foundations", "layout": { "x": 0.2, "y": 0.5 } },
    { "id": "present", "order": 2, "role": "Present Reality", "layout": { "x": 0.5, "y": 0.5 } },
    { "id": "future", "order": 3, "role": "Future Horizon", "layout": { "x": 0.8, "y": 0.5 } }
  ],
  "relations": [
    { "source": "past", "target": "present", "type": "leads_to" },
    { "source": "present", "target": "future", "type": "leads_to" }
  ]
}
```

---

## 🤖 How to Consume This

### What an AI Crawler or Knowledge Graph Sees
When an AI crawler (such as Googlebot, Perplexity, or an LLM embedding engine) encounters the JSON-LD document:
- It discovers an entity of type `https://schema.org/DefinedTermSet` named *"Past, Present, Future"*.
- It maps the `slots` array directly to `https://schema.org/hasDefinedTerm`, recognizing each slot as a formal `DefinedTerm` with a `position` (1, 2, 3) and a semantic label (`role` → `name`).
- For reading records, it identifies a `https://schema.org/Event` that took place at `startDate` (`drawnAt`), performed by a reader, centered on an `about` topic (`question`), yielding a synthesized `result` (`interpretation`).

### What an Application Developer Sees
- A developer importing `@arcana-schema/validator` can use identical JSON objects in TypeScript/JavaScript without any knowledge of RDF or JSON-LD.
- The reference validator guarantees that required fields, non-empty terms, valid timestamps, and unique IDs are verified, allowing typed React components, mobile apps, and databases to rely on rock-solid invariants.
- **Active Format Enforcement**: Format keywords (`format: "uri"`, `format: "date-time"`) are actively asserted rather than treated as inert annotations. Typos in `@context` URLs or `drawnAt` timestamps trigger immediate, standardized `ValidationError` failures.

---

## 🙏 Attribution & Heritage

We acknowledge and credit **[TarotSchema](https://www.tarotschema.com/)** for pioneering Schema.org JSON-LD usage within the tarot community. TarotSchema demonstrated how semantic web vocabularies allow divination datasets to be indexed and preserved on the open web.

Arcana Schema builds upon this foundation by adding a formal JSON Schema validation engine, cross-field integrity rules, 2D normalized layout coordinates, and relational graph edges while maintaining 100% semantic compatibility with Schema.org.
