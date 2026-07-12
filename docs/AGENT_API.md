# WillohBets Agent API

HTTP API for **AI agents** (and scripts) that cannot use browser wallets (Phantom / wallet-adapter). A server-side Solana keypair signs all transactions.

You trade with **curl** or **fetch** only — no browser wallet needed.

## Base URL

| Environment | URL |
|-------------|-----|
| **Public (Cloudflare)** | `https://willohbetsapi.immenseaccumulationonline.online` |
| Local on host | `http://localhost:5180` |
| Tunnel origin | Cloudflare → `http://localhost:5180` |

OpenAPI: https://willohbetsapi.immenseaccumulationonline.online/openapi.json  
Health: https://willohbetsapi.immenseaccumulationonline.online/health

Program ID: `BPpvi9mmM8yzVbGofQARnsDjxdvVXioEbE5UB2F24uJb` (devnet)

## Setup (operators)

```bash
cd api
npm install
npm run gen-keypair          # writes agent-keypair.json, prints pubkey
# Fund that pubkey with devnet SOL (airdrop or transfer)
cp .env.example .env         # optional; edit keys
npm start                    # listens on 0.0.0.0:5180

# Or via PM2 from repo root:
npm run pm2:api
```

### Env

| Variable | Default | Purpose |
|----------|---------|---------|
| `WILLOHBETS_KEYPAIR_PATH` | `./agent-keypair.json` | JSON secret key array |
| `WILLOHBETS_API_KEY` | _(empty)_ | If set, require `X-Api-Key` on almost all routes |
| `MODERATOR_PASSWORD` | `willohrocks` | For create/settle bet |
| `RPC_URL` | `https://api.devnet.solana.com` | Solana RPC |
| `PORT` | `5180` | Listen port |
| `HOST` | `0.0.0.0` | Listen host |

**Fund the agent pubkey with devnet SOL** before placing/filling orders. Escrow is ~`qty × pricePct/100 × 0.001` SOL per order; fills also need SOL for the complementary side.

## Auth

1. **API key** (optional): if the server has `WILLOHBETS_API_KEY` set, send:

   ```
   X-Api-Key: <your-key>
   ```

   Required for **all** routes except `GET /health` and `GET /openapi.json`.

2. **Moderator password**: for `POST /bets` and `POST /bets/:betId/settle`:

   ```
   X-Moderator-Password: willohrocks
   ```

   (or whatever `MODERATOR_PASSWORD` is). Create/settle still use the **agent keypair** as the on-chain signer — the password only gates the HTTP endpoint.

## Response shape

Success:

```json
{ "ok": true, "...": "..." }
```

Error:

```json
{ "ok": false, "error": "message" }
```

Successful writes always include a Solana `signature` string.

## Market rules (on-chain)

- 1 contract = **0.001 SOL** (1_000_000 lamports) at settlement if correct
- Limit price **1%–99%** → `priceBps` **100–9900** (or `pricePct` 1–99)
- Seeds: `willoh_market`, `willoh_vault`, `willoh_bet`, `willoh_order`, `willoh_pos_v2`

## Example curls

Set a base for convenience:

```bash
export API=https://willohbetsapi.immenseaccumulationonline.online
# Local host only: export API=http://localhost:5180
# export API_KEY=change-me   # if server has WILLOHBETS_API_KEY
# H=(-H "X-Api-Key: $API_KEY")
```

### Health & OpenAPI

```bash
curl -s "$API/health"
curl -s "$API/openapi.json" | head
```

### Wallet (agent pubkey + balance)

```bash
curl -s ${API_KEY:+-H "X-Api-Key: $API_KEY"} "$API/wallet"
# → { "ok": true, "pubkey": "...", "balanceSol": 0.5, "cluster": "devnet" }
```

### Market & bets

```bash
curl -s ${API_KEY:+-H "X-Api-Key: $API_KEY"} "$API/market"
curl -s ${API_KEY:+-H "X-Api-Key: $API_KEY"} "$API/bets"
curl -s ${API_KEY:+-H "X-Api-Key: $API_KEY"} "$API/bets/0"
curl -s ${API_KEY:+-H "X-Api-Key: $API_KEY"} "$API/bets/0/orders"
```

### Open orders

```bash
curl -s ${API_KEY:+-H "X-Api-Key: $API_KEY"} "$API/orders"
curl -s ${API_KEY:+-H "X-Api-Key: $API_KEY"} "$API/orders?betId=0"
```

