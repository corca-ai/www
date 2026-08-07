export interface NewsletterEmailContent {
  actionLabel: string;
  actionUrl: string;
  body: string;
  unsubscribeUrl?: string;
  logoUrl: string;
  title: string;
}

export function buildNewsletterEmail(content: NewsletterEmailContent): string {
  const fallbackUrl = escapeHtml(content.actionUrl);
  const footer = content.unsubscribeUrl
    ? `<a href="${escapeHtml(content.unsubscribeUrl)}" style="color:#64748b;text-decoration:underline;">뉴스레터 수신 거부</a>`
    : 'Corca Blog · 기술과 사람을 잇는 새로운 관점';

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>Corca Blog</title>
  <style>
    @media only screen and (max-width: 640px) {
      .email-shell { width: 100% !important; }
      .email-padding { padding-left: 28px !important; padding-right: 28px !important; }
      .email-title { font-size: 30px !important; line-height: 1.35 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f4f7fb;color:#172554;font-family:Arial,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f7fb;">
    <tr>
      <td style="padding:32px 16px;">
        <table role="presentation" class="email-shell" width="640" cellspacing="0" cellpadding="0" border="0" align="center" style="width:640px;max-width:100%;background:#ffffff;border:1px solid #dbe5f0;border-radius:28px;overflow:hidden;">
          <tr>
            <td class="email-padding" style="padding:34px 48px 30px;border-bottom:1px solid #e5edf5;">
              <img src="${escapeHtml(content.logoUrl)}" width="160" alt="Corca" style="display:block;width:160px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;">
            </td>
          </tr>
          <tr>
            <td class="email-padding" style="padding:58px 48px 48px;">
              <p style="margin:0 0 20px;color:#0878bf;font-size:14px;font-weight:700;letter-spacing:1.4px;line-height:20px;">CORCA BLOG</p>
              <h1 class="email-title" style="margin:0;color:#172554;font-size:36px;font-weight:700;letter-spacing:-1.4px;line-height:1.32;word-break:keep-all;">${escapeHtml(content.title)}</h1>
              <p style="margin:28px 0 0;color:#475569;font-size:18px;line-height:1.75;word-break:keep-all;">${escapeHtml(content.body)}</p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:34px;">
                <tr>
                  <td bgcolor="#0878bf" style="border-radius:999px;">
                    <a href="${fallbackUrl}" style="display:inline-block;padding:15px 28px;color:#ffffff;font-size:17px;font-weight:700;line-height:22px;text-decoration:none;">${escapeHtml(content.actionLabel)}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:34px 0 0;color:#64748b;font-size:13px;line-height:1.65;word-break:break-all;">버튼이 열리지 않으면 아래 주소를 이용해 주세요.<br><a href="${fallbackUrl}" style="color:#0878bf;text-decoration:underline;">${fallbackUrl}</a></p>
            </td>
          </tr>
          <tr>
            <td class="email-padding" style="padding:24px 48px;border-top:1px solid #e5edf5;color:#64748b;font-size:13px;line-height:1.65;">${footer}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    };
    return entities[character] || character;
  });
}
