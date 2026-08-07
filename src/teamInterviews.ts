import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Lang } from './i18n/ui';

export interface TeamInterview {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  date: string;
  cover: string;
  coverAlt?: string;
  source: 'team-interview';
}

interface TeamInterviewPost extends Omit<TeamInterview, 'excerpt'> {
  excerpt?: string;
  searchText?: string;
}

const blogIndexPaths: Record<Lang, string> = {
  ko: 'public/blog/index.json',
  en: 'public/en/blog/index.json',
  ja: 'public/ja/blog/index.json',
  zh: 'public/zh/blog/index.json',
};

function isTeamInterview(value: unknown): value is TeamInterviewPost {
  if (!value || typeof value !== 'object') return false;
  const post = value as Record<string, unknown>;
  return (
    post.source === 'team-interview' &&
    ['slug', 'title', 'description', 'date', 'cover'].every(
      (key) => typeof post[key] === 'string' && post[key].trim().length > 0,
    )
  );
}

function interviewExcerpt(searchText: string | undefined, fallback: string) {
  const text = String(searchText || '')
    .replace(/\s+/g, ' ')
    .trim();
  const questionMarker = /(?:^|\s)(?:Q\s*\d*\s*[.．:：)）]|질문\s*[:：]|問\s*[:：]|问\s*[:：])/u;
  const firstQuestion = text.search(questionMarker);
  const body = firstQuestion >= 0 ? text.slice(firstQuestion) : text;
  const sentences = body
    .split(/(?<=[.!?…。！？])\s+/u)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 35 && sentence.length <= 240)
    .filter((sentence) => !/^https?:\/\/\S+$/i.test(sentence))
    .filter(
      (sentence) =>
        !/^(?:Q\s*\d*\s*[.．:：)）]|질문\s*[:：]|問\s*[:：]|问\s*[:：])/u.test(sentence),
    );
  const answers = sentences.filter((sentence) => !/[?？]$/.test(sentence));

  return (
    answers[Math.floor(answers.length / 2)] ||
    sentences[Math.floor(sentences.length / 2)] ||
    fallback
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
    .map((post) => ({
      ...post,
      excerpt: post.excerpt?.trim() || interviewExcerpt(post.searchText, post.description),
    }))
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, 'ko'));
}
