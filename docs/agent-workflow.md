---
title: Git-native Agent workflow
---

# Git-native Agent workflow

이 문서는 저장소 지식 구조, 문서 라우팅과 Agent Team 역할의 정본이다. 실행 절차는
저장소 전용 `$corca-site-page-pipeline` Skill이 이 문서를 참조하며, 같은 표와 규칙을
다른 시작 문서에 복제하지 않는다.

Corca 웹사이트의 Agent 지식은 대화 백업이나 별도 데이터베이스가 아니라 현재
저장소의 코드, 테스트, 주제별 문서와 Git 이력으로 유지한다. Notion과 PDF는
승인된 콘텐츠를 받아들이는 입력 수단이며, 저장소에 콘텐츠 정본이 만들어진 뒤에는
새 대화의 필수 시작 자료가 아니다.

이 구조의 목표는 다음 세 가지다.

- 새 Agent가 긴 transcript 없이 현재 최선의 구현을 빠르게 이해한다.
- 여러 Agent가 같은 정본을 역할별로 나눠 읽고 충돌 없이 협업한다.
- 실패한 접근은 활성 규칙과 분리해 필요할 때만 검색한다.

## 지식의 우선순위

충돌이 있을 때는 아래 순서로 판단한다.

1. 현재 저장소 코드와 자동 테스트
2. 현재 작업 트리의 Git diff와 최신 관련 commit
3. `docs/index.md`가 연결하는 주제별 정본
4. 페이지별 잠긴 콘텐츠 Markdown
5. [실패 접근 원장](failed-approaches.md)의 관련 검색 결과
6. Pull Request와 과거 Git 이력
7. Notion 시작 안내와 과거 대화

과거 대화는 결정의 배경을 조사할 때만 사용한다. 코드·문서와 충돌하는 과거 문장을
현재 정책으로 복원하지 않는다.

## 새 작업의 기본 로드

새 Agent는 전체 문서를 읽지 않고 다음만 수행한다.

1. 실제 저장소가 `corca-ai/www`인지 확인한다.
2. `git status --short --branch`, HEAD와 `origin/main`의 차이를 확인한다.
3. `AGENTS.md`와 `docs/index.md`를 읽는다.
4. `docs/index.md`에서 현재 작업과 직접 관련된 문서만 읽는다.
5. 실패가 의심될 때만 실패 원장을 키워드로 검색한다.

다음 자료는 기본으로 읽지 않는다.

- 전체 대화 transcript
- 전체 patch 또는 생성 HTML
- 완료된 작업의 dated handoff
- 오래된 스크린샷 묶음
- 현재 코드로 대체된 중간 PDF ledger와 layout spec
- Notion의 새 대화 시작 안내

dirty worktree에서는 기존 파일을 reset, clean, checkout, stash 또는 덮어쓰기하지
않는다. 브랜치가 최신 `origin/main`보다 뒤라면 차이를 먼저 보고하고, dirty 상태에서
merge나 rebase를 시작하지 않는다.

## 작업별 문서 라우팅

| 작업 | 읽을 정본 |
| --- | --- |
| AX 페이지 | `docs/ax.md`, 해당 페이지 콘텐츠 Markdown과 구현 파일 |
| Ceal | `src/components/pages/ax-v2/ceal/CEAL_CONTENTS.md`, `docs/ax.md` |
| Lead Form·`#request` | `docs/lead-form-agent-manual.md`, `docs/ax.md` |
| favicon·Technical SEO·성능 | `docs/seo-content-governance.md` |
| 다국어 | `docs/i18n.md`, 해당 locale registry |
| 블로그 | `docs/blog.md` |
| 코드 검증 | `docs/code-quality.md` |
| branch·PR·배포 | `docs/contributing.md`, `docs/deployment.md` |

현재 브랜치에 정본 문서가 없고 `origin/main`에는 있다면 요약본을 새로 만들지 않는다.
먼저 `git show origin/main:<path>`로 사실을 확인하고, 구현 전에는 최신 main 통합을
안전한 별도 단계로 다룬다.

## 페이지 콘텐츠 정본

각 페이지는 사람에게 읽히는 Markdown 하나를 콘텐츠 정본으로 가진다. 이 파일에는
원문 hash, locale, 변경 허용 범위와 H1·H2·H3 구조를 기록한다. 렌더링용 TypeScript
데이터가 별도로 필요하면 빌드에서 두 visible-copy sequence를 비교해 불일치 시
실패시킨다.

