import type { Lang } from '../../../i18n/ui';
import type { AxTopicId } from './contract';

type Triple<T> = readonly [T, T, T];
type Pair<T> = readonly [T, T];
type Five<T> = readonly [T, T, T, T, T];
type Six<T> = readonly [T, T, T, T, T, T];

type AxHeadlineLine = {
  before?: string;
  strong?: string;
  after?: string;
};

type AxPainCardId = 'context' | 'operations' | 'responsibility';
type AxTestimonialId = 'tyche' | 'kyowon';
type AxPackageId = 'decision_map' | 'operational_transition' | 'organization_scaling';

type AxFormErrors = {
  invalidRequest: string;
  checkFields: string;
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
  consent: string;
  formExpired: string;
  tooQuick: string;
  botCheckRequired: string;
  botCheckUnavailable: string;
  deliveryUnavailable: string;
  deliveryFailed: string;
  generic: string;
  emailLink: string;
};

export type AxContent = {
  brand: {
    homeAriaLabel: string;
    logoAlt: string;
    partnerLogoAlt: string;
    brochureCta: string;
    brochureAriaLabel: string;
    consultationCta: string;
    organizationsAriaLabel: string;
    organizationLogosAriaLabel: string;
  };
  hero: {
    eyebrow: string;
    headline: readonly AxHeadlineLine[];
    subtitle: readonly string[];
    consultationCta: string;
    exploreCta: string;
  };
  belief: {
    eyebrow: string;
    headline: readonly AxHeadlineLine[];
    body: readonly string[];
    testimonials: Pair<{
      id: AxTestimonialId;
      quote: readonly string[];
      company: string;
      source: string;
      logoAlt: string;
    }>;
    testimonialCarousel: {
      ariaLabel: string;
      slideSelectionAriaLabel: string;
      slideAriaTemplate: string;
      viewSlideAriaTemplate: string;
      previous: string;
      next: string;
      reducedMotion: string;
      pause: string;
      replay: string;
      play: string;
    };
    proofAriaLabel: string;
    proof: {
      organizations: { value: string; label: string };
      participants: { value: string; label: string };
      completion: { value: readonly string[]; label: string };
    };
  };
  gap: {
    imageAlt: string;
    eyebrow: string;
    headline: readonly AxHeadlineLine[];
    steps: Triple<{
      id: 'past' | 'now' | 'organization';
      kicker: string;
      statistic?: { value: string; suffix: string };
      headline: readonly string[];
      body: readonly string[];
      sourceLink?: string;
    }>;
  };
  bottleneck: {
    eyebrow: string;
    headline: readonly AxHeadlineLine[];
    body: string;
    cards: Triple<{ id: AxPainCardId; title: string; body: string }>;
    carousel: {
      ariaLabel: string;
      slideSelectionAriaLabel: string;
      slideAriaTemplate: string;
      viewSlideAriaTemplate: string;
      reducedMotion: string;
      pause: string;
      replay: string;
      play: string;
      previous: string;
      next: string;
    };
  };
  method: {
    eyebrow: string;
    headline: readonly AxHeadlineLine[];
    steps: Triple<{
      step: '01' | '02' | '03';
      title: string;
      body: readonly [string, string];
    }>;
  };
  internalProof: {
    eyebrow: string;
    headline: readonly AxHeadlineLine[];
    body: readonly string[];
    cadenceAriaLabel: string;
    cadence: Triple<{
      frequency: string;
      name: string;
      body: string;
    }>;
  };
  decisionMap: {
    imageAlt: string;
    eyebrow: string;
    headline: readonly AxHeadlineLine[];
    body: string;
    total: { label: string; value: number; suffix: string };
    stats: Triple<{ value: number; suffix: string; label: string }>;
    note: string;
  };
  pairWork: {
    imageAlt: string;
    eyebrow: string;
    headline: readonly AxHeadlineLine[];
    body: string;
    client: { label: string; strengths: Triple<string> };
    corca: { label: string; strengths: Triple<string> };
  };
  champion: {
    eyebrow: string;
    headline: readonly AxHeadlineLine[];
    body: string;
    imageAlt: string;
    steps: Triple<{
      step: '01' | '02' | '03';
      kicker: string;
      headline: readonly string[];
      body: string;
    }>;
  };
  reuse: {
    imageAlt: string;
    eyebrow: string;
    headline: readonly AxHeadlineLine[];
    body: string;
    layers: Triple<{ title: string; body: string }>;
  };
  program: {
    eyebrow: string;
    headline: readonly AxHeadlineLine[];
    packages: Triple<{
      id: AxPackageId;
      phase: string;
      title: string;
      price: string;
      featured: boolean;
      items: readonly [string, string, string, string];
    }>;
    scheduleNote: string;
    outcome: {
      question: string;
      lead: string;
      strong: string;
      metrics: Six<string>;
    };
    faqEyebrow: string;
    faqTitle: string;
    faqs: Five<{ question: string; answer: string }>;
  };
  contact: {
    imageAlt: string;
    eyebrow: string;
    question: readonly string[];
    answer: readonly string[];
    fitLead: string;
    fitItems: Triple<string>;
    emailAriaLabel: string;
    details: {
      intro: Pair<string>;
      owner: string;
      email: string;
      ccEmail: string;
      phone: string;
      closing: string;
    };
    form: {
      heading: string;
      summary: string;
      requiredLabel: string;
      optionalLabel: string;
      fields: {
        name: { label: string; placeholder: string };
        email: { label: string; placeholder: string };
        phone: { label: string; placeholder: string };
        topic: { label: string; placeholder: string };
        message: { label: string; placeholder: string };
        website: { label: string };
      };
      topics: Record<AxTopicId, string>;
      consent: string;
      privacyPolicyLabel: string;
      submit: string;
      sending: string;
      note: string;
      errors: AxFormErrors;
      success: {
        title: string;
        body: string;
      };
      statusAriaLabel: string;
    };
  };
};

