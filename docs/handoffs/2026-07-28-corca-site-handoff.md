---
title: Corca site and AX V2 handoff — 2026-07-28
generated_at: 2026-07-28T15:24:41+09:00
baseline_commit: c55807bc611984299e5306c7a5343beb7edfa35f
snapshot_commit: 22b8e37f32d526188c344a49ef7dc25af1d17dae
---

# Corca 웹사이트·AX V2 인수인계

> 저장소 파일과 Git diff가 이 문서 또는 대화 기억과 충돌하면 저장소와
> Git을 우선한다. 이 문서는 2026-07-28 시점의 검증 가능한 스냅샷이며,
> 이후 변경은 별도 diff로 확인해야 한다.

이 문서는 `/Users/tommy/Documents/XT/corca-www`에서 이어질 Corca 웹사이트
작업의 정본 인수인계다. 현재 실서비스 `/ax`의 공식 명칭은 **AX V2**다.
과거 대화에서 “V3”라고 부른 적이 있어도 현재 코드와 실서비스를 지칭할
때는 AX V2로 통일한다.

## 스냅샷과 증거

| 항목 | 값 |
| --- | --- |
| 저장소 | `corca-ai/www` |
| 기준 커밋 | `c55807bc611984299e5306c7a5343beb7edfa35f` — PR #139 |
| 현재 완성본 | `22b8e37f32d526188c344a49ef7dc25af1d17dae` — PR #165 |
| 완성본 브랜치 상태 | `main`, clean |
| 문서 작성 브랜치 | `codex/site-renewal-handoff-safe-2026-07-28` |
| 운영 도메인 | `https://www.corca.ai` |
| 전체 diff | 공개 저장소에 포함하지 않는 로컬 감사 자료 |
| 로컬 patch 크기 | 1,999,648 bytes |
| 로컬 patch SHA-256 | `a18ee7256797ad33996932ba2ad977970efa151b075428020b8989cf8a9e9634` |

전체 patch는 아래 명령으로 재현한다.

```sh
git diff --binary --full-index --find-renames \
  c55807bc611984299e5306c7a5343beb7edfa35f..\
22b8e37f32d526188c344a49ef7dc25af1d17dae \
  --output=c55807-to-22b8e37.full.patch
shasum -a 256 c55807-to-22b8e37.full.patch
```

이 patch는 감사와 검증을 위한 증거이며 적용용 배포 산출물이 아니다.
공개 저장소에는 저장하지 않는다. 현재 컴퓨터의 로컬 감사본은
`/Users/tommy/Documents/XT/corca-www-local-evidence/2026-07-28/`에
보관한다. 다른 컴퓨터에서는 같은 두 커밋으로 patch를 재생성하고 위
체크섬과 비교할 수 있다. 범위 안에서 다른 작업자가 병합한 변경도
포함하므로 새 대화에서 처음부터 전부 읽지 말고, 특정 변경의 기원을
검증해야 할 때만 관련 hunk를 조회한다.

## 운영 URL과 공개 상태

| 언어 | AX V2 | Privacy |
| --- | --- | --- |
| 한국어 | `https://www.corca.ai/ax` | `https://www.corca.ai/privacy` |
| 영어 | `https://www.corca.ai/en/ax` | `https://www.corca.ai/en/privacy` |
| 일본어 | `https://www.corca.ai/ja/ax` | `https://www.corca.ai/ja/privacy` |
| 중국어 간체 | `https://www.corca.ai/zh/ax` | `https://www.corca.ai/zh/privacy` |

- `www.corca.ai`가 정식 canonical 도메인이다. apex 요청은 canonical
  호스트로 정리된다.
- AX V2 네 언어는 공개·index 대상이다.
- 네 언어 Privacy는 웹사이트에 배치되어 있지만 현재 정책상 `noindex`다.
- `/ax-backup`은 과거 한국어 AX 비교본이며 `noindex, nofollow`,
  sitemap 제외, canonical `/ax`다.
- 일반 merge가 Cloudflare Workers GitHub 연동을 통해 실서비스로
  배포된다. 수동 배포는 저장소의 배포 문서를 먼저 확인한다.

## 현재 AX V2 구조와 소유권

