# WillohBets

Moderator-run **YES/NO prediction markets** on **Solana devnet**.

| | |
|--|--|
| **Cluster** | Devnet (`https://api.devnet.solana.com`) |
| **Program ID** | `BPpvi9mmM8yzVbGofQARnsDjxdvVXioEbE5UB2F24uJb` |
| **Contract size** | **0.001 SOL** (1_000_000 lamports) full payout if correct |
| **UI** | `https://willohbets.immenseaccumulationonline.online/` (or `http://localhost:5173`) |
| **Agent API** | `http://localhost:5180` (or host LAN IP `:5180` if remote) |
| **Moderator password** | `willohrocks` (UI login + `X-Moderator-Password` on API) |

**Repo path (this machine):** `~/Desktop/willohbets`

---

## For AI agents / Grok Build (start here)

You do **not** need Phantom, Jupiter, or a browser wallet. Prefer:

1. **Agent HTTP API** (easiest) — server signs with a keypair file  
2. **Solana CLI + your own keypair** + small Node/Anchor scripts if you must sign as a specific wallet  

Full API reference: [`docs/AGENT_API.md`](docs/AGENT_API.md) · short pointer: [`AGENTS.md`](AGENTS.md) · OpenAPI: `GET /openapi.json`

### Mental model

1. A **moderator** creates a named bet (open YES vs NO market).  
2. Traders **place limit orders** (bid YES or NO at a % of the 0.001 SOL payout) or **take** someone else’s resting order.  
3. Matching: if you take a YES bid at price *p*, you pay *(1−p)* and receive **NO** (and vice versa).  
4. Moderator **settles** the bet as `yes` / `no` / `void`.  
5. Winners **claim** 0.001 SOL per winning contract.

| Side | Meaning |
|------|---------|
| **YES** | You think the proposition is true / event happens |
| **NO** | You think it does not |

Price: **1–99%** of full contract (`pricePct`) or **100–9900** basis points (`priceBps`).  
Example: YES @ 55% costs **0.00055 SOL** per contract to rest on the book; taker pays **0.00045 SOL** for NO.

There is **no house fee** — only normal Solana network fees (~0.000005 SOL/tx).

---

### Path A — Agent API (recommended for Grok)

#### 0) Is the API up?

```bash
export API="${WILLOH_API:-http://localhost:5180}"
# If you are on another machine on the LAN, use e.g. http://192.168.1.219:5180

curl -sS "$API/health"
# expect: {"ok":true,"service":"willohbets-api",...}
```

If health fails, on the host machine:

```bash
cd ~/Desktop/willohbets
npm run pm2:api          # or: cd api && npm install && npm start
pm2 status
pm2 logs willohbets-api --lines 30
```

Optional API key: if the operator set `WILLOHBETS_API_KEY`, every request except `/health` and `/openapi.json` needs:

```bash
-H "X-Api-Key: $WILLOHBETS_API_KEY"
```

#### 1) Who am I trading as?

```bash
curl -sS "$API/wallet"
# → pubkey, balanceSol, cluster
```

Default agent keypair file (on host): `api/agent-keypair.json` (gitignored).  
If balance is low, fund that **pubkey** with **devnet SOL** (airdrop or transfer). Keep ≥ **0.05 SOL** for fees + small trades; more for large qty.

#### 2) View all bets and decide

```bash
# All markets (open + settled)
curl -sS "$API/bets" | python3 -m json.tool

# Market config
curl -sS "$API/market" | python3 -m json.tool
```

For each bet, note:

- `betId`, `name`, `status` (`open` / `settled`), `outcome` if settled  
- Prefer **`status` open** for new orders  

```bash
# One bet
curl -sS "$API/bets/3" | python3 -m json.tool

# Open order book for that bet
curl -sS "$API/bets/3/orders" | python3 -m json.tool
# or: curl -sS "$API/orders?betId=3"

# Your position on that bet (as agent wallet)
curl -sS "$API/position?betId=3" | python3 -m json.tool
```

**How to decide:**

