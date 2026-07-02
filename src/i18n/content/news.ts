import type { Lang } from '../ui';

// Press coverage of Corca. Headlines are translated per locale (the original
// site left them Korean-only). `img` is a local asset id; `h` the source article.
export interface NewsItem {
  t: Record<Lang, string>;
  d: string;
  img: string;
  h: string;
}

export const newsItems: NewsItem[] = [
  {
    t: {
      ko: "[신SW상품대상 3월 추천작] 코르카 '문라이트'",
      en: "[New SW Product Award — March pick] Corca 'Moonlight'",
      ja: '[新SW商品大賞 3月の推薦作] コルカ「ムーンライト」',
    },
    d: '2026/3/25', img: '2fe9a6_12c2f61dcf9b44c2a730866ed9baba6f', h: 'https://www.etnews.com/20260325000126',
  },
  {
    t: {
      ko: "[人터뷰 : 정영현] OpenAI 서비스 파트너 코르카, 독보적 기술력과 'Thick…",
      en: "[Interview: Younghyun Jung] OpenAI service partner Corca, with unrivaled tech and a 'Thick…'",
      ja: '[インタビュー：チョン・ヨンヒョン] OpenAIサービスパートナー・コルカ、卓越した技術力と「Thick…」',
    },
    d: '2026/2/24', img: '2fe9a6_2887eab6e9794b5397d4766cda981d54', h: 'https://www.jk-daily.co.kr/news/articleView.html',
  },
  {
    t: {
      ko: '코르카, 오픈AI 서비스파트너 됐다',
      en: 'Corca becomes an OpenAI service partner',
      ja: 'コルカ、OpenAIのサービスパートナーに',
    },
    d: '2026/2/4', img: '2fe9a6_c3dc557b8cbb4faab054e51de6f13bec', h: 'https://www.etnews.com/20260204000212',
  },
  {
    t: {
      ko: '[창업과 기업가 정신] 코르카 정영현 대표, 강연 진행',
      en: '[Startups & Entrepreneurship] Corca CEO Younghyun Jung gives a lecture',
      ja: '[起業と起業家精神] コルカ チョン・ヨンヒョン代表が講演',
    },
    d: '2025/10/22', img: '2fe9a6_14432a4701b84341a10cd4120cc72619', h: 'http://www.sejongpr.ac.kr/news/today/sejong-special-lecture.do',
  },
  {
    t: {
      ko: '[서울과기대 x 동아닷컴 공동기획] 코르카 “연구자를 위한 AI 동료, 여기 있습니다”',
      en: '[SeoulTech × Donga.com] Corca: “An AI colleague for researchers is here”',
      ja: '[ソウル科技大 × 東亜ドットコム] コルカ「研究者のためのAI同僚がここに」',
    },
    d: '2025/08/12', img: '2fe9a6_4d8b4c5e9ca94dab92ef51543d1e8c51', h: 'https://www.donga.com/news/It/article/all/20250812/132174591/1',
  },
  {
    t: {
      ko: '코르카, AI 맥락 관리 솔루션 출시 예고',
      en: 'Corca previews an AI context-management solution',
      ja: 'コルカ、AIコンテキスト管理ソリューションの公開を予告',
    },
    d: '2025/06/11', img: '2fe9a6_42047e8c0ec34ec587a3a2eacf292bf3', h: 'https://platum.kr/archives/262869',
  },
  {
    t: {
      ko: '코르카, AI 에이전트로 사업 확장…연구·업무 혁신',
      en: 'Corca expands with AI agents — innovating research and work',
      ja: 'コルカ、AIエージェントで事業拡大…研究・業務を革新',
    },
    d: '2025/04/07', img: '2fe9a6_8bd115265a1a47acb702482f9d37d784', h: 'https://www.thebell.co.kr/free/content/ArticleView.asp',
  },
  {
    t: {
      ko: "코르카, 여성가족부 주관 '가족친화인증 기업' 선정",
      en: "Corca named a 'Family-Friendly Certified Company' by the Ministry of Gender Equality and Family",
      ja: 'コルカ、女性家族部主管の「家族親和認証企業」に選定',
    },
    d: '2024/12/30', img: '2fe9a6_26295dabd11049b5935ec91405370136', h: 'https://www.monthlypeople.com/news/articleView.html',
  },
  {
    t: {
      ko: "AI 기업 코르카, '문라이트'로 글로벌 시장 진출",
      en: "AI company Corca enters the global market with 'Moonlight'",
      ja: 'AI企業コルカ、「ムーンライト」でグローバル市場へ進出',
    },
    d: '2024/11/19', img: '2fe9a6_b01f3926803144f4945e449c953b4909', h: 'https://platum.kr/archives/244025',
  },
  {
    t: {
      ko: '[기업가정신 생태계 인터뷰] 코르카 정영현 대표',
      en: '[Entrepreneurship Ecosystem Interview] Corca CEO Younghyun Jung',
      ja: '[起業家精神エコシステム・インタビュー] コルカ チョン・ヨンヒョン代表',
    },
    d: '2024/10/14', img: '2fe9a6_dd93c2fe309b45ab940895298887526b', h: 'https://blog.naver.com/kef2010/223618145683',
  },
  {
    t: {
      ko: '[월간인물 인터뷰] 정영현 대표 "AI 윤리에 기반한 혁신적인 AI 기술력과 솔루션…"',
      en: '[Monthly People Interview] CEO Younghyun Jung: "Innovative AI built on AI ethics…"',
      ja: '[月刊人物インタビュー] チョン・ヨンヒョン代表「AI倫理に基づく革新的なAI技術とソリューション…」',
    },
    d: '2024/08/05', img: '2fe9a6_5c8f06eb71694ec0b5924d04d291831f', h: 'https://blog.naver.com/monthlypeople/223536840807',
  },
  {
    t: {
      ko: '2024년 주목할 스타트업: 아기유니콘50·예비유니콘15',
      en: 'Startups to watch in 2024: Baby Unicorn 50 & Pre-Unicorn 15',
      ja: '2024年注目のスタートアップ：ベビーユニコーン50・予備ユニコーン15',
    },
    d: '2024/06/26', img: '2fe9a6_c9b9e468f08148ebb4e600c042a98cb6', h: 'https://platum.kr/archives/230164',
  },
  {
    t: {
      ko: "'코르카, AI 추천시스템 대회에서 세계적 성과",
      en: 'Corca achieves world-class results at an AI recommender-systems competition',
      ja: 'コルカ、AI推薦システム大会で世界的な成果',
    },
    d: '2023/11/14', img: '2fe9a6_ae654c2fd42249418d1f0b9862164541', h: 'https://www.epnc.co.kr/news/articleView.html',
  },
  {
    t: {
      ko: 'AI 애드테크 스타트업 코르카, 70억 프리A 투자 유치',
      en: 'AI adtech startup Corca raises a ₩7 billion Pre-A round',
      ja: 'AIアドテックのスタートアップ・コルカ、70億ウォンのプレA投資を誘致',
    },
    d: '2023/03/14', img: '2fe9a6_5a7580bd3eb54ffdb541c1aa03b73515', h: 'https://www.asiae.co.kr/article/2023031410453610040',
  },
  {
    t: {
      ko: '아이지에이웍스, AI 연구 기업 코르카에 전략적 투자',
      en: 'IGAWorks makes a strategic investment in AI research firm Corca',
      ja: 'IGAWorks、AI研究企業コルカへ戦略的投資',
    },
    d: '2022/12/06', img: '2fe9a6_d3be1e13aaf54f738b2f7eae6960f14c', h: 'https://www.hankyung.com/article/2022120678677',
  },
  {
    t: {
      ko: "리테일미디어 플랫폼 개발사 '코르카' 팁스(TIPS) 선정",
      en: "Retail-media platform developer 'Corca' selected for TIPS",
      ja: 'リテールメディアプラットフォーム開発企業「コルカ」がTIPSに選定',
    },
    d: '2022/11/01', img: '2fe9a6_8cf35d12791444b39245716a2e02f15b', h: 'https://www.mk.co.kr/news/business/10513362',
  },
  {
    t: {
      ko: 'KT넥스알-코르카, AI 빅데이터 컨설팅 서비스 업무협약',
      en: 'KT NexR × Corca sign an AI big-data consulting service agreement',
      ja: 'KT NexR・コルカ、AIビッグデータコンサルティングサービスで業務提携',
    },
    d: '2022/08/11', img: '2fe9a6_548b9bae87a44e7f895ab56bdecfdb62', h: 'https://zdnet.co.kr/view/',
  },
];
