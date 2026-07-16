# Corca AX 정적 브로셔

편집 기능과 서버 API를 제거한 배포 전용 브로셔입니다. 본문은 이미지가 아니라 실제 HTML 텍스트이며, 각 페이지는 CSS에서 A4 210mm × 297mm로 고정됩니다.

## 다른 웹사이트에 연결

1. 이 폴더 전체를 대상 프로젝트의 정적 파일 디렉터리에 복사합니다.
   - Next.js: `public/brochures/corca-ax/`
   - Vite: `public/brochures/corca-ax/`
   - 일반 웹서버: 배포 루트의 `brochures/corca-ax/`
2. `/brochures/corca-ax/`로 링크하거나 해당 경로를 새 탭으로 엽니다.
3. 서버는 디렉터리 요청을 이 폴더의 `index.html`로 제공해야 합니다.

웹사이트에서 여는 버튼에는 다음 속성을 사용합니다. `nofollow`는 브로셔를 여는 링크에 적용하고, 브로셔 내부의 인쇄 기능은 링크가 아닌 명령이므로 `button`으로 구현되어 있습니다.

```html
<a
  href="/brochures/corca-ax/"
  target="_blank"
  rel="nofollow noopener noreferrer"
>
  Corca AX 브로셔 보기 및 인쇄
</a>
```

상위 페이지 안에서 보여야 한다면 다음처럼 사용합니다.

```html
<iframe
  src="/brochures/corca-ax/"
  title="코르카 AX 가속화 컨설팅 브로셔"
  style="width:100%;height:100vh;border:0"
></iframe>
```

iframe 밖의 버튼에서 인쇄하려면 동일 출처일 때 `iframe.contentWindow.print()`를 호출합니다. 브로셔 자체에는 편집 UI, 저장 기능, PDF 생성 API, 서버 의존성이 없습니다. 오른쪽 상단의 `A4 인쇄` 버튼은 브라우저 인쇄 창을 열며 인쇄물에는 표시되지 않습니다.

## 인쇄

- 브라우저 인쇄에서 용지를 A4로 선택합니다.
- 배율은 100%, 여백은 없음으로 설정합니다.
- 배경 그래픽을 켭니다. CSS에도 `print-color-adjust: exact`가 적용되어 있습니다.
- 각 `.page`는 `210mm × 297mm`로 고정되며 한 페이지씩 강제 분리됩니다.

## GitHub와 GitHub Pages에 올리기

### 기존 웹사이트 저장소의 서브 디렉터리로 사용

1. 이 폴더 전체를 웹사이트 저장소의 정적 파일 위치로 복사합니다.
2. 폴더 이름은 `brochures/corca-ax`로 유지합니다.
3. `index.html`, `brochure.css`, `assets/`를 함께 커밋합니다. 일부 파일만 복사하면 이미지와 폰트가 깨집니다.
4. 웹사이트를 평소 방식대로 배포합니다.
5. 배포 후 `https://도메인/brochures/corca-ax/`와 인쇄 미리보기를 확인합니다.

### 정적 GitHub Pages 저장소에서 직접 사용

1. 저장소 루트 아래에 `brochures/corca-ax/` 폴더 전체를 추가합니다.
2. GitHub 저장소의 **Settings → Pages**에서 배포 브랜치와 폴더를 설정합니다.
3. 배포 후 주소는 일반적으로 `https://조직.github.io/저장소/brochures/corca-ax/`입니다.
4. 프로젝트 Pages는 저장소 이름이 URL에 포함되므로 상위 페이지의 링크도 실제 배포 경로에 맞춥니다.

## 다른 AI에게 전달할 지시문

아래 내용을 그대로 전달할 수 있습니다.

```text
첨부한 corca-ax-brochure-static 폴더는 완성된 정적 브로셔 배포본이다.

1. 폴더 내부 파일을 수정하거나 재구성하지 말고 폴더 전체를 웹사이트의 정적 파일 디렉터리 아래 brochures/corca-ax/에 복사한다.
2. index.html, brochure.css, brochure-manifest.json, assets/의 상대 경로를 유지한다.
3. 별도 앱, 편집기, API 또는 빌드 의존성을 추가하지 않는다.
4. /brochures/corca-ax/ 디렉터리 요청이 index.html을 반환하도록 배포한다.
5. 상위 웹페이지에는 새 창으로 여는 링크를 추가한다:
   target="_blank" rel="nofollow noopener noreferrer"
6. 브로셔의 오른쪽 상단 A4 인쇄 버튼과 브라우저 인쇄 기능을 유지한다.
7. 배포 후 22개 페이지, 로컬 이미지와 폰트, A4 한 장당 브로셔 한 페이지 분리를 확인한다.
8. GitHub에 커밋·푸시한 뒤 실제 공개 URL에서 브로셔 열기와 인쇄 미리보기를 검증한다.
```

## 수정 규칙

이 폴더는 배포 산출물로 취급합니다. 내용을 직접 편집하지 말고 원본 편집기에서 수정한 뒤 아래 생성기를 다시 실행합니다.

`node /Users/tommy/Documents/XT/scripts/build-corca-ax-static-brochure.mjs`
