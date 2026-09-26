import cors from "cors";
import express from "express";
import { loadRepoEnv } from "./env.js";
import { finalizeCertificationRun } from "./finalize-run.js";

loadRepoEnv();
import { paymentMiddleware } from "@x402/express";
import {
  HTTPFacilitatorClient,
  x402ResourceServer,
  type HTTPTransportContext,
} from "@x402/core/server";
import { ExactStellarScheme } from "@x402/stellar/exact/server";
import { ODYSSEY_AUTH_SERVICE } from "oss402-client";
import { executeCertificationLocally } from "./runner.js";
import {
  getManifest,
  findAttestationForSubject,
  getStats,
  loadStore,
  nextRunId,
  withStore,
} from "./store.js";

const PORT = Number(process.env.PORT ?? 8787);
const NETWORK = "stellar:testnet" as const;
const PRICE = `$${ODYSSEY_AUTH_SERVICE.price.amount}`;
const FACILITATOR_URL =
  process.env.X402_FACILITATOR_URL ?? "https://www.x402.org/facilitator";
const PAY_TO = process.env.MAINTAINER_STELLAR_ADDRESS ?? "";
const CERT_PATH = "/api/certifications/odyssey-auth/v1";
const RUN_LOCALLY = process.env.OSS402_RUN_LOCALLY !== "0";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "oss402-api",
    payToConfigured: Boolean(PAY_TO),
    network: NETWORK,
    price: PRICE,
  });
});

app.get("/.well-known/oss402.json", (_req, res) => {
  res.json(getManifest(PAY_TO || "G_NOT_CONFIGURED"));
});

app.get("/api/services", (req, res) => {
  const dependency = req.query.dependency as string | undefined;
  const services = [
    {
      id: ODYSSEY_AUTH_SERVICE.id,
      type: ODYSSEY_AUTH_SERVICE.type,
      maintainer: ODYSSEY_AUTH_SERVICE.maintainer,
      price: ODYSSEY_AUTH_SERVICE.price,
      network: ODYSSEY_AUTH_SERVICE.network,
      dependency: "odyssey-auth",
      dependencyVersion: "1.0.0",
    },
  ];
  const filtered =
    dependency && dependency !== "odyssey-auth"
      ? []
      : services;
  res.json({ services: filtered });
});

app.get("/api/services/:serviceId", (req, res) => {
  if (req.params.serviceId !== ODYSSEY_AUTH_SERVICE.id) {
    res.status(404).json({ error: "service not found" });
    return;
  }
  res.json({
    dependency: "odyssey-auth@1.0.0",
    suite: "v1",
    official: true,
    price: "0.05 USDC",
    resultType: "PASS_FAIL",
    attestationOnPass: true,
    includesRetry: true,
    note: "0.05 USDC includes the initial certification attempt and 1 remediation retry",
  });
});

app.get("/api/certifications", (_req, res) => {
  const store = loadStore();
  const runs = [...store.runs].reverse().map((run) => {
    const attestation = store.attestations.find((item) => item.runId === run.runId);
    return {
      ...run,
      stellarTx: attestation?.stellarTx,
    };
  });
  res.json({ runs });
});

app.get("/api/certifications/:runId", (req, res) => {
  const store = loadStore();
  const run = store.runs.find((r) => r.runId === req.params.runId);
  if (!run) {
    res.status(404).json({ error: "run not found" });
    return;
  }
  res.json(run);
});

app.get("/api/attestations/:attestationId", (req, res) => {
  const store = loadStore();
  const attestation = store.attestations.find(
    (a) => a.attestationId === req.params.attestationId,
  );
  if (!attestation) {
    res.status(404).json({ error: "attestation not found" });
    return;
  }

  const currentCommit = req.query.commit as string | undefined;
  const currentWorkspace = req.query.workspace as string | undefined;
  const stale =
    (currentCommit && currentCommit !== attestation.commit) ||
    (currentWorkspace && currentWorkspace !== attestation.workspace);

  res.json({
    valid: true,
    stale: Boolean(stale),
    staleReason: stale
      ? "Certification applies to an older commit or different workspace."
      : undefined,
    ...attestation,
  });
});

