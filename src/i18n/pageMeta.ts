import type { Lang } from './ui';

export type Meta = { title: string; description: string };
type PageMeta = Record<Lang, Meta>;

/** The static (non-product) pages that carry SEO copy here. */
export type PageMetaKey =
  | 'ax'
  | 'products'
  | 'about'
  | 'about-corca'
  | 'how-we-work'
  | 'news'
  | 'colleagues';

// SEO title/description per subpage per locale (issues #26 #27 #29 #30 #31 #32).
// The keys are stable even though the live URLs now live under /products/ and
// /about/ (see [...slug].astro). Titles read "PageName | descriptor"; the
// breadcrumb/app name is derived from the part before the first pipe. Product
// pages keep their own copy in their manifest, so they are not listed here.
export const pageMeta = {
  ax: {
    ko: {
      title: '기업 AX 컨설팅 | AI 도입을 반복되는 성과로 바꾸는 Corca',
      description:
        'AI 과제를 고르고 첫 업무를 실제 운영에 올린 뒤, 다음 업무는 조직이 직접 확장하도록 돕는 Corca의 AX 컨설팅입니다. 2주 의사결정 지도부터 6주 운영 전환, 조직 확산까지 함께합니다.',
    },
    en: {
      title: 'Enterprise AX Consulting for Repeatable AI Results | Corca',
      description:
        "Corca's AX consulting helps enterprises choose the right AI opportunities, put the first workflow into production, and build the capability to expand the next one themselves—from a two-week decision map to a six-week operating transition.",
    },
    ja: {
      title: 'AI導入を継続的な成果に変える企業AXコンサルティング | Corca',
      description:
        'CorcaのAXコンサルティングは、AIで取り組む課題を選び、最初の業務を実運用に移し、次の業務を組織自身で展開できる状態をつくります。2週間の意思決定マップから6週間の運用移行、組織展開まで伴走します。',
    },
    zh: {
      title: '将AI导入转化为可持续成果的企业AX咨询 | Corca',
      description:
        'Corca的AX咨询服务帮助企业选择合适的AI课题，将首个业务真正投入运营，并建立自主扩展下一个业务的能力——从两周决策地图、六周运营转型到组织推广，全程协作落地。',
    },
  },
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
} satisfies Record<PageMetaKey, PageMeta>;
