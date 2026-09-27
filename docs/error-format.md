# Standardized Validation Error Format

Arcana Schema provides a standardized error shape that remains stable across library upgrades, CI runners, and programming language bindings.

---

## 📋 The `ValidationError` Interface

```typescript
export interface ValidationError {
  /** JSON Pointer to the offending value in the input document (e.g. "/slots/0/role"). */
  instancePath: string;

  /** JSON Pointer to the schema constraint that was violated (e.g. "#/properties/role/minLength"). */
  schemaPath: string;

  /** Canonical rule keyword (e.g. "required", "pattern", "unevaluatedProperties", "format"). */
  keyword: string;

  /** Human-readable, stable error explanation. */
  message: string;

  /** Machine-readable validation parameters (e.g. { missingProperty: "name" }). */
  params: Record<string, unknown>;
}
```

The validator returns:
```typescript
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
```

---

## 🔒 Determinism and Stability Guarantees

1. **Non-Throwing Contract**: The validator never throws exceptions on malformed, unexpected, or invalid input. It consistently returns `{ valid: false, errors: [...] }`.
2. **Stable Messages**: Default error strings from validation libraries vary across releases. Arcana Schema maps `(keyword, params)` to deterministic message templates. Two identical inputs will produce byte-for-byte identical error arrays.
3. **Precise Pointers**: `instancePath` always uses standard RFC 6901 JSON Pointers (e.g. `/deckContract/minCards`).

---

## 🧪 Example Error Payload

Given an input with a missing slot role and an unrecognized property:

```json
{
  "valid": false,
  "errors": [
    {
      "instancePath": "/slots/0",
      "schemaPath": "#/properties/slots/items/required",
      "keyword": "required",
      "message": "must have required property 'role'",
      "params": {
        "missingProperty": "role"
      }
    },
    {
      "instancePath": "/slots/0",
      "schemaPath": "#/properties/slots/items/unevaluatedProperties",
      "keyword": "unevaluatedProperties",
      "message": "must NOT have unevaluated properties 'customExtraNote'",
      "params": {
        "unevaluatedProperty": "customExtraNote"
      }
    }
  ]
}
```
