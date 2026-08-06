import cealContentsMarkdown from './CEAL_CONTENTS.md?raw';

export const cealContent = {
  hero: {
    brand: 'Corca AX',
    product: 'Ceal',
    descriptors: ['온프레미스 에이전트', '컨텍스트 게이트웨이'],
    partner: 'OpenAI Select Partner',
    heading: ['AI 비용은', '구조적으로 줄이고,', '같은 인원으로', '더 많은 일을 해내는.'],
    statement: 'AX 환경 구축 솔루션, Ceal',
  },
  problem: {
    heading: ['조직에 AI를 도입했지만', '성과가 보이지 않나요?'],
    lead: '성과가 없는 대다수의 조직은 다음과 같은 문제를 겪고 있습니다.',
    items: [
      { label: '데이터', body: '전사의 데이터가 흩어져 있고' },
      { label: '보안', body: '누가 어디에 접근했는지 파악하기 어렵고' },
      { label: '비용', body: 'AI 토큰 비용은 계속 늘어납니다.' },
    ],
    solution: ['OpenAI Select Partner,', 'Corca AX의 Ceal이', '문제를 해결합니다.'],
    footnote: '토큰: AI 사용량을 세는 단위. 데이터를 많이 읽고 쓸수록 비용이 늘어납니다.',
  },
  architecture: {
    heading: [
      '전사 AX 확산의 기술적 병목인',
      '데이터, 보안, 비용.',
      'Ceal은 이 모든 문제를 해결합니다.',
    ],
    before: 'Ceal 이전',
    beforeBadge: '각자 알아서 연결',
    agents: ['개인 Codex', '개인 Claude Code', '사내 에이전트'],
    systems: ['Slack · Notion', 'GitHub · Drive', '사내 시스템'],
    beforeNotes: [
      '각자가 개별 리소스에 API와 MCP로 직접 연결해야 합니다',
      '누가 언제 어디에 접근했는지 보이지 않습니다',
      '검색과 컨텍스트 주입이 반복되며 토큰 사용이 늘어납니다',
    ],
    agentFootnote:
      '에이전트: 지시를 받아 스스로 자료를 찾고 업무를 수행하는 AI (Codex, Claude Code 등)',
    transition: 'Ceal 도입',
    after: 'Ceal 이후',
    afterBadge: '승인된 단일 게이트웨이에 연결',
    gateway: 'Ceal - 데이터, 보안, 비용',
    onPremises: '온프레미스로 구동',
    afterNotes: [
      '하나의 게이트웨이로 모든 호출을 확인하고 기록합니다',
      '팀 프로파일로 권한을 분리하고 미승인 접근을 막습니다',
      '중복 검색과 불필요한 주입을 줄여 토큰을 최적화합니다',
    ],
    gatewayFootnote:
      '게이트웨이: 에이전트와 업무 도구 사이의 단일 관문으로 모든 접근이 여기를 거칩니다',
    closing: ['Ceal 도입 후 AI 비용은 줄고,', '생산성은 늘어납니다.'],
  },
  benefits: {
    eyebrow: 'Ceal 도입 효과',
    heading: ['비용은 낮추고, 생산성은 높이는', 'AX 환경을 만듭니다.'],
    items: [
      {
        title: ['AI 비용,', '구조적 감소'],
        paragraphs: [
          [
            '한 번 찾은 업무 맥락은',
            '컨텍스트 레이어가 기억합니다.',
            '중복 검색과 컨텍스트 재주입으로',
            '낭비되던 AI 사용 비용을 줄이고,',
            '절감된 비용은 대시보드로',
            '확인합니다.',
          ],
        ],
        footnote:
          '컨텍스트 레이어: 한 번 찾은 조직 데이터의 맥락을 기억해 두는 저장층, 같은 검색을 반복하지 않게 합니다',
      },
      {
        title: ['같은 인원,', '더 많은 업무 수행'],
        paragraphs: [
          ['조직 데이터가 연결된 에이전트가', '조회·정리 같은 반복 업무를', '대신 수행합니다.'],
          ['구성원은 핵심 판단과 결정에만', '집중할 수 있습니다.'],
        ],
      },
      {
        title: ['데이터가 밖으로 나가지 않는', '온프레미스'],
        paragraphs: [
          ['Ceal은 조직 인프라 안에서만', '구동되어 조직 데이터가', '외부로 나가지 않습니다.'],
          [
            '모든 호출을 기록하고, 팀 프로필별로',
            '권한을 분리해 미승인 접근은',
            '게이트웨이에서 차단합니다.',
          ],
        ],
        footnote: '온프레미스: 외부 클라우드가 아니라 회사 인프라 안에 직접 설치해서 쓰는 방식',
      },
      {
        title: ['시도하기 어려웠던', '레거시까지 연결'],
        paragraphs: [
          [
            'API가 없는 레거시·사내 시스템도',
            'Corca AX 전담 엔지니어(FDE)가',
            '고객사 환경에 맞춰',
            '커스텀 커넥터를 설계·구축해',
            '연결해 드립니다.',
          ],
        ],
        footnote: '커넥터: 게이트웨이와 개별 업무 도구(Slack, SAP등)를 잇는 연결 모듈',
      },
    ],
    closing: ['단 한 번의 도입으로', '네 가지 효과를 얻으세요.'],
  },
  process: {
    heading: ['진단부터 전사 확산까지', '조직의 상황에 맞춰', '단계적으로 도입합니다.'],
    label: 'Ceal 도입 프로세스',
    stages: [
      {
        title: '진단',
        duration: 'Demo | 1시간 · 무료',
        bullets: [
          '업무 환경 진단, 표준 커넥터 적용 가능 여부 검토',
          '대략적인 ROI 추정과 아키텍처 방향 제안',
          '도입 요구사항 수집',
        ],
      },
      {
        title: '분석·설계',
        duration: 'Discovery | 2주',
        bullets: [
          '시스템·API·권한 구조 분석, 보안 요구사항 확인',
          '커넥터 구현 난이도 산정, PoC 범위 정의',
          '일정·비용·위험 요소 문서화',
        ],
      },
      {
        title: '파일럿',
        duration: 'Quickstart | 2주',
        bullets: [
          '게이트웨이 설치, 공식 커넥터 연결·검증',
          '파일럿 팀 프로파일 구성, 10~20명 온보딩',
          '기본 권한·감사 설정, 첫 비용 리포트 확인',
        ],
      },
      {
        title: '확산',
        duration: 'Implementation | 4~6주',
        bullets: [
          '팀 프로파일·절감(ROI) 대시보드 전사 확장',
          '핵심 업무 워크플로 2~3개 구축',
          '보안 리뷰 지원, 성과 벤치마크로 정착 확인',
        ],
      },
    ],
    notes: [
      '각 단계는 마일스톤을 정해 두고, 끝난 것을 확인한 뒤 다음 단계로 넘어갑니다.',
      'API가 없는 사내 레거시 커스텀 커넥터는 Discovery 결과에 따라 범위·일정을 별도 협의합니다.',
      '조직 규모에 맞춰 Demo 후 바로 Quickstart를 시작할 수 있습니다.',
    ],
    closing: ['첫 단계는 1시간이면 충분합니다.', '진단은 무료입니다.'],
  },
  differentiation: {
    eyebrow: 'Ceal의 차별적 강점',
    heading: ['누구나 연결하고 싶어 하지만,', '아무나 연결하지 못합니다.'],
    support: [
      '지금 기업이 AI 도입 후 가장 먼저 하려는 일은',
      '데이터 연결과 컨텍스트 레이어 구축입니다.',
      'Ceal은 이 어려운 일을 쉽게 만듭니다.',
    ],
    direct: {
      title: '직접 구축하면',
      badge: '대부분 여기서 멈춥니다',
      notes: [
        '도구마다 커넥터를 개발하고 운영할 전담 인력이 필요합니다',
        'API 없는 레거시 시스템 앞에서 멈춥니다',
        '권한·감사 설계가 빠져 보안 검토를 통과하기 어렵습니다',
        '연결해도 끝이 아닙니다. 과거 데이터를 잘 찾아내는 건 또 다른 문제입니다',
      ],
    },
    ceal: {
      title: 'Ceal과 함께라면',
      badge: 'FDE가 구축을 함께합니다',
      notes: [
        '주요 업무 도구는 공식 커넥터로 바로 연결합니다',
        'API 없는 레거시도 FDE가 컴퓨터 유즈·스크립트로 커넥터를 만듭니다',
        '권한·감사가 내장되어 있어 보안 검토가 빨라집니다',
        '컨텍스트 레이어가 쌓여 찾을수록 빨라지고 저렴해집니다',
      ],
    },
    closing: ['연결의 어려움은 Ceal과 FDE가 담당하고,', '연결의 성과는 조직이 가져갑니다.'],
  },
  context: {
    eyebrow: 'Ceal의 경제성',
    heading: ['쌓일수록 강해지고, 저렴해지는', '컨텍스트 레이어.'],
    steps: [
      {
        title: '01 연결',
        body: ['업무 도구와', '레거시 시스템을', '게이트웨이 하나로', '통합합니다'],
      },
      { title: '02 축적', body: ['사람·문서·권한과 그 관계를', '지도처럼 연결해', '기억합니다'] },
      {
        title: '03 재사용',
        body: ['유사한 질문에', '전체 데이터를 뒤지지 않고', '더 빠르고', '더 저렴하게 답합니다'],
      },
    ],
    closing: [
      '쓰는 사람이 많아질수록,',
      '검색은 빨라지고',
      '토큰은 줄어들어 지속적으로 비용이 감소합니다.',
    ],
  },
  economics: {
    heading: ['압도적으로 경제적인 도입,', '구독료를 넘어서는 절감.'],
    support: ['직접 구축의 1/5 수준으로 시작해', '구축 비용, AI 사용료, 업무 시간까지 아낍니다.'],
    subscription: {
      heading: '단 하나의 편리한 구독',
      title: 'Ceal 구독',
      body: ['공식 커넥터 · 권한/감사 · 컨텍스트 레이어 및', '전담 Corca FDE 지원 포함'],
    },
    savingsHeading: '세 가지의 확실한 절감',
    savings: [
      {
        title: '직접 구축·운영을 대체합니다',
        body: '전담 인력의 커넥터 개발·유지보수, 권한·감사 설계, 인프라 운영',
      },
      {
        title: '사용하던 AI 비용이 줄어듭니다',
        body: '중복 검색과 컨텍스트 재주입을 없애 API·구독 토큰 지출 자체가 감소합니다',
      },
      {
        title: '같은 인원의 업무 산출물이 증가합니다',
        body: '반복 업무를 에이전트가 대신하는 만큼, 핵심 업무에 집중하는 시간이 증가합니다',
      },
    ],
    closing: ['단 하나의 구독으로', '큰 폭의 AI 비용 절감이 시작됩니다.'],
  },
  cta: {
    product: 'Corca AX - Ceal',
    heading: ['비용은 낮추고,', '생산성은 높이는', 'AX 업무 환경.'],
    start: '지금 시작하세요.',
    action: '무료 진단 신청',
    url: 'www.corca.ai/ax',
    partner: 'OpenAI Select Partner',
    source: 'Corca AX · 2026.08',
  },
} as const;

