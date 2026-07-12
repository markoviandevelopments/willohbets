/**
 * WillohBets agent HTTP API — pure node:http, no Express.
 * Signs Solana txs with a server-side keypair for walletless agents.
 */
import http from 'http'
import { URL } from 'url'
import {
  loadEnvFile,
  getBalance,
  getSnapshot,
  getBet,
  getOpenOrders,
  getPosition,
  placeOrder,
  fillOrder,
  cancelOrder,
  claim,
  createBet,
  settleBet,
  MIN_PRICE_BPS,
  MAX_PRICE_BPS,
  PROGRAM_ID,
} from './lib/program.mjs'

loadEnvFile()

const PORT = Number(process.env.PORT || 5180)
const HOST = process.env.HOST || '0.0.0.0'
const API_KEY = process.env.WILLOHBETS_API_KEY || ''
const MOD_PASSWORD = process.env.MODERATOR_PASSWORD || 'willohrocks'

function send(res, status, body) {
  const json = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, X-Api-Key, X-Moderator-Password',
    'Content-Length': Buffer.byteLength(json),
  })
  res.end(json)
}

function ok(res, data = {}) {
  send(res, 200, { ok: true, ...data })
}

function fail(res, status, error) {
  send(res, status, { ok: false, error: String(error) })
}

async function readJson(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (chunks.length === 0) return {}
  const raw = Buffer.concat(chunks).toString('utf8').trim()
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error('Invalid JSON body')
  }
}

function checkApiKey(req, res) {
  if (!API_KEY) return true
  const key = req.headers['x-api-key']
  if (key !== API_KEY) {
    fail(res, 401, 'Missing or invalid X-Api-Key')
    return false
  }
  return true
}

function checkModPassword(req, res, body = {}) {
  const pw =
    req.headers['x-moderator-password'] ||
    body.moderatorPassword ||
    body.password ||
    ''
  if (pw !== MOD_PASSWORD) {
    fail(res, 403, 'Missing or invalid X-Moderator-Password')
    return false
  }
  return true
}

function errMsg(e) {
  if (!e) return 'Unknown error'
  if (typeof e === 'string') return e
  // Anchor / Solana errors often nest useful info
  if (e.error?.errorMessage) return e.error.errorMessage
  if (e.message) return e.message
  return String(e)
}

function resolvePriceBps(body) {
  if (body.priceBps != null) return Number(body.priceBps)
  if (body.pricePct != null) {
    const pct = Number(body.pricePct)
    // Accept 1–99 or 1.5 etc as percent; also 0.01–0.99 as fraction
    if (pct > 0 && pct < 1) return Math.round(pct * 10_000)
    return Math.round(pct * 100)
  }
  return NaN
}

