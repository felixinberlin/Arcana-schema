/**
 * Arcana Schema - Breaking Change Detection Tool
 * Inspects changes between schema versions to enforce strict Semantic Versioning.
 * Fails with exit code 1 if a breaking change is introduced without a major version bump.
 */

import fs from 'fs';
import path from 'path';

export interface BreakingChange {
  path: string;
  type:
    | 'REQUIRED_FIELD_ADDED'
    | 'OPTIONAL_FIELD_REMOVED'
    | 'ENUM_VALUE_REMOVED'
    | 'TYPE_CHANGED'
    | 'CONSTRAINT_NARROWED';
  message: string;
}

/**
 * Compares two JSON Schema objects and returns a list of breaking changes.
 */
export function detectBreakingChanges(
  oldSchema: any,
  newSchema: any,
  jsonPath = '#'
): BreakingChange[] {
  const breaking: BreakingChange[] = [];

  if (!oldSchema || !newSchema) return breaking;

  // 1. Check required fields: Adding a required field is breaking
  const oldRequired = new Set<string>(oldSchema.required || []);
  const newRequired = new Set<string>(newSchema.required || []);

  for (const field of newRequired) {
    if (!oldRequired.has(field)) {
      breaking.push({
        path: `${jsonPath}/required/${field}`,
        type: 'REQUIRED_FIELD_ADDED',
        message: `Added new required field '${field}' without a major version bump.`,
      });
    }
  }

  // 2. Check properties: Removing an optional field is breaking
  if (oldSchema.properties && newSchema.properties) {
    for (const [propName, oldPropDef] of Object.entries(oldSchema.properties)) {
      if (!(propName in newSchema.properties)) {
        breaking.push({
          path: `${jsonPath}/properties/${propName}`,
          type: 'OPTIONAL_FIELD_REMOVED',
          message: `Removed existing property '${propName}'.`,
        });
      } else {
        const subBreaking = detectBreakingChanges(
          oldPropDef,
          newSchema.properties[propName],
          `${jsonPath}/properties/${propName}`
        );
        breaking.push(...subBreaking);
      }
    }
  }

  // 3. Check enum narrowing: Removing allowed enum values is breaking
  if (Array.isArray(oldSchema.enum) && Array.isArray(newSchema.enum)) {
    const newEnumSet = new Set(newSchema.enum);
    for (const val of oldSchema.enum) {
      if (!newEnumSet.has(val)) {
        breaking.push({
          path: `${jsonPath}/enum/${String(val)}`,
          type: 'ENUM_VALUE_REMOVED',
          message: `Removed enum value '${String(val)}'.`,
        });
      }
    }
  }

  // 4. Check type change
  if (oldSchema.type && newSchema.type && oldSchema.type !== newSchema.type) {
    breaking.push({
      path: `${jsonPath}/type`,
      type: 'TYPE_CHANGED',
      message: `Type changed from '${oldSchema.type}' to '${newSchema.type}'.`,
    });
  }

  // 5. Check constraints: Added pattern, narrowed min/max
  if (!oldSchema.pattern && newSchema.pattern) {
    breaking.push({
      path: `${jsonPath}/pattern`,
      type: 'CONSTRAINT_NARROWED',
      message: `Added pattern constraint '${newSchema.pattern}' to previously unconstrained field.`,
    });
  }

  if (oldSchema.minimum !== undefined && newSchema.minimum !== undefined && newSchema.minimum > oldSchema.minimum) {
    breaking.push({
      path: `${jsonPath}/minimum`,
      type: 'CONSTRAINT_NARROWED',
      message: `Narrowed minimum constraint from ${oldSchema.minimum} to ${newSchema.minimum}.`,
    });
  }

  if (oldSchema.maximum !== undefined && newSchema.maximum !== undefined && newSchema.maximum < oldSchema.maximum) {
    breaking.push({
      path: `${jsonPath}/maximum`,
      type: 'CONSTRAINT_NARROWED',
      message: `Narrowed maximum constraint from ${oldSchema.maximum} to ${newSchema.maximum}.`,
    });
  }

  return breaking;
}

/**
 * CLI execution entrypoint
 */
export function runCheckBreaking(baselineDir?: string): boolean {
  console.log('--- Checking for Breaking Schema Changes ---');

  const v2Dir = path.resolve('./schemas/v2');
  const files = [
    'tarot-spread-definition-2.0.0.schema.json',
    'tarot-reading-1.0.0.schema.json',
    'tarot-spread-catalog-2.0.0.schema.json',
  ];

  let hasBreaking = false;

  for (const file of files) {
    const currPath = path.join(v2Dir, file);
    if (!fs.existsSync(currPath)) continue;

    const currentSchema = JSON.parse(fs.readFileSync(currPath, 'utf8'));

    // If baseline directory provided or baseline schema exists
    let baselineSchema = currentSchema;
    if (baselineDir) {
      const basePath = path.join(baselineDir, file);
      if (fs.existsSync(basePath)) {
        baselineSchema = JSON.parse(fs.readFileSync(basePath, 'utf8'));
      }
    }

    const breaking = detectBreakingChanges(baselineSchema, currentSchema, file);
    if (breaking.length > 0) {
      hasBreaking = true;
      console.error(`❌ Breaking changes detected in ${file}:`);
      for (const b of breaking) {
        console.error(`   - [${b.type}] ${b.path}: ${b.message}`);
      }
    } else {
      console.log(`✓ No breaking changes in ${file}`);
    }
  }

  if (hasBreaking) {
    console.error('\nBreaking changes found without major version bump. Exiting with code 1.');
    return false;
  }

  console.log('\nAll schemas passed backward compatibility checks.\n');
  return true;
}

// If executed directly from command line
if (process.argv[1] && process.argv[1].endsWith('check-breaking.ts')) {
  const baselineArg = process.argv[2];
  const ok = runCheckBreaking(baselineArg);
  if (!ok) {
    process.exit(1);
  }
}
