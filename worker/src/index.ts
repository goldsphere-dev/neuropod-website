/* ============================================================
   MyNeuroPod Waitlist — Cloudflare Worker
   POST /subscribe  { email, source, honeypot }
   - Stores in D1 (full data ownership)
   - Adds to SendGrid Marketing List
   - Sends welcome email via SendGrid
   ============================================================ */

export interface Env {
  WAITLIST_DB: D1Database;
  ALLOWED_ORIGIN: string;
  SENDGRID_API_KEY: string;
  SENDGRID_LIST_ID: string;
  SENDGRID_FROM_EMAIL: string;
  SENDGRID_FROM_NAME: string;
}

function corsHeaders(origin: string, allowedOrigin: string): Record<string, string> {
  const allowed = origin === allowedOrigin || allowedOrigin === '*' ? origin : allowedOrigin;
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(body: object, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

async function addToSendGridList(email: string, env: Env): Promise<void> {
  await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      list_ids: [env.SENDGRID_LIST_ID],
      contacts: [{ email }],
    }),
  });
}

async function sendWelcomeEmail(email: string, env: Env): Promise<void> {
  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email }] }],
      from: { email: env.SENDGRID_FROM_EMAIL, name: env.SENDGRID_FROM_NAME },
      reply_to: { email: 'hello@myneuropod.com', name: 'MyNeuroPod' },
      subject: "You're on the MyNeuroPod waitlist",
      content: [{ type: 'text/html', value: welcomeEmailHtml(email) }],
    }),
  });
}

function welcomeEmailHtml(email: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're on the MyNeuroPod waitlist</title>
</head>
<body style="margin:0;padding:0;background:#0d1a30;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1a30;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:24px;font-weight:800;color:#f0f6ff;letter-spacing:-0.04em;">
                MyNeuro<span style="color:#00C4B5;">Pod</span>
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#0f1e36;border:1px solid rgba(0,212,255,0.15);border-radius:16px;padding:48px 40px;">

              <!-- Eyebrow -->
              <p style="margin:0 0 20px;text-align:center;">
                <span style="display:inline-block;background:rgba(0,212,255,0.10);border:1px solid rgba(0,212,255,0.30);border-radius:100px;padding:4px 14px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#00d4ff;">
                  WAITLIST CONFIRMED
                </span>
              </p>

              <!-- Heading -->
              <h1 style="margin:0 0 16px;text-align:center;font-size:28px;font-weight:800;color:#f0f6ff;line-height:1.2;letter-spacing:-0.02em;">
                You're in. We'll be in touch.
              </h1>

              <!-- Body -->
              <p style="margin:0 0 24px;text-align:center;font-size:16px;color:#c8d8f0;line-height:1.7;">
                Thanks for joining the MyNeuroPod waitlist. We're building the world's first AI that monitors your trading psychology in real time — and you're among the first to know when we launch.
              </p>

              <!-- Divider -->
              <div style="border-top:1px solid rgba(255,255,255,0.07);margin:32px 0;"></div>

              <!-- What to expect -->
              <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#f59e0b;letter-spacing:0.08em;text-transform:uppercase;">
                What happens next
              </p>
              <p style="margin:0 0 10px;font-size:15px;color:#c8d8f0;line-height:1.65;padding-left:16px;border-left:2px solid rgba(0,212,255,0.3);">
                We'll notify you the moment early access opens — before the public launch.
              </p>
              <p style="margin:0 0 10px;font-size:15px;color:#c8d8f0;line-height:1.65;padding-left:16px;border-left:2px solid rgba(245,158,11,0.4);">
                Early access members get priority onboarding and founding member pricing.
              </p>

              <!-- Divider -->
              <div style="border-top:1px solid rgba(255,255,255,0.07);margin:32px 0;"></div>

              <!-- Footer note -->
              <p style="margin:0;text-align:center;font-size:13px;color:#4a6a8a;line-height:1.6;">
                You signed up with <span style="color:#7a9cc0;">${email}</span>.<br>
                If this wasn't you, you can safely ignore this email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:32px;">
              <p style="margin:0;font-size:12px;color:#4a6a8a;line-height:1.6;">
                MyNeuroPod · <a href="https://www.myneuropod.com" style="color:#4a6a8a;text-decoration:none;">myneuropod.com</a><br>
                <a href="https://www.myneuropod.com/privacy-policy.html" style="color:#4a6a8a;text-decoration:none;">Privacy Policy</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') ?? '';
    const cors = corsHeaders(origin, env.ALLOWED_ORIGIN);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, cors);
    }

    let body: { email?: string; source?: string; honeypot?: string };
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400, cors);
    }

    const { email, source = 'website', honeypot = '' } = body;

    // Honeypot — silent success to fool bots
    if (honeypot) {
      return json({ ok: true }, 200, cors);
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: 'Invalid email' }, 400, cors);
    }

    const normalised = email.toLowerCase().trim();
    const ip         = request.headers.get('CF-Connecting-IP') ?? null;
    const ua         = request.headers.get('User-Agent') ?? null;
    const country    = (request as any).cf?.country ?? null;

    // Store in D1
    try {
      await env.WAITLIST_DB.prepare(
        `INSERT INTO subscribers (email, source, ip_address, user_agent, country)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(normalised, source, ip, ua, country).run();
    } catch (err: any) {
      if (err?.message?.includes('UNIQUE')) {
        return json({ error: 'Already subscribed' }, 409, cors);
      }
      return json({ error: 'Internal error' }, 500, cors);
    }

    // SendGrid — fire and forget (don't fail the signup if email fails)
    await Promise.allSettled([
      addToSendGridList(normalised, env),
      sendWelcomeEmail(normalised, env),
    ]);

    return json({ ok: true }, 200, cors);
  },
};
