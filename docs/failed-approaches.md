---
title: Failed approaches
---

# Failed approaches

현재 채택된 구현은 코드와 주제별 문서가 소유한다. 이 문서는 다른 Agent가 원인이
확인된 실패를 반복하지 않도록 폐기된 접근만 보존한다. 기본 컨텍스트로 전체를 읽지
말고 작업 키워드로 검색한다.

```sh
rg -n -i '<route|component|symptom keywords>' docs/failed-approaches.md
```

새 항목은 상태, 범위, 시도, 증상, 원인, 채택 대안, 근거와 재시도 조건을 포함한다.

## FAIL-0001 — favicon 구형 공개 URL 삭제

- Status: rejected
- Tags: favicon, legacy-alias, 404, search-cache
- Attempt: `favicon-16.png`, `favicon-32.png`, `favicon-48.png` 등 과거 URL을 정리했다.
- Symptom: 기존 탭과 검색 캐시의 요청이 404가 되어 지구본 또는 빈 아이콘이 나타났다.
- Why it failed: 공개 URL을 브라우저와 검색엔진이 이미 장기 식별자로 기억하고 있었다.
- Adopted replacement: 공식 SVG에서 구형 alias도 계속 생성하고 영구 호환 계약으로 보호한다.
- Evidence: PR #217, merge `136dc46`.
- Retry only if: 명시적 브랜드·URL 마이그레이션과 장기 redirect 정책이 승인될 때.

## FAIL-0002 — favicon 원본·검색 후보를 여러 개 운영

- Status: rejected
- Tags: favicon, rel-icon, legacy-c, duplicate-head
- Attempt: 과거 C 아이콘 또는 여러 `rel=icon` 후보를 함께 제공했다.
- Symptom: 브라우저와 검색엔진이 서로 다른 후보를 선택해 결과가 일관되지 않았다.
- Why it failed: 브랜드 원본과 검색용 대표 후보의 단일성이 깨졌다.
- Adopted replacement: Figma node `46:17` SVG 하나에서 자산을 만들고 검색용 48px PNG를 head에 한 번만 선언한다.
- Evidence: `docs/seo-content-governance.md`의 favicon discovery contract.
- Retry only if: 공식 브랜드 원본이 교체되고 전체 호환 자산 마이그레이션이 승인될 때.

## FAIL-0003 — 페이지마다 Lead Form을 복제하거나 내부 스타일을 덮어씀

- Status: rejected
- Tags: lead-form, duplication, validation, css, analytics
- Attempt: 페이지별 디자인을 맞추기 위해 Form markup 또는 내부 CSS를 복사·수정했다.
- Symptom: validation, 다국어 문구, 제출 UX, endpoint와 GA 이벤트가 페이지별로 갈라졌다.
- Why it failed: 입력 Form과 바깥 상담 section의 소유권을 구분하지 않았다.
- Adopted replacement: `LeadForm`은 닫힌 컴포넌트로 유지하고 일반 페이지는 `LeadRequestSection`의 외부 variant만 선택한다.
- Evidence: `docs/lead-form-agent-manual.md`, PR #207.
- Retry only if: Form 정책 자체를 변경하는 별도 승인 PR일 때.

## FAIL-0004 — locale 또는 Form마다 `page_id`를 직접 기입

- Status: rejected
- Tags: lead-form, page-id, locale, attribution
- Attempt: 각 CTA·Form 또는 언어 경로마다 별도 `page_id`를 넣었다.
- Symptom: 같은 콘텐츠의 리드가 언어별로 분절되고 누락·오타가 생겼다.
- Why it failed: 페이지 식별과 실제 제출 경로를 하나의 값으로 섞었다.
- Adopted replacement: locale-neutral `page_id`와 `content_type`을 route/manifest에서 한 번 선언하고 실제 `page_path`와 `locale`은 공통 client가 기록한다.
- Evidence: `docs/ax.md`와 `docs/lead-form-agent-manual.md`.
- Retry only if: 분석 데이터 모델에서 콘텐츠 ID 의미를 공식 변경할 때.

## FAIL-0005 — 실제 수신함 또는 remote binding으로 Form 회귀 테스트

