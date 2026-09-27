import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  Download,
  FolderGit2,
  CheckCircle2,
  Terminal,
  ExternalLink,
  Shield,
  FileCode,
  Copy,
  Check,
} from 'lucide-react';
import {
  spreadDefinitionSchema,
  readingSchema,
  catalogSchema,
  layoutDefsSchema,
  deckContractDefsSchema,
  filterDefsSchema,
  relationDefsSchema,
  slotDefsSchema,
} from '../schema/rawSchemas.ts';
import {
  SINGLE_CARD_SPREAD,
  PAST_PRESENT_FUTURE_SPREAD,
  DECISION_SPREAD,
  RELATIONSHIP_SPREAD,
  HORSESHOE_SPREAD,
  CELTIC_CROSS_SPREAD,
  TREE_OF_LIFE_SPREAD,
  CANONICAL_CATALOG,
} from '../schema/catalogData.ts';

export const GitHubExporter: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const generateZipAndDownload = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();

      // Schemas v2
      const schemasFolder = zip.folder('schemas/v2')!;
      schemasFolder.file(
        'tarot-spread-definition-2.0.0.schema.json',
        JSON.stringify(spreadDefinitionSchema, null, 2)
      );
      schemasFolder.file(
        'tarot-reading-1.0.0.schema.json',
        JSON.stringify(readingSchema, null, 2)
      );
      schemasFolder.file(
        'tarot-spread-catalog-2.0.0.schema.json',
        JSON.stringify(catalogSchema, null, 2)
      );

      // Shared Defs
      const sharedFolder = zip.folder('schemas/v2/_shared')!;
      sharedFolder.file('layout.defs.json', JSON.stringify(layoutDefsSchema, null, 2));
      sharedFolder.file('deck-contract.defs.json', JSON.stringify(deckContractDefsSchema, null, 2));
      sharedFolder.file('filter.defs.json', JSON.stringify(filterDefsSchema, null, 2));
      sharedFolder.file('relation.defs.json', JSON.stringify(relationDefsSchema, null, 2));
      sharedFolder.file('slot.defs.json', JSON.stringify(slotDefsSchema, null, 2));

      // Schemas latest
      const latestFolder = zip.folder('schemas/latest')!;
      latestFolder.file('spread-definition.schema.json', JSON.stringify({
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        $ref: 'https://raw.githubusercontent.com/arcana-schema/schemas/main/schemas/v2/tarot-spread-definition-2.0.0.schema.json'
      }, null, 2));
      latestFolder.file('reading.schema.json', JSON.stringify({
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        $ref: 'https://raw.githubusercontent.com/arcana-schema/schemas/main/schemas/v2/tarot-reading-1.0.0.schema.json'
      }, null, 2));
      latestFolder.file('catalog.schema.json', JSON.stringify({
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        $ref: 'https://raw.githubusercontent.com/arcana-schema/schemas/main/schemas/v2/tarot-spread-catalog-2.0.0.schema.json'
      }, null, 2));

      // JSON-LD Semantic Context
      const contextFolder = zip.folder('contexts')!;
      contextFolder.file(
        'tarot.jsonld',
        JSON.stringify(
          {
            '@context': {
              '@version': 1.1,
              '@vocab': 'https://schema.org/',
              schema: 'https://schema.org/',
              arcana: 'https://arcanaschema.org/terms/',
              id: '@id',
              type: '@type',
              name: 'schema:name',
              description: 'schema:description',
              summary: 'schema:abstract',
              author: 'schema:author',
              license: 'schema:license',
              tags: 'schema:keywords',
              slots: { '@id': 'schema:hasDefinedTerm', '@container': '@set' },
              hasDefinedTerm: { '@id': 'schema:hasDefinedTerm', '@container': '@set' },
              role: 'schema:name',
              order: 'schema:position',
              keywords: 'schema:keywords',
              meaning: 'schema:description',
              relations: { '@id': 'schema:additionalProperty', '@container': '@set' },
              deckContract: { '@id': 'schema:additionalProperty' },
              readingVariants: { '@id': 'schema:sameAs', '@container': '@set' },
              drawnAt: { '@id': 'schema:startDate', '@type': 'schema:DateTime' },
              startDate: { '@id': 'schema:startDate', '@type': 'schema:DateTime' },
              question: 'schema:about',
              querent: { '@id': 'schema:attendee' },
              reader: { '@id': 'schema:performer' },
              deck: { '@id': 'schema:instrument' },
              cards: { '@id': 'schema:object', '@container': '@set' },
              interpretation: { '@id': 'schema:result' },
              notes: 'schema:disambiguatingDescription',
            },
          },
          null,
          2
        )
      );

      // Catalog
      const catalogFolder = zip.folder('catalog')!;
      catalogFolder.file('single-card.json', JSON.stringify(SINGLE_CARD_SPREAD, null, 2));
      catalogFolder.file(
        'past-present-future.json',
        JSON.stringify(PAST_PRESENT_FUTURE_SPREAD, null, 2)
      );
      catalogFolder.file('decision.json', JSON.stringify(DECISION_SPREAD, null, 2));
      catalogFolder.file('relationship.json', JSON.stringify(RELATIONSHIP_SPREAD, null, 2));
      catalogFolder.file('horseshoe.json', JSON.stringify(HORSESHOE_SPREAD, null, 2));
      catalogFolder.file('celtic-cross.json', JSON.stringify(CELTIC_CROSS_SPREAD, null, 2));
      catalogFolder.file('tree-of-life.json', JSON.stringify(TREE_OF_LIFE_SPREAD, null, 2));
      catalogFolder.file('index.json', JSON.stringify(CANONICAL_CATALOG, null, 2));

      // Examples
      const validFolder = zip.folder('examples/valid')!;
      validFolder.file(
        'past-present-future.spread.json',
        JSON.stringify(PAST_PRESENT_FUTURE_SPREAD, null, 2)
      );
      validFolder.file(
        'celtic-cross.spread.json',
        JSON.stringify(CELTIC_CROSS_SPREAD, null, 2)
      );
      validFolder.file(
        'past-present-future.jsonld',
        JSON.stringify(
          {
            '@context': 'https://arcanaschema.org/contexts/tarot.jsonld',
            '@type': 'DefinedTermSet',
            ...PAST_PRESENT_FUTURE_SPREAD,
          },
          null,
          2
        )
      );

      // Rendered Examples
      const renderedFolder = zip.folder('examples/rendered')!;
      renderedFolder.file(
        'past-present-future.spread.md',
        `# Past, Present, Future\n\nDifficulty: beginner | Layout: linear | Slots: 3 | Min Deck: 3 cards\n\nThe classic three-card linear progression mapping temporal development and trajectory.\n\n## Positions\n\n1. **Past Foundations**\n2. **Present Reality**\n3. **Likely Future Outcome**\n\n## Card Relationships\n\n- The Past Foundations leads to the Present Reality.\n- The Present Reality leads to the Likely Future Outcome.\n`
      );
      renderedFolder.file(
        'past-present-future.spread.txt',
        `Past, Present, Future\n=====================\n\nDifficulty: beginner | Layout: linear | Slots: 3 | Min Deck: 3 cards\n\nThe classic three-card linear progression mapping temporal development and trajectory.\n\nPositions\n---------\n\n1. Past Foundations\n2. Present Reality\n3. Likely Future Outcome\n\nCard Relationships\n------------------\n\n* The Past Foundations leads to the Present Reality.\n* The Present Reality leads to the Likely Future Outcome.\n`
      );
      renderedFolder.file(
        'reading-sample.md',
        `# Past, Present, Future\n\nDrawn: Sep 26, 2026, 12:00 PM UTC | Deck: Smith-Waite Centennial Tarot Deck\n\nQuestion: "How should I navigate open source specification development?"\n\n## Cards Drawn\n\n- **Past Foundations:** I. The Magician (Upright)\n- **Present Reality:** Eight of Swords (Reversed)\n- **Likely Future Outcome:** Three of Wands (Upright)\n\n## Interpretation\n\nMastery of tools frees the querent from hesitation, establishing wide open-source adoption.\n`
      );
      renderedFolder.file(
        'reading-sample.txt',
        `Past, Present, Future\n=====================\n\nDrawn: Sep 26, 2026, 12:00 PM UTC | Deck: Smith-Waite Centennial Tarot Deck\n\nQuestion: "How should I navigate open source specification development?"\n\nCards Drawn\n-----------\n\n* Past Foundations: I. The Magician (Upright)\n* Present Reality: Eight of Swords (Reversed)\n* Likely Future Outcome: Three of Wands (Upright)\n\nInterpretation\n--------------\n\nMastery of tools frees the querent from hesitation, establishing wide open-source adoption.\n`
      );

      const invalidFolder = zip.folder('examples/invalid')!;
      invalidFolder.file(
        'duplicate-slot-id.spread.json',
        JSON.stringify(
          {
            schemaVersion: '2.0.0',
            id: 'invalid-duplicate-slot-id',
            name: 'Invalid Duplicate Slot ID',
            deckContract: { minCards: 3 },
            slots: [
              { id: 'alpha', order: 1, role: 'One', layout: { x: 0.2, y: 0.5 } },
              { id: 'alpha', order: 2, role: 'Two (Dup)', layout: { x: 0.5, y: 0.5 } },
              { id: 'beta', order: 3, role: 'Three', layout: { x: 0.8, y: 0.5 } },
            ],
            relations: [],
          },
          null,
          2
        )
      );
      invalidFolder.file(
        'broken-relation.spread.json',
        JSON.stringify(
          {
            schemaVersion: '2.0.0',
            id: 'invalid-broken-relation',
            name: 'Invalid Broken Relation Target',
            deckContract: { minCards: 2 },
            slots: [
              { id: 'past', order: 1, role: 'Past', layout: { x: 0.3, y: 0.5 } },
              { id: 'present', order: 2, role: 'Present', layout: { x: 0.7, y: 0.5 } },
            ],
            relations: [{ source: 'past', target: 'ghost-slot-does-not-exist', type: 'leads_to' }],
          },
          null,
          2
        )
      );

      // Package.json for npm distribution
      zip.file(
        'package.json',
        JSON.stringify(
          {
            name: '@arcana-schema/validator',
            version: '2.0.0',
            description:
              'Official JSON Schema standard and cross-field validator for tarot spreads and readings.',
            main: 'dist/index.js',
            types: 'dist/types.d.ts',
            scripts: {
              test: 'tsx tests/validate.test.ts',
              build: 'tsc',
            },
            keywords: ['tarot', 'tarot-spread', 'json-schema', 'arcana', 'divination'],
            author: 'Arcana Schema Contributors',
            license: 'MIT',
            dependencies: {
              ajv: '^8.20.0',
              'ajv-formats': '^3.0.1',
            },
          },
          null,
          2
        )
      );

      // Documentation & Github Files
      zip.file(
        '.github/workflows/ci.yml',
        `name: CI - Arcana Schema Validation
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
`
      );

      zip.file(
        '.github/workflows/deploy-pages.yml',
        `name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: |
          cp -r schemas dist/
          cp -r catalog dist/
          cp -r contexts dist/
          touch dist/.nojekyll
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - id: deployment
        uses: actions/deploy-pages@v4
`
      );

      zip.file(
        'README.md',
        `# Arcana Schema (Tarot Open Source JSON Specification)

Official repository for Arcana Schema: the open-source JSON Schema standard for tarot spread definitions, reading records, catalog manifests, and cross-field validation.

## Schemas
- \`schemas/v2/tarot-spread-definition.schema.json\` (v2.0.0)
- \`schemas/v2/tarot-reading.schema.json\` (v1.0.0)
- \`schemas/v2/tarot-spread-catalog.schema.json\` (v2.0.0)

## Quick Start
\`\`\`bash
npm install @arcana-schema/validator
\`\`\`
`
      );

      zip.file(
        'LICENSE',
        `MIT License
Copyright (c) 2026 Arcana Schema Contributors
`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'arcana-schema-github-repo.zip';
      a.click();
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (e) {
      console.error('Failed to generate zip', e);
    } finally {
      setDownloading(false);
    }
  };

  const gitCliSteps = `# 1. Extract the downloaded repo archive
unzip arcana-schema-github-repo.zip -d arcana-schema
cd arcana-schema

# 2. Initialize git & commit
git init -b main
git add .
git commit -m "feat: initial release of Arcana Schema v2.0.0 specifications, catalog, and validator"

# 3. Create GitHub repo and push
# (Replace with your actual GitHub username or organization)
gh repo create arcana-schema/tarot-schema --public --source=. --remote=origin --push

# 4. Run test suite to verify CI parity
npm install
npm test`;

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(gitCliSteps);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-purple-950/40 border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <FolderGit2 className="w-4 h-4" />
            GitHub Ready Monorepo Bundle
          </div>
          <h2 className="text-2xl font-bold text-slate-100">
            Export Complete Specification for GitHub Publication
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Download the ready-to-push repository package containing all 3 JSON schemas, the 7 canonical catalog spreads, test suites, GitHub Actions CI workflow, dual licenses (MIT + CC-BY-4.0), and npm configuration.
          </p>
        </div>

        <button
          onClick={generateZipAndDownload}
          disabled={downloading}
          className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center gap-2.5 transition-all shadow-lg hover:shadow-indigo-500/25 shrink-0 disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          {downloading ? 'Packing Archive...' : 'Download Repository (.zip)'}
        </button>
      </div>

      {downloadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Successfully packed and downloaded <code>arcana-schema-github-repo.zip</code>! You are ready to push to GitHub.
        </div>
      )}

      {/* Publishing Step-by-Step Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 flex flex-col gap-4">
          <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            GitHub Publishing Checklist
          </h4>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <strong className="text-slate-200 block mb-0.5">Repository Creation</strong>
                <p className="text-slate-400">
                  Create a public repository named <code>tarot-schema</code> or <code>arcana-schema</code> on GitHub under your personal account or organization.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <strong className="text-slate-200 block mb-0.5">Automated CI Actions</strong>
                <p className="text-slate-400">
                  The bundle includes <code>.github/workflows/ci.yml</code> which automatically validates every PR and ensures schema integrity and test suite passage.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <strong className="text-slate-200 block mb-0.5">npm & PyPI Distribution</strong>
                <p className="text-slate-400">
                  Publish <code>@arcana-schema/validator</code> on npm and <code>arcana-schema</code> on PyPI so developers in TypeScript and Python can consume it directly.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center shrink-0">
                4
              </span>
              <div>
                <strong className="text-slate-200 block mb-0.5">SchemaStore Submission</strong>
                <p className="text-slate-400">
                  Submit a PR to SchemaStore (<code>schemastore/schemastore</code>) matching file pattern <code>*.spread.json</code> to enable instant autocompletion in VS Code and JetBrains IDEs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Command Line Terminal */}
        <div className="lg:col-span-6 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-medium flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              Terminal Quickstart Command
            </span>
            <button
              onClick={handleCopyCmd}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono"
            >
              {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedCmd ? 'Copied' : 'Copy Commands'}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto shadow-inner">
            <pre>{gitCliSteps}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
