import type { OutputFormat } from './types.ts';

export interface Formatter {
  title(text: string): string;
  section(text: string): string;
  bold(text: string): string;
  emphasis(text: string): string;
  bullet(text: string): string;
  numberedItem(number: number, text: string): string;
  quote(text: string): string;
  table(headers: string[], rows: string[][]): string;
}

export class MarkdownFormatter implements Formatter {
  title(text: string): string {
    return `# ${text}`;
  }

  section(text: string): string {
    return `## ${text}`;
  }

  bold(text: string): string {
    return `**${text}**`;
  }

  emphasis(text: string): string {
    return `*${text}*`;
  }

  bullet(text: string): string {
    return `- ${text}`;
  }

  numberedItem(number: number, text: string): string {
    return `${number}. ${text}`;
  }

  quote(text: string): string {
    return `> ${text}`;
  }

  table(headers: string[], rows: string[][]): string {
    const headerRow = `| ${headers.join(' | ')} |`;
    const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
    const dataRows = rows.map((r) => `| ${r.join(' | ')} |`);
    return [headerRow, separatorRow, ...dataRows].join('\n');
  }
}

export class TextFormatter implements Formatter {
  title(text: string): string {
    const underline = '='.repeat(text.length);
    return `${text}\n${underline}`;
  }

  section(text: string): string {
    const underline = '-'.repeat(text.length);
    return `${text}\n${underline}`;
  }

  bold(text: string): string {
    return text;
  }

  emphasis(text: string): string {
    return text;
  }

  bullet(text: string): string {
    return `* ${text}`;
  }

  numberedItem(number: number, text: string): string {
    return `${number}. ${text}`;
  }

  quote(text: string): string {
    return `"${text}"`;
  }

  table(headers: string[], rows: string[][]): string {
    // Calculate column widths for clean alignment
    const colWidths = headers.map((h, i) => {
      let maxLen = h.length;
      for (const row of rows) {
        if (row[i] && row[i].length > maxLen) {
          maxLen = row[i].length;
        }
      }
      return maxLen;
    });

    const formatRow = (cols: string[]) =>
      cols.map((c, i) => (c || '').padEnd(colWidths[i])).join('   ');

    const headerLine = formatRow(headers);
    const separatorLine = colWidths.map((w) => '-'.repeat(w)).join('   ');
    const dataLines = rows.map(formatRow);

    return [headerLine, separatorLine, ...dataLines].join('\n');
  }
}

export function getFormatter(format: OutputFormat = 'markdown'): Formatter {
  return format === 'text' ? new TextFormatter() : new MarkdownFormatter();
}
