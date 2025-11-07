import type { Request, Response } from 'express'
import { getDbState } from '../config/db.js'
import { isTwilioReady } from '../config/twilio.js'
import { getTwilioMessageCount } from '../services/twilioService.js'
import { logger } from '../utils/logger.js'
import { getSocketStats } from '../websocket.js'

function getCurrentTimeFormatted() {
  const date = new Date()
  return (
    date.getUTCFullYear() +
    '-' +
    String(date.getUTCMonth() + 1).padStart(2, '0') +
    '-' +
    String(date.getUTCDate()).padStart(2, '0') +
    ' ' +
    String(date.getUTCHours()).padStart(2, '0') +
    ':' +
    String(date.getUTCMinutes()).padStart(2, '0') +
    ':' +
    String(date.getUTCSeconds()).padStart(2, '0') +
    ' UTC'
  )
}

export async function health(req: Request, res: Response) {
  const uptime_secs = process.uptime()
  const nodeEnv = process.env.NODE_ENV || 'development'
  const publicBase = process.env.PUBLIC_BASE_URL || null

  let sockets = { initialized: false as boolean, clients: 0 as number }

  try {
    const { numberOfSocketClients } = getSocketStats()

    sockets.initialized = numberOfSocketClients >= 0
    sockets.clients = numberOfSocketClients
  } catch (err) {
    sockets.initialized = false
    sockets.clients = 0
  }

  const twilio = {
    ready: isTwilioReady(),
    messageCounts: getTwilioMessageCount(),
  }

  const mongo = getDbState()

  const body = {
    ok: mongo == 'connected' && twilio.ready && sockets.initialized,
    uptime_secs,
    env: nodeEnv,
    mongo,
    sockets,
    twilio,
    publicBase,
    errorCounts: logger.getErrorCounts(),
    timestamp: getCurrentTimeFormatted(),
  }

  return res.status(200).json(body)
}

export async function healthUi(_req: Request, res: Response) {
  // Remove all caching of this HTML page to allow changes to take place
  res.set(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate',
  )
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  res.set('Surrogate-Control', 'no-store')
  // Send our hacky health page
  res.type('html').send(`<!doctype html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <title>Health - Live</title>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <style>
      body{font-family:system-ui,Segoe UI,Roboto,Arial;margin:18px;line-height:1.4}
      header{display:flex;align-items:center;gap:12px}
      .status { display:inline-block; padding:6px 10px; border-radius:6px; color:#fff; font-weight:700; }
      .ok{ background:#16a34a } .bad{ background:#dc2626 } .warn{ background:#f59e0b }
      pre{background:#0b0b0b;color:#dcdcdc;padding:12px;border-radius:6px;overflow:auto;max-height:60vh}
      .meta{margin:8px 0;color:#6b7280;font-size:13px}
    </style>
  </head>
  <body>
    <header>
      <h1 style="margin:0;font-size:20px">Health - Live</h1>
      <div id="statusDot" class="status warn" style="margin-left:8px">unknown</div>
    </header>
    <div class="meta">Last update: <span id="lastTime"> - </span> - Refresh every 5s</div>
    <section>
      <h3 style="margin:6px 0">Details</h3>
      <pre id="jsonBox">Loading...</pre>
    </section>

    <script>
      const box = document.getElementById('jsonBox');
      const dot = document.getElementById('statusDot');
      const last = document.getElementById('lastTime');

      async function refresh() {
        try {
          const res = await fetch('/api/health', { cache: 'no-store' });
          const j = await res.json();
          box.textContent = JSON.stringify(j, null, 2);
          console.log('Received Twilio messageCounts:', j.twilio.messageCounts); 
          last.textContent = new Date(j.timestamp).toLocaleString();
          if (j.ok) {
            dot.textContent = 'healthy';
            console.log('Health status:', j.ok);
            dot.className = 'status ok';
          } else {
            dot.textContent = 'unhealthy';
            dot.className = 'status bad';
          }
        } catch (e) {
          box.textContent = String(e);
          dot.textContent = 'error';
          dot.className = 'status bad';
          last.textContent = new Date().toLocaleString();
        }
      }

      // initial and repeating poll
      refresh();
      setInterval(refresh, 5000);
    </script>
  </body>
  </html>`)
}
