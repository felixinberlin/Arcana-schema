export const MESSAGES: Record<string, Record<string, string>> = {
  en: {
    // Spread strings
    'spread.metadata': 'Difficulty: {difficulty} | Layout: {layout} | Slots: {slots} | Min Deck: {minCards} cards',
    'spread.section.positions': 'Positions',
    'spread.section.relations': 'Card Relationships',
    'spread.section.instructions': 'Instructions',
    'spread.instructions.preparation': 'Preparation: {text}',
    'spread.instructions.shuffle': 'Shuffle: {text}',
    'spread.instructions.drawing': 'Drawing: {text}',
    'spread.instructions.synthesis': 'Synthesis: {text}',

    // Relations
    'relation.leads_to': 'The {source} leads to the {target}.',
    'relation.crosses': 'The {source} crosses the {target}.',
    'relation.grounds': 'The {source} grounds the {target}.',
    'relation.crowns': 'The {source} crowns the {target}.',
    'relation.mirrors': 'The {source} mirrors the {target}.',
    'relation.opposes': 'The {source} opposes the {target}.',
    'relation.clarifies': 'The {source} clarifies the {target}.',
    'relation.culminates_in': 'The {source} culminates in the {target}.',
    'relation.adjacent_to': 'The {source} is adjacent to the {target}.',
    'relation.generic': 'The {source} relates to the {target} ({type}).',

    // Reading strings
    'reading.metadata': 'Drawn: {date} | Deck: {deck}',
    'reading.metadata.participants': 'Querent: {querent} | Reader: {reader}',
    'reading.question': 'Question: "{question}"',
    'reading.section.draw': 'Cards Drawn',
    'reading.section.interpretation': 'Interpretation',
    'reading.section.notes': 'Notes',
    'reading.orientation.upright': 'Upright',
    'reading.orientation.reversed': 'Reversed',

    // Catalog strings
    'catalog.title': 'Spread Catalog',
    'catalog.metadata': 'Available Spreads: {count} | Total Slots: {totalSlots}',
    'catalog.col.id': 'ID',
    'catalog.col.name': 'Name',
    'catalog.col.difficulty': 'Difficulty',
    'catalog.col.slots': 'Slots',
    'catalog.col.layout': 'Layout',
  },
};

/**
 * Translate a message key with optional parameters and fallback to English.
 */
export function t(
  key: string,
  params?: Record<string, string | number | undefined>,
  locale = 'en'
): string {
  const lang = MESSAGES[locale] || MESSAGES.en;
  let text = lang[key] || MESSAGES.en[key] || key;

  if (params) {
    for (const [paramKey, value] of Object.entries(params)) {
      if (value !== undefined) {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
      }
    }
  }

  return text;
}
