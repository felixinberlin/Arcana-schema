/**
 * Arcana Schema - Tarot Open Source JSON Specification
 * Interactive Web Studio & Specification Documentation
 */

import React, { useState } from 'react';
import {
  Compass,
  FileCheck,
  Sparkles,
  Layers,
  Code2,
} from 'lucide-react';
import { VisualSpreadCanvas } from './components/VisualSpreadCanvas.tsx';
import { LiveValidator } from './components/LiveValidator.tsx';
import { CatalogExplorer } from './components/CatalogExplorer.tsx';
import { ReadingSimulator } from './components/ReadingSimulator.tsx';
import { SchemaReference } from './components/SchemaReference.tsx';
import { CANONICAL_SPREADS, CELTIC_CROSS_SPREAD } from './schema/catalogData.ts';
import type { TarotSpreadDefinition } from './schema/types.ts';

type ActiveTab =
  | 'studio'
  | 'validator'
  | 'catalog'
  | 'reading'
  | 'schema';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('studio');
  const [currentSpread, setCurrentSpread] = useState<TarotSpreadDefinition>(CELTIC_CROSS_SPREAD);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const handleSelectSpreadForStudio = (spread: TarotSpreadDefinition) => {
    setCurrentSpread(spread);
    setSelectedSlotId(null);
    setActiveTab('studio');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-100 tracking-tight">
                  Arcana Schema
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono font-medium">
                  v2.0.0
                </span>
                <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  Draft 2020-12
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Open Source JSON Specification for Tarot Spreads & Readings
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-slate-800/40">
          <button
            onClick={() => setActiveTab('studio')}
            className={`py-3 px-4 text-xs font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'studio'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Visual Spread Studio
          </button>

          <button
            onClick={() => setActiveTab('validator')}
            className={`py-3 px-4 text-xs font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'validator'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            Live Validator
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`py-3 px-4 text-xs font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Canonical Catalog (7 Spreads)
          </button>

          <button
            onClick={() => setActiveTab('reading')}
            className={`py-3 px-4 text-xs font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'reading'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Reading Record Playground
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-4 text-xs font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'schema'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Schema Reference
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'studio' && (
          <div className="space-y-6">
            {/* Spread Switcher in Studio */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Active Spread:
                </label>
                <select
                  value={currentSpread.id}
                  onChange={(e) => {
                    const found = CANONICAL_SPREADS.find((s) => s.id === e.target.value);
                    if (found) {
                      setCurrentSpread(found);
                      setSelectedSlotId(null);
                    }
                  }}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 font-medium"
                >
                  {CANONICAL_SPREADS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.slots.length} slots • {s.layoutType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>Layout: <strong className="text-slate-200">{currentSpread.layoutType}</strong></span>
                <span>•</span>
                <span>Difficulty: <strong className="text-slate-200 capitalize">{currentSpread.difficulty}</strong></span>
                <span>•</span>
                <span>Deck: <strong className="text-slate-200 font-mono">{currentSpread.deckContract.deckType}</strong></span>
              </div>
            </div>

            {/* 2D Spatial Canvas */}
            <VisualSpreadCanvas
              spread={currentSpread}
              selectedSlotId={selectedSlotId}
              onSelectSlot={(slotId) => setSelectedSlotId(slotId)}
            />
          </div>
        )}

        {activeTab === 'validator' && <LiveValidator />}

        {activeTab === 'catalog' && (
          <CatalogExplorer onSelectSpreadForStudio={handleSelectSpreadForStudio} />
        )}

        {activeTab === 'reading' && <ReadingSimulator />}

        {activeTab === 'schema' && <SchemaReference />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Arcana Schema</span>
            <span>—</span>
            <span>Tarot Open Source JSON Specification & Standard</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Dual License: <strong className="text-slate-300">MIT</strong> (code/schema) & <strong className="text-slate-300">CC-BY-4.0</strong> (prose)</span>
            <span>•</span>
            <span className="font-mono text-[11px]">https://arcanaschema.org/schemas/v2/</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