function openApiSpec() {
  const base = {
    openapi: '3.0.3',
    info: {
      title: 'WillohBets Agent API',
      version: '1.0.0',
      description:
        'HTTP API for AI agents to trade WillohBets prediction markets on Solana without a browser wallet. Server signs txs with a configured keypair.',
    },
    servers: [{ url: `http://localhost:${PORT}`, description: 'Local agent API' }],
    components: {
      securitySchemes: {
        ApiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Api-Key',
          description: 'Required on all routes if WILLOHBETS_API_KEY is set (except /health, /openapi.json)',
        },
        ModeratorPassword: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Moderator-Password',
          description: 'Required for create/settle bet',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: false },
            error: { type: 'string' },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          security: [],
          responses: {
            200: {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      ok: { type: 'boolean' },
                      service: { type: 'string' },
                      programId: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/openapi.json': {
        get: {
          summary: 'OpenAPI 3.0 document',
          security: [],
          responses: { 200: { description: 'OpenAPI JSON' } },
        },
      },
      '/wallet': {
        get: {
          summary: 'Agent wallet pubkey and SOL balance',
          responses: { 200: { description: '{ ok, pubkey, balanceSol, cluster }' } },
        },
      },
      '/market': {
        get: {
          summary: 'On-chain market account',
          responses: { 200: { description: '{ ok, market }' } },
        },
      },
      '/bets': {
        get: {
          summary: 'List all bets',
          responses: { 200: { description: '{ ok, bets }' } },
        },
        post: {
          summary: 'Create a bet (moderator)',
          parameters: [
            {
              name: 'X-Moderator-Password',
              in: 'header',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: { name: { type: 'string', maxLength: 64 } },
                },
              },
            },
          },
          responses: { 200: { description: '{ ok, signature, betId, ... }' } },
        },
      },
      '/bets/{betId}': {
        get: {
          summary: 'Get one bet',
          parameters: [
            { name: 'betId', in: 'path', required: true, schema: { type: 'integer' } },
          ],
          responses: { 200: { description: '{ ok, bet }' } },
        },
      },
      '/bets/{betId}/orders': {
        get: {
          summary: 'Open orders for a bet',
          parameters: [
            { name: 'betId', in: 'path', required: true, schema: { type: 'integer' } },
          ],
          responses: { 200: { description: '{ ok, orders }' } },
        },
      },
      '/bets/{betId}/settle': {
        post: {
          summary: 'Settle a bet (moderator)',
          parameters: [
            { name: 'betId', in: 'path', required: true, schema: { type: 'integer' } },
            {
              name: 'X-Moderator-Password',
              in: 'header',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['outcome'],
                  properties: {
                    outcome: { type: 'string', enum: ['yes', 'no', 'void'] },
                  },
                },
              },
            },
          },
          responses: { 200: { description: '{ ok, signature, outcome }' } },
        },
      },
      '/bets/{betId}/claim': {
        post: {
          summary: 'Claim winnings for agent wallet on a settled bet',
          parameters: [
            { name: 'betId', in: 'path', required: true, schema: { type: 'integer' } },
          ],
          responses: { 200: { description: '{ ok, signature }' } },
        },
      },
      '/orders': {
        get: {
          summary: 'All open orders (optional ?betId=)',
          parameters: [
            { name: 'betId', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { 200: { description: '{ ok, orders }' } },
        },
        post: {
          summary: 'Place a limit order',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['betId', 'side', 'quantity'],
                  properties: {
                    betId: { type: 'integer' },
                    side: { type: 'string', enum: ['yes', 'no'] },
                    priceBps: {
                      type: 'integer',
                      description: `Price in bps (${MIN_PRICE_BPS}-${MAX_PRICE_BPS})`,
                    },
                    pricePct: {
                      type: 'number',
                      description: 'Price as percent 1–99 (alternative to priceBps)',
                    },
                    quantity: { type: 'integer', minimum: 1 },
                  },
                },
              },
            },
          },
          responses: { 200: { description: '{ ok, signature, orderPubkey, ... }' } },
        },
      },
      '/orders/fill': {
        post: {
          summary: 'Fill (take) an open order',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['quantity'],
                  properties: {
                    orderPubkey: { type: 'string' },
                    betId: { type: 'integer' },
                    orderId: { type: 'integer' },
                    quantity: { type: 'integer', minimum: 1 },
                  },
                },
              },
            },
          },
          responses: { 200: { description: '{ ok, signature }' } },
        },
      },
      '/orders/cancel': {
        post: {
          summary: 'Cancel an open order owned by the agent',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    orderPubkey: { type: 'string' },
                    betId: { type: 'integer' },
                    orderId: { type: 'integer' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: '{ ok, signature }' } },
        },
      },
      '/position': {
        get: {
          summary: 'Agent position on a bet',
          parameters: [
            {
              name: 'betId',
              in: 'query',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          responses: { 200: { description: '{ ok, position }' } },
        },
      },
    },
  }
  return base
}

