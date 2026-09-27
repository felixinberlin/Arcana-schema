# Contributing to Arcana Schema

Thank you for contributing to the open-source Tarot JSON Specification!

## 🌿 How to Add a New Spread to the Catalog

1. **Fork** the repository on GitHub.
2. Create a new branch: `git checkout -b spread/your-spread-name`.
3. Add your JSON file in `catalog/<spread-id>.json`.
4. Ensure your spread fulfills:
   - Valid `schemaVersion`: `"2.0.0"`
   - Kebab-case `id` matching the file name
   - Proper normalized layout coordinates (`0.0 <= x <= 1.0`, `0.0 <= y <= 1.0`)
   - Sequential 1-based slot ordering
   - Valid relational targets (`source` and `target` matching defined slot IDs)
   - `deckContract.minCards >= slots.length`
5. Run the validator:
   ```bash
   npm test
   ```
6. Update `catalog/index.json` with the manifest summary of your spread.
7. Submit a Pull Request.

## 📐 Proposing Changes to the Schemas

Schema changes are governed by semantic versioning:
- **Major bump (e.g. v3.0.0)**: Breaking changes, removing required properties, changing validation rules to be more restrictive.
- **Minor bump (e.g. v2.1.0)**: Adding new optional properties, extending enum lists.
- **Patch bump (e.g. v2.0.1)**: Clarifications to `description` text or regex typo fixes that don't invalidate existing conforming data.

Open an Issue labeled `rfc` before submitting pull requests for schema modifications.
