import React, { useState, useEffect, useRef } from 'react';
import type { TarotSpreadDefinition, Slot, Relation } from '../schema/types.ts';
import {
  Layers,
  Compass,
  Info,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  ChevronsRight,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface VisualSpreadCanvasProps {
  spread: TarotSpreadDefinition;
  selectedSlotId?: string | null;
  onSelectSlot?: (slotId: string) => void;
  highlightRelations?: boolean;
}

const RELATION_COLORS: Record<string, string> = {
  leads_to: '#38bdf8', // sky-400
  crosses: '#f43f5e', // rose-500
  grounds: '#ca8a04', // amber-600
  crowns: '#a855f7', // purple-500
  mirrors: '#06b6d4', // cyan-500
  opposes: '#ef4444', // red-500
  clarifies: '#10b981', // emerald-500
  culminates_in: '#ec4899', // pink-500
  adjacent_to: '#94a3b8', // slate-400
};

export const VisualSpreadCanvas: React.FC<VisualSpreadCanvasProps> = ({
  spread,
  selectedSlotId,
  onSelectSlot,
  highlightRelations = true,
}) => {
  const [hoveredSlotId, setHoveredSlotId] = useState<string | null>(null);

  // Playback state: step ranges from 1 to spread.slots.length (or 0 for clear)
  const totalSlots = spread.slots.length;
  const [currentStep, setCurrentStep] = useState<number>(totalSlots);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1400); // ms per step
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  // When spread changes, reset to full view and pause
  useEffect(() => {
    setCurrentStep(spread.slots.length);
    setIsPlaying(false);
  }, [spread.id, spread.slots.length]);

  // Subtle web audio synthesized chime for card deal
  const playDealChime = (pitchFactor = 1) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      // Harmonic scale based on step order
      const baseFreq = 260 + (pitchFactor * 38);
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch {
      // Audio not supported or blocked
    }
  };

  // Auto-play interval
  useEffect(() => {
    let timer: number | undefined;
    if (isPlaying) {
      timer = window.setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSlots) {
            setIsPlaying(false);
            return totalSlots;
          }
          const next = prev + 1;
          playDealChime(next);
          return next;
        });
      }, playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, totalSlots, playbackSpeed, soundEnabled]);

  // Step controls
  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentStep < totalSlots) {
      const next = currentStep + 1;
      setCurrentStep(next);
      playDealChime(next);
    }
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (currentStep === 1) {
      setCurrentStep(0);
    }
  };

  const handleResetDraw = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handleAllCards = () => {
    setIsPlaying(false);
    setCurrentStep(totalSlots);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentStep >= totalSlots) {
        setCurrentStep(1);
        playDealChime(1);
      }
      setIsPlaying(true);
    }
  };

  // Map slots by id for coordinate calculation
  const slotMap = new Map<string, Slot>();
  spread.slots.forEach((s) => slotMap.set(s.id, s));

  // Find slot corresponding to current step
  const currentStepSlot = spread.slots.find((s) => s.order === currentStep);

  const activeSlotId = selectedSlotId || hoveredSlotId || (currentStepSlot ? currentStepSlot.id : null);
  const activeSlot = activeSlotId ? slotMap.get(activeSlotId) : null;

  // Canvas bounds (internal SVG units: 1000 x 700)
  const SVG_WIDTH = 1000;
  const SVG_HEIGHT = 700;
  const CARD_WIDTH = 92;
  const CARD_HEIGHT = 148;

  const getSlotPixelCoords = (slot: Slot) => {
    const x = (slot.layout?.x ?? 0.5) * (SVG_WIDTH - 240) + 120;
    const y = (slot.layout?.y ?? 0.5) * (SVG_HEIGHT - 220) + 110;
    return { x, y, rotation: slot.layout?.rotation ?? 0, zIndex: slot.layout?.zIndex ?? 0 };
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
      {/* 2D Spatial Canvas & Playback Bar */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Header & Spread Meta */}
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800/80 gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Compass className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                {spread.name}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {spread.layoutType}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Interactive spatial projection ({spread.slots.length} slots, {spread.relations.length} relations)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title={soundEnabled ? 'Mute deal sound' : 'Enable deal sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>2D Normalized Coordinates</span>
            </div>
          </div>
        </div>

        {/* 🎬 Draw Playback Controller Bar */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-md">
          {/* Main playback buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleResetDraw}
              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
              title="Reset Draw (Clear all dealt cards)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleStepBackward}
              disabled={currentStep <= 0}
              className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 text-xs font-medium disabled:opacity-40 transition-colors"
              title="Step Backward (Previous position)"
            >
              <SkipBack className="w-3.5 h-3.5" />
              <span>Step Back</span>
            </button>

            <button
              onClick={handleTogglePlay}
              className={`px-4 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold text-white shadow-md transition-all ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
              }`}
              title={isPlaying ? 'Pause Auto-Play' : 'Play Sequential Draw'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play Draw'}</span>
            </button>

            <button
              onClick={handleStepForward}
              disabled={currentStep >= totalSlots}
              className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 text-xs font-medium disabled:opacity-40 transition-colors"
              title="Step Forward (Deal next card)"
            >
              <span>Step Forward</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleAllCards}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs flex items-center gap-1 transition-colors"
              title="Deal All Cards Immediately"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
              <span>All</span>
            </button>
          </div>

          {/* Scrubber & Step Indicator */}
          <div className="flex items-center gap-3 flex-1 min-w-[200px] justify-end">
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <span className="text-[11px] text-slate-400 font-mono shrink-0">
                0
              </span>
              <input
                type="range"
                min="0"
                max={totalSlots}
                value={currentStep}
                onChange={(e) => {
                  setIsPlaying(false);
                  const val = Number(e.target.value);
                  setCurrentStep(val);
                  if (val > 0) playDealChime(val);
                }}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
              />
              <span className="text-[11px] text-slate-400 font-mono shrink-0">
                {totalSlots}
              </span>
            </div>

            <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-300 shrink-0">
              Dealt: <strong className="text-white">{currentStep}</strong> / {totalSlots}
            </div>

            {/* Speed control */}
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none"
              title="Deal interval speed"
            >
              <option value="2000">Slow (2.0s)</option>
              <option value="1400">Normal (1.4s)</option>
              <option value="800">Fast (0.8s)</option>
            </select>
          </div>
        </div>

        {/* Current Active Step Banner */}
        {currentStep > 0 && currentStepSlot && (
          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-md">
                {currentStepSlot.order}
              </span>
              <div>
                <span className="font-semibold text-slate-200">
                  Position {currentStepSlot.order} of {totalSlots}: {currentStepSlot.role}
                </span>
                {currentStepSlot.description && (
                  <p className="text-slate-400 text-[11px] line-clamp-1 mt-0.5">
                    {currentStepSlot.description}
                  </p>
                )}
              </div>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
              Active Draw Focus
            </span>
          </div>
        )}

        {/* SVG Spatial Canvas */}
        <div className="relative w-full aspect-[10/7] bg-radial from-slate-900 to-slate-950 rounded-xl border border-slate-800/80 overflow-hidden shadow-inner group">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            className="w-full h-full select-none"
          >
            <defs>
              {/* Arrow markers for relation types */}
              {Object.entries(RELATION_COLORS).map(([type, color]) => (
                <marker
                  key={type}
                  id={`arrow-${type}`}
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill={color} opacity="0.85" />
                </marker>
              ))}

              <filter id="card-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#6366f1" floodOpacity="0.5" />
              </filter>

              <filter id="active-deal-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#818cf8" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* Relation Lines: only visible if BOTH source and target have been dealt (order <= currentStep) */}
            {highlightRelations &&
              spread.relations.map((rel, idx) => {
                const sourceSlot = slotMap.get(rel.source);
                const targetSlot = slotMap.get(rel.target);
                if (!sourceSlot || !targetSlot) return null;

                // Graph unfolds progressively: relation appears only when both cards are on the table
                const isBothDealt =
                  sourceSlot.order <= currentStep && targetSlot.order <= currentStep;
                if (!isBothDealt) return null;

                const src = getSlotPixelCoords(sourceSlot);
                const tgt = getSlotPixelCoords(targetSlot);
                const color = RELATION_COLORS[rel.type] || '#94a3b8';

                const isConnected =
                  activeSlotId === rel.source || activeSlotId === rel.target;

                // Curved bezier path
                const dx = tgt.x - src.x;
                const dy = tgt.y - src.y;
                const cx = (src.x + tgt.x) / 2 - dy * 0.15;
                const cy = (src.y + tgt.y) / 2 + dx * 0.15;

                return (
                  <g key={`rel-${idx}`} className="transition-opacity duration-300">
                    <path
                      d={`M ${src.x} ${src.y} Q ${cx} ${cy} ${tgt.x} ${tgt.y}`}
                      fill="none"
                      stroke={color}
                      strokeWidth={isConnected ? 3 : 1.5}
                      strokeDasharray={rel.type === 'mirrors' ? '6,4' : undefined}
                      opacity={activeSlotId ? (isConnected ? 1 : 0.25) : 0.7}
                      markerEnd={`url(#arrow-${rel.type})`}
                    />
                    {/* Relation label bubble if active */}
                    {isConnected && (
                      <g transform={`translate(${cx}, ${cy})`}>
                        <rect
                          x="-45"
                          y="-12"
                          width="90"
                          height="24"
                          rx="12"
                          fill="#0f172a"
                          stroke={color}
                          strokeWidth="1.5"
                          opacity="0.95"
                        />
                        <text
                          textAnchor="middle"
                          y="4"
                          fill={color}
                          fontSize="10"
                          fontWeight="600"
                          fontFamily="sans-serif"
                        >
                          {rel.type.replace('_', ' ')}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

            {/* Card Slots */}
            {spread.slots
              .slice()
              .sort((a, b) => (a.layout?.zIndex ?? 0) - (b.layout?.zIndex ?? 0))
              .map((slot) => {
                const { x, y, rotation } = getSlotPixelCoords(slot);
                const isDealt = slot.order <= currentStep;
                const isJustDealt = slot.order === currentStep;
                const isSelected = selectedSlotId === slot.id;
                const isHovered = hoveredSlotId === slot.id;
                const isActive = (isSelected || isHovered || isJustDealt) && isDealt;

                return (
                  <g
                    key={slot.id}
                    transform={`translate(${x}, ${y}) rotate(${rotation})`}
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredSlotId(slot.id)}
                    onMouseLeave={() => setHoveredSlotId(null)}
                    onClick={() => {
                      // Clicking an undealt card jumps draw directly to that card
                      if (!isDealt) {
                        setCurrentStep(slot.order);
                        playDealChime(slot.order);
                      }
                      onSelectSlot?.(slot.id);
                    }}
                  >
                    {isDealt ? (
                      /* DEALT CARD (Revealed in draw) */
                      <>
                        {/* Glow halo for the most recently dealt card */}
                        {isJustDealt && (
                          <rect
                            x={-CARD_WIDTH / 2 - 4}
                            y={-CARD_HEIGHT / 2 - 4}
                            width={CARD_WIDTH + 8}
                            height={CARD_HEIGHT + 8}
                            rx="14"
                            fill="none"
                            stroke="#818cf8"
                            strokeWidth="3"
                            filter="url(#active-deal-glow)"
                            className="animate-pulse"
                          />
                        )}

                        {/* Card Body */}
                        <rect
                          x={-CARD_WIDTH / 2}
                          y={-CARD_HEIGHT / 2}
                          width={CARD_WIDTH}
                          height={CARD_HEIGHT}
                          rx="10"
                          fill={isActive ? '#1e1b4b' : '#0f172a'}
                          stroke={isJustDealt ? '#a5b4fc' : isActive ? '#818cf8' : '#334155'}
                          strokeWidth={isJustDealt ? '3' : isActive ? '2.5' : '1.5'}
                          filter={isActive ? 'url(#card-glow)' : undefined}
                        />

                        {/* Card Inner Border */}
                        <rect
                          x={-CARD_WIDTH / 2 + 5}
                          y={-CARD_HEIGHT / 2 + 5}
                          width={CARD_WIDTH - 10}
                          height={CARD_HEIGHT - 10}
                          rx="6"
                          fill="none"
                          stroke={isActive ? '#4f46e5' : '#1e293b'}
                          strokeWidth="1"
                          strokeDasharray="3,3"
                        />

                        {/* Slot Sequence Badge */}
                        <circle
                          cx="0"
                          cy={-CARD_HEIGHT / 2 + 24}
                          r="14"
                          fill={isJustDealt ? '#6366f1' : isActive ? '#4f46e5' : '#334155'}
                        />
                        <text
                          textAnchor="middle"
                          y={-CARD_HEIGHT / 2 + 29}
                          fill="#ffffff"
                          fontSize="12"
                          fontWeight="bold"
                        >
                          {slot.order}
                        </text>

                        {/* Slot Name */}
                        <text
                          textAnchor="middle"
                          y={0}
                          fill={isActive ? '#e0e7ff' : '#94a3b8'}
                          fontSize="10"
                          fontWeight="600"
                          className="max-w-[75px]"
                        >
                          {slot.role.length > 14 ? `${slot.role.slice(0, 13)}…` : slot.role}
                        </text>

                        {/* Slot ID Slug */}
                        <text
                          textAnchor="middle"
                          y={CARD_HEIGHT / 2 - 16}
                          fill="#64748b"
                          fontSize="9"
                          fontFamily="monospace"
                        >
                          #{slot.id}
                        </text>
                      </>
                    ) : (
                      /* UNDEALT PLACEHOLDER (Upcoming slot in sequence) */
                      <>
                        <rect
                          x={-CARD_WIDTH / 2}
                          y={-CARD_HEIGHT / 2}
                          width={CARD_WIDTH}
                          height={CARD_HEIGHT}
                          rx="10"
                          fill="#090d16"
                          fillOpacity="0.4"
                          stroke="#1e293b"
                          strokeWidth="1.5"
                          strokeDasharray="6,4"
                          opacity="0.5"
                        />

                        {/* Ghost circle with order number */}
                        <circle
                          cx="0"
                          cy={-CARD_HEIGHT / 2 + 24}
                          r="12"
                          fill="#0f172a"
                          stroke="#334155"
                          strokeWidth="1"
                          opacity="0.7"
                        />
                        <text
                          textAnchor="middle"
                          y={-CARD_HEIGHT / 2 + 28}
                          fill="#64748b"
                          fontSize="11"
                          fontWeight="600"
                        >
                          {slot.order}
                        </text>

                        <text
                          textAnchor="middle"
                          y={-2}
                          fill="#475569"
                          fontSize="9"
                          fontStyle="italic"
                        >
                          Waiting to draw...
                        </text>

                        <text
                          textAnchor="middle"
                          y={16}
                          fill="#64748b"
                          fontSize="8.5"
                          fontWeight="500"
                        >
                          {slot.role.length > 15 ? `${slot.role.slice(0, 14)}…` : slot.role}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
          <span className="text-slate-400 font-medium">Relational Edges:</span>
          {Object.entries(RELATION_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-slate-300 capitalize">{type.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Inspector Panel */}
      <div className="w-full xl:w-80 flex flex-col gap-4 border-t xl:border-t-0 xl:border-l border-slate-800 xl:pl-6">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400" />
            Position Inspector
          </h4>
          {activeSlot && (
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
              Slot {activeSlot.order} of {spread.slots.length}
            </span>
          )}
        </div>

        {activeSlot ? (
          <div className="flex flex-col gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Role</span>
              <div className="text-sm font-semibold text-slate-100 mt-0.5">{activeSlot.role}</div>
              <div className="text-xs text-indigo-400 font-mono mt-1">ID: "{activeSlot.id}"</div>
            </div>

            {/* Dealt state indicator */}
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Draw Status:</span>
              {activeSlot.order <= currentStep ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  ✓ Dealt on table
                </span>
              ) : (
                <span className="text-slate-500 italic flex items-center gap-1">
                  ○ Undealt (Order {activeSlot.order})
                </span>
              )}
            </div>

            {activeSlot.description && (
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <span className="text-slate-400 font-medium block mb-1">Description</span>
                {activeSlot.description}
              </div>
            )}

            {activeSlot.layout && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">Normalized X</span>
                  <span className="font-mono text-slate-200 font-semibold">{activeSlot.layout.x}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">Normalized Y</span>
                  <span className="font-mono text-slate-200 font-semibold">{activeSlot.layout.y}</span>
                </div>
                {activeSlot.layout.rotation !== undefined && (
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase">Rotation</span>
                    <span className="font-mono text-slate-200 font-semibold">{activeSlot.layout.rotation}°</span>
                  </div>
                )}
                {activeSlot.layout.zIndex !== undefined && (
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase">Z-Index Stacking</span>
                    <span className="font-mono text-slate-200 font-semibold">{activeSlot.layout.zIndex}</span>
                  </div>
                )}
              </div>
            )}

            {/* Outgoing & Incoming Relations for Active Slot */}
            <div className="space-y-2 mt-1">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
                Connected Relations
              </span>
              {spread.relations.filter(
                (r) => r.source === activeSlot.id || r.target === activeSlot.id
              ).length === 0 ? (
                <div className="text-xs text-slate-500 italic p-3 rounded-lg bg-slate-900/40">
                  No direct relational graph edges declared for this slot.
                </div>
              ) : (
                spread.relations
                  .filter((r) => r.source === activeSlot.id || r.target === activeSlot.id)
                  .map((r, i) => {
                    const isSource = r.source === activeSlot.id;
                    const otherSlotId = isSource ? r.target : r.source;
                    const isOtherDealt = (slotMap.get(otherSlotId)?.order ?? 0) <= currentStep;

                    return (
                      <div
                        key={i}
                        className={`p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs transition-opacity ${
                          isOtherDealt ? 'opacity-100' : 'opacity-40'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: RELATION_COLORS[r.type] }}
                          />
                          <span className="text-slate-300 font-medium">
                            {r.type.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-slate-400 font-mono">
                          {isSource ? `→ #${otherSlotId}` : `← #${otherSlotId}`}
                          {!isOtherDealt && ' (pending)'}
                        </span>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 rounded-xl bg-slate-900/40 border border-slate-800/60 text-slate-400">
            <Layers className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-xs">
              Play or step through the draw to watch each card arrive in sequence, or click any card position to inspect.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

