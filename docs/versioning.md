# Semantic Versioning Policy for Arcana Schema

Arcana Schema adheres to [Semantic Versioning 2.0.0](https://semver.org/). Because schemas act as formal data contracts across distributed applications, breaking change rules are strictly enforced via automated CI checks (`scripts/check-breaking.ts`).

---

## 🛑 What Constitutes a Breaking Change (MAJOR Bump Required)

Any modification that causes a previously valid document to become invalid is a breaking change:

1. **Adding a required field**: Documents authored against previous revisions would fail validation.
2. **Removing an optional field**: Documents containing the removed property would fail under `unevaluatedProperties: false`.
3. **Narrowing an enum**: Removing allowed enum values (e.g. dropping a `layoutType` or `relation.type`).
4. **Changing a data type**: Altering a field type (e.g. from `string` to `integer`, or from `array` to `object`).
5. **Adding new constraints**: Introducing a `pattern`, increasing `minLength`/`minimum`, or decreasing `maxLength`/`maximum`.

---

## ✅ What Constitutes a Non-Breaking Change (MINOR Bump)

Modifications that remain 100% backward compatible:

1. **Adding an optional field**: Previous valid documents continue to validate.
2. **Expanding an enum**: Introducing a new valid layout type or relationship modality.
3. **Relaxing constraints**: Increasing a `maxLength` or expanding numeric ranges.
4. **Adding non-assertive documentation**: Adding `title`, `description`, `examples`, or `$comment`.

---

## 🛠️ Automated CI Enforcement

Arcana Schema executes `scripts/check-breaking.ts` in pull request workflows. 

The tool performs deep AST diffs against the previous git tag. If any breaking change is detected without an accompanying bump to `schemaVersion` (e.g. `2.0.0` → `3.0.0`), the workflow terminates with exit code 1.
