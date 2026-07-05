import type { ProductMeta } from '../types';
import logo from './assets/logo.png';

export default {
  slug: 'trace',
  order: 2,
  name: 'Trace',
  logo,
  app: {
    category: 'ProductivityApplication',
    os: 'iOS',
    appUrl: 'https://apps.apple.com/app/id6503812022',
  },
  meta: {
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
  blurb: {
    ko: '말하거나 입력하거나 사진을 찍기만 하면 AI가 일정을 정리해주는 AI 일정관리 앱. 맥락을 이해하는 알림으로 하루를 손쉽게 관리합니다.',
    en: 'An AI scheduling app that organizes your day — just speak, type, or snap a photo. Context-aware reminders keep your day effortlessly on track.',
    ja: '話す・入力する・写真を撮るだけでAIが予定を整理するAIスケジュール管理アプリ。文脈を理解する通知で一日を手軽に管理します。',
    zh: '只需说话、输入或拍照，AI就能整理日程的AI日程应用。理解上下文的提醒，让你轻松掌控每一天。',
  },
} satisfies ProductMeta;
