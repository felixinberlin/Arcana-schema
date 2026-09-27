/**
 * Arcana Schema - Public Validator Interface
 * Conforms to Ticket #6 specification with standardized ValidationError output and format enforcement.
 */

import {
  validateSpreadDefinition,
  validateReadingRecord,
  validateCatalogCollection,
  ajvValidateSpread,
  ajvValidateReading,
  ajvValidateCatalog,
} from './schema/validator.ts';
import { formatValidationError, type ValidationError, type ValidationResult } from './errors.ts';
import type { TarotSpreadDefinition } from './schema/types.ts';

export * from './errors.ts';
export {
  validateSpreadDefinition,
  validateReadingRecord,
  validateCatalogCollection,
} from './schema/validator.ts';

/**
 * Validates a tarot spread definition and returns standardized { valid, errors }.
 * Never throws on invalid input.
 */
export function validateSpread(data: unknown): ValidationResult {
  try {
    const report = validateSpreadDefinition(data);
    const errors: ValidationError[] = report.errors.map((err) => ({
      instancePath: err.instancePath || err.field || '',
      schemaPath: err.schemaPath || '#',
      keyword: err.keyword || err.code || 'custom',
      message: err.message,
      params: err.params || {},
    }));

    return {
      valid: report.valid,
      errors,
    };
  } catch (err: any) {
    return {
      valid: false,
      errors: [
        formatValidationError({
          instancePath: '',
          schemaPath: '#/exception',
          keyword: 'exception',
          message: err?.message || 'Unexpected validation failure',
        }),
      ],
    };
  }
}

/**
 * Validates a tarot reading record and returns standardized { valid, errors }.
 * Never throws on invalid input.
 */
export function validateReading(
  data: unknown,
  expectedSpread?: TarotSpreadDefinition
): ValidationResult {
  try {
    const report = validateReadingRecord(data, expectedSpread);
    const errors: ValidationError[] = report.errors.map((err) => ({
      instancePath: err.instancePath || err.field || '',
      schemaPath: err.schemaPath || '#',
      keyword: err.keyword || err.code || 'custom',
      message: err.message,
      params: err.params || {},
    }));

    return {
      valid: report.valid,
      errors,
    };
  } catch (err: any) {
    return {
      valid: false,
      errors: [
        formatValidationError({
          instancePath: '',
          schemaPath: '#/exception',
          keyword: 'exception',
          message: err?.message || 'Unexpected validation failure',
        }),
      ],
    };
  }
}

/**
 * Validates a tarot spread catalog and returns standardized { valid, errors }.
 * Never throws on invalid input.
 */
export function validateCatalog(data: unknown): ValidationResult {
  try {
    const report = validateCatalogCollection(data);
    const errors: ValidationError[] = report.errors.map((err) => ({
      instancePath: err.instancePath || err.field || '',
      schemaPath: err.schemaPath || '#',
      keyword: err.keyword || err.code || 'custom',
      message: err.message,
      params: err.params || {},
    }));

    return {
      valid: report.valid,
      errors,
    };
  } catch (err: any) {
    return {
      valid: false,
      errors: [
        formatValidationError({
          instancePath: '',
          schemaPath: '#/exception',
          keyword: 'exception',
          message: err?.message || 'Unexpected validation failure',
        }),
      ],
    };
  }
}
