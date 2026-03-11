/**
 * Send a review request email via Resend API.
 * No npm package needed — just fetch.
 */
export async function sendReviewEmail({ to, customerName, watches, reviewUrl, env }) {
    const apiKey = env.RESEND_API_KEY;
    const from = env.RESEND_FROM_EMAIL || 'Santi\'s Watches <onboarding@resend.dev>';

    if (!apiKey) throw new Error('RESEND_API_KEY not configured');

    const watchList = watches.map(w => `<li style="padding:4px 0;color:#1A1A1A;">${w.brand} ${w.name}</li>`).join('');

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#F7F7F7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F7F7;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;border:1px solid #E8E8E8;overflow:hidden;">

        <!-- Header -->
        <tr><td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid #E8E8E8;">
          <h1 style="margin:0;font-size:20px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#1A1A1A;">
            SANTI'S
          </h1>
          <p style="margin:2px 0 0;font-size:10px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:#8C8279;">
            WATCHES
          </p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 8px;font-size:22px;font-weight:300;color:#1A1A1A;">
            Thank you for your purchase, ${customerName || 'valued customer'}!
          </h2>
          <p style="margin:0 0 24px;font-size:14px;color:#8C8279;line-height:1.6;">
            We hope you're enjoying your new timepiece. Your feedback means the world to us — would you take a moment to share your experience?
          </p>

          ${watches.length > 0 ? `
          <div style="background-color:#F7F7F7;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
            <p style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8C8279;">
              YOUR ORDER
            </p>
            <ul style="margin:0;padding:0 0 0 18px;font-size:14px;line-height:1.8;">
              ${watchList}
            </ul>
          </div>
          ` : ''}

          <!-- CTA Button -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:8px 0 0;">
              <a href="${reviewUrl}" style="display:inline-block;background-color:#15603D;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;padding:14px 36px;border-radius:8px;">
                SHARE YOUR EXPERIENCE
              </a>
            </td></tr>
          </table>

          <p style="margin:28px 0 0;font-size:12px;color:#8C8279;text-align:center;line-height:1.5;">
            This link is unique to you and can only be used once.<br>
            If you have any questions, simply reply to this email.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 40px;text-align:center;border-top:1px solid #E8E8E8;background-color:#F7F7F7;">
          <p style="margin:0;font-size:11px;color:#8C8279;">
            &copy; ${new Date().getFullYear()} Santi's Watches. All rights reserved.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from,
            to: [to],
            subject: `How's your new watch? Share your experience with Santi's Watches`,
            html,
        }),
    });

    const data = await res.json();
    if (!res.ok) {
        console.error('[email] Resend error:', JSON.stringify(data));
        throw new Error(data.message || 'Failed to send email');
    }

    return data;
}
