import { axV2ContentOverrides } from '../../../../i18n/ax-v2-content-localized';
import type { Lang } from '../../../i18n/ui';

export const axV2Content = {
  hero: {
    h1: 'Corca | AX 가속화 컨설팅',
    h2: [
      ['AI 도입은', '누구나 할 수 있습니다.'],
      ['조직의 변화는', '아무나 만들지 못합니다.'],
    ],
    h3: [
      '실제 업무 과제를 해결하고,',
      '내부 챔피언과 확산 체계를 남기는',
      'Corca의 8주 AX 프로그램을',
      '경험해 보세요.',
    ],
    cta: '상담 신청하기',
  },
  compound: {
    lines: ['첫 성과가', '복리로 이어지는 조직,', 'Corca AX가 함께 만듭니다.'],
  },
  transformation: {
    eyebrow: 'Corca AX가 하는 일',
    heading: ['Corca AX는', '조직의 체질을 바꿉니다.'],
    lead: ['AI 도구는 외부에서 사올 수 있지만', 'AI 시대에 맞는 조직은 스스로 만들어야만 합니다.'],
    body: [
      'AI를 도입했지만 전사적 성과로 연결하지 못했던 여러 기업이',
      'Corca와 함께 변화하고 있습니다.',
    ],
    testimonials: [
      {
        id: 'kyowon',
        quote: [
          '“ChatGPT Enterprise PoC 시작 후',
          '모두가 우왕좌왕할 때 Corca를 만났습니다.',
          '함께 과제를 선정하고 AX 챔피언 육성 컨설팅을 진행하며',
          '참여자들의 몰입도가 높아지고',
          '챔피언 선별 기준이 잘 잡혔습니다.',
          '효율적으로 AI를 활용하는 방법도 잘 배워서',
          '크레딧 비용 부담도 줄어들고',
          '생산성이 향상되었습니다."',
        ],
        highlights: [
          { start: 1, end: 1 },
          { start: 6, end: 6 },
          { start: 7, end: 7 },
        ],
        logoAlt: 'Kyowon 교원 로고',
        source: '교원그룹 - AI TF 파트장',
      },
      {
        id: 'tyche',
        quote: [
          '"당시 세션에 참여했던 분들을 중심으로 AX가 확산되고 있습니다.',
          '‘이렇게 하면 되는구나’를 경험하며',
          '0에서 0.1로 나아간 것이 아주 컸습니다.',
          '6개월 후인 지금 돌이켜볼 때,',
          'Corca의 AX 가속화 컨설팅을 받지 않았다면',
          '타이키의 AX가 어쩌면 지금까지도',
          '충분히 이뤄지지 않았을 것 같습니다."',
        ],
        highlights: [
          { start: 4, end: 4 },
          { start: 5, end: 5 },
          { start: 6, end: 6 },
        ],
        logoAlt: '타이키 테크놀로지스 로고',
        source: '타이키 테크놀로지스 - AX 프로덕트 매니저',
      },
    ],
    proof: 'Corca AX는 고객사의 일하는 방식을 함께 바꿔왔습니다.',
    disclaimer: '고객사 후기는 고객사의 승인을 받아 사용되었습니다.',
  },
  internalProof: {
    eyebrow: '우리부터 바꿨습니다',
    heading: ['고객에게 권하기 전,', 'Corca부터 바꾸고 검증했습니다.'],
    body: [
      'Corca에서도 다양한 시행착오를 거쳐 AI 네이티브 도구와 프로세스가 정착됐습니다.',
      '변화의 핵심은 전 직원의 참여를 이끌어낸 문화와 구조였습니다.',
      'Corca AX는 결과가 아닌 과정을, 정답이 아닌 AX 경험을 조직에 확산합니다.',
    ],
    cards: [
      {
        cadence: '매달 진행되는',
        title: 'AX Day',
        lead: "'비개발자 출신'에서 AX 챔피언으로",
        body: ['전 직원이 짝 작업을 통해 새로운 시도를 하며', 'AI 활용 역량을 높입니다.'],
      },
      {
        cadence: '매주 열리는',
        title: 'AX 공유회',
        lead: '세미나에서 각자의 경험 공유로',
        body: [
          "챔피언 한두 명의 '발표'가 아닌 모두의 실험과",
          '시행착오가 전사의 배움으로 남습니다.',
        ],
      },
      {
        cadence: '매일 쓰이는',
        title: 'AX 에이전트',
        lead: '일회성 실험에서 워크플로우 변화로',
        body: [
          '신규 입사자 온보딩, 지출 결의, 익명 설문 등',
          '반복 업무를 줄이고 일상 업무를 돕습니다.',
        ],
      },
    ],
    pressLead: '매일경제가 체험한 Corca의 AX 변화 사례',
    pressLabel: '언론보도 보기',
    pressUrl: 'https://www.mk.co.kr/news/it/12024250',
  },
  slowdown: {
    eyebrow: 'AX가 느려지는 이유',
    heading: [
      ['모델 성능만으로는'],
      ['AX가 확산되지 않습니다.'],
      ['적절한 과제 선정,', '구성원 역량 향상,'],
      ['조직 환경 구축이', '모두 필요합니다.'],
    ],
    body: [
      '기술은 조직보다 먼저 도착하지만, 성과는 조직이 준비될 때 시작됩니다.',
      '도구를 도입해도 활용이 일부 개인에게만 머물면 조직의 일하는 방식은 바뀌지 않습니다. 성공한 시도가 반복되고 전파되는 구조가 만들어져야 합니다.',
    ],
    closing: ['Corca AX는 개인의 AI 활용을', '조직의 실행력으로 전환합니다.'],
    tabs: [
      {
        id: 'diagnosis',
        title: 'AX 과제 진단',
        subtitle: '고객사의 문제를 제대로 찾습니다.',
        body: '조직의 역량과 문제의 특성에 따라 필요한 기술과 해결 전략이 달라져야 합니다. 고객사가 안고 있는 AX 과제를 모아 무엇을, 어떻게, 누가, 어떤 순서로 풀지 정리합니다.',
      },
      {
        id: 'champion',
        title: 'AX 챔피언 양성 코칭',
        subtitle: '실무자가 스스로 풀 수 있게 돕습니다.',
        body: "향후 고객사의 AX를 이끌 '챔피언' 후보를 선정합니다. 고객사의 실제 문제를 챔피언 후보의 실제 환경에서 Corca의 AX 코치가 함께 풀며 개인 역량을 높입니다.",
      },
      {
        id: 'environment',
        title: 'AX 환경·운영체계 구축',
        subtitle: '조직의 환경과 문화를 AI 시대에 맞게 재설계합니다.',
        body: '흩어져 있는 맥락, 불안한 보안 경계, 폭증하는 토큰 비용은 AI를 제대로 쓰는 조직에서 반드시 마주하는 문제입니다. 고객사의 특성과 문화에 맞게 해결하도록 돕습니다.',
      },
    ],
  },
  diagnosis: {
    eyebrow: 'AX 과제 진단',
    heading: ['조직의 역량과 문제의 특성에 따라', '필요한 기술과 해결 전략이 달라져야 합니다.'],
    metric: ['61건', '고객사당 평균 개선 과제 수'],
    body: [
      'Corca AX는 기존의 솔루션 중심 접근을 근본적으로 검토해,',
      '고객 성과 중심의 해결 전략을 제시했습니다.',
    ],
    legacy: {
      title: ['기존의', '솔루션 중심 접근'],
      body: 'ChatGPT Enterprise 도입을 원하는 고객사의 과제를 대부분 자사 솔루션을 구축해야 해결할 수 있는 문제로만 정의했습니다.',
      bodyLines: [],
      items: [
        '44 자사 솔루션 구축이 필요한 과제',
        '9 ChatGPT Enterprise로 해결 가능한 과제',
        '6 해결이 어려운 과제',
        '2 기능 PoC가 적합한 과제',
      ],
    },
    corca: {
      title: ['Corca AX의', '고객 성과 중심 진단과 해결 전략'],
      body: [
        'Corca AX는 고객사가',
        '실제로 성과를 낼 수 있도록 과제를 다시 살펴보고,',
        '6가지 해결 경로로 다시 분류했습니다.',
      ],
      items: [
        '30 Codex 스킬과 반복 워크플로우로 해결 가능한 과제',
        '8 전통적 ML 기술과 알고리즘이 더 적합한 과제',
        '5 LLM API 연동으로 경제적으로 해결 가능한 과제',
        '7 고객사의 기술 및 역량 수준에 맞게 분해·재구성한 과제',
        '7 고객사 구성원의 역량 향상으로 해결 가능한 과제',
        '4 기술보다 정책과 프로세스가 더 적합한 과제',
      ],
    },
    closing: ['Corca AX는 조직의 과제를', '조직이 풀 수 있는 형태로 진단해 드립니다.'],
    note: '수치는 고객 과제를 Corca 기준으로 재분류한 결과입니다.',
  },
  coaching: {
    eyebrow: 'AX 챔피언 양성 코칭',
    heading: ['문제를 아는 사람과,', 'AI를 아는 사람이 함께 풉니다.'],
    body: [
      ["진단된 과제를 바탕으로 현업 실무자와 Corca의 AX 코치가 '짝 작업'을 하며"],
      ['고객사의 업무 암묵지와 Corca의 AI 활용법을 한 화면에서 결합합니다.'],
      ['실무자는 AX 코치와 함께', '문제 분해 방식·AI 활용법·AX 마인드셋을 익히고,'],
      ['팀에서 재현 가능한 첫 성공 사례를 만듭니다.'],
    ],
    cards: [
      {
        title: '암묵지 추출',
        lead: ['직관적인 판단을', '기준으로 만듭니다.'],
        body: ['숙련자가 설명하기 어려운', '인지 작업을 분석하여', '규칙과 예시를 도출합니다.'],
      },
      {
        title: '짝 작업으로 구현',
        lead: ['고객사 환경에서,', '고객사 데이터로', '실제 해결 방안을 만듭니다.'],
        body: [
          '샘플 과제가 아닌 실제 업무를 함께 분해하고',
          '주어진 제약 안에서 실현 가능한',
          '산출물을 구현합니다.',
        ],
      },
      {
        title: '눈덩이처럼 전파되는 영향력',
        lead: ['첫 번째 AX 챔피언이', '두 번째 AX 챔피언을 만듭니다.'],
        body: [
          '세션 참여자들이 AX 플레이북과 산출물을',
          '각자의 팀으로 가져가',
          '다른 팀원들의 일하는 방식도 바꿉니다.',
        ],
      },
    ],
  },
  environment: {
    eyebrow: 'AX 환경·운영체계 구축',
    heading: [
      ['AX 챔피언들이', '제대로 성과를 내려면'],
      ['적절한 조직 환경과', '문화가 필요합니다.'],
    ],
    body: [
      '여러 조직의 고민과 시행착오를 수집했습니다.',
      '실무진의 고민과 경영진의 고민이 다릅니다.',
      '효과적이라고 알려진 방법이 있지만,',
      '개별 조직의 특성과 문화에 맞게 조정해야 합니다.',
    ],
    bodyEmphasis: '개별 조직의 특성과 문화에 맞게 조정',
    columns: ['AX 환경 병목', '현업에서 겪는 증상', '경영진이 떠안는 리스크'],
    rows: [
      {
        title: '맥락 연결',
        english: 'Context',
        symptom: '계속 복사·붙여넣기',
        risk: '조직 데이터가 활용되지 않음',
      },
      {
        title: '접근 권한',
        english: 'Access',
        symptom: '계정·권한 승인에 막힘',
        risk: '권한이 개인별로 흩어짐',
      },
      {
        title: '운영 통제',
        english: 'Control',
        symptom: '에이전트 품질·비용 불안정',
        risk: '감사와 비용 통제가 어려움',
      },
      {
        title: '운영∙협업 체계',
        english: 'Operating model',
        symptom: '업무 경계와 협업이 모호',
        risk: '생산성 향상이 조직 가치로 연결되지 않음',
      },
    ],
    closing: ['맥락·권한·통제는 기술로,', '운영체계는 제도와 문화로 해결해야 합니다.'],
  },
  ceal: {
    eyebrow: 'AX 환경 구축 솔루션 — Ceal',
    heading: ['전사 AX 확산의 기술적 병목', '데이터, 보안, 비용'],
    body: [
      'Corca의 AX 환경 구축 솔루션 Ceal은',
      '에이전트의 조직 데이터 접근 경로를 하나로 연결하고 통제합니다.',
    ],
    before: 'Ceal 이전',
    after: 'Ceal 이후',
    center: 'Ceal — 데이터, 보안, 비용',
    beforeBadge: '각자 알아서 연결',
    afterBadge: '승인된 단일 게이트웨이에 연결',
    agents: ['개인 Codex', '개인 Claude Code', '사내 에이전트'],
    systems: ['Slack · Notion', 'GitHub · Drive', '사내 시스템'],
    beforeNotes: [
      '각자가 개별 리소스에 API와 MCP로 직접 연결해야 합니다.',
      '누가 언제 어디에 접근했는지 보이지 않습니다.',
      '리소스 연결마다 검색과 컨텍스트 주입이 반복되면서 토큰 사용이 늘어날 수 있습니다.',
    ],
    afterNotes: [
      '모두가 하나의 게이트웨이에 연결하면 모든 호출을 확인하고 기록할 수 있습니다.',
      '팀 프로필별로 권한을 분리하며 권한이 없는 접근은 게이트웨이에서 막힙니다.',
      '중복 검색 및 불필요한 컨텍스트 주입을 줄여 토큰 사용량을 최적화합니다.',
    ],
    closing: [
      '흩어진 데이터를 연결합니다.',
      '접근 기록을 남깁니다.',
      '토큰 낭비를 줄입니다.',
      'Ceal은 고객 인프라 안에서 온프레미스 방식으로 구동되어 허용된 경로에만 접근합니다.',
    ],
  },
  packages: {
    eyebrow: '컨설팅 패키지 구성',
    heading: ['진단하고, 함께 풀고,', '조직을 바꿉니다.'],
    cards: [
      {
        name: 'Discovery · 2주',
        title: 'AX 과제 진단',
        items: [
          'AI 전환 과제 목록을 효과적으로 수집하기 위한 가이드',
          '고객사 여건에 맞춘 과제 분류와 해결 전략 제시',
          '과제 해결을 위한 AI 활용 특강과 간담회 진행',
          '고객사의 AX 담당자와 함께 후속 세션 및 프로젝트 설계',
          '필요 시 전사·팀 단위 집체교육 진행 (별도 비용)',
        ],
      },
      {
        name: 'Growth · 총 8주 (Discovery 포함)',
        title: 'AX 챔피언 양성 코칭',
        items: [
          'AX 챔피언 후보 선정 · 먼저 할수록 유리한 과제 선정',
          'HR 및 AX 조직 대상 PoC 코칭 세션 1~2회',
          'AX 챔피언 대상 코칭 세션 4~6회',
          '실무 과제를 함께 풀며 산출물 구현',
          '컨설팅 기간 동안 실시간 온라인 Q&A',
          '팀 단위 확산을 위한 AX 플레이북 제공',
        ],
      },
      {
        name: 'Integration · 협의',
        title: 'AX 환경·운영체계 구축',
        items: [
          '데이터 유출 · 비용 폭증 방지용 전사 AX 거버넌스 수립',
          'AX 전파를 돕는 보상·제도·평가 연계 프레임워크',
          'Ceal 등 AX 환경 구축 솔루션 도입',
          'Codex · OpenAI API 활용 자체 솔루션 구축',
          'Corca의 AI 네이티브 팀 빌딩·문화·프로세스 확산',
        ],
      },
    ],
    notes: [
      '교육 비용, Ceal 비용, ChatGPT Enterprise 도입 지원 및 계약 비용은 별도입니다. 솔루션 및 엔터프라이즈 계약을 함께 진행하는 경우, 중복되는 컨설팅 범위만큼 비용이 조정됩니다.',
      '최종 가격은 참여 인원, 대상 사업부, 과제 수, 온사이트 세션 수에 따라 결정됩니다.',
    ],
  },
  partner: {
    eyebrow: 'OpenAI Select Partner',
    heading: ['Corca가 2026년 7월', 'OpenAI Select Partner로 선정되었습니다.'],
    body: [
      'Corca는 OpenAI와 협력해 다양한 조직의 AX를 돕고 있습니다.',
      'Corca를 통해 OpenAI의 ChatGPT Enterprise 계약을 체결하는 조직에는',
      '중복되는 컨설팅 범위의 비용 조정을 비롯한 연계 혜택이 제공됩니다.',
    ],
    pressLabel: '언론보도 보기',
    pressUrl: 'https://www.mk.co.kr/news/it/12102704',
  },
  contact: {
    heading: ['고민 중인 과제가', '있으신가요?', '2주 AX 과제 진단으로', '시작하세요.'],
    dialogBody: {
      lead: '이미 AI를 도입했지만',
      selection: '과제 선정, 활용 확산,',
      constraint: '데이터·보안·비용 통제에 막혀 있다면',
      route: '2주 동안 우선순위와 해결 경로를 진단하고',
      next: '다음 실행 계획을 설계해 보세요.',
    },
    body: [
      'AX 과제 선정, 활용 확산,',
      '데이터·보안·비용 통제에 막혀 있으신가요?',
      'Corca AX가 2주 동안',
      '우선순위와 해법을 진단합니다.',
      '진단에서 그치지 않고',
      '실행 계획까지 설계해 드립니다.',
    ],
    labels: {
      name: '성함',
      email: '이메일',
      interests: '관심 있는 컨설팅 형태를 모두 골라 주세요.',
      otherInterest: '관심 있는 형태를 직접 입력해 주세요.',
      reason: '위와 같이 선택한 이유를 말씀해 주세요.',
    },
    interestOptions: [
      { value: 'strategy_diagnosis', label: 'AX 과제 진단' },
      { value: 'champion_coaching', label: 'AX 챔피언 양성 코칭' },
      { value: 'environment_solution', label: 'AX 환경 구축 솔루션 도입' },
      { value: 'custom_ai_solution', label: '조직 맞춤 AI 솔루션 제작' },
      { value: 'enterprise_adoption', label: 'ChatGPT Ent. 도입 및 활용률 증대' },
      { value: 'ai_native_team', label: 'AI 네이티브 팀 빌딩' },
      { value: 'ai_capability_training', label: 'AI 역량 향상 교육' },
      { value: 'other', label: '기타' },
    ],
    placeholders: {
      name: '홍길동',
      email: 'hong.kildong@company.com',
      otherInterest: '관심 있는 컨설팅 형태를 입력해 주세요.',
      reason: '자세히 얘기해주실수록 더 효과적인 상담이 가능합니다.',
    },
    privacyNotice: '기입하신 이메일 주소는 상담 문의 응대에만 사용됩니다.',
    submit: '상담 신청하기',
    sending: '상담 신청을 전송하고 있습니다.',
    success: '상담 신청이 잘 전송되었습니다.',
    disabled: '상담 접수 기능을 불러오고 있습니다.',
    validation: '입력 내용을 확인해 주세요.',
    error: '입력 내용을 다시 확인해 주세요.',
    directLead: 'Corca AX Lead에게 직접 상담받고 싶으시다면,',
    emailLabel: '직접 메일 상담',
    email: 'bae.hwidong@corca.ai',
    phoneLabel: '전화 상담',
    phone: '02-6925-6978',
  },
} as const;

