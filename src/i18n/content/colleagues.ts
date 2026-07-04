import type { Lang } from '../ui';

// Corca team-member stories. Titles (roles) and quote excerpts are translated
// per locale (the original site left them Korean-only).
export interface Member {
  t: Record<Lang, string>;
  q: Record<Lang, string>;
  img: string;
}

// Each colleague card links out to the member's story on corca.team (the
// external recruiting site) — kept as external links, not replicated. Keyed
// by photo id so it can't get mis-paired with the wrong member.
export const storyUrls: Record<string, string> = {
  '2fe9a6_323dd6d277bd49f5a62086b358599d2e': 'https://corca.team/ueg3qy10',
  '2fe9a6_38f85a7995054bf3812548160b518575': 'https://corca.team/xbq6n8bp',
  '2fe9a6_c0cdfae6a08741229a8f4cb49ff8fcc3': 'https://corca.team/gdadx8v0',
  '2fe9a6_e7c6461b54044bb0a80abe7abe80689a': 'https://corca.team/anrcz9kd',
  '2fe9a6_5c9bdd2181f043f2b18919874a2bd33c': 'https://corca.team/v1ly603j',
  '2fe9a6_c0f32ba12a784426b90a28031f09ff25': 'https://corca.team/xm2j21a2',
  '2fe9a6_6496bc8bbb4b441396db8f850d3a968f': 'https://corca.team/nrj37qac',
  '2fe9a6_47b8ca214167478e9f1647868aebe8f3': 'https://corca.team/6anlujg8',
  '2fe9a6_363920bd776546d59323d49c3c061e44': 'https://corca.team/6fv6co19',
  '2fe9a6_6e6de686ecb74eaaa2761ef3cee9bfc1': 'https://corca.team/m2985f6k',
  '2fe9a6_85f2ad0c669e4aadba17a3f7e7a0c3da': 'https://corca.team/kobsg4r0',
  '2fe9a6_242c2eb7bf3e4210bc2b88d925f6bc79': 'https://corca.team/x14bv45b',
  '2fe9a6_0810c58680fa4e2fbee049bd9b726ed1': 'https://corca.team/wy4ma3ue',
  '2fe9a6_447d89fa17884fd2b4cea815169aa099': 'https://corca.team/c44ry0kz',
  '2fe9a6_88368412af5e4902ad65325fe1cc473e': 'https://corca.team/81lgoov3',
};

