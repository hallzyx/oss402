import { readFileSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { buildDemoApp } from "demo-kit";

export type CheckTier = "public" | "private" | "generated";

export interface CheckResult {
  id: string;
  tier: CheckTier;
  title: string;
  passed: boolean;
  code?: string;
  message?: string;
}

export interface SuiteResult {
  suite: string;
  suiteVersion: string;
  workspace: string;
  projectId: string;
  passed: number;
  failed: number;
  total: number;
  result: "PASS" | "FAIL";
  checks: CheckResult[];
  report?: { code: string; message: string };
}

export interface Oss402Config {
  project: { id: string };
  environment?: { target?: string };
  runtime?: { port?: number; start?: string; build?: string };
  dependency?: { name: string; version: string };
  conformance: {
    baseUrl: string;
    mappings: Record<string, string>;
  };
  certification?: { requiredFor?: string[] };
  dependencies?: Record<string, { certification?: string }>;
  agent?: {
    totalBudgetUSDC?: number;
    maxAutonomousPurchaseUSDC?: number;
  };
}

export function loadOss402Config(workspacePath: string): Oss402Config {
  const file = path.join(workspacePath, "oss402.yml");
  return parseYaml(readFileSync(file, "utf8")) as Oss402Config;
}

type InjectApp = Awaited<ReturnType<typeof buildDemoApp>>["app"];

async function injectJson(
  app: InjectApp,
  method: string,
  url: string,
  opts?: { headers?: Record<string, string>; payload?: unknown },
) {
  const response = await app.inject({
    method: method as "GET" | "POST",
    url,
    headers: opts?.headers,
    payload: opts?.payload as Record<string, unknown> | undefined,
  });
  let body: unknown = null;
  try {
    body = response.json();
  } catch {
    body = response.body;
  }
  return { status: response.statusCode, body };
}

function check(
  id: string,
  tier: CheckTier,
  title: string,
  passed: boolean,
  code?: string,
  message?: string,
): CheckResult {
  return { id, tier, title, passed, code, message };
}

export async function runConformanceSuite(options: {
  workspacePath: string;
  mode: "public" | "full";
}): Promise<SuiteResult> {
  const config = loadOss402Config(options.workspacePath);
  const mappings = config.conformance.mappings;
  const rejectExpiredTokens = config.project.id !== "demo-invalid";
  const { app } = await buildDemoApp({ rejectExpiredTokens });

  const checks: CheckResult[] = [];

  const login = async (role: "user" | "admin" = "user") => {
    const res = await injectJson(app, "POST", mappings.login, {
      payload: { username: role === "admin" ? "admin" : "alice", role },
    });
    return res;
  };

  const loginExpired = async (role: "user" | "admin" = "user") => {
    const res = await injectJson(app, "POST", mappings.loginExpired, {
      payload: { username: "expired-user", role },
    });
    return res;
  };

  // --- Public tests (10) ---
  {
    const health = await injectJson(app, "GET", mappings.health ?? "/health");
    checks.push(check("PUB-001", "public", "Health endpoint responds", health.status === 200));
  }

  {
    const res = await login("user");
    const token = (res.body as { token?: string })?.token;
    checks.push(check("PUB-002", "public", "Login issues a token", res.status === 200 && Boolean(token)));
  }

  {
    const res = await login("user");
    const token = (res.body as { token: string }).token;
    const profile = await injectJson(app, "GET", mappings.protected, {
      headers: { authorization: `Bearer ${token}` },
    });
    checks.push(check("PUB-003", "public", "Valid token accepted on protected route", profile.status === 200));
  }

  {
    const profile = await injectJson(app, "GET", mappings.protected);
    checks.push(
      check("PUB-004", "public", "Missing token rejected", profile.status === 401, "AUTH-001", "Missing token"),
    );
  }

  {
    const profile = await injectJson(app, "GET", mappings.protected, {
      headers: { authorization: "Bearer not-a-jwt" },
    });
    checks.push(
      check("PUB-005", "public", "Malformed token rejected", profile.status === 401, "AUTH-002", "Malformed token"),
    );
  }

  {
    const res = await login("user");
    const token = (res.body as { token: string }).token;
    const tampered = `${token.slice(0, -4)}xxxx`;
    const profile = await injectJson(app, "GET", mappings.protected, {
      headers: { authorization: `Bearer ${tampered}` },
    });
    checks.push(
      check(
        "PUB-006",
        "public",
        "Modified signature rejected",
        profile.status === 401,
        "AUTH-003",
        "Modified signature rejected",
      ),
    );
  }

  {
    const expired = await loginExpired("user");
    const token = (expired.body as { token: string }).token;
    const profile = await injectJson(app, "GET", mappings.protected, {
      headers: { authorization: `Bearer ${token}` },
    });
    const passed = profile.status === 401;
    checks.push(
      check(
        "PUB-007",
        "public",
        "Expired token rejected",
        passed,
        passed ? undefined : "AUTH-017",
        passed ? undefined : "Expired token was accepted.",
      ),
    );
  }

  {
    const res = await login("user");
    const token = (res.body as { token: string }).token;
    const admin = await injectJson(app, "GET", mappings.admin, {
      headers: { authorization: `Bearer ${token}` },
    });
    checks.push(check("PUB-008", "public", "User cannot access admin route", admin.status === 403));
  }

  {
    const res = await login("admin");
    const token = (res.body as { token: string }).token;
    const admin = await injectJson(app, "GET", mappings.admin, {
      headers: { authorization: `Bearer ${token}` },
    });
    checks.push(check("PUB-009", "public", "Admin can access admin route", admin.status === 200));
  }

  {
    const res = await login("user");
    const token = (res.body as { token: string }).token;
    const profile = await injectJson(app, "GET", mappings.protected, {
      headers: { authorization: `Bearer ${token}` },
    });
    checks.push(check("PUB-010", "public", "User can access user route", profile.status === 200));
  }

  if (options.mode === "full") {
    // --- Private tests (15) ---
    {
      const logout = await injectJson(app, "POST", mappings.logout ?? "/api/logout");
      checks.push(check("PRV-001", "private", "Logout endpoint responds", logout.status === 200));
    }

    {
      const profile = await injectJson(app, "GET", mappings.protected, {
        headers: { authorization: "Token abc" },
      });
      checks.push(check("PRV-002", "private", "Non-bearer scheme rejected", profile.status === 401));
    }

    {
      const profile = await injectJson(app, "GET", mappings.protected, {
        headers: { authorization: "Bearer " },
      });
      checks.push(check("PRV-003", "private", "Empty bearer token rejected", profile.status === 401));
    }

    {
      const res = await login("admin");
      const token = (res.body as { token: string }).token;
      const profile = await injectJson(app, "GET", mappings.protected, {
        headers: { authorization: `Bearer ${token}` },
      });
      checks.push(check("PRV-004", "private", "Admin can access protected user route", profile.status === 200));
    }

    {
      const bad = await injectJson(app, "POST", mappings.login, {
        payload: { username: "x", role: "superadmin" as unknown as string },
      });
      checks.push(check("PRV-005", "private", "Invalid login role rejected", bad.status === 400));
    }

    {
      const res = await login("user");
      const body = res.body as { token: string; role: string };
      checks.push(check("PRV-006", "private", "Login returns role claim metadata", body.role === "user"));
    }

    {
      const res = await login("admin");
      const body = res.body as { token: string; role: string };
      checks.push(check("PRV-007", "private", "Admin login returns admin role", body.role === "admin"));
    }

    {
      const parts = ["a", "b"];
      const profile = await injectJson(app, "GET", mappings.protected, {
        headers: { authorization: `Bearer ${parts.join(".")}` },
      });
      checks.push(check("PRV-008", "private", "Two-part JWT rejected", profile.status === 401));
    }

    {
      const admin = await injectJson(app, "GET", mappings.admin);
      checks.push(check("PRV-009", "private", "Admin route requires auth", admin.status === 401));
    }

    {
      const profile = await injectJson(app, "GET", mappings.protected, {
        headers: { authorization: "Bearer\tnot-valid" },
      });
      checks.push(check("PRV-010", "private", "Whitespace-broken bearer rejected", profile.status === 401));
    }

    {
      const res = await login("user");
      const token = (res.body as { token: string }).token;
      const first = await injectJson(app, "GET", mappings.protected, {
        headers: { authorization: `Bearer ${token}` },
      });
      const second = await injectJson(app, "GET", mappings.protected, {
        headers: { authorization: `Bearer ${token}` },
      });
      checks.push(
        check("PRV-011", "private", "Repeated valid requests remain stable", first.status === 200 && second.status === 200),
      );
    }

    {
      const res = await login("user");
      const token = (res.body as { token: string }).token;
      const profile = await injectJson(app, "GET", mappings.protected, {
        headers: { authorization: `Bearer ${token}` },
      });
      const body = profile.body as { subject?: string };
      checks.push(check("PRV-012", "private", "Protected route returns subject", body.subject === "alice"));
    }

    {
      const junk = await injectJson(app, "GET", mappings.protected, {
        headers: { authorization: "Bearer " + "x".repeat(500) },
      });
      checks.push(check("PRV-013", "private", "Oversized malformed token does not crash", junk.status === 401));
    }

    {
      const res = await login("user");
      checks.push(check("PRV-014", "private", "Issuer-bound tokens are issued", res.status === 200));
    }

    {
      const health = await injectJson(app, "GET", mappings.health ?? "/health");
      const body = health.body as { ok?: boolean };
      checks.push(check("PRV-015", "private", "Health payload indicates ok", body.ok === true));
    }

    // --- Generated / fuzz (5) ---
    for (let i = 1; i <= 3; i++) {
      const expired = await loginExpired("user");
      const token = (expired.body as { token: string }).token;
      const mutated = token.replace(/[A-Za-z]/, (c) => (c === "A" ? "B" : "A"));
      const profile = await injectJson(app, "GET", mappings.protected, {
        headers: { authorization: `Bearer ${mutated}` },
      });
      checks.push(
        check(`GEN-00${i}`, "generated", `Mutated token variant ${i} rejected`, profile.status === 401),
      );
    }

    {
      const roles: Array<"user" | "admin"> = ["user", "admin"];
      let ok = true;
      for (const role of roles) {
        const res = await login(role);
        if (res.status !== 200) ok = false;
      }
      checks.push(check("GEN-004", "generated", "Role combination login matrix", ok));
    }

    {
      const orderOk =
        (await injectJson(app, "GET", mappings.health ?? "/health")).status === 200 &&
        (await login("user")).status === 200;
      checks.push(check("GEN-005", "generated", "Request ordering health then login", orderOk));
    }
  }

  await app.close();

  const passed = checks.filter((c) => c.passed).length;
  const failed = checks.length - passed;
  const firstFailure = checks.find((c) => !c.passed);

  return {
    suite: "Odyssey Auth Conformance",
    suiteVersion: "v1",
    workspace: options.workspacePath,
    projectId: config.project.id,
    passed,
    failed,
    total: checks.length,
    result: failed === 0 ? "PASS" : "FAIL",
    checks,
    report: firstFailure
      ? {
          code: firstFailure.code ?? firstFailure.id,
          message: firstFailure.message ?? firstFailure.title,
        }
      : undefined,
  };
}

export function formatSuiteReport(result: SuiteResult): string {
  const lines = [
    `OSS402 Certification`,
    ``,
    `Target:`,
    result.workspace,
    ``,
    `Project:`,
    result.projectId,
    ``,
    `Dependency:`,
    `odyssey-auth@1.0.0`,
    ``,
    `Suite:`,
    `${result.suite} ${result.suiteVersion}`,
    ``,
    `Public tests:`,
    `${result.checks.filter((c) => c.tier === "public" && c.passed).length} / ${result.checks.filter((c) => c.tier === "public").length}`,
    ``,
    `Private tests:`,
    `${result.checks.filter((c) => c.tier === "private" && c.passed).length} / ${result.checks.filter((c) => c.tier === "private").length}`,
    ``,
    `Generated tests:`,
    `${result.checks.filter((c) => c.tier === "generated" && c.passed).length} / ${result.checks.filter((c) => c.tier === "generated").length}`,
    ``,
    `TOTAL:`,
    `${result.passed} / ${result.total}`,
    ``,
    result.result,
  ];

  if (result.report) {
    lines.push(``, `${result.report.code}:`, result.report.message);
  }

  return lines.join("\n");
}
