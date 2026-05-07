import * as core from '@actions/core';

export interface AuthorConfig {
  includeAuthors: string[];
  excludeAuthors: string[];
  showAuthorAvatar: boolean;
  showAuthorLink: boolean;
}

export function parseAuthorList(input: string): string[] {
  return input
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);
}

export function parseBooleanFlag(input: string, defaultValue: boolean): boolean {
  const trimmed = input.trim().toLowerCase();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  return defaultValue;
}

export function loadAuthorConfig(): AuthorConfig {
  const includeAuthors = parseAuthorList(
    core.getInput('include_authors') || ''
  );
  const excludeAuthors = parseAuthorList(
    core.getInput('exclude_authors') || ''
  );
  const showAuthorAvatar = parseBooleanFlag(
    core.getInput('show_author_avatar') || '',
    false
  );
  const showAuthorLink = parseBooleanFlag(
    core.getInput('show_author_link') || '',
    true
  );

  return {
    includeAuthors,
    excludeAuthors,
    showAuthorAvatar,
    showAuthorLink,
  };
}
