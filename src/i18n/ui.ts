// Locale configuration + translation dictionaries for the Corca site.
// ko (default, "/") mirrors the original; en ("/en"), ja ("/ja") and
// zh ("/zh", Simplified Chinese) are prefixed.

export const locales = ['ko', 'en', 'ja', 'zh'] as const;
export type Lang = (typeof locales)[number];

export const defaultLang: Lang = 'ko';

export const languageNames: Record<Lang, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  zh: '中文',
};

/** Short label shown in the language switcher. */
export const languageShort: Record<Lang, string> = {
  ko: 'KO',
  en: 'EN',
  ja: 'JA',
  zh: 'ZH',
};

/** BCP-47 tags used for <html lang>, hreflang and OG locale. */
export const localeTag: Record<Lang, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN',
};

export const ogLocale: Record<Lang, string> = {
  ko: 'ko_KR',
  en: 'en_US',
  ja: 'ja_JP',
  zh: 'zh_CN',
};

// External destinations (shared across locales).
export const externalLinks = {
  careers: 'https://corca.team/recruit',
  blog: 'https://medium.com/corca',
  // The home "기사 보기" buttons link out to the original press articles.
  recsysArticle: 'https://www.epnc.co.kr/news/articleView.html?idxno=238466',
  babyUnicornArticle: 'https://news.mt.co.kr/mtview.php?no=2024062609442912371',
};

export const contact = {
  email: 'contact@corca.ai',
  tel: '02-6925-6978',
};

type Nav = {
  products: string;
  about: string;
  careers: string;
  blog: string;
  vision: string;
  howWeWork: string;
  news: string;
  colleagues: string;
};

type FooterT = {
  address: string;
  tel: string;
  rights: string;
};

type Home = {
  metaTitle: string;
  metaDescription: string;
  heroTitle: string; // may contain a single \n for the line break
  heroSubtitle: string;
  readMore: string;
  readArticle: string;
  moonlightHeading: string;
  moonlightBody: string;
  traceHeading: string;
  traceBody: string;
  babyUnicornBadge: string;
  babyUnicornHeading: string;
  recsysHeading: string;
  recsysCaptionTop: string;
  recsysEvent: string;
  recsysRank: string;
  partnersHeading: string;
  closingHeading: string;
  closingSubtitle: string;
};

type Dict = {
  nav: Nav;
  footer: FooterT;
  home: Home;
  langLabel: string;
};