`src/components/pages/Ax.astro`는 locale을 받은 뒤
`src/components/pages/AxV2.astro`를 렌더링한다. 이것이 현재 네 언어
공식 AX V2의 진입점이다.

| 책임 | 현재 소유 파일 |
| --- | --- |
| route wrapper | `src/components/pages/Ax.astro` |
| AX V2 composition | `src/components/pages/AxV2.astro` |
| 한국어 기준 콘텐츠와 언어 병합 | `src/components/pages/ax-v2/content.ts` |
| EN·JA·ZH override | `i18n/ax-v2-content-localized.ts` |
| 리드 폼 UI | `src/components/pages/ax-v2/AxLeadForm.astro` |
| 동작·모션·폼 전송 | `src/components/pages/ax-v2/ax-v2-client.ts` |
| 페이지 스타일·반응형 | `src/components/pages/ax-v2/ax-v2.css` |
| 메타데이터·OG·hreflang | `src/i18n/pageMeta.ts`, `src/staticPages.ts` |
| Service·Breadcrumb JSON-LD | `src/i18n/structuredData.ts` |
| 상담 API·메일 | `worker/axConsultations.ts`, `wrangler.jsonc` |
| 전역 Breadcrumb·Footer | `src/components/Breadcrumb.astro`, `src/components/Footer.astro` |
| 블로그 셸 동기화 | `scripts/sync-blog-shell-assets.js` |

### 보호 대상

다음은 AX V2를 수정하면서 손대지 않는 동결 자산이다.

- 공개 비교 라우트 `/ax-backup`
- `src/components/pages/AxLegacy.astro`
- `src/components/pages/ax/`

공유 Header·Footer·보안 헤더 같은 전역 수정이 결과적으로 backup에도
적용되는 것은 허용되지만, 동결된 페이지 구현과 자산을 새 작업의
출발점으로 덮어쓰지 않는다.

## AX V2에서 완료된 제품 작업

### 콘텐츠·레이아웃

- 한국어 AX의 메시지, 패키지, 사례, OpenAI Select Partner, CTA를
  정리하고 영어·일본어·중국어 간체에 반영했다.
- 언어별 줄바꿈, CJK 문장부호 고립, 그라데이션 글리프 잘림, 원형 카드
  제목과 설명의 위 정렬을 언어별로 보정했다.
- 제품명은 필요한 문맥에서 `ChatGPT Enterprise`로 통일했다.
- 승인된 배경 모션은 감쇠형 스프링 패럴랙스이며 전경은 정상 속도,
  배경만 부드럽게 이동한다.
- Hero CTA는 URL hash를 만들지 않고 Footer 직전 상담 섹션으로 즉시
  이동한다.
- OpenAI Select Partner 원본 SVG와 OpenAI–Corca 조합 로고를 실제
  grid, 반응형, 모바일 구성에 맞게 배치했다.

### 리드 폼·메일

- 현재 폼은 이름, 이메일, 상담 관심사, 상담 사유와 honeypot을 사용한다.
  중국어에는 별도의 국외이전 동의가 포함된다.
- 클라이언트는 `POST /api/ax/consultations`로 JSON을 보낸다.
- Worker가 검증한 뒤 Cloudflare Email Sending binding을 통해
  `contact+ax@corca.ai`로 발송한다. sender는 `ax@corca.ai`로 제한되고
  방문자 이메일은 `Reply-To`로만 사용한다.
- 사이트 데이터베이스에는 리드를 저장하지 않는다.
- 공통 레이아웃은 탭 세션의 첫 랜딩 경로, 외부 리퍼러 hostname,
  첫 랜딩 UTM을 `sessionStorage`에 보존한다. 전체 리퍼러 URL과 query,
  hash는 저장하지 않는다.
- 상담 메일은 UTM, Google 검색 referrer, 일반 외부 referrer, 정보 없음
  순으로 폼 시점의 `source / medium`을 만들어 `유입 경로`로 표시하고,
  원본 근거인 `이전 사이트`, `최초 방문 페이지`, UTM도 함께 표시한다.
  이 값은 GA4 처리 결과를 다시 읽은 값이 아니므로 GA의 세션 채널 정본을
  대체하지 않는다.
