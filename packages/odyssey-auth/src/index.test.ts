import { describe, expect, it } from "vitest";
import { odysseyAuth } from "./index.js";

describe("odyssey-auth", () => {
  it("accepts a valid token", async () => {
    const auth = odysseyAuth({ issuer: "oss402-demo", rejectExpiredTokens: true });
    const token = await auth.issueToken({ subject: "alice", role: "user" });
    const result = await auth.verifyToken(token);
    expect(result.ok).toBe(true);
  });

  it("rejects expired tokens when configured", async () => {
    const auth = odysseyAuth({ issuer: "oss402-demo", rejectExpiredTokens: true });
    const token = await auth.issueExpiredToken({ subject: "alice", role: "user" });
    const result = await auth.verifyToken(token);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("AUTH-005");
  });

  it("accepts expired tokens when rejectExpiredTokens is false", async () => {
    const auth = odysseyAuth({ issuer: "oss402-demo", rejectExpiredTokens: false });
    const token = await auth.issueExpiredToken({ subject: "alice", role: "user" });
    const result = await auth.verifyToken(token);
    expect(result.ok).toBe(true);
  });
});