export const ui: Record<Lang, Dict> = {
  ko: {
    langLabel: '언어 선택',
    nav: {
      products: '제품 소개',
      about: '회사 소개',
      careers: '채용',
      blog: '블로그',
      vision: '비전과 미션',
      howWeWork: '이렇게 일해요',
      news: '뉴스 기사',
      colleagues: '코르카 사람들',
    },
    footer: {
      address: '서울특별시 강남구 테헤란로77길 11-8, 6층 주식회사 코르카',
      tel: 'Tel: 02-6925-6978',
      rights: '© 2026 Corca, Inc.',
    },
    home: {
      metaTitle: '코르카(Corca) | 기업 AI 전환(AX) 컨설팅·AI 교육·AI 솔루션 전문 기업',
      metaDescription:
        '한국 최초 OpenAI 공식 서비스 파트너 코르카. 신한은행·토스·GS그룹 등 20여 개 조직, 1,000명 이상이 경험한 AI 교육과 AX 가속화 컨설팅으로 조직의 일하는 방식을 실제로 바꿉니다. 2024 아기유니콘, ACM RecSys 세계 7위 기술력으로 검증된 AI 전환 파트너.',
      heroTitle: '코르카는 AI 기술로\n세상을 바꾸고 있습니다.',
      heroSubtitle: 'AI 기술로 새로운 가능성을 열고 세상의 변화를 이끌어 갑니다.',
      readMore: '자세히 보기',
      readArticle: '기사 보기',
      moonlightHeading: '논문을 더 빠르고 쉽게 이해하기',
      moonlightBody:
        '문라이트는 AI 기술을 학술 논문을 읽는 흐름에 직접적으로 적용하여 생소하거나 어려운 내용에 대한 실시간 설명을 제공하며, 대화형 AI와 함께 개념을 구체화하거나 내용을 요약하여 연구에 필요한 PDF 문서를 이해하는 데 걸리는 시간을 크게 줄이고 더 깊이 있게 이해하도록 도와줍니다.',
      traceHeading: '대화하듯 입력하는 일정관리 앱',
      traceBody:
        '트레이스는 당신의 하루를 손쉽게 관리해주는 AI 기반 스케줄링 앱입니다. 일상적인 언어로 일정을 입력하면 트레이스가 자동으로 세부 내용을 채워줍니다. 맥락을 이해하는 알림 기능으로 언제나 준비된 상태로 일정을 관리할 수 있습니다.',
      babyUnicornBadge: '2024 아기유니콘 선정!',
      babyUnicornHeading: '혁신성, 성장성, 글로벌 경쟁력을 인정받은 코르카',
      recsysHeading: '코르카의 기술력은 이미\n세계적으로 인정받았습니다.',
      recsysCaptionTop: 'AI 추천시스템 분야 최고 권위 학회에서 주관한',
      recsysEvent: 'ACM RecSys Challenge 2023',
      recsysRank: '세계 7위, 국내 기업 중 1위 쾌거!',
      partnersHeading: '코르카는 많은 기업들에게\n혁신을 안겨주고 있습니다.',
      closingHeading: 'AI로 삶과 일의 패러다임을 바꿉니다',
      closingSubtitle: '우리의 기술력으로 새로운 가능성을 열고, 세상의 변화를 이끌어 갑니다.',
    },
  },

  en: {
    langLabel: 'Select language',
    nav: {
      products: 'Products',
      about: 'About us',
      careers: 'Careers',
      blog: 'Blog',
      vision: 'Vision & Mission',
      howWeWork: 'How We Work',
      news: 'News',
      colleagues: 'Our People',
    },
    footer: {
      address: '6F, 11-8, Teheran-ro 77-gil, Gangnam-gu, Seoul, Republic of Korea · Corca, Inc.',
      tel: 'Tel: +82-2-6925-6978',
      rights: '© 2026 Corca, Inc.',
    },
    home: {
      metaTitle:
        'Corca | Enterprise AI Transformation (AX) Consulting · AI Training · AI Solutions',
      metaDescription:
        "Corca is Korea's first official OpenAI service partner. Through AI training and AX acceleration consulting experienced by 20+ organizations and over 1,000 people — including Shinhan Bank, Toss, and GS Group — we genuinely change how organizations work. A proven AI transformation partner, recognized as a 2024 Baby Unicorn and ranked 7th worldwide at the ACM RecSys Challenge.",
      heroTitle: 'Corca is changing the world\nwith AI technology.',
      heroSubtitle:
        'We create new possibilities with AI technology and lead the change in the world.',
      readMore: 'Read more',
      readArticle: 'Read article',
      moonlightHeading: 'Understand papers faster and more easily',
      moonlightBody:
        'Moonlight applies AI technology directly to the flow of reading academic papers, providing real-time explanations of unfamiliar or difficult content, and working with conversational AI to flesh out concepts or summarize content — significantly reducing the time it takes to understand the PDF documents required for research and helping you understand them more deeply.',
      traceHeading: 'A scheduling app you can just talk to',
      traceBody:
        'Trace is an AI-based scheduling app that makes it easy to manage your day. Just type your schedule in everyday language and Trace automatically fills in the details. With context-aware notifications, you can always stay on top of your schedule.',
      babyUnicornBadge: 'Selected as a 2024 Baby Unicorn!',
      babyUnicornHeading:
        'Corca, recognized for its innovation, growth potential, and global competitiveness',
      recsysHeading: "Corca's technological prowess has\nalready been recognized worldwide.",
      recsysCaptionTop: 'Hosted by the most authoritative conference in AI recommender systems',
      recsysEvent: 'ACM RecSys Challenge 2023',
      recsysRank: '7th in the world · 1st among Korean companies!',
      partnersHeading: 'Corca is bringing innovation\nto many companies.',
      closingHeading: 'Changing the paradigm of life and work with AI',
      closingSubtitle:
        'We open up new possibilities and lead the changes in the world with our technological prowess.',
    },
  },

  ja: {
    langLabel: '言語を選択',
    nav: {
      products: '製品紹介',
      about: '会社紹介',
      careers: '採用',
      blog: 'ブログ',
      vision: 'ビジョンとミッション',
      howWeWork: '私たちの働き方',
      news: 'ニュース',
      colleagues: 'コルカの人々',
    },
    footer: {
      address: 'ソウル特別市 江南区 テヘラン路77ギル 11-8, 6階 株式会社コルカ',
      tel: 'Tel: +82-2-6925-6978',
      rights: '© 2026 Corca, Inc.',
    },
    home: {
      metaTitle:
        'Corca（コルカ）| 企業のAI変革（AX）コンサルティング・AI教育・AIソリューション専門企業',
      metaDescription:
        '韓国初のOpenAI公式サービスパートナー、コルカ。新韓銀行・Toss・GSグループなど20を超える組織、1,000名以上が体験したAI教育とAX加速化コンサルティングで、組織の働き方を実際に変えます。2024 ベビーユニコーン選定、ACM RecSys 世界7位の技術力で検証されたAI変革パートナーです。',
      heroTitle: 'コルカはAI技術で\n世界を変えています。',
      heroSubtitle: 'AI技術で新たな可能性を切り拓き、世界の変化をリードします。',
      readMore: 'もっと見る',
      readArticle: '記事を見る',
      moonlightHeading: '論文をもっと速く、もっとわかりやすく理解する',
      moonlightBody:
        'ムーンライトは、AI技術を学術論文の読解プロセスに直接応用し、難解な内容もリアルタイムでわかりやすく説明します。インタラクティブなAIとの対話を通じて概念を具体化し、要点を要約することで、研究に必要なPDF文書の理解時間を大幅に短縮し、より深い洞察を得ることができます。',
      traceHeading: '会話するように入力するスケジューリングアプリ',
      traceBody:
        'トレースは、あなたの一日をスマートに管理するAIスケジューリングアプリです。日常の言葉で予定を入力すると、トレースが自動的に詳細を補完します。文脈を理解する通知機能により、いつでも最適な状態でスケジュールを管理できます。',
      babyUnicornBadge: '2024 ベビーユニコーン選定！',
      babyUnicornHeading: '革新性・成長性・グローバル競争力が高く評価されたコルカ',
      recsysHeading: 'コルカの技術力は、すでに\n世界で高く評価されています。',
      recsysCaptionTop: 'AI推薦システム分野で最高権威の学会が主催した',
      recsysEvent: 'ACM RecSys Challenge 2023',
      recsysRank: '世界7位・国内企業中1位の快挙！',
      partnersHeading: 'コルカは多くの企業に\n革新をもたらしています。',
      closingHeading: 'AIの力で、人生と仕事のパラダイムを変革する',
      closingSubtitle: '私たちの技術力で新たな可能性を切り拓き、世界の変化をリードしていきます。',
    },
  },

  zh: {
    langLabel: '选择语言',
    nav: {
      products: '产品介绍',
      about: '公司介绍',
      careers: '招聘',
      blog: '博客',
      vision: '愿景与使命',
      howWeWork: '我们的工作方式',
      news: '新闻报道',
      colleagues: 'Corca 的伙伴们',
    },
    footer: {
      address: '韩国首尔特别市江南区德黑兰路77街11-8, 6层 Corca株式会社',
      tel: 'Tel: +82-2-6925-6978',
      rights: '© 2026 Corca, Inc.',
    },
    home: {
      metaTitle: 'Corca | 企业AI转型（AX）咨询·AI培训·AI解决方案专业企业',
      metaDescription:
        'Corca是韩国首家OpenAI官方服务合作伙伴。我们通过被新韩银行、Toss、GS集团等20多个组织、1,000多人亲身体验的AI培训与AX加速咨询，切实改变组织的工作方式。作为入选2024年“小独角兽”、在ACM RecSys Challenge中位列全球第7的AI转型伙伴，技术实力备受验证。',
      heroTitle: 'Corca正在用AI技术\n改变世界。',
      heroSubtitle: '我们用AI技术开启新的可能，引领世界的变革。',
      readMore: '了解更多',
      readArticle: '查看报道',
      moonlightHeading: '更快、更轻松地理解论文',
      moonlightBody:
        'Moonlight将AI技术直接应用于学术论文的阅读过程，为陌生或艰深的内容提供实时讲解，并通过对话式AI帮助您具体化概念、总结要点，大幅缩短理解研究所需PDF文献的时间，助您获得更深入的理解。',
      traceHeading: '像聊天一样输入的日程管理应用',
      traceBody:
        'Trace是一款帮助您轻松管理一天的AI日程应用。只需用日常语言输入日程，Trace就会自动补全细节。借助理解上下文的提醒功能，您随时都能从容地掌控日程。',
      babyUnicornBadge: '入选2024年"小独角兽"企业！',
      babyUnicornHeading: '创新性、成长性与全球竞争力备受认可的Corca',
      recsysHeading: 'Corca的技术实力\n已获得世界级认可。',
      recsysCaptionTop: '在AI推荐系统领域最权威学会主办的',
      recsysEvent: 'ACM RecSys Challenge 2023',
      recsysRank: '荣获世界第7名、韩国企业第1名的佳绩！',
      partnersHeading: 'Corca正在为众多企业\n带来创新。',
      closingHeading: '用AI改变生活与工作的范式',
      closingSubtitle: '以我们的技术实力开启新的可能，引领世界的变革。',
    },
  },
};
