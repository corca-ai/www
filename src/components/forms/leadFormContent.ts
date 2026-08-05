import type { Lang } from '../../i18n/ui';

type LeadFormCopy = {
  labels: {
    name: string;
    email: string;
    interests: string;
    otherInterest: string;
    reason: string;
  };
  interestOptions: readonly { value: string; label: string }[];
  placeholders: {
    name: string;
    email: string;
    otherInterest: string;
    reason: string;
  };
  privacyNotice: string;
  submit: string;
  sending: string;
};

export const leadFormCopyByLang: Record<Lang, LeadFormCopy> = {
  ko: {
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
  },
  en: {
    labels: {
      name: 'Name',
      email: 'Email',
      interests: 'Select all consulting areas you are interested in.',
      otherInterest: 'Please describe the other area of interest.',
      reason: 'Please tell us why you selected these areas.',
    },
    interestOptions: [
      { value: 'strategy_diagnosis', label: 'AX opportunity diagnosis' },
      { value: 'champion_coaching', label: 'AX champion coaching' },
      { value: 'environment_solution', label: 'AX environment solution adoption' },
      { value: 'custom_ai_solution', label: 'Custom AI solution development' },
      { value: 'enterprise_adoption', label: 'ChatGPT Enterprise adoption and activation' },
      { value: 'ai_native_team', label: 'AI-native team building' },
      { value: 'ai_capability_training', label: 'AI capability training' },
      { value: 'other', label: 'Other' },
    ],
    placeholders: {
      name: 'John Doe',
      email: 'john.doe@company.com',
      otherInterest: 'Describe the consulting area you have in mind.',
      reason: 'The more detail you share, the more effective our consultation can be.',
    },
    privacyNotice:
      'The email address you provide will be used only to respond to your consultation request.',
    submit: 'Request a consultation',
    sending: 'Sending your request.',
  },
  ja: {
    labels: {
      name: 'お名前',
      email: 'メール',
      interests: '関心のあるコンサルティング内容をすべて選択してください。',
      otherInterest: '関心のある内容を入力してください。',
      reason: '上記を選択した理由をお聞かせください。',
    },
    interestOptions: [
      { value: 'strategy_diagnosis', label: 'AX課題診断' },
      { value: 'champion_coaching', label: 'AXチャンピオン育成コーチング' },
      { value: 'environment_solution', label: 'AX環境構築ソリューション導入' },
      { value: 'custom_ai_solution', label: '組織に合わせたAIソリューション開発' },
      { value: 'enterprise_adoption', label: 'ChatGPT Enterprise導入と活用率向上' },
      { value: 'ai_native_team', label: 'AIネイティブなチームづくり' },
      { value: 'ai_capability_training', label: 'AI活用力向上研修' },
      { value: 'other', label: 'その他' },
    ],
    placeholders: {
      name: '山田太郎',
      email: 'taro.yamada@company.com',
      otherInterest: '関心のあるコンサルティング内容を入力してください。',
      reason: '詳しくお聞かせいただくほど、より効果的なご相談が可能です。',
    },
    privacyNotice: 'ご入力いただいたメールアドレスは、ご相談への対応のためにのみ使用します。',
    submit: '相談を申し込む',
    sending: '相談申請を送信しています。',
  },
  zh: {
    labels: {
      name: '姓名',
      email: '电子邮箱',
      interests: '请选择所有您感兴趣的咨询服务类型。',
      otherInterest: '请填写其他感兴趣的服务类型。',
      reason: '请告诉我们您选择以上服务的原因。',
    },
    interestOptions: [
      { value: 'strategy_diagnosis', label: 'AX课题诊断' },
      { value: 'champion_coaching', label: 'AX推动者培养辅导' },
      { value: 'environment_solution', label: '导入AX环境建设解决方案' },
      { value: 'custom_ai_solution', label: '定制组织专属AI解决方案' },
      { value: 'enterprise_adoption', label: '导入ChatGPT Enterprise并提升使用率' },
      { value: 'ai_native_team', label: 'AI原生团队建设' },
      { value: 'ai_capability_training', label: 'AI能力提升培训' },
      { value: 'other', label: '其他' },
    ],
    placeholders: {
      name: '张伟',
      email: 'zhang.wei@company.com',
      otherInterest: '请填写您感兴趣的咨询服务类型。',
      reason: '您提供的信息越详细，我们就越能为您提供有效的咨询。',
    },
    privacyNotice: '您填写的电子邮箱地址仅用于回复咨询。',
    submit: '申请咨询',
    sending: '正在发送咨询申请。',
  },
};

type LeadRequestCopy = {
  heading: readonly string[];
  dialogBody: {
    lead: string;
    selection: string;
    constraint: string;
    route: string;
    next: string;
  };
  body: readonly string[];
  directLead?: string | undefined;
  emailLabel?: string | undefined;
  email?: string | undefined;
  phoneLabel: string;
  phone: string;
  launchTalk?:
    | {
        kicker: string;
        title: string;
        body: readonly string[];
        ctaLabel: string;
        ctaHref: string;
      }
    | undefined;
};

