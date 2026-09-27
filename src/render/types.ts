import type {
  TarotSpreadDefinition,
  TarotReading,
  TarotSpreadCatalog,
} from '../schema/types.ts';

export type OutputFormat = 'text' | 'markdown';

export interface RenderOptions {
  /** Output format. Default: "markdown". */
  format?: OutputFormat;
  /** BCP-47 locale tag. Default: "en". Only "en" ships in v1. */
  locale?: string;
  /** Include the spread's instructions section. Default: true. */
  includeInstructions?: boolean;
  /** Include the reading's free-text notes. Default: true. */
  includeNotes?: boolean;
  /** Include slot meanings alongside roles. Default: false. */
  includeSlotMeanings?: boolean;
  /** Include card orientation explicitly. Default: true. */
  includeOrientation?: boolean;
}

export interface CardDetails {
  name: string;
  suit?: string;
  number?: number;
}

export interface CardLookup {
  (cardId: string): CardDetails | undefined;
}

export interface Deck {
  name: string;
  cards: Record<string, CardDetails>;
}

// Aliases matching requirement names
export type SpreadDefinition = TarotSpreadDefinition;
export type Reading = TarotReading;
export type SpreadCatalog = TarotSpreadCatalog;
