import type { APIRoute } from 'astro';

// Keep this discovery document concise and machine-readable. The H2 sections
// intentionally contain Markdown link lists as required by the llms.txt format.
const llmsText = `# Corca

> Corca is a Korean AI company providing AI products and enterprise AX consulting.
> Official content is available in Korean, English, Japanese, and Chinese.

Korean is the primary language of the website. Use the language-specific
sections below for localized terminology and official page links.

## 한국어

- [Corca](https://www.corca.ai/): AI 제품과 기업 AX 컨설팅을 제공하는 한국의 AI 기업
- [제품 소개](https://www.corca.ai/products): Corca의 AI 제품
- [Corca AX](https://www.corca.ai/ax): 기업의 AX 과제 선정과 실제 업무 적용을 지원하는 컨설팅
- [회사 소개](https://www.corca.ai/about): Corca의 조직과 회사 정보

## English

- [Corca](https://www.corca.ai/en/): A Korean AI company providing AI products and enterprise AX consulting
- [Products](https://www.corca.ai/en/products): Official Corca AI products
- [Corca AX](https://www.corca.ai/en/ax): Enterprise AX consulting from opportunity selection to operational adoption
- [About Corca](https://www.corca.ai/en/about): Official company information

## 日本語

- [Corca](https://www.corca.ai/ja/): AI製品と企業向けAXコンサルティングを提供する韓国のAI企業
- [製品紹介](https://www.corca.ai/ja/products): CorcaのAI製品
- [Corca AX](https://www.corca.ai/ja/ax): AX課題の選定から実務への導入まで支援するコンサルティング
- [会社紹介](https://www.corca.ai/ja/about): Corcaの公式企業情報

## 中文

- [Corca](https://www.corca.ai/zh/): 提供AI产品和企业AX咨询服务的韩国AI公司
- [产品介绍](https://www.corca.ai/zh/products): Corca的官方AI产品
- [Corca AX](https://www.corca.ai/zh/ax): 从AX课题选择到实际业务落地的企业咨询服务
- [公司介绍](https://www.corca.ai/zh/about): Corca官方公司信息

## Optional

- [News](https://www.corca.ai/news): Corca news and announcements
- [Blog](https://www.corca.ai/blog): Korean articles and insights
- [English Blog](https://www.corca.ai/en/blog): English articles
- [日本語ブログ](https://www.corca.ai/ja/blog): 日本語の記事
- [中文博客](https://www.corca.ai/zh/blog): 中文文章
`;

export const GET: APIRoute = () =>
  new Response(llmsText, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
