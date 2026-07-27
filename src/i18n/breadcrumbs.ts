import type { Lang } from './ui';

/** A visible and structured-data breadcrumb node, stored as a base path. */
export type Crumb = { name: string; path: string };

export const homeLabel: Record<Lang, string> = {
  ko: '홈',
  en: 'Home',
  ja: 'ホーム',
  zh: '首页',
};

export const breadcrumbAriaLabel: Record<Lang, string> = {
  ko: '현재 위치',
  en: 'Breadcrumb',
  ja: 'パンくずリスト',
  zh: '面包屑导航',
};