- 사이트는 GTM 없이 직접 `gtag.js`를 사용한다. `form_submit`과 메일
  성공 뒤 `generate_lead`만 비식별 전환 이벤트로 보내며 이름·이메일·
  상담 내용·메일 attribution 값은 Google Analytics로 보내지 않는다.
- source, medium, 기본 채널 그룹의 정본은 GA4 Traffic acquisition
  보고서다. 이 흐름에는 GA Data API나 별도 Property ID 자격증명이
  필요하지 않다.
- 실제 웹사이트 발송과 수신이 정상 동작함을 사용자가 확인했다.

### SEO·발견성

- `https://www.corca.ai` canonical, 네 언어 hreflang과 `x-default`,
  언어별 title·description·OG 이미지가 반영됐다.
- 모든 공개 페이지에서 `og:locale`과 `og:locale:alternate`를 제거했다.
- AX V2에는 사실에 맞는 service JSON-LD와 visible Breadcrumb와 같은
  경로를 쓰는 `BreadcrumbList`가 있다.
- 네 언어 SEO 문구와 Kakao용 한국어 OG 문구를 별도로 다듬었다.
- Footer Breadcrumb는 홈 아이콘, 중간 링크, 링크 없는 굵은 현재
  페이지로 구성된다. 블로그 글의 현재 항목은 포스팅 제목이다.
- PR #165에서 승인된 Corca Shine 원본으로 favicon을 교체했다. 브라우저
  16·32·48px, Apple touch 180px, Android/PWA 192·512px PNG와
  manifest를 빌드 시 재생성하며, 기존 favicon URL도 같은 원본을 쓴다.

### 전역 Footer

- 파란 Footer, 흰 Corca 로고, 언어별 태그라인, 법인 정보, 범고래,
  OpenAI Select Partner SVG를 공통 컴포넌트로 제공한다.
- 이메일은 `mailto:`, 전화번호는 `tel:` 링크이며 hover/focus 상태가
  있다.
- 데스크톱·태블릿·모바일의 Breadcrumb 상단 간격, 배지 정렬, 범고래
  크롭을 별도로 조정했다.
- 범고래는 사진성 PNG를 표시 크기에 맞게 최적화한 자산이며, 로고와
  단순 도형은 SVG를 우선한다.

## PR #140–#165 시간순 원장

아래 표는 GitHub 병합 기록이다. “AX·현재 사이트 관련”은 이번 인수인계의
직접 근거이고, “동시 변경”은 전체 patch에 포함되지만 AX 작업이 아닌
변경이다.

