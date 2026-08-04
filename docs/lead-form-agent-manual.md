---
title: Lead Form Agent 매뉴얼
---

# Lead Form Agent 매뉴얼

이 문서는 Corca 웹사이트의 상담 신청 Form을 새 페이지에 붙이는 실행
매뉴얼이다. 개발 경험이 적어도 아래 순서를 그대로 따르면 된다.

## 먼저 구분하기

| 필요한 결과 | 사용할 컴포넌트 |
| --- | --- |
| 제목·설명·연락처·Form이 포함된 상담 영역 전체 | `LeadRequestSection.astro` |
| 이미 별도 상담 영역이 있고 Form만 필요 | `LeadForm.astro` |

대부분의 일반 페이지와 블로그에는 `LeadRequestSection`을 사용한다. 이
컴포넌트는 실제 `id="request"`를 제공하므로 `/경로#request`로 바로 이동할
수 있다.

## 다양한 형식은 이렇게 요청하기

이 문서에서 "Lead Form 형식"은 입력 Form 자체가 아니라 **Form을 감싸는
상담 section의 표현 방식**을 뜻한다. 같은 `LeadForm`을 유지한 채 다음과
같은 외부 형식을 요청할 수 있다.

| 요청할 형식 | 변경하는 영역 |
| --- | --- |
| 기본 2단형 | 왼쪽 제목·설명·연락처, 오른쪽 Form 배치 |
| 중앙 세로형 | 제목·설명을 중앙에 두고 Form을 아래에 배치 |
| 블로그 글 하단형 | 글 본문 뒤·Footer 앞에 상담 section 배치 |
| 페이지 톤 맞춤형 | section 배경색·바깥 여백·제목 색상 변경 |
| 기존 영역에 Form만 삽입 | 페이지가 소유한 wrapper 안에서 `LeadForm` 호출 |

형식을 요청할 때는 아래 항목을 가능한 만큼 적는다.

1. 대상 URL 또는 블로그 slug
2. 삽입 위치: 본문 뒤, Footer 앞, 특정 section 뒤 등
3. 외부 레이아웃: 기본 2단형, 중앙 세로형, 글 하단형
4. section 제목과 설명
5. 배경색 또는 참고할 기존 페이지
6. 연락처 영역 표시 여부
7. 적용할 언어
8. `page_id`와 `content_type`

현재 `LeadRequestSection`이 원하는 외부 형식을 바로 표현하지 못하면 Agent는
section root의 variant class 또는 바깥 wrapper prop만 추가한다. 레이아웃
CSS도 Form 바깥 요소에만 적용한다. 이를 해결하기 위해 `LeadForm` 내부
마크업이나 `lead-form.css`를 변경해서는 안 된다.

### Agent에게 복사할 형식 지정 예시

```text
AGENTS.md와 docs/lead-form-agent-manual.md를 먼저 읽어라.

다음 페이지에 공통 Lead Form 상담 영역을 붙여라.

- 대상 URL 또는 블로그 slug: [입력]
- 삽입 위치: [예: 글 본문 뒤, Footer 앞]
- 상담 section 형식: [기본 2단형 / 중앙 세로형 / 글 하단형]
- 제목: [입력]
- 설명: [입력]
- 배경 또는 참고 페이지: [입력]
- 연락처 영역: [표시 / 숨김]
- 적용 언어: [ko / en / ja / zh / 전체]
- page_id: [언어와 무관한 식별자]
- content_type: [예: blog-post]

원하는 형식이 기존 LeadRequestSection에 없으면 Form 바깥의 section variant만
추가해라. LeadForm 내부 DOM·필드·카피·validation·개인정보 문구·버튼·
endpoint·payload·GA 이벤트·CSS·UX는 수정하거나 복사하지 마라.

/경로#request 이동, 성함 자동 포커스, 실제 page context와 네 언어 화면을
검증하고 필수 검사 결과와 diff를 보고해라.
```

"이메일 필드를 하나 더 추가", "버튼 문구 변경", "간단한 Form으로 축소",
"동의 문구 제거"처럼 Form 계약을 바꾸는 요청은 section 형식 변경이 아니다.
이런 변경은 별도 Form 정책 결정과 명시적으로 승인된 별도 PR이 필요하다.

## 절대로 바꾸지 않는 것

`LeadForm.astro`의 `<form>...</form>`은 잠금 대상이다. 다음 항목을 새
페이지 요구에 맞춰 수정하지 않는다.

- DOM 구조, 입력 필드, 필드 순서, label과 placeholder
- validation, 오류 메시지, 개인정보 문구와 중국어 동의
- 전송 버튼의 문구·disabled 상태·애니메이션
- 자동 포커스, 오류 표시와 성공 안내 UX
- `POST /api/ax/consultations` endpoint와 기존 payload
- `form_submit`, `generate_lead` 이벤트 발생 조건
- `lead-form.css`의 Form 내부 스타일

