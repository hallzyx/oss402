import { describe, expect, it } from "vitest";
import { buildDemoApp } from "demo-kit";

describe("demo-invalid unit tests", () => {
  it("logs in and reaches the profile route", async () => {
    const { app } = await buildDemoApp({ rejectExpiredTokens: false });
    const login = await app.inject({
      method: "POST",
      url: "/api/login",
      payload: { username: "alice", role: "user" },
    });
    expect(login.statusCode).toBe(200);
    const { token } = login.json() as { token: string };

    const profile = await app.inject({
      method: "GET",
      url: "/api/profile",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(profile.statusCode).toBe(200);
    await app.close();
  });

  it("rejects a user on the admin route", async () => {
    const { app } = await buildDemoApp({ rejectExpiredTokens: false });
    const login = await app.inject({
      method: "POST",
      url: "/api/login",
      payload: { username: "bob", role: "user" },
    });
    const { token } = login.json() as { token: string };
    const admin = await app.inject({
      method: "GET",
      url: "/api/admin",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(admin.statusCode).toBe(403);
    await app.close();
  });

  it("builds and health-checks", async () => {
    const { app } = await buildDemoApp({ rejectExpiredTokens: false });
    const health = await app.inject({ method: "GET", url: "/health" });
    expect(health.statusCode).toBe(200);
    await app.close();
  });
});
