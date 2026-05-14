import {
  stripHtmlTags,
  stripMarkdownSyntax,
  extractFirstParagraph,
  truncateByMode,
  formatBody,
  annotatePRsWithBody,
} from '../formatPRBody';
import type { PRBodyConfig } from '../../config/prBodyConfig';

const baseConfig: PRBodyConfig = {
  enabled: true,
  truncateMode: 'summary',
  maxLength: 50,
  stripHtml: false,
  stripMarkdown: false,
};

describe('stripHtmlTags', () => {
  it('removes html tags from text', () => {
    expect(stripHtmlTags('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
  });

  it('returns plain text unchanged', () => {
    expect(stripHtmlTags('plain text')).toBe('plain text');
  });
});

describe('stripMarkdownSyntax', () => {
  it('removes markdown links', () => {
    expect(stripMarkdownSyntax('[click here](https://example.com)')).toBe('click here');
  });

  it('removes bold syntax', () => {
    expect(stripMarkdownSyntax('**bold text**')).toBe('bold text');
  });

  it('removes heading hashes', () => {
    expect(stripMarkdownSyntax('## Section Title')).toBe('Section Title');
  });
});

describe('extractFirstParagraph', () => {
  it('returns first paragraph of multi-paragraph text', () => {
    const text = 'First paragraph.\n\nSecond paragraph.';
    expect(extractFirstParagraph(text)).toBe('First paragraph.');
  });

  it('returns full text when single paragraph', () => {
    expect(extractFirstParagraph('Only one paragraph')).toBe('Only one paragraph');
  });
});

describe('truncateByMode', () => {
  it('truncates with ellipsis when text exceeds maxLength in summary mode', () => {
    const result = truncateByMode('A very long string that exceeds the limit', 'summary', 20);
    expect(result).toMatch(/…$/);
    expect(result.length).toBeLessThanOrEqual(21);
  });

  it('returns text unchanged in none mode', () => {
    const text = 'Some text that is quite long and should not be truncated at all';
    expect(truncateByMode(text, 'none', 10)).toBe(text);
  });

  it('extracts first paragraph in first-paragraph mode', () => {
    expect(truncateByMode('Para one.\n\nPara two.', 'first-paragraph', 999)).toBe('Para one.');
  });
});

describe('formatBody', () => {
  it('strips html when configured', () => {
    const cfg = { ...baseConfig, stripHtml: true, maxLength: 1000, truncateMode: 'none' as const };
    expect(formatBody('<b>Bold</b> text', cfg)).toBe('Bold text');
  });

  it('truncates body to maxLength', () => {
    const cfg = { ...baseConfig, maxLength: 10, truncateMode: 'summary' as const };
    const result = formatBody('A long body text', cfg);
    expect(result.endsWith('…')).toBe(true);
  });
});

describe('annotatePRsWithBody', () => {
  it('adds formattedBody to each PR when enabled', () => {
    const prs = [{ number: 1, body: 'Short body' }];
    const result = annotatePRsWithBody(prs, { ...baseConfig, maxLength: 1000, truncateMode: 'none' });
    expect(result[0].formattedBody).toBe('Short body');
  });

  it('returns prs unchanged when disabled', () => {
    const prs = [{ number: 1, body: 'Body text' }];
    const result = annotatePRsWithBody(prs, { ...baseConfig, enabled: false });
    expect((result[0] as any).formattedBody).toBeUndefined();
  });

  it('sets formattedBody to undefined for PRs without body', () => {
    const prs = [{ number: 2, body: null }];
    const result = annotatePRsWithBody(prs, baseConfig);
    expect(result[0].formattedBody).toBeUndefined();
  });
});
