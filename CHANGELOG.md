# Changelog

All notable changes to the Arcana Schema project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-09-26
### Added
- Released `tarot-spread-definition.schema.json` v2.0.0 (Draft 2020-12).
- Released `tarot-reading.schema.json` v1.0.0 for immutable reading records.
- Released `tarot-spread-catalog.schema.json` v2.0.0 for manifest catalogs.
- Added typed relational graph edges: `leads_to`, `crosses`, `grounds`, `crowns`, `mirrors`, `opposes`, `clarifies`, `culminates_in`, `adjacent_to`.
- Added normalized 2D layout coordinates (`x`, `y`, `rotation`, `zIndex`) for multi-platform visual rendering.
- Added cross-field validation rules for duplicate slot IDs, slot order continuity, relation graph resolution, and deck contract minimums.
- Released initial curated catalog:
  - `single-card` (1 card, linear)
  - `past-present-future` (3 cards, linear with variants)
  - `decision` (5 cards, triangular)
  - `relationship` (6 cards, custom mirror)
  - `horseshoe` (7 cards, arch)
  - `celtic-cross` (10 cards, classic cross & staff)
  - `tree-of-life` (10 cards, Qabalistic sephirot)
- Released `@arcana-schema/validator` reference implementation with Ajv 2020-12.
