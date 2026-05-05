import { PullRequest } from '../github/fetchMergedPRs';

export type SortField = 'mergedAt' | 'title' | 'additions' | 'comments';
export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: SortField;
  order: SortOrder;
}

const DEFAULT_SORT: SortOptions = {
  field: 'mergedAt',
  order: 'desc',
};

export function comparePRs(
  a: PullRequest,
  b: PullRequest,
  options: SortOptions = DEFAULT_SORT
): number {
  const { field, order } = options;
  let result = 0;

  switch (field) {
    case 'mergedAt': {
      const dateA = a.mergedAt ? new Date(a.mergedAt).getTime() : 0;
      const dateB = b.mergedAt ? new Date(b.mergedAt).getTime() : 0;
      result = dateA - dateB;
      break;
    }
    case 'title': {
      result = a.title.localeCompare(b.title);
      break;
    }
    case 'additions': {
      result = (a.additions ?? 0) - (b.additions ?? 0);
      break;
    }
    case 'comments': {
      result = (a.comments ?? 0) - (b.comments ?? 0);
      break;
    }
    default:
      result = 0;
  }

  return order === 'asc' ? result : -result;
}

export function sortPRs(
  prs: PullRequest[],
  options: SortOptions = DEFAULT_SORT
): PullRequest[] {
  return [...prs].sort((a, b) => comparePRs(a, b, options));
}

export function parseSortOptions(
  field: string | undefined,
  order: string | undefined
): SortOptions {
  const validFields: SortField[] = ['mergedAt', 'title', 'additions', 'comments'];
  const validOrders: SortOrder[] = ['asc', 'desc'];

  const resolvedField: SortField =
    field && validFields.includes(field as SortField)
      ? (field as SortField)
      : DEFAULT_SORT.field;

  const resolvedOrder: SortOrder =
    order && validOrders.includes(order as SortOrder)
      ? (order as SortOrder)
      : DEFAULT_SORT.order;

  return { field: resolvedField, order: resolvedOrder };
}
