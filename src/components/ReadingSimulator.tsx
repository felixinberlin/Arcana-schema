import React, { useState, useEffect } from 'react';
import { CANONICAL_SPREADS } from '../schema/catalogData.ts';
import type { TarotSpreadDefinition, TarotReading, DrawnCard, CardOrientation } from '../schema/types.ts';
import { validateReadingRecord } from '../schema/validator.ts';
import { renderReading } from '../render/index.ts';
import {
  Sparkles,
  Shuffle,
  Copy,
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  BookOpen,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  ChevronsRight,
  Eye,
  SlidersHorizontal,
  FileText,
} from 'lucide-react';

const SAMPLE_78_DECK = [
  { id: 'major-00-the-fool', name: '0. The Fool', suit: 'Major' },
  { id: 'major-01-the-magician', name: 'I. The Magician', suit: 'Major' },
  { id: 'major-02-the-high-priestess', name: 'II. The High Priestess', suit: 'Major' },
  { id: 'major-03-the-empress', name: 'III. The Empress', suit: 'Major' },
  { id: 'major-04-the-emperor', name: 'IV. The Emperor', suit: 'Major' },
  { id: 'major-05-the-hierophant', name: 'V. The Hierophant', suit: 'Major' },
  { id: 'major-06-the-lovers', name: 'VI. The Lovers', suit: 'Major' },
  { id: 'major-07-the-chariot', name: 'VII. The Chariot', suit: 'Major' },
  { id: 'major-08-strength', name: 'VIII. Strength', suit: 'Major' },
  { id: 'major-09-the-hermit', name: 'IX. The Hermit', suit: 'Major' },
  { id: 'major-10-wheel-of-fortune', name: 'X. Wheel of Fortune', suit: 'Major' },
  { id: 'major-11-justice', name: 'XI. Justice', suit: 'Major' },
  { id: 'major-12-the-hanged-man', name: 'XII. The Hanged Man', suit: 'Major' },
  { id: 'major-13-death', name: 'XIII. Death', suit: 'Major' },
  { id: 'major-14-temperance', name: 'XIV. Temperance', suit: 'Major' },
  { id: 'major-15-the-devil', name: 'XV. The Devil', suit: 'Major' },
  { id: 'major-16-the-tower', name: 'XVI. The Tower', suit: 'Major' },
  { id: 'major-17-the-star', name: 'XVII. The Star', suit: 'Major' },
  { id: 'major-18-the-moon', name: 'XVIII. The Moon', suit: 'Major' },
  { id: 'major-19-the-sun', name: 'XIX. The Sun', suit: 'Major' },
  { id: 'major-20-judgement', name: 'XX. Judgement', suit: 'Major' },
  { id: 'major-21-the-world', name: 'XXI. The World', suit: 'Major' },
  // Minor Arcana highlights
  { id: 'wands-ace', name: 'Ace of Wands', suit: 'Wands' },
  { id: 'wands-03', name: 'Three of Wands', suit: 'Wands' },
  { id: 'wands-10', name: 'Ten of Wands', suit: 'Wands' },
  { id: 'cups-ace', name: 'Ace of Cups', suit: 'Cups' },
  { id: 'cups-02', name: 'Two of Cups', suit: 'Cups' },
  { id: 'cups-03', name: 'Three of Cups', suit: 'Cups' },
  { id: 'swords-ace', name: 'Ace of Swords', suit: 'Swords' },
  { id: 'swords-08', name: 'Eight of Swords', suit: 'Swords' },
  { id: 'swords-10', name: 'Ten of Swords', suit: 'Swords' },
  { id: 'pentacles-ace', name: 'Ace of Pentacles', suit: 'Pentacles' },
  { id: 'pentacles-03', name: 'Three of Pentacles', suit: 'Pentacles' },
  { id: 'pentacles-10', name: 'Ten of Pentacles', suit: 'Pentacles' },
];

