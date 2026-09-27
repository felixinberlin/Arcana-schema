/**
 * Arcana Schema - Standardized Validation Errors
 * Standardized error shape and stable message mappings across Ajv versions and validator implementations.
 */

export interface ValidationError {
  instancePath: string;   // JSON Pointer to the offending value (e.g. "/slots/0/role")
  schemaPath: string;     // JSON Pointer to the rule in the schema (e.g. "#/properties/role/minLength")
  keyword: string;        // e.g. "required", "pattern", "unevaluatedProperties", "format"
  message: string;        // Human-readable, stable across Ajv versions
  params: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Stable error message generators mapped by keyword.
 * Ensures identical error messages across runs, platforms, and Ajv versions.
 */
export const STABLE_MESSAGES: Record<string, (params: Record<string, unknown>) => string> = {
  required: (params) =>
    `must have required property '${String(params.missingProperty || '')}'`,

  unevaluatedProperties: (params) =>
    `must NOT have unevaluated properties '${String(params.unevaluatedProperty || '')}'`,

  additionalProperties: (params) =>
    `must NOT have additional properties '${String(params.additionalProperty || '')}'`,

  minProperties: (params) =>
    `must NOT have fewer than ${String(params.limit || 1)} properties`,

  maxProperties: (params) =>
    `must NOT have more than ${String(params.limit || 0)} properties`,

  minItems: (params) =>
    `must NOT have fewer than ${String(params.limit || 1)} items`,

  maxItems: (params) =>
    `must NOT have more than ${String(params.limit || 0)} items`,

  format: (params) =>
    `must match format "${String(params.format || '')}"`,

  pattern: (params) =>
    `must match pattern "${String(params.pattern || '')}"`,

  enum: (params) => {
    const values = Array.isArray(params.allowedValues)
      ? params.allowedValues.map((v) => JSON.stringify(v)).join(', ')
      : '';
    return `must be equal to one of the allowed values: [${values}]`;
  },

  const: (params) =>
    `must be equal to constant "${String(params.allowedValue)}"`,

  type: (params) =>
    `must be ${String(params.type || 'valid type')}`,

  minimum: (params) =>
    `must be >= ${String(params.limit)}`,

  maximum: (params) =>
    `must be <= ${String(params.limit)}`,

  minLength: (params) =>
    `must NOT have fewer than ${String(params.limit || 1)} characters`,

  maxLength: (params) =>
    `must NOT have more than ${String(params.limit || 0)} characters`,

  uniqueItems: () =>
    `must NOT have duplicate items (items ## 1 and 0 are identical)`,
};

/**
 * Formats an Ajv error or cross-field error into a standardized, deterministic ValidationError.
 */
export function formatValidationError(rawError: {
  instancePath?: string;
  schemaPath?: string;
  keyword?: string;
  message?: string;
  params?: Record<string, unknown>;
}): ValidationError {
  const keyword = rawError.keyword || 'custom';
  const params = rawError.params || {};
  const instancePath = rawError.instancePath || '';
  const schemaPath = rawError.schemaPath || '#/custom';

  const generator = STABLE_MESSAGES[keyword];
  const stableMessage = generator ? generator(params) : rawError.message || 'validation failed';

  return {
    instancePath,
    schemaPath,
    keyword,
    message: stableMessage,
    params,
  };
}
