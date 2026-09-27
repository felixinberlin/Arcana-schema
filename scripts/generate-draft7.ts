/**
 * Arcana Schema - Draft-7 Mirror Generator
 * Translates JSON Schema Draft 2020-12 specifications into Draft-7 compatible schemas
 * for SchemaStore and legacy editor validation environments.
 */

import fs from 'fs';
import path from 'path';

const V2_DIR = path.resolve('./schemas/v2');
const DRAFT7_DIR = path.resolve('./schemas/v2-draft7');
const SHARED_DIR = path.join(V2_DIR, '_shared');

// Load shared definition files
const sharedDefs: Record<string, any> = {
  'layout.defs.json': JSON.parse(fs.readFileSync(path.join(SHARED_DIR, 'layout.defs.json'), 'utf8')),
  'deck-contract.defs.json': JSON.parse(fs.readFileSync(path.join(SHARED_DIR, 'deck-contract.defs.json'), 'utf8')),
  'filter.defs.json': JSON.parse(fs.readFileSync(path.join(SHARED_DIR, 'filter.defs.json'), 'utf8')),
  'relation.defs.json': JSON.parse(fs.readFileSync(path.join(SHARED_DIR, 'relation.defs.json'), 'utf8')),
  'slot.defs.json': JSON.parse(fs.readFileSync(path.join(SHARED_DIR, 'slot.defs.json'), 'utf8')),
};

function transformObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(transformObject);
  }
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    // 1. Convert $schema dialect
    if (key === '$schema' && typeof value === 'string' && value.includes('2020-12')) {
      result['$schema'] = 'http://json-schema.org/draft-07/schema#';
      continue;
    }

    // 2. Convert $defs to definitions
    if (key === '$defs') {
      result['definitions'] = transformObject(value);
      continue;
    }

    // 3. Convert unevaluatedProperties to additionalProperties
    if (key === 'unevaluatedProperties') {
      result['additionalProperties'] = transformObject(value);
      continue;
    }

    // 4. Rewrite $ref references
    if (key === '$ref' && typeof value === 'string') {
      let ref = value;
      // Convert internal $defs to definitions
      if (ref.includes('#/$defs/')) {
        ref = ref.replace('#/$defs/', '#/definitions/');
      } else if (ref.includes('/_shared/layout.defs.json')) {
        ref = '#/definitions/layoutCoordinate';
      } else if (ref.includes('/_shared/deck-contract.defs.json')) {
        ref = '#/definitions/deckContract';
      } else if (ref.includes('/_shared/filter.defs.json')) {
        ref = '#/definitions/cardConstraint';
      } else if (ref.includes('/_shared/relation.defs.json')) {
        ref = '#/definitions/relation';
      } else if (ref.includes('/_shared/slot.defs.json')) {
        ref = '#/definitions/slot';
      }
      result['$ref'] = ref;
      continue;
    }

    result[key] = transformObject(value);
  }

  return result;
}

export function generateDraft7() {
  if (!fs.existsSync(DRAFT7_DIR)) {
    fs.mkdirSync(DRAFT7_DIR, { recursive: true });
  }

  const schemaFiles = [
    'tarot-spread-definition-2.0.0.schema.json',
    'tarot-reading-1.0.0.schema.json',
    'tarot-spread-catalog-2.0.0.schema.json',
  ];

  for (const filename of schemaFiles) {
    const srcPath = path.join(V2_DIR, filename);
    const destPath = path.join(DRAFT7_DIR, filename);

    if (!fs.existsSync(srcPath)) continue;

    const v2Schema = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
    const draft7 = transformObject(v2Schema);

    // Update $id to indicate draft-7 mirror
    if (draft7.$id && typeof draft7.$id === 'string') {
      draft7.$id = draft7.$id.replace('/schemas/v2/', '/schemas/v2-draft7/');
    }

    // Inline referenced shared definitions into definitions dictionary
    draft7.definitions = draft7.definitions || {};

    if (filename.includes('spread-definition') || filename.includes('catalog')) {
      draft7.definitions.layoutCoordinate = transformObject(sharedDefs['layout.defs.json']);
      draft7.definitions.deckContract = transformObject(sharedDefs['deck-contract.defs.json']);
      draft7.definitions.cardConstraint = transformObject(sharedDefs['filter.defs.json']);
      draft7.definitions.relation = transformObject(sharedDefs['relation.defs.json']);
      draft7.definitions.slot = transformObject(sharedDefs['slot.defs.json']);
    }

    fs.writeFileSync(destPath, JSON.stringify(draft7, null, 2) + '\n', 'utf8');
    console.log(`✓ Generated Draft-7 mirror: ${path.relative('.', destPath)}`);
  }
}

// Run if called directly
generateDraft7();