const axConsultationCopy: Record<Lang, LeadRequestCopy> = {
  ko: {
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
    directLead: 'Corca AX Lead에게 직접 상담받고 싶으시다면,',
    emailLabel: '직접 메일 상담',
    email: 'bae.hwidong@corca.ai',
    phoneLabel: '전화 상담',
    phone: '02-6925-6978',
  },
  en: {
    heading: ['Have a challenge in mind?', 'Start with a two-week AX diagnosis.'],
    dialogBody: {
      lead: 'If you have adopted AI but are blocked by',
      selection: 'opportunity selection and adoption,',
      constraint: 'data, security, or cost controls,',
      route: 'we will diagnose priorities and solution paths in two weeks',
      next: 'and design your next execution plan.',
    },
    body: [
      'If you have adopted AI but are blocked by',
      'opportunity selection, adoption, data, security, or cost controls,',
      'we will diagnose priorities and solution paths in two weeks',
      'and design your next execution plan.',
    ],
    directLead: 'Would you like to speak directly with the Corca AX Lead?',
    emailLabel: 'Email consultation',
    email: 'bae.hwidong@corca.ai',
    phoneLabel: 'Phone consultation',
    phone: '02-6925-6978',
  },
  ja: {
    heading: ['検討中の課題はありますか？', '2週間のAX診断から始めましょう。'],
    dialogBody: {
      lead: 'AIを導入したものの、',
      selection: '課題選定や活用展開、',
      constraint: 'データ・セキュリティ・費用統制で止まっているなら、',
      route: '2週間で優先順位と解決経路を診断し、',
      next: '次の実行計画を設計します。',
    },
    body: [
      'AIを導入したものの、',
      '課題選定、活用展開、データ・セキュリティ・費用統制で止まっているなら、',
      '2週間で優先順位と解決経路を診断し、',
      '次の実行計画を設計します。',
    ],
    directLead: 'Corca AX Leadに直接相談したい場合は、',
    emailLabel: 'メール相談',
    email: 'bae.hwidong@corca.ai',
    phoneLabel: '電話相談',
    phone: '02-6925-6978',
  },
  zh: {
    heading: ['有业务课题吗？', '从2周AX诊断开始'],
    dialogBody: {
      lead: '如果您已引入AI，却仍受阻于',
      selection: '课题选择与推广应用，',
      constraint: '数据、安全或成本控制，',
      route: '我们将在2周内诊断优先级与解决路径，',
      next: '并设计下一步执行计划。',
    },
    body: [
      '如果您已引入AI，却仍受阻于',
      '课题选择、推广应用、数据、安全或成本控制，',
      '我们将在2周内诊断优先级与解决路径，',
      '并设计下一步执行计划。',
    ],
    directLead: '如果您希望直接接受 Corca AX Lead 的咨询，',
    emailLabel: '邮件咨询',
    email: 'bae.hwidong@corca.ai',
    phoneLabel: '电话咨询',
    phone: '02-6925-6978',
  },
};

