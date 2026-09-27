import React, { useState } from 'react';
import { CANONICAL_SPREADS } from '../schema/catalogData.ts';
import type { TarotSpreadDefinition, DifficultyLevel, LayoutType } from '../schema/types.ts';
import {
  Compass,
  Layers,
  Sparkles,
  BookOpen,
  Copy,
  ExternalLink,
  Tag,
  Check,
  Search,
} from 'lucide-react';

interface CatalogExplorerProps {
  onSelectSpreadForStudio: (spread: TarotSpreadDefinition) => void;
}

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  easy: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  intermediate: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  advanced: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  expert: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

export const CatalogExplorer: React.FC<CatalogExplorerProps> = ({ onSelectSpreadForStudio }) => {
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedLayout, setSelectedLayout] = useState<string>('all');
  const [selectedSpreadModal, setSelectedSpreadModal] = useState<TarotSpreadDefinition | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredSpreads = CANONICAL_SPREADS.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      (s.tags && s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));
    const matchesDifficulty =
      selectedDifficulty === 'all' || s.difficulty === selectedDifficulty;
    const matchesLayout =
      selectedLayout === 'all' || s.layoutType === selectedLayout;
    return matchesSearch && matchesDifficulty && matchesLayout;
  });

  const handleCopyJson = (spread: TarotSpreadDefinition) => {
    navigator.clipboard.writeText(JSON.stringify(spread, null, 2));
    setCopiedId(spread.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Filter Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search catalog by name, tag, or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium">Difficulty:</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium">Layout:</label>
            <select
              value={selectedLayout}
              onChange={(e) => setSelectedLayout(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Layouts</option>
              <option value="linear">Linear</option>
              <option value="cross">Cross</option>
              <option value="triangular">Triangular</option>
              <option value="symbolic">Symbolic</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>
      </div>

      {/* Spreads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSpreads.map((spread) => (
          <div
            key={spread.id}
            className="group flex flex-col justify-between p-6 rounded-2xl bg-slate-900/70 border border-slate-800/90 hover:border-indigo-500/50 hover:bg-slate-900/90 transition-all duration-200 shadow-xl"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  #{spread.id}
                </span>
                <div className="flex items-center gap-2">
                  {spread.difficulty && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                        DIFFICULTY_COLORS[spread.difficulty] || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {spread.difficulty}
                    </span>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium border border-slate-700">
                    {spread.layoutType}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                {spread.name}
              </h3>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                {spread.summary || 'A standard tarot spread template conforming to Arcana Schema v2.0.0.'}
              </p>

              {/* Spread Metrics */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-xs">
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Slots</span>
                  <span className="font-semibold text-slate-200">{spread.slots.length}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Relations</span>
                  <span className="font-semibold text-slate-200">{spread.relations.length}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Min Cards</span>
                  <span className="font-semibold text-slate-200">{spread.deckContract.minCards}</span>
                </div>
              </div>

              {/* Tags */}
              {spread.tags && spread.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {spread.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800/60 text-slate-400 border border-slate-800 flex items-center gap-1"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80">
              <button
                onClick={() => onSelectSpreadForStudio(spread)}
                className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1.5 transition-colors shadow"
              >
                <Compass className="w-3.5 h-3.5" />
                Inspect in Studio
              </button>
              <button
                onClick={() => setSelectedSpreadModal(spread)}
                className="p-2 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="View Full Spec & Slots"
              >
                <BookOpen className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleCopyJson(spread)}
                className="p-2 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Copy Spread JSON"
              >
                {copiedId === spread.id ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Spread Detail Modal */}
      {selectedSpreadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl max-h-[85vh] rounded-2xl p-6 shadow-2xl flex flex-col gap-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono text-indigo-400">{selectedSpreadModal.id}</span>
                <h3 className="text-xl font-bold text-slate-100">{selectedSpreadModal.name}</h3>
              </div>
              <button
                onClick={() => setSelectedSpreadModal(null)}
                className="text-slate-400 hover:text-slate-200 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2 text-xs">
              {/* Instructions */}
              {selectedSpreadModal.instructions && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-semibold text-slate-200 text-sm">Practitioner Instructions</h4>
                  {selectedSpreadModal.instructions.preparation && (
                    <p className="text-slate-300">
                      <strong className="text-slate-400">Preparation:</strong> {selectedSpreadModal.instructions.preparation}
                    </p>
                  )}
                  {selectedSpreadModal.instructions.shuffle && (
                    <p className="text-slate-300">
                      <strong className="text-slate-400">Shuffle:</strong> {selectedSpreadModal.instructions.shuffle}
                    </p>
                  )}
                  {selectedSpreadModal.instructions.drawing && (
                    <p className="text-slate-300">
                      <strong className="text-slate-400">Drawing:</strong> {selectedSpreadModal.instructions.drawing}
                    </p>
                  )}
                  {selectedSpreadModal.instructions.synthesis && (
                    <p className="text-slate-300">
                      <strong className="text-slate-400">Synthesis:</strong> {selectedSpreadModal.instructions.synthesis}
                    </p>
                  )}
                </div>
              )}

              {/* Slots List */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-200 text-sm">Positions & Slots ({selectedSpreadModal.slots.length})</h4>
                <div className="space-y-2">
                  {selectedSpreadModal.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold flex items-center justify-center shrink-0">
                        {slot.order}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200">{slot.role}</span>
                          <span className="font-mono text-[10px] text-slate-500">#{slot.id}</span>
                        </div>
                        {slot.description && (
                          <p className="text-slate-400 mt-1">{slot.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Relations */}
              {selectedSpreadModal.relations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-200 text-sm">Declared Relational Graph Edges</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedSpreadModal.relations.map((rel, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <span className="text-indigo-400 font-medium">{rel.type.replace('_', ' ')}</span>
                        <span className="font-mono text-slate-400">
                          {rel.source} → {rel.target}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  onSelectSpreadForStudio(selectedSpreadModal);
                  setSelectedSpreadModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors"
              >
                Inspect in Studio Canvas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
