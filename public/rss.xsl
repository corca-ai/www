<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />
  <xsl:template match="/">
    <html lang="ko">
      <head>
        <title><xsl:value-of select="rss/channel/title" /></title>
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
          .wrap { max-width: 840px; margin: 0 auto; }
          h1 { font-size: 22px; margin: 0 0 4px; letter-spacing: -0.33px; }
          .sub { color: #7e7b71; font-size: 14px; margin-bottom: 20px; }
          .meta { color: #7e7b71; font-size: 12px; margin-bottom: 24px; }
          .card {
            background: #fff;
            border: 1px solid #e7ded1;
            border-radius: 12px;
            padding: 4px 0;
          }
          .item {
            padding: 16px 20px;
            border-bottom: 1px solid #f2ecdf;
          }
          .item:last-child { border-bottom: none; }
          .item a.title {
            display: block;
            font-size: 16px;
            font-weight: 700;
            color: #151515;
            text-decoration: none;
            margin-bottom: 6px;
          }
          .item a.title:hover { color: #967942; }
          .chips { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
          .chip {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 999px;
            background: #f9f5ed;
            color: #967942;
            font-size: 11px;
          }
          .date { color: #7e7b71; font-size: 12px; }
          .desc { color: rgba(0,0,0,0.7); font-size: 14px; line-height: 1.6; margin-top: 6px; }
          .subscribe {
            display: inline-flex;
            gap: 6px;
            align-items: center;
            background: #b99550;
            color: #fff;
            padding: 6px 12px;
            border-radius: 999px;
            font-size: 12px;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="wrap">
          <h1><xsl:value-of select="rss/channel/title" /></h1>
          <p class="sub"><xsl:value-of select="rss/channel/description" /></p>
          <p class="meta">
            <a class="subscribe" href="{rss/channel/atom:link/@href}">
              RSS 구독 링크 복사
            </a>
          </p>
          <div class="card">
            <xsl:for-each select="rss/channel/item">
              <div class="item">
                <div class="chips">
                  <xsl:for-each select="category">
                    <span class="chip"><xsl:value-of select="." /></span>
                  </xsl:for-each>
                </div>
                <a class="title" href="{link}">
                  <xsl:value-of select="title" />
                </a>
                <div class="date">
                  <xsl:value-of select="pubDate" />
                  <xsl:if test="dc:creator">
                    · <xsl:value-of select="dc:creator" />
                  </xsl:if>
                </div>
                <div class="desc">
                  <xsl:value-of select="description" />
                </div>
              </div>
            </xsl:for-each>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
