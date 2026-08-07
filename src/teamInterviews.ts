import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Lang } from './i18n/ui';

export interface TeamInterview {
  slug: string;
  title: string;
  description: string;
  date: string;
  cover: string;
  coverAlt?: string;
  source: 'team-interview';
}

const blogIndexPaths: Record<Lang, string> = {
  ko: 'public/blog/index.json',
  en: 'public/en/blog/index.json',
  ja: 'public/ja/blog/index.json',
  zh: 'public/zh/blog/index.json',
};

function isTeamInterview(value: unknown): value is TeamInterview {
  if (!value || typeof value !== 'object') return false;
  const post = value as Record<string, unknown>;
  return (
    post.source === 'team-interview' &&
    ['slug', 'title', 'description', 'date', 'cover'].every(
      (key) => typeof post[key] === 'string' && post[key].trim().length > 0,
    )
  );
}

// The Notion publisher regenerates this index whenever a team-interview row is
// created, updated, or deleted. This page surface intentionally consumes only
// entries carrying that database-owned source marker.
export async function getTeamInterviews(lang: Lang): Promise<TeamInterview[]> {
  const value: unknown = JSON.parse(
    await readFile(resolve(process.cwd(), blogIndexPaths[lang]), 'utf8'),
  );
  if (!Array.isArray(value)) return [];

  return value
    .filter(isTeamInterview)
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, 'ko'));
}
