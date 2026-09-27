/**
 * Arcana Schema - Tarot Open Source JSON Specification
 * TypeScript Type Definitions generated from JSON Schemas v2.0.0
 * Specification: https://arcanaschema.org/schemas/v2/
 */

export type LayoutType =
  | 'linear'
  | 'cross'
  | 'circular'
  | 'symbolic'
  | 'triangular'
  | 'custom';

export type DifficultyLevel =
  | 'beginner'
  | 'easy'
  | 'intermediate'
  | 'advanced'
  | 'expert';

export type DeckType =
  | 'full_78'
  | 'major_arcana_only'
  | 'minor_arcana_only'
  | 'court_only'
  | 'lenormand_36'
  | 'oracle_any';

export type RelationType =
  | 'leads_to'
  | 'crosses'
  | 'grounds'
  | 'crowns'
  | 'mirrors'
  | 'opposes'
  | 'clarifies'
  | 'culminates_in'
  | 'adjacent_to';

export type CardOrientation = 'upright' | 'reversed';

export interface LayoutCoordinate {
  x: number;
  y: number;
  rotation?: number;
  zIndex?: number;
}

export interface CardConstraint {
  allowedArcana?: 'any' | 'major_only' | 'minor_only' | 'court_only';
  allowedSuits?: ('wands' | 'cups' | 'swords' | 'pentacles')[];
  fixedCard?: string;
}

export interface Slot {
  id: string;
  order: number;
  role: string;
  description?: string;
  keywords?: string[];
  layout?: LayoutCoordinate;
  cardConstraint?: CardConstraint;
}

export interface Relation {
  source: string;
  target: string;
  type: RelationType;
  label?: string;
  weight?: number;
}

export interface DeckContract {
  minCards: number;
  maxCards?: number;
  deckType?: DeckType;
  allowReversals?: boolean;
  requiresSignificator?: boolean;
}

export interface Instructions {
  preparation?: string;
  shuffle?: string;
  drawing?: string;
  synthesis?: string;
}

export interface ReadingVariant {
  id: string;
  name: string;
  description?: string;
  slotOverrides: {
    slotId: string;
    role: string;
    description?: string;
  }[];
}

export interface ElementalDignityRule {
  enabled?: boolean;
  mode?: 'golden_dawn' | 'triplicity' | 'neutral';
  notes?: string;
}

export interface TarotSpreadDefinition {
  '@context'?: 'https://schema.org' | 'https://arcanaschema.org/contexts/tarot.jsonld';
  '@type'?: 'DefinedTermSet';
  schemaVersion: '2.0.0';
  id: string;
  name: string;
  summary?: string;
  layoutType?: LayoutType;
  difficulty?: DifficultyLevel;
  author?: string;
  license?: string;
  tags?: string[];
  instructions?: Instructions;
  deckContract: DeckContract;
  readingVariants?: ReadingVariant[];
  slots: Slot[];
  hasDefinedTerm?: Slot[];
  relations: Relation[];
  elementalDignity?: ElementalDignityRule;
}

export interface DrawnCard {
  slotId: string;
  cardId: string;
  orientation: CardOrientation;
  notes?: string;
}

export interface TarotReading {
  '@context'?: 'https://schema.org' | 'https://arcanaschema.org/contexts/tarot.jsonld';
  '@type'?: 'Event' | 'Action';
  schemaVersion: '1.0.0';
  readingId: string;
  spreadId: string;
  variantId?: string;
  question?: string;
  querent?: {
    name?: string;
    significator?: string;
  };
  reader?: {
    name?: string;
    system?: string;
  };
  drawnAt: string;
  startDate?: string;
  deck?: {
    name?: string;
    publisher?: string;
    reversals?: boolean;
  };
  cards: DrawnCard[];
  interpretation?: {
    summary?: string;
    elementalBalance?: {
      fire?: number;
      water?: number;
      air?: number;
      earth?: number;
      dominant?: string;
    };
    synthesis?: string;
    actionableAdvice?: string;
  };
  notes?: string;
  tags?: string[];
}

export interface CatalogMetadata {
  title: string;
  description?: string;
  version: string;
  maintainer?: string;
  repository?: string;
  updatedAt: string;
  license?: string;
}

export interface SpreadCatalogItem {
  id: string;
  name: string;
  layoutType: LayoutType;
  difficulty: DifficultyLevel;
  slotCount: number;
  minCards: number;
  tags?: string[];
  file: string;
}

export interface TarotSpreadCatalog {
  schemaVersion: '2.0.0';
  metadata: CatalogMetadata;
  spreads: TarotSpreadDefinition[];
}

export interface ValidationErrorItem {
  type: 'schema' | 'cross-field';
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
  instancePath?: string;
  schemaPath?: string;
  keyword?: string;
  params?: Record<string, unknown>;
}

export interface ValidationReport {
  valid: boolean;
  errors: ValidationErrorItem[];
  warnings: ValidationErrorItem[];
  checkedRulesCount: number;
}
