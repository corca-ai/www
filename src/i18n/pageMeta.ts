import type { Lang } from './ui';

type Meta = { title: string; description: string };
type PageMeta = Record<Lang, Meta>;

// SEO title/description per subpage per locale.
export const pageMeta: Record<string, PageMeta> = {
  moonlight: {
    ko: {
      title: 'Moonlight | Corca',
      description:
        '문라이트는 AI 기술을 학술 논문을 읽는 흐름에 직접 적용하여 생소하거나 어려운 내용에 대한 실시간 설명을 제공하고, 연구에 필요한 PDF 문서를 더 빠르고 깊이 있게 이해하도록 돕는 연구자용 AI 논문 리더입니다.',
    },
    en: {
      title: 'Moonlight | Corca',
      description:
        'Moonlight is an AI PDF reader for researchers. It applies AI directly to the flow of reading academic papers — providing real-time explanations, summaries, smart citation, translation and more.',
    },
    ja: {
      title: 'Moonlight | Corca',
      description:
        'ムーンライトは、AI技術を学術論文の読解に直接応用する研究者向けのAI論文リーダーです。難解な内容をリアルタイムで説明し、要約や翻訳など研究に役立つ多彩な機能を提供します。',
    },
  },
  trace: {
    ko: {
      title: 'Trace | Corca',
      description:
        '트레이스는 말하거나 입력하거나 사진을 찍기만 하면 AI가 내용을 이해해 일정을 자동으로 정리해주는 AI 캘린더입니다. 생활 리듬에 맞춘 알림과 루틴으로 하루를 손쉽게 관리하세요.',
    },
    en: {
      title: 'Trace | Corca',
      description:
        'Trace is an AI calendar that makes managing your day easy. Just speak, type, or take a photo — the AI understands and organizes your schedule, with reminders and routines tuned to your rhythm.',
    },
    ja: {
      title: 'Trace | Corca',
      description:
        'トレースは、話す・入力する・写真を撮るだけでAIが内容を理解し、予定を自動で整理するAIスケジューリングアプリです。あなたのライフリズムに合わせて通知やルーチンを最適化します。',
    },
  },
  'about-corca': {
    ko: {
      title: '비전과 미션 | Corca',
      description:
        '코르카는 상상을 현실로 바꾸는 AI 기술을 선도합니다. 탁월한 솔루션과 윤리적 리더십, 글로벌 임팩트를 핵심 가치로 삼고, 기술의 진보로 더 나은 사회를 만들어갑니다.',
    },
    en: {
      title: 'Vision & Mission | Corca',
      description:
        'Corca is a leader in AI technology that turns imagination into reality. With excellent solutions, ethical leadership, and global impact as core values, we make technology benefit everyone.',
    },
    ja: {
      title: 'ビジョンとミッション | Corca',
      description:
        'コルカは、想像を現実に変えるAI技術の最前線をリードしています。卓越したソリューション、倫理的リーダーシップ、グローバルな影響力を中核的価値とし、技術の進歩の恩恵をすべての人に届けます。',
    },
  },
  'how-we-work': {
    ko: {
      title: '이렇게 일해요 | Corca',
      description:
        '코르카는 멤버의 성장과 복지를 위해 최적의 근무 환경을 제공하고 역량 개발에 힘쓰고 있습니다. 코르카의 일하는 방식과 다양한 복지 제도를 소개합니다.',
    },
    en: {
      title: 'How We Work | Corca',
      description:
        'Corca provides the best working environment for the growth and welfare of its members. Learn about how we work and the benefits we offer.',
    },
    ja: {
      title: '私たちの働き方 | Corca',
      description:
        'コルカは、メンバーの成長と働きやすさのために最適な労働環境を提供し、能力開発に力を注いでいます。コルカの働き方と多様な福利厚生をご紹介します。',
    },
  },
  news: {
    ko: {
      title: '뉴스 | Corca',
      description: '뉴스 기사로 보는 코르카의 성과와 소식을 만나보세요.',
    },
    en: {
      title: 'News | Corca',
      description: "Corca's achievements and news, as covered in the press.",
    },
    ja: {
      title: 'ニュース | Corca',
      description: 'ニュース記事で見るコルカの成果とお知らせをご覧ください。',
    },
  },
  colleagues: {
    ko: {
      title: '코르카 사람들 | Corca',
      description: '능력있고 열정적인 코르카 팀 멤버들의 경험과 성장에 대한 생생한 이야기들을 만나보세요.',
    },
    en: {
      title: 'Our People | Corca',
      description: 'Discover the vivid stories of growth and experience from the talented, passionate members of the Corca team.',
    },
    ja: {
      title: 'コルカの人々 | Corca',
      description: '有能で情熱的なコルカのチームメンバーたちの経験と成長に関する生き生きとしたストーリーをご覧ください。',
    },
  },
};