Form 마크업을 페이지로 복사하거나 페이지 CSS에서
`[data-lead-form]`, `.ax-v2-field`, `.ax-v2-form-*`를 선택하지 않는다.
`pnpm check:lead-form-contract`가 이런 변경을 차단한다. 검사가 실패하면
fixture를 갱신하지 말고 원본 Form 변경을 되돌린다. Form 정책 변경은
명시적으로 승인된 별도 PR에서만 한다.

## 일반 Astro 페이지에 붙이기

### 1. 페이지 manifest에 context 선언

`src/staticPages.ts` 또는 해당 제품 registry에 locale과 무관한 값을 한
번 선언한다.

```ts
leadContext: {
  pageId: 'ax-knownow',
  contentType: 'ax-solution',
}
```

- `pageId`: 소문자 kebab-case. 네 언어에서 같은 값 사용
- `contentType`: `ax-solution`, `blog-post`처럼 안정적인 분류
- `basePath`: 기존 route의 locale 없는 경로에서 자동 전달
- `locale`, `pagePath`: 실제 제출 URL에서 자동 결정

Form 태그나 CTA에 `page_id`를 직접 쓰지 않는다.

### 2. 전체 상담 영역 렌더링

```astro
---
import LeadRequestSection from '../forms/LeadRequestSection.astro';
---

<LeadRequestSection
  lang={lang}
  pageContext={leadContext}
  heading={pageCopy.requestHeading}
  description={pageCopy.requestDescription}
/>
```

`heading`과 `description`을 생략하면 현재 AX 상담 섹션의 언어별 기본
문구를 사용한다. 바깥 배경·정렬·여백을 바꾸려면 `class`를 전달해 section
root만 스타일링한다. Form 내부 selector는 사용하지 않는다.

### 3. CTA 연결

```astro
<a href="#request" data-lead-request-jump>상담 신청하기</a>
```

일반 클릭은 상담 영역으로 즉시 이동해 성함 필드에 포커스한다. 직접
`/경로#request`로 진입해도 같은 필드에 포커스한다. Cmd/Ctrl 클릭은
브라우저의 새 탭 동작을 유지한다. canonical, hreflang, sitemap, OG와
JSON-LD에는 `#request`를 넣지 않는다.

## Form만 붙이기

```astro
<LeadForm id="request-form" lang={lang} pageContext={leadContext} />
```

`id`는 같은 문서 안에서 고유해야 한다. Form은 성공 안내 template과
클라이언트를 함께 제공한다. 필드·문구·버튼을 바꾸는 prop은 추가하지
않는다.

## 블로그 글에 붙이기

블로그는 Astro route가 아니라 정적 HTML이므로 컴포넌트를 글 HTML에
복사하지 않는다. `src/lead/blogLeadPages.json`에 선택한 locale-neutral
slug만 등록한다.

```json
{
  "agentic-workflow": {
    "page_id": "blog-agentic-workflow",
    "content_type": "blog-post"
  }
}
```

빌드가 `/blog/agentic-workflow`와 `/en|ja|zh/blog/agentic-workflow`에 같은
공통 section을 본문 뒤·Footer 앞에 삽입한다. 네 페이지는 같은
`page_id`와 `/blog/agentic-workflow` `base_path`를 쓰고, 실제 locale과
`page_path`만 달라진다. manifest에 없는 글은 변경되지 않는다.

등록한 slug가 네 언어 빌드 중 하나라도 없거나 이미 `id="request"`가
있으면 빌드가 실패한다. 운영 글의 HTML을 직접 수정해 우회하지 않는다.

## 실제 메일을 보내지 않고 전송 확인하기

운영 수신함 `contact+ax@corca.ai`로 테스트 메일을 보내지 않아도 세 단계로
검증할 수 있다. PR의 기본 검증은 1단계와 2단계이며, 브라우저부터 Worker까지
직접 확인해야 할 때만 3단계를 추가한다.

### 1단계: 자동 테스트로 Form과 메일 생성 확인

```sh
pnpm test:lead-form
pnpm test:ax-attribution
```

`pnpm test:lead-form`은 다음을 확인한다.

- 잠긴 Form 마크업이 기준 fixture와 동일하다.
- 블로그 글에 상담 section이 한 번만 삽입된다.
- 네 언어가 같은 `page_id`와 올바른 locale context를 사용한다.
- 미등록 글은 바뀌지 않고 중복 `#request`는 거부된다.

`pnpm test:ax-attribution`의 `tests/axConsultations.test.ts`는 실제 이메일
binding 대신 메모리에 메시지를 담는 가짜 `AX_EMAIL.send()`를 Worker에
주입한다. 따라서 네트워크나 실제 수신함을 사용하지 않으면서 다음을
검증한다.

- 유효한 제출의 API 응답이 `200`이다.
- `AX_EMAIL.send()`가 정확히 한 번 호출된다.
- 생성된 text/HTML 메일에 이름·이메일·관심사·유입 정보가 들어간다.
- `page_id`, `page_path`, `base_path`, `locale`, `content_type`이 메일에
  들어간다.
- 잘못된 context는 `422`가 되고 이메일 호출은 0회다.

