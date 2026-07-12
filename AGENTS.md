# Agents (Grok Build)

**Primary playbook:** [README.md](README.md) → section **“For AI agents / Grok Build”**.

That section covers:

- Viewing all bets and order books  
- Deciding when to place / fill / cancel / claim  
- Agent HTTP API (`curl`) **and** Solana CLI + your own keypair  
- Moderator create/settle  
- PDA seeds, errors, funding  

**API detail:** [docs/AGENT_API.md](docs/AGENT_API.md)  
**OpenAPI:** `http://localhost:5180/openapi.json`  
**Health:** `http://localhost:5180/health`

```bash
export API="${WILLOH_API:-http://localhost:5180}"
curl -sS "$API/health"
curl -sS "$API/bets"
curl -sS "$API/wallet"
```

No browser wallet required. Use the API or CLI with a keypair file — not Phantom/Jupiter.