const blogArticleCopy: Record<Lang, LeadRequestCopy> = {
  ko: {
    heading: ['우리 조직의 AX,', '어디서부터 시작해야 할까요?'],
    dialogBody: {
      lead: '아직 막연해도 괜찮습니다.',
      selection: '지금 고민을 그대로 적어 주세요.',
      constraint: 'Corca AX가 이야기를 듣고,',
      route: '우선순위와 실행 계획을 함께 잡겠습니다.',
      next: '',
    },
    body: [
      '아직 막연해도 괜찮습니다. 지금 고민을 그대로 적어 주세요.',
      'Corca AX가 이야기를 듣고,',
      '우선순위와 실행 계획을 함께 잡겠습니다.',
    ],
    directLead: 'Corca AX Lead에게 직접 상담받고 싶으시다면,',
    emailLabel: '직접 메일 상담',
    email: 'bae.hwidong@corca.ai',
    phoneLabel: '전화 상담',
    phone: '02-6925-6978',
  },
  en: {
    heading: ['Where should your organization', 'begin with AX?'],
    dialogBody: {
      lead: 'It is okay if the path still feels unclear.',
      selection: 'Tell us what you are considering.',
      constraint: 'Corca AX will listen,',
      route: 'then shape priorities and an execution plan with you.',
      next: '',
    },
    body: [
      'It is okay if the path still feels unclear. Tell us what you are considering.',
      'Corca AX will listen,',
      'then shape priorities and an execution plan with you.',
    ],
    directLead: 'Would you like to speak directly with the Corca AX Lead?',
    emailLabel: 'Email consultation',
    email: 'bae.hwidong@corca.ai',
    phoneLabel: 'Phone consultation',
    phone: '02-6925-6978',
  },
  ja: {
    heading: ['組織のAXは、', 'どこから始めればよいでしょうか？'],
    dialogBody: {
      lead: 'まだ漠然としていても大丈夫です。',
      selection: '今抱えている悩みをそのままお聞かせください。',
      constraint: 'Corca AXが丁寧に伺い、',
      route: '優先順位と実行計画を一緒に整理します。',
      next: '',
    },
    body: [
      'まだ漠然としていても大丈夫です。今抱えている悩みをそのままお聞かせください。',
      'Corca AXが丁寧に伺い、',
      '優先順位と実行計画を一緒に整理します。',
    ],
    directLead: 'Corca AX Leadに直接相談したい場合は、',
    emailLabel: 'メール相談',
    email: 'bae.hwidong@corca.ai',
    phoneLabel: '電話相談',
    phone: '02-6925-6978',
  },
  zh: {
    heading: ['组织的 AX，', '应该从哪里开始？'],
    dialogBody: {
      lead: '即使现在还没有清晰的方向也没关系。',
      selection: '请如实告诉我们您正在思考的问题。',
      constraint: 'Corca AX 会认真倾听，',
      route: '并与您一起梳理优先级和执行计划。',
      next: '',
    },
    body: [
      '即使现在还没有清晰的方向也没关系。请如实告诉我们您正在思考的问题。',
      'Corca AX 会认真倾听，',
      '并与您一起梳理优先级和执行计划。',
    ],
    directLead: '如果您希望直接接受 Corca AX Lead 的咨询，',
    emailLabel: '邮件咨询',
    email: 'bae.hwidong@corca.ai',
    phoneLabel: '电话咨询',
    phone: '02-6925-6978',
  },
};

const axLaunchTalkCopy: Record<Lang, LeadRequestCopy> = {
  ...axConsultationCopy,
  ko: {
    ...axConsultationCopy.ko,
    heading: ['우리 조직의 AX,', '어디서부터 시작해야 할까요?'],
    body: [
      '아직 막연해도 괜찮습니다.',
      '지금 고민을 그대로 적어 주세요.',
      'Corca AX가 이야기를 듣고,',
      '조직에 맞는 시작점을 함께 찾겠습니다',
    ],
    directLead: undefined,
    emailLabel: undefined,
    email: undefined,
    launchTalk: {
      kicker: '아직 문의할 단계가 아니라면',
      title: 'AX Launch Talk',
      body: [
        '회의실보다 식탁에서',
        '더 솔직한 이야기가 오갑니다.',
        'Corca AX 배휘동 리드와 점심을 함께하며,',
        '조직의 AX 고민을 나누는 자리입니다.',
        '자료 준비 없이, 고민만 가져오세요.',
      ],
      ctaLabel: '런치 토크 예약하기',
      ctaHref:
        'https://calendar.google.com/calendar/appointments/schedules/AcZssZ3pvmsLNxvJ5Jt9cX7kmgn8dhhFA27R8tnRNbe_THLtJHU4efWcKcNpyutCEU3n9Zf8R-9tMtRm',
    },
  },
};

const leadRequestCopyRegistry = {
  'ax-consultation': axConsultationCopy,
  'blog-article': blogArticleCopy,
  'ax-launch-talk': axLaunchTalkCopy,
} as const;

export type LeadRequestCopyKey = keyof typeof leadRequestCopyRegistry;

export function leadRequestCopy(copyKey: LeadRequestCopyKey, lang: Lang): LeadRequestCopy {
  return leadRequestCopyRegistry[copyKey][lang];
}

export const leadFormSuccessCopy: Record<
  Lang,
  { eyebrow: string; title: string; body: string[]; close: string }
> = {
  ko: {
    eyebrow: '상담 접수 완료',
    title: '상담 신청이 접수되었습니다.',
    body: [
      '보내주신 내용을 담당자가 꼼꼼히 확인한 뒤 곧 연락드리겠습니다.',
      '감사합니다.',
      '이 창은 잠시 후 자동으로 닫힙니다.',
    ],
    close: '닫기',
  },
  en: {
    eyebrow: 'Request received',
    title: 'Your consultation request is complete.',
    body: [
      'Our team will review your message carefully and contact you soon.',
      'Thank you.',
      'This window will close automatically.',
    ],
    close: 'Close',
  },
  ja: {
    eyebrow: '受付完了',
    title: '相談申請を受け付けました。',
    body: [
      '担当者が内容を確認し、まもなくご連絡します。',
      'ありがとうございます。',
      'この画面は自動的に閉じます。',
    ],
    close: '閉じる',
  },
  zh: {
    eyebrow: '申请已受理',
    title: '您的咨询申请已提交。',
    body: ['负责人将认真查看您的信息并尽快与您联系。', '感谢您的咨询。', '此窗口将自动关闭。'],
    close: '关闭',
  },
};