### Agent position on a bet

```bash
curl -s ${API_KEY:+-H "X-Api-Key: $API_KEY"} "$API/position?betId=0"
```

### Place limit order

```bash
curl -s -X POST ${API_KEY:+-H "X-Api-Key: $API_KEY"} \
  -H 'Content-Type: application/json' \
  -d '{"betId":0,"side":"yes","pricePct":55,"quantity":2}' \
  "$API/orders"
# or priceBps: 5500 instead of pricePct
```

### Fill (take) an order

```bash
# by order PDA
curl -s -X POST ${API_KEY:+-H "X-Api-Key: $API_KEY"} \
  -H 'Content-Type: application/json' \
  -d '{"orderPubkey":"<ORDER_PUBKEY>","quantity":1}' \
  "$API/orders/fill"

# or by betId + orderId
curl -s -X POST ${API_KEY:+-H "X-Api-Key: $API_KEY"} \
  -H 'Content-Type: application/json' \
  -d '{"betId":0,"orderId":3,"quantity":1}' \
  "$API/orders/fill"
```

### Cancel your order

```bash
curl -s -X POST ${API_KEY:+-H "X-Api-Key: $API_KEY"} \
  -H 'Content-Type: application/json' \
  -d '{"orderPubkey":"<ORDER_PUBKEY>"}' \
  "$API/orders/cancel"
```

### Claim after settlement

```bash
curl -s -X POST ${API_KEY:+-H "X-Api-Key: $API_KEY"} \
  "$API/bets/0/claim"
```

### Create bet (moderator)

```bash
curl -s -X POST ${API_KEY:+-H "X-Api-Key: $API_KEY"} \
  -H 'X-Moderator-Password: willohrocks' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Will it rain tomorrow?"}' \
  "$API/bets"
```

### Settle bet (moderator)

```bash
curl -s -X POST ${API_KEY:+-H "X-Api-Key: $API_KEY"} \
  -H 'X-Moderator-Password: willohrocks' \
  -H 'Content-Type: application/json' \
  -d '{"outcome":"yes"}' \
  "$API/bets/0/settle"
# outcome: yes | no | void
```

## fetch (Node / agent)

```js
const API =
  process.env.WILLOH_API ||
  'https://willohbetsapi.immenseaccumulationonline.online'
const headers = {
  'Content-Type': 'application/json',
  ...(process.env.WILLOHBETS_API_KEY
    ? { 'X-Api-Key': process.env.WILLOHBETS_API_KEY }
    : {}),
}

const wallet = await fetch(`${API}/wallet`, { headers }).then((r) => r.json())
console.log(wallet)

const place = await fetch(`${API}/orders`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    betId: 0,
    side: 'yes',
    pricePct: 50,
    quantity: 1,
  }),
}).then((r) => r.json())
console.log(place)
```

## Routes summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | public | Liveness |
| GET | `/openapi.json` | public | OpenAPI 3.0 |
| GET | `/wallet` | API key* | Agent pubkey + balance |
| GET | `/market` | API key* | Market PDA state |
| GET | `/bets` | API key* | All bets |
| GET | `/bets/:betId` | API key* | One bet |
| GET | `/bets/:betId/orders` | API key* | Open orders for bet |
| GET | `/orders?betId=` | API key* | Open orders |
| GET | `/position?betId=` | API key* | Agent position |
| POST | `/orders` | API key* | Place limit order |
| POST | `/orders/fill` | API key* | Fill order |
| POST | `/orders/cancel` | API key* | Cancel order |
| POST | `/bets/:betId/claim` | API key* | Claim payout |
| POST | `/bets` | API key* + mod | Create bet |
| POST | `/bets/:betId/settle` | API key* + mod | Settle bet |

\*Only if `WILLOHBETS_API_KEY` is configured on the server.

## Notes for Grok Build / automated agents

1. Call `GET /wallet` first; ensure `balanceSol` is enough for escrow + fees.
2. List open markets with `GET /bets`; filter `status === "open"`.
3. Inspect book with `GET /bets/:betId/orders` or `GET /orders?betId=`.
4. Place or fill; store returned `signature` / `orderPubkey`.
5. After a moderator settles, `POST /bets/:betId/claim` to withdraw.
6. Do **not** expect Phantom, Jupiter, or browser extensions — this API is the wallet.
