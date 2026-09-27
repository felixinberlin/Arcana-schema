import React, { useState, useEffect } from 'react';
import {
  validateSpreadDefinition,
  validateReadingRecord,
} from '../schema/validator.ts';
import type { ValidationReport } from '../schema/types.ts';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Copy,
  Download,
  FileCheck,
  Code2,
  ShieldCheck,
} from 'lucide-react';
import {
  PAST_PRESENT_FUTURE_SPREAD,
  CELTIC_CROSS_SPREAD,
  DECISION_SPREAD,
} from '../schema/catalogData.ts';

const FIXTURES = {
  'valid-past-present-future': {
    name: 'Valid: Past, Present, Future (3 slots)',
    category: 'valid',
    type: 'spread',
    json: JSON.stringify(PAST_PRESENT_FUTURE_SPREAD, null, 2),
  },
  'valid-celtic-cross': {
    name: 'Valid: Celtic Cross (10 slots, cross layout)',
    category: 'valid',
    type: 'spread',
    json: JSON.stringify(CELTIC_CROSS_SPREAD, null, 2),
  },
  'valid-decision': {
    name: 'Valid: Two-Path Decision (5 slots, triangular)',
    category: 'valid',
    type: 'spread',
    json: JSON.stringify(DECISION_SPREAD, null, 2),
  },
  'valid-jsonld-spread': {
    name: 'Valid: Past, Present, Future (JSON-LD DefinedTermSet)',
    category: 'valid',
    type: 'spread',
    json: JSON.stringify(
      {
        '@context': 'https://arcanaschema.org/contexts/tarot.jsonld',
        '@type': 'DefinedTermSet',
        ...PAST_PRESENT_FUTURE_SPREAD,
      },
      null,
      2
    ),
  },
  'valid-jsonld-reading': {
    name: 'Valid: Reading Record (JSON-LD Event)',
    category: 'valid',
    type: 'reading',
    json: JSON.stringify(
      {
        '@context': 'https://arcanaschema.org/contexts/tarot.jsonld',
        '@type': 'Event',
        schemaVersion: '1.0.0',
        readingId: '7d9c6b84-48f5-442a-9e12-b9e315538e82',
        spreadId: 'past-present-future',
        drawnAt: '2026-09-26T12:00:00Z',
        startDate: '2026-09-26T12:00:00Z',
        question: 'Career evolution inquiry',
        cards: [
          { slotId: 'past', cardId: 'major-01-the-magician', orientation: 'upright' },
          { slotId: 'present', cardId: 'swords-08', orientation: 'reversed' },
          { slotId: 'future', cardId: 'wands-03', orientation: 'upright' },
        ],
      },
      null,
      2
    ),
  },
  'invalid-jsonld-missing-type': {
    name: 'Invalid: @context without @type (ERR_JSONLD_TYPE_REQUIRED)',
    category: 'invalid',
    type: 'spread',
    json: JSON.stringify(
      {
        '@context': 'https://arcanaschema.org/contexts/tarot.jsonld',
        schemaVersion: '2.0.0',
        id: 'past-present-future',
        name: 'Past, Present, Future',
        deckContract: { minCards: 3 },
        slots: [
          { id: 'past', order: 1, role: 'Past', layout: { x: 0.2, y: 0.5 } },
          { id: 'present', order: 2, role: 'Present', layout: { x: 0.5, y: 0.5 } },
          { id: 'future', order: 3, role: 'Future', layout: { x: 0.8, y: 0.5 } },
        ],
        relations: [],
      },
      null,
      2
    ),
  },
  'invalid-duplicate-slot': {
    name: 'Invalid: Duplicate Slot ID',
    category: 'invalid',
    type: 'spread',
    json: JSON.stringify(
      {
        schemaVersion: '2.0.0',
        id: 'invalid-duplicate-slot-id',
        name: 'Invalid Duplicate Slot',
        layoutType: 'linear',
        difficulty: 'beginner',
        deckContract: { minCards: 3 },
        slots: [
          { id: 'card-alpha', order: 1, role: 'First Card', layout: { x: 0.2, y: 0.5 } },
          { id: 'card-alpha', order: 2, role: 'Second Card (Duplicate ID)', layout: { x: 0.5, y: 0.5 } },
          { id: 'card-beta', order: 3, role: 'Third Card', layout: { x: 0.8, y: 0.5 } },
        ],
        relations: [{ source: 'card-alpha', target: 'card-beta', type: 'leads_to' }],
      },
      null,
      2
    ),
  },
  'invalid-broken-relation': {
    name: 'Invalid: Broken Relation Target',
    category: 'invalid',
    type: 'spread',
    json: JSON.stringify(
      {
        schemaVersion: '2.0.0',
        id: 'invalid-broken-relation',
        name: 'Invalid Broken Relation Target',
        layoutType: 'linear',
        difficulty: 'beginner',
        deckContract: { minCards: 2 },
        slots: [
          { id: 'past', order: 1, role: 'Past', layout: { x: 0.3, y: 0.5 } },
          { id: 'present', order: 2, role: 'Present', layout: { x: 0.7, y: 0.5 } },
        ],
        relations: [
          { source: 'past', target: 'ghost-slot-does-not-exist', type: 'leads_to' },
        ],
      },
      null,
      2
    ),
  },
  'invalid-order-gap': {
    name: 'Invalid: Slot Order Gap (1, 2, 4)',
    category: 'invalid',
    type: 'spread',
    json: JSON.stringify(
      {
        schemaVersion: '2.0.0',
        id: 'invalid-order-gap',
        name: 'Invalid Slot Order Gap',
        layoutType: 'linear',
        difficulty: 'beginner',
        deckContract: { minCards: 3 },
        slots: [
          { id: 'card-1', order: 1, role: 'Card 1', layout: { x: 0.2, y: 0.5 } },
          { id: 'card-2', order: 2, role: 'Card 2', layout: { x: 0.5, y: 0.5 } },
          { id: 'card-3', order: 4, role: 'Card 3 (Order is 4 instead of 3)', layout: { x: 0.8, y: 0.5 } },
        ],
        relations: [],
      },
      null,
      2
    ),
  },
  'invalid-mincards': {
    name: 'Invalid: minCards Less Than Slots',
    category: 'invalid',
    type: 'spread',
    json: JSON.stringify(
      {
        schemaVersion: '2.0.0',
        id: 'invalid-mincards-too-small',
        name: 'Invalid minCards Too Small',
        layoutType: 'linear',
        difficulty: 'beginner',
        deckContract: { minCards: 2 },
        slots: [
          { id: 'card-1', order: 1, role: 'One', layout: { x: 0.2, y: 0.5 } },
          { id: 'card-2', order: 2, role: 'Two', layout: { x: 0.5, y: 0.5 } },
          { id: 'card-3', order: 3, role: 'Three', layout: { x: 0.8, y: 0.5 } },
        ],
        relations: [],
      },
      null,
      2
    ),
  },
  'valid-sample-reading': {
    name: 'Valid: Reading Record Sample (v1.0.0)',
    category: 'valid',
    type: 'reading',
    json: JSON.stringify(
      {
        schemaVersion: '1.0.0',
        readingId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        spreadId: 'past-present-future',
        question: 'Career transition and creative path',
        drawnAt: '2026-09-26T12:00:00Z',
        deck: {
          name: 'Smith-Waite Centennial Tarot Deck',
          reversals: true,
        },
        cards: [
          {
            slotId: 'past',
            cardId: 'major-01-the-magician',
            orientation: 'upright',
            notes: 'Prepared skills and raw tools ready.',
          },
          {
            slotId: 'present',
            cardId: 'swords-08',
            orientation: 'reversed',
            notes: 'Releasing cognitive impasse.',
          },
          {
            slotId: 'future',
            cardId: 'wands-03',
            orientation: 'upright',
            notes: 'Expansion across the horizon.',
          },
        ],
        interpretation: {
          summary: 'Mastery in foundations dissolves hesitation.',
        },
      },
      null,
      2
    ),
  },
};

