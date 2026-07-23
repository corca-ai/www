import type { Lang } from '../src/i18n/ui';

type PrivacySection = {
  id: string;
  title: string;
  html: string;
};

export type PrivacyContent = {
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  lead: string;
  effectiveLabel: string;
  effectiveDate: string;
  tocLabel: string;
  overviewLabel: string;
  intro: string;
  sections: PrivacySection[];
};

const contactHtml = {
  ko: '<dl><div><dt>성명</dt><dd>정영현</dd></div><div><dt>전자우편</dt><dd><a href="mailto:young@corca.ai">young@corca.ai</a></dd></div><div><dt>전화번호</dt><dd><a href="tel:+82-2-6925-6978">+82-2-6925-6978</a></dd></div></dl>',
  en: '<dl><div><dt>Privacy contact</dt><dd>Young Jung</dd></div><div><dt>Email</dt><dd><a href="mailto:young@corca.ai">young@corca.ai</a></dd></div><div><dt>Telephone</dt><dd><a href="tel:+82-2-6925-6978">+82-2-6925-6978</a></dd></div></dl>',
  ja: '<dl><div><dt>個人情報保護担当者</dt><dd>Young Jung</dd></div><div><dt>メール</dt><dd><a href="mailto:young@corca.ai">young@corca.ai</a></dd></div><div><dt>電話番号</dt><dd><a href="tel:+82-2-6925-6978">+82-2-6925-6978</a></dd></div></dl>',
  zh: '<dl><div><dt>个人信息保护负责人</dt><dd>Young Jung</dd></div><div><dt>电子邮箱</dt><dd><a href="mailto:young@corca.ai">young@corca.ai</a></dd></div><div><dt>电话</dt><dd><a href="tel:+82-2-6925-6978">+82-2-6925-6978</a></dd></div></dl>',
} satisfies Record<Lang, string>;

