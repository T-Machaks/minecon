// Microsoft Graph API mailer — sends email as NoReply@tyflex.co.zw
// Uses client-credentials OAuth flow (no SMTP, no basic auth required)
//
// Required env vars:
//   MAILER_TENANT_ID     — Azure AD tenant ID
//   MAILER_CLIENT_ID     — App registration Application (client) ID
//   MAILER_CLIENT_SECRET — App registration client secret value
//   MAILER_USER          — Mailbox to send from (NoReply@tyflex.co.zw)

const TENANT_ID     = process.env.MAILER_TENANT_ID;
const CLIENT_ID     = process.env.MAILER_CLIENT_ID;
const CLIENT_SECRET = process.env.MAILER_CLIENT_SECRET;
const SENDER        = process.env.MAILER_USER;

async function getToken() {
  const res = await fetch(
    `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'client_credentials',
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope:         'https://graph.microsoft.com/.default',
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(`Token error: ${data.error_description || data.error}`);
  return data.access_token;
}

export async function sendOtpEmail(toEmail, otp, override = null) {
  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET || !SENDER) {
    throw new Error('Mailer not configured — set MAILER_TENANT_ID, MAILER_CLIENT_ID, MAILER_CLIENT_SECRET, MAILER_USER in server/.env');
  }

  const token = await getToken();

  const subject = override?.subject ?? 'Your MineCon verification code';
  const html    = override?.html ?? `
              <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
                <h2 style="margin:0 0 8px;color:#111">MineCon 2026</h2>
                <p style="margin:0 0 24px;color:#555">Use the code below to complete your login.</p>
                <div style="font-size:36px;font-weight:700;letter-spacing:0.15em;text-align:center;
                            padding:24px;background:#f4f4f5;border-radius:8px;color:#111">
                  ${otp}
                </div>
                <p style="margin:24px 0 0;font-size:13px;color:#888">
                  Expires in 10 minutes. If you didn't request this, you can safely ignore this email.
                </p>
              </div>
            `;

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(SENDER)}/sendMail`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          subject,
          body: { contentType: 'HTML', content: html },
          toRecipients: [{ emailAddress: { address: toEmail } }],
        },
        saveToSentItems: false,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Graph API error ${res.status}: ${err?.error?.message || res.statusText}`);
  }
}

const APP_URL = 'https://minecon.tyflex.co.zw';

export async function sendWelcomeEmail(toEmail, fullName) {
  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET || !SENDER) return;

  const firstName = (fullName || '').split(' ')[0] || 'there';

  return sendOtpEmail(toEmail, null, {
    subject: 'Welcome to MineCon 2026',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
        <div style="background:#1a2332;padding:28px 24px;text-align:center;">
          <p style="margin:0;color:#f59e0b;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;">Southern Africa's Mining Exhibition</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;">MineCon 2026</h1>
        </div>
        <div style="padding:32px 24px;">
          <h2 style="margin:0 0 12px;color:#111;font-size:20px;font-weight:700;">Welcome aboard, ${firstName}!</h2>
          <p style="margin:0 0 20px;color:#555;line-height:1.6;font-size:15px;">
            Your MineCon 2026 account is ready. Browse exhibitors, book meetings, manage your schedule,
            and get live event updates — all in one place.
          </p>
          <div style="text-align:center;margin:28px 0;">
            <a href="${APP_URL}"
               style="display:inline-block;background:#f59e0b;color:#ffffff;font-weight:700;font-size:15px;
                      text-decoration:none;padding:14px 32px;border-radius:8px;letter-spacing:0.03em;">
              Explore MineCon 2026
            </a>
          </div>
          <div style="background:#f9f9f9;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#333;text-transform:uppercase;letter-spacing:0.05em;">Event Details</p>
            <p style="margin:0;font-size:14px;color:#555;line-height:1.8;">
              📅 October 2026 &middot; 3 Days<br>
              📍 Artfarm Grounds, Pomona, Harare<br>
              🌐 minecon.global
            </p>
          </div>
          <p style="margin:0;font-size:13px;color:#999;line-height:1.6;">
            If you didn't create this account, you can safely ignore this email.
          </p>
        </div>
        <div style="background:#f4f4f5;border-top:1px solid #e5e7eb;padding:16px 24px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#aaa;">
            &copy; 2026 MineCon &middot;
            <a href="https://minecon.global" style="color:#f59e0b;text-decoration:none;">minecon.global</a>
          </p>
        </div>
      </div>
    `,
  });
}
