import type { TarotSpreadDefinition, TarotSpreadCatalog } from './types.ts';

export const SINGLE_CARD_SPREAD: TarotSpreadDefinition = {
  schemaVersion: "2.0.0",
  id: "single-card",
  name: "Single Card Draw",
  summary: "The foundational daily focus, quick query, or clarifier draw.",
  layoutType: "linear",
  difficulty: "beginner",
  author: "Traditional",
  license: "CC-BY-4.0",
  tags: ["daily", "beginner", "clarity", "reflection"],
  instructions: {
    preparation: "Take three deep breaths, formulate a singular intention or ask 'What energy asks for my attention today?'",
    shuffle: "Shuffle the deck until you feel an intuitive stop.",
    drawing: "Draw the top card or cut the deck and take the cut card.",
    synthesis: "Meditate on the imagery, symbols, and core essence of the card in relation to your day or question."
  },
  deckContract: {
    minCards: 1,
    deckType: "full_78",
    allowReversals: true,
    requiresSignificator: false
  },
  slots: [
    {
      id: "focus",
      order: 1,
      role: "Daily Focus / Core Guidance",
      description: "The central theme, active energy, or lesson for the query.",
      keywords: ["focus", "message", "theme"],
      layout: {
        x: 0.5,
        y: 0.5,
        rotation: 0,
        zIndex: 0
      }
    }
  ],
  relations: []
};

export const PAST_PRESENT_FUTURE_SPREAD: TarotSpreadDefinition = {
  schemaVersion: "2.0.0",
  id: "past-present-future",
  name: "Past, Present, Future",
  summary: "The classic three-card linear progression mapping temporal development and trajectory.",
  layoutType: "linear",
  difficulty: "beginner",
  author: "Traditional",
  license: "CC-BY-4.0",
  tags: ["timeline", "general", "classic", "beginner"],
  instructions: {
    preparation: "Ground your focus on the situation at hand and recognize time as a fluid narrative continuum.",
    shuffle: "Thoroughly riffle or overhand shuffle while contemplating how prior choices led to this moment.",
    drawing: "Deal three cards from left to right: Slot 1 (Past), Slot 2 (Present), Slot 3 (Future).",
    synthesis: "Observe the progression from left to right. Are suits transitioning? Does the energy accelerate, ground, or resolve?"
  },
  deckContract: {
    minCards: 3,
    deckType: "full_78",
    allowReversals: true,
    requiresSignificator: false
  },
  readingVariants: [
    {
      id: "mind-body-spirit",
      name: "Mind, Body, Spirit",
      description: "Holistic self-checkup inspecting mental state, physical vitality, and spiritual alignment.",
      slotOverrides: [
        { slotId: "past", role: "Mind", description: "Mental focus, thoughts, and cognitive belief systems." },
        { slotId: "present", role: "Body", description: "Physical health, material environment, and bodily somatic state." },
        { slotId: "future", role: "Spirit", description: "Spiritual direction, intuitive calling, and higher consciousness." }
      ]
    },
    {
      id: "situation-obstacle-advice",
      name: "Situation, Obstacle, Advice",
      description: "Pragmatic problem-solving trio.",
      slotOverrides: [
        { slotId: "past", role: "Current Situation", description: "The exact state of affairs right now." },
        { slotId: "present", role: "Immediate Obstacle", description: "The barrier, friction, or challenge in play." },
        { slotId: "future", role: "Actionable Advice", description: "Recommended course of action to overcome the hurdle." }
      ]
    }
  ],
  slots: [
    {
      id: "past",
      order: 1,
      role: "Past Foundations",
      description: "Past events, foundational conditioning, and roots directly shaping the present state.",
      keywords: ["origin", "history", "karma", "lessons"],
      layout: {
        x: 0.2,
        y: 0.5,
        rotation: 0,
        zIndex: 0
      }
    },
    {
      id: "present",
      order: 2,
      role: "Present Reality",
      description: "The active energy, immediate circumstances, and conscious attitude right now.",
      keywords: ["now", "current", "awareness", "status"],
      layout: {
        x: 0.5,
        y: 0.5,
        rotation: 0,
        zIndex: 0
      }
    },
    {
      id: "future",
      order: 3,
      role: "Likely Future Outcome",
      description: "The prospective outcome if current behaviors and trajectories remain unchanged.",
      keywords: ["outcome", "trajectory", "horizon", "destination"],
      layout: {
        x: 0.8,
        y: 0.5,
        rotation: 0,
        zIndex: 0
      }
    }
  ],
  relations: [
    {
      source: "past",
      target: "present",
      type: "leads_to",
      label: "Causes & Evolves Into",
      weight: 0.9
    },
    {
      source: "present",
      target: "future",
      type: "leads_to",
      label: "Projected Flow Into",
      weight: 1.0
    }
  ]
};

