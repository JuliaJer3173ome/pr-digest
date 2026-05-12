import { PRAgeLimitConfig } from '../config/prAgeConfig';

export interface AgeablePR {
  number: number;
  merged_at?: string | null;
  created_at: string;
}

export function getPRAgeInDays(pr: AgeablePR, referenceDate: Date = new Date()): number {
  const base = pr.merged_at ? new Date(pr.merged_at) : new Date(pr.created_at);
  const diffMs = referenceDate.getTime() - base.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function meetsMaxAge<T extends AgeablePR>(
  pr: T,
  maxAgeDays: number,
  referenceDate?: Date
): boolean {
  return getPRAgeInDays(pr, referenceDate) <= maxAgeDays;
}

export function meetsMinAge<T extends AgeablePR>(
  pr: T,
  minAgeDays: number,
  referenceDate?: Date
): boolean {
  return getPRAgeInDays(pr, referenceDate) >= minAgeDays;
}

export function filterByAge<T extends AgeablePR>(
  prs: T[],
  config: PRAgeLimitConfig,
  referenceDate: Date = new Date()
): { filtered: T[]; warnings: string[] } {
  if (!config.enabled) {
    return { filtered: prs, warnings: [] };
  }

  const warnings: string[] = [];
  const filtered = prs.filter((pr) => {
    const ageDays = getPRAgeInDays(pr, referenceDate);

    if (config.maxAgeDays !== null && ageDays > config.maxAgeDays) {
      return false;
    }
    if (config.minAgeDays !== null && ageDays < config.minAgeDays) {
      return false;
    }
    if (config.warnOldPRs && config.maxAgeDays !== null && ageDays > config.maxAgeDays * 0.8) {
      warnings.push(`PR #${pr.number} is ${ageDays} days old and approaching the age limit.`);
    }
    return true;
  });

  return { filtered, warnings };
}
