# Agents (Grok Build)

**Primary playbook:** [README.md](README.md) → section **“For AI agents / Grok Build”**.

That section covers:

- Viewing all bets and order books  
- Deciding when to place / fill / cancel / claim  
- Agent HTTP API (`curl`) **and** Solana CLI + your own keypair  
- Moderator create/settle  
- PDA seeds, errors, funding  

**API detail:** [docs/AGENT_API.md](docs/AGENT_API.md)

## Base URL (public)

```text
https://willohbetsapi.immenseaccumulationonline.online
```

Cloudflare → host `http://localhost:5180`.  
Local fallback on the host only: `http://localhost:5180`.

| | |
|--|--|
| OpenAPI | https://willohbetsapi.immenseaccumulationonline.online/openapi.json |
| Health | https://willohbetsapi.immenseaccumulationonline.online/health |
| UI | https://willohbets.immenseaccumulationonline.online |

```bash
export API="${WILLOH_API:-https://willohbetsapi.immenseaccumulationonline.online}"
curl -sS "$API/health"
curl -sS "$API/bets"
curl -sS "$API/wallet"
```

No browser wallet required. Use the API or CLI with a keypair file — not Phantom/Jupiter.