export const DECISION_SPREAD: TarotSpreadDefinition = {
  schemaVersion: "2.0.0",
  id: "decision",
  name: "Two-Path Decision",
  summary: "A five-card branched spread evaluating two diverging choices, their proximate consequences, and core synthesis.",
  layoutType: "triangular",
  difficulty: "intermediate",
  author: "Traditional",
  license: "CC-BY-4.0",
  tags: ["choices", "crossroads", "decision", "career"],
  instructions: {
    preparation: "Clearly state Choice A and Choice B as mutually exclusive options.",
    shuffle: "Shuffle while holding the intention of unbiased clarity.",
    drawing: "Card 1 at base is Current Crossroads. Left wing: Card 2 (Path A), Card 4 (Outcome A). Right wing: Card 3 (Path B), Card 5 (Outcome B).",
    synthesis: "Compare energetic resonance between left branch (Path A) and right branch (Path B)."
  },
  deckContract: {
    minCards: 5,
    deckType: "full_78",
    allowReversals: true,
    requiresSignificator: false
  },
  slots: [
    {
      id: "crossroads-core",
      order: 1,
      role: "The Crossroads",
      description: "Current status, heart of the decision, and fundamental dilemma.",
      layout: { x: 0.5, y: 0.8, rotation: 0, zIndex: 0 }
    },
    {
      id: "path-a-nature",
      order: 2,
      role: "Path A: Immediate Reality",
      description: "The nature, energetic commitment, and experience of selecting Option A.",
      layout: { x: 0.28, y: 0.48, rotation: -10, zIndex: 0 }
    },
    {
      id: "path-b-nature",
      order: 3,
      role: "Path B: Immediate Reality",
      description: "The nature, energetic commitment, and experience of selecting Option B.",
      layout: { x: 0.72, y: 0.48, rotation: 10, zIndex: 0 }
    },
    {
      id: "path-a-outcome",
      order: 4,
      role: "Path A: Long-term Result",
      description: "The likely long-term outcome and harvest of proceeding with Path A.",
      layout: { x: 0.2, y: 0.2, rotation: -15, zIndex: 0 }
    },
    {
      id: "path-b-outcome",
      order: 5,
      role: "Path B: Long-term Result",
      description: "The likely long-term outcome and harvest of proceeding with Path B.",
      layout: { x: 0.8, y: 0.2, rotation: 15, zIndex: 0 }
    }
  ],
  relations: [
    {
      source: "crossroads-core",
      target: "path-a-nature",
      type: "leads_to",
      label: "Branching into Choice A"
    },
    {
      source: "crossroads-core",
      target: "path-b-nature",
      type: "leads_to",
      label: "Branching into Choice B"
    },
    {
      source: "path-a-nature",
      target: "path-a-outcome",
      type: "culminates_in",
      label: "Evolution of Path A"
    },
    {
      source: "path-b-nature",
      target: "path-b-outcome",
      type: "culminates_in",
      label: "Evolution of Path B"
    },
    {
      source: "path-a-nature",
      target: "path-b-nature",
      type: "opposes",
      label: "Alternative Contrast"
    }
  ]
};

