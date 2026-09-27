/**
 * Arcana Schema - Meta-Validation Test Suite
 * Validates every schema and definition file in schemas/ against its declared JSON Schema dialect.
 * Ensures strict dialect compliance (Draft 2020-12 and Draft-7).
 */

import fs from 'fs';
import path from 'path';
import Ajv2020 from 'ajv/dist/2020.js';
import AjvDraft07 from 'ajv';
import addFormats from 'ajv-formats';

const Ajv2020Constructor = (Ajv2020 as any).default || Ajv2020;
const AjvDraft07Constructor = (AjvDraft07 as any).default || AjvDraft07;

const ajv2020 = new (Ajv2020Constructor as new (opts?: any) => any)({
  allErrors: true,
  strict: false,
});
(addFormats as any)(ajv2020);

const ajvDraft07 = new (AjvDraft07Constructor as new (opts?: any) => any)({
  allErrors: true,
  strict: false,
});
(addFormats as any)(ajvDraft07);

let passed = 0;
let failed = 0;

function assert(condition: boolean, desc: string) {
  if (condition) {
    console.log(`  ✓ ${desc}`);
    passed++;
  } else {
    console.error(`  ✗ FAILED: ${desc}`);
    failed++;
  }
}

function findSchemaFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findSchemaFiles(fullPath, fileList);
    } else if (entry.name.endsWith('.json')) {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

async function runMetaValidationTests() {
  console.log('\n--- Running Schema Meta-Validation Test Suite (Ticket #6) ---\n');

  const schemasDir = path.resolve('./schemas');
  const allSchemaFiles = findSchemaFiles(schemasDir);

  assert(allSchemaFiles.length >= 8, `Discovered ${allSchemaFiles.length} schema files across schemas/`);

  for (const filePath of allSchemaFiles) {
    const relPath = path.relative('.', filePath);
    const content = fs.readFileSync(filePath, 'utf8');

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      assert(false, `${relPath} is valid JSON`);
      continue;
    }

    const schemaDialect = parsed.$schema || '';

    if (schemaDialect.includes('draft-07')) {
      try {
        const isValid = ajvDraft07.validateSchema(parsed);
        assert(isValid, `${relPath} conforms to JSON Schema Draft-7 meta-schema`);
        if (!isValid && ajvDraft07.errors) {
          console.error('Meta-schema errors:', ajvDraft07.errors);
        }
      } catch (err: any) {
        assert(false, `${relPath} compiled with Draft-7: ${err.message}`);
      }
    } else {
      // Default to Draft 2020-12
      try {
        const isValid = ajv2020.validateSchema(parsed);
        assert(isValid, `${relPath} conforms to JSON Schema Draft 2020-12 meta-schema`);
        if (!isValid && ajv2020.errors) {
          console.error('Meta-schema errors:', ajv2020.errors);
        }
      } catch (err: any) {
        assert(false, `${relPath} compiled with Draft 2020-12: ${err.message}`);
      }
    }
  }

  console.log(`\nMeta-Validation Tests Summary: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runMetaValidationTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