export const axContent: Record<Lang, AxContent> = {
  ko: {
    brand: {
      homeAriaLabel: 'Corca AX 처음으로',
      logoAlt: 'Corca AX',
      partnerLogoAlt: 'OpenAI Partner Network Select Partner',
      brochureCta: '더 알아보기 | 브로셔',
      brochureAriaLabel: 'Corca AX 브로셔 새 창에서 열기',
      consultationCta: '상담신청하기',
      organizationsAriaLabel: 'Corca AX와 함께한 조직',
      organizationLogosAriaLabel: 'Corca AX와 함께한 10개 조직의 로고',
    },
    hero: {
      eyebrow: 'AX 가속화 컨설팅',
      headline: [
        { before: 'AI 도입은' },
        { before: '누구나 할 수 있습니다' },
        { strong: '반복되는 성과는' },
        { strong: '아무나 만들지 못합니다' },
      ],
      subtitle: ['첫 성과가 다음 성과로 이어지는 조직.', 'Corca AX가 함께 만듭니다.'],
      consultationCta: '상담신청하기',
      exploreCta: 'Corca AX만의 컨설팅 보기',
    },
    belief: {
      eyebrow: '스스로 성장하는 조직만들기에 진심인 Corca AX',
      headline: [{ before: '도구는 살 수 있습니다.' }, { strong: '강한 조직은 만들어야 합니다.' }],
      body: [
        'Corca AX는 답만 주고 떠나지 않습니다.',
        'Corca AX는 첫 번째 AX 업무를 함께 실행하고,',
        '컨설팅 이후에도 스스로 문제를 풀 힘을 조직 안에 남기는 일에 진심입니다.',
      ],
      testimonials: [
        {
          id: 'tyche',
          quote: ['코르카의 AX 컨설팅이 없었다면,', '타이키의 AX는 3~4개월은 늦었을 겁니다.'],
          company: '타이키 테크놀로지스',
          source: '고객 인터뷰 · 2026년 7월',
          logoAlt: 'TYCHE Technologies',
        },
        {
          id: 'kyowon',
          quote: [
            '모두가 우왕좌왕하고 있을 때 코르카를 만났습니다. 함께 과제를 선정하고 AX 챔피언 육성 컨설팅을 진행하며 참여자들의 집중도가 확 올라가고, ‘이런 분들을 챔피언으로 삼으면 되겠구나’ 하는 내부 선별 기준이 잘 잡혔습니다.',
          ],
          company: '교원 그룹',
          source: '고객인터뷰-2026년 7월',
          logoAlt: 'KYOWON 교원',
        },
      ],
      testimonialCarousel: {
        ariaLabel: 'Corca AX 고객 후기',
        slideSelectionAriaLabel: '고객 후기 선택',
        slideAriaTemplate: '{current} / {total} — {company}',
        viewSlideAriaTemplate: '{company} 고객 후기 보기',
        previous: '이전 고객 후기',
        next: '다음 고객 후기',
        reducedMotion: '모션 줄이기 설정으로 고객 후기 자동 재생이 꺼져 있습니다',
        pause: '고객 후기 자동 재생 일시정지',
        replay: '고객 후기를 처음부터 다시 재생',
        play: '고객 후기 자동 재생 시작',
      },
      proofAriaLabel: 'Corca AX 활동 기록',
      proof: {
        organizations: { value: '20+', label: 'Corca AX와 함께한 조직' },
        participants: { value: '1,000+', label: 'Corca AX 프로그램 참여자' },
        completion: {
          value: ['첫 업무부터 다음 업무를 실행할', '힘을 갖춘 조직이 되는 것까지'],
          label: 'Corca AX가 정의한 프로젝트 완료 기준',
        },
      },
    },
    gap: {
      imageAlt: '같은 바다에서 서로 다른 속도로 이동하는 범고래 무리',
      eyebrow: '현장의 고민을 파악한 Corca AX',
      headline: [
        { before: 'AI의 격차는 모델보다,' },
        { strong: '실제 업무에 올리는 속도', after: '에서 벌어집니다.' },
      ],
      steps: [
        {
          id: 'past',
          kicker: '과거에도 똑같았습니다',
          headline: ['컴퓨터 구매는 하루,', '일하는 방식을', '바꾸는 데는 수년.'],
          body: [
            '혁신적인 기술만으로는',
            '생산성을 만들지 못했습니다.',
            '왜냐면 업무와 권한, 정보의 흐름이',
            '함께 바뀌어야 하기 때문입니다.',
          ],
        },
        {
          id: 'now',
          kicker: 'NOW',
          statistic: { value: '95', suffix: '%' },
          headline: [
            'AI를 도입한 대다수 기업들은',
            '측정 가능한 손익 효과를',
            '확인하지 못했습니다.',
          ],
          body: [
            'Project NANDA의 2025년 예비 연구에 따르면, 대다수 기업은 AI 도입으로 인한 생산성 증대를 체감하지 못하고 있다고 합니다.',
          ],
          sourceLink: '연구 원문 보기 ↗',
        },
        {
          id: 'organization',
          kicker: '왜 이러한 일이 벌어질까 살펴봤습니다',
          headline: ['AI 활용 시, 생산성 병목은', '결국 조직의 역량에 있습니다.'],
          body: [
            '같은 AI를 써도 결과가 다른 이유. 누가 실제 업무에 연결하고, 운영하며, 확산시키는지가 다르기 때문입니다.',
          ],
        },
      ],
    },
    bottleneck: {
      eyebrow: 'AI도입은 시작일 뿐',
      headline: [{ before: '도입 후에는' }, { strong: '기술보다 운영에서 막힙니다.' }],
      body: 'AI 솔루션과 모델을 고르는 문제는 시작에 가깝습니다. 진짜 난관은 조직 안에 있습니다.',
      cards: [
        {
          id: 'context',
          title: '흩어진 맥락',
          body: '업무 지식은 문서와 메신저, 사람의 기억에 흩어져 있습니다. AI는 그 맥락을 모르면 그럴듯한 답만 만듭니다.',
        },
        {
          id: 'operations',
          title: '멈추는 운영',
          body: '데모는 돌아가도 실제 업무에서는 권한과 예외, 시스템 연결에서 멈춥니다. PoC가 운영이 되지 못하는 이유입니다.',
        },
        {
          id: 'responsibility',
          title: '불분명한 책임',
          body: '누가 판단하고, 누가 승인하며, 실패하면 어디까지 되돌릴지 정하지 않으면 AI는 조직의 일이 되지 못합니다.',
        },
      ],
      carousel: {
        ariaLabel: 'AI 도입 후 조직이 마주하는 운영 병목',
        slideSelectionAriaLabel: '슬라이드 선택',
        slideAriaTemplate: '{current} / {total} — {title}',
        viewSlideAriaTemplate: '{title} 슬라이드 보기',
        reducedMotion: '모션 줄이기 설정으로 자동 재생이 꺼져 있습니다',
        pause: '자동 재생 일시정지',
        replay: '처음부터 다시 재생',
        play: '자동 재생 시작',
        previous: '이전 슬라이드',
        next: '다음 슬라이드',
      },
    },
    method: {
      eyebrow: '현장에서 답을 찾은 Corca AX',
      headline: [
        { before: 'AI로 해결할 ', strong: '핵심 문제를 찾고' },
        { before: '첫 업무를 ', strong: '함께 실행해서 바꾸고' },
        { before: '다음 업무까지 ', strong: '스스로 수행', after: '해 낼' },
        { strong: '힘을 갖춘 조직', after: '을 만듭니다.' },
      ],
      steps: [
        {
          step: '01',
          title: '풀 문제를 고릅니다',
          body: [
            '경영 목표와 현업의 병목을 연결합니다.',
            'AI로 풀 가치가 없는 문제는 처음부터 제외합니다.',
          ],
        },
        {
          step: '02',
          title: '실제 업무를 바꿉니다',
          body: [
            '보고서로 끝내지 않습니다.',
            '데이터와 권한, 승인 절차를 연결해 첫 업무를 운영에 올립니다.',
          ],
        },
        {
          step: '03',
          title: '다음 문제를 풀 힘을 남깁니다',
          body: [
            '판단 기준과 스킬, 운영 기록을 조직 안에 남깁니다.',
            '두 번째 업무는 고객이 직접 확장합니다.',
          ],
        },
      ],
    },
    internalProof: {
      eyebrow: '우리 조직에 먼저 적용해 성과를 만들어 가는 중',
      headline: [{ before: '고객에게 권하기 전에,' }, { strong: 'Corca부터 바꿨습니다.' }],
      body: [
        '회사의 모든 구성원이 AI를 배우는 것에서 멈추지 않았습니다.',
        '실제 업무에서 해결할 과제를 고르고, AI와 함께 만들고, 매주 실패와 성공을 나누면서 성장해왔습니다.',
      ],
      cadenceAriaLabel: 'Corca AX의 월간·주간·일간 운영 리듬',
      cadence: [
        {
          frequency: '매월 진행하는',
          name: 'AX Day',
          body: '교육용 예제가 아니라 각 팀의 업무를 가져와 프로토타입을 만들었습니다.',
        },
        {
          frequency: '매주 진행하는',
          name: 'AX 공유회',
          body: '잘된 프롬프트만이 아니라 막힌 이유와 다시 쓸 스킬을 함께 축적했습니다.',
        },
        {
          frequency: '매일 함께하는 에이전트',
          name: 'Corca 에이전트',
          body: '조직 안내, 지출결의, 조사와 후속 행동처럼 반복되는 업무에 먼저 적용했습니다.',
        },
      ],
    },
    decisionMap: {
      imageAlt: '갈라졌다 다시 합류하는 바닷속 빛의 흐름',
      eyebrow: 'NOT EVERYTHING NEEDS AI',
      headline: [{ before: '모든 문제를' }, { strong: 'AI로 풀지 않습니다.' }],
      body: '좋은 AX는 무엇을 만들지보다 무엇을 만들지 않을지 먼저 정합니다.',
      total: { label: '현업 인터뷰에서 찾은 업무', value: 61, suffix: '개' },
      stats: [
        { value: 11, suffix: '개', label: '지금 바로 바꿀 업무' },
        { value: 44, suffix: '개', label: '조건부터 만들어야 할 업무' },
        { value: 6, suffix: '개', label: 'AI가 맞지 않는 업무' },
      ],
      note: '교원그룹 AX 과제 분류 작업 기준. 고객사의 실제 업무·데이터·권한 조건에 따라 결과는 달라집니다.',
    },
    pairWork: {
      imageAlt: '나란히 같은 방향으로 움직이는 두 범고래',
      eyebrow: '현장의 전문가와 함께 하는 짝작업',
      headline: [
        { before: '문제를 잘 아는 사람과,' },
        { strong: 'AI를 잘 아는 사람이' },
        { strong: '함께 풉니다.' },
      ],
      body: '현업은 판단 기준과 예외를 압니다. Corca는 AI가 그 지식을 실제 업무에서 쓰게 만듭니다.',
      client: { label: '고객 현업', strengths: ['암묵지', '판단 기준', '책임'] },
      corca: { label: 'Corca AX', strengths: ['AI 설계', '시스템 연결', '운영 전환'] },
    },
    champion: {
      eyebrow: 'FROM FIRST TO NEXT',
      headline: [{ before: '첫 업무는 함께.' }, { strong: '다음 업무는 스스로.' }],
      body: 'Corca가 떠난 날이 끝이 아닙니다. 고객이 두 번째 업무를 직접 확장한 날이 끝입니다.',
      imageAlt: '한 테이블에서 함께 업무를 검토하는 한국인 AX 실무자 세 명',
      steps: [
        {
          step: '01',
          kicker: 'Corca AX와 함께 짝작업',
          headline: ['첫 업무를', '실제 운영에'],
          body: '판단 기준과 예외를 함께 구조화합니다.',
        },
        {
          step: '02',
          kicker: '사내 AX챔피언 육성',
          headline: ['팀의 암묵지를', '조직의 기준으로'],
          body: '프롬프트를 잘 쓰는 사람이 아니라 로컬 판단에 책임지는 사람입니다.',
        },
        {
          step: '03',
          kicker: '매일 성장하는 AX 조직',
          headline: ['두 번째 업무부터', '스스로 AI와 함께'],
          body: '승인과 감사 기준을 지키며 다음 업무부터 스스로 수행합니다.',
        },
      ],
    },
    reuse: {
      imageAlt: '바닷속에서 여러 겹으로 쌓이는 푸른 빛의 층',
      eyebrow: 'REUSABLE BY DESIGN',
      headline: [
        { before: '한 번 해결한 문제는,' },
        { strong: '안전하게 조직내에서' },
        { strong: '다시 쓸 수 있어야 합니다.' },
      ],
      body: '사람을 더 넣어 반복하지 않습니다. 검증한 해결법을 맥락과 스킬, 통제 기준으로 남깁니다.',
      layers: [
        {
          title: 'Ceal',
          body: '업무에 필요한 조직의 맥락과 도구를 연결합니다. 필요한 지식을 필요한 결정 앞에 가져옵니다.',
        },
        {
          title: 'CAPS',
          body: '현장에서 검증한 해결법을 스킬과 평가 기준으로 남깁니다. 다음 업무는 처음부터 만들지 않습니다.',
        },
        {
          title: '권한·승인·감사',
          body: '결정권은 현장으로 옮기되 책임은 흐려지지 않게 합니다. 누가 무엇을 했는지 다시 확인할 수 있어야 합니다.',
        },
      ],
    },
    program: {
      eyebrow: '검증하며, 세 단계로 진행합니다.',
      headline: [
        { before: '작게 진단하고.' },
        { before: '운영으로 증명하고.' },
        { strong: '증명된 만큼만 넓힙니다.' },
      ],
      packages: [
        {
          id: 'decision_map',
          phase: '진단',
          title: '어디부터 풀지 결정',
          price: '2주',
          featured: false,
          items: [
            '먼저 풀 업무와 미룰 업무 결정',
            '실제 결정권자와 현장 전문가 선정',
            '데이터·권한·승인 구조 분석',
            '다음 6주 실행 범위 확정',
          ],
        },
        {
          id: 'operational_transition',
          phase: '증명',
          title: '첫 업무를 현장에 적용',
          price: '6주',
          featured: true,
          items: [
            '첫 업무를 실제 현장에 적용',
            '처리·승인 시간이 얼마나 줄었는지 측정',
            '보안·권한·감사 기준 연동',
            '현업이 다음 업무에 직접 적용',
          ],
        },
        {
          id: 'organization_scaling',
          phase: '확장',
          title: '업무·부서로 확장',
          price: '분기 / 연 단위',
          featured: false,
          items: [
            '여러 업무, 여러 부서로',
            '전사 운영 기준 정착',
            '시스템 연동과 운영 내재화',
            '분기마다 넓혀가는 확장 계획',
          ],
        },
      ],
      scheduleNote: '수행 일정은 고객사와의 협의에 따라 변경됩니다.',
      outcome: {
        question: '무엇을 AX 성과로 잡으시나요?',
        lead: '성과는 AI사용량이 아니라,',
        strong: '의사 결정의 품질입니다.',
        metrics: [
          '결정에 걸리는 시간',
          '승인까지 걸리는 시간',
          '현장에서 스스로 처리하는 비율',
          '다시 하는 일의 비율',
          '예외 상황 대응력',
          '의사결정을 돕는 범위 확대',
        ],
      },
      faqEyebrow: 'BEFORE WE START',
      faqTitle: '자주 묻는 질문',
      faqs: [
        {
          question: 'AI 교육이나 일반 컨설팅과 무엇이 다릅니까?',
          answer:
            '교육은 사용법을 알려줍니다. Corca AX는 풀 문제를 고르고, 첫 업무를 실제 운영에 올리며, 다음 업무를 고객이 직접 확장할 수 있게 만듭니다.',
        },
        {
          question: '어떤 업무부터 시작합니까?',
          answer:
            '자주 반복되고, 되돌릴 수 있으며, 현장 지식이 중요한 결정을 먼저 봅니다. 위험이 크고 되돌리기 어려운 결정부터 자동화하지 않습니다.',
        },
        {
          question: '6주 안에 무엇을 확인할 수 있습니까?',
          answer:
            '첫 업무가 실제 환경에서 반복되는지, 처리와 승인 시간이 달라졌는지, 고객 책임자가 두 번째 업무를 직접 적용할 수 있는지 확인합니다.',
        },
        {
          question: '보안과 책임은 어떻게 다룹니까?',
          answer:
            '데이터 경계, 접근 권한, 승인 단계, 예외 처리, 감사 기록, 중단과 복구 기준을 업무 설계에 함께 넣습니다.',
        },
        {
          question: 'Corca AX가 떠난 뒤에도 운영할 수 있습니까?',
          answer:
            '그것이 프로젝트의 종료 조건입니다. 첫 업무만 남기는 것이 아니라 판단 기준과 스킬, 운영 방법을 함께 넘깁니다.',
        },
      ],
    },
    contact: {
      imageAlt: '밝은 수면으로 올라가는 범고래',
      eyebrow: '20분 AX 진단을 위한 통화',
      question: ['해결하고 싶은', '업무가 있으신가요?'],
      answer: ['Corca AX가', '함께 해결하겠습니다.'],
      fitLead: '이런 일이라면, 20분 AX 진단이 특히 잘 맞습니다',
      fitItems: ['자주 반복되는 업무', '판단 기준이 명확한 업무', '현장 지식이 중요한 업무'],
      emailAriaLabel: '이메일로 문의하기',
      details: {
        intro: ['컨설팅 계약 및 비용에 관한 문의는', '아래로 연락 주시기 바랍니다.'],
        owner: '배휘동',
        email: 'bae.hwidong@corca.ai',
        ccEmail: 'corca-tax@corca.ai',
        phone: '02-6925-6978',
        closing: '논의 내용에 맞춰 성실히 안내드리겠습니다.',
      },
      form: {
        heading: '상담 신청',
        summary: '필수 4개 · 내용 선택',
        requiredLabel: '필수',
        optionalLabel: '선택',
        fields: {
          name: { label: '이름', placeholder: '이름을 기입해주세요' },
          email: { label: '이메일', placeholder: '회사 이메일 추천드립니다' },
          phone: { label: '전화번호', placeholder: '010-0000-0000' },
          topic: { label: '문의 유형', placeholder: '선택해주세요' },
          message: {
            label: '해결하고 싶은 업무',
            placeholder: '지금 가장 오래 기다리거나, 자주 되풀이되는 업무를 적어주세요.',
          },
          website: { label: '웹사이트' },
        },
        topics: {
          strategy_discovery: 'AX 전략·과제 발굴',
          decision_map: '2주 의사결정 지도',
          operations_transition: '6주 운영 전환',
          organization_adoption: '조직 확산·AX Champion',
          openai_adoption: 'OpenAI 도입·활성화',
          other: '기타',
        },
        consent:
          '상담을 위해 이름·이메일·전화번호를 수집하고 담당자에게 전달하며, 신청일로부터 1년간 보관하는 데 동의합니다. 동의를 거부할 수 있으나 상담 신청은 제한됩니다.',
        privacyPolicyLabel: '개인정보 처리방침 보기 ↗',
        submit: '20분 상담 신청하기',
        sending: '보내는 중입니다',
        note: '내용을 길게 쓰지 않으셔도 됩니다. 담당자가 확인한 뒤 상담 일정을 안내드립니다.',
        errors: {
          invalidRequest: '요청 형식을 확인해 주세요.',
          checkFields: '입력 내용을 확인해 주세요.',
          name: '이름을 80자 이내로 입력해 주세요.',
          email: '올바른 이메일 주소를 입력해 주세요.',
          phone: '연락 가능한 전화번호를 입력해 주세요.',
          topic: '문의 유형을 선택해 주세요.',
          message: '문의 내용은 2,000자 이내로 입력해 주세요.',
          consent: '개인정보 수집·이용에 동의해 주세요.',
          formExpired: '상담 양식을 새로고침한 뒤 다시 작성해 주세요.',
          tooQuick: '잠시 후 다시 제출해 주세요.',
          botCheckRequired: '자동 제출 방지 확인을 완료해 주세요.',
          botCheckUnavailable:
            '자동 제출 방지 확인이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.',
          deliveryUnavailable: '현재 온라인 접수가 준비 중입니다. 이메일로 문의해 주세요.',
          deliveryFailed:
            '상담 요청을 전달하지 못했습니다. 잠시 후 다시 시도하거나 이메일로 문의해 주세요.',
          generic: '잠시 후 다시 시도해 주세요.',
          emailLink: '이메일로 문의하기',
        },
        success: {
          title: '상담 신청이 접수되었습니다.',
          body: '남겨주신 내용을 담당자가 확인한 뒤 연락드리겠습니다. 해결하고 싶은 업무와 현재의 병목을 중심으로 첫 대화를 준비하겠습니다.',
        },
        statusAriaLabel: '상담 신청 상태',
      },
    },
  },
  en: {
    brand: {
      homeAriaLabel: 'Back to the top of Corca AX',
      logoAlt: 'Corca AX',
      partnerLogoAlt: 'OpenAI Partner Network Select Partner',
      brochureCta: 'Learn more | Brochure',
      brochureAriaLabel: 'Open the Corca AX brochure in a new tab',
      consultationCta: 'Book a consultation',
      organizationsAriaLabel: 'Organizations that have worked with Corca AX',
      organizationLogosAriaLabel: 'Logos of 10 organizations that have worked with Corca AX',
    },
    hero: {
      eyebrow: 'AX ACCELERATION CONSULTING',
      headline: [
        { before: 'Anyone can adopt AI.' },
        { strong: 'Few can turn it into' },
        { strong: 'repeatable results.' },
      ],
      subtitle: [
        'Build an organization where one win leads to the next.',
        'Corca AX helps you get there.',
      ],
      consultationCta: 'Book a consultation',
      exploreCta: 'See how Corca AX works',
    },
    belief: {
      eyebrow: 'CORCA AX IS COMMITTED TO BUILDING TEAMS THAT KEEP GETTING BETTER',
      headline: [
        { before: 'You can buy the tools.' },
        { strong: 'A strong organization must be built.' },
      ],
      body: [
        'Corca AX does not hand over an answer and walk away.',
        'We deliver the first AX workflow with your team,',
        'then leave your organization with the ability to solve the next problem on its own.',
      ],
      testimonials: [
        {
          id: 'tyche',
          quote: [
            'Without Corca’s AX consulting,',
            'Tyche’s AX transformation would have been delayed by three to four months.',
          ],
          company: 'TYCHE Technologies',
          source: 'Customer interview · July 2026',
          logoAlt: 'TYCHE Technologies',
        },
        {
          id: 'kyowon',
          quote: [
            'We met Corca when everyone was still finding their way. Together, we selected the right initiatives and ran the AX Champion development program. Participant engagement rose sharply, and we established a clear internal standard for identifying the people who should become our AX Champions.',
          ],
          company: 'KYOWON Group',
          source: 'Customer interview · July 2026',
          logoAlt: 'KYOWON Group',
        },
      ],
      testimonialCarousel: {
        ariaLabel: 'Corca AX customer testimonials',
        slideSelectionAriaLabel: 'Choose a customer testimonial',
        slideAriaTemplate: '{current} of {total} — {company}',
        viewSlideAriaTemplate: 'View the {company} testimonial',
        previous: 'Previous testimonial',
        next: 'Next testimonial',
        reducedMotion: 'Testimonial autoplay is off because reduced motion is enabled',
        pause: 'Pause testimonial autoplay',
        replay: 'Replay testimonials from the beginning',
        play: 'Start testimonial autoplay',
      },
      proofAriaLabel: 'Corca AX track record',
      proof: {
        organizations: { value: '20+', label: 'Organizations that have worked with Corca AX' },
        participants: { value: '1,000+', label: 'Participants in Corca AX programs' },
        completion: {
          value: [
            'From delivering the first workflow',
            'to building the capability to deliver the next',
          ],
          label: 'How Corca AX defines project completion',
        },
      },
    },
    gap: {
      imageAlt: 'A pod of orcas moving at different speeds through the same sea',
      eyebrow: 'CORCA AX, GROUNDED IN THE REALITIES OF THE FIELD',
      headline: [
        { before: 'The AI divide is not about the model.' },
        { strong: 'It is about how fast AI reaches real work.' },
      ],
      steps: [
        {
          id: 'past',
          kicker: 'WE HAVE SEEN THIS BEFORE',
          headline: ['Buying a computer took a day.', 'Changing how work got done took years.'],
          body: [
            'Breakthrough technology alone',
            'did not create productivity.',
            'Workflows, authority, and the flow of information',
            'had to change with it.',
          ],
        },
        {
          id: 'now',
          kicker: 'NOW',
          statistic: { value: '95', suffix: '%' },
          headline: [
            'Most companies that adopted AI',
            'have yet to see a measurable',
            'impact on profit and loss.',
          ],
          body: [
            'According to Project NANDA’s preliminary 2025 study, most companies report no meaningful productivity gains from adopting AI.',
          ],
          sourceLink: 'Read the study ↗',
        },
        {
          id: 'organization',
          kicker: 'WE LOOKED AT WHAT IS HOLDING COMPANIES BACK',
          headline: [
            'The productivity bottleneck in AI',
            'is ultimately organizational capability.',
          ],
          body: [
            'The same AI produces different outcomes depending on who connects it to real work, operates it, and scales it across the organization.',
          ],
        },
      ],
    },
    bottleneck: {
      eyebrow: 'ADOPTION IS ONLY THE START',
      headline: [
        { before: 'After adoption,' },
        { strong: 'operations—not technology—become the bottleneck.' },
      ],
      body: 'Choosing an AI solution or model is only the beginning. The hard part sits inside the organization.',
      cards: [
        {
          id: 'context',
          title: 'Scattered context',
          body: 'Operational knowledge is scattered across documents, messages, and people’s memories. Without that context, AI can only produce plausible-sounding answers.',
        },
        {
          id: 'operations',
          title: 'Stalled operations',
          body: 'A demo may work, but production stalls on permissions, exceptions, and system integration. That is why so many proofs of concept never become day-to-day operations.',
        },
        {
          id: 'responsibility',
          title: 'Unclear accountability',
          body: 'Unless you define who decides, who approves, and how far to roll back after a failure, AI cannot become part of the organization’s work.',
        },
      ],
      carousel: {
        ariaLabel: 'Operational bottlenecks organizations face after adopting AI',
        slideSelectionAriaLabel: 'Choose a slide',
        slideAriaTemplate: '{current} of {total} — {title}',
        viewSlideAriaTemplate: 'View the {title} slide',
        reducedMotion: 'Autoplay is off because reduced motion is enabled',
        pause: 'Pause autoplay',
        replay: 'Replay from the beginning',
        play: 'Start autoplay',
        previous: 'Previous slide',
        next: 'Next slide',
      },
    },
    method: {
      eyebrow: 'CORCA AX, BUILT FROM WHAT WORKS IN THE FIELD',
      headline: [
        { before: 'Find the problems worth solving with AI.' },
        { before: 'Transform the first workflow together.' },
        { strong: 'Build a team that can deliver' },
        { strong: 'the next workflow on its own.' },
      ],
      steps: [
        {
          step: '01',
          title: 'Choose the right problem',
          body: [
            'Connect business goals to frontline bottlenecks.',
            'Rule out problems that are not worth solving with AI from the start.',
          ],
        },
        {
          step: '02',
          title: 'Change the real workflow',
          body: [
            'Do not stop at a report.',
            'Connect data, permissions, and approvals to put the first workflow into production.',
          ],
        },
        {
          step: '03',
          title: 'Leave the capability behind',
          body: [
            'Embed decision criteria, skills, and operating records in the organization.',
            'Your team scales the second workflow itself.',
          ],
        },
      ],
    },
    internalProof: {
      eyebrow: 'WE STARTED WITH OUR OWN ORGANIZATION—AND WE ARE STILL IMPROVING',
      headline: [
        { before: 'Before recommending it to clients,' },
        { strong: 'we transformed Corca first.' },
      ],
      body: [
        'We did not stop after teaching everyone at Corca how to use AI.',
        'We chose real work to improve, built alongside AI, and grew by sharing both failures and wins every week.',
      ],
      cadenceAriaLabel: 'Corca AX monthly, weekly, and daily operating cadence',
      cadence: [
        {
          frequency: 'Every month',
          name: 'AX Day',
          body: 'Teams brought their real work—not training exercises—and built prototypes around it.',
        },
        {
          frequency: 'Every week',
          name: 'AX Review',
          body: 'We captured not only prompts that worked, but also why work stalled and which skills could be reused.',
        },
        {
          frequency: 'Every day',
          name: 'Ceal',
          body: 'We first applied our agent to repeatable work such as company guidance, expense approvals, research, and follow-up actions.',
        },
      ],
    },
    decisionMap: {
      imageAlt: 'Underwater streams of light branching and rejoining',
      eyebrow: 'NOT EVERYTHING NEEDS AI',
      headline: [{ before: 'We do not solve' }, { strong: 'every problem with AI.' }],
      body: 'Good AX begins by deciding what not to build—not only what to build.',
      total: { label: 'Workflows identified in frontline interviews', value: 61, suffix: '' },
      stats: [
        { value: 11, suffix: '', label: 'Workflows ready to change now' },
        { value: 44, suffix: '', label: 'Workflows that need the right conditions first' },
        { value: 6, suffix: '', label: 'Workflows not suited to AI' },
      ],
      note: 'Based on AX opportunity classification work for Kyowon Group. Results vary with each client’s workflows, data, and permission structure.',
    },
    pairWork: {
      imageAlt: 'Two orcas swimming side by side in the same direction',
      eyebrow: 'PAIRING WITH THE PEOPLE WHO KNOW THE WORK',
      headline: [
        { before: 'People who know the problem' },
        { strong: 'solve it with people who know AI.' },
      ],
      body: 'Your frontline experts know the judgment calls and exceptions. Corca makes that knowledge usable by AI in the real workflow.',
      client: {
        label: 'Your frontline team',
        strengths: ['Tacit knowledge', 'Decision criteria', 'Accountability'],
      },
      corca: {
        label: 'Corca AX',
        strengths: ['AI design', 'System integration', 'Operational transition'],
      },
    },
    champion: {
      eyebrow: 'FROM FIRST TO NEXT',
      headline: [{ before: 'The first workflow, together.' }, { strong: 'The next, on your own.' }],
      body: 'The project does not end when Corca leaves. It ends when your team scales the second workflow itself.',
      imageAlt: 'Three Korean AX practitioners reviewing work together at a table',
      steps: [
        {
          step: '01',
          kicker: 'Pair with Corca AX',
          headline: ['Put the first workflow', 'into production'],
          body: 'Structure the decision criteria and exceptions together.',
        },
        {
          step: '02',
          kicker: 'Develop internal AX Champions',
          headline: ['Turn team know-how', 'into organizational standards'],
          body: 'An AX Champion is not simply good at prompting. They take ownership of local judgment.',
        },
        {
          step: '03',
          kicker: 'Build an AX organization that improves daily',
          headline: ['From the second workflow,', 'work with AI on your own'],
          body: 'Your team takes on the next workflow while upholding approval and audit standards.',
        },
      ],
    },
    reuse: {
      imageAlt: 'Layers of blue light stacking beneath the surface',
      eyebrow: 'REUSABLE BY DESIGN',
      headline: [
        { before: 'Once a problem is solved,' },
        { strong: 'the solution should be safe' },
        { strong: 'to reuse across the organization.' },
      ],
      body: 'Do not repeat the work by adding more people. Preserve proven solutions as context, skills, and controls.',
      layers: [
        {
          title: 'Ceal',
          body: 'Connect organizational context and tools to the work. Bring the right knowledge to the point of decision.',
        },
        {
          title: 'CAPS',
          body: 'Capture field-tested solutions as skills and evaluation criteria. The next workflow does not start from scratch.',
        },
        {
          title: 'Permissions, approvals, and audit',
          body: 'Move decisions closer to the frontline without blurring accountability. Every action must remain traceable.',
        },
      ],
    },
    program: {
      eyebrow: 'WE PROCEED IN THREE STAGES, VALIDATING AS WE GO.',
      headline: [
        { before: 'Diagnose small.' },
        { before: 'Prove it in operation.' },
        { strong: 'Expand only as far as proven.' },
      ],
      packages: [
        {
          id: 'decision_map',
          phase: 'Diagnose',
          title: 'Decide where to begin',
          price: '2 weeks',
          featured: false,
          items: [
            'Decide what to tackle first and what to defer',
            'Select the actual decision owners and frontline experts',
            'Analyze data, permission, and approval structures',
            'Confirm the scope of the next six weeks',
          ],
        },
        {
          id: 'operational_transition',
          phase: 'Prove',
          title: 'Apply the first workflow in the field',
          price: '6 weeks',
          featured: true,
          items: [
            'Apply the first workflow in real operations',
            'Measure reductions in processing and approval time',
            'Connect security, permission, and audit standards',
            'Enable the business team to apply it to the next workflow',
          ],
        },
        {
          id: 'organization_scaling',
          phase: 'Scale',
          title: 'Expand across workflows and departments',
          price: 'Quarterly / annual',
          featured: false,
          items: [
            'Across multiple workflows and departments',
            'Establish company-wide operating standards',
            'Integrate systems and embed operations internally',
            'Expand the scope every quarter',
          ],
        },
      ],
      scheduleNote: 'The delivery schedule may change in consultation with the client.',
      outcome: {
        question: 'How do you define AX success?',
        lead: 'Success is not AI usage.',
        strong: 'It is the quality of decisions.',
        metrics: [
          'Time to decision',
          'Time to approval',
          'Share handled independently by the frontline',
          'Rate of rework',
          'Ability to handle exceptions',
          'Breadth of decisions supported',
        ],
      },
      faqEyebrow: 'BEFORE WE START',
      faqTitle: 'Frequently asked questions',
      faqs: [
        {
          question: 'How is this different from AI training or traditional consulting?',
          answer:
            'Training teaches people how to use the tools. Corca AX chooses the right problem, puts the first workflow into production, and enables your team to scale the next one itself.',
        },
        {
          question: 'Which workflow should we start with?',
          answer:
            'We start with decisions that recur often, can be reversed, and rely on frontline knowledge. We do not begin by automating high-risk decisions that are difficult to undo.',
        },
        {
          question: 'What can we validate in six weeks?',
          answer:
            'We validate whether the first workflow runs repeatedly in the real environment, whether processing and approval times change, and whether your owner can apply the approach to a second workflow.',
        },
        {
          question: 'How do you handle security and accountability?',
          answer:
            'We design data boundaries, access permissions, approval stages, exception handling, audit logs, and stop-and-recovery criteria into the workflow from the start.',
        },
        {
          question: 'Can we keep operating after Corca AX leaves?',
          answer:
            'That is our definition of project completion. We hand over not only the first workflow, but also its decision criteria, skills, and operating methods.',
        },
      ],
    },
    contact: {
      imageAlt: 'An orca rising toward the bright surface',
      eyebrow: 'A 20-MINUTE AX DISCOVERY CALL',
      question: ['Is there a workflow', 'you want to improve?'],
      answer: ['Corca AX will', 'solve it with you.'],
      fitLead: 'A 20-minute AX discovery call is a particularly good fit for work that is',
      fitItems: [
        'Repeated often',
        'Guided by clear judgment criteria',
        'Dependent on frontline knowledge',
      ],
      emailAriaLabel: 'Contact us by email',
      details: {
        intro: ['For questions about consulting contracts and fees,', 'please contact us below.'],
        owner: 'Hwidong Bae',
        email: 'bae.hwidong@corca.ai',
        ccEmail: 'corca-tax@corca.ai',
        phone: '02-6925-6978',
        closing: 'We will provide a thoughtful response tailored to your inquiry.',
      },
      form: {
        heading: 'Book a consultation',
        summary: '4 required fields · details optional',
        requiredLabel: 'Required',
        optionalLabel: 'Optional',
        fields: {
          name: { label: 'Name', placeholder: 'Enter your name' },
          email: { label: 'Email', placeholder: 'Work email preferred' },
          phone: { label: 'Phone', placeholder: '+82 10-0000-0000' },
          topic: { label: 'Topic', placeholder: 'Select a topic' },
          message: {
            label: 'Workflow you want to improve',
            placeholder: 'Tell us which work waits the longest or gets repeated most often.',
          },
          website: { label: 'Website' },
        },
        topics: {
          strategy_discovery: 'AX strategy and opportunity discovery',
          decision_map: '2-week AX Decision Map',
          operations_transition: '6-week operational transition',
          organization_adoption: 'Organization-wide scaling and AX Champions',
          openai_adoption: 'OpenAI adoption and activation',
          other: 'Other',
        },
        consent:
          'I consent to the collection of my name, email, and phone number, their sharing with the consultation owner, and retention for one year from the request date. I may refuse, but then cannot submit this request.',
        privacyPolicyLabel: 'View the privacy policy ↗',
        submit: 'Book a 20-minute consultation',
        sending: 'Sending…',
        note: 'A short note is enough. We will review it and follow up to arrange a time.',
        errors: {
          invalidRequest: 'Please check the request format.',
          checkFields: 'Please check the information you entered.',
          name: 'Enter a name of no more than 80 characters.',
          email: 'Enter a valid email address.',
          phone: 'Enter a phone number where we can reach you.',
          topic: 'Select a consultation topic.',
          message: 'Keep your message within 2,000 characters.',
          consent: 'Agree to the collection and use of your personal information.',
          formExpired: 'Refresh the page and complete the form again.',
          tooQuick: 'Please wait a moment, then submit again.',
          botCheckRequired: 'Complete the anti-bot check.',
          botCheckUnavailable:
            'The anti-bot check is taking longer than expected. Please try again shortly.',
          deliveryUnavailable:
            'Online submissions are not available yet. Please contact us by email.',
          deliveryFailed:
            'We could not deliver your request. Try again shortly or contact us by email.',
          generic: 'Please try again shortly.',
          emailLink: 'Contact us by email',
        },
        success: {
          title: 'Your consultation request has been received.',
          body: 'We will review what you shared and get in touch. We will prepare for our first conversation around the workflow you want to improve and the bottlenecks you face today.',
        },
        statusAriaLabel: 'Consultation request status',
      },
    },
  },
  ja: {
    brand: {
      homeAriaLabel: 'Corca AXの先頭へ戻る',
      logoAlt: 'Corca AX',
      partnerLogoAlt: 'OpenAI Partner Network Select Partner',
      brochureCta: '詳しく見る | パンフレット',
      brochureAriaLabel: 'Corca AXのパンフレットを新しいタブで開く',
      consultationCta: '相談を申し込む',
      organizationsAriaLabel: 'Corca AXと取り組んだ組織',
      organizationLogosAriaLabel: 'Corca AXと取り組んだ10組織のロゴ',
    },
    hero: {
      eyebrow: 'AX加速コンサルティング',
      headline: [
        { before: 'AIの導入は、誰にでもできます。' },
        { strong: '成果を繰り返し生み出せる組織は、' },
        { strong: '簡単にはつくれません。' },
      ],
      subtitle: ['最初の成果を、次の成果につなげる組織へ。', 'Corca AXが共につくります。'],
      consultationCta: '相談を申し込む',
      exploreCta: 'Corca AXのコンサルティングを見る',
    },
    belief: {
      eyebrow: '自ら成長し続ける組織づくりに、本気で向き合うCORCA AX',
      headline: [{ before: 'ツールは買えます。' }, { strong: '強い組織は、つくるものです。' }],
      body: [
        'Corca AXは、答えだけを渡して去ることはありません。',
        '最初のAX業務をお客様と共に実行し、',
        '支援後も自ら次の課題を解ける力を、組織の中に残します。',
      ],
      testimonials: [
        {
          id: 'tyche',
          quote: [
            'CorcaのAXコンサルティングがなければ、',
            'TYCHEのAXは3〜4カ月遅れていたと思います。',
          ],
          company: 'TYCHE Technologies',
          source: 'お客様インタビュー · 2026年7月',
          logoAlt: 'TYCHE Technologies',
        },
        {
          id: 'kyowon',
          quote: [
            '誰もが手探りだったとき、Corcaと出会いました。共に課題を選定し、AX Champion育成コンサルティングを進めるなかで、参加者の集中度が目に見えて高まりました。そして、「こういう人をAX Championにすればよい」という社内の選定基準も明確になりました。',
          ],
          company: 'KYOWONグループ',
          source: 'お客様インタビュー · 2026年7月',
          logoAlt: 'KYOWON',
        },
      ],
      testimonialCarousel: {
        ariaLabel: 'Corca AXのお客様の声',
        slideSelectionAriaLabel: 'お客様の声を選択',
        slideAriaTemplate: '{current} / {total} — {company}',
        viewSlideAriaTemplate: '{company}のお客様の声を見る',
        previous: '前のお客様の声',
        next: '次のお客様の声',
        reducedMotion: '動きを抑える設定により、お客様の声の自動再生はオフになっています',
        pause: 'お客様の声の自動再生を一時停止',
        replay: 'お客様の声を最初からもう一度再生',
        play: 'お客様の声の自動再生を開始',
      },
      proofAriaLabel: 'Corca AXの活動実績',
      proof: {
        organizations: { value: '20+', label: 'Corca AXと取り組んだ組織' },
        participants: { value: '1,000+', label: 'Corca AXプログラム参加者' },
        completion: {
          value: ['最初の業務から、次の業務を実行できる', '組織の力を育てるところまで'],
          label: 'Corca AXが定めるプロジェクト完了基準',
        },
      },
    },
    gap: {
      imageAlt: '同じ海を異なる速さで進むシャチの群れ',
      eyebrow: '現場の悩みを知るCORCA AX',
      headline: [
        { before: 'AIの差を分けるのは、モデルではありません。' },
        { strong: '実務に乗せるまでの速さです。' },
      ],
      steps: [
        {
          id: 'past',
          kicker: '過去も同じでした',
          headline: ['コンピューターは1日で買えても、', '働き方を変えるには何年もかかりました。'],
          body: [
            '革新的な技術だけでは、',
            '生産性は生まれませんでした。',
            '業務、権限、情報の流れも',
            '同時に変える必要があったからです。',
          ],
        },
        {
          id: 'now',
          kicker: 'NOW',
          statistic: { value: '95', suffix: '%' },
          headline: [
            'AIを導入した企業の多くは、',
            '測定可能な損益効果を',
            'まだ確認できていません。',
          ],
          body: [
            'Project NANDAの2025年予備調査によると、多くの企業がAI導入による生産性向上を実感できていないと報告しています。',
          ],
          sourceLink: '調査原文を見る ↗',
        },
        {
          id: 'organization',
          kicker: 'なぜ成果につながらないのかを検証しました',
          headline: ['AI活用の生産性を阻むのは、', '最終的には組織の実行力です。'],
          body: [
            '同じAIでも成果が変わるのは、誰が実務につなぎ、運用し、組織へ広げるかが異なるからです。',
          ],
        },
      ],
    },
    bottleneck: {
      eyebrow: 'AI導入はスタートにすぎません',
      headline: [{ before: '導入後に立ちはだかるのは、' }, { strong: '技術よりも運用です。' }],
      body: 'AIソリューションやモデル選定は、まだ入口です。本当の難所は組織の中にあります。',
      cards: [
        {
          id: 'context',
          title: '散在する文脈',
          body: '業務知識は文書、メッセージ、人の記憶に散在しています。その文脈を知らないAIは、もっともらしい答えしか返せません。',
        },
        {
          id: 'operations',
          title: '止まる運用',
          body: 'デモは動いても、本番では権限、例外、システム連携で止まります。PoCが運用に移れない理由です。',
        },
        {
          id: 'responsibility',
          title: '曖昧な責任',
          body: '誰が判断し、誰が承認し、失敗時にどこまで戻すかを決めなければ、AIは組織の仕事になりません。',
        },
      ],
      carousel: {
        ariaLabel: 'AI導入後に組織が直面する運用上のボトルネック',
        slideSelectionAriaLabel: 'スライドを選択',
        slideAriaTemplate: '{current} / {total} — {title}',
        viewSlideAriaTemplate: '「{title}」のスライドを見る',
        reducedMotion: '視差効果を減らす設定により、自動再生はオフになっています',
        pause: '自動再生を一時停止',
        replay: '最初からもう一度再生',
        play: '自動再生を開始',
        previous: '前のスライド',
        next: '次のスライド',
      },
    },
    method: {
      eyebrow: '現場で答えを見つけたCORCA AX',
      headline: [
        { before: 'AIで解くべき中核課題を見極め、' },
        { before: '最初の業務を共に変え、' },
        { strong: '次の業務を自ら実行できる' },
        { strong: '組織の力を育てます。' },
      ],
      steps: [
        {
          step: '01',
          title: '解くべき課題を選ぶ',
          body: [
            '経営目標と現場のボトルネックを結び付けます。',
            'AIで解く価値のない課題は、最初から除外します。',
          ],
        },
        {
          step: '02',
          title: '実際の業務を変える',
          body: [
            'レポートで終わらせません。',
            'データ、権限、承認プロセスをつなぎ、最初の業務を本番運用に乗せます。',
          ],
        },
        {
          step: '03',
          title: '次の課題を解く力を残す',
          body: [
            '判断基準、スキル、運用記録を組織内に残します。',
            '2つ目の業務は、お客様自身が展開します。',
          ],
        },
      ],
    },
    internalProof: {
      eyebrow: 'まず自社で実践し、成果を積み上げています',
      headline: [{ before: 'お客様に勧める前に、' }, { strong: 'まずCorca自身を変えました。' }],
      body: [
        '全社員がAIを学ぶだけでは終わりませんでした。',
        '実務の課題を選び、AIと共につくり、毎週失敗と成功を共有しながら成長してきました。',
      ],
      cadenceAriaLabel: 'Corca AXの月次・週次・日次の運用リズム',
      cadence: [
        {
          frequency: '毎月開催',
          name: 'AX Day',
          body: '研修用の例題ではなく、各チームが実際の業務を持ち寄ってプロトタイプをつくりました。',
        },
        {
          frequency: '毎週開催',
          name: 'AX共有会',
          body: '成功したプロンプトだけでなく、行き詰まった理由と再利用できるスキルも蓄積しました。',
        },
        {
          frequency: '毎日使うエージェント',
          name: 'Ceal',
          body: '社内案内、経費申請、調査、フォローアップなど、繰り返し発生する業務から適用しました。',
        },
      ],
    },
    decisionMap: {
      imageAlt: '分岐し再び合流する水中の光の流れ',
      eyebrow: 'NOT EVERYTHING NEEDS AI',
      headline: [{ before: 'すべての課題を' }, { strong: 'AIで解くわけではありません。' }],
      body: '優れたAXは、何をつくるかより先に、何をつくらないかを決めます。',
      total: { label: '現場インタビューで見つけた業務', value: 61, suffix: '件' },
      stats: [
        { value: 11, suffix: '件', label: '今すぐ変える業務' },
        { value: 44, suffix: '件', label: '先に条件整備が必要な業務' },
        { value: 6, suffix: '件', label: 'AIに適さない業務' },
      ],
      note: 'KYOWONグループのAX課題分類プロジェクトに基づく結果です。お客様の業務・データ・権限条件により結果は異なります。',
    },
    pairWork: {
      imageAlt: '同じ方向へ並んで泳ぐ2頭のシャチ',
      eyebrow: '現場の専門家と取り組むペアワーク',
      headline: [
        { before: '課題をよく知る人と、' },
        { strong: 'AIをよく知る人が、' },
        { strong: '一緒に解きます。' },
      ],
      body: '現場は判断基準と例外を知っています。Corcaは、その知識をAIが実務で使える形にします。',
      client: { label: 'お客様の現場', strengths: ['暗黙知', '判断基準', '責任'] },
      corca: { label: 'Corca AX', strengths: ['AI設計', 'システム連携', '運用移行'] },
    },
    champion: {
      eyebrow: 'FROM FIRST TO NEXT',
      headline: [{ before: '最初の業務は共に。' }, { strong: '次の業務は自ら。' }],
      body: 'Corcaが離れた日がゴールではありません。お客様が2つ目の業務を自ら展開した日がゴールです。',
      imageAlt: '一つのテーブルで業務を検討する韓国人AX実務者3名',
      steps: [
        {
          step: '01',
          kicker: 'Corca AXとペアワーク',
          headline: ['最初の業務を', '本番運用へ'],
          body: '判断基準と例外を共に構造化します。',
        },
        {
          step: '02',
          kicker: '社内AX Championを育成',
          headline: ['チームの暗黙知を', '組織の基準へ'],
          body: 'プロンプトが上手な人ではなく、現場固有の判断に責任を持つ人を育てます。',
        },
        {
          step: '03',
          kicker: '日々成長するAX組織へ',
          headline: ['2つ目の業務からは', '自らAIと共に'],
          body: '承認と監査の基準を守りながら、次の業務を自ら実行します。',
        },
      ],
    },
    reuse: {
      imageAlt: '水中で幾重にも重なる青い光の層',
      eyebrow: 'REUSABLE BY DESIGN',
      headline: [
        { before: '一度解いた課題は、' },
        { strong: '組織の中で安全に' },
        { strong: '再利用できなければなりません。' },
      ],
      body: '人を増やして同じことを繰り返しません。検証済みの解決策を、文脈、スキル、統制基準として残します。',
      layers: [
        {
          title: 'Ceal',
          body: '業務に必要な組織の文脈とツールをつなぎます。必要な知識を、必要な意思決定の場に届けます。',
        },
        {
          title: 'CAPS',
          body: '現場で検証した解決策を、スキルと評価基準として残します。次の業務をゼロからつくる必要はありません。',
        },
        {
          title: '権限・承認・監査',
          body: '意思決定を現場に近づけながら、責任は曖昧にしません。誰が何をしたかを後から確認できる状態を保ちます。',
        },
      ],
    },
    program: {
      eyebrow: '検証しながら、3つの段階で進めます。',
      headline: [
        { before: '小さく診断し' },
        { before: '運用で証明し' },
        { strong: '証明できた分だけ広げます。' },
      ],
      packages: [
        {
          id: 'decision_map',
          phase: '診断',
          title: 'どこから着手するかを決める',
          price: '2週間',
          featured: false,
          items: [
            '先に取り組む業務と後回しにする業務を決める',
            '実際の意思決定者と現場の専門家を選ぶ',
            'データ・権限・承認構造を分析する',
            '次の6週間の実行範囲を確定する',
          ],
        },
        {
          id: 'operational_transition',
          phase: '証明',
          title: '最初の業務を現場に適用',
          price: '6週間',
          featured: true,
          items: [
            '最初の業務を実際の現場に適用する',
            '処理・承認時間がどれだけ短縮したかを測定する',
            'セキュリティ・権限・監査基準を連携する',
            '現場が次の業務に直接適用する',
          ],
        },
        {
          id: 'organization_scaling',
          phase: '拡張',
          title: '業務・部門へ拡張',
          price: '四半期 / 年間',
          featured: false,
          items: [
            '複数の業務、複数の部門へ',
            '全社の運用基準を定着させる',
            'システムを連携し、運用を内製化する',
            '四半期ごとに範囲を広げる計画を立てる',
          ],
        },
      ],
      scheduleNote: '実施日程は、お客様との協議により変更される場合があります。',
      outcome: {
        question: 'AXの成果を、何で測りますか？',
        lead: '成果はAIの利用量ではなく、',
        strong: '意思決定の質です。',
        metrics: [
          '意思決定にかかる時間',
          '承認までにかかる時間',
          '現場が自律的に処理する比率',
          '手戻りの比率',
          '例外への対応力',
          '意思決定を支援できる範囲の拡大',
        ],
      },
      faqEyebrow: 'BEFORE WE START',
      faqTitle: 'よくあるご質問',
      faqs: [
        {
          question: 'AI研修や一般的なコンサルティングとは何が違いますか？',
          answer:
            '研修はツールの使い方を教えます。Corca AXは解くべき課題を選び、最初の業務を本番運用に乗せ、次の業務をお客様自身で展開できる状態をつくります。',
        },
        {
          question: 'どの業務から始めますか？',
          answer:
            '頻繁に繰り返され、やり直しが可能で、現場の知識が重要な意思決定から検討します。リスクが高く、取り消しにくい判断から自動化することはありません。',
        },
        {
          question: '6週間で何を確認できますか？',
          answer:
            '最初の業務が実環境で繰り返し動くか、処理・承認時間が変わったか、お客様側の責任者が2つ目の業務へ自ら適用できるかを確認します。',
        },
        {
          question: 'セキュリティと責任はどう扱いますか？',
          answer:
            'データ境界、アクセス権限、承認段階、例外処理、監査ログ、停止・復旧基準を業務設計に組み込みます。',
        },
        {
          question: 'Corca AXの支援終了後も運用できますか？',
          answer:
            'それがプロジェクトの完了条件です。最初の業務だけでなく、判断基準、スキル、運用方法も引き継ぎます。',
        },
      ],
    },
    contact: {
      imageAlt: '明るい水面へ向かって浮上するシャチ',
      eyebrow: '20分のAX診断に向けたお打ち合わせ',
      question: ['解決したい業務は', 'ありますか？'],
      answer: ['Corca AXが', 'ともに解決します。'],
      fitLead: '次のような業務には、20分のAX診断が特に適しています',
      fitItems: ['繰り返しの多い業務', '判断基準が明確な業務', '現場の知識が重要な業務'],
      emailAriaLabel: 'メールで問い合わせる',
      details: {
        intro: [
          'コンサルティング契約および費用に関するお問い合わせは、',
          '以下までご連絡ください。',
        ],
        owner: 'Hwidong Bae',
        email: 'bae.hwidong@corca.ai',
        ccEmail: 'corca-tax@corca.ai',
        phone: '02-6925-6978',
        closing: 'ご相談内容に沿って、誠実にご案内いたします。',
      },
      form: {
        heading: '相談を申し込む',
        summary: '必須4項目 · 詳細は任意',
        requiredLabel: '必須',
        optionalLabel: '任意',
        fields: {
          name: { label: 'お名前', placeholder: 'お名前をご入力ください' },
          email: { label: 'メールアドレス', placeholder: '会社のメールアドレスを推奨します' },
          phone: { label: '電話番号', placeholder: '+82 10-0000-0000' },
          topic: { label: 'ご相談内容', placeholder: '選択してください' },
          message: {
            label: '解決したい業務',
            placeholder: '待ち時間が長い業務や、繰り返しの多い業務をご記入ください。',
          },
          website: { label: 'ウェブサイト' },
        },
        topics: {
          strategy_discovery: 'AX戦略・課題の発掘',
          decision_map: '2週間のAX意思決定マップ',
          operations_transition: '6週間の本番運用移行',
          organization_adoption: '組織展開・AX Champion育成',
          openai_adoption: 'OpenAIの導入・活用促進',
          other: 'その他',
        },
        consent:
          '相談対応のため、氏名・メールアドレス・電話番号を収集して担当者に共有し、申込日から1年間保管することに同意します。同意を拒否できますが、その場合は相談を申し込めません。',
        privacyPolicyLabel: '個人情報処理方針を見る ↗',
        submit: '20分相談を申し込む',
        sending: '送信中です',
        note: '詳しく書く必要はありません。担当者が内容を確認し、相談日程をご案内します。',
        errors: {
          invalidRequest: 'リクエスト形式をご確認ください。',
          checkFields: '入力内容をご確認ください。',
          name: 'お名前は80文字以内で入力してください。',
          email: '正しいメールアドレスを入力してください。',
          phone: '連絡可能な電話番号を入力してください。',
          topic: 'ご相談内容を選択してください。',
          message: 'お問い合わせ内容は2,000文字以内で入力してください。',
          consent: '個人情報の収集・利用に同意してください。',
          formExpired: 'ページを更新し、フォームをもう一度入力してください。',
          tooQuick: '少し待ってから、もう一度送信してください。',
          botCheckRequired: '自動送信防止の確認を完了してください。',
          botCheckUnavailable:
            '自動送信防止の確認に時間がかかっています。しばらくしてからもう一度お試しください。',
          deliveryUnavailable: '現在オンライン受付を準備中です。メールでお問い合わせください。',
          deliveryFailed:
            'ご相談内容を送信できませんでした。しばらくしてから再試行するか、メールでお問い合わせください。',
          generic: 'しばらくしてからもう一度お試しください。',
          emailLink: 'メールで問い合わせる',
        },
        success: {
          title: 'ご相談を受け付けました。',
          body: 'ご記入いただいた内容を担当者が確認し、ご連絡します。解決したい業務と現在のボトルネックを中心に、最初のお打ち合わせを準備します。',
        },
        statusAriaLabel: '相談申込の状況',
      },
    },
  },
  zh: {
    brand: {
      homeAriaLabel: '返回Corca AX页面顶部',
      logoAlt: 'Corca AX',
      partnerLogoAlt: 'OpenAI Partner Network Select Partner',
      brochureCta: '了解更多 | 宣传册',
      brochureAriaLabel: '在新标签页中打开Corca AX宣传册',
      consultationCta: '预约咨询',
      organizationsAriaLabel: '与Corca AX合作过的组织',
      organizationLogosAriaLabel: '与Corca AX合作过的10家组织标识',
    },
    hero: {
      eyebrow: 'AX加速咨询',
      headline: [
        { before: '部署AI并不难。' },
        { strong: '难的是持续创造' },
        { strong: '可复制的成果。' },
      ],
      subtitle: ['让第一次成果带来下一次成果。', 'Corca AX与您共同打造这样的组织。'],
      consultationCta: '预约咨询',
      exploreCta: '了解Corca AX咨询方法',
    },
    belief: {
      eyebrow: 'CORCA AX致力于打造能够自主成长的组织',
      headline: [{ before: '工具可以买到。' }, { strong: '强大的组织，需要亲手打造。' }],
      body: [
        'Corca AX不会给出答案后便转身离开。',
        '我们与您的团队共同落地首个AX工作流程，',
        '并将自主解决下一个问题的能力留在组织内部。',
      ],
      testimonials: [
        {
          id: 'tyche',
          quote: ['如果没有Corca的AX咨询，', 'TYCHE的AX进程可能会晚3到4个月。'],
          company: 'TYCHE Technologies',
          source: '客户访谈 · 2026年7月',
          logoAlt: 'TYCHE Technologies',
        },
        {
          id: 'kyowon',
          quote: [
            '在大家都还不知该从何入手时，我们遇到了Corca。我们共同选定课题，并推进AX Champion培养咨询。参与者的专注度明显提升，内部也建立起清晰的选拔标准，让我们知道“什么样的人适合成为AX Champion”。',
          ],
          company: 'KYOWON集团',
          source: '客户访谈 · 2026年7月',
          logoAlt: 'KYOWON',
        },
      ],
      testimonialCarousel: {
        ariaLabel: 'Corca AX客户评价',
        slideSelectionAriaLabel: '选择客户评价',
        slideAriaTemplate: '第{current}条，共{total}条 — {company}',
        viewSlideAriaTemplate: '查看{company}的客户评价',
        previous: '上一条客户评价',
        next: '下一条客户评价',
        reducedMotion: '因已启用减少动态效果设置，客户评价自动播放已关闭',
        pause: '暂停客户评价自动播放',
        replay: '从头重新播放客户评价',
        play: '开始自动播放客户评价',
      },
      proofAriaLabel: 'Corca AX服务成果',
      proof: {
        organizations: { value: '20+', label: '与Corca AX合作过的组织' },
        participants: { value: '1,000+', label: 'Corca AX项目参与者' },
        completion: {
          value: ['从落地首个工作流程，到具备', '自主推进下一个流程的能力'],
          label: 'Corca AX定义的项目完成标准',
        },
      },
    },
    gap: {
      imageAlt: '一群虎鲸在同一片海域以不同速度前行',
      eyebrow: '深入一线、理解真实难题的CORCA AX',
      headline: [{ before: '拉开AI差距的不是模型，' }, { strong: '而是将AI投入实际工作的速度。' }],
      steps: [
        {
          id: 'past',
          kicker: '过去也是如此',
          headline: ['买一台电脑只需一天，', '改变工作方式却要数年。'],
          body: [
            '仅靠突破性的技术，',
            '无法真正提升生产力。',
            '工作流程、权限与信息流',
            '必须同步改变。',
          ],
        },
        {
          id: 'now',
          kicker: 'NOW',
          statistic: { value: '95', suffix: '%' },
          headline: ['大多数已部署AI的企业，', '仍未看到可衡量的', '损益改善。'],
          body: [
            'Project NANDA在2025年的初步研究显示，大多数企业尚未切实感受到AI部署带来的生产力提升。',
          ],
          sourceLink: '查看研究原文 ↗',
        },
        {
          id: 'organization',
          kicker: '我们进一步分析了问题所在',
          headline: ['AI生产力的真正瓶颈，', '归根结底是组织能力。'],
          body: [
            '使用同样的AI却得到不同结果，是因为将其接入实际工作、持续运营并在组织内推广的人与能力不同。',
          ],
        },
      ],
    },
    bottleneck: {
      eyebrow: '部署AI只是起点',
      headline: [{ before: '部署之后，' }, { strong: '卡住组织的往往不是技术，而是运营。' }],
      body: '选择AI解决方案和模型只是开始。真正的难题，藏在组织内部。',
      cards: [
        {
          id: 'context',
          title: '上下文分散',
          body: '业务知识散落在文档、消息和员工记忆中。AI不了解这些上下文，就只能给出看似合理的答案。',
        },
        {
          id: 'operations',
          title: '运营停滞',
          body: '演示可以运行，实际业务却会卡在权限、例外与系统集成上。这正是许多PoC无法进入日常运营的原因。',
        },
        {
          id: 'responsibility',
          title: '责任不清',
          body: '如果不明确谁来判断、谁来审批，以及失败后回退到哪一步，AI就无法真正成为组织的工作方式。',
        },
      ],
      carousel: {
        ariaLabel: '组织部署AI后面临的运营瓶颈',
        slideSelectionAriaLabel: '选择幻灯片',
        slideAriaTemplate: '第{current}张，共{total}张 — {title}',
        viewSlideAriaTemplate: '查看“{title}”幻灯片',
        reducedMotion: '因已启用减少动态效果设置，自动播放已关闭',
        pause: '暂停自动播放',
        replay: '从头重新播放',
        play: '开始自动播放',
        previous: '上一张幻灯片',
        next: '下一张幻灯片',
      },
    },
    method: {
      eyebrow: '从一线实践中找到答案的CORCA AX',
      headline: [
        { before: '找到真正值得用AI解决的问题，' },
        { before: '共同改造并落地第一个工作流程，' },
        { strong: '最终打造能够自主推进' },
        { strong: '下一个流程的组织。' },
      ],
      steps: [
        {
          step: '01',
          title: '选对要解决的问题',
          body: ['将经营目标与一线瓶颈连接起来。', '不值得用AI解决的问题，从一开始就排除。'],
        },
        {
          step: '02',
          title: '改变真实工作流程',
          body: ['不止于交付报告。', '连接数据、权限与审批流程，将首个工作流程投入实际运营。'],
        },
        {
          step: '03',
          title: '留下解决下一个问题的能力',
          body: [
            '将判断标准、技能与运营记录沉淀在组织内部。',
            '第二个工作流程由客户团队自主扩展。',
          ],
        },
      ],
    },
    internalProof: {
      eyebrow: '先在自己的组织落地，并持续创造成果',
      headline: [{ before: '推荐给客户之前，' }, { strong: '我们先改变了Corca。' }],
      body: [
        '我们没有止步于让所有员工学习AI。',
        '我们选择真实业务问题，与AI共同构建方案，并在每周分享失败与成功的过程中持续成长。',
      ],
      cadenceAriaLabel: 'Corca AX按月、按周、每日的运营节奏',
      cadence: [
        {
          frequency: '每月开展',
          name: 'AX Day',
          body: '各团队带来真实工作，而不是培训案例，并围绕它构建原型。',
        },
        {
          frequency: '每周开展',
          name: 'AX分享会',
          body: '我们不仅积累有效的提示词，也记录受阻原因和可复用的技能。',
        },
        {
          frequency: '每日协作的智能体',
          name: 'Ceal',
          body: '我们先将其用于企业内部指引、费用审批、调研和后续行动等重复性工作。',
        },
      ],
    },
    decisionMap: {
      imageAlt: '水下光流分开后再次汇合',
      eyebrow: 'NOT EVERYTHING NEEDS AI',
      headline: [{ before: '我们不会用AI' }, { strong: '解决所有问题。' }],
      body: '优秀的AX不只决定要做什么，更会先决定不做什么。',
      total: { label: '通过一线访谈发现的工作流程', value: 61, suffix: '项' },
      stats: [
        { value: 11, suffix: '项', label: '可以立即改造的工作流程' },
        { value: 44, suffix: '项', label: '需要先完善条件的工作流程' },
        { value: 6, suffix: '项', label: '不适合使用AI的工作流程' },
      ],
      note: '数据基于KYOWON集团AX课题分类项目。结果会因客户实际业务、数据和权限条件而异。',
    },
    pairWork: {
      imageAlt: '两只虎鲸并肩朝同一方向游动',
      eyebrow: '与一线专家结对协作',
      headline: [
        { before: '最懂问题的人，' },
        { strong: '与最懂AI的人，' },
        { strong: '共同解决问题。' },
      ],
      body: '一线团队了解判断标准与例外情况。Corca让AI在真实业务中用上这些知识。',
      client: { label: '客户一线团队', strengths: ['隐性知识', '判断标准', '责任'] },
      corca: { label: 'Corca AX', strengths: ['AI设计', '系统集成', '运营转型'] },
    },
    champion: {
      eyebrow: 'FROM FIRST TO NEXT',
      headline: [{ before: '第一个流程，共同完成。' }, { strong: '下一个流程，自主推进。' }],
      body: 'Corca离开的那天不是终点。客户自主扩展第二个工作流程的那天，才是项目完成。',
      imageAlt: '三位韩国AX从业者围坐一桌共同审查工作',
      steps: [
        {
          step: '01',
          kicker: '与Corca AX结对协作',
          headline: ['将首个工作流程', '投入实际运营'],
          body: '共同梳理判断标准与例外情况。',
        },
        {
          step: '02',
          kicker: '培养内部AX Champion',
          headline: ['将团队的隐性知识', '沉淀为组织标准'],
          body: '他们不只是擅长写提示词，更要对本地业务判断负责。',
        },
        {
          step: '03',
          kicker: '打造每日成长的AX组织',
          headline: ['从第二个流程开始，', '自主与AI协作'],
          body: '在遵守审批与审计标准的前提下，自主推进下一个工作流程。',
        },
      ],
    },
    reuse: {
      imageAlt: '蓝色光层在水下层层叠加',
      eyebrow: 'REUSABLE BY DESIGN',
      headline: [
        { before: '解决过一次的问题，' },
        { strong: '应当能够在组织内' },
        { strong: '安全复用。' },
      ],
      body: '不靠增加人手来重复劳动。将经过验证的解决方案沉淀为上下文、技能与控制标准。',
      layers: [
        {
          title: 'Ceal',
          body: '连接工作所需的组织上下文与工具，在作出决策的关键时刻提供所需知识。',
        },
        {
          title: 'CAPS',
          body: '将一线验证过的解决方案沉淀为技能与评估标准，让下一个工作流程无需从零开始。',
        },
        {
          title: '权限、审批与审计',
          body: '让决策更贴近一线，同时不模糊责任边界。每项操作都应可以追溯。',
        },
      ],
    },
    program: {
      eyebrow: '边验证，边分三个阶段推进。',
      headline: [
        { before: '从小范围诊断' },
        { before: '在实际运营中证明' },
        { strong: '只扩展已经证明的范围。' },
      ],
      packages: [
        {
          id: 'decision_map',
          phase: '诊断',
          title: '决定从哪里开始解决',
          price: '2周',
          featured: false,
          items: [
            '确定先解决和暂缓处理的工作',
            '选定实际决策者和一线专家',
            '分析数据、权限与审批结构',
            '确定接下来6周的执行范围',
          ],
        },
        {
          id: 'operational_transition',
          phase: '证明',
          title: '将首项工作应用到现场',
          price: '6周',
          featured: true,
          items: [
            '将首项工作应用到实际现场',
            '衡量处理和审批时间缩短了多少',
            '衔接安全、权限与审计标准',
            '由业务团队直接应用到下一项工作',
          ],
        },
        {
          id: 'organization_scaling',
          phase: '扩展',
          title: '扩展至工作与部门',
          price: '按季度 / 年度',
          featured: false,
          items: [
            '覆盖多项工作、多个部门',
            '建立全公司统一的运营标准',
            '实现系统集成并沉淀内部运营能力',
            '制定按季度扩展范围的计划',
          ],
        },
      ],
      scheduleNote: '执行时间可能根据与客户的协商进行调整。',
      outcome: {
        question: '您如何定义AX成果？',
        lead: '成果不在于AI使用量，',
        strong: '而在于决策质量。',
        metrics: [
          '作出决策所需时间',
          '完成审批所需时间',
          '一线自主处理的比例',
          '返工比例',
          '应对例外情况的能力',
          '决策支持范围的扩大',
        ],
      },
      faqEyebrow: 'BEFORE WE START',
      faqTitle: '常见问题',
      faqs: [
        {
          question: '这与AI培训或一般咨询有什么不同？',
          answer:
            '培训教的是工具用法。Corca AX会选择值得解决的问题，将首个工作流程投入实际运营，并让客户团队能够自主扩展下一个流程。',
        },
        {
          question: '应该从哪类工作开始？',
          answer:
            '我们优先评估高频、可回退且高度依赖一线知识的决策，不会从高风险、难以撤销的决策开始自动化。',
        },
        {
          question: '6周内可以验证什么？',
          answer:
            '我们会验证首个工作流程能否在真实环境中反复运行、处理与审批时间是否改善，以及客户负责人能否自主应用到第二个流程。',
        },
        {
          question: '如何处理安全与责任问题？',
          answer:
            '我们会在工作流程设计中纳入数据边界、访问权限、审批层级、例外处理、审计记录以及停止与恢复标准。',
        },
        {
          question: 'Corca AX离场后，我们还能继续运营吗？',
          answer:
            '这正是项目的完成标准。我们交接的不只是首个工作流程，还包括判断标准、技能与运营方法。',
        },
      ],
    },
    contact: {
      imageAlt: '一只虎鲸向明亮的水面上浮',
      eyebrow: '20分钟AX诊断沟通',
      question: ['您是否有想要解决的', '工作流程？'],
      answer: ['Corca AX将', '与您一起解决。'],
      fitLead: '如果工作具备以下特点，20分钟AX诊断尤其适合',
      fitItems: ['频繁重复', '判断标准明确', '高度依赖一线知识'],
      emailAriaLabel: '通过电子邮件联系我们',
      details: {
        intro: ['有关咨询合同及费用的问题，', '请通过以下方式联系我们。'],
        owner: 'Hwidong Bae',
        email: 'bae.hwidong@corca.ai',
        ccEmail: 'corca-tax@corca.ai',
        phone: '02-6925-6978',
        closing: '我们将根据沟通内容，认真为您提供说明。',
      },
      form: {
        heading: '预约咨询',
        summary: '4项必填 · 详细说明选填',
        requiredLabel: '必填',
        optionalLabel: '选填',
        fields: {
          name: { label: '姓名', placeholder: '请输入姓名' },
          email: { label: '电子邮箱', placeholder: '建议填写企业邮箱' },
          phone: { label: '电话号码', placeholder: '+82 10-0000-0000' },
          topic: { label: '咨询类型', placeholder: '请选择' },
          message: {
            label: '希望解决的工作',
            placeholder: '请告诉我们等待时间最长或重复最频繁的工作。',
          },
          website: { label: '网站' },
        },
        topics: {
          strategy_discovery: 'AX战略与机会发掘',
          decision_map: '2周AX决策地图',
          operations_transition: '6周运营转型',
          organization_adoption: '组织扩展与AX Champion培养',
          openai_adoption: 'OpenAI部署与推广',
          other: '其他',
        },
        consent:
          '我同意为咨询之目的收集姓名、电子邮箱和电话号码，将其提供给咨询负责人，并自申请之日起保存一年。您可以拒绝同意，但将无法提交咨询申请。',
        privacyPolicyLabel: '查看隐私政策 ↗',
        submit: '预约20分钟咨询',
        sending: '正在发送',
        note: '无需填写很长。负责人查看后会与您联系并安排咨询时间。',
        errors: {
          invalidRequest: '请检查请求格式。',
          checkFields: '请检查您填写的信息。',
          name: '姓名请控制在80个字符以内。',
          email: '请输入有效的电子邮箱地址。',
          phone: '请输入可以联系到您的电话号码。',
          topic: '请选择咨询类型。',
          message: '咨询内容请控制在2,000个字符以内。',
          consent: '请同意收集和使用个人信息。',
          formExpired: '请刷新页面后重新填写表单。',
          tooQuick: '请稍候片刻再重新提交。',
          botCheckRequired: '请完成防自动提交验证。',
          botCheckUnavailable: '防自动提交验证暂时延迟，请稍后重试。',
          deliveryUnavailable: '在线提交功能正在准备中，请通过电子邮件联系我们。',
          deliveryFailed: '未能发送您的咨询请求，请稍后重试或通过电子邮件联系我们。',
          generic: '请稍后重试。',
          emailLink: '通过电子邮件联系我们',
        },
        success: {
          title: '您的咨询申请已提交。',
          body: '负责人查看您填写的内容后会与您联系。首次沟通将围绕您希望解决的工作和当前瓶颈展开。',
        },
        statusAriaLabel: '咨询申请状态',
      },
    },
  },
};