export const RELATIONSHIP_SPREAD: TarotSpreadDefinition = {
  schemaVersion: "2.0.0",
  id: "relationship",
  name: "Relationship Mirror",
  summary: "A six-card dyadic spread mapping two individuals, their mutual connection, underlying roots, and relational trajectory.",
  layoutType: "custom",
  difficulty: "intermediate",
  author: "Traditional",
  license: "CC-BY-4.0",
  tags: ["relationship", "love", "partnership", "communication"],
  instructions: {
    preparation: "Ground your heart center. Hold the shared connection in conscious presence.",
    shuffle: "Shuffle while acknowledging both subjective experiences without prejudice.",
    drawing: "Card 1 (Left column: Querent), Card 2 (Right column: Partner), Card 3 (Center top: The Connection), Card 4 (Center bottom: Foundation), Card 5 (Bridge: Friction/Challenge), Card 6 (Crown: Potential).",
    synthesis: "Observe how Card 1 mirrors Card 2, how Card 4 supports Card 3, and how Card 5 tests the union."
  },
  deckContract: {
    minCards: 6,
    deckType: "full_78",
    allowReversals: true,
    requiresSignificator: false
  },
  slots: [
    {
      id: "querent-state",
      order: 1,
      role: "Querent's Energy",
      description: "How the querent perceives the relationship, feelings, and behavioral posture.",
      layout: { x: 0.2, y: 0.35, rotation: 0, zIndex: 0 }
    },
    {
      id: "partner-state",
      order: 2,
      role: "Partner's Energy",
      description: "How the other party feels, current disposition, and unspoken desires.",
      layout: { x: 0.8, y: 0.35, rotation: 0, zIndex: 0 }
    },
    {
      id: "relational-dynamic",
      order: 3,
      role: "The Dynamic Connection",
      description: "The active chemistry, shared communication field, and current synergy between both.",
      layout: { x: 0.5, y: 0.2, rotation: 0, zIndex: 0 }
    },
    {
      id: "relational-foundation",
      order: 4,
      role: "Shared Foundation",
      description: "The shared history, core values, or karmic agreements bonding the couple.",
      layout: { x: 0.5, y: 0.75, rotation: 0, zIndex: 0 }
    },
    {
      id: "relational-obstacle",
      order: 5,
      role: "The Friction / Challenge",
      description: "Misunderstandings, external strains, or shadow projections hindering unity.",
      layout: { x: 0.5, y: 0.48, rotation: 0, zIndex: 0 }
    },
    {
      id: "relational-potential",
      order: 6,
      role: "Future Trajectory",
      description: "Where the partnership is heading if mutual understanding is cultivated.",
      layout: { x: 0.5, y: 0.05, rotation: 0, zIndex: 0 }
    }
  ],
  relations: [
    {
      source: "querent-state",
      target: "partner-state",
      type: "mirrors",
      label: "Dyadic Reflection"
    },
    {
      source: "relational-foundation",
      target: "relational-dynamic",
      type: "grounds",
      label: "Bedrock Supporting Dynamic"
    },
    {
      source: "relational-obstacle",
      target: "relational-dynamic",
      type: "crosses",
      label: "Friction Straining Synergy"
    },
    {
      source: "relational-dynamic",
      target: "relational-potential",
      type: "leads_to",
      label: "Unfolds into Future"
    }
  ]
};

export const HORSESHOE_SPREAD: TarotSpreadDefinition = {
  schemaVersion: "2.0.0",
  id: "horseshoe",
  name: "Horseshoe Spread",
  summary: "A seven-card curved arch providing balanced insight into obstacles, hidden factors, and tactical approach.",
  layoutType: "linear",
  difficulty: "intermediate",
  author: "Traditional",
  license: "CC-BY-4.0",
  tags: ["arch", "problem-solving", "clarity", "seven-card"],
  instructions: {
    preparation: "Visualize your question as an archway through which you must pass.",
    shuffle: "Shuffle the full deck while concentrating on clearing away ambiguity.",
    drawing: "Deal 7 cards in a semi-circular U-shape starting bottom-left, ascending to apex, and descending right.",
    synthesis: "Compare the ascent (Cards 1-3) with the pivot (Card 4) and descent/emergence (Cards 5-7)."
  },
  deckContract: {
    minCards: 7,
    deckType: "full_78",
    allowReversals: true,
    requiresSignificator: false
  },
  slots: [
    {
      id: "past",
      order: 1,
      role: "Past Influences",
      description: "Historical factors that originated the present dilemma.",
      layout: { x: 0.15, y: 0.75, rotation: -25, zIndex: 0 }
    },
    {
      id: "present",
      order: 2,
      role: "Present Status",
      description: "Where you stand at this exact moment.",
      layout: { x: 0.22, y: 0.45, rotation: -15, zIndex: 0 }
    },
    {
      id: "hidden-influences",
      order: 3,
      role: "Hidden Influences",
      description: "Unseen forces, unexamined variables, or latent dynamics.",
      layout: { x: 0.35, y: 0.25, rotation: -5, zIndex: 0 }
    },
    {
      id: "obstacle",
      order: 4,
      role: "The Pivot / Obstacle",
      description: "The crux of the matter: what must be faced or transformed.",
      layout: { x: 0.5, y: 0.18, rotation: 0, zIndex: 0 }
    },
    {
      id: "external-attitudes",
      order: 5,
      role: "External Attitudes",
      description: "How the surrounding world and key peers perceive the issue.",
      layout: { x: 0.65, y: 0.25, rotation: 5, zIndex: 0 }
    },
    {
      id: "best-approach",
      order: 6,
      role: "Optimal Action / Advice",
      description: "The most effective psychological or practical response to adopt.",
      layout: { x: 0.78, y: 0.45, rotation: 15, zIndex: 0 }
    },
    {
      id: "probable-outcome",
      order: 7,
      role: "Probable Outcome",
      description: "The destination reached if the recommended approach is taken.",
      layout: { x: 0.85, y: 0.75, rotation: 25, zIndex: 0 }
    }
  ],
  relations: [
    {
      source: "past",
      target: "present",
      type: "leads_to",
      label: "Direct Continuity"
    },
    {
      source: "hidden-influences",
      target: "obstacle",
      type: "clarifies",
      label: "Roots of the Hurdle"
    },
    {
      source: "obstacle",
      target: "best-approach",
      type: "opposes",
      label: "Friction to Resolution"
    },
    {
      source: "best-approach",
      target: "probable-outcome",
      type: "culminates_in",
      label: "Yields Outcome"
    }
  ]
};