export const privacyContent: Record<Lang, PrivacyContent> = {
  ko: {
    title: '개인정보처리방침 | Corca',
    description: 'Corca 웹사이트와 AX 상담 서비스의 개인정보 처리 기준을 안내합니다.',
    eyebrow: 'PRIVACY POLICY',
    heading: '개인정보처리방침',
    lead: '주식회사 코르카는 AI·AX 서비스와 상담 과정에서 개인정보를 안전하고 투명하게 처리합니다.',
    effectiveLabel: '시행일',
    effectiveDate: '2026년 7월 23일',
    tocLabel: '목차',
    overviewLabel: '개요',
    intro:
      '주식회사 코르카(이하 “회사”)는 「개인정보 보호법」 등 관련 법령을 준수하며 정보주체의 개인정보와 권익을 보호하기 위해 이 방침을 공개합니다. 이 방침은 Corca 웹사이트, AX 상담, 자료 요청 및 관련 기업 고객 커뮤니케이션에 적용됩니다.',
    sections: [
      {
        id: 'purpose',
        title: '1. 개인정보의 처리 목적',
        html: '<p>회사는 다음 목적에 필요한 범위에서만 개인정보를 처리합니다.</p><ul><li>AX 진단·컨설팅·솔루션 문의의 접수, 본인 확인, 답변 및 후속 연락</li><li>제안, 미팅, 계약 및 프로젝트 수행을 위한 기업 고객 커뮤니케이션</li><li>문의 이력 관리, 분쟁 대응, 부정 이용 및 보안 위협 방지</li><li>웹사이트 이용 현황과 유입 경로 분석 및 서비스 품질 개선</li><li>법령상 의무 이행 및 회사의 정당한 권리 보호</li></ul><aside>상담을 통해 제출된 개인정보는 공개형 생성 AI 모델의 학습 데이터로 사용하지 않습니다.</aside>',
      },
      {
        id: 'items',
        title: '2. 처리 항목 및 수집 방법',
        html: '<div class="privacy-table-wrap"><table><thead><tr><th>구분</th><th>처리 항목</th><th>수집 방법</th></tr></thead><tbody><tr><th>AX 상담</th><td>성명, 전화번호, 선택 입력한 이메일, 문의내용, 동의 기록, 언어 및 UTM 정보</td><td>웹사이트 상담 폼, 이메일, 전화 또는 미팅</td></tr><tr><th>이용 분석</th><td>접속 일시, IP 주소, 브라우저·기기 정보, 방문·클릭 기록, 리퍼러, 쿠키·분석 식별자</td><td>서비스 이용 과정에서 자동 생성</td></tr><tr><th>계약·프로젝트</th><td>소속, 부서·직책, 업무 연락처 및 업무 수행에 필요한 정보</td><td>담당자 제공, 계약서 및 업무 커뮤니케이션</td></tr></tbody></table></div><aside>AX 상담 내용은 Cloudflare Email Service를 통해 승인된 상담 수신함으로 전달되며 웹사이트 애플리케이션 데이터베이스에는 별도로 저장하지 않습니다.</aside>',
      },
      {
        id: 'retention',
        title: '3. 보유 및 이용기간',
        html: '<ul><li><strong>상담 및 자료 요청:</strong> 문의 처리 완료일 또는 마지막 상담일로부터 3년</li><li><strong>계약·프로젝트 정보:</strong> 계약 종료 후 5년</li><li><strong>웹 분석 정보:</strong> 수집일로부터 최대 14개월</li><li><strong>접속기록:</strong> 관계 법령이 적용되는 경우 3개월</li></ul><p>목적이 달성되거나 보유기간이 지나면 지체 없이 파기합니다. 법령상 보존 의무 또는 분쟁 대응 필요가 있는 경우에는 해당 기간 동안 분리 보관하고 그 목적으로만 이용합니다.</p>',
      },
      {
        id: 'processors',
        title: '4. 제3자 제공 및 처리위탁',
        html: '<p>회사는 동의 또는 법령상 근거 없이 개인정보를 제3자에게 제공하지 않습니다.</p><div class="privacy-table-wrap"><table><thead><tr><th>수탁자</th><th>위탁 업무</th></tr></thead><tbody><tr><th>Cloudflare, Inc.</th><td>웹사이트 제공, 보안 및 상담 이메일 전송</td></tr><tr><th>Google LLC</th><td>Google Analytics 이용 분석</td></tr></tbody></table></div><p>회사는 계약과 감독을 통해 수탁자가 개인정보를 안전하게 처리하도록 관리합니다.</p>',
      },
      {
        id: 'transfers',
        title: '5. 개인정보의 국외 이전',
        html: '<div class="privacy-table-wrap"><table><thead><tr><th>이전받는 자</th><th>국가·시점·방법</th><th>항목·목적</th><th>기간</th></tr></thead><tbody><tr><th>Cloudflare, Inc.</th><td>미국 등 서비스 제공 지역 / 웹사이트 이용·상담 신청 시 암호화 전송</td><td>접속·기기 및 상담 정보 / 호스팅, 보안, 이메일 전송</td><td>위탁 목적 달성 또는 계약 종료 시까지</td></tr><tr><th>Google LLC</th><td>미국 등 데이터센터 소재 국가 / 서비스 이용 시 네트워크 전송</td><td>웹 분석 정보 / 이용 분석</td><td>최대 14개월</td></tr></tbody></table></div><p>분석 목적 이전은 쿠키 설정으로 거부할 수 있습니다. 상담 정보 이전을 원하지 않으면 아래 담당자에게 이메일 또는 전화로 상담을 요청할 수 있습니다.</p>',
      },
      {
        id: 'rights',
        title: '6. 정보주체의 권리와 파기',
        html: '<p>정보주체는 열람, 정정·삭제, 처리정지, 동의 철회를 요구할 수 있습니다. 아래 담당자에게 요청하면 본인 확인 후 법령이 정한 기간 내에 조치합니다. 파기 사유가 발생한 전자적 파일은 복구가 어렵도록 삭제하고 종이 문서는 분쇄 또는 소각합니다.</p>',
      },
      {
        id: 'cookies',
        title: '7. 쿠키와 Google Analytics',
        html: '<p>회사는 이용 현황과 유입 경로를 이해하고 서비스를 개선하기 위해 쿠키와 Google Analytics를 사용할 수 있습니다. 이름, 이메일, 전화번호 및 문의내용은 분석 이벤트로 전송하지 않습니다. 브라우저 설정에서 쿠키를 차단하거나 삭제할 수 있습니다.</p>',
      },
      {
        id: 'security',
        title: '8. 안전성 확보조치',
        html: '<ul><li>업무상 필요한 최소 인원에게만 접근권한 부여</li><li>전송 구간 암호화와 접근통제를 통한 외부 침입 방지</li><li>접속기록 점검 및 개인정보 취급자 교육</li><li>최소 수집과 보유기간 경과 정보의 안전한 파기</li></ul>',
      },
      {
        id: 'contact',
        title: '9. 개인정보 보호책임자 및 권리구제',
        html: `<p>개인정보 보호, 권리 행사 또는 민원은 아래 담당자에게 문의해 주세요.</p>${contactHtml.ko}<p>추가 상담은 개인정보침해 신고센터(118, <a href="https://privacy.kisa.or.kr" target="_blank" rel="noreferrer">privacy.kisa.or.kr</a>) 또는 개인정보 분쟁조정위원회(1833-6972, <a href="https://www.kopico.go.kr" target="_blank" rel="noreferrer">kopico.go.kr</a>)에 요청할 수 있습니다.</p>`,
      },
      {
        id: 'changes',
        title: '10. 방침의 변경',
        html: '<p>이 방침은 2026년 7월 23일부터 적용됩니다. 중요한 내용이 변경되는 경우 시행 전에 웹사이트를 통해 변경 사항과 시행일을 안내합니다.</p>',
      },
    ],
  },
  en: {
    title: 'Privacy Policy | Corca',
    description:
      'How Corca handles personal information through its website and AX consultation service.',
    eyebrow: 'PRIVACY POLICY · UNITED STATES',
    heading: 'Privacy Policy',
    lead: 'Corca, Inc. handles personal information transparently and securely across its AI and AX services.',
    effectiveLabel: 'Effective',
    effectiveDate: 'July 23, 2026',
    tocLabel: 'Contents',
    overviewLabel: 'Overview',
    intro:
      'This Privacy Policy explains how Corca, Inc., a company based in the Republic of Korea (“Corca,” “we,” or “us”), collects, uses, discloses, and protects personal information through the Corca website, AX consultations, resource requests, and related business communications. The U.S. supplement below applies only where the relevant law applies.',
    sections: [
      {
        id: 'purpose',
        title: '1. Information we collect and why',
        html: '<p>We process personal information only for the purposes described below.</p><ul><li><strong>AX consultations:</strong> name, telephone number, optional email, message, consent record, locale, and UTM data—to receive, respond to, and follow up on requests.</li><li><strong>Website use:</strong> IP address, date and time, browser and device data, pages, clicks, referrer, cookies, and analytics identifiers—to secure, operate, and improve the site.</li><li><strong>Business relationships:</strong> company, role, business contact details, and contract or project communications—to prepare proposals and perform agreements.</li></ul><aside>Information submitted through a consultation is not used to train publicly available generative AI models.</aside>',
      },
      {
        id: 'sources',
        title: '2. Sources and submission',
        html: '<p>We collect information directly from you through forms, email, telephone, meetings, and contracts, and automatically from your browser when you use the site. The AX form sends your request through Cloudflare Email Service to an approved Corca inbox; the website application does not keep a separate consultation database.</p><p>Do not submit sensitive personal information, government identifiers, financial account credentials, or information about children through the form.</p>',
      },
      {
        id: 'retention',
        title: '3. Retention',
        html: '<ul><li><strong>Consultations and resource requests:</strong> three years after resolution or the last consultation.</li><li><strong>Contracts and projects:</strong> five years after the relationship ends.</li><li><strong>Analytics:</strong> up to 14 months.</li><li><strong>Security logs:</strong> as reasonably necessary for security and legal obligations.</li></ul><p>We may retain information longer when required by law, needed to establish or defend legal claims, or requested by you.</p>',
      },
      {
        id: 'disclosure',
        title: '4. Service providers and disclosures',
        html: '<div class="privacy-table-wrap"><table><thead><tr><th>Provider</th><th>Purpose</th></tr></thead><tbody><tr><th>Cloudflare, Inc.</th><td>Website delivery, security, and consultation email transmission.</td></tr><tr><th>Google LLC</th><td>Google Analytics measurement.</td></tr></tbody></table></div><p>We may also disclose information when required by law, to protect rights and security, or in connection with a corporate transaction. We require service providers to use information only for contracted purposes.</p>',
      },
      {
        id: 'international',
        title: '5. International transfers',
        html: '<p>Corca is located in the Republic of Korea. Information may be processed in Korea, the United States, and other locations where Cloudflare or Google operates. Those jurisdictions may have privacy laws different from those in your location. We use contractual, technical, and organizational safeguards appropriate to the transfer.</p>',
      },
      {
        id: 'cookies',
        title: '6. Cookies and analytics',
        html: '<p>We may use cookies and Google Analytics to understand traffic and improve the site. We do not send your name, email, telephone number, or consultation message as analytics events. You can block or delete cookies in your browser. We do not currently respond to “Do Not Track” signals. We do not sell personal information or share it for cross-context behavioral advertising.</p>',
      },
      {
        id: 'rights',
        title: '7. Your choices and rights',
        html: '<p>You may ask to access, correct, delete, or restrict the use of your personal information, or withdraw consent. You may opt out of non-essential analytics through browser settings. We will verify requests and respond as required by applicable law. We will not discriminate against you for exercising a privacy right.</p>',
      },
      {
        id: 'california',
        title: '8. California notice',
        html: '<p>If and to the extent the California Consumer Privacy Act applies, California residents may have rights to know, access, correct, delete, and obtain a portable copy of covered personal information, and to opt out of sale or sharing. Corca does not sell personal information, does not share it for cross-context behavioral advertising, and does not offer a financial incentive for personal information. The categories collected are identifiers, internet activity, professional or employment-related information, and correspondence described above. Authorized agents may submit verified requests through the contact below.</p>',
      },
      {
        id: 'security',
        title: '9. Security and children',
        html: '<p>We use access controls, encryption in transit, logging, personnel training, minimization, and secure deletion. No security measure is absolute. Our business services are not directed to children under 13, and we do not knowingly collect their personal information. If you believe a child submitted information, contact us for deletion.</p>',
      },
      {
        id: 'contact',
        title: '10. Contact and policy changes',
        html: `<p>To exercise a right or ask a privacy question, contact us below. We may request information needed to verify your identity. You may appeal a refusal by replying to our decision.</p>${contactHtml.en}<p>This policy is effective July 23, 2026. We will post material changes and their effective date before they take effect.</p>`,
      },
    ],
  },
  ja: {
    title: 'プライバシーポリシー | Corca',
    description:
      'CorcaのウェブサイトおよびAX相談サービスにおける個人情報の取扱いについてご案内します。',
    eyebrow: 'PRIVACY POLICY · JAPAN',
    heading: 'プライバシーポリシー',
    lead: 'Corcaは、AI・AXサービスおよびご相談の過程で個人情報を安全かつ透明に取り扱います。',
    effectiveLabel: '施行日',
    effectiveDate: '2026年7月23日',
    tocLabel: '目次',
    overviewLabel: '概要',
    intro:
      '大韓民国に所在するCorca, Inc.（以下「当社」）は、日本の個人情報の保護に関する法律（APPI）が適用される場合を含め、Corcaウェブサイト、AX相談、資料請求および関連する法人向け連絡における個人情報の取扱いを本ポリシーで説明します。',
    sections: [
      {
        id: 'purpose',
        title: '1. 利用目的',
        html: '<ul><li>AX診断・コンサルティング・ソリューションに関するお問い合わせの受付、本人確認、回答およびフォローアップ</li><li>提案、会議、契約およびプロジェクト遂行のための法人担当者との連絡</li><li>お問い合わせ履歴の管理、不正利用・セキュリティ脅威への対応</li><li>ウェブサイトの利用状況・流入経路の分析および品質改善</li><li>法令上の義務の履行および当社の権利保護</li></ul><aside>相談フォームに入力された個人情報を、一般公開される生成AIモデルの学習に使用しません。</aside>',
      },
      {
        id: 'items',
        title: '2. 取得する情報と取得方法',
        html: '<div class="privacy-table-wrap"><table><thead><tr><th>区分</th><th>情報</th><th>取得方法</th></tr></thead><tbody><tr><th>AX相談</th><td>氏名、電話番号、任意入力のメールアドレス、相談内容、同意記録、言語、UTM情報</td><td>フォーム、メール、電話、会議</td></tr><tr><th>利用分析</th><td>IPアドレス、日時、ブラウザ・端末、閲覧・クリック、リファラー、Cookie・分析識別子</td><td>サイト利用時に自動取得</td></tr><tr><th>契約・業務</th><td>会社、部署・役職、業務連絡先、契約・業務上必要な情報</td><td>担当者、契約書、業務連絡</td></tr></tbody></table></div><p>AX相談はCloudflare Email Serviceから承認済みの当社受信箱へ送信され、ウェブサイトのアプリケーションデータベースには別途保存されません。</p>',
      },
      {
        id: 'retention',
        title: '3. 保有期間',
        html: '<ul><li><strong>相談・資料請求：</strong>対応完了日または最終相談日から3年</li><li><strong>契約・プロジェクト：</strong>契約終了後5年</li><li><strong>アクセス解析：</strong>取得から最長14か月</li></ul><p>利用目的の達成後は遅滞なく削除します。ただし、法令上の保存義務または紛争対応に必要な場合は、その期間に限り分離保管します。</p>',
      },
      {
        id: 'processors',
        title: '4. 委託先および第三者提供',
        html: '<p>同意または法令上の根拠がない限り、個人データを第三者へ提供しません。</p><div class="privacy-table-wrap"><table><thead><tr><th>委託先</th><th>業務</th></tr></thead><tbody><tr><th>Cloudflare, Inc.</th><td>サイト配信、セキュリティ、相談メール送信</td></tr><tr><th>Google LLC</th><td>Google Analyticsによる利用分析</td></tr></tbody></table></div>',
      },
      {
        id: 'transfers',
        title: '5. 外国への移転',
        html: '<p>当社は韓国に所在し、個人情報は韓国ならびにCloudflareおよびGoogleがサービスを提供する米国その他の国・地域で取り扱われる場合があります。相談情報は申込み時に暗号化通信でCloudflareを経由して韓国の当社受信箱へ送られます。分析情報はGoogleのデータセンターで最長14か月処理される場合があります。当社は契約上・技術上・組織上の保護措置を講じ、適用法が求める情報提供または同意を実施します。外国制度に関する追加情報は下記窓口へ請求できます。</p>',
      },
      {
        id: 'rights',
        title: '6. 開示等の請求',
        html: '<p>適用法令に従い、保有個人データの利用目的の通知、開示（第三者提供記録を含む場合があります）、訂正・追加・削除、利用停止・消去、第三者提供停止を請求できます。下記窓口へご連絡ください。本人確認後、法令に従って回答します。</p>',
      },
      {
        id: 'cookies',
        title: '7. Cookieとアクセス解析',
        html: '<p>利用状況の把握と改善のためCookieおよびGoogle Analyticsを使用する場合があります。氏名、メール、電話番号、相談内容を分析イベントとして送信しません。ブラウザ設定でCookieを拒否または削除できます。</p>',
      },
      {
        id: 'security',
        title: '8. 安全管理措置',
        html: '<ul><li>必要最小限の担当者へのアクセス制限</li><li>通信の暗号化、アクセス制御、ログ点検</li><li>取扱担当者の教育と委託先の監督</li><li>データ最小化および保有期間後の安全な削除</li></ul>',
      },
      {
        id: 'contact',
        title: '9. 窓口および改定',
        html: `<p>個人情報の取扱い、外国移転、権利行使または苦情については下記へご連絡ください。</p>${contactHtml.ja}<p>本ポリシーは2026年7月23日から適用します。重要な変更は、施行日前に内容と施行日を掲載します。</p>`,
      },
    ],
  },
  zh: {
    title: '隐私政策 | Corca',
    description: '说明Corca网站及AX咨询服务如何处理个人信息。',
    eyebrow: 'PRIVACY POLICY · 中国',
    heading: '隐私政策',
    lead: 'Corca在AI、AX服务及咨询过程中，以透明、安全的方式处理个人信息。',
    effectiveLabel: '生效日期',
    effectiveDate: '2026年7月23日',
    tocLabel: '目录',
    overviewLabel: '概述',
    intro:
      'Corca, Inc.位于大韩民国（以下称“Corca”或“我们”）。本政策说明Corca网站、AX咨询、资料申请及相关企业客户沟通中的个人信息处理活动。若《中华人民共和国个人信息保护法》（PIPL）适用，我们将按照本政策及下述中国地区补充条款处理个人信息。',
    sections: [
      {
        id: 'purpose',
        title: '1. 处理目的与个人信息种类',
        html: '<ul><li><strong>AX咨询：</strong>姓名、电话号码、选填电子邮箱、咨询内容、同意记录、页面语言及UTM信息，用于受理、回复及后续联系。</li><li><strong>网站运营：</strong>IP地址、访问时间、浏览器与设备、访问及点击、来源网址、Cookie和分析标识符，用于安全、运营和改进。</li><li><strong>商务合作：</strong>公司、部门、职位、工作联系方式及合同或项目沟通信息，用于提案、签约和履约。</li></ul><aside>通过咨询提交的个人信息不会用于训练向公众开放的生成式AI模型。请勿提交敏感个人信息、身份证件、金融账户凭证或儿童信息。</aside>',
      },
      {
        id: 'legal-basis',
        title: '2. 处理依据与方式',
        html: '<p>我们在取得您的同意、订立或履行合同所必需、履行法定义务或法律允许的其他基础上处理个人信息。您可通过表单、邮件、电话、会议或合同直接提供信息；部分访问数据会由浏览器自动生成。AX表单通过Cloudflare Email Service发送至Corca授权邮箱，网站应用程序不另设咨询数据库。</p>',
      },
      {
        id: 'retention',
        title: '3. 保存期限',
        html: '<ul><li><strong>咨询及资料申请：</strong>处理完成或最后一次咨询后3年</li><li><strong>合同及项目：</strong>合作结束后5年</li><li><strong>网站分析：</strong>最长14个月</li></ul><p>目的实现或期限届满后，我们将删除或匿名化个人信息；法律要求保存或处理争议所必需时，仅在相应期限和目的范围内保存。</p>',
      },
      {
        id: 'processors',
        title: '4. 委托处理与对外提供',
        html: '<div class="privacy-table-wrap"><table><thead><tr><th>接收方/受托方</th><th>联系方式</th><th>处理目的</th></tr></thead><tbody><tr><th>Cloudflare, Inc.</th><td><a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer">Cloudflare Privacy</a></td><td>网站托管、安全及咨询邮件传输</td></tr><tr><th>Google LLC</th><td><a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google Privacy</a></td><td>Google Analytics网站分析</td></tr></tbody></table></div><p>除经您同意、履行法定义务或法律另有规定外，我们不会向其他第三方提供个人信息。我们通过合同和监督要求受托方仅按约定目的处理信息。</p>',
      },
      {
        id: 'transfers',
        title: '5. 个人信息跨境传输',
        html: '<p>由于Corca位于韩国，您提交的AX咨询信息将通过加密网络，经Cloudflare传输至韩国的Corca授权邮箱；网站使用及分析信息可能由Cloudflare或Google在美国及其服务地区处理。境外接收方处理的个人信息种类、目的和方式如上所述，保存期限分别为实现委托目的或合同终止前，以及分析信息最长14个月。</p><aside>在中国页面提交AX咨询前，我们会就向境外提供个人信息取得单独同意。您可拒绝，但我们将无法通过该表单受理咨询；您仍可通过下方邮箱或电话联系。您可向Corca或相应境外接收方行使访问、更正、删除等权利。</aside>',
      },
      {
        id: 'rights',
        title: '6. 您的权利',
        html: '<p>在适用法律范围内，您有权知情、决定、限制或拒绝处理，查阅、复制、更正、补充、删除个人信息，撤回同意，并要求解释处理规则。撤回同意不影响撤回前基于同意的处理。请通过下方方式提出请求；我们会核验身份并依法答复。</p>',
      },
      {
        id: 'cookies',
        title: '7. Cookie与分析工具',
        html: '<p>我们可能使用Cookie和Google Analytics了解访问及来源并改进网站。姓名、邮箱、电话及咨询内容不会作为分析事件发送。您可在浏览器中拒绝或删除Cookie；拒绝后部分分析功能可能受限。</p>',
      },
      {
        id: 'security',
        title: '8. 安全措施与事件处理',
        html: '<ul><li>仅向履职所需的最少人员授予访问权限</li><li>传输加密、访问控制、安全日志与检查</li><li>人员培训、受托方管理及数据最小化</li><li>期限届满后的安全删除</li></ul><p>发生或可能发生泄露、篡改、丢失时，我们将采取补救措施，并按照适用法律向主管机关和个人告知。</p>',
      },
      {
        id: 'contact',
        title: '9. 联系方式、投诉与政策更新',
        html: `<p>如需行使权利、撤回同意、了解跨境接收方或提出投诉，请联系：</p>${contactHtml.zh}<p>本政策自2026年7月23日起生效。发生重大变化时，我们将在生效前公布变更内容和日期，并在法律要求时重新取得同意。</p>`,
      },
    ],
  },
};