- Status: rejected
- Tags: lead-form, email, remote, testing
- Attempt: 구현 확인을 위해 운영 수신함으로 메일을 보내거나 `remote: true`를 사용했다.
- Symptom: 운영 수신함이 테스트 데이터로 오염되고 실제 전송 위험이 생겼다.
- Why it failed: 코드 경로 검증과 운영 전달 검증을 분리하지 않았다.
- Adopted replacement: 가짜 `AX_EMAIL.send()`와 Wrangler 로컬 이메일 시뮬레이션을 사용한다.
- Evidence: `docs/lead-form-agent-manual.md`의 실제 메일 없는 테스트 절차.
- Retry only if: 수신자 동의를 받은 명시적 실서비스 전달 점검일 때.

## FAIL-0006 — Vanta Rings를 런타임·수명주기 확인 없이 추가

- Status: rejected
- Tags: ceal, vanta, rings, three, invisible-canvas
- Attempt: effect URL과 스타일만 적용하면 링이 즉시 보인다고 가정했다.
- Symptom: section 공간은 있지만 canvas가 없거나 effect가 보이지 않았다.
- Why it failed: Vanta factory export, Three.js 주입, 실제 DOM 크기, Astro navigation 수명주기와 오류 fallback을 확인하지 않았다.
- Adopted replacement: Vanta와 Three를 명시적으로 동적 import하고 viewport 진입 시 초기화하며 ready/unavailable 상태, cleanup과 CSS gradient fallback을 유지한다.
- Evidence: 현재 Ceal `ceal-rings.ts`와 visual review.
- Retry only if: 다른 effect가 동일한 모듈·수명주기 계약을 충족할 때.

## FAIL-0007 — 강한 모션 배경을 그대로 본문 뒤에 배치

- Status: rejected
- Tags: ceal, vanta, contrast, layering, readability
- Attempt: 밝은 Rings canvas를 텍스트와 카드 뒤에 높은 불투명도로 배치했다.
- Symptom: 제목과 설명이 링에 묻히고 카드와 배경의 시각적 분리가 약해졌다.
- Why it failed: 장식 효과가 콘텐츠 위계와 대비보다 앞섰다.
- Adopted replacement: 진한 네이비 gradient, 별도 overlay, 낮은 canvas opacity, 명확한 z-index와 카드 배경·outline을 사용한다.
- Evidence: 현재 Ceal `ceal.css`와 visual review.
- Retry only if: 실제 viewport 대비와 reduced-motion fallback을 함께 통과할 때.

## FAIL-0008 — 자동 contract 통과를 정책 전체 보호로 간주

- Status: rejected
- Tags: lead-form, favicon, contract-test, false-confidence
- Attempt: contract 검사 하나가 client 로직·카피·CSS·생성 자산 전체를 보호한다고 가정했다.
- Symptom: 검사 범위 밖의 정책 회귀를 놓칠 수 있었다.
- Why it failed: Lead Form 검사는 DOM hash·필수 문자열·외부 selector를 중심으로 보고, favicon 단독 검사는 기존 `dist`를 볼 수 있다.
- Adopted replacement: 관련 단위 검사와 production build를 함께 실행하고 diff·렌더 결과를 수동 검토한다. favicon 자산 변경 전에는 `pnpm favicon:build`를 사용한다.
- Evidence: 현재 test script와 `package.json` 대조.
- Retry only if: contract가 해당 정책 전체를 검증하도록 명시적으로 확장됐을 때.

## FAIL-0009 — 문서에 존재하지 않는 favicon 명령 기록

- Status: rejected
- Tags: favicon, docs-drift, command
- Attempt: favicon 생성 명령을 `pnpm build:favicon`으로 기록했다.
- Symptom: `package.json`에 없는 명령이므로 새 Agent가 실행할 수 없다.
- Why it failed: 실행 가능한 script 이름을 저장소와 대조하지 않고 요약 문서에 복사했다.
- Adopted replacement: 현재 정본 명령 `pnpm favicon:build`를 사용하고 문서 변경 시 `package.json`과 함께 검증한다.
- Evidence: `package.json`, commit `cf30896`의 context 문서 감사.
- Retry only if: package script 이름이 실제로 변경될 때.
