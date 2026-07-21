import type { APIRoute } from 'astro';

// Keep this discovery document self-contained and independent of the public
// hostname. Each locale communicates the same verified company facts.
const llmsText = `# Corca

## English

### Company
Corca is a Korean AI company that builds practical AI products and helps enterprises turn AI adoption into repeatable operational results. Corca is Korea's first official OpenAI service partner, was selected as a 2024 Baby Unicorn, and ranked 7th worldwide and 1st in Korea in the ACM RecSys Challenge.

### Products and services
- Moonlight: An AI research tool that gives researchers real-time explanations, conversational summaries, and question answering while they read PDF papers.
- Trace: An AI scheduling app that turns natural-language input, speech, or photos into organized schedules and context-aware reminders.
- Corca AX: Enterprise AX consulting that identifies valuable AI opportunities, puts the first workflow into operation, and helps teams build the capability to expand AI to the next workflow.

### How Corca works
Corca operates as an AI-native organization. Its teams work alongside AI, test ideas quickly, share both failures and successes, and combine autonomy with responsibility. Products and consulting are grounded in research, real operational experience, responsible data management, and human-centered decision making.

### Mission
Corca develops AI technology that turns imagination into reality. It aims to create useful solutions, lead responsibly, and make technological progress available to more people.

## 한국어

### 회사
코르카는 현장에서 바로 쓰이는 AI 제품을 만들고, 기업이 AI 도입을 반복 가능한 운영 성과로 전환하도록 돕는 한국의 AI 기업입니다. 한국 최초 OpenAI 공식 서비스 파트너이며, 2024 아기유니콘에 선정됐고 ACM RecSys Challenge에서 세계 7위·국내 1위를 기록했습니다.

### 제품과 서비스
- Moonlight: PDF 논문을 읽는 동안 실시간 설명, 대화형 요약, 질의응답을 제공하는 연구자용 AI 리서치 도구입니다.
- Trace: 일상 언어, 음성, 사진을 일정으로 정리하고 맥락을 이해하는 알림을 제공하는 AI 일정관리 앱입니다.
- Corca AX: 가치 있는 AI 과제를 찾고 첫 업무를 실제 운영에 적용하며, 조직이 다음 업무까지 스스로 확장할 힘을 갖추도록 돕는 기업 AX 컨설팅입니다.

### 코르카의 일하는 방식
코르카는 AI 네이티브 조직으로 일합니다. AI와 함께 짝작업하고, 빠르게 실험하며, 실패와 성공을 공유하고, 자율과 책임을 함께 운영합니다. 제품과 컨설팅은 연구, 실제 운영 경험, 책임 있는 데이터 관리, 사람 중심의 판단에 기반합니다.

### 미션
코르카는 상상을 현실로 만드는 AI 기술을 개발합니다. 유용한 솔루션을 만들고, 책임 있게 기술을 이끌며, 더 많은 사람이 기술 발전의 혜택을 누리게 하는 것을 지향합니다.

## 日本語

### 会社
Corcaは、実務で活用できるAI製品を開発し、企業がAI導入を継続的な業務成果へつなげることを支援する韓国のAI企業です。韓国初のOpenAI公式サービスパートナーであり、2024年のBaby Unicornに選定され、ACM RecSys Challengeで世界7位・韓国1位を記録しました。

### 製品とサービス
- Moonlight: PDF論文を読みながら、リアルタイムの解説、対話型の要約、質疑応答を利用できる研究者向けAIリサーチツールです。
- Trace: 日常の言葉、音声、写真から予定を整理し、文脈を理解した通知を提供するAIスケジュール管理アプリです。
- Corca AX: 価値あるAI課題を見つけ、最初の業務を実運用へ移し、組織が次の業務へ自ら展開できる力を育てる企業向けAXコンサルティングです。

### Corcaの働き方
CorcaはAIネイティブな組織です。AIと協働し、素早く実験し、失敗と成功の両方を共有しながら、自律と責任を両立させます。製品とコンサルティングは、研究、実際の運用経験、責任あるデータ管理、人を中心とした意思決定に基づいています。

### ミッション
Corcaは、想像を現実に変えるAI技術を開発します。役立つソリューションを生み出し、責任を持って技術を導き、より多くの人が技術の進歩を享受できる未来を目指します。

## 中文

### 公司
Corca是一家韩国AI企业，开发可直接用于实际工作的AI产品，并帮助企业将AI导入转化为可持续、可复制的运营成果。Corca是韩国首家OpenAI官方服务合作伙伴，入选2024年Baby Unicorn，并在ACM RecSys Challenge中位列全球第7、韩国第1。

### 产品与服务
- Moonlight: 面向研究人员的AI研究工具，在阅读PDF论文时提供实时讲解、对话式摘要和问答。
- Trace: 将日常语言、语音或照片整理成日程，并提供理解上下文提醒的AI日程管理应用。
- Corca AX: 企业AX咨询服务，帮助企业寻找有价值的AI课题，将首个业务投入实际运营，并培养团队自主拓展下一项业务的能力。

### Corca的工作方式
Corca以AI原生组织的方式工作。团队与AI协作，快速实验，分享失败与成功，并兼顾自主与责任。产品与咨询建立在研究、实际运营经验、负责任的数据管理和以人为本的决策之上。

### 使命
Corca开发将想象变为现实的AI技术。我们致力于创造实用的解决方案，以负责任的方式引领技术，让更多人享受技术进步带来的价值。
`;

export const GET: APIRoute = () =>
  new Response(llmsText, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
