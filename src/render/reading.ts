import type {
  Reading,
  SpreadDefinition,
  Deck,
  CardLookup,
  RenderOptions,
} from './types.ts';
import { getFormatter } from './formats.ts';
import { t } from './messages.ts';

function createCardLookup(deckOrLookup: Deck | CardLookup): CardLookup {
  if (typeof deckOrLookup === 'function') {
    return deckOrLookup;
  }
  if (deckOrLookup && typeof deckOrLookup.cards === 'object') {
    return (cardId: string) => deckOrLookup.cards[cardId];
  }
  return () => undefined;
}

function formatDrawnDate(dateStr: string, locale = 'en'): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const formatter = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
      timeZoneName: 'short',
    });
    return formatter.format(d);
  } catch {
    return dateStr;
  }
}

export function renderReading(
  reading: Reading,
  spread: SpreadDefinition,
  deck: Deck | CardLookup,
  options: RenderOptions = {}
): string {
  const format = options.format || 'markdown';
  const locale = options.locale || 'en';
  const includeNotes = options.includeNotes !== false;
  const includeSlotMeanings = Boolean(options.includeSlotMeanings);
  const includeOrientation = options.includeOrientation !== false;

  const fmt = getFormatter(format);
  const lookup = createCardLookup(deck);
  const deckName = typeof deck === 'object' && deck?.name ? deck.name : reading.deck?.name || 'Tarot Deck';

  const lines: string[] = [];

  // 1. Title: spread name
  lines.push(fmt.title(spread.name));
  lines.push('');

  // 2. Metadata line: formatted date & deck name
  const formattedDate = formatDrawnDate(reading.drawnAt || reading.startDate || '', locale);
  const meta = t(
    'reading.metadata',
    {
      date: formattedDate,
      deck: deckName,
    },
    locale
  );
  lines.push(meta);
  lines.push('');

  // 3. Question (if present)
  if (reading.question) {
    lines.push(t('reading.question', { question: reading.question }, locale));
    lines.push('');
  }

  // 4. Draw section
  lines.push(fmt.section(t('reading.section.draw', {}, locale)));
  lines.push('');

  // Sort slots by order
  const sortedSlots = [...spread.slots].sort((a, b) => a.order - b.order);
  const cardBySlot = new Map(reading.cards.map((c) => [c.slotId, c]));

  sortedSlots.forEach((slot) => {
    const drawn = cardBySlot.get(slot.id);
    let cardDisplayName = `<${drawn?.cardId || 'unknown'}>`;

    if (drawn?.cardId) {
      const cardDetails = lookup(drawn.cardId);
      if (cardDetails && cardDetails.name) {
        cardDisplayName = cardDetails.name;
      }
    }

    // Role prefix
    const rolePrefix = format === 'markdown' ? `**${slot.role}:**` : `${slot.role}:`;

    // Orientation suffix
    let orientationPart = '';
    if (includeOrientation && drawn?.orientation) {
      const orientationLabel = t(`reading.orientation.${drawn.orientation}`, {}, locale);
      orientationPart = ` (${orientationLabel})`;
    }

    let line = `${rolePrefix} ${cardDisplayName}${orientationPart}`;

    if (includeSlotMeanings && slot.description) {
      line += ` — ${slot.description}`;
    }

    lines.push(fmt.bullet(line));
  });
  lines.push('');

  // 5. Interpretation (if present)
  if (reading.interpretation?.summary) {
    lines.push(fmt.section(t('reading.section.interpretation', {}, locale)));
    lines.push('');
    lines.push(reading.interpretation.summary);
    lines.push('');
  }

  // 6. Notes (if present and requested)
  if (includeNotes && reading.notes) {
    lines.push(fmt.section(t('reading.section.notes', {}, locale)));
    lines.push('');
    lines.push(reading.notes);
    lines.push('');
  }

  return lines.join('\n').trimEnd() + '\n';
}
