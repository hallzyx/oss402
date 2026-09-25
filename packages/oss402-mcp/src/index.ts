import "dotenv/config";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Transaction, TransactionBuilder } from "@stellar/stellar-sdk";
import { x402Client, x402HTTPClient } from "@x402/fetch";
import { createEd25519Signer, getNetworkPassphrase } from "@x402/stellar";
import { ExactStellarScheme } from "@x402/stellar/exact/client";
import { parse as parseYaml } from "yaml";
import { ODYSSEY_AUTH_SERVICE } from "oss402-client";

const API_BASE = process.env.OSS402_API_URL ?? "http://127.0.0.1:8787";
const NETWORK = "stellar:testnet";
const STELLAR_RPC_URL =
  process.env.STELLAR_RPC_URL ?? "https://soroban-testnet.stellar.org";

interface AgentPolicy {
  totalBudgetUSDC: number;
  maxAutonomousPurchaseUSDC: number;
  spentUSDC: number;
}

function loadPolicy(workspace?: string): AgentPolicy {
  const defaults: AgentPolicy = {
    totalBudgetUSDC: 1.0,
    maxAutonomousPurchaseUSDC: 0.1,
    spentUSDC: Number(process.env.OSS402_SESSION_SPENT ?? "0"),
  };

  if (!workspace) return defaults;

  const repoRoot = findRepoRoot();
  const ymlPath = path.resolve(repoRoot, workspace, "oss402.yml");
  if (!existsSync(ymlPath)) return defaults;

  const doc = parseYaml(readFileSync(ymlPath, "utf8")) as {
    agent?: { totalBudgetUSDC?: number; maxAutonomousPurchaseUSDC?: number };
  };

  return {
    totalBudgetUSDC: doc.agent?.totalBudgetUSDC ?? defaults.totalBudgetUSDC,
    maxAutonomousPurchaseUSDC:
      doc.agent?.maxAutonomousPurchaseUSDC ?? defaults.maxAutonomousPurchaseUSDC,
    spentUSDC: defaults.spentUSDC,
  };
}

function findRepoRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
    if (existsSync(path.join(dir, "pnpm-workspace.yaml"))) return dir;
    dir = path.resolve(dir, "..");
  }
  return process.cwd();
}

function checkBudget(policy: AgentPolicy, amount: number) {
  if (amount > policy.maxAutonomousPurchaseUSDC) {
    return {
      allowed: false,
      reason: "Autonomous spending limit exceeded. Human approval required.",
    };
  }
  if (policy.spentUSDC + amount > policy.totalBudgetUSDC) {
    return {
      allowed: false,
      reason: "Session budget exceeded.",
    };
  }
  return {
    allowed: true,
    remainingAfterPurchase: (policy.totalBudgetUSDC - policy.spentUSDC - amount).toFixed(2),
  };
}

async function payAndPurchase(input: {
  workspace: string;
  commit: string;
  repository: string;
}) {
  const price = Number(ODYSSEY_AUTH_SERVICE.price.amount);
  const policy = loadPolicy(input.workspace);
  const budget = checkBudget(policy, price);
  if (!budget.allowed) {
    return { success: false, ...budget };
  }

  const privateKey = process.env.STELLAR_PRIVATE_KEY;
  if (!privateKey) {
    return {
      success: false,
      reason: "STELLAR_PRIVATE_KEY is not configured for the MCP payer wallet",
    };
  }

  const url = `${API_BASE}${ODYSSEY_AUTH_SERVICE.endpoint}`;
  const signer = createEd25519Signer(privateKey, NETWORK);
  const client = new x402Client().register(
    "stellar:*",
    new ExactStellarScheme(signer, { url: STELLAR_RPC_URL }),
  );
  const httpClient = new x402HTTPClient(client);

  const body = JSON.stringify({
    repository: input.repository,
    commit: input.commit,
    workspace: input.workspace,
    dependency: "odyssey-auth@1.0.0",
  });

  const firstTry = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });

  if (firstTry.status !== 402) {
    const text = await firstTry.text();
    return {
      success: false,
      reason: `Expected HTTP 402 before payment, got ${firstTry.status}: ${text}`,
    };
  }

  const paymentRequired = httpClient.getPaymentRequiredResponse((name) =>
    firstTry.headers.get(name),
  );
  let paymentPayload = await client.createPaymentPayload(paymentRequired);
  const networkPassphrase = getNetworkPassphrase(NETWORK);
  const txXdr = String(paymentPayload.payload.transaction);
  const tx = new Transaction(txXdr, networkPassphrase);
  const sorobanData = tx.toEnvelope().v1()?.tx()?.ext()?.sorobanData();
  if (sorobanData) {
    paymentPayload = {
      ...paymentPayload,
      payload: {
        ...paymentPayload.payload,
        transaction: TransactionBuilder.cloneFrom(tx, {
          fee: "1",
          sorobanData,
          networkPassphrase,
        })
          .build()
          .toXDR(),
      },
    };
  }

  const paymentHeaders = httpClient.encodePaymentSignatureHeader(paymentPayload);
  const paidResponse = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...paymentHeaders,
    },
    body,
  });

  const paidJson = (await paidResponse.json()) as {
    runId?: string;
    transactionHash?: string;
    status?: string;
    error?: string;
  };

  if (!paidResponse.ok) {
    return {
      success: false,
      reason: paidJson.error ?? `Payment request failed with ${paidResponse.status}`,
    };
  }

  return {
    success: true,
    paid: "0.05 USDC",
    runId: paidJson.runId,
    transactionHash: paidJson.transactionHash,
    status: paidJson.status,
    budget: {
      remainingAfterPurchase: budget.remainingAfterPurchase,
    },
  };
}

