/**
 * Arcana Schema - Tarot Open Source JSON Specification
 * Reference Validator Implementation
 * Combines Ajv JSON Schema Draft 2020-12 validation with deep cross-field semantic checks.
 */

import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import {
  spreadDefinitionSchema,
  readingSchema,
  catalogSchema,
  layoutDefsSchema,
  deckContractDefsSchema,
  filterDefsSchema,
  relationDefsSchema,
  slotDefsSchema,
} from './rawSchemas.ts';
import { formatValidationError } from '../errors.ts';
import type {
  TarotSpreadDefinition,
  TarotReading,
  TarotSpreadCatalog,
  ValidationReport,
  ValidationErrorItem,
} from './types.ts';

// Initialize Ajv instance with 2020-12 draft support and enforced formats
const AjvConstructor = (Ajv2020 as any).default || Ajv2020;
const ajv = new (AjvConstructor as new (opts?: any) => any)({
  allErrors: true,
  strict: false,
  validateFormats: true,
});
(addFormats as any)(ajv);

// Register shared definitions
ajv.addSchema(layoutDefsSchema, layoutDefsSchema.$id);
ajv.addSchema(deckContractDefsSchema, deckContractDefsSchema.$id);
ajv.addSchema(filterDefsSchema, filterDefsSchema.$id);
ajv.addSchema(relationDefsSchema, relationDefsSchema.$id);
ajv.addSchema(slotDefsSchema, slotDefsSchema.$id);

// Register schemas
ajv.addSchema(spreadDefinitionSchema, spreadDefinitionSchema.$id);
ajv.addSchema(readingSchema, readingSchema.$id);
ajv.addSchema(catalogSchema, catalogSchema.$id);

// Also register aliases for backward compatibility
ajv.addSchema(
  spreadDefinitionSchema,
  'https://arcanaschema.org/schemas/v2/tarot-spread-definition.schema.json'
);
ajv.addSchema(
  spreadDefinitionSchema,
  'tarot-spread-definition.schema.json'
);
ajv.addSchema(
  readingSchema,
  'https://arcanaschema.org/schemas/v2/tarot-reading.schema.json'
);
ajv.addSchema(
  catalogSchema,
  'https://arcanaschema.org/schemas/v2/tarot-spread-catalog.schema.json'
);

export const ajvValidateSpread = ajv.compile(spreadDefinitionSchema);
export const ajvValidateReading = ajv.compile(readingSchema);
export const ajvValidateCatalog = ajv.compile(catalogSchema);

/**
 * Validate a TarotSpreadDefinition JSON object against Schema + Cross-Field Rules.
 */
