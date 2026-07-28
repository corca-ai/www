---
title: Corca site and AX V2 handoff — 2026-07-28
generated_at: 2026-07-28T14:02:32+09:00
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
- UTM과 비식별 전환 이벤트만 분석 도구에 전달하며 이름·이메일·상담
  내용은 Google Analytics 또는 `dataLayer`로 보내지 않는다.
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

## 새 대화 시작문

새 컴퓨터에서는 먼저 저장소를 clone하고 `main`을 최신 상태로 만든다.

```sh
git clone https://github.com/corca-ai/www.git
cd www
git switch main
git pull --ff-only origin main
```

그다음 아래 블록을 새 대화의 첫 입력으로 사용한다. 첫 줄의 경로만 해당
컴퓨터에서 clone한 저장소의 절대 경로로 바꾼다.

```text
실제 Git 저장소는 <이 컴퓨터에서 corca-ai/www를 clone한 절대 경로>이다.
이전 대화를 복구하거나 추측하지 말고 저장소 파일과 Git 이력만 기준으로 사용해라.

다음 순서로 읽고 확인해라.

1. AGENTS.md
2. docs/index.md
3. docs/handoffs/2026-07-28-corca-site-handoff.md

먼저 아래 명령에 해당하는 읽기 전용 확인만 수행해라.

- git status --short
- git branch --show-current
- git log -1 --oneline
- git merge-base --is-ancestor 22b8e37f32d526188c344a49ef7dc25af1d17dae HEAD

작업 트리가 clean인지 확인하고, 현재 HEAD가 위 스냅샷보다 최신이면
22b8e37f32d526188c344a49ef7dc25af1d17dae 이후의 커밋과 diff만 별도로
요약해라. 문서와 코드가 충돌하면 저장소 파일과 Git diff를 우선해라.

현재 실서비스 /ax의 공식 명칭은 AX V2다.
다음은 보호 대상이며 명시적 요청 없이 수정하지 마라.

- /ax-backup
- src/components/pages/AxLegacy.astro
- src/components/pages/ax/

완료된 작업과 미착수 계획을 섞지 마라.
다음 작업 후보는 아직 미착수 상태다.

- AX 카테고리 아래 신규 페이지 기획 및 신설
- 메인 화면 리뉴얼
- 회사소개 카테고리 리뉴얼

이번 단계에서는 현재 구조, GNB, 다국어 체계, 공통 컴포넌트,
SEO·Breadcrumb·Footer 정책을 확인하고 구현 계획만 작성해라.
URL 구조, 페이지 수, 다국어 범위, 디자인 방향을 임의로 확정하지 말고
코드 수정, commit, push, PR, merge, 배포를 시작하지 마라.
```