| Situation | Possible action |
|-----------|-----------------|
| Open bet, empty book | Place a limit on YES or NO at a fair price (e.g. 45–55%) |
| Resting YES you disagree with | `POST /orders/fill` that order (you get NO) |
| Resting NO you disagree with | Fill it (you get YES) |
| You already hold YES/NO and bet is **settled** with matching outcome | `POST /bets/:id/claim` |
| You have an open order you no longer want | `POST /orders/cancel` |
| You are moderator and need a new market | `POST /bets` with password |
| Open bet should resolve | `POST /bets/:id/settle` with password |

#### 3) Place a limit order

```bash
curl -sS -X POST "$API/orders" \
  -H 'Content-Type: application/json' \
  -d '{
    "betId": 3,
    "side": "yes",
    "pricePct": 55,
    "quantity": 2
  }'
# Escrow ≈ quantity × (pricePct/100) × 0.001 SOL
# Use "priceBps": 5500 instead of pricePct if preferred
```

`side`: `"yes"` or `"no"`.

#### 4) Take (fill) someone else’s order

From the book, copy `publicKey` (order PDA) or `orderId` + `betId`:

```bash
curl -sS -X POST "$API/orders/fill" \
  -H 'Content-Type: application/json' \
  -d '{
    "orderPubkey": "ORDER_PDA_BASE58",
    "quantity": 1
  }'

# alternative:
# -d '{"betId":3,"orderId":2,"quantity":1}'
```

You pay the **complement** of the maker’s price and receive the **opposite** side.

#### 5) Cancel your resting order

```bash
curl -sS -X POST "$API/orders/cancel" \
  -H 'Content-Type: application/json' \
  -d '{"orderPubkey":"ORDER_PDA_BASE58"}'
```

#### 6) Claim after settlement

```bash
curl -sS -X POST "$API/bets/3/claim"
```

Only pays if you hold contracts on the winning side (or void rules). Response includes Solana `signature` on success.

#### 7) Moderator: create / settle

```bash
# Create
curl -sS -X POST "$API/bets" \
  -H 'Content-Type: application/json' \
  -H 'X-Moderator-Password: willohrocks' \
  -d '{"name":"Will X happen by Friday?"}'

# Settle when ready: yes | no | void
curl -sS -X POST "$API/bets/3/settle" \
  -H 'Content-Type: application/json' \
  -H 'X-Moderator-Password: willohrocks' \
  -d '{"outcome":"no"}'
```

#### 8) Suggested agent loop

```text
1. GET /health, GET /wallet  → API up? funded?
2. GET /bets                 → list open markets + names
3. For interesting open betId:
     GET /bets/:id/orders    → book depth & prices
     GET /position?betId=    → do I already hold exposure?
4. Decide: place limit | fill best oppposite | cancel | skip
5. After settle (or if already settled): claim if position has winners
6. Re-check GET /wallet balance
```

All write responses: `{ "ok": true, "signature": "...", ... }` or `{ "ok": false, "error": "..." }`.

---

### Path B — Solana CLI + your private key

Use this when the other session **already knows a keypair** (JSON secret or recovered path) and should **not** use the shared agent key.

#### Configure CLI (devnet)

```bash
solana config set --url https://api.devnet.solana.com

# Option 1: existing JSON keypair file (64-byte secret array)
solana config set --keypair /path/to/your-keypair.json

# Option 2: write keypair from known secret (careful: keep file private)
# echo '[1,2,3,...]' > /tmp/agent.json && chmod 600 /tmp/agent.json
# solana config set --keypair /tmp/agent.json

solana address
solana balance
# Need devnet SOL:
# solana airdrop 1   # may fail on public faucet rate limits
# or transfer from another funded wallet
```

#### Inspect program / accounts via CLI

```bash
PROGRAM=BPpvi9mmM8yzVbGofQARnsDjxdvVXioEbE5UB2F24uJb

# Recent program activity
solana transaction-history "$PROGRAM" --limit 15

# Account info (any PDA you know)
solana account <PUBKEY> --output json
```

Solana CLI alone does **not** decode Anchor account layouts. To **list bets**, either:

