<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />
  <xsl:template match="/">
    <html lang="ko">
      <head>
        <title>Sitemap · Corca</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <style>
          @font-face {
            font-family: "Pretendard Sitemap";
            font-style: normal;
            font-display: swap;
            font-weight: 45 920;
            src: url("/fonts/ax-mobile/v1/pretendard-ko.woff2") format("woff2");
          }
          :root {
            color-scheme: light;
            --text: #292a2e;
            --text-subtle: #505258;
            --text-subtlest: #6b6e76;
            --brand: #1868db;
            --brand-hovered: #1558bc;
            --brand-pressed: #123263;
            --brand-subtlest: #e9f2fe;
            --brand-subtler: #cfe1fd;
            --brand-border: #8fb8f6;
            --focus: #4688ec;
            --surface: #ffffff;
            --surface-hovered: #f0f1f2;
            --border: #0b120e24;
          }
          * { box-sizing: border-box; }
          body {
            font-family: "Pretendard Sitemap", "Pretendard Variable", Pretendard,
              -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif;
            margin: 0;
            min-width: 20rem;
            background: var(--brand-subtlest);
            color: var(--text);
          }
          .topbar {
            background: var(--brand);
            color: #fff;
          }
          .topbar-inner {
            align-items: center;
            display: flex;
            gap: 0.75rem;
            margin: 0 auto;
            max-width: 75rem;
            min-height: 4rem;
            padding: 0.75rem 1.5rem;
          }
          .brand {
            font-size: 1.25rem;
            font-weight: 750;
            letter-spacing: -0.02em;
          }
          .product {
            border-inline-start: 1px solid rgba(255, 255, 255, 0.48);
            font-size: 0.875rem;
            font-weight: 500;
            padding-inline-start: 0.75rem;
          }
          .wrap {
            margin: 0 auto;
            max-width: 75rem;
            padding: 2rem 1.5rem 4rem;
          }
          h1 {
            font-size: clamp(1.5rem, 2vw, 2rem);
            font-weight: 700;
            letter-spacing: -0.025em;
            line-height: 1.125;
            margin: 0;
          }
          .sub {
            color: var(--text-subtle);
            font-size: 0.875rem;
            line-height: 1.5;
            margin: 0.5rem 0 1.5rem;
          }
          .count {
            display: inline-block;
            background: var(--brand);
            color: #fff;
            padding: 0.25rem 0.625rem;
            border-radius: 624.9375rem;
            font-size: 0.75rem;
            font-weight: 650;
            line-height: 1rem;
            margin-inline-start: 0.5rem;
            vertical-align: middle;
          }
          .crumbs {
            font-size: 0.875rem;
            margin: 0 0 1rem;
          }
          .crumbs a { color: var(--brand-hovered); font-weight: 600; text-decoration: none; }
          .crumbs a:hover { text-decoration: underline; }
          .page-heading {
            align-items: end;
            display: flex;
            gap: 1.5rem;
            justify-content: space-between;
          }
          .latest {
            background: var(--surface);
            border: 1px solid var(--brand-border);
            border-radius: 0.5rem;
            flex: 0 0 auto;
            padding: 0.75rem 1rem;
          }
          .latest-label {
            color: var(--text-subtlest);
            display: block;
            font-size: 0.75rem;
            line-height: 1rem;
          }
          .latest-value {
            color: var(--brand-hovered);
            display: block;
            font-size: 0.875rem;
            font-weight: 650;
            line-height: 1.25rem;
            margin-block-start: 0.125rem;
          }
          .card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 0.75rem;
            overflow-x: auto;
            box-shadow: 0 1px 1px #1e1f2140, 0 0 1px #1e1f214f;
          }
          table { border-collapse: collapse; font-size: 0.875rem; min-width: 42rem; width: 100%; }
          th, td {
            text-align: left;
            padding: 0.75rem 1rem;
            border-block-end: 1px solid var(--border);
            vertical-align: top;
          }
          th {
            background: var(--brand-subtlest);
            color: var(--text-subtle);
            font-weight: 600;
            font-size: 0.75rem;
            position: sticky;
            top: 0;
          }
          tbody tr:last-child td { border-block-end: 0; }
          tr:hover td { background: var(--brand-subtlest); }
          a { color: var(--brand-hovered); text-decoration: none; word-break: break-all; }
          a:hover { text-decoration: underline; }
          a:focus-visible {
            border-radius: 0.25rem;
            outline: 0.125rem solid var(--focus);
            outline-offset: 0.125rem;
          }
          .index-grid {
            display: grid;
            gap: 1rem;
            grid-template-columns: repeat(auto-fit, minmax(16.25rem, 1fr));
          }
          .tile {
            background: var(--surface);
            border: 1px solid var(--brand-border);
            border-radius: 0.75rem;
            padding: 1.25rem;
            text-decoration: none;
            color: inherit;
            display: block;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
          }
          .tile:hover {
            transform: translateY(-2px);
            background: var(--surface);
            border-color: var(--brand);
            box-shadow: 0 8px 12px #1e1f2126, 0 0 1px #1e1f214f;
            text-decoration: none;
          }
          .tile-kicker {
            color: var(--brand);
            display: block;
            font-size: 0.75rem;
            font-weight: 650;
            line-height: 1rem;
            margin-block-end: 0.75rem;
          }
          .tile-name {
            font-size: 1rem;
            font-weight: 700;
            letter-spacing: -0.02em;
            line-height: 1.25rem;
            color: var(--text);
            margin: 0 0 0.5rem;
          }
          .tile-url {
            font-size: 0.75rem;
            color: var(--brand-hovered);
            line-height: 1rem;
            word-break: break-all;
            margin: 0 0 1.25rem;
          }
          .tile-meta {
            border-block-start: 1px solid var(--border);
            color: var(--text-subtlest);
            font-size: 0.75rem;
            line-height: 1rem;
            margin: 0;
            padding-block-start: 0.75rem;
          }
          .tile-meta strong {
            color: var(--brand-hovered);
            font-weight: 650;
          }
          @media (max-width: 40rem) {
            .topbar-inner { min-height: 3.5rem; padding-inline: 1rem; }
            .wrap { padding: 1.5rem 1rem 3rem; }
            .page-heading { align-items: stretch; flex-direction: column; gap: 1rem; }
            .latest { align-self: stretch; }
            .index-grid { grid-template-columns: 1fr; }
          }
          @media (prefers-reduced-motion: reduce) {
            .tile { transition: none; }
          }
        </style>
      </head>
      <body>
        <header class="topbar">
          <div class="topbar-inner">
            <span class="brand">Corca</span>
            <span class="product">Sitemap</span>
          </div>
        </header>
        <main class="wrap">
          <xsl:choose>
            <xsl:when test="s:sitemapindex">
              <h1>
                XML Sitemap Index
                <span class="count">
                  <xsl:value-of select="count(s:sitemapindex/s:sitemap)" /> sitemaps
                </span>
              </h1>
              <p class="sub">
                이 사이트의 sitemap은 아래의 4개 그룹으로 나뉘어 있습니다.
                각 항목을 클릭하면 해당 그룹의 URL 목록을 볼 수 있습니다.
              </p>
              <div class="index-grid">
                <xsl:for-each select="s:sitemapindex/s:sitemap">
                  <a class="tile" href="{s:loc}">
                    <span class="tile-kicker">
                      <xsl:value-of select="format-number(position(), '00')" />
                    </span>
                    <p class="tile-name">
                      <xsl:choose>
                        <xsl:when test="contains(s:loc, 'sitemap-pages.xml')">페이지모음</xsl:when>
                        <xsl:when test="contains(s:loc, 'sitemap-categories.xml')">카테고리페이지모음</xsl:when>
                        <xsl:when test="contains(s:loc, 'sitemap-tags.xml')">태그페이지모음</xsl:when>
                        <xsl:when test="contains(s:loc, 'sitemap-posts.xml')">블로그포스트모음</xsl:when>
                        <xsl:otherwise>
                          <xsl:value-of select="s:loc" />
                        </xsl:otherwise>
                      </xsl:choose>
                    </p>
                    <p class="tile-url">
                      <xsl:value-of select="s:loc" />
                    </p>
                    <p class="tile-meta">
                      <xsl:choose>
                        <xsl:when test="contains(s:loc, 'sitemap-pages.xml')">
                          공개 페이지 · 4개 언어<br />
                        </xsl:when>
                        <xsl:otherwise />
                      </xsl:choose>
                      Last Modified: <strong><xsl:value-of select="substring(s:lastmod, 1, 10)" /></strong>
                    </p>
                  </a>
                </xsl:for-each>
              </div>
            </xsl:when>

            <xsl:when test="s:urlset">
              <p class="crumbs">
                <a href="/sitemap.xml">Sitemap index로 돌아가기</a>
              </p>
              <div class="page-heading">
                <h1>
                  XML Sitemap
                  <span class="count">
                    <xsl:value-of select="count(s:urlset/s:url)" /> URLs
                  </span>
                </h1>
                <div class="latest">
                  <span class="latest-label">Last Modified</span>
                  <strong class="latest-value">
                    <xsl:for-each select="s:urlset/s:url">
                      <xsl:sort select="s:lastmod" data-type="text" order="descending" />
                      <xsl:if test="position() = 1">
                        <xsl:value-of select="substring(s:lastmod, 1, 10)" />
                      </xsl:if>
                    </xsl:for-each>
                  </strong>
                </div>
              </div>
              <p class="sub">
                이 그룹에 포함된 URL 목록입니다.
              </p>
              <div class="card">
                <table>
                  <thead>
                    <tr>
                      <th style="width:75%">URL</th>
                      <th style="width:25%">URL Last Modified</th>
                    </tr>
                  </thead>
                  <tbody>
                    <xsl:for-each select="s:urlset/s:url">
                      <xsl:sort select="s:loc" />
                      <tr>
                        <td>
                          <a href="{s:loc}">
                            <xsl:value-of select="s:loc" />
                          </a>
                        </td>
                        <td>
                          <xsl:value-of select="substring(s:lastmod, 1, 10)" />
                        </td>
                      </tr>
                    </xsl:for-each>
                  </tbody>
                </table>
              </div>
            </xsl:when>
          </xsl:choose>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
