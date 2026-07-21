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
          :root { color-scheme: light; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
              "Pretendard Variable", Pretendard, "Apple SD Gothic Neo",
              Roboto, sans-serif;
            margin: 0;
            padding: 32px 20px 64px;
            background: #f7f5f1;
            color: #151515;
          }
          .wrap { max-width: 1200px; margin: 0 auto; }
          h1 {
            font-size: 24px;
            letter-spacing: -0.36px;
            margin: 0 0 4px;
          }
          .sub {
            color: #7e7b71;
            font-size: 14px;
            margin-bottom: 24px;
          }
          .count {
            display: inline-block;
            background: #b99550;
            color: #fff;
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 12px;
            margin-left: 8px;
            vertical-align: middle;
          }
          .crumbs {
            font-size: 13px;
            color: #7e7b71;
            margin-bottom: 16px;
          }
          .crumbs a { color: #967942; text-decoration: none; }
          .crumbs a:hover { text-decoration: underline; }
          .card {
            background: #fff;
            border: 1px solid #e7ded1;
            border-radius: 12px;
            overflow: hidden;
          }
          table { width: 100%; border-collapse: collapse; font-size: 14px; }
          th, td {
            text-align: left;
            padding: 10px 14px;
            border-bottom: 1px solid #f2ecdf;
            vertical-align: top;
          }
          th {
            background: #f9f5ed;
            color: #967942;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            position: sticky;
            top: 0;
          }
          tr:hover td { background: #fbf8f2; }
          a { color: #967942; text-decoration: none; word-break: break-all; }
          a:hover { text-decoration: underline; }
          .index-grid {
            display: grid;
            gap: 16px;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          }
          .tile {
            background: #fff;
            border: 1px solid #e7ded1;
            border-radius: 12px;
            padding: 18px 20px;
            text-decoration: none;
            color: inherit;
            display: block;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
          }
          .tile:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.06);
            text-decoration: none;
          }
          .tile-name {
            font-size: 18px;
            font-weight: 700;
            letter-spacing: -0.36px;
            color: #151515;
            margin: 0 0 6px;
          }
          .tile-url {
            font-size: 12px;
            color: #967942;
            word-break: break-all;
            margin: 0 0 10px;
          }
          .tile-meta {
            font-size: 12px;
            color: #7e7b71;
          }
        </style>
      </head>
      <body>
        <div class="wrap">
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
                          공개 페이지 · 4개 언어 · Last Modified:
                          <xsl:value-of select="substring(s:lastmod, 1, 10)" />
                        </xsl:when>
                        <xsl:otherwise>
                          Last Modified: <xsl:value-of select="substring(s:lastmod, 1, 10)" />
                        </xsl:otherwise>
                      </xsl:choose>
                    </p>
                  </a>
                </xsl:for-each>
              </div>
            </xsl:when>

            <xsl:when test="s:urlset">
              <p class="crumbs">
                <a href="/sitemap.xml">← Sitemap Index</a>
              </p>
              <h1>
                XML Sitemap
                <span class="count">
                  <xsl:value-of select="count(s:urlset/s:url)" /> URLs
                </span>
              </h1>
              <p class="sub">
                이 그룹에 포함된 URL 목록입니다.
              </p>
              <div class="card">
                <table>
                  <thead>
                    <tr>
                      <th style="width:75%">URL</th>
                      <th style="width:25%">Last Modified</th>
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
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