- Call the **Agent API** read endpoints (they don’t spend your key’s SOL), or  
- Run a short Node script with Anchor (below).

#### Node + Anchor with *your* keypair (sign as that wallet)

From repo (uses root or `api` deps):

```bash
cd ~/Desktop/willohbets/api
# KEYPAIR=/path/to/your-keypair.json node --input-type=module <<'EOF'
import { readFileSync } from 'fs'
import { Connection, Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import anchor from '@coral-xyz/anchor'
const { AnchorProvider, BN, Program, Wallet } = anchor

const RPC = process.env.RPC_URL || 'https://api.devnet.solana.com'
const KEYPAIR = process.env.KEYPAIR || './agent-keypair.json'
const idl = JSON.parse(readFileSync('./idl.json', 'utf8'))
const PROGRAM_ID = new PublicKey(idl.address)

const kp = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(readFileSync(KEYPAIR, 'utf8'))),
)
const connection = new Connection(RPC, 'confirmed')
const provider = new AnchorProvider(connection, new Wallet(kp), {
  commitment: 'confirmed',
})
const program = new Program(idl, provider)

const pda = (seeds) => PublicKey.findProgramAddressSync(seeds, PROGRAM_ID)
const [marketPda] = pda([Buffer.from('willoh_market')])
const [vaultPda] = pda([Buffer.from('willoh_vault')])

console.log('signer', kp.publicKey.toBase58())
console.log('balance', (await connection.getBalance(kp.publicKey)) / LAMPORTS_PER_SOL)

const market = await program.account.market.fetch(marketPda)
console.log('market nextBetId', market.nextBetId.toString())

const bets = await program.account.bet.all()
for (const b of bets.sort((a, c) => c.account.betId.cmp(a.account.betId))) {
  const a = b.account
  const status = a.status.open ? 'open' : 'settled'
  const outcome = a.outcome.yes ? 'yes' : a.outcome.no ? 'no' : a.outcome.void ? 'void' : '—'
  console.log(`#${a.betId} [${status}] ${a.name} outcome=${outcome}`)
}

// Open orders for a bet (set BET_ID)
const BET_ID = Number(process.env.BET_ID || 0)
if (BET_ID > 0) {
  const orders = await program.account.order.all()
  for (const o of orders) {
    const a = o.account
    if (a.betId.toNumber() !== BET_ID) continue
    if (!a.status.open || a.qtyRemaining.toNumber() <= 0) continue
    const side = a.side.yes ? 'YES' : 'NO'
    console.log(
      'order', o.publicKey.toBase58(),
      side, a.priceBps.toNumber() / 100 + '%',
      'qty', a.qtyRemaining.toString(),
      'id', a.orderId.toString(),
    )
  }
}
EOF
```

**Place order** (same shell env `KEYPAIR`, `BET_ID`, etc.):

```bash
# Example only — set BET_ID, SIDE=yes|no, PRICE_BPS, QTY
KEYPAIR=/path/to/keypair.json BET_ID=3 SIDE=yes PRICE_BPS=5500 QTY=1 \
node --input-type=module <<'EOF'
import { readFileSync } from 'fs'
import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js'
import anchor from '@coral-xyz/anchor'
const { AnchorProvider, BN, Program, Wallet } = anchor
const idl = JSON.parse(readFileSync('./idl.json','utf8'))
const PROGRAM_ID = new PublicKey(idl.address)
const kp = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(process.env.KEYPAIR,'utf8'))))
const connection = new Connection(process.env.RPC_URL||'https://api.devnet.solana.com','confirmed')
const program = new Program(idl, new AnchorProvider(connection, new Wallet(kp), {commitment:'confirmed'}))
const pda = (s) => PublicKey.findProgramAddressSync(s, PROGRAM_ID)
const betId = Number(process.env.BET_ID)
const priceBps = Number(process.env.PRICE_BPS||5500)
const qty = Number(process.env.QTY||1)
const side = process.env.SIDE==='no' ? { no:{} } : { yes:{} }
const [marketPda] = pda([Buffer.from('willoh_market')])
const [vaultPda] = pda([Buffer.from('willoh_vault')])
const market = await program.account.market.fetch(marketPda)
const orderId = market.nextOrderId.toNumber()
const [betPda] = pda([Buffer.from('willoh_bet'), new BN(betId).toArrayLike(Buffer,'le',8)])
const [orderPda] = pda([
  Buffer.from('willoh_order'),
  new BN(betId).toArrayLike(Buffer,'le',8),
  new BN(orderId).toArrayLike(Buffer,'le',8),
])
const sig = await program.methods
  .placeOrder(new BN(betId), side, new BN(priceBps), new BN(qty))
  .accounts({
    owner: kp.publicKey,
    market: marketPda,
    bet: betPda,
    order: orderPda,
    vault: vaultPda,
    systemProgram: SystemProgram.programId,
  })
  .rpc()
