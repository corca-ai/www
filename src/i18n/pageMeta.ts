import type { Lang } from './ui';

type Meta = { title: string; description: string };
type PageMeta = Record<Lang, Meta>;

// SEO title/description per subpage per locale (issues #26 #27 #29 #30 #31 #32).
// The `id` keys are stable even though the live URLs now live under /products/
// and /about/ (see [...slug].astro). Titles read "PageName | descriptor"; the
// breadcrumb/app name is derived from the part before the first pipe.
export const pageMeta: Record<string, PageMeta> = {
  products: {
    ko: {
      title: '코르카 AI 제품 소개 | 문라이트·트레이스 등 AI 솔루션 라인업',
      description:
        '논문 읽기를 바꾸는 AI 리서치 도구 문라이트, 대화하듯 입력하는 AI 일정관리 트레이스, 초개인화 리테일 미디어 코르카애즈까지. ACM RecSys 세계 7위 기술력의 코르카가 연구·업무·비즈니스 현장에 바로 쓰이는 AI 제품을 만듭니다.',
    },
    en: {
      title: 'Corca AI Products | Moonlight, Trace & More AI Solutions',
      description:
        'From Moonlight, the AI research tool transforming how you read papers, to Trace, the AI scheduler you enter like a conversation, to Corca Ads, hyper-personalized retail media. With technology ranked 7th worldwide at the ACM RecSys Challenge, Corca builds AI products ready to use in research, work, and business.',
    },
    ja: {
      title: 'Corca AI製品紹介 | ムーンライト・トレースなどAIソリューションのラインナップ',
      description:
        '論文の読み方を変えるAIリサーチツール「ムーンライト」、会話するように入力するAIスケジュール管理「トレース」、超パーソナライズドなリテールメディア「Corca Ads」まで。ACM RecSys 世界7位の技術力を持つコルカが、研究・業務・ビジネスの現場ですぐに使えるAI製品を開発します。',
    },
    zh: {
      title: 'Corca AI产品介绍 | Moonlight、Trace等AI解决方案阵容',
      description:
        '从改变论文阅读方式的AI研究工具Moonlight，到像聊天一样输入的AI日程管理Trace，再到超个性化零售媒体Corca Ads。拥有ACM RecSys全球第7技术实力的Corca，打造可直接用于研究、工作与商业场景的AI产品。',
    },
  },
  about: {
    ko: {
      title: '회사 소개 | 2024 아기유니콘 AI 전문 기업 코르카(Corca)',
      description:
        '코르카는 한국 최초 OpenAI 공식 서비스 파트너이자 2024 아기유니콘 선정 AI 전문 기업입니다. ACM RecSys Challenge 세계 7위·국내 1위 기술력으로 AI 제품 개발부터 기업 AX 컨설팅까지, 코르카의 비전과 팀을 소개합니다.',
    },
    en: {
      title: 'About | Corca, a 2024 Baby Unicorn AI Company',
      description:
        "Corca is Korea's first official OpenAI service partner and a 2024 Baby Unicorn AI company. With technology ranked 7th worldwide and 1st in Korea at the ACM RecSys Challenge — from building AI products to enterprise AX consulting — meet Corca's vision and team.",
    },
    ja: {
      title: '会社紹介 | 2024 ベビーユニコーンのAI専門企業 Corca（コルカ）',
      description:
        'コルカは、韓国初のOpenAI公式サービスパートナーであり、2024 ベビーユニコーンに選定されたAI専門企業です。ACM RecSys Challenge 世界7位・国内1位の技術力で、AI製品の開発から企業のAXコンサルティングまで。コルカのビジョンとチームをご紹介します。',
    },
    zh: {
      title: '公司介绍 | 2024年“小独角兽”AI专业企业Corca',
      description:
        'Corca是韩国首家OpenAI官方服务合作伙伴，也是入选2024年“小独角兽”的AI专业企业。凭借在ACM RecSys Challenge中位列全球第7、韩国第1的技术实力，从AI产品开发到企业AX咨询，为你介绍Corca的愿景与团队。',
    },
  },
  moonlight: {
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
  trace: {
    ko: {
      title: '트레이스(Trace) | 대화하듯 입력하는 AI 일정관리 앱',
      description:
        "'내일 3시 회의'라고 입력하면 끝. 트레이스는 일상 언어로 입력한 일정의 세부 내용을 AI가 자동으로 채우고, 맥락을 이해하는 알림으로 하루를 관리해주는 AI 기반 스케줄링 앱입니다. 캘린더 정리에 쓰는 시간을 돌려드립니다.",
    },
    en: {
      title: 'Trace | The AI Scheduling App You Can Just Talk To',
      description:
        'Just type "meeting at 3 tomorrow" — done. Trace is an AI-based scheduling app: it automatically fills in the details of schedules you enter in everyday language and manages your day with context-aware reminders. Get back the time you spend organizing your calendar.',
    },
    ja: {
      title: 'トレース（Trace）| 会話するように入力するAIスケジュール管理アプリ',
      description:
        '「明日3時に会議」と入力するだけ。トレースは、日常の言葉で入力した予定の詳細をAIが自動で補完し、文脈を理解する通知で一日を管理するAIベースのスケジューリングアプリです。カレンダー整理に費やす時間を取り戻しましょう。',
    },
    zh: {
      title: 'Trace | 像聊天一样输入的AI日程管理应用',
      description:
        '输入“明天3点开会”即可。Trace是一款AI日程应用：AI会自动补全你用日常语言输入的日程细节，并通过理解上下文的提醒帮你管理一天，把整理日历的时间还给你。',
    },
  },
  'about-corca': {
    ko: {
      title: '비전과 미션 | AI로 삶과 일의 패러다임을 바꾸는 코르카',
      description:
        "'상상을 현실로 바꾸는 AI 기술'. 코르카는 탁월한 솔루션, 윤리적 리더십, 글로벌 임팩트를 핵심 가치로 연구·업무·일상에 AI의 새로운 가능성을 엽니다. 코르카가 그리는 AI 시대의 비전과 미션을 확인하세요.",
    },
    en: {
      title: 'Vision & Mission | Corca, Changing the Paradigm of Life and Work with AI',
      description:
        '"AI technology that turns imagination into reality." With excellent solutions, ethical leadership, and global impact as its core values, Corca opens new AI possibilities across research, work, and everyday life. Discover the vision and mission Corca envisions for the age of AI.',
    },
    ja: {
      title: 'ビジョンとミッション | AIで人生と仕事のパラダイムを変えるコルカ',
      description:
        '「想像を現実に変えるAI技術」。コルカは、卓越したソリューション、倫理的リーダーシップ、グローバルな影響力を核心的価値とし、研究・業務・日常にAIの新たな可能性を切り拓きます。コルカが描くAI時代のビジョンとミッションをご覧ください。',
    },
    zh: {
      title: '愿景与使命 | 用AI改变生活与工作范式的Corca',
      description:
        '“将想象变为现实的AI技术”。Corca以卓越的解决方案、道德领导力和全球影响力为核心价值，在研究、工作与日常中开启AI的全新可能。一起了解Corca为AI时代描绘的愿景与使命。',
    },
  },
  'how-we-work': {
    ko: {
      title: '이렇게 일해요 | AI 네이티브 조직 코르카의 일하는 방식',
      description:
        'AX를 컨설팅하는 회사는 스스로 AI 네이티브여야 합니다. AI와 짝을 이뤄 일하는 문화, 빠른 실험과 공유, 자율과 책임의 팀 운영까지. 코르카 구성원들이 실제로 일하는 방식을 공개합니다.',
    },
    en: {
      title: 'How We Work | The Way of Working at Corca, an AI-Native Organization',
      description:
        'A company that consults on AX must itself be AI-native. From a culture of working paired with AI, to fast experimentation and sharing, to team operations built on autonomy and responsibility — see how the people of Corca actually work.',
    },
    ja: {
      title: '私たちの働き方 | AIネイティブ組織コルカの働き方',
      description:
        'AXをコンサルティングする会社は、自らAIネイティブであるべきです。AIと組んで働く文化、素早い実験と共有、自律と責任に基づくチーム運営まで。コルカのメンバーが実際に働く方法を公開します。',
    },
    zh: {
      title: '我们的工作方式 | AI原生组织Corca的工作方式',
      description:
        '为企业提供AX咨询的公司，自己首先必须是AI原生的。从与AI结对工作的文化，到快速实验与分享，再到基于自主与责任的团队运营——一起看看Corca的成员们究竟如何工作。',
    },
  },
  news: {
    ko: {
      title: '뉴스 기사 | 코르카(Corca) 언론 보도·소식 모음',
      description:
        '2024 아기유니콘 선정, ACM RecSys Challenge 세계 7위, 한국 최초 OpenAI 공식 서비스 파트너 체결까지. 언론이 주목한 AI 전문 기업 코르카의 최신 소식과 보도 자료를 모았습니다.',
    },
    en: {
      title: 'News | Corca Press Coverage & Updates',
      description:
        "From being named a 2024 Baby Unicorn, to ranking 7th worldwide at the ACM RecSys Challenge, to becoming Korea's first official OpenAI service partner — a collection of the latest news and press coverage of Corca, the AI company the media is watching.",
    },
    ja: {
      title: 'ニュース記事 | Corca（コルカ）の報道・お知らせまとめ',
      description:
        '2024 ベビーユニコーン選定、ACM RecSys Challenge 世界7位、韓国初のOpenAI公式サービスパートナー締結まで。メディアが注目するAI専門企業コルカの最新の話題と報道資料を集めました。',
    },
    zh: {
      title: '新闻报道 | Corca 媒体报道与动态汇总',
      description:
        '从入选2024年“小独角兽”，到在ACM RecSys Challenge中位列全球第7，再到成为韩国首家OpenAI官方服务合作伙伴——汇集备受媒体关注的AI专业企业Corca的最新动态与新闻报道。',
    },
  },
  colleagues: {
    ko: {
      title: '코르카 사람들 | AI 전문가·엔지니어가 함께하는 팀 코르카',
      description:
        '세계 대회에서 검증된 AI 엔지니어부터 조직 변화를 설계하는 AX 컨설턴트까지. 코르카를 만들어가는 사람들과 팀 문화를 소개합니다. 함께 AI로 세상을 바꿀 동료를 기다립니다.',
    },
    en: {
      title: 'Our People | Corca, a Team of AI Experts and Engineers',
      description:
        'From AI engineers proven at world-class competitions to AX consultants who design organizational change — meet the people who build Corca and the team culture behind them. We are looking for colleagues to change the world with AI together.',
    },
    ja: {
      title: 'コルカの人々 | AIの専門家・エンジニアが集うチーム、コルカ',
      description:
        '世界大会で実力を証明したAIエンジニアから、組織変革を設計するAXコンサルタントまで。コルカをつくる人々とチーム文化をご紹介します。AIで世界を変える仲間をお待ちしています。',
    },
    zh: {
      title: 'Corca 的伙伴们 | AI专家与工程师携手同行的Corca团队',
      description:
        '从在世界大赛中得到验证的AI工程师，到设计组织变革的AX顾问——为你介绍打造Corca的人们与团队文化。我们期待与你一起，用AI改变世界。',
    },
  },
};