export const LiveValidator: React.FC = () => {
  const [selectedFixtureKey, setSelectedFixtureKey] = useState<string>('valid-past-present-future');
  const [targetType, setTargetType] = useState<'spread' | 'reading'>('spread');
  const [jsonText, setJsonText] = useState<string>(FIXTURES['valid-past-present-future'].json);
  const [syntaxError, setSyntaxError] = useState<string | null>(null);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [copied, setCopied] = useState(false);

  // Validate whenever jsonText or targetType changes
  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonText);
      setSyntaxError(null);

      if (targetType === 'spread') {
        const res = validateSpreadDefinition(parsed);
        setReport(res);
      } else {
        const res = validateReadingRecord(parsed);
        setReport(res);
      }
    } catch (e: unknown) {
      setSyntaxError(e instanceof Error ? e.message : 'Invalid JSON format');
      setReport(null);
    }
  }, [jsonText, targetType]);

  const handleSelectFixture = (key: string) => {
    setSelectedFixtureKey(key);
    const fixture = FIXTURES[key as keyof typeof FIXTURES];
    if (fixture) {
      setTargetType(fixture.type as 'spread' | 'reading');
      setJsonText(fixture.json);
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
    } catch {
      // ignore
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = targetType === 'spread' ? 'tarot-spread.json' : 'tarot-reading.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Target Schema:
          </label>
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setTargetType('spread')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                targetType === 'spread'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Spread Definition (v2.0.0)
            </button>
            <button
              onClick={() => setTargetType('reading')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                targetType === 'reading'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Reading Record (v1.0.0)
            </button>
          </div>

          <span className="text-slate-700">|</span>

          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Load Preset Fixture:
          </label>
          <select
            value={selectedFixtureKey}
            onChange={(e) => handleSelectFixture(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <optgroup label="✅ Valid Instances (Plain & JSON-LD)">
              <option value="valid-past-present-future">Past, Present, Future (3 cards)</option>
              <option value="valid-jsonld-spread">JSON-LD: Past, Present, Future (DefinedTermSet)</option>
              <option value="valid-celtic-cross">Celtic Cross (10 cards)</option>
              <option value="valid-decision">Two-Path Decision (5 cards)</option>
              <option value="valid-sample-reading">Reading Record Sample (v1.0.0)</option>
              <option value="valid-jsonld-reading">JSON-LD: Reading Record (Event)</option>
            </optgroup>
            <optgroup label="❌ Cross-Field & Semantic Tests">
              <option value="invalid-jsonld-missing-type">JSON-LD @context without @type (ERR_JSONLD_TYPE_REQUIRED)</option>
              <option value="invalid-duplicate-slot">Duplicate Slot ID (ERR_DUPLICATE_SLOT_ID)</option>
              <option value="invalid-broken-relation">Broken Relation Target (ERR_RELATION_TARGET_UNRESOLVED)</option>
              <option value="invalid-order-gap">Slot Order Gap (ERR_SLOT_ORDER_NOT_SEQUENTIAL)</option>
              <option value="invalid-mincards">minCards Too Small (ERR_MIN_CARDS_LESS_THAN_SLOTS)</option>
            </optgroup>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFormatJson}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Format JSON
          </button>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export .json
          </button>
        </div>
      </div>

      {/* Editor & Validator Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* JSON Code Input */}
        <div className="lg:col-span-7 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Code2 className="w-4 h-4 text-indigo-400" />
              Instance JSON Buffer
            </span>
            <span className="font-mono text-[11px] text-slate-500">Draft 2020-12 strict</span>
          </div>

          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl focus-within:border-indigo-500/80 transition-colors">
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={26}
              spellCheck={false}
              className="w-full h-full p-4 font-mono text-xs leading-relaxed text-slate-200 bg-transparent resize-y focus:outline-none selection:bg-indigo-600/40"
            />
          </div>
        </div>

        {/* Live Report & Diagnostics */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="text-xs text-slate-400 px-1 font-medium flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-indigo-400" />
            Validation Results & Diagnostics
          </div>

          {/* Status Header Card */}
          {syntaxError ? (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/80 text-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-300">JSON Parse Syntax Error</h4>
                <p className="text-xs text-red-400 font-mono mt-1 break-all">{syntaxError}</p>
              </div>
            </div>
          ) : report?.valid ? (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-emerald-300 flex items-center gap-2">
                  Conforms to Arcana Schema {targetType === 'spread' ? 'v2.0.0' : 'v1.0.0'}
                </h4>
                <p className="text-xs text-emerald-400/90 mt-1">
                  Passed all {report.checkedRulesCount} schema type assertions and cross-field semantic checks.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-rose-300">
                  Validation Failed ({report?.errors.length} Errors)
                </h4>
                <p className="text-xs text-rose-400/90 mt-1">
                  Encountered structural schema violations or semantic invariant failures.
                </p>
              </div>
            </div>
          )}

          {/* Diagnostic Details List */}
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[500px]">
            {/* Errors */}
            {report?.errors.map((err, i) => (
              <div
                key={`err-${i}`}
                className="p-3.5 rounded-xl bg-slate-900 border border-rose-900/60 flex flex-col gap-1.5 shadow-sm"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 font-mono font-semibold border border-rose-800/60 text-[10px]">
                    {err.code}
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">{err.field}</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">{err.message}</p>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                  Type: {err.type} violation
                </span>
              </div>
            ))}

            {/* Warnings */}
            {report?.warnings.map((warn, i) => (
              <div
                key={`warn-${i}`}
                className="p-3.5 rounded-xl bg-slate-900 border border-amber-900/60 flex flex-col gap-1.5 shadow-sm"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 font-mono font-semibold border border-amber-800/60 text-[10px]">
                    {warn.code}
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">{warn.field}</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">{warn.message}</p>
                <span className="text-[10px] text-amber-500/80 uppercase tracking-wider font-mono">
                  Advisory warning
                </span>
              </div>
            ))}

            {report && report.errors.length === 0 && report.warnings.length === 0 && (
              <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center flex flex-col items-center justify-center">
                <ShieldCheck className="w-10 h-10 text-emerald-400/70 mb-2" />
                <h5 className="text-sm font-semibold text-slate-200">Zero Faults Detected</h5>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  The instance passes all JSON Schema draft 2020-12 checks and relational graph integrity constraints.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