| PR | 병합 결과 | 분류 | 핵심 내용 |
| --- | --- | --- | --- |
| [#140](https://github.com/corca-ai/www/pull/140) | `65196c` | AX | 리드 경험과 카피 개선 |
| [#141](https://github.com/corca-ai/www/pull/141) | `f1a72b` | AX | 과제 진단 CTA 카피 개선 |
| [#142](https://github.com/corca-ai/www/pull/142) | `89a747` | AX | 진단 비교 카피 정리 |
| [#143](https://github.com/corca-ai/www/pull/143) | `fb13ae` | AX | 파트너 카피 타이포그래피 |
| [#144](https://github.com/corca-ai/www/pull/144) | `6fdab92` | AX·메일 | 상담 메일 제목에 timestamp 추가 |
| [#145](https://github.com/corca-ai/www/pull/145) | `08800fb` | 동시 변경 | AI Colleague 블로그 현지화 수정 |
| [#146](https://github.com/corca-ai/www/pull/146) | `f502246` | AX·기록 | 다국어 타이포그래피 작업. 이 merge SHA 자체는 현재 `main`의 조상이 아니며 #147 최종 변경에 대체·흡수된 GitHub 기록 |
| [#147](https://github.com/corca-ai/www/pull/147) | `430419e` | AX | AX V2 리드 폼과 다국어 개선 출시 |
| [#148](https://github.com/corca-ai/www/pull/148) | `79826a` | 동시 변경 | Notion multiline italic 수정 |
| [#149](https://github.com/corca-ai/www/pull/149) | `675ec73` | 전역 관련 | production domain을 `corca.ai`로 이전 |
| [#150](https://github.com/corca-ai/www/pull/150) | `e3e1f16` | 동시 변경 | Wix legacy redirect와 HR 인터뷰 숨김 |
| [#151](https://github.com/corca-ai/www/pull/151) | `7affc0f` | 동시 변경 | 빈 alias를 Privacy로 redirect |
| [#152](https://github.com/corca-ai/www/pull/152) | `e51a999` | AX | Select Partner badge 추가 |
| [#153](https://github.com/corca-ai/www/pull/153) | `93abae3` | AX | 파트너 브랜드 자산 정렬 |
| [#154](https://github.com/corca-ai/www/pull/154) | `c398325` | AX·SEO | 네 언어 SEO·OG metadata |
| [#155](https://github.com/corca-ai/www/pull/155) | `efd0d6d` | AX·SEO | Kakao용 한국어 AX OG 문구 단축 |
| [#156](https://github.com/corca-ai/www/pull/156) | `828e592` | AX·SEO | 네 언어 SEO 문구 개선 |
| [#157](https://github.com/corca-ai/www/pull/157) | `067820c` | AX·SEO | AX 다국어 hreflang을 언어 코드로 교체 |
| [#158](https://github.com/corca-ai/www/pull/158) | `9d11074` | 전역 관련 | 모든 현지화 페이지의 language-wide hreflang |
| [#159](https://github.com/corca-ai/www/pull/159) | `bc60946` | 동시 변경 | Charness 산출물 로컬 유지 |
| [#160](https://github.com/corca-ai/www/pull/160) | `d8958fc` | 전역 SEO | OG locale metadata 제거 |
| [#161](https://github.com/corca-ai/www/pull/161) | `42c74e` | 동시 변경 | People 페이지 engineer interview 숨김 |
| [#162](https://github.com/corca-ai/www/pull/162) | `cc14d37` | 전역 관련 | 전역 Breadcrumb와 Footer 개편 |
| [#163](https://github.com/corca-ai/www/pull/163) | `e8b402e` | 전역 관련 | 반응형 Footer partner layout 개선 |
| [#164](https://github.com/corca-ai/www/pull/164) | `b4f38e0` | 전역 관련 | Footer Breadcrumb 간격 축소 |
| [#165](https://github.com/corca-ai/www/pull/165) | `22b8e37` | 전역 관련 | Corca Shine favicon과 기기별 icon manifest 반영 |

PR 번호와 축약 SHA는 탐색용이다. 정확한 코드 포함 여부는 `git
merge-base --is-ancestor`와 현재 tree를 함께 확인한다. 특히 #146은
GitHub에서 병합된 기록과 현재 `main`의 조상 관계가 다르므로 commit
존재만으로 최종 코드 포함을 단정하지 않는다.

## 현재 구조를 바꿀 때의 회귀 위험

- AX V2와 frozen legacy가 이름이 비슷하다. active owner인 `ax-v2/`와
  보호 대상 `ax/`를 혼동하지 않는다.
- 네 언어 콘텐츠는 한국어 base와 locale override가 합성된다. 한국어
  key를 바꾸면 override 누락과 런타임 fallback을 함께 점검한다.
- CJK와 Latin은 같은 font size에서도 실제 glyph 폭과 paint bounds가
  다르다. 문자열만 보고 일괄 CSS로 맞추지 말고 네 언어·대표 viewport를
  확인한다.
- Footer는 일반 Astro route와 정적 blog shell 양쪽에 동기화된다.
  컴포넌트만 확인하거나 생성된 블로그 HTML만 수동 수정하지 않는다.
- visible Breadcrumb와 JSON-LD는 같은 모델을 써야 한다. 표시 이름,
  canonical URL, 현재 항목의 링크 유무를 따로 관리하지 않는다.
- `og:locale`은 의도적으로 제거됐다. SEO 라이브러리나 템플릿 변경으로
  다시 출력하지 않는다.
- 상담 recipient, sender, privacy 고지, 중국어 국외이전 동의가 서로
  어긋나지 않게 유지한다. 실서비스 메일 테스트는 수신자 동의 없이
  반복하지 않는다.
- 원본 SVG를 bitmap으로 rasterize하거나 CSS로 비정상 비율 축소하면
  흐림과 왜곡이 생긴다. 로고는 원본 비율과 intrinsic size를 유지한다.
- `main` merge가 production에 연결된다. 코드 변경과 문서 전용 변경을
  같은 PR에 섞지 않는다.

## 검증된 품질 계약

스냅샷 범위의 배포 과정에서 다음 검사가 통과했다.

- `git diff --check`
- Biome
- Astro check
- Knip
- agentic discovery
- SEO governance
- performance contract
- production build
- GitHub Actions CI
- 네 언어 AX·Privacy와 `www.corca.ai` 실서비스 응답

새 변경은 당시 통과 기록을 재사용하지 말고 현재 tree에서 해당 검사를
다시 실행한다. UI 변경은 데스크톱, 태블릿, 모바일과 EN·JA·ZH의
줄바꿈·크롭 회귀까지 확인한다.

## 완료된 작업과 미착수 계획의 경계

다음은 **완료된 상태가 아니라 다음 작업 후보**다.

- AX 카테고리 아래 신규 페이지 기획 및 신설
- 메인 화면 리뉴얼
- 회사소개 카테고리 리뉴얼

이 후보의 URL, GNB 정보구조, 페이지 수, 다국어 범위, 디자인 시스템,
마이그레이션 순서는 아직 승인되지 않았다. 현재 `/ax`를 `/ax/v2`로
옮긴다거나 새 페이지를 “V3”로 명명하는 것도 결정하지 않았다. 새
대화에서는 현재 구조를 먼저 읽고 계획만 작성한 뒤 명시적 승인 후
구현한다.

## 문서 재현과 감사 절차

정본은 이 Markdown과 Git 저장소다. HTML은 사람이 검색·접기·코드
표시로 검토하기 위한 파생물이며 직접 수정하지 않는다.

```sh
pnpm handoff:render docs/handoffs/2026-07-28-corca-site-handoff.md
```

patch 재현과 체크섬 검증:

```sh
git diff --binary --full-index --find-renames \
  c55807bc611984299e5306c7a5343beb7edfa35f..\
22b8e37f32d526188c344a49ef7dc25af1d17dae \
  --output=c55807-to-22b8e37.full.patch
shasum -a 256 c55807-to-22b8e37.full.patch
```

## 새 대화 시작 가이드

새 대화의 작업 연속성은 Git 저장소와 이 Markdown이 담당한다. HTML은
사람이 검토하기 위한 파생물이며 전체 patch는 감사 자료일 뿐 새 작업의
필수 입력이 아니다.

이 문서의 스냅샷 커밋은 `22b8e37`로 고정한다. 새 대화는 이 커밋이
현재 `HEAD`의 조상인지 확인하고, 이후 변경만 별도로 읽어야 한다.
문서 작성 뒤에도 `main`은 계속 갱신되므로 특정 최신 SHA를 지시문에
영구적으로 고정하지 않는다.

### 현재 노트북에서 시작

저장소가 이미 있는 현재 노트북에서는 파일을 대화에 첨부하지 않고 아래
블록을 첫 입력으로 사용한다.

```text
실제 Git 저장소는 /Users/tommy/Documents/XT/corca-www 이다.

이전 대화 내용을 복구하거나 추측하지 말고, 저장소 파일과 Git 이력만
사실의 근거로 사용해라. 작업 대상은 corca-www로 한정하고 XT/output이나
다른 프로젝트는 검색하지 마라.

먼저 다음 파일을 순서대로 읽어라.

1. AGENTS.md
2. docs/index.md
3. docs/handoffs/2026-07-28-corca-site-handoff.md
4. docs/architecture.md
5. docs/ax.md
6. docs/i18n.md
7. docs/seo-content-governance.md
8. docs/contributing.md
9. docs/deployment.md

그다음 아래 상태를 확인해라.

- git status --short
- git branch --show-current
- git fetch origin
- git log -1 --oneline
- git merge-base --is-ancestor 22b8e37f32d526188c344a49ef7dc25af1d17dae HEAD

미커밋 작업이 있으면 아무것도 덮어쓰거나 삭제하거나 stash하지 말고
변경 파일과 현재 상태를 먼저 보고해라.

작업 트리가 clean이면 main으로 전환하고
git pull --ff-only origin main으로 최신 상태를 반영해라.
현재 HEAD가 인수인계 기준점 22b8e37보다 최신이면, 그 이후 커밋과
사이트 구조에 영향을 주는 diff만 요약해라.

문서와 코드가 충돌하면 저장소 파일과 Git diff를 우선해라.
현재 실서비스 /ax의 공식 명칭은 AX V2다.

다음 경로는 보호 대상이며 명시적 요청 없이 수정하지 마라.

- /ax-backup
- src/components/pages/AxLegacy.astro
- src/components/pages/ax/

앞으로 만들 사이트의 큰 목표는 다음과 같다.

1. 기존 /ax를 계속 고도화한다.
2. /ax 카테고리 아래에 새로운 페이지를 다수 기획하고 신설한다.
3. /about과 그 하위 페이지 전체를 리뉴얼한다.
4. www.corca.ai의 메인 화면을 새로 만든다.

새 페이지는 현재 AX V2를 기준 디자인으로 삼는다.

- 동일한 브랜드와 디자인 언어
- 동일한 반응형 품질 기준
- 한국어·영어·일본어·중국어 체계
- hreflang, canonical, title, description, OG, JSON-LD, Breadcrumb
- 이미지 최적화와 성능 계약
- Footer, Header, GNB 등 공통 컴포넌트 정책
- 사실에 근거한 카피와 언어별 자연스러운 줄바꿈
- 데스크톱·태블릿·모바일 시각 검증
- 접근성 및 Technical SEO 품질 계약

단, 기존 AX 페이지의 구조와 콘텐츠를 새 페이지에 기계적으로 복제하지
말고 AX V2의 토큰, 타이포그래피, 그리드, 모션, SEO 및 품질 원칙을
공통 디자인 시스템으로 추출해 사용할 방법을 검토해라.

첫 단계에서는 코드를 수정하지 마라.
branch, commit, push, PR, merge, 배포도 시작하지 마라.

다음을 저장소 근거와 함께 계획해라.

1. 현재 라우트·GNB·다국어·공통 컴포넌트 구조
2. AX 하위 신규 페이지에 적합한 정보구조와 URL 원칙
3. /about 전체 리뉴얼 범위와 공통 템플릿 후보
4. 메인 화면 리뉴얼 시 재사용할 AX V2 디자인 시스템
5. 공통 SEO·JSON-LD·Breadcrumb·OG 정책
6. 페이지별 콘텐츠와 Figma 입력 자료 목록
7. 여러 PR로 나누는 구현 순서와 각 단계의 검증·배포 기준

URL, 페이지 수, 메뉴명, 다국어 출시 범위와 카피는 임의로 확정하지 말고
확인이 필요한 제품 결정을 분리해서 질문해라.

권장 작업 순서는 다음과 같다.

1. 공통 디자인 시스템과 사이트 구조 정리
2. AX 하위 신규 페이지
3. About 카테고리 리뉴얼
4. 메인 화면 리뉴얼

먼저 현재 상태를 10줄 이내로 보고한 뒤, 결정이 필요한 질문과
구현 가능한 상세 계획을 작성해라.
```

### 새 노트북 환경 준비

완전히 새로운 macOS 노트북에서는 먼저 개발 도구와 저장소를 준비한다.
GitHub 토큰을 명령이나 대화에 직접 붙여넣지 않고 브라우저 인증을
사용한다.

```sh
brew install git gh node
npm install -g pnpm@10.22.0
brew install corca-ai/tap/nose corca-ai/tap/awiki

gh auth login -h github.com -p https -w
gh auth status

mkdir -p ~/Documents/XT
cd ~/Documents/XT
git clone https://github.com/corca-ai/www.git corca-www
cd corca-www

git switch main
git pull --ff-only origin main
pnpm install --frozen-lockfile
pnpm check
pnpm build
```

로컬 미리보기:

```sh
pnpm dev --host 127.0.0.1 --port 4323
```

`nose`나 `awiki`를 설치할 수 없는 환경에서는 아래 검사를 실행하고,
누락된 두 gate는 GitHub CI에서 최종 확인한다.

```sh
pnpm check:biome
pnpm check:astro
pnpm check:knip
pnpm build
```

`.dev.vars`는 Git에 포함되지 않는다. 일반 페이지와 정적 빌드에는
필요하지 않으며, 상담 API까지 로컬에서 검증할 때만 기존 노트북 또는
팀의 보안 채널로 전달한다.

### 새 노트북에서 시작

환경 준비 뒤 아래 블록을 새 대화의 첫 입력으로 사용한다.
`<절대 경로>`만 실제 clone 경로로 교체한다.

```text
실제 Git 저장소는 <새 노트북의 corca-www 절대 경로>이다.

이 저장소는 기존 Corca 실서비스를 이어서 개발하기 위해 새로 clone했다.
이전 대화를 복구하거나 추측하지 말고 저장소 파일과 Git 이력만 근거로
사용해라. 비밀키, .dev.vars, GitHub 토큰을 출력하거나 Git에 포함하지 마라.

다음 순서로 읽어라.

1. AGENTS.md
2. docs/index.md
3. docs/handoffs/2026-07-28-corca-site-handoff.md
4. docs/development.md
5. docs/architecture.md
6. docs/ax.md
7. docs/i18n.md
8. docs/seo-content-governance.md
9. docs/contributing.md
10. docs/deployment.md

다음 상태를 확인해라.

- git status --short
- git branch --show-current
- git remote -v
- git log -1 --oneline
- git merge-base --is-ancestor 22b8e37f32d526188c344a49ef7dc25af1d17dae HEAD
- node --version
- pnpm --version
- gh auth status

작업 트리가 clean인지, main이 최신 origin/main과 일치하는지,
pnpm install과 build가 가능한 환경인지 확인해라.

인수인계 기준점보다 현재 HEAD가 최신이면
22b8e37f32d526188c344a49ef7dc25af1d17dae 이후의 커밋과 diff만
사이트 구조 관점에서 요약해라.

현재 실서비스 /ax의 공식 명칭은 AX V2다.
아래 보호 파일은 명시적 요청 없이 수정하지 마라.

- /ax-backup
- src/components/pages/AxLegacy.astro
- src/components/pages/ax/

앞으로 진행할 큰 작업은 다음 세 가지다.

1. /ax 고도화와 /ax 하위 신규 페이지 다수 신설
2. /about 및 하위 페이지 전체 리뉴얼
3. www.corca.ai 메인 화면 리뉴얼

모든 신규·리뉴얼 페이지는 AX V2의 디자인 언어, 반응형 그리드,
타이포그래피, 모션 품질, 다국어 정책, Technical SEO, JSON-LD,
Breadcrumb, OG 이미지, 이미지 최적화와 검증 기준을 계승한다.

첫 단계에서는 코드를 수정하거나 branch, commit, push, PR, merge,
배포를 시작하지 마라.

현재 사이트 구조를 검증한 뒤 다음을 포함한 상세 계획만 작성해라.

- 공통 디자인 시스템으로 추출할 AX V2 요소
- 신규 AX 페이지의 정보구조와 URL 후보
- About 리뉴얼의 페이지·템플릿 구조
- 메인 화면의 콘텐츠 역할과 재사용 컴포넌트
- 4개 언어 출시와 번역 관리 방법
- 공통 SEO·JSON-LD 모델
- 필요한 Figma·카피·이미지 입력 자료
- 단계별 branch, PR, 검증, 실서비스 배포 순서

URL, 페이지 수, GNB 명칭, 카피와 출시 언어를 임의로 확정하지 말고
제품 결정이 필요한 항목을 질문으로 분리해라.
먼저 저장소와 환경 상태를 10줄 이내로 보고해라.
```

### 첨부 자료

저장소를 정상적으로 열었다면 새 대화 시작 시 첨부 파일은 없다.
Codex가 `AGENTS.md`, `docs/index.md`, 이 Markdown과 관련 주제 문서를
저장소에서 직접 읽게 한다. HTML과 전체 patch는 첨부하지 않는다.

실제 페이지 설계 단계에서는 한 번에 작업할 페이지와 직접 관련된 최신
자료만 제공한다.

- 해당 페이지의 Figma URL과 정확한 `node-id`
- 확정된 한국어 카피 또는 콘텐츠 원문
- 참고할 실서비스 URL
- 데스크톱·태블릿·모바일 기준 화면
- 저장소 밖에 있는 실제 SVG·PNG·WebP 원본
- 반드시 유지하거나 제거할 요소의 화면 주석

다음 자료는 첨부하지 않는다.

- `.dev.vars`
- GitHub·Cloudflare·OpenAI 토큰
- 전체 patch
- `node_modules`와 `dist`
- 최신 여부를 구분하지 않은 과거 시안 묶음

Git 접근이 불가능한 상황에서 단순 검토만 요청할 때는 이 Markdown을
첨부할 수 있지만, 실제 구현에는 전체 저장소 clone이 필요하다.

### 페이지별 후속 지시문

첫 감사와 계획이 승인된 뒤에는 아래 템플릿으로 한 페이지 또는 한
페이지 묶음만 시작한다.

```text
이제 <작업 대상 페이지 또는 카테고리>를 진행한다.

작업 대상:
- 현재 URL:
- 새 URL 후보:
- 대상 언어:
- Figma URL과 node-id:
- 콘텐츠 원문:
- 제공한 이미지·SVG 원본:
- 반드시 유지할 요소:
- 변경 가능한 요소:
- 이번 PR에서 제외할 요소:

현재 main을 최신 origin/main과 맞추고 clean 상태를 확인한 뒤
codex/<구체적인 작업명> 브랜치를 만들어라.

먼저 Figma와 현재 실서비스를 같은 viewport로 비교하고,
AX V2의 공통 디자인 언어와 SEO 정책을 어떻게 적용할지 설명해라.
승인된 계획의 범위 안에서만 구현해라.

구현 후 다음을 수행해라.

1. 데스크톱·태블릿·모바일 시각 비교
2. 한국어와 대상 다국어 줄바꿈·CJK 문장부호 검증
3. title, description, canonical, hreflang, OG, JSON-LD 검증
4. git diff --check
5. pnpm check
6. pnpm build
7. 변경 diff와 검증 결과 정리
8. focused commit 및 push
9. PR 생성
10. CI와 Cloudflare Workers build 통과 확인
11. squash merge
12. www.corca.ai 실서비스에서 최종 검증

기존 미커밋 작업을 덮어쓰거나 삭제하지 말고,
보호 대상 AX legacy 파일을 수정하지 마라.
상담 폼의 실서비스 메일 발송은 별도 요청 없이 반복 테스트하지 마라.
```

### 차기 작업 운영 원칙

- 전체 사이트를 한 대화에서 한꺼번에 구현하지 않는다.
- `공통 기반 → AX 신규 페이지 → About → 메인` 순서로 진행한다.
- 각 페이지 묶음은 별도 브랜치와 PR로 검증하고 배포한다.
- 이 Markdown은 검증 기준점이며 최신 상태는 항상 `origin/main`과
  스냅샷 이후 diff로 확인한다.
- Git clone과 문서가 작업 연속성을 담당한다. 로컬 patch는 감사
  자료일 뿐 새 작업의 필수 입력이 아니다.

### 지속 갱신 계약

이 문서의 “새 대화 시작” 지시문은 매번 새 release SHA나 개별 UI 수정에
맞춰 바꾸지 않는다. 시작문은 저장소를 안전하게 읽는 방법을 고정하고,
Git의 최신 `origin/main`과 스냅샷 이후 diff가 실제 변경을 전달한다.

앞으로 각 pull request는 다음을 판단한다.

- 경로·소유권·공통 컴포넌트·디자인 시스템·SEO·i18n·배포·로컬 환경 또는
  회귀 위험처럼 다음 작업에 영향을 주는 지속 사실이 바뀌었는가.
- 바뀌었다면 가장 가까운 정본 `docs/` 문서와, 사이트 전반의 시작·계속
  작업에 영향이 있을 때 이 handoff를 갱신했는가.
- 바뀌지 않았다면 PR 설명에 문서 갱신이 불필요한 이유를 적었는가.

handoff Markdown을 변경하면 항상 HTML을 다시 생성한다.

```sh
pnpm handoff:render docs/handoffs/2026-07-28-corca-site-handoff.md
```

문서가 특정 변경의 세부와 충돌하거나 오래되면 저장소 파일과 Git diff가
우선이다. 전체 patch는 공개 저장소에 넣지 않고, 필요한 경우만 로컬 감사
자료 또는 같은 두 Git 커밋의 재생성 결과로 검증한다.
