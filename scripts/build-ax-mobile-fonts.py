#!/usr/bin/env python3
"""Build one language-specific Pretendard subset for each mobile AX route.

Prerequisites:
  python3 -m pip install fonttools brotli
  npm run build
"""

from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "public/fonts/ax-mobile/v1"
COMMON_TEXT = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,!?·:;+-–—/()[]{}%&@#'\"↗→←↓↑"
ROUTES = {
    "ko": ROOT / "dist/ax/index.html",
    "en": ROOT / "dist/en/ax/index.html",
    "ja": ROOT / "dist/ja/ax/index.html",
}
SOURCES = {
    "ko": ROOT / "public/fonts/PretendardVariable.woff2",
    "en": ROOT / "public/fonts/PretendardVariable.woff2",
    "ja": ROOT / "public/fonts/PretendardJPVariable.woff2",
}
TEXT_ATTRIBUTES = {"alt", "aria-label", "placeholder", "title", "value"}


class PageTextCollector(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.ignored_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in {"script", "style"}:
            self.ignored_depth += 1
            return
        if self.ignored_depth:
            return
        for name, value in attrs:
            if name in TEXT_ATTRIBUTES and value:
                self.parts.append(value)

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style"} and self.ignored_depth:
            self.ignored_depth -= 1

    def handle_data(self, data: str) -> None:
        if not self.ignored_depth:
            self.parts.append(data)

    @property
    def text(self) -> str:
        return COMMON_TEXT + "".join(self.parts)


def read_page_text(path: Path) -> str:
    if not path.exists():
        raise SystemExit(f"Missing {path.relative_to(ROOT)}. Run `npm run build` first.")
    collector = PageTextCollector()
    collector.feed(path.read_text(encoding="utf-8"))
    return collector.text


def build_subset(language: str, page_path: Path, source_path: Path) -> None:
    text = read_page_text(page_path)
    font = TTFont(source_path)
    cmap = set(font.getBestCmap())
    requested = {ord(character) for character in text if not character.isspace()}
    missing = requested - cmap

    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 16, 17]
    options.name_legacy = True
    options.name_languages = [0x409]
    options.recalc_average_width = True
    options.recalc_max_context = True

    subsetter = subset.Subsetter(options=options)
    subsetter.populate(text=text)
    subsetter.subset(font)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / f"pretendard-{language}.woff2"
    font.flavor = "woff2"
    font.save(output_path)

    missing_preview = "".join(chr(codepoint) for codepoint in sorted(missing)[:20])
    print(
        f"{language}: {output_path.stat().st_size:,} bytes, "
        f"{len(requested):,} requested glyphs, {len(missing):,} fallback glyphs"
        + (f" ({missing_preview})" if missing_preview else "")
    )


def main() -> None:
    for language, page_path in ROUTES.items():
        build_subset(language, page_path, SOURCES[language])


if __name__ == "__main__":
    main()
