import type { Lang } from '../../i18n/ui';

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