export const ReadingSimulator: React.FC = () => {
  const [selectedSpreadId, setSelectedSpreadId] = useState<string>('past-present-future');
  const spread = CANONICAL_SPREADS.find((s) => s.id === selectedSpreadId) || CANONICAL_SPREADS[1];

  const [question, setQuestion] = useState('How should I prioritize my open source contributions?');
  const [querentName, setQuerentName] = useState('Alex Mercer');
  const [readerName, setReaderName] = useState('Arcana Practitioner');
  const [notes, setNotes] = useState('Querent seeks clear direction on engineering vs documentation priorities.');

  // Playback state
  const totalCards = spread.slots.length;
  const [revealedStep, setRevealedStep] = useState<number>(totalCards);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1500);

  // Track drawn cards per slot
  const [cards, setCards] = useState<DrawnCard[]>([
    { slotId: 'past', cardId: 'major-01-the-magician', orientation: 'upright' },
    { slotId: 'present', cardId: 'swords-08', orientation: 'reversed' },
    { slotId: 'future', cardId: 'wands-03', orientation: 'upright' },
  ]);

  const [copied, setCopied] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState<'board' | 'config' | 'prose'>('board');
  const [proseFormat, setProseFormat] = useState<'markdown' | 'text'>('markdown');
  const [includeSlotMeanings, setIncludeSlotMeanings] = useState(false);

  // Auto-play timer for Reading Simulator
  useEffect(() => {
    let timer: number | undefined;
    if (isPlaying) {
      timer = window.setInterval(() => {
        setRevealedStep((prev) => {
          if (prev >= totalCards) {
            setIsPlaying(false);
            return totalCards;
          }
          return prev + 1;
        });
      }, playSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, totalCards, playSpeed]);

  // When spread changes, initialize cards for its slots
  const handleSpreadChange = (newSpreadId: string) => {
    setSelectedSpreadId(newSpreadId);
    const newSpread = CANONICAL_SPREADS.find((s) => s.id === newSpreadId);
    if (!newSpread) return;

    const newCards: DrawnCard[] = newSpread.slots.map((s, idx) => ({
      slotId: s.id,
      cardId: SAMPLE_78_DECK[idx % SAMPLE_78_DECK.length].id,
      orientation: idx % 3 === 1 ? 'reversed' : 'upright',
      notes: '',
    }));
    setCards(newCards);
    setRevealedStep(newSpread.slots.length);
    setIsPlaying(false);
  };

  const handleRandomDraw = () => {
    const shuffled = [...SAMPLE_78_DECK].sort(() => Math.random() - 0.5);
    const newCards: DrawnCard[] = spread.slots.map((s, idx) => ({
      slotId: s.id,
      cardId: shuffled[idx % shuffled.length].id,
      orientation: Math.random() > 0.3 ? 'upright' : 'reversed',
      notes: '',
    }));
    setCards(newCards);
  };

  const handleToggleOrientation = (slotId: string) => {
    setCards((prev) =>
      prev.map((c) =>
        c.slotId === slotId
          ? { ...c, orientation: c.orientation === 'upright' ? 'reversed' : 'upright' }
          : c
      )
    );
  };

  const handleCardChange = (slotId: string, cardId: string) => {
    setCards((prev) =>
      prev.map((c) => (c.slotId === slotId ? { ...c, cardId } : c))
    );
  };

  // Step controls
  const handleStepForward = () => {
    setIsPlaying(false);
    if (revealedStep < totalCards) {
      setRevealedStep((prev) => prev + 1);
    }
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    if (revealedStep > 1) {
      setRevealedStep((prev) => prev - 1);
    } else if (revealedStep === 1) {
      setRevealedStep(0);
    }
  };

  const handleResetDraw = () => {
    setIsPlaying(false);
    setRevealedStep(0);
  };

  const handleRevealAll = () => {
    setIsPlaying(false);
    setRevealedStep(totalCards);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (revealedStep >= totalCards) {
        setRevealedStep(1);
      }
      setIsPlaying(true);
    }
  };

  // Build the TarotReading JSON object
  const readingRecord: TarotReading = {
    schemaVersion: '1.0.0',
    readingId: '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d',
    spreadId: spread.id,
    question,
    querent: { name: querentName },
    reader: { name: readerName, system: 'RWS' },
    drawnAt: new Date().toISOString(),
    deck: { name: 'Universal Waite Tarot', reversals: true },
    cards: cards.slice(0, revealedStep > 0 ? revealedStep : 1), // reflects dealt subset in playground
    interpretation: {
      summary: 'Strong foundational momentum breaking open previously stagnant patterns.',
    },
    notes,
  };

  // Validate the reading record live
  const report = validateReadingRecord(readingRecord, spread);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(readingRecord, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(readingRecord, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reading-${spread.id}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentRevealedSlot = spread.slots.find((s) => s.order === revealedStep);
  const currentRevealedCard = currentRevealedSlot
    ? cards.find((c) => c.slotId === currentRevealedSlot.id)
    : null;
  const currentCardMeta = currentRevealedCard
    ? SAMPLE_78_DECK.find((d) => d.id === currentRevealedCard.cardId)
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Spread:
          </label>
          <select
            value={selectedSpreadId}
            onChange={(e) => handleSpreadChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 font-medium"
          >
            {CANONICAL_SPREADS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.slots.length} cards)
              </option>
            ))}
          </select>

          <button
            onClick={handleRandomDraw}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Random Deal Cards
          </button>

          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setActiveViewMode('board')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeViewMode === 'board'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Reading Board & Playback
            </button>
            <button
              onClick={() => setActiveViewMode('config')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeViewMode === 'config'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Card & Slot Config
            </button>
            <button
              onClick={() => setActiveViewMode('prose')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeViewMode === 'prose'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Human Narrative (Render)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyJson}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? 'Copied!' : 'Copy Reading JSON'}
          </button>
          <button
            onClick={handleDownloadJson}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors shadow"
          >
            <Download className="w-3.5 h-3.5" />
            Download .json
          </button>
        </div>
      </div>

      {/* 🎬 Sequential Draw Playback Controller Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDraw}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Conceal all cards"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleStepBackward}
            disabled={revealedStep <= 0}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 flex items-center gap-1.5 text-xs font-medium disabled:opacity-40 transition-colors"
          >
            <SkipBack className="w-4 h-4" />
            <span>Step Back</span>
          </button>

          <button
            onClick={handleTogglePlay}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold text-white shadow-md transition-all ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause Auto-Draw' : 'Play Draw'}</span>
          </button>

          <button
            onClick={handleStepForward}
            disabled={revealedStep >= totalCards}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 flex items-center gap-1.5 text-xs font-medium disabled:opacity-40 transition-colors"
          >
            <span>Step Forward</span>
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={handleRevealAll}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs flex items-center gap-1.5 transition-colors"
          >
            <ChevronsRight className="w-4 h-4" />
            <span>All Cards</span>
          </button>
        </div>

        {/* Scrubber */}
        <div className="flex items-center gap-3 flex-1 min-w-[240px] justify-end">
          <span className="text-xs text-slate-400 font-mono">0</span>
          <input
            type="range"
            min="0"
            max={totalCards}
            value={revealedStep}
            onChange={(e) => {
              setIsPlaying(false);
              setRevealedStep(Number(e.target.value));
            }}
            className="w-full max-w-xs accent-indigo-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
          />
          <span className="text-xs text-slate-400 font-mono">{totalCards}</span>

          <div className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-300 shrink-0">
            Drawn: <strong className="text-white">{revealedStep}</strong> / {totalCards}
          </div>
        </div>
      </div>

      {activeViewMode === 'board' ? (
        /* Visual Reading Board with sequential deal */
        <div className="flex flex-col gap-6">
          {/* Spotlight on currently revealed card */}
          {revealedStep > 0 && currentRevealedSlot && currentCardMeta && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0">
                  {currentRevealedSlot.order}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-100">
                      {currentCardMeta.name}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold uppercase ${
                        currentRevealedCard?.orientation === 'reversed'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {currentRevealedCard?.orientation}
                    </span>
                  </div>
                  <div className="text-xs text-indigo-300 mt-0.5">
                    Position: <strong>{currentRevealedSlot.role}</strong> (#{currentRevealedSlot.id})
                  </div>
                  {currentRevealedSlot.description && (
                    <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
                      {currentRevealedSlot.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleStepBackward}
                  disabled={revealedStep <= 1}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                >
                  ◀ Prev Card
                </button>
                <button
                  onClick={handleStepForward}
                  disabled={revealedStep >= totalCards}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 disabled:opacity-40 shadow"
                >
                  Next Card ▶
                </button>
              </div>
            </div>
          )}

          {/* Cards Grid / Board */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {spread.slots.map((slot) => {
              const isRevealed = slot.order <= revealedStep;
              const isCurrent = slot.order === revealedStep;
              const drawn = cards.find((c) => c.slotId === slot.id);
              const cardMeta = drawn ? SAMPLE_78_DECK.find((d) => d.id === drawn.cardId) : null;
              const isReversed = drawn?.orientation === 'reversed';

              return (
                <div
                  key={slot.id}
                  onClick={() => {
                    if (!isRevealed) {
                      setRevealedStep(slot.order);
                    }
                  }}
                  className={`group relative rounded-2xl p-4 flex flex-col justify-between aspect-[2/3] border transition-all duration-300 cursor-pointer select-none ${
                    isRevealed
                      ? isCurrent
                        ? 'bg-indigo-950/80 border-indigo-400 shadow-xl shadow-indigo-500/20 scale-102 ring-2 ring-indigo-400/50'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/60 opacity-40 hover:opacity-75 border-dashed'
                  }`}
                >
                  {/* Top Slot Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                        isCurrent
                          ? 'bg-indigo-500 text-white shadow'
                          : isRevealed
                          ? 'bg-slate-800 text-slate-200'
                          : 'bg-slate-900 text-slate-500'
                      }`}
                    >
                      {slot.order}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      #{slot.id}
                    </span>
                  </div>

                  {isRevealed && cardMeta ? (
                    <>
                      {/* Center Card Identity */}
                      <div className="my-auto flex flex-col items-center text-center gap-1.5">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
                          {cardMeta.suit}
                        </span>
                        <h5
                          className={`text-sm font-bold text-slate-100 transition-transform ${
                            isReversed ? 'rotate-180' : ''
                          }`}
                        >
                          {cardMeta.name}
                        </h5>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleOrientation(slot.id);
                          }}
                          className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-semibold uppercase mt-1 transition-colors ${
                            isReversed
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {drawn?.orientation} ↻
                        </button>
                      </div>

                      {/* Bottom Role Info */}
                      <div className="pt-2 border-t border-slate-800/80">
                        <span className="text-[11px] font-semibold text-indigo-300 line-clamp-1 block">
                          {slot.role}
                        </span>
                      </div>
                    </>
                  ) : (
                    /* Face down or awaiting card */
                    <div className="my-auto flex flex-col items-center justify-center text-center p-2">
                      <Sparkles className="w-6 h-6 text-slate-600 mb-1" />
                      <span className="text-xs text-slate-400 font-medium">Card {slot.order}</span>
                      <span className="text-[10px] text-slate-600 mt-0.5">Click to reveal</span>
                      <span className="text-[10px] text-slate-500 line-clamp-1 mt-2">
                        {slot.role}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : activeViewMode === 'config' ? (
        /* Configuration & Metadata Forms */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Metadata Card */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Reading Metadata
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Querent Question</label>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Querent Name</label>
                  <input
                    type="text"
                    value={querentName}
                    onChange={(e) => setQuerentName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Slots & Card Selection */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Drawn Cards by Position ({spread.slots.length})
                </h4>
                <span className="text-[11px] text-indigo-400 font-mono">
                  spread: {spread.id}
                </span>
              </div>

              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {spread.slots.map((slot) => {
                  const drawn = cards.find((c) => c.slotId === slot.id);
                  const orientation = drawn?.orientation || 'upright';

                  return (
                    <div
                      key={slot.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center shrink-0">
                          {slot.order}
                        </span>
                        <div>
                          <span className="font-semibold text-slate-200 block">{slot.role}</span>
                          <span className="text-[10px] text-slate-500 font-mono">#{slot.id}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={drawn?.cardId || SAMPLE_78_DECK[0].id}
                          onChange={(e) => handleCardChange(slot.id, e.target.value)}
                          className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
                        >
                          {SAMPLE_78_DECK.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => handleToggleOrientation(slot.id)}
                          className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] flex items-center gap-1 transition-colors ${
                            orientation === 'reversed'
                              ? 'bg-rose-950/60 text-rose-300 border-rose-800/80'
                              : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
                          }`}
                          title="Click to toggle orientation upright / reversed"
                        >
                          <RotateCw className="w-3 h-3" />
                          {orientation}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Conforming JSON Record & Live Validator */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Validation Banner */}
            {report.valid ? (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-200 flex items-center gap-2.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>100% Conforming Record:</strong> Validated against <code className="font-mono">tarot-reading.schema.json</code> & template <code className="font-mono">{spread.id}</code>.
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-200 flex items-center gap-2.5 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong>Validation Violation:</strong> {report.errors[0]?.message}
                </span>
              </div>
            )}

            {/* Generated JSON Output */}
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="font-medium">Live Conforming TarotReading Record JSON</span>
                <span className="font-mono text-[11px] text-indigo-400">schemaVersion: "1.0.0"</span>
              </div>

              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-200 overflow-auto max-h-[560px] leading-relaxed shadow-inner">
                <pre>{JSON.stringify(readingRecord, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Human Narrative Render View */
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Output Format:
              </span>
              <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
                <button
                  onClick={() => setProseFormat('markdown')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    proseFormat === 'markdown'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Markdown (.md)
                </button>
                <button
                  onClick={() => setProseFormat('text')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    proseFormat === 'text'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Plain Text (.txt)
                </button>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer ml-2">
                <input
                  type="checkbox"
                  checked={includeSlotMeanings}
                  onChange={(e) => setIncludeSlotMeanings(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-indigo-600"
                />
                <span>Include Slot Meanings</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const output = renderReading(
                    readingRecord,
                    spread,
                    (id) => SAMPLE_78_DECK.find((c) => c.id === id),
                    { format: proseFormat, includeSlotMeanings }
                  );
                  navigator.clipboard.writeText(output);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied Narrative!' : 'Copy Narrative'}
              </button>
              <button
                onClick={() => {
                  const output = renderReading(
                    readingRecord,
                    spread,
                    (id) => SAMPLE_78_DECK.find((c) => c.id === id),
                    { format: proseFormat, includeSlotMeanings }
                  );
                  const ext = proseFormat === 'markdown' ? 'md' : 'txt';
                  const blob = new Blob([output], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `reading-${spread.id}.${ext}`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors shadow"
              >
                <Download className="w-3.5 h-3.5" />
                Download .{proseFormat === 'markdown' ? 'md' : 'txt'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6 font-mono text-xs text-slate-200 overflow-auto leading-relaxed shadow-inner">
            <pre className="whitespace-pre-wrap">
              {renderReading(
                readingRecord,
                spread,
                (id) => SAMPLE_78_DECK.find((c) => c.id === id),
                { format: proseFormat, includeSlotMeanings }
              )}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

