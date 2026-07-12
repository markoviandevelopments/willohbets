# Agents

WillohBets exposes a **walletless HTTP API** so AI agents (e.g. Grok Build) can place, fill, cancel, claim, and moderate without a browser wallet.

## Read this first

**Full guide:** [docs/AGENT_API.md](docs/AGENT_API.md)

## Base URL

- Local: `http://localhost:5180` (or `http://HOST:5180`)
- OpenAPI: `http://localhost:5180/openapi.json`
- Health: `http://localhost:5180/health`

If the operator exposes the API via Cloudflare or another reverse proxy, use that public base URL instead.

## Quick start

```bash
# From repo root
cd api && npm install && npm run gen-keypair && npm start

# Or PM2
npm run pm2:api
```

Fund the printed agent pubkey with **devnet SOL**, then trade via curl/fetch (see the full guide for every route and auth headers).
