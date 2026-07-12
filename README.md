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

## Run UI

```bash
cd app
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Public host (Cloudflare): `https://willohbest.immenseaccumulationonline.online/`

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