async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, X-Api-Key, X-Moderator-Password',
      'Access-Control-Max-Age': '86400',
    })
    res.end()
    return
  }

  const host = req.headers.host || `localhost:${PORT}`
  const url = new URL(req.url || '/', `http://${host}`)
  const path = url.pathname.replace(/\/+$/, '') || '/'
  const method = (req.method || 'GET').toUpperCase()

  // Public routes (no API key even if configured)
  if (method === 'GET' && path === '/health') {
    return ok(res, {
      service: 'willohbets-api',
      programId: PROGRAM_ID.toBase58(),
    })
  }
  if (method === 'GET' && path === '/openapi.json') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    })
    res.end(JSON.stringify(openApiSpec(), null, 2))
    return
  }

  // All other routes: optional API key
  if (!checkApiKey(req, res)) return

  try {
    // GET routes
    if (method === 'GET' && path === '/wallet') {
      const bal = await getBalance()
      return ok(res, bal)
    }

    if (method === 'GET' && path === '/market') {
      const snap = await getSnapshot()
      return ok(res, { market: snap.market })
    }

    if (method === 'GET' && path === '/bets') {
      const snap = await getSnapshot()
      return ok(res, { bets: snap.bets })
    }

    {
      const m = path.match(/^\/bets\/(\d+)$/)
      if (method === 'GET' && m) {
        const bet = await getBet(m[1])
        if (!bet) return fail(res, 404, `Bet ${m[1]} not found`)
        return ok(res, { bet })
      }
    }

    {
      const m = path.match(/^\/bets\/(\d+)\/orders$/)
      if (method === 'GET' && m) {
        const orders = await getOpenOrders(m[1])
        return ok(res, { orders, betId: Number(m[1]) })
      }
    }

    if (method === 'GET' && path === '/orders') {
      const betId = url.searchParams.get('betId')
      const orders = await getOpenOrders(betId)
      return ok(res, { orders })
    }

    if (method === 'GET' && path === '/position') {
      const betId = url.searchParams.get('betId')
      if (betId == null || betId === '') {
        return fail(res, 400, 'Query param betId is required')
      }
      const position = await getPosition(betId)
      return ok(res, { position, betId: Number(betId) })
    }

    // POST routes
    if (method === 'POST' && path === '/orders') {
      const body = await readJson(req)
      const priceBps = resolvePriceBps(body)
      if (!Number.isFinite(priceBps)) {
        return fail(res, 400, 'Provide priceBps or pricePct')
      }
      const result = await placeOrder({
        betId: body.betId,
        side: body.side,
        priceBps,
        quantity: body.quantity,
      })
      return ok(res, result)
    }

    if (method === 'POST' && path === '/orders/fill') {
      const body = await readJson(req)
      const result = await fillOrder({
        orderPubkey: body.orderPubkey,
        betId: body.betId,
        orderId: body.orderId,
        quantity: body.quantity,
      })
      return ok(res, result)
    }

    if (method === 'POST' && path === '/orders/cancel') {
      const body = await readJson(req)
      const result = await cancelOrder({
        orderPubkey: body.orderPubkey,
        betId: body.betId,
        orderId: body.orderId,
      })
      return ok(res, result)
    }

    if (method === 'POST' && path === '/bets') {
      const body = await readJson(req)
      if (!checkModPassword(req, res, body)) return
      const result = await createBet(body.name)
      return ok(res, result)
    }

    {
      const m = path.match(/^\/bets\/(\d+)\/settle$/)
      if (method === 'POST' && m) {
        const body = await readJson(req)
        if (!checkModPassword(req, res, body)) return
        const result = await settleBet(m[1], body.outcome)
        return ok(res, result)
      }
    }

    {
      const m = path.match(/^\/bets\/(\d+)\/claim$/)
      if (method === 'POST' && m) {
        const result = await claim(m[1])
        return ok(res, result)
      }
    }

    return fail(res, 404, `No route ${method} ${path}`)
  } catch (e) {
    console.error('[willohbets-api]', method, path, e)
    const msg = errMsg(e)
    const status =
      /not found|Market not initialized/i.test(msg)
        ? 404
        : /must be|required|Invalid|Provide/i.test(msg)
          ? 400
          : 500
    return fail(res, status, msg)
  }
}

const server = http.createServer((req, res) => {
  handler(req, res).catch((e) => {
    console.error('[willohbets-api] unhandled', e)
    if (!res.headersSent) fail(res, 500, errMsg(e))
  })
})

server.listen(PORT, HOST, () => {
  console.log(
    `willohbets-api listening on http://${HOST}:${PORT} (program ${PROGRAM_ID.toBase58()})`,
  )
  if (API_KEY) {
    console.log('API key auth enabled (X-Api-Key required except /health, /openapi.json)')
  } else {
    console.log('API key auth disabled (set WILLOHBETS_API_KEY to enable)')
  }
})
