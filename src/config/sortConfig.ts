import * as core from '@actions/core';

export type SortField = 'merged_at' | 'title' | 'author' | 'label';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

const VALID_SORT_FIELDS: SortField[] = ['merged_at', 'title', 'author', 'label'];
const VALID_SORT_ORDERS: SortOrder[] = ['asc', 'desc'];

export function parseSortField(value: string): SortField {
  const normalized = value.trim().toLowerCase() as SortField;
  if (!VALID_SORT_FIELDS.includes(normalized)) {
    throw new Error(
      `Invalid sort field: "${value}". Must be one of: ${VALID_SORT_FIELDS.join(', ')}`
    );
  }
  return normalized;
}

export function parseSortOrder(value: string): SortOrder {
  const normalized = value.trim().toLowerCase() as SortOrder;
  if (!VALID_SORT_ORDERS.includes(normalized)) {
    throw new Error(
      `Invalid sort order: "${value}". Must be one of: ${VALID_SORT_ORDERS.join(', ')}`
    );
  }
  return normalized;
}

export function loadSortConfig(): SortConfig {
  const fieldInput = core.getInput('sort_field');
  const orderInput = core.getInput('sort_order');

  const field: SortField = fieldInput
    ? parseSortField(fieldInput)
    : 'merged_at';

  const order: SortOrder = orderInput
    ? parseSortOrder(orderInput)
    : 'desc';

  return { field, order };
}