export const CELTIC_CROSS_SPREAD: TarotSpreadDefinition = {
  schemaVersion: "2.0.0",
  id: "celtic-cross",
  name: "Celtic Cross",
  summary: "The archetypal ten-card comprehensive inquiry spread examining core tensions, conscious and unconscious drivers, and evolutionary outcome.",
  layoutType: "cross",
  difficulty: "advanced",
  author: "Arthur Edward Waite (1910)",
  license: "CC-BY-4.0",
  tags: ["comprehensive", "classic", "in-depth", "gold-standard"],
  instructions: {
    preparation: "Define a deep, multi-layered inquiry or life assessment. Ground yourself in the symbolic center.",
    shuffle: "Shuffle methodically. If using a significator, position it before laying Slot 1.",
    drawing: "Place Card 1 in center, cross it with Card 2 horizontally. Lay Card 3 below, Card 4 to left, Card 5 above, Card 6 to right. Lay Cards 7-10 as vertical staff on right.",
    synthesis: "Read small central cross (1 & 2), surrounding cross (3-6), and staff of ascent (7-10) pointing to outcome."
  },
  deckContract: {
    minCards: 10,
    deckType: "full_78",
    allowReversals: true,
    requiresSignificator: false
  },
  slots: [
    {
      id: "present-heart",
      order: 1,
      role: "The Heart of the Matter",
      description: "The central atmosphere, primary condition, or querent's present circumstance.",
      keywords: ["center", "core", "situation"],
      layout: { x: 0.32, y: 0.5, rotation: 0, zIndex: 1 }
    },
    {
      id: "challenge-crossing",
      order: 2,
      role: "The Crossing Force",
      description: "What crosses you for good or ill; immediate tension, test, or complementary catalyst.",
      keywords: ["challenge", "friction", "obstacle", "catalyst"],
      layout: { x: 0.32, y: 0.5, rotation: 90, zIndex: 2 }
    },
    {
      id: "foundation-subconscious",
      order: 3,
      role: "The Root & Foundation",
      description: "Subconscious motivations, root origins, and underlying bedrock of the inquiry.",
      keywords: ["root", "unconscious", "bedrock"],
      layout: { x: 0.32, y: 0.8, rotation: 0, zIndex: 0 }
    },
    {
      id: "past-passing",
      order: 4,
      role: "The Passing Past",
      description: "Influences that are receding or have recently peaked and are losing dominance.",
      keywords: ["behind", "receding", "history"],
      layout: { x: 0.15, y: 0.5, rotation: 0, zIndex: 0 }
    },
    {
      id: "crown-conscious",
      order: 5,
      role: "The Crown & Potential",
      description: "Conscious thoughts, highest ideals, aspirations, and what may be attained.",
      keywords: ["crown", "conscious", "aspiration", "best-possible"],
      layout: { x: 0.32, y: 0.2, rotation: 0, zIndex: 0 }
    },
    {
      id: "near-future",
      order: 6,
      role: "The Approaching Horizon",
      description: "Immediate forces, energies, and encounters entering the querent's life shortly.",
      keywords: ["approaching", "near-future", "entering"],
      layout: { x: 0.49, y: 0.5, rotation: 0, zIndex: 0 }
    },
    {
      id: "querent-attitude",
      order: 7,
      role: "Self & Attitude",
      description: "Querent's posture, self-concept, perceived stance, and inner psychological lens.",
      keywords: ["self", "stance", "mindset"],
      layout: { x: 0.78, y: 0.86, rotation: 0, zIndex: 0 }
    },
    {
      id: "environment-external",
      order: 8,
      role: "External Environment",
      description: "Social field, colleagues, home surroundings, and external forces outside direct control.",
      keywords: ["environment", "others", "external"],
      layout: { x: 0.78, y: 0.62, rotation: 0, zIndex: 0 }
    },
    {
      id: "hopes-fears",
      order: 9,
      role: "Hopes and Fears",
      description: "Secret anxieties, twin hopes, expectations, or psychological vulnerabilities.",
      keywords: ["hopes", "fears", "desire", "anxiety"],
      layout: { x: 0.78, y: 0.38, rotation: 0, zIndex: 0 }
    },
    {
      id: "final-outcome",
      order: 10,
      role: "Final Culmination & Outcome",
      description: "The cumulative result, long-term trajectory, and spiritual harvest of the query.",
      keywords: ["outcome", "culmination", "resolution", "harvest"],
      layout: { x: 0.78, y: 0.14, rotation: 0, zIndex: 0 }
    }
  ],
  relations: [
    {
      source: "challenge-crossing",
      target: "present-heart",
      type: "crosses",
      label: "Tension / Challenge"
    },
    {
      source: "foundation-subconscious",
      target: "present-heart",
      type: "grounds",
      label: "Subconscious Root Grounding"
    },
    {
      source: "crown-conscious",
      target: "present-heart",
      type: "crowns",
      label: "Conscious Crown"
    },
    {
      source: "past-passing",
      target: "present-heart",
      type: "leads_to",
      label: "Preceding Momentum"
    },
    {
      source: "present-heart",
      target: "near-future",
      type: "leads_to",
      label: "Immediate Horizon"
    },
    {
      source: "querent-attitude",
      target: "environment-external",
      type: "mirrors",
      label: "Inner vs Outer Reflection"
    },
    {
      source: "hopes-fears",
      target: "final-outcome",
      type: "leads_to",
      label: "Psychological Expectation Influence"
    },
    {
      source: "near-future",
      target: "final-outcome",
      type: "culminates_in",
      label: "Development to Outcome"
    }
  ]
};