export const members: Member[] = [
  {
    t: {
      ko: '개인, 팀, 조직의 성장을 돕는 AX Lead',
      en: 'The AX Lead who helps individuals, teams, and the organization grow',
      ja: '個人・チーム・組織の成長を支えるAX Lead',
      zh: '帮助个人、团队和组织成长的 AX Lead',
    },
    q: {
      ko: 'AI와 어떤 주제를 가지고 논쟁하듯 대화를 할 때가 있습니다. AI가 먼저 주장을 하면 제가 근거를 찾아오고, 다시 검증하고, 서로 주고받다가 결국 우리의 생각과 근거가 딱 맞물리며 훌륭한 결론이 나는 순간이 꽤 즐겁습니다.',
      en: 'Sometimes I debate a topic with an AI. It makes a claim, I go find evidence, we verify, we go back and forth — and the moment our reasoning finally clicks into a great conclusion is quite enjoyable.',
      ja: 'AIとあるテーマについて議論するように対話することがあります。AIが主張し、私が根拠を探して検証し、やり取りを重ねた末に、互いの考えと根拠がぴたりと噛み合って優れた結論に至る瞬間がとても楽しいです。',
      zh: '有时我会和 AI 就某个主题像辩论一样对话。AI 先提出主张，我再去寻找依据、反复验证，你来我往之后，我们的想法和依据最终严丝合缝地契合、得出精彩结论的那一刻，真的相当愉快。',
    },
    img: '2fe9a6_323dd6d277bd49f5a62086b358599d2e',
  },
  {
    t: {
      ko: '에이전트와 함께 일하는 방식을 만드는 CTO',
      en: 'The CTO shaping how we work with agents',
      ja: 'エージェントと共に働く方法をつくるCTO',
      zh: '打造与智能体协作方式的 CTO',
    },
    q: {
      ko: '코딩할 때 가장 재미를 느낍니다. 특히 어려운 문제를 풀 때 퍼즐을 푸는 것 같은 즐거움이 있습니다. 또 어떤 문제를 풀어야 가치가 있는지 상상하는 과정 자체도 흥미롭게 느껴집니다.',
      en: 'I have the most fun when coding. Solving hard problems feels like solving a puzzle, and even imagining which problems are worth solving is fascinating.',
      ja: 'コーディングしているときが一番楽しいです。特に難しい問題を解くときはパズルを解くような面白さがあります。どんな問題を解けば価値があるのかを想像する過程自体も興味深く感じます。',
      zh: '写代码的时候我最觉得有意思。尤其是解决难题时，会有种像解谜一样的乐趣。而且，想象要解决什么样的问题才有价值，这个过程本身也让我觉得很有趣。',
    },
    img: '2fe9a6_38f85a7995054bf3812548160b518575',
  },
  {
    t: {
      ko: '첫 Growth Marketer의 이야기',
      en: 'The story of our first Growth Marketer',
      ja: '初のGrowth Marketerの物語',
      zh: '第一位 Growth Marketer 的故事',
    },
    q: {
      ko: '마케팅은 프로덕트의 가치를 표현하고 스토리텔링하는 일에 가깝다고 느끼는데, 잘 파는 것도 중요하지만 그만큼 팀원들이 제 이야기에 귀를 기울이게 하고, 설득하는 힘이 필요하다…',
      en: "I feel marketing is close to expressing a product's value and storytelling. Selling well matters, but so does the power to make teammates listen and be persuaded…",
      ja: 'マーケティングはプロダクトの価値を表現し、ストーリーテリングする仕事に近いと感じます。うまく売ることも大切ですが、それと同じくらいチームメンバーに耳を傾けてもらい、説得する力が必要で…',
      zh: '我觉得市场营销更接近于表达产品的价值、把它讲成故事的工作。卖得好固然重要，但同样也需要让团队成员愿意倾听我的想法、并说服他们的能力…',
    },
    img: '2fe9a6_c0cdfae6a08741229a8f4cb49ff8fcc3',
  },
  {
    t: {
      ko: '디자인을 넘어 실현까지, 코르카 팀의 UX 엔지니어',
      en: "Beyond design to realization — Corca's UX Engineer",
      ja: 'デザインを超えて実現まで、コルカのUXエンジニア',
      zh: '从设计到落地实现，Corca 团队的 UX Engineer',
    },
    q: {
      ko: '원래부터 디자인만 하는 것보다, 기획부터 구현까지 직접 실현하고 싶은 욕구가 있었어요. 요즘은 AI 기반의 코딩 툴들이 발전하면서 디자이너도 보다…',
      en: 'I always wanted to realize things end-to-end, from planning to implementation, rather than only design. As AI-based coding tools advance, designers too can…',
      ja: 'もともとデザインだけをするより、企画から実装まで自分で実現したいという思いがありました。最近はAIベースのコーディングツールが進化し、デザイナーもより…',
      zh: '比起单纯只做设计，我一直都更想亲手把从规划到实现的整个过程都落地。最近随着基于 AI 的编程工具不断发展，设计师也能更…',
    },
    img: '2fe9a6_e7c6461b54044bb0a80abe7abe80689a',
  },
  {
    t: {
      ko: '개발자 사고에서 비즈니스 감각까지, 성장하는 iOS Engineer',
      en: "From engineer's mindset to business sense — a growing iOS Engineer",
      ja: '開発者思考からビジネス感覚まで、成長するiOSエンジニア',
      zh: '从开发者思维到商业嗅觉，不断成长的 iOS Engineer',
    },
    q: {
      ko: '서비스 트레이스를 운영하면서 유저분들에게 “잘 쓰고 있어요”, “업데이트 정말 좋았어요” 같은 긍정적인 피드백을 받을 때 가장 큰 보람을 느껴요.',
      en: 'Running our product Trace, I feel the greatest reward when users share positive feedback like “I love using it” or “the update was great.”',
      ja: 'サービス「トレース」を運営する中で、ユーザーの方から「よく使っています」「アップデートが本当に良かった」といった前向きなフィードバックをいただくときに、最も大きなやりがいを感じます。',
      zh: '在运营 Trace 这个服务的过程中，收到用户“一直在用，很好用”“这次更新真的很棒”这样的正面反馈时，我感到最大的成就感。',
    },
    img: '2fe9a6_5c9bdd2181f043f2b18919874a2bd33c',
  },
  {
    t: {
      ko: 'Product Designer는 어떻게 일할까?',
      en: 'How does a Product Designer work?',
      ja: 'Product Designerはどう働くのか？',
      zh: 'Product Designer 是怎么工作的？',
    },
    q: {
      ko: '디자인 분야는 정말 다양하지만, 저는 여러 분야에 관심이 많고, 여러 스타트업에서 일하며 다양한 경험을 쌓아왔습니다. 덕분에 로고, 브랜드…',
      en: "Design is a broad field, and I'm curious about many areas. Having worked at several startups, I've built diverse experience — logos, brand…",
      ja: 'デザインの分野は本当に多様ですが、私は幅広い分野に関心があり、複数のスタートアップで働きながら多様な経験を積んできました。おかげでロゴやブランド…',
      zh: '设计领域真的非常多样，而我对多个领域都很感兴趣，在多家创业公司工作的过程中积累了各种各样的经验。也正因如此，无论是 logo、品牌…',
    },
    img: '2fe9a6_c0f32ba12a784426b90a28031f09ff25',
  },
  {
    t: {
      ko: '팀을 위해 더 나은 환경을 만들어가는 Operating Manager',
      en: 'The Operating Manager building a better environment for the team',
      ja: 'チームのためにより良い環境をつくるOperating Manager',
      zh: '为团队打造更好环境的 Operating Manager',
    },
    q: {
      ko: '이전 회사들은 정해진 업무를 매뉴얼대로 하는 게 많아서 새로운 업무를 받게 되었을 때 걱정이 많았어요. 코르카에서는 새로운…',
      en: 'At previous companies, much of the work followed fixed manuals, so I worried when given new tasks. At Corca, new…',
      ja: '以前の会社では決められた業務をマニュアル通りに行うことが多く、新しい業務を任されると不安が大きかったです。コルカでは新しい…',
      zh: '以前的公司大多是按照手册来完成既定的工作，所以每当接到新任务时我都会很担心。而在 Corca，新的…',
    },
    img: '2fe9a6_6496bc8bbb4b441396db8f850d3a968f',
  },
  {
    t: {
      ko: '0 to 1을 만드는 Product Lead',
      en: 'The Product Lead who builds 0 to 1',
      ja: '0 to 1をつくるProduct Lead',
      zh: '打造 0 to 1 的 Product Lead',
    },
    q: {
      ko: '저도 그렇고 다른 분들을 봤을 때도 Role에 제한을 두지 않는 분들이 빠른 시간 안에 많은 일들을 해내시는 것 같아요. 코르카에서는 다양한 일을…',
      en: "In my experience and watching others, people who don't confine themselves to a role get a lot done quickly. At Corca, I take on all sorts of…",
      ja: '自分自身も、他の方々を見ても、Roleに制限を設けない人ほど短期間で多くのことを成し遂げているように思います。コルカでは多様な仕事を…',
      zh: '无论是我自己，还是看到其他人，我都觉得那些不给自己的 Role 设限的人，往往能在很短的时间里完成很多事情。在 Corca，各种各样的工作…',
    },
    img: '2fe9a6_47b8ca214167478e9f1647868aebe8f3',
  },
  {
    t: {
      ko: '팀의 든든한 버팀목이 되는 Operation Lead',
      en: "The Operation Lead who is the team's reliable backbone",
      ja: 'チームの頼れる支えとなるOperation Lead',
      zh: '成为团队坚实后盾的 Operation Lead',
    },
    q: {
      ko: '경영지원 업무 경력이 20년 정도이고, 재무, 세무, 경영기획, 총무, 인사, 법무, 업체 관리, 공시 등 IT 업계 경영지원에서 다양한 경험을 가지고 있는…',
      en: 'I have about 20 years in management support, with broad experience across IT-industry operations — finance, tax, planning, admin, HR, legal, vendor management, disclosures…',
      ja: '経営支援業務の経歴が20年ほどあり、財務、税務、経営企画、総務、人事、法務、取引先管理、開示など、IT業界の経営支援で多様な経験を持つ…',
      zh: '我从事经营支持工作大约有 20 年，在财务、税务、经营规划、总务、人事、法务、供应商管理、信息披露等 IT 行业的经营支持领域积累了各种各样的经验…',
    },
    img: '2fe9a6_363920bd776546d59323d49c3c061e44',
  },
  {
    t: {
      ko: '학교에서 사회로의 첫 걸음은 일할 맛 나는 코르카로',
      en: 'First step from school into the working world — at Corca, a place that makes work worthwhile',
      ja: '学校から社会への第一歩は、働きがいのあるコルカで',
      zh: '从校园迈向社会的第一步，就选让人有干劲的 Corca',
    },
    q: {
      ko: 'App 개발자에게 중요한 건 스스로 가치 있는 앱을 만드는 것인데요, 내가 쓰고 싶은 앱을 만들자는 마음가짐이 필요한 것 같아요.',
      en: "What matters for an app developer is building a genuinely valuable app — I think you need the mindset of building an app you'd want to use yourself.",
      ja: 'アプリ開発者にとって大切なのは、自ら価値あるアプリをつくることです。自分が使いたいアプリをつくろう、という心構えが必要だと思います。',
      zh: '对 App 开发者来说，重要的是亲手做出真正有价值的 App，我觉得需要抱着“做一个自己也想用的 App”这样的心态。',
    },
    img: '2fe9a6_6e6de686ecb74eaaa2761ef3cee9bfc1',
  },
  {
    t: {
      ko: '긍정적인 에너지를 전하는 Product Designer',
      en: 'The Product Designer who spreads positive energy',
      ja: '前向きなエネルギーを伝えるProduct Designer',
      zh: '传递正能量的 Product Designer',
    },
    q: {
      ko: '디자이너로서 혼자의 노력도 필요하다고 생각하지만 다 함께 노력하여 협업 할 수 있는 역량과 마음가짐이 필요하다고 생각합니다. 일을 잘하기 위해…',
      en: 'As a designer, individual effort matters, but I believe you also need the capability and mindset to collaborate together. To do great work…',
      ja: 'デザイナーとして個人の努力も必要だと思いますが、皆で力を合わせて協働できる能力と心構えが必要だと考えます。良い仕事をするために…',
      zh: '作为设计师，我认为个人的努力固然必要，但也需要具备大家一起努力、能够协作的能力和心态。为了把工作做好…',
    },
    img: '2fe9a6_85f2ad0c669e4aadba17a3f7e7a0c3da',
  },
  {
    t: {
      ko: '채용에 진심인 HR 매니저와 팀이 만나면',
      en: "When an HR Manager who's serious about hiring meets the team",
      ja: '採用に本気なHRマネージャーとチームが出会うと',
      zh: '当认真对待招聘的 HR 经理遇上这支团队',
    },
    q: {
      ko: '커뮤니케이션은 가장 기본이라는 생각이 들면서도, 한 편으로는 가장 어려운 것 같아요. 팀 내부 뿐만 아니라 외부 담당자, 학교 선생님, 지원자 등 여러…',
      en: 'Communication feels the most fundamental, yet also the hardest. Not only within the team but with external contacts, school teachers, applicants, and many…',
      ja: 'コミュニケーションは最も基本だと思いつつ、一方で最も難しいものだと感じます。チーム内だけでなく、社外の担当者、学校の先生、応募者など多くの…',
      zh: '沟通给我的感觉是既最为基础，同时又最为困难。不仅是团队内部，还要和外部的对接人、学校的老师、应聘者等许多…',
    },
    img: '2fe9a6_242c2eb7bf3e4210bc2b88d925f6bc79',
  },
  {
    t: {
      ko: '엔지니어가 뛰어놀기에 좋은 환경을 갖춘 팀',
      en: 'A team with a great environment for engineers to thrive',
      ja: 'エンジニアが伸び伸び活躍できる環境を備えたチーム',
      zh: '拥有让工程师尽情施展的好环境的团队',
    },
    q: {
      ko: '리서치나 엔지니어링 능력도 물론 중요하지만, 가장 중요한 건 우리 상황에 맞는 목적을 정확히 이해하고, 이를 토대로 문제를 정의하고 해결하는…',
      en: 'Research and engineering skills matter, of course, but most important is accurately understanding our purpose and, from there, defining and solving problems…',
      ja: 'リサーチやエンジニアリングの能力ももちろん重要ですが、最も大切なのは、私たちの状況に合った目的を正確に理解し、それを基に問題を定義して解決する…',
      zh: '研究能力和工程能力当然重要，但最重要的是准确理解契合我们自身情况的目标，并以此为基础去定义和解决问题…',
    },
    img: '2fe9a6_0810c58680fa4e2fbee049bd9b726ed1',
  },
  {
    t: {
      ko: '성장과 인간관계 200% 만족스러운 회사가 있다? 정답은 코르카',
      en: "A company that's 200% satisfying for growth and relationships? The answer is Corca",
      ja: '成長も人間関係も200%満足できる会社がある？答えはコルカ',
      zh: '有没有一家在成长和人际关系上都能让人 200% 满意的公司？答案就是 Corca',
    },
    q: {
      ko: '저는 일을 좋아하는 편이고 코르카에서 개발하고 있는 서비스가 재미있고 가치 있는 프로덕트라고 생각해서 대체로 즐겁게 일하는 편입니다! 구체적으로…',
      en: 'I tend to love my work, and I find the service we build at Corca fun and valuable, so I generally enjoy working here! Specifically…',
      ja: '私は仕事が好きな方で、コルカで開発しているサービスは面白く価値のあるプロダクトだと思っているので、おおむね楽しく働いています！具体的には…',
      zh: '我算是比较喜欢工作的人，也觉得在 Corca 开发的服务是既有趣又有价值的产品，所以大体上都是很开心地在工作！具体来说…',
    },
    img: '2fe9a6_447d89fa17884fd2b4cea815169aa099',
  },
  {
    t: {
      ko: '팀원들이 보람을 느낄 때 행복한 CEO',
      en: 'A CEO who is happiest when the team feels fulfilled',
      ja: 'チームメンバーがやりがいを感じるとき幸せなCEO',
      zh: '在团队成员感到有成就感时最幸福的 CEO',
    },
    q: {
      ko: '일하는 문화와 관련해서 코르카는 자율과 책임을 가장 중요하게 생각하고 있습니다. 진부한 표현일 수 있지만, 코르카 팀을 가장 잘 소개할 수 있는 키워드…',
      en: 'When it comes to work culture, Corca values autonomy and responsibility most. It may sound cliché, but the keywords that best describe the Corca team…',
      ja: '働く文化に関して、コルカは自律と責任を最も重視しています。ありふれた表現かもしれませんが、コルカのチームを最もよく紹介できるキーワードは…',
      zh: '在工作文化方面，Corca 最看重的是自律与责任。这也许是个老生常谈的说法，但最能介绍 Corca 团队的关键词…',
    },
    img: '2fe9a6_88368412af5e4902ad65325fe1cc473e',
  },
];
