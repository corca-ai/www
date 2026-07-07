<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <html lang="ko">
      <head>
        <meta charset="utf-8" />
        <title><xsl:value-of select="/rss/channel/title" /></title>
        <style>
          body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 40px; color: #111827; }
          article { border-bottom: 1px solid #e5e7eb; padding: 18px 0; }
          a { color: #0f5bd8; }
          small { color: #6b7280; }
        </style>
      </head>
      <body>
        <h1><xsl:value-of select="/rss/channel/title" /></h1>
        <p><xsl:value-of select="/rss/channel/description" /></p>
        <xsl:for-each select="/rss/channel/item">
          <article>
            <h2><a href="{link}"><xsl:value-of select="title" /></a></h2>
            <small><xsl:value-of select="pubDate" /></small>
            <p><xsl:value-of select="description" /></p>
          </article>
        </xsl:for-each>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
