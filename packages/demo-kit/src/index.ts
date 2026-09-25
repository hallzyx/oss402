import Fastify from "fastify";
import { odysseyAuth, type Role } from "odyssey-auth";

export interface DemoAppOptions {
  rejectExpiredTokens: boolean;
  port?: number;
  host?: string;
}

export async function buildDemoApp(options: DemoAppOptions) {
  const auth = odysseyAuth({
    issuer: "oss402-demo",
    rejectExpiredTokens: options.rejectExpiredTokens,
    enforceRoles: true,
  });

  const app = Fastify({ logger: false });

  app.get("/health", async () => ({ ok: true }));

  app.post<{
    Body: { username?: string; role?: Role };
  }>("/api/login", async (request, reply) => {
    const username = request.body?.username ?? "alice";
    const role = request.body?.role ?? "user";
    if (role !== "user" && role !== "admin") {
      return reply.code(400).send({ error: "invalid role" });
    }
    const token = await auth.issueToken({ subject: username, role });
    return { token, role, username };
  });

  app.post<{
    Body: { username?: string; role?: Role };
  }>("/api/login-expired", async (request, reply) => {
    const username = request.body?.username ?? "alice";
    const role = request.body?.role ?? "user";
    if (role !== "user" && role !== "admin") {
      return reply.code(400).send({ error: "invalid role" });
    }
    const token = await auth.issueExpiredToken({ subject: username, role });
    return { token, role, username, expired: true };
  });

  app.get("/api/profile", async (request, reply) => {
    const result = await auth.authenticateRequest(request.headers.authorization);
    if (!result.ok) {
      return reply.code(result.status).send({ error: result.message, code: result.code });
    }
    return { subject: result.claims.sub, role: result.claims.role };
  });

  app.get("/api/admin", async (request, reply) => {
    const result = await auth.authenticateRequest(request.headers.authorization);
    if (!result.ok) {
      return reply.code(result.status).send({ error: result.message, code: result.code });
    }
    const roleCheck = auth.requireRole(result.claims, ["admin"]);
    if (!roleCheck.ok) {
      return reply.code(roleCheck.status).send({ error: roleCheck.message, code: roleCheck.code });
    }
    return { admin: true, subject: result.claims.sub };
  });

  app.post("/api/logout", async () => ({ revoked: true }));

  return { app, auth };
}

export async function startDemoApp(options: DemoAppOptions) {
  const { app, auth } = await buildDemoApp(options);
  const address = await app.listen({
    port: options.port ?? 3000,
    host: options.host ?? "127.0.0.1",
  });
  return { app, auth, address };
}
