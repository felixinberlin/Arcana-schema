# Draft-7 Compatibility Mirror

To ensure broad ecosystem compatibility with tools that do not yet support JSON Schema Draft 2020-12—such as **SchemaStore**, older IDE extensions, and legacy language validators—Arcana Schema publishes a mirrored version in **JSON Schema Draft 7** under `schemas/v2-draft7/`.

---

## 🔄 Generation Workflow

The mirror is generated using `scripts/generate-draft7.ts`:

```bash
npx tsx scripts/generate-draft7.ts
```

This script translates modern 2020-12 keywords into their nearest Draft-7 equivalents and bundles modular definitions into self-contained files.

---

## ⚠️ Documented Lossy Transforms

Draft-7 lacks several expressive keywords introduced in 2020-12. The following transformations are applied:

| 2020-12 Keyword | Draft-7 Keyword | Lossy Tradeoff |
| :--- | :--- | :--- |
| `unevaluatedProperties: false` | `additionalProperties: false` | In Draft 7, `additionalProperties` cannot see properties declared in adjacent `$ref` or `allOf` schemas. While our script bundles shared definitions to mitigate this, complex compositions in Draft 7 cannot guarantee strict leakage prevention. |
| `$defs` | `definitions` | Pure syntactic mapping to Draft-7 dictionary keyword. |
| External `$ref`s (`_shared/*.defs.json`) | Inlined `definitions` | External HTTP/file `$ref`s are resolved and inlined directly into `definitions` so legacy editors require no network access. |
| Dialect declaration | `http://json-schema.org/draft-07/schema#` | Replaces `https://json-schema.org/draft/2020-12/schema`. |

---

## 📌 Release Policy

The Draft-7 mirror is a build artifact generated upon formal tagged releases. It is not auto-committed on every intermediate commit, but is validated in CI to prevent divergence.
