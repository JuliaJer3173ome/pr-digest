import { parseSortField, parseSortOrder, loadSortConfig, SortConfig } from '../sortConfig';

const setupInputs = (inputs: Record<string, string>) => {
  jest.resetModules();
  jest.mock('@actions/core', () => ({
    getInput: (name: string) => inputs[name] ?? '',
  }));
};

describe('parseSortField', () => {
  it('accepts valid sort fields', () => {
    expect(parseSortField('merged_at')).toBe('merged_at');
    expect(parseSortField('title')).toBe('title');
    expect(parseSortField('author')).toBe('author');
    expect(parseSortField('label')).toBe('label');
  });

  it('normalizes input to lowercase', () => {
    expect(parseSortField('  MERGED_AT  ')).toBe('merged_at');
    expect(parseSortField('Title')).toBe('title');
  });

  it('throws on invalid sort field', () => {
    expect(() => parseSortField('unknown')).toThrow(
      'Invalid sort field: "unknown"'
    );
    expect(() => parseSortField('')).toThrow();
  });
});

describe('parseSortOrder', () => {
  it('accepts valid sort orders', () => {
    expect(parseSortOrder('asc')).toBe('asc');
    expect(parseSortOrder('desc')).toBe('desc');
  });

  it('normalizes input to lowercase', () => {
    expect(parseSortOrder('ASC')).toBe('asc');
    expect(parseSortOrder('  DESC  ')).toBe('desc');
  });

  it('throws on invalid sort order', () => {
    expect(() => parseSortOrder('ascending')).toThrow(
      'Invalid sort order: "ascending"'
    );
  });
});

describe('loadSortConfig', () => {
  it('returns defaults when inputs are not provided', async () => {
    setupInputs({});
    const { loadSortConfig: load } = await import('../sortConfig');
    const config: SortConfig = load();
    expect(config.field).toBe('merged_at');
    expect(config.order).toBe('desc');
  });

  it('returns configured values when inputs are provided', async () => {
    setupInputs({ sort_field: 'title', sort_order: 'asc' });
    const { loadSortConfig: load } = await import('../sortConfig');
    const config: SortConfig = load();
    expect(config.field).toBe('title');
    expect(config.order).toBe('asc');
  });

  it('throws when sort_field is invalid', async () => {
    setupInputs({ sort_field: 'invalid_field' });
    const { loadSortConfig: load } = await import('../sortConfig');
    expect(() => load()).toThrow('Invalid sort field');
  });

  it('throws when sort_order is invalid', async () => {
    setupInputs({ sort_order: 'random' });
    const { loadSortConfig: load } = await import('../sortConfig');
    expect(() => load()).toThrow('Invalid sort order');
  });
});
