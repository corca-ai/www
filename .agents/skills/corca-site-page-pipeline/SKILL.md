---
name: corca-site-page-pipeline
description: Corca 웹사이트의 승인된 Markdown, Notion 또는 PDF 원문을 보존하면서 Astro 페이지를 설계·구현·검증하는 저장소 전용 파이프라인. /ax 하위 페이지, 블로그·정적 페이지, 선언적 레이아웃, 반응형·모션, Technical SEO·다국어, 공통 Lead Form, favicon, diff·PR·배포 준비 또는 여러 Agent가 역할을 나눠 작업할 때 사용한다.
---

# Corca Site Page Pipeline

## 시작 상태를 고정한다

1. `git remote -v`로 `corca-ai/www` 저장소인지 확인한다.
2. `git status --short --branch`, 현재 HEAD와 `origin/main` 차이를 확인한다.
3. 기존 변경을 reset, clean, checkout, stash 또는 덮어쓰기하지 않는다.
4. `AGENTS.md`, `docs/index.md`, `docs/agent-workflow.md`를 읽는다.
5. `docs/agent-workflow.md`의 라우팅표에서 이번 작업에 필요한 정본만 추가로 읽는다.

현재 코드와 테스트, Git diff를 문서나 과거 대화보다 우선한다. 작업 브랜치가
`origin/main`보다 뒤라면 최신 정책을 추측하거나 복사하지 말고 먼저 차이를
보고한다. dirty worktree에 merge 또는 rebase하지 않는다.

## 필요한 지식만 불러온다

과거 transcript, 전체 patch, 생성 HTML, dated handoff와 Notion 시작 안내는 기본
컨텍스트가 아니다. 문서 라우팅과 지식 우선순위는 `docs/agent-workflow.md` 한 곳을
따른다. 현재 코드로 설명되지 않는 반복 실패를 조사할 때만 다음 명령으로 관련
항목을 찾는다.

```sh
rg -n -i '<route|component|symptom keywords>' docs/failed-approaches.md
```

일치한 항목 주변만 읽고 파일 전체를 매번 로드하지 않는다.

## 역할을 배정한다

`docs/agent-workflow.md`의 Agent Team 역할과 파일 권한을 따른다. 작은 수정은 한
Agent가 역할을 겸할 수 있지만 페이지 신설이나 공통 계약 변경은 구현과 검토를
분리한다. 동시에 하나의 파일은 한 Agent만 수정한다.

## 페이지를 만든다

1. 원문의 파일, hash, locale, 콘텐츠 잠금 여부를 기록한다.
2. `page_id`, `content_type`, 기준 URL, index 상태와 출시 언어를 확정한다.
3. H1·H2·H3와 section intent를 원문에서 추출하되 문장을 다시 쓰지 않는다.
4. GNB, Breadcrumb, Footer와 공통 Form을 복제하지 않고 기존 컴포넌트를 조합한다.
5. 일반 페이지와 블로그의 상담 영역은 `LeadRequestSection`을 우선한다. 이미 자체
   상담 영역을 소유한 승인된 예외에서만 `LeadForm`을 직접 사용한다.
6. 디자인은 현재 Corca 구현을 기준으로 선언적 layout, responsive hierarchy,
   restrained motion을 선택한다. 콘텐츠를 디자인에 맞춰 축약하지 않는다.
7. 원문 잠금, semantic heading, metadata, canonical, locale, structured data,
   accessibility와 성능 계약을 검증한다.
8. 실제 viewport에서 시각 검토하고 관련 자동 검사를 실행한다.

PDF 원문을 사용할 때는 텍스트 추출만 신뢰하지 않는다. 모든 페이지를 렌더해 제목,
본문, 수치, 각주, 링크와 시각적 그룹을 대조한다. 공유 사이트 shell과 Form 문구는
원문 잠금 범위의 기능적 예외로 명시한다.

## 완료 조건

변경 범위에 맞는 검사, `git diff --check`, desktop·tablet·mobile 시각 검토를
완료하고 다음을 보고한다.

- 변경한 파일과 이유
- 원문 보존 결과
- 실행한 검사와 결과
- 남은 위험 또는 승인 필요 항목
- commit·push·PR·배포 상태

지속되는 지식과 실패 기록은 `docs/agent-workflow.md`의 수명 규칙에 따라 가장 가까운
정본에만 반영한다. transcript나 별도 백업을 만들지 않는다.

commit, push, PR, merge 또는 실서비스 배포는 사용자의 현재 요청이 포함한 범위에서만
수행한다.