function mergeLocalized<T>(base: T, override: unknown): T {
  if (override === undefined) return base;
  if (Array.isArray(base) && Array.isArray(override)) {
    const containsObjects = override.some(
      (item) => typeof item === 'object' && item !== null && !Array.isArray(item),
    );
    if (!containsObjects) return override as T;
    return base.map((item, index) => mergeLocalized(item, override[index])) as T;
  }
  if (
    typeof base === 'object' &&
    base !== null &&
    typeof override === 'object' &&
    override !== null
  ) {
    return Object.fromEntries(
      Object.entries(base).map(([key, value]) => [
        key,
        mergeLocalized(value, (override as Record<string, unknown>)[key]),
      ]),
    ) as T;
  }
  return override as T;
}

export const axV2ContentByLang: Record<Lang, typeof axV2Content> = {
  ko: axV2Content,
  en: mergeLocalized(axV2Content, axV2ContentOverrides.en),
  ja: mergeLocalized(axV2Content, axV2ContentOverrides.ja),
  zh: mergeLocalized(axV2Content, axV2ContentOverrides.zh),
};

export const axV2Assets = {
  hero: {
    mobileAvif: '/images/pages/ax/visuals/01-hero-mobile.avif',
    mobileWebp: '/images/pages/ax/visuals/01-hero-mobile.webp',
    wideAvif: '/images/pages/ax/visuals/01-hero-wide.avif',
    wideWebp: '/images/pages/ax/visuals/01-hero-wide.webp',
    video: '/video/ax/B-0715-A_seamless_loop_video_of_a_maj.webm',
  },
  compoundOrcas: {
    avif: '/images/pages/ax-v2/v3/compound-atlantic-orca-pod-v3-1694.avif',
    webp: '/images/pages/ax-v2/v3/compound-atlantic-orca-pod-v3-1694.webp',
    jpg: '/images/pages/ax-v2/v3/compound-atlantic-orca-pod-v3-1694.jpg',
    width: 1694,
    height: 928,
  },
  cealSealBackground: {
    avif: '/images/pages/ax-v2/v3/ceal-seal-background-v1-1586.avif',
    webp: '/images/pages/ax-v2/v3/ceal-seal-background-v1-1586.webp',
    jpg: '/images/pages/ax-v2/v3/ceal-seal-background-v1-1586.jpg',
    width: 1586,
    height: 992,
  },
  partnerNetwork: '/images/pages/ax/visuals/OAI_PartnerNetwork_SelectPartner.svg',
  partnerNetworkPortrait: '/images/pages/ax/visuals/OAI_PartnerNetwork_SelectPartner_Portrait.svg',
  testimonials: {
    kyowon: {
      webp: '/images/pages/ax/logos/v1/high-logo02.webp',
      png: '/images/pages/ax/logos/high-logo02.png',
      width: 150,
      height: 60,
    },
    tyche: {
      webp: '/images/pages/ax/logos/v1/high-logo01.webp',
      png: '/images/pages/ax/logos/high-logo01.png',
      width: 184,
      height: 60,
    },
  },
  organizations: [
    [184, 60],
    [150, 60],
    [224, 60],
    [244, 60],
    [335, 60],
    [228, 60],
    [243, 60],
    [209, 60],
    [235, 60],
    [163, 60],
  ].map(([width, height], index) => {
    const name = `high-logo0${index + 1}`;
    return {
      webp: `/images/pages/ax/logos/v1/${name}.webp`,
      png: `/images/pages/ax/logos/${name}.png`,
      width,
      height,
    };
  }),
  openAiCorca: {
    webp: '/images/pages/ax-v2/v1/openai-corca-600.webp',
    png: '/images/pages/ax-v2/v1/openai-corca-600.png',
    width: 600,
    height: 128,
  },
} as const;
