import type { SpreadCatalog, RenderOptions } from './types.ts';
import { getFormatter } from './formats.ts';
import { t } from './messages.ts';

export function renderCatalog(
  catalog: SpreadCatalog,
  options: RenderOptions = {}
): string {
  const format = options.format || 'markdown';
  const locale = options.locale || 'en';

  const fmt = getFormatter(format);
  const lines: string[] = [];

  // 1. Title
  lines.push(fmt.title(t('catalog.title', {}, locale)));
  lines.push('');

  // 2. Metadata line
  const getSlotCount = (s: any) => (Array.isArray(s.slots) ? s.slots.length : s.slotsCount || 0);
  const count = catalog.spreads.length;
  const totalSlots = catalog.spreads.reduce(
    (acc, s) => acc + getSlotCount(s),
    0
  );
  const meta = t(
    'catalog.metadata',
    {
      count,
      totalSlots,
    },
    locale
  );
  lines.push(meta);
  lines.push('');

  // 3. Spreads Table
  const headers = [
    t('catalog.col.id', {}, locale),
    t('catalog.col.name', {}, locale),
    t('catalog.col.difficulty', {}, locale),
    t('catalog.col.slots', {}, locale),
    t('catalog.col.layout', {}, locale),
  ];

  const rows = catalog.spreads.map((s) => [
    s.id,
    s.name,
    s.difficulty || 'standard',
    String(getSlotCount(s)),
    s.layoutType || 'custom',
  ]);

  lines.push(fmt.table(headers, rows));
  lines.push('');

  return lines.join('\n').trimEnd() + '\n';
}
