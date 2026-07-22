---
title: AX redesign handoff
---

# AX redesign handoff

Use this document as the durable handoff when the `/ax` content and visual
system are redesigned. Conversation history is supporting context; the files in
this repository are the source of truth after Codex compacts a long task.

## Protected baseline

- The public backup is `/ax-backup` and represents the approved Korean AX page
  captured on 2026-07-22.
- The backup is deliberately `noindex, nofollow`, excluded from sitemaps and
  canonicalized to `/ax`.
- `src/components/pages/AxLegacy.astro` and
  `src/components/pages/ax/` are the frozen implementation. Do not edit them for
  the redesign.
- Shared header, footer, security headers and cache delivery remain shared so
  global site fixes can still apply to the backup.
- New AX images should use a new versioned directory. Do not overwrite assets
  referenced by the frozen page.

## Non-negotiable release contract

Read [SEO and performance governance](seo-content-governance.md) before planning
or coding. In particular, preserve the mobile 720px breakpoint, zero mobile
WebM requests, mobile Pretendard strategy, responsive AVIF/WebP LCP image,
intrinsic image dimensions, lazy below-fold images, reduced-motion behavior,
cache policy, structured-data truthfulness and localized metadata.

The mobile PageSpeed Insights release gate is the median of three production
runs at 90 or above. LCP, CLS, TBT, TTFB and transfer size are recorded for
diagnosis. The functional critical-path checks remain blockers even when the
score is 90 or higher.

## Recommended two-stage instruction

Start with planning only:

```text
/ax를 다시 기획한다.
기준 문서는 docs/seo-content-governance.md와
docs/ax-redesign-handoff.md다. 현행 비교본은 /ax-backup이며 수정하지 않는다.
콘텐츠 원본은 [PDF 또는 Markdown 경로]다.
이번 단계에서는 코드·커밋·배포를 하지 말고, 검색 의도, H1-H3 구조,
섹션별 카피, 이미지 역할과 ALT 초안, 다국어 번역 기준을
docs/ax-content-plan-v2.md로 작성해 미리보기한다.
```

After the content plan is approved, authorize implementation explicitly:

```text
승인한 docs/ax-content-plan-v2.md 기준으로 /ax의 새 컴포넌트와 버전 자산을
구현한다. /ax-backup, AxLegacy.astro, components/pages/ax/는 수정하지 않는다.
로컬 미리보기에서 데스크톱·모바일·낮은 높이·다국어를 먼저 검증하고,
모든 품질/SEO/성능 검사를 통과한 뒤 커밋·PR·병합·실서비스 검증까지 한다.
모바일 PSI는 동일 URL 3회 중앙값 90 이상을 기준으로 한다.
```

## Compact continuation note

When the conversation is close to its context limit, keep the same Codex task
and request a compact handoff with this exact minimum state:

```text
현재 작업을 압축해서 이어가라. 대화 기억보다 다음 저장 파일을 우선한다:
1. docs/seo-content-governance.md
2. docs/ax-redesign-handoff.md
3. 승인된 docs/ax-content-plan-v2.md
4. 비교 기준 /ax-backup
완료된 PR/커밋, 현재 브랜치, 아직 남은 검증과 다음 한 단계만 요약하라.
```

Opening a new task is optional, not required. If a new task is used, paste the
same instruction and point it to these repository files; do not paste the full
historical conversation.
