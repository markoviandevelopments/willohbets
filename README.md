# WillohBets

Moderator-run prediction markets on **Solana devnet**.

- Moderators log in with a password, **create** named bets, and **resolve** them (YES / NO / VOID).
- Anyone with a wallet can **place limit orders** or **take** resting orders.
- **1 contract = 0.001 SOL** full payout if correct.
- **History** tab lists every bet (open + settled).

## Program

| | |
|---|---|
| Cluster | Devnet |
| Program ID | `BPpvi9mmM8yzVbGofQARnsDjxdvVXioEbE5UB2F24uJb` |
| Contract | 0.001 SOL |

## Run UI (PM2 — recommended)

Serves a **production build** (`vite preview`) on **port 5173**.

> **Why not `vite` dev under PM2?** Dev mode + wallet-adapter often exceeds
> 512MB; with `max_memory_restart` PM2 kills and restarts it every ~30s even
> though the app looks “healthy”. Preview is lighter and stays up.

```bash
# once
npm install -g pm2
cd ~/Desktop/willohbets
cd app && npm install && cd ..

# build + start (or rebuild + restart)
npm run pm2:start

pm2 status
pm2 logs willohbets
pm2 stop willohbets

# after UI code changes: rebuild and restart
npm run pm2:rebuild

# survive reboots
pm2 save
pm2 startup   # run the command it prints
```

Config: [`ecosystem.config.cjs`](./ecosystem.config.cjs)  
Logs: `logs/willohbets-out.log`, `logs/willohbets-error.log`

If port 5173 is busy:

```bash
pm2 delete willohbets
fuser -k 5173/tcp 2>/dev/null || true
npm run pm2:start
```

Point Cloudflare Tunnel at `http://localhost:5173`.

Public host: `https://willohbets.immenseaccumulationonline.online/`

### Manual (no PM2)

```bash
cd app
npm install
npm run build && npm run preview
# or hot-reload dev:
npm run dev
```

## Moderator

1. Open **Moderator** tab  
2. Password: `willohrocks`  
3. **Initialize market** (once)  
4. **Create bet** with a name  
5. When ready, resolve with **YES**, **NO**, or **Void**

Trading always requires a connected **devnet** wallet (Phantom / Solflare).

## On-chain instructions

`initialize_market` · `create_bet` · `place_order` · `fill_order` · `cancel_order` · `settle_bet` · `claim`

## Build / deploy

```bash
anchor build
solana program deploy target/deploy/coinflip.so \
  --program-id target/deploy/coinflip-keypair.json \
  --url https://api.devnet.solana.com
```
