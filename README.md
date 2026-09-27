# Arcana Schema (Tarot Open Source JSON Specification)

[![Schema Version](https://img.shields.io/badge/schema-v2.0.0-blue.svg)](https://arcanaschema.org/schemas/v2/)
[![Draft 2020-12](https://img.shields.io/badge/JSON%20Schema-Draft%202020--12-green.svg)](https://json-schema.org/draft/2020-12/schema)
[![License: MIT](https://img.shields.io/badge/Code%20License-MIT-yellow.svg)](LICENSE)
[![Content License: CC BY 4.0](https://img.shields.io/badge/Content%20License-CC%20BY%204.0-lightgrey.svg)](LICENSE-content)
[![npm version](https://img.shields.io/badge/npm-%40arcana--schema%2Fvalidator-orange.svg)](https://www.npmjs.com/package/@arcana-schema/validator)

An open-source, versioned JSON Schema standard and validation framework for **tarot spreads** and **reading records**, accompanied by a curated canonical catalog and reference tooling.

---

## 🌟 Why Arcana Schema?

Until now, tarot software projects have invented fragmented, ad-hoc JSON structures without formal validation. Tarot spreads define spatial geometry, slot roles, deck contracts, and relational graph edges (e.g. *crosses*, *crowns*, *leads to*, *mirrors*).

**Arcana Schema solves this by providing:**
1. **Formal Separation**: Clean demarcation between reusable **Spread Definitions** (`TarotSpreadDefinition`) and historical **Reading Records** (`TarotReading`).
2. **First-Class Relational Edges**: Positional relationships are modeled as typed semantic directed edges (`leads_to`, `crosses`, `grounds`, `crowns`, `mirrors`, `opposes`, `clarifies`, `culminates_in`, `adjacent_to`) rather than arbitrary prose.
3. **Rigorous Dual-Layer Validation**: Full JSON Schema Draft 2020-12 compliance plus high-integrity cross-field semantic validation rules (uniqueness, sequential ordering, target resolution, deck capacity).
4. **Canonical Catalog**: Ready-to-use spread definitions from Single Card and Past-Present-Future to Celtic Cross and Tree of Life.
5. **Zero Vendor Lock-in**: Dual-licensed under MIT (code & schema structure) and CC-BY-4.0 (interpretive text).

---

## 📁 Repository Structure

```text
arcana-schema/
├── schemas/
│   ├── v2/
│   │   ├── tarot-spread-definition-2.0.0.schema.json # Hardened 2020-12 spread schema
│   │   ├── tarot-reading-1.0.0.schema.json           # Hardened 2020-12 reading schema
│   │   ├── tarot-spread-catalog-2.0.0.schema.json    # Catalog registry schema
│   │   └── _shared/                                  # Extracted modular $defs
│   │       ├── slot.defs.json
│   │       ├── relation.defs.json
│   │       ├── layout.defs.json
│   │       ├── deck-contract.defs.json
│   │       └── filter.defs.json
│   ├── v2-draft7/                                    # JSON Schema Draft-7 mirror
│   └── latest/                                       # Canonical latest version aliases
├── catalog/                                          # Curated canonical spread catalog
├── examples/                                         # Valid/invalid fixtures and rendered output
├── src/
│   ├── validator.ts                                  # Standardized validation engine
│   ├── errors.ts                                     # Stable ValidationError interfaces
│   ├── render/                                       # Deterministic markdown/text renderer
│   └── index.ts                                      # Public SDK exports
├── scripts/
│   ├── generate-draft7.ts                            # Draft-7 mirror generator
│   └── check-breaking.ts                             # Semver breaking-change detector
├── docs/
│   ├── schema-design.md                              # Architecture & unevaluatedProperties
│   ├── error-format.md                               # Standardized error shapes
│   ├── versioning.md                                 # Semver breaking-change rules
│   ├── draft7-mirror.md                              # Draft-7 transformations
│   ├── schema-org-mapping.md                         # Schema.org JSON-LD semantic layer
│   └── rendering.md                                  # Human-readable output formatting
└── tests/                                            # Meta-validation, compat & snapshot tests
```

---

## 📚 Specification Documentation

- **[Formal Standard Specification (v2.0.0)](SPECIFICATION.md)**: **The authoritative, normative Arcana Schema Specification** defining conformance targets, data models, spatial coordinate invariants, graph relation semantics, deterministic rendering rules, and card naming vocabularies.
- **[Schema Design Rationale](docs/schema-design.md)**: Explains `unevaluatedProperties: false`, modular `$defs`, resolvable `$id` URLs, and format assertions.
- **[Standardized Error Format](docs/error-format.md)**: The non-throwing `ValidationError` interface and determinism guarantees.
- **[Semantic Versioning Policy](docs/versioning.md)**: Rules for breaking vs non-breaking changes and CI automated enforcement.
- **[Draft-7 Compatibility Mirror](docs/draft7-mirror.md)**: Using Arcana Schema in SchemaStore, VS Code, and legacy Draft 7 tooling.
- **[Schema.org / JSON-LD Mapping](docs/schema-org-mapping.md)**: Semantic web interoperability using `DefinedTermSet` and `Event`.
- **[Deterministic Rendering Module](docs/rendering.md)**: Formatting validated JSON into plain text and Markdown.
- **[GitHub Pages Deployment Guide](docs/github-pages.md)**: Instructions for publishing the live interactive standard and schema endpoints to GitHub Pages.

---

## ⚡ How to Validate Your Own Spread in 10 Minutes

### 1. Install the SDK
```bash
npm install @arcana-schema/validator
```

### 2. Validate Against the Specification
```typescript
import { validateSpread, type ValidationError } from '@arcana-schema/validator';

const myCustomSpread = {
  schemaVersion: "2.0.0",
  id: "mind-body-spirit",
  name: "Mind, Body, Spirit",
  layoutType: "linear",
  difficulty: "beginner",
  deckContract: { minCards: 3, deckType: "full_78" },
  slots: [
    { id: "mind", order: 1, role: "Mental Focus", layout: { x: 0.2, y: 0.5 } },
    { id: "body", order: 2, role: "Physical State", layout: { x: 0.5, y: 0.5 } },
    { id: "spirit", order: 3, role: "Spiritual Path", layout: { x: 0.8, y: 0.5 } }
  ],
  relations: [
    { source: "mind", target: "body", type: "leads_to" },
    { source: "body", target: "spirit", type: "culminates_in" }
  ]
};

const result = validateSpread(myCustomSpread);

if (result.valid) {
  console.log("✓ Spread is fully compliant with Arcana Schema v2.0.0!");
} else {
  console.error("Validation issues encountered:");
  for (const err of result.errors) {
    console.error(`- [${err.keyword}] at ${err.instancePath}: ${err.message}`);
  }
}
```

Format enforcement is enabled by default (`ajv-formats` with `validateFormats: true`). All URIs and ISO 8601 timestamps are actively asserted. Errors return a standardized `ValidationError` structure and will never throw.

---

## 📐 Schema Quick Reference

### 1. Tarot Spread Definition (`v2.0.0`)
**Schema ID:** `https://arcanaschema.org/schemas/v2/tarot-spread-definition.schema.json`

```json
{
  "schemaVersion": "2.0.0",
  "id": "past-present-future",
  "name": "Past, Present, Future",
  "layoutType": "linear",
  "difficulty": "beginner",
  "deckContract": {
    "minCards": 3,
    "deckType": "full_78",
    "allowReversals": true
  },
  "slots": [
    { "id": "past",    "order": 1, "role": "Past Foundations",     "layout": { "x": 0.2, "y": 0.5 } },
    { "id": "present", "order": 2, "role": "Present Reality",       "layout": { "x": 0.5, "y": 0.5 } },
    { "id": "future",  "order": 3, "role": "Likely Future Outcome", "layout": { "x": 0.8, "y": 0.5 } }
  ],
  "relations": [
    { "source": "past", "target": "present", "type": "leads_to", "label": "Evolves Into" },
    { "source": "present", "target": "future", "type": "leads_to", "label": "Projected Flow" }
  ]
}
```

### 2. Tarot Reading Record (`v1.0.0`)
**Schema ID:** `https://arcanaschema.org/schemas/v2/tarot-reading.schema.json`

```json
{
  "schemaVersion": "1.0.0",
  "readingId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "spreadId": "past-present-future",
  "drawnAt": "2026-09-26T12:00:00Z",
  "question": "Navigating my new software project launch",
  "deck": {
    "name": "Smith-Waite Centennial Edition",
    "reversals": true
  },
  "cards": [
    { "slotId": "past",    "cardId": "major-01-the-magician", "orientation": "upright" },
    { "slotId": "present", "cardId": "swords-08",             "orientation": "reversed" },
    { "slotId": "future",  "cardId": "wands-03",              "orientation": "upright" }
  ],
  "interpretation": {
    "summary": "Mastery in your foundations dissolves perceived paralysis, unlocking horizon expansion."
  }
}
```

---

## 🛡️ Validation Engine & Cross-Field Rules

While JSON Schema verifies basic types and regex patterns, the Arcana Schema reference validator enforces deep semantic invariants:

| Rule Code | Description | Severity |
| :--- | :--- | :--- |
| `ERR_DUPLICATE_SLOT_ID` | Slot IDs must be strictly unique within a spread. | **Error** |
| `ERR_SLOT_ORDER_NOT_SEQUENTIAL` | Slot `order` numbers must form an unbroken sequence from `1..N`. | **Error** |
| `ERR_RELATION_SOURCE_UNRESOLVED` | `relation.source` must match a defined `slot.id`. | **Error** |
| `ERR_RELATION_TARGET_UNRESOLVED` | `relation.target` must match a defined `slot.id`. | **Error** |
| `ERR_MIN_CARDS_LESS_THAN_SLOTS` | `deckContract.minCards` must be greater than or equal to `slots.length`. | **Error** |
| `ERR_MIN_CARDS_EXCEEDS_MAX` | `deckContract.minCards` cannot exceed `deckContract.maxCards`. | **Error** |
| `ERR_COORDINATE_OUT_OF_BOUNDS` | Normalized `layout.x` and `layout.y` must fall within `[0.0, 1.0]`. | **Error** |
| `ERR_DUPLICATE_CATALOG_SPREAD_ID` | All spreads within a catalog must have unique IDs. | **Error** |

---

## 💻 Installation & Usage

### TypeScript / Node.js
```bash
npm install @arcana-schema/validator
```

```typescript
import { validateSpreadDefinition, validateReadingRecord } from '@arcana-schema/validator';

const spreadData = JSON.parse(fs.readFileSync('./my-spread.json', 'utf8'));

const report = validateSpreadDefinition(spreadData);
if (!report.valid) {
  console.error('Validation failed with errors:');
  report.errors.forEach(err => console.error(`[${err.code}] ${err.field}: ${err.message}`));
} else {
  console.log(`✅ Conformed! Passed all ${report.checkedRulesCount} schema and cross-field checks.`);
}
```

### Python
```python
import json
import jsonschema

with open('schemas/v2/tarot-spread-definition.schema.json') as f:
    schema = json.load(f)

with open('catalog/celtic-cross.json') as f:
    spread = json.load(f)

jsonschema.validate(instance=spread, schema=schema)
print("Spread conforms to Arcana Schema v2.0.0")
```

---

## 🤝 Relationship to Other Projects

- **TarotSchema (tarotschema.com)**: TarotSchema publishes rich Schema.org JSON-LD vocabularies for search engines. Arcana Schema is the operational, validated data standard for applications, databases, and APIs.
- **Tarotsmith / Cybertarot / Tarotoo**: Arcana Schema provides a neutral, vendor-independent schema standard that any tarot reader, app developer, or researcher can adopt without vendor lock-in.

---

## 📄 License

- **Code, Tooling, and JSON Schemas**: [MIT License](LICENSE)
- **Spread Descriptions and Interpretive Content**: [Creative Commons Attribution 4.0 International (CC-BY-4.0)](LICENSE-content)