Ceal의 정확성 계약은 **Ceal 콘텐츠 영역의 PDF 원문 잠금**이다. 공유 GNB,
Breadcrumb, Footer, Lead Form과 접근 가능한 asset 이름은 사이트 기능이므로 PDF 외
문구가 존재할 수 있다. 이 예외를 이유로 Ceal 원문을 다시 쓰거나 요약하지 않는다.

## 공통 계약을 연결한다

- GNB, Breadcrumb와 Footer는 페이지에서 복제하지 않는다.
- 일반 페이지와 블로그 상담 영역은 `LeadRequestSection`을 우선한다.
- `LeadForm` 내부 DOM·필드·카피·validation·endpoint·GA·CSS·UX는 페이지 요구로
  변경하지 않는다.
- locale과 무관한 `page_id`와 `content_type`은 route 또는 manifest에서 한 번
  선언한다. 실제 `page_path`, `base_path`, `locale`은 공통 흐름으로 전달한다.
- favicon은 `assets/brand/favicon-symbol.svg` 한 원본과 공개 호환 URL을 유지한다.
  구형 alias를 삭제하거나 검색용 `rel=icon` 후보를 추가하지 않는다.

상세 규칙은 위 라우팅표의 정본이 소유한다. 이 문서에 필드·명령·경로 전체를 다시
복사하지 않는다.

## Agent Team 역할

| 역할 | 책임 | 파일 권한 |
| --- | --- | --- |
| Orchestrator | 범위·정본·파일 소유권·승인 경계, 결과 통합 | 통합 파일만 수정 |
| Content Guardian | PDF/Markdown 문구·hash·heading 구조 검증 | 읽기 전용 |
| Page Builder | semantic HTML, 컴포넌트, responsive·motion 구현 | 배정된 구현 파일 |
| Contract Reviewer | SEO·locale·Lead Form·favicon·접근성 검토 | 읽기 전용 |
| Visual QA | desktop·tablet·mobile와 reduced motion 검토 | 읽기 전용, 피드백만 |
| Release | 검증·diff 확인, 요청된 commit·PR·배포 | release 범위만 수정 |

작은 수정에서는 한 Agent가 여러 역할을 맡는다. 페이지 신설이나 공통 계약 변경에서는
검토 역할을 분리한다. 동시에 작업할 때 하나의 파일은 한 Agent만 수정하고,
Orchestrator만 결과를 통합한다.

## 실패 지식의 수명

실패 기록은 현재 정본이 아니며 금지 목록을 무한히 늘리는 장소도 아니다. 다음을 모두
만족할 때만 [실패 접근 원장](failed-approaches.md)에 추가한다.

- 실패 원인이 확인됐다.
- 다른 Agent가 같은 시도를 반복할 가능성이 있다.
- 현재 코드와 테스트만으로 실패 이유를 파악하기 어렵다.
- 채택한 대안과 다시 시도할 조건을 설명할 수 있다.

5px 조정, 단순 디자인 취향 변경, 일회성 탐색 spike는 Git diff만으로 충분하다.

## 어디서든 이어가기

로컬의 미커밋 파일은 다른 컴퓨터에서 보이지 않는다. 다른 환경에서 이어가야 한다면
현재 최선의 결과를 focused commit으로 만들고, 사용자가 요청한 범위에서 작업
브랜치를 GitHub에 push한다. 이는 별도 백업 문서를 만드는 일이 아니라 작업 자체의
버전 기록이다.

지속되는 결정만 가장 가까운 주제 문서에 한 번 기록한다. 완료된 임시 handoff는 활성
시작 경로에서 제거하고 Git 이력으로 보존한다.

## 새 대화 시작 지시문

```text
작업 저장소는 /Users/tommy/Documents/XT/corca-www 이다.

이전 대화를 복구하거나 전체 handoff를 읽지 말고 저장소와 Git을 정본으로 사용해라.
저장소 전용 $corca-site-page-pipeline Skill을 사용해라. 먼저 AGENTS.md,
docs/index.md, docs/agent-workflow.md를 읽고 git status, 현재 branch, HEAD와
origin/main의 차이를 보고해라. 기존 미커밋 변경은 덮어쓰거나 stash하지 마라.

이번 작업은 <대상 URL 또는 기능>이다. docs/index.md에서 직접 관련된 정본만 읽고,
실패 기록은 <관련 키워드>로 검색한 일치 항목만 읽어라. 첫 단계에서는 현재 상태와
필요한 변경 범위를 보고한 뒤 진행해라.
```