export function validateSpreadDefinition(data: unknown): ValidationReport {
  const errors: ValidationErrorItem[] = [];
  const warnings: ValidationErrorItem[] = [];
  let checkedRulesCount = 0;

  // 1. JSON Schema Draft 2020-12 Validation
  checkedRulesCount++;
  const schemaValid = ajvValidateSpread(data);
  if (!schemaValid && ajvValidateSpread.errors) {
    for (const err of ajvValidateSpread.errors) {
      const formatted = formatValidationError({
        instancePath: err.instancePath || '',
        schemaPath: err.schemaPath || '#',
        keyword: err.keyword,
        message: err.message,
        params: err.params as Record<string, unknown>,
      });

      errors.push({
        type: 'schema',
        field: err.instancePath || '/',
        message: formatted.message,
        code: `ERR_SCHEMA_${err.keyword?.toUpperCase() || 'VALIDATION'}`,
        severity: 'error',
        instancePath: formatted.instancePath,
        schemaPath: formatted.schemaPath,
        keyword: formatted.keyword,
        params: formatted.params,
      });
    }
  }

  // If top-level object structure is severely broken, abort cross-field checks early
  if (!data || typeof data !== 'object') {
    return { valid: false, errors, warnings, checkedRulesCount };
  }

  const spread = data as Partial<TarotSpreadDefinition>;

  // JSON-LD Semantic Checks (when @context is present)
  if (spread['@context'] !== undefined) {
    checkedRulesCount++;
    if (!spread['@type']) {
      errors.push({
        type: 'cross-field',
        field: '/@type',
        message: 'When @context is present, @type must also be specified for Schema.org JSON-LD compliance.',
        code: 'ERR_JSONLD_TYPE_REQUIRED',
        severity: 'error',
      });
    }

    if (spread['@type'] === 'DefinedTermSet') {
      const termsCount = (spread.slots?.length ?? 0) + (spread.hasDefinedTerm?.length ?? 0);
      if (termsCount === 0) {
        errors.push({
          type: 'cross-field',
          field: '/slots',
          message: 'A DefinedTermSet must contain at least one defined term in slots or hasDefinedTerm.',
          code: 'ERR_DEFINED_TERM_SET_EMPTY',
          severity: 'error',
        });
      }
    }

    if (spread['@context'] === 'https://schema.org') {
      warnings.push({
        type: 'cross-field',
        field: '/@context',
        message: 'Using generic context https://schema.org. The Arcana context https://arcanaschema.org/contexts/tarot.jsonld is preferred for comprehensive property mapping.',
        code: 'WARN_GENERIC_SCHEMA_ORG_CONTEXT',
        severity: 'warning',
      });
    }
  }

  // 2. Cross-Field: Slots Array Inspection
  if (Array.isArray(spread.slots) && spread.slots.length > 0) {
    checkedRulesCount++;
    const slotIds = new Set<string>();
    const duplicateIds = new Set<string>();

    for (const slot of spread.slots) {
      if (typeof slot?.id === 'string') {
        if (slotIds.has(slot.id)) {
          duplicateIds.add(slot.id);
        }
        slotIds.add(slot.id);
      }
    }

    if (duplicateIds.size > 0) {
      errors.push({
        type: 'cross-field',
        field: '/slots',
        message: `Duplicate slot IDs detected: [${Array.from(duplicateIds).join(', ')}]. Slot IDs must be strictly unique within a spread definition.`,
        code: 'ERR_DUPLICATE_SLOT_ID',
        severity: 'error',
      });
    }

    // 3. Cross-Field: Slot Order Sequential from 1
    checkedRulesCount++;
    const orders = spread.slots
      .map((s) => s?.order)
      .filter((o): o is number => typeof o === 'number')
      .sort((a, b) => a - b);

    if (orders.length === spread.slots.length) {
      const hasGapsOrDuplicates = orders.some((ord, idx) => ord !== idx + 1);
      if (hasGapsOrDuplicates) {
        errors.push({
          type: 'cross-field',
          field: '/slots/order',
          message: `Slot orders must be strictly sequential 1..${spread.slots.length} without gaps or repeats. Found: [${orders.join(', ')}].`,
          code: 'ERR_SLOT_ORDER_NOT_SEQUENTIAL',
          severity: 'error',
        });
      }
    }

    // 4. Cross-Field: Layout coordinates in normalized bounds [0, 1]
    checkedRulesCount++;
    spread.slots.forEach((slot, idx) => {
      if (slot?.layout) {
        const { x, y } = slot.layout;
        if (typeof x === 'number' && (x < 0 || x > 1)) {
          errors.push({
            type: 'cross-field',
            field: `/slots/${idx}/layout/x`,
            message: `Normalized coordinate x (${x}) must be between 0.0 and 1.0.`,
            code: 'ERR_COORDINATE_OUT_OF_BOUNDS',
            severity: 'error',
          });
        }
        if (typeof y === 'number' && (y < 0 || y > 1)) {
          errors.push({
            type: 'cross-field',
            field: `/slots/${idx}/layout/y`,
            message: `Normalized coordinate y (${y}) must be between 0.0 and 1.0.`,
            code: 'ERR_COORDINATE_OUT_OF_BOUNDS',
            severity: 'error',
          });
        }
      } else {
        warnings.push({
          type: 'cross-field',
          field: `/slots/${idx}/layout`,
          message: `Slot '${slot?.id || idx}' does not specify layout coordinates. Visual spread rendering will use fallback auto-distribution.`,
          code: 'WARN_MISSING_LAYOUT_COORDINATES',
          severity: 'warning',
        });
      }
    });

    // 5. Cross-Field: Relations Target & Source Resolution
    if (Array.isArray(spread.relations)) {
      checkedRulesCount++;
      spread.relations.forEach((rel, relIdx) => {
        if (!rel) return;
        const { source, target, type } = rel;

        if (source && !slotIds.has(source)) {
          errors.push({
            type: 'cross-field',
            field: `/relations/${relIdx}/source`,
            message: `Relation source '${source}' cannot be resolved to any defined slot id in this spread.`,
            code: 'ERR_RELATION_SOURCE_UNRESOLVED',
            severity: 'error',
          });
        }

        if (target && !slotIds.has(target)) {
          errors.push({
            type: 'cross-field',
            field: `/relations/${relIdx}/target`,
            message: `Relation target '${target}' cannot be resolved to any defined slot id in this spread.`,
            code: 'ERR_RELATION_TARGET_UNRESOLVED',
            severity: 'error',
          });
        }

        if (source && target && source === target) {
          warnings.push({
            type: 'cross-field',
            field: `/relations/${relIdx}`,
            message: `Self-referential relation on slot '${source}' (type: ${type}). Consider if this is intentional.`,
            code: 'WARN_SELF_RELATION',
            severity: 'warning',
          });
        }
      });
    }

    // 6. Cross-Field: deckContract.minCards >= slots.length
    if (spread.deckContract) {
      checkedRulesCount++;
      const { minCards, maxCards } = spread.deckContract;
      if (typeof minCards === 'number' && minCards < spread.slots.length) {
        errors.push({
          type: 'cross-field',
          field: '/deckContract/minCards',
          message: `deckContract.minCards (${minCards}) cannot be less than the spread's fixed slot count (${spread.slots.length}).`,
          code: 'ERR_MIN_CARDS_LESS_THAN_SLOTS',
          severity: 'error',
        });
      }

      if (typeof minCards === 'number' && typeof maxCards === 'number' && minCards > maxCards) {
        errors.push({
          type: 'cross-field',
          field: '/deckContract/maxCards',
          message: `deckContract.minCards (${minCards}) exceeds deckContract.maxCards (${maxCards}).`,
          code: 'ERR_MIN_CARDS_EXCEEDS_MAX',
          severity: 'error',
        });
      }
    }

    // 7. Cross-Field: readingVariants slotOverrides resolution
    if (Array.isArray(spread.readingVariants)) {
      checkedRulesCount++;
      spread.readingVariants.forEach((v, vIdx) => {
        if (Array.isArray(v?.slotOverrides)) {
          v.slotOverrides.forEach((override, oIdx) => {
            if (override?.slotId && !slotIds.has(override.slotId)) {
              errors.push({
                type: 'cross-field',
                field: `/readingVariants/${vIdx}/slotOverrides/${oIdx}/slotId`,
                message: `Variant '${v.id}' overrides unknown slotId '${override.slotId}'.`,
                code: 'ERR_VARIANT_SLOT_UNRESOLVED',
                severity: 'error',
              });
            }
          });
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    checkedRulesCount,
  };
}

/**
 * Validate a TarotReading record JSON object against Schema + Cross-Field Rules.
 * Optionally validates against an expected TarotSpreadDefinition template if provided.
 */
export function validateReadingRecord(
  data: unknown,
  expectedSpread?: TarotSpreadDefinition
): ValidationReport {
  const errors: ValidationErrorItem[] = [];
  const warnings: ValidationErrorItem[] = [];
  let checkedRulesCount = 0;

  // 1. JSON Schema Draft 2020-12 Validation
  checkedRulesCount++;
  const schemaValid = ajvValidateReading(data);
  if (!schemaValid && ajvValidateReading.errors) {
    for (const err of ajvValidateReading.errors) {
      const formatted = formatValidationError({
        instancePath: err.instancePath || '',
        schemaPath: err.schemaPath || '#',
        keyword: err.keyword,
        message: err.message,
        params: err.params as Record<string, unknown>,
      });

      errors.push({
        type: 'schema',
        field: err.instancePath || '/',
        message: formatted.message,
        code: `ERR_SCHEMA_${err.keyword?.toUpperCase() || 'VALIDATION'}`,
        severity: 'error',
        instancePath: formatted.instancePath,
        schemaPath: formatted.schemaPath,
        keyword: formatted.keyword,
        params: formatted.params,
      });
    }
  }

  if (!data || typeof data !== 'object') {
    return { valid: false, errors, warnings, checkedRulesCount };
  }

  const reading = data as Partial<TarotReading>;

  // JSON-LD Semantic Checks (when @context is present)
  if (reading['@context'] !== undefined) {
    checkedRulesCount++;
    if (!reading['@type']) {
      errors.push({
        type: 'cross-field',
        field: '/@type',
        message: 'When @context is present, @type must also be specified for Schema.org JSON-LD compliance.',
        code: 'ERR_JSONLD_TYPE_REQUIRED',
        severity: 'error',
      });
    }

    if (reading['@type'] === 'Event' || reading['@type'] === 'Action') {
      const dateStr = reading.drawnAt || reading.startDate;
      const isValidDate = typeof dateStr === 'string' && !isNaN(Date.parse(dateStr)) && dateStr.includes('T');
      if (!isValidDate) {
        errors.push({
          type: 'cross-field',
          field: '/drawnAt',
          message: 'Schema.org Event requires drawnAt (or startDate) to be a valid ISO 8601 date-time string.',
          code: 'ERR_EVENT_START_DATE_INVALID',
          severity: 'error',
        });
      }
    }

    if (reading['@context'] === 'https://schema.org') {
      warnings.push({
        type: 'cross-field',
        field: '/@context',
        message: 'Using generic context https://schema.org. The Arcana context https://arcanaschema.org/contexts/tarot.jsonld is preferred for comprehensive property mapping.',
        code: 'WARN_GENERIC_SCHEMA_ORG_CONTEXT',
        severity: 'warning',
      });
    }
  }

  // 2. Card slot uniqueness
  if (Array.isArray(reading.cards)) {
    checkedRulesCount++;
    const assignedSlots = new Set<string>();
    const duplicateSlots = new Set<string>();

    reading.cards.forEach((c) => {
      if (typeof c?.slotId === 'string') {
        if (assignedSlots.has(c.slotId)) {
          duplicateSlots.add(c.slotId);
        }
        assignedSlots.add(c.slotId);
      }
    });

    if (duplicateSlots.size > 0) {
      warnings.push({
        type: 'cross-field',
        field: '/cards',
        message: `Multiple cards drawn into the same slot IDs: [${Array.from(duplicateSlots).join(', ')}]. In standard single-draw spreads, each slot receives one card.`,
        code: 'WARN_DUPLICATE_SLOT_ASSIGNMENT',
        severity: 'warning',
      });
    }

    // 3. Match against Expected Spread template if supplied
    if (expectedSpread) {
      checkedRulesCount++;
      const validSlotIds = new Set(expectedSpread.slots.map((s) => s.id));

      reading.cards.forEach((c, idx) => {
        if (c?.slotId && !validSlotIds.has(c.slotId)) {
          errors.push({
            type: 'cross-field',
            field: `/cards/${idx}/slotId`,
            message: `Card drawn in slot '${c.slotId}', but spread '${expectedSpread.id}' does not have this slot. Valid slots: [${Array.from(validSlotIds).join(', ')}].`,
            code: 'ERR_READING_SLOT_MISMATCH',
            severity: 'error',
          });
        }
      });

      if (reading.cards.length < expectedSpread.slots.length) {
        warnings.push({
          type: 'cross-field',
          field: '/cards',
          message: `Incomplete reading: spread '${expectedSpread.id}' requires ${expectedSpread.slots.length} cards, but reading has ${reading.cards.length}.`,
          code: 'WARN_INCOMPLETE_SPREAD_READING',
          severity: 'warning',
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    checkedRulesCount,
  };
}

/**
 * Validate a complete TarotSpreadCatalog collection.
 */
export function validateCatalogCollection(data: unknown): ValidationReport {
  const errors: ValidationErrorItem[] = [];
  const warnings: ValidationErrorItem[] = [];
  let checkedRulesCount = 0;

  // 1. JSON Schema validation
  checkedRulesCount++;
  const schemaValid = ajvValidateCatalog(data);
  if (!schemaValid && ajvValidateCatalog.errors) {
    for (const err of ajvValidateCatalog.errors) {
      const formatted = formatValidationError({
        instancePath: err.instancePath || '',
        schemaPath: err.schemaPath || '#',
        keyword: err.keyword,
        message: err.message,
        params: err.params as Record<string, unknown>,
      });

      errors.push({
        type: 'schema',
        field: err.instancePath || '/',
        message: formatted.message,
        code: `ERR_SCHEMA_${err.keyword?.toUpperCase() || 'VALIDATION'}`,
        severity: 'error',
        instancePath: formatted.instancePath,
        schemaPath: formatted.schemaPath,
        keyword: formatted.keyword,
        params: formatted.params,
      });
    }
  }

  if (!data || typeof data !== 'object') {
    return { valid: false, errors, warnings, checkedRulesCount };
  }

  const catalog = data as Partial<TarotSpreadCatalog>;

  // 2. Unique Spread IDs across catalog
  if (Array.isArray(catalog.spreads)) {
    checkedRulesCount++;
    const spreadIds = new Set<string>();
    const duplicateIds = new Set<string>();

    catalog.spreads.forEach((spread, idx) => {
      if (spread?.id) {
        if (spreadIds.has(spread.id)) {
          duplicateIds.add(spread.id);
        }
        spreadIds.add(spread.id);
      }

      // Validate each spread definition internally
      const report = validateSpreadDefinition(spread);
      report.errors.forEach((err) => {
        errors.push({
          ...err,
          field: `/spreads/${idx}${err.field}`,
        });
      });
      report.warnings.forEach((warn) => {
        warnings.push({
          ...warn,
          field: `/spreads/${idx}${warn.field}`,
        });
      });
      checkedRulesCount += report.checkedRulesCount;
    });

    if (duplicateIds.size > 0) {
      errors.push({
        type: 'cross-field',
        field: '/spreads',
        message: `Duplicate spread IDs in catalog: [${Array.from(duplicateIds).join(', ')}]. Spread IDs must be globally unique across catalog.`,
        code: 'ERR_DUPLICATE_CATALOG_SPREAD_ID',
        severity: 'error',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    checkedRulesCount,
  };
}