정상 판정은 두 명령이 exit code `0`으로 끝나고 Node test summary의
`fail`이 `0`인 것이다. 이 단계가 통과하면 **Form 제출 payload를 Worker가
받아 상담 메일 객체를 생성하고 send binding을 호출하는 코드 경로**가
정상이라는 뜻이다.

테스트 구현을 직접 확인하려면 다음 파일을 읽는다.

- `tests/blogLeadSection.test.ts`: 블로그 삽입과 page context
- `tests/axConsultations.test.ts`: 가짜 이메일 binding과 메일 text/HTML
- `worker/axConsultations.ts`: 실제 API validation과 메일 생성

### 2단계: 적용한 블로그 빌드 결과 확인

manifest에 대상 글을 등록한 뒤 실행한다.

```sh
pnpm build
```

빌드가 성공하면 생성된 네 언어 HTML에서 `id="request"`, `data-lead-page`,
`data-page-base-path`, `data-content-type`, `data-locale`을 확인한다. 예를 들어
slug가 `agentic-workflow`이면 다음 파일을 검사한다.

```sh
rg -n 'id="request"|data-lead-page|data-page-base-path|data-content-type|data-locale' \
  dist/blog/agentic-workflow/index.html \
  dist/en/blog/agentic-workflow/index.html \
  dist/ja/blog/agentic-workflow/index.html \
  dist/zh/blog/agentic-workflow/index.html
```

정상 결과는 각 파일에 `id="request"`가 한 번, 같은 `page_id`와
`base_path`, 언어별 `data-locale`이 표시되는 것이다. 이 단계에서는 Form을
제출하지 않는다.

### 3단계: 로컬 브라우저에서 전체 전송 흐름 확인

```sh
pnpm cf:preview
```

터미널에 표시된 로컬 주소에서 `/blog/[slug]#request`를 열고 Form을 한 번
제출한다. 현재 `wrangler.jsonc`의 `AX_EMAIL` binding에는 `remote: true`가
없으므로 Wrangler가 이메일 전송을 로컬에서 시뮬레이션한다. 실제
`contact+ax@corca.ai` 수신함에는 보내지 않는다.

정상일 때 확인할 내용은 다음과 같다.

1. 브라우저 Network에서 `POST /api/ax/consultations`가 `200`이다.
2. 화면에 기존 Form 성공 안내가 나타난다.
3. Wrangler 터미널에 `send_email binding called`와 subject가 출력된다.
4. 터미널에 출력된 `email-text`와 `email-html` 임시 파일을 열면 실제로
   생성될 메일 본문과 page context를 볼 수 있다.

Wrangler 로컬 simulator는 이메일을 콘솔에 기록하고 임시 파일로 저장한다.
자세한 동작은 [Cloudflare Email Sending 로컬 개발 문서](https://developers.cloudflare.com/email-service/local-development/sending/)를
참고한다.

주의: `wrangler.jsonc`의 email binding에 `remote: true`를 추가하거나
`wrangler dev --remote`를 사용하면 실제 이메일이 발송될 수 있다. 메일 없는
검증에서는 이 설정을 사용하지 않는다.

브라우저에서는 전송 외에도 다음을 확인한다.

1. 한국어·영어·일본어·중국어 URL에 Form이 한 번만 표시된다.
2. `/경로#request` 진입 시 상담 영역과 성함 포커스가 동작한다.
3. 최초 포커스는 연한 노란 안내 상태이며 오류 메시지가 없다.
4. 첫 글자 입력 후 안내 색상이 사라진다.
5. Form 내부의 폭·필드·버튼·validation이 AX와 같다.
6. 제출 payload의 `page_id`, `page_path`, `base_path`, `locale`,
   `content_type`이 맞다.

마지막으로 전체 품질 검사를 실행한다.

```sh
pnpm check
pnpm build
```

## 문제 해결 순서

1. 페이지가 `leadContext`를 전달하는지 확인한다.
2. 한 문서에 `id="request"`가 하나인지 확인한다.
3. Form을 복사하지 않고 공통 컴포넌트를 import했는지 확인한다.
4. 페이지 CSS가 Form 내부를 선택하지 않는지 확인한다.
5. `pnpm check:lead-form-contract`의 첫 오류를 해결한다.
6. Form 원본을 수정해야만 해결될 것 같으면 작업을 멈추고 별도 승인을
   요청한다.

## Agent에게 전달할 작업 지시문

```text
AGENTS.md와 docs/lead-form-agent-manual.md를 먼저 읽어라.
대상 페이지에 공통 LeadRequestSection을 추가하고 route/manifest의
leadContext를 연결해라. LeadForm 내부 마크업·필드·카피·validation·버튼·
endpoint·GA 이벤트·CSS는 변경하거나 복사하지 마라. #request 이동과 네
언어 page context를 검증하고 pnpm test:lead-form, pnpm test:ax-attribution,
pnpm check, pnpm build를 실행한 뒤 diff와 회귀 위험을 보고해라.
```
