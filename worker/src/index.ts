/* ============================================================
   NeuroPod Waitlist — Cloudflare Worker
   POST /subscribe  { email, source, honeypot }
   ============================================================ */

export interface Env {
  WAITLIST_DB: D1Database;
  ALLOWED_ORIGIN: string;
}

function corsHeaders(origin: string, allowedOrigin: string): Record<string, string> {
  const allowed = origin === allowedOrigin || allowedOrigin === '*' ? origin : allowedOrigin;
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') ?? '';
    const cors = corsHeaders(origin, env.ALLOWED_ORIGIN);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: cors });
    }

    let body: { email?: string; source?: string; honeypot?: string };
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const { email, source = 'website', honeypot = '' } = body;

    if (honeypot) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const ip      = request.headers.get('CF-Connecting-IP') ?? null;
    const ua      = request.headers.get('User-Agent') ?? null;
    const country = (request as any).cf?.country ?? null;

    try {
      await env.WAITLIST_DB.prepare(
        `INSERT INTO subscribers (email, source, ip_address, user_agent, country)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(email.toLowerCase().trim(), source, ip, ua, country).run();

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });

    } catch (err: any) {
      if (err?.message?.includes('UNIQUE')) {
        return new Response(JSON.stringify({ error: 'Already subscribed' }), {
          status: 409,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'Internal error' }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
  },
};