console.log('place_order', sig, 'orderId', orderId)
EOF
```

Prefer implementing fill/cancel/claim via the **Agent API** when possible; reimplementing all account metas in one-off scripts is error-prone. If you must use only *your* keypair for fills, point the API at that key:

```bash
# On host: run API as the known wallet
cd ~/Desktop/willohbets/api
WILLOHBETS_KEYPAIR_PATH=/path/to/your-keypair.json npm start
# then use Path A curls; all txs sign as that wallet
```

#### PDA seeds (for debugging)

| Account | Seeds |
|---------|--------|
| Market | `["willoh_market"]` |
| Vault | `["willoh_vault"]` |
| Bet | `["willoh_bet", bet_id_u64_le]` |
| Order | `["willoh_order", bet_id_u64_le, order_id_u64_le]` |
| Position | `["willoh_pos_v2", bet_id_u64_le, owner_pubkey]` |

---

### Path C — Human UI

1. Open UI (public or `http://localhost:5173`).  
2. Phantom/Solflare → **Devnet**, connect funded wallet.  
3. **Trade**: pick market, place/take orders.  
4. **History**: all bets.  
5. **Moderator** tab → password `willohrocks` → create/resolve.  

Browser wallets are hard for automated Grok sessions — use Path A or B instead.

---

## Error decoding (quick)

| Symptom | Likely cause |
|---------|----------------|
| API `connection refused` | `willohbets-api` not running (`npm run pm2:api`) |
| `Insufficient funds` / failed place | Agent/CLI wallet needs more devnet SOL |
| `Bet is not open` | Market already settled — cannot trade |
| `Cannot fill your own order` | Use another wallet or different order |
| `Nothing to claim` | No winning contracts / already claimed / wrong outcome |
| `Missing X-Moderator-Password` | Create/settle need `willohrocks` header |
| Order not in book | Fully filled/cancelled or wrong `betId` |

Explorer (devnet):  
`https://explorer.solana.com/address/BPpvi9mmM8yzVbGofQARnsDjxdvVXioEbE5UB2F24uJb?cluster=devnet`

---

## Human ops: UI via PM2

Serves production build on **port 5173**.

```bash
npm install -g pm2
cd ~/Desktop/willohbets
cd app && npm install && cd ..
npm run pm2:start          # build UI + start preview
npm run pm2:api            # agent API on 5180
pm2 status
pm2 logs willohbets
pm2 logs willohbets-api
```

After UI code changes: `npm run pm2:rebuild`.  
Cloudflare UI tunnel → `http://localhost:5173`.  
Optional API tunnel → `http://localhost:5180` for remote agents.

---

## On-chain instructions

`initialize_market` · `create_bet` · `place_order` · `fill_order` · `cancel_order` · `settle_bet` · `claim`

## Program build / deploy

```bash
anchor build
solana program deploy target/deploy/coinflip.so \
  --program-id target/deploy/coinflip-keypair.json \
  --url https://api.devnet.solana.com
```

## Security notes

- Devnet only unless you intentionally redeploy.  
- Moderator password is UI/API gate, **not** strong on-chain auth for settle/create.  
- Agent keypair can spend its SOL; set `WILLOHBETS_API_KEY` if the API is network-exposed.  
- Never commit keypairs or seed phrases.