app.get("/api/stats", (_req, res) => {
  res.json(getStats(loadStore()));
});

app.get("/api/attestations/lookup", (req, res) => {
  const workspace = req.query.workspace as string | undefined;
  const commit = req.query.commit as string | undefined;
  if (!workspace || !commit) {
    res.status(400).json({ error: "workspace and commit are required" });
    return;
  }
  const store = loadStore();
  const attestation = findAttestationForSubject(store, { workspace, commit });
  if (!attestation) {
    res.json({ certified: false, stale: true, reason: "No attestation for this build." });
    return;
  }
  res.json({ certified: true, stale: false, attestationId: attestation.attestationId, attestation });
});

app.get("/api/badge/:attestationId.svg", (req, res) => {
  const store = loadStore();
  const attestation = store.attestations.find(
    (a) => a.attestationId === req.params.attestationId,
  );
  const label = attestation ? "Odyssey Auth" : "OSS402";
  const status = attestation ? "Maintainer Conformant" : "Unknown";
  const color = attestation ? "#0a7a3c" : "#6b7280";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="20" role="img">
  <rect width="250" height="20" fill="#555"/>
  <rect x="90" width="160" height="20" fill="${color}"/>
  <text x="45" y="14" fill="#fff" font-family="Verdana" font-size="11" text-anchor="middle">${label}</text>
  <text x="170" y="14" fill="#fff" font-family="Verdana" font-size="11" text-anchor="middle">${status}</text>
</svg>`;
  res.setHeader("Content-Type", "image/svg+xml");
  res.send(svg);
});

app.post("/api/certifications/:runId/callback", async (req, res) => {
  const secret = process.env.OSS402_CALLBACK_SECRET;
  if (secret && req.headers["x-oss402-callback-secret"] !== secret) {
    res.status(401).json({ error: "invalid callback secret" });
    return;
  }

  const existing = loadStore().runs.find((r) => r.runId === req.params.runId);
  if (!existing) {
    res.status(404).json({ error: "run not found" });
    return;
  }

  if (existing.status === "passed" || existing.status === "failed") {
    res.json(existing);
    return;
  }

  const body = req.body as {
    result?: "PASS" | "FAIL";
    passed?: number;
    failed?: number;
    total?: number;
    report?: { code: string; message: string } | null;
  };

  if (!body.result || body.passed === undefined || body.failed === undefined) {
    res.status(400).json({ error: "result, passed, and failed are required" });
    return;
  }

  const run = await withStore(async (store) => {
    const current = store.runs.find((r) => r.runId === req.params.runId);
    if (!current) {
      return undefined;
    }
    current.status = "running";
    await finalizeCertificationRun(store, current, {
      result: body.result!,
      passed: body.passed!,
      failed: body.failed!,
      total: body.total ?? body.passed! + body.failed!,
      report: body.report ?? undefined,
    });
    return current;
  });

  res.json(run);
});

if (!PAY_TO) {
  console.warn(
    "[oss402-api] MAINTAINER_STELLAR_ADDRESS is not set. Protected certification route will return 503 until configured.",
  );
  app.post(CERT_PATH, (_req, res) => {
    res.status(503).json({
      error: "Maintainer Stellar address not configured",
      hint: "Set MAINTAINER_STELLAR_ADDRESS to a testnet G... address with a USDC trustline",
    });
  });
} else {
  const facilitatorClient = new HTTPFacilitatorClient({
    url: FACILITATOR_URL,
    createAuthHeaders: process.env.X402_FACILITATOR_API_KEY
      ? async () => {
          const headers = {
            Authorization: `Bearer ${process.env.X402_FACILITATOR_API_KEY}`,
          };
          return { verify: headers, settle: headers, supported: headers };
        }
      : undefined,
  });

  const resourceServer = new x402ResourceServer(facilitatorClient);
  resourceServer.register(NETWORK, new ExactStellarScheme());
  resourceServer.onAfterSettle(async (context) => {
    const tx = context.result.transaction;
    if (!context.result.success || !tx) {
      return;
    }
    const transport = context.transportContext as HTTPTransportContext | undefined;
    const bodyText = transport?.responseBody?.toString("utf8");
    if (!bodyText) {
      return;
    }
    let runId: string | undefined;
    try {
      const body = JSON.parse(bodyText) as { runId?: string };
      runId = body.runId;
    } catch {
      return;
    }
    if (!runId) {
      return;
    }
    await withStore((store) => {
      const run = store.runs.find((r) => r.runId === runId);
      if (!run) {
        return;
      }
      run.paymentTx = tx;
    });
  });

  app.use(
    paymentMiddleware(
      {
        [`POST ${CERT_PATH}`]: {
          accepts: {
            scheme: "exact",
            price: PRICE,
            network: NETWORK,
            payTo: PAY_TO,
          },
          description:
            "Official Odyssey Auth Conformance v1 certification run (includes 1 remediation retry)",
        },
      },
      resourceServer,
    ),
  );

  app.post(CERT_PATH, async (req, res) => {
    const body = req.body as {
      repository?: string;
      commit?: string;
      workspace?: string;
      dependency?: string;
    };

    if (!body.repository || !body.commit || !body.workspace) {
      res.status(400).json({
        error: "repository, commit, and workspace are required",
      });
      return;
    }

    const runId = await withStore((store) => {
      const id = nextRunId(store);
      store.runs.push({
        runId: id,
        status: "queued",
        repository: body.repository!,
        commit: body.commit!,
        workspace: body.workspace!,
        dependency: body.dependency ?? "odyssey-auth@1.0.0",
        suiteVersion: "v1",
        paid: "0.05 USDC",
        paymentTx: "pending-x402-settlement",
        createdAt: new Date().toISOString(),
      });
      store.revenueUSDC += 0.05;
      return id;
    });

    if (RUN_LOCALLY) {
      void executeCertificationLocally(runId).catch(async (error) => {
        console.error(`[oss402-api] certification ${runId} failed`, error);
        await withStore((latest) => {
          const run = latest.runs.find((r) => r.runId === runId);
          if (run && run.status === "running") {
            run.status = "failed";
            run.report = {
              code: "RUNNER-ERROR",
              message: error instanceof Error ? error.message : String(error),
            };
          }
        });
      });
    } else if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPOSITORY) {
      await dispatchGithubWorkflow({
        runId,
        workspace: body.workspace,
        commit: body.commit,
      });
    }

    res.status(200).json({
      runId,
      status: "queued",
      paid: "0.05 USDC",
    });
  });
}

async function dispatchGithubWorkflow(input: {
  runId: string;
  workspace: string;
  commit: string;
}) {
  const [owner, repo] = (process.env.GITHUB_REPOSITORY ?? "").split("/");
  const token = process.env.GITHUB_TOKEN;
  if (!owner || !repo || !token) return;

  await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/oss402-certification.yml/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        ref: process.env.GITHUB_REF_NAME ?? "main",
        inputs: {
          workspace: input.workspace,
          commit: input.commit,
          suiteVersion: "v1",
          certificationRunId: input.runId,
          callbackUrl: process.env.OSS402_CALLBACK_URL ?? "",
        },
      }),
    },
  );
}

app.listen(PORT, () => {
  console.log(`oss402-api listening on http://127.0.0.1:${PORT}`);
  console.log(`manifest: http://127.0.0.1:${PORT}/.well-known/oss402.json`);
  console.log(`certification: POST http://127.0.0.1:${PORT}${CERT_PATH}`);
});