const server = new Server(
  { name: "oss402-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "oss402_discover",
      description: "Discover official maintainer certification services for a dependency",
      inputSchema: {
        type: "object",
        properties: {
          dependency: { type: "string" },
          version: { type: "string" },
        },
        required: ["dependency"],
      },
    },
    {
      name: "oss402_inspect",
      description: "Inspect price, suite version, and attestation behavior for a certification service",
      inputSchema: {
        type: "object",
        properties: {
          serviceId: { type: "string" },
        },
        required: ["serviceId"],
      },
    },
    {
      name: "oss402_purchase_certification",
      description:
        "Purchase a certification run via x402 on Stellar Testnet. Payment does not imply PASS.",
      inputSchema: {
        type: "object",
        properties: {
          serviceId: { type: "string" },
          workspace: { type: "string" },
          commit: { type: "string" },
          repository: { type: "string" },
        },
        required: ["serviceId", "workspace", "commit"],
      },
    },
    {
      name: "oss402_certification_status",
      description: "Poll certification run status (queued, running, passed, failed)",
      inputSchema: {
        type: "object",
        properties: {
          runId: { type: "string" },
        },
        required: ["runId"],
      },
    },
    {
      name: "oss402_verify_attestation",
      description: "Verify a maintainer attestation and detect stale certifications",
      inputSchema: {
        type: "object",
        properties: {
          attestationId: { type: "string" },
          commit: { type: "string" },
          workspace: { type: "string" },
        },
        required: ["attestationId"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const input = (args ?? {}) as Record<string, string>;

  try {
    if (name === "oss402_discover") {
      const response = await fetch(`${API_BASE}/api/services`);
      const data = await response.json();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }

    if (name === "oss402_inspect") {
      const response = await fetch(`${API_BASE}/api/services/${input.serviceId}`);
      const data = await response.json();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }

    if (name === "oss402_purchase_certification") {
      if (input.serviceId !== ODYSSEY_AUTH_SERVICE.id) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: false, reason: "Unknown serviceId" }),
            },
          ],
        };
      }
      const result = await payAndPurchase({
        workspace: input.workspace,
        commit: input.commit,
        repository: input.repository ?? "github.com/hallzyx/oss402",
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }

    if (name === "oss402_certification_status") {
      const response = await fetch(`${API_BASE}/api/certifications/${input.runId}`);
      const data = await response.json();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }

    if (name === "oss402_verify_attestation") {
      const qs = new URLSearchParams();
      if (input.commit) qs.set("commit", input.commit);
      if (input.workspace) qs.set("workspace", input.workspace);
      const response = await fetch(
        `${API_BASE}/api/attestations/${input.attestationId}?${qs.toString()}`,
      );
      const data = await response.json();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }

    return {
      content: [{ type: "text", text: JSON.stringify({ error: `Unknown tool ${name}` }) }],
      isError: true,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
          }),
        },
      ],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