export const TREE_OF_LIFE_SPREAD: TarotSpreadDefinition = {
  schemaVersion: "2.0.0",
  id: "tree-of-life",
  name: "Tree of Life",
  summary: "The esoteric ten-card layout mapping the Hermetic Qabalistic Tree of Life, descending from supreme spirit to dense physical reality.",
  layoutType: "symbolic",
  difficulty: "expert",
  author: "Hermetic Order of the Golden Dawn",
  license: "CC-BY-4.0",
  tags: ["esoteric", "qabalah", "golden-dawn", "in-depth", "expert"],
  instructions: {
    preparation: "Clear your psychic field through invocation, lighting white candle, or rhythmic breath.",
    shuffle: "Shuffle the full 78-card deck contemplating the lightning flash of creation from Kether to Malkuth.",
    drawing: "Deal 10 cards descending the Otz Chim (Tree of Life): 1 Crown, 2 Wisdom, 3 Understanding, 4 Mercy, 5 Severity, 6 Beauty/Heart, 7 Victory, 8 Glory, 9 Foundation, 10 Kingdom.",
    synthesis: "Examine the three pillars (Mercy, Severity, Mildness) and the four worlds (Atziluth, Briah, Yetzirah, Assiah)."
  },
  deckContract: {
    minCards: 10,
    deckType: "full_78",
    allowReversals: true,
    requiresSignificator: false
  },
  slots: [
    {
      id: "kether",
      order: 1,
      role: "1. Kether (The Crown)",
      description: "Supreme spiritual will, highest source inspiration, divine origin.",
      layout: { x: 0.5, y: 0.08, rotation: 0, zIndex: 0 }
    },
    {
      id: "chokmah",
      order: 2,
      role: "2. Chokmah (Wisdom)",
      description: "Active creative spark, dynamic masculine impulse, pure initiative.",
      layout: { x: 0.75, y: 0.22, rotation: 0, zIndex: 0 }
    },
    {
      id: "binah",
      order: 3,
      role: "3. Binah (Understanding)",
      description: "Formative mother, structural boundary, receptive discipline.",
      layout: { x: 0.25, y: 0.22, rotation: 0, zIndex: 0 }
    },
    {
      id: "chesed",
      order: 4,
      role: "4. Chesed (Mercy)",
      description: "Benevolent expansion, vision, generosity, opportunity.",
      layout: { x: 0.75, y: 0.42, rotation: 0, zIndex: 0 }
    },
    {
      id: "geburah",
      order: 5,
      role: "5. Geburah (Severity)",
      description: "Critical judgment, necessary pruning, strength, overcoming trial.",
      layout: { x: 0.25, y: 0.42, rotation: 0, zIndex: 0 }
    },
    {
      id: "tiphareth",
      order: 6,
      role: "6. Tiphareth (Beauty & Harmony)",
      description: "Solar heart center, ego harmony, integration, conscious self.",
      layout: { x: 0.5, y: 0.52, rotation: 0, zIndex: 0 }
    },
    {
      id: "netzach",
      order: 7,
      role: "7. Netzach (Victory)",
      description: "Instinctual desires, emotions, passion, artistic creation.",
      layout: { x: 0.75, y: 0.68, rotation: 0, zIndex: 0 }
    },
    {
      id: "hod",
      order: 8,
      role: "8. Hod (Glory / Splendor)",
      description: "Intellectual logic, communication, systems, analysis.",
      layout: { x: 0.25, y: 0.68, rotation: 0, zIndex: 0 }
    },
    {
      id: "yesod",
      order: 9,
      role: "9. Yesod (Foundation)",
      description: "Astral matrix, subconscious beliefs, dreams, emotional bedrock.",
      layout: { x: 0.5, y: 0.8, rotation: 0, zIndex: 0 }
    },
    {
      id: "malkuth",
      order: 10,
      role: "10. Malkuth (The Kingdom)",
      description: "Physical embodiment, concrete material manifestation, daily realm.",
      layout: { x: 0.5, y: 0.94, rotation: 0, zIndex: 0 }
    }
  ],
  relations: [
    {
      source: "kether",
      target: "chokmah",
      type: "leads_to",
      label: "Lightning Flash 1->2"
    },
    {
      source: "chokmah",
      target: "binah",
      type: "mirrors",
      label: "Wisdom & Understanding Duality"
    },
    {
      source: "binah",
      target: "chesed",
      type: "leads_to",
      label: "Crossing the Abyss"
    },
    {
      source: "chesed",
      target: "geburah",
      type: "opposes",
      label: "Mercy vs Severity Balance"
    },
    {
      source: "chesed",
      target: "tiphareth",
      type: "leads_to",
      label: "Descent to Sun Center"
    },
    {
      source: "geburah",
      target: "tiphareth",
      type: "leads_to",
      label: "Descent to Sun Center"
    },
    {
      source: "tiphareth",
      target: "yesod",
      type: "leads_to",
      label: "Central Column Flow"
    },
    {
      source: "netzach",
      target: "hod",
      type: "opposes",
      label: "Emotion vs Intellect"
    },
    {
      source: "yesod",
      target: "malkuth",
      type: "culminates_in",
      label: "Subconscious to Physical Manifestation"
    }
  ]
};

export const CANONICAL_SPREADS: TarotSpreadDefinition[] = [
  SINGLE_CARD_SPREAD,
  PAST_PRESENT_FUTURE_SPREAD,
  DECISION_SPREAD,
  RELATIONSHIP_SPREAD,
  HORSESHOE_SPREAD,
  CELTIC_CROSS_SPREAD,
  TREE_OF_LIFE_SPREAD
];

export const CANONICAL_CATALOG: TarotSpreadCatalog = {
  schemaVersion: "2.0.0",
  metadata: {
    title: "Arcana Schema Standard Spread Catalog",
    description: "Curated canonical catalog of traditional and modern tarot spread definitions.",
    version: "2.0.0",
    maintainer: "Arcana Schema Working Group",
    repository: "https://github.com/arcana-schema/tarot-schema",
    updatedAt: "2026-09-26T12:00:00Z",
    license: "CC-BY-4.0"
  },
  spreads: CANONICAL_SPREADS
};