function visibleMarkdownText(markdown: string) {
  return markdown
    .replace(/<!--[\s\S]*?-->/gu, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/gu, '$1')
    .replace(/<br\s*\/?>/giu, ' ')
    .replace(/^---$/gmu, ' ')
    .replace(/^#{1,6}\s+/gmu, '')
    .replace(/^\s*[-*]\s+/gmu, '')
    .replace(/^\s*\d+\.\s+/gmu, '')
    .replace(/[*_]/gu, '')
    .split(String.fromCharCode(96))
    .join('')
    .replace(/\s+/gu, ' ')
    .trim();
}

const structuredCopy = [
  cealContent.hero.brand,
  cealContent.hero.product,
  ...cealContent.hero.descriptors,
  cealContent.hero.partner,
  ...cealContent.hero.heading,
  cealContent.hero.statement,
  ...cealContent.problem.heading,
  cealContent.problem.lead,
  ...cealContent.problem.items.map((item) => `${item.label}: ${item.body}`),
  ...cealContent.problem.solution,
  cealContent.problem.footnote,
  ...cealContent.architecture.heading,
  cealContent.architecture.before,
  cealContent.architecture.beforeBadge,
  ...cealContent.architecture.agents,
  ...cealContent.architecture.systems,
  ...cealContent.architecture.beforeNotes.map((note) => `✕ ${note}`),
  cealContent.architecture.agentFootnote,
  cealContent.architecture.transition,
  cealContent.architecture.after,
  cealContent.architecture.afterBadge,
  ...cealContent.architecture.agents,
  cealContent.architecture.gateway,
  cealContent.architecture.onPremises,
  ...cealContent.architecture.systems,
  ...cealContent.architecture.afterNotes.map((note) => `✓ ${note}`),
  cealContent.architecture.gatewayFootnote,
  ...cealContent.architecture.closing,
  cealContent.benefits.eyebrow,
  ...cealContent.benefits.heading,
  ...cealContent.benefits.items.flatMap((item) => [
    ...item.title,
    ...item.paragraphs.flat(),
    ...('footnote' in item ? [item.footnote] : []),
  ]),
  ...cealContent.benefits.closing,
  ...cealContent.process.heading,
  cealContent.process.label,
  ...cealContent.process.stages.flatMap((stage) => [stage.title, stage.duration, ...stage.bullets]),
  ...cealContent.process.notes,
  ...cealContent.process.closing,
  cealContent.differentiation.eyebrow,
  ...cealContent.differentiation.heading,
  ...cealContent.differentiation.support,
  cealContent.differentiation.direct.title,
  cealContent.differentiation.direct.badge,
  ...cealContent.differentiation.direct.notes.map((note) => `✕ ${note}`),
  cealContent.differentiation.ceal.title,
  cealContent.differentiation.ceal.badge,
  ...cealContent.differentiation.ceal.notes.map((note) => `✓ ${note}`),
  ...cealContent.differentiation.closing,
  cealContent.context.eyebrow,
  ...cealContent.context.heading,
  ...cealContent.context.steps.flatMap((step) => [step.title, ...step.body]),
  ...cealContent.context.closing,
  ...cealContent.economics.heading,
  ...cealContent.economics.support,
  cealContent.economics.subscription.heading,
  cealContent.economics.subscription.title,
  ...cealContent.economics.subscription.body,
  cealContent.economics.savingsHeading,
  ...cealContent.economics.savings.flatMap((saving) => [saving.title, saving.body]),
  ...cealContent.economics.closing,
  cealContent.cta.product,
  ...cealContent.cta.heading,
  cealContent.cta.start,
  cealContent.cta.action,
  cealContent.cta.url,
  cealContent.cta.partner,
  cealContent.cta.source,
].join(' ');

if (visibleMarkdownText(cealContentsMarkdown) !== visibleMarkdownText(structuredCopy)) {
  throw new Error(
    'Ceal content contract mismatch: CEAL_CONTENTS.md and content.ts must remain identical.',
  );
}
