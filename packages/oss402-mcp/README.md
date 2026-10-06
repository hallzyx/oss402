# oss402-mcp

stdio MCP server that buys an official certification run. It discovers the service, checks `oss402.yml` against the autonomous budget, pays 0.05 USDC on Stellar Testnet, and polls PASS or FAIL.

The payer secret stays in the repo `.env` as `STELLAR_PRIVATE_KEY`. OpenCode launches the built server from `opencode.jsonc` with the working directory at the repo root.

```bash
pnpm --filter oss402-client build
pnpm --filter oss402-mcp build
pnpm dev:mcp
```

Tools: `oss402_discover`, `oss402_inspect`, `oss402_purchase_certification`, `oss402_certification_status`, `oss402_verify_attestation`.

How to connect an agent: [MCP and Agent Skill](../../docs/MCP_AND_AGENT_SKILL.md). The HTTP contract those tools call: [Protocol](../../docs/PROTOCOL.md).
