import type { APIRoute } from 'astro';

// A single, canonical discovery document gives AI agents a short global
// description first, followed by official links and terminology per locale.
const llmsText = `# Corca

> Corca is a Korean AI company providing AI products and enterprise AX consulting.
> Official content is available in Korean, English, Japanese, and Chinese.

Korean is the primary language of the website. Use the language-specific
sections below for localized terminology and official page links.

## 한국어
- [Corca](https://www.borca.ai/): AI 제품과 기업 AX 컨설팅을 제공하는 한국의 AI 기업
- [제품 소개](https://www.borca.ai/products): Corca의 AI 제품
- [Corca AX](https://www.borca.ai/ax): AX 과제 선정부터 실제 업무 적용까지 지원하는 기업 컨설팅
- [회사 소개](https://www.borca.ai/about): Corca의 공식 회사 정보

## English
- [Corca](https://www.borca.ai/en/): A Korean AI company providing AI products and enterprise AX consulting
- [Products](https://www.borca.ai/en/products): Official Corca AI products
- [Corca AX](https://www.borca.ai/en/ax): Enterprise AX consulting from opportunity selection to operational adoption
- [About Corca](https://www.borca.ai/en/about): Official company information

## 日本語
- [Corca](https://www.borca.ai/ja/): AI製品と企業向けAXコンサルティングを提供する韓国のAI企業
- [製品紹介](https://www.borca.ai/ja/products): Corcaの公式AI製品
- [Corca AX](https://www.borca.ai/ja/ax): AX課題の選定から実務への導入まで支援するコンサルティング
- [会社紹介](https://www.borca.ai/ja/about): Corcaの公式企業情報

## 中文
- [Corca](https://www.borca.ai/zh/): 提供AI产品和企业AX咨询服务的韩国AI公司
- [产品介绍](https://www.borca.ai/zh/products): Corca的官方AI产品
- [Corca AX](https://www.borca.ai/zh/ax): 从AX课题选择到实际业务落地的企业咨询服务
- [公司介绍](https://www.borca.ai/zh/about): Corca官方公司信息

## Optional
- [News](https://www.borca.ai/news): Corca news and announcements
- [Blog](https://www.borca.ai/blog): 한국어 기사와 인사이트
- [English Blog](https://www.borca.ai/en/blog): English articles and insights
- [日本語ブログ](https://www.borca.ai/ja/blog): 日本語の記事とインサイト
- [中文博客](https://www.borca.ai/zh/blog): 中文文章和行业观点
`;

export const GET: APIRoute = () =>
  new Response(llmsText, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
