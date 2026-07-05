import type { ProductMeta } from '../types';
import logo from './assets/logo.png';

export default {
  slug: 'moonlight',
  order: 1,
  name: 'Moonlight',
  logo,
  app: { category: 'EducationalApplication', os: 'Web', appUrl: 'https://themoonlight.io/' },
  meta: {
    ko: {
      title: '문라이트(Moonlight) | 논문 읽기 AI·논문 요약 분석 도구',
      description:
        '어려운 논문, AI와 함께 읽으세요. 문라이트는 PDF 논문 읽기 흐름에 AI를 직접 적용해 생소한 개념의 실시간 설명, 대화형 요약·질의응답을 제공합니다. 논문 이해에 걸리는 시간은 줄이고 깊이는 더하는 연구자를 위한 AI 리서치 도구입니다.',
    },
    en: {
      title: 'Moonlight | AI for Reading Papers · Paper Summary & Analysis Tool',
      description:
        'Read difficult papers together with AI. Moonlight applies AI directly to the flow of reading PDF papers, giving real-time explanations of unfamiliar concepts plus conversational summaries and Q&A. It is an AI research tool for researchers that cuts the time it takes to understand a paper while deepening comprehension.',
    },
    ja: {
      title: 'ムーンライト（Moonlight）| 論文読解AI・論文要約分析ツール',
      description:
        '難しい論文を、AIと一緒に読みましょう。ムーンライトは、PDF論文を読む流れにAIを直接適用し、馴染みのない概念のリアルタイム説明や、対話型の要約・質問応答を提供します。論文理解にかかる時間を減らし、理解の深さを高める、研究者のためのAIリサーチツールです。',
    },
    zh: {
      title: 'Moonlight | 论文阅读AI·论文摘要分析工具',
      description:
        '艰深的论文，和AI一起读。Moonlight将AI直接应用于PDF论文的阅读流程，为陌生概念提供实时讲解，并支持对话式摘要与问答。这是一款面向研究者的AI研究工具，缩短理解论文所需的时间，同时加深理解。',
    },
  },
  blurb: {
    ko: '논문 읽기 흐름에 AI를 직접 적용한 연구자용 AI 리서치 도구. 실시간 설명과 대화형 요약으로 논문을 더 빠르고 깊이 있게 이해합니다.',
    en: 'An AI research tool for researchers that applies AI directly to reading papers — real-time explanations and conversational summaries help you understand papers faster and more deeply.',
    ja: '論文を読む流れにAIを直接適用した研究者向けAIリサーチツール。リアルタイム説明と対話型要約で、論文をより速く深く理解できます。',
    zh: '将AI直接应用于论文阅读流程的研究者AI工具。实时讲解与对话式摘要，助你更快、更深入地理解论文。',
  },
} satisfies ProductMeta;
