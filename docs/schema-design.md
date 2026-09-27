# Arcana Schema Architecture & Design Rationale

This document details the architectural decisions and hardening principles underlying Arcana Schema v2.0.0.

---

## 1. `unevaluatedProperties: false` vs. `additionalProperties: false`

### The Problem with `additionalProperties`
In JSON Schema Draft 2020-12, `additionalProperties: false` only evaluates properties declared in the immediate schema object. When schemas compose definitions via `$ref` or `allOf`, `additionalProperties` cannot see properties evaluated by adjacent subschemas. This creates a dangerous loophole where unexpected or misspelled fields pass validation unnoticed.

### The Solution: `unevaluatedProperties`
Arcana Schema enforces `unevaluatedProperties: false` at all object levels. `unevaluatedProperties` tracks property evaluation dynamically across all `$ref` chains and compositions. If a document introduces an uncontracted property, it is strictly caught and rejected.

---

## 2. Reusable Modular `$defs` (`schemas/v2/_shared/`)

Rather than duplicating structural definitions across spreads, readings, and catalogs, core data structures are extracted into dedicated definition files:

| Definition File | Target Entity | Responsibilities |
| :--- | :--- | :--- |
| `layout.defs.json` | `layoutCoordinate` | Normalized 2D coordinates `(x, y)`, rotation angles, and `zIndex` stacking order. |
| `deck-contract.defs.json` | `deckContract` | Minimum card thresholds, expansion allowances, reversal flags, and significator requirements. |
| `filter.defs.json` | `cardConstraint` | Subdeck restrictions, allowed arcana, suit filtering, and fixed card assignments. |
| `relation.defs.json` | `relation` | Directed semantic graph edges (`leads_to`, `crosses`, `grounds`, etc.) with weights and labels. |
| `slot.defs.json` | `slot` | Complete slot definition linking layout coordinates and filtering constraints. |

All schema files reference these shared definitions via deterministic `$ref` URIs.

---

## 3. Resolvable `$id` Architecture (Option B)

Per Ticket #6 specifications, `$id` URIs must be publicly resolvable on the open web.

Arcana Schema adopts **Option B**:
- Root base URI: `https://raw.githubusercontent.com/arcana-schema/schemas/main/schemas/v2/`
- Every schema file declares an `$id` matching its canonical raw GitHub URL.
- Downstream tools, IDEs, and online validators can fetch schemas and sub-definitions directly over HTTPS without domain proxying.

Aliases are also maintained in `schemas/latest/` pointing to the newest published standard.

---

## 4. `minProperties: 1` Invariant

Empty objects (`{}`) in data fields like `deckContract`, `querent`, or `instructions` often represent uninitialized states or serialization errors. Specifying `minProperties: 1` ensures that if an optional object property is provided, it contains actual data.

---

## 5. Active Format Enforcement

By default, the `format` keyword in JSON Schema Draft 2020-12 is treated as an annotation rather than an assertion. 

Arcana Schema's reference validator explicitly configures Ajv with `validateFormats: true`:
- `format: "uri"`: Validates that context URLs and repository links are syntactically valid URIs.
- `format: "date-time"`: Validates that timestamps (`drawnAt`, `updatedAt`) adhere strictly to ISO 8601 UTC notation.
- `format: "uuid"`: Asserts that session identifiers conform to RFC 4122 UUID v4 formatting.
