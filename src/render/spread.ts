import type { SpreadDefinition, RenderOptions } from './types.ts';
import { getFormatter } from './formats.ts';
import { t } from './messages.ts';

export function renderSpread(
  spread: SpreadDefinition,
  options: RenderOptions = {}
): string {
  const format = options.format || 'markdown';
  const locale = options.locale || 'en';
  const includeInstructions = options.includeInstructions !== false;
  const includeSlotMeanings = Boolean(options.includeSlotMeanings);

  const fmt = getFormatter(format);
  const lines: string[] = [];

  // 1. Title
  lines.push(fmt.title(spread.name));
  lines.push('');

  // 2. Metadata line
  const meta = t(
    'spread.metadata',
    {
      difficulty: spread.difficulty || 'standard',
      layout: spread.layoutType || 'custom',
      slots: spread.slots.length,
      minCards: spread.deckContract.minCards,
    },
    locale
  );
  lines.push(meta);
  lines.push('');

  // 3. Description / Summary
  const desc = spread.summary || spread.instructions?.preparation;
  if (desc) {
    lines.push(desc);
    lines.push('');
  }

  // 4. Positions (sorted by order)
  lines.push(fmt.section(t('spread.section.positions', {}, locale)));
  lines.push('');

  const sortedSlots = [...spread.slots].sort((a, b) => a.order - b.order);
  const slotMap = new Map(sortedSlots.map((s) => [s.id, s.role]));

  sortedSlots.forEach((slot) => {
    let slotText = fmt.bold(slot.role);
    if (includeSlotMeanings && slot.description) {
      slotText += ` — ${slot.description}`;
    }
    lines.push(fmt.numberedItem(slot.order, slotText));
  });
  lines.push('');

  // 5. Relations (declared array order)
  if (spread.relations && spread.relations.length > 0) {
    lines.push(fmt.section(t('spread.section.relations', {}, locale)));
    lines.push('');

    spread.relations.forEach((rel) => {
      const sourceName = slotMap.get(rel.source) || rel.source;
      const targetName = slotMap.get(rel.target) || rel.target;
      const relationKey = `relation.${rel.type}`;
      const sentence = t(
        relationKey,
        {
          source: sourceName,
          target: targetName,
          type: rel.type.replace('_', ' '),
        },
        locale
      );
      lines.push(fmt.bullet(sentence));
    });
    lines.push('');
  }

  // 6. Instructions (if present and requested)
  if (includeInstructions && spread.instructions) {
    const inst = spread.instructions;
    const hasAnyInst = inst.preparation || inst.shuffle || inst.drawing || inst.synthesis;
    if (hasAnyInst) {
      lines.push(fmt.section(t('spread.section.instructions', {}, locale)));
      lines.push('');

      if (inst.preparation) {
        lines.push(fmt.bullet(t('spread.instructions.preparation', { text: inst.preparation }, locale)));
      }
      if (inst.shuffle) {
        lines.push(fmt.bullet(t('spread.instructions.shuffle', { text: inst.shuffle }, locale)));
      }
      if (inst.drawing) {
        lines.push(fmt.bullet(t('spread.instructions.drawing', { text: inst.drawing }, locale)));
      }
      if (inst.synthesis) {
        lines.push(fmt.bullet(t('spread.instructions.synthesis', { text: inst.synthesis }, locale)));
      }
      lines.push('');
    }
  }

  return lines.join('\n').trimEnd() + '\n';
}
