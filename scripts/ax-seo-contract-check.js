import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const lastModified = '2026-08-05';
const partnerBadgeAsset = 'OAI_PartnerNetwork_SelectPartner';

const locales = {
  ko: {
    path: 'ax/index.html',
    url: 'https://www.corca.ai/ax',
    title: 'Corca AX | AX 컨설팅 · 기업 AI 도입을 성과로 - OpenAI Select Partner',
    description:
      '우리 조직의 AX, 어디서부터 시작해야 할까요? 막연해도 괜찮습니다 — Corca AX가 이야기를 듣고 시작점을 함께 찾습니다. 2주 진단 + 6주 실전 전환으로 성과까지.',
    badgeAlt: 'OpenAI Select Partner 공식 배지 — AX 컨설팅 기업 코르카(Corca)',
  },
  en: {
    path: 'en/ax/index.html',
    url: 'https://www.corca.ai/en/ax',
    title: 'Corca AX | AI Transformation Consulting · OpenAI Select Partner',
    description:
      "Not sure where to start with AI? That's okay — we listen and find your starting point together. 2-week diagnosis + 6 weeks to production, through to results.",
    badgeAlt: 'OpenAI Select Partner official badge — Corca, AI transformation consulting',
  },
  ja: {
    path: 'ja/ax/index.html',
    url: 'https://www.corca.ai/ja/ax',
    title: 'Corca AX | AXコンサルティング · 企業のAI導入を成果に - OpenAI Select Partner',
    description:
      '自社のAX、どこから始めればいいのか？漠然としていても大丈夫です — Corca AXがお話を伺い、始めるべき一歩を共に見つけます。2週間の診断＋6週間の実運用移行で、成果まで。',
    badgeAlt: 'OpenAI Select Partner公式バッジ — AXコンサルティングのCorca（コルカ）',
  },
  zh: {
    path: 'zh/ax/index.html',
    url: 'https://www.corca.ai/zh/ax',
    title: 'Corca AX | AX咨询 · 让企业AI落地见效 - OpenAI Select Partner',
    description:
      '企业的AX，该从哪里开始？还不明确也没关系 — Corca AX倾听您的情况，与您一起找到起点。2周诊断 + 6周实战上线，直至见效。',
    badgeAlt: 'OpenAI Select Partner官方徽章 — AX咨询公司Corca',
  },
};

if (!existsSync(dist)) fail('missing dist/; run the production build first');

for (const [locale, expected] of Object.entries(locales)) {
  const file = join(dist, expected.path);
  assert(existsSync(file), `${locale}: missing dist/${expected.path}`);
  const html = readFileSync(file, 'utf8');

  assertEqual(textBetween(html, 'title'), expected.title, `${locale}: title`);
  assertEqual(
    metaContent(html, 'name', 'description'),
    expected.description,
    `${locale}: description`,
  );
  assertEqual(metaContent(html, 'property', 'og:title'), expected.title, `${locale}: og:title`);
  assertEqual(
    metaContent(html, 'property', 'og:description'),
    expected.description,
    `${locale}: og:description`,
  );
  assertEqual(
    metaContent(html, 'name', 'twitter:title'),
    expected.title,
    `${locale}: twitter:title`,
  );
  assertEqual(
    metaContent(html, 'name', 'twitter:description'),
    expected.description,
    `${locale}: twitter:description`,
  );

  const jsonLd = [
    ...html.matchAll(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ]
    .map((match) => JSON.parse(match[1]))
    .find((value) => Array.isArray(value?.['@graph']));
  const service = jsonLd?.['@graph'].find((node) => node?.['@type'] === 'Service');
  assert(service, `${locale}: missing Service JSON-LD`);
  assertEqual(service.description, expected.description, `${locale}: Service description`);

  const badges = [...html.matchAll(/<img\b[^>]*>/gi)]
    .map((match) => match[0])
    .filter((tag) => attributeValue(tag, 'src').includes(partnerBadgeAsset));
  assert(badges.length === 2, `${locale}: expected two partner badges, found ${badges.length}`);
  for (const badge of badges) {
    assertEqual(attributeValue(badge, 'alt'), expected.badgeAlt, `${locale}: partner badge alt`);
  }
}

const sitemap = readFileSync(join(dist, 'sitemap-pages.xml'), 'utf8');
for (const { url } of Object.values(locales)) {
  const entry = sitemap.match(
    new RegExp(`<url>\\s*<loc>${escapeRegExp(url)}<\\/loc>[\\s\\S]*?<\\/url>`),
  )?.[0];
  assert(entry, `sitemap: missing ${url}`);
  assert(entry.includes(`<lastmod>${lastModified}</lastmod>`), `${url}: stale sitemap lastmod`);
}

console.log('AX SEO contract passed for 4 locales, partner badges, JSON-LD and sitemap metadata.');

function metaContent(html, key, value) {
  const tag = [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map((match) => match[0])
    .find((candidate) => attributeValue(candidate, key) === value);
  return tag ? attributeValue(tag, 'content') : '';
}

function textBetween(html, tagName) {
  return decodeHtml(
    html.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, 'i'))?.[1] ?? '',
  ).trim();
}

function attributeValue(tag, name) {
  const value = tag.match(new RegExp(`\\b${name}=(['"])(.*?)\\1`, 'i'))?.[2] ?? '';
  return decodeHtml(value);
}

function decodeHtml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&#x27;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function assertEqual(actual, expected, label) {
  assert(actual === expected, `${label} mismatch\nexpected: ${expected}\nactual:   ${actual}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function fail(message) {
  throw new Error(`[ax-seo-contract] ${message}`);
}
