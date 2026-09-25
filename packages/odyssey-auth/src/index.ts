import { SignJWT, jwtVerify, errors as JoseErrors } from "jose";

export type Role = "user" | "admin";

export interface OdysseyAuthOptions {
  issuer: string;
  secret?: string;
  rejectExpiredTokens?: boolean;
  enforceRoles?: boolean;
  productionMode?: boolean;
}

export interface TokenClaims {
  sub: string;
  role: Role;
  iss: string;
  exp?: number;
  iat?: number;
}

export interface AuthResult {
  ok: true;
  claims: TokenClaims;
}

export interface AuthFailure {
  ok: false;
  code: string;
  message: string;
  status: number;
}

export type AuthCheck = AuthResult | AuthFailure;

const encoder = new TextEncoder();

function secretKey(secret: string) {
  return encoder.encode(secret);
}

export function odysseyAuth(options: OdysseyAuthOptions) {
  const {
    issuer,
    secret = "oss402-demo-secret",
    rejectExpiredTokens = true,
    enforceRoles = true,
    productionMode = false,
  } = options;

  if (productionMode) {
    if (!rejectExpiredTokens) {
      throw new Error("Insecure configuration: rejectExpiredTokens must be true in production mode");
    }
    if (!enforceRoles) {
      throw new Error("Insecure configuration: enforceRoles must be true in production mode");
    }
    if (!issuer) {
      throw new Error("Insecure configuration: issuer is required in production mode");
    }
  }

  async function issueToken(input: {
    subject: string;
    role: Role;
    expiresInSeconds?: number;
  }): Promise<string> {
    const expiresInSeconds = input.expiresInSeconds ?? 3600;
    return new SignJWT({ role: input.role })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(input.subject)
      .setIssuer(issuer)
      .setIssuedAt()
      .setExpirationTime(`${expiresInSeconds}s`)
      .sign(secretKey(secret));
  }

  async function issueExpiredToken(input: {
    subject: string;
    role: Role;
  }): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    return new SignJWT({ role: input.role })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(input.subject)
      .setIssuer(issuer)
      .setIssuedAt(now - 7200)
      .setExpirationTime(now - 3600)
      .sign(secretKey(secret));
  }

  async function verifyToken(token: string): Promise<AuthCheck> {
    if (!token || typeof token !== "string") {
      return {
        ok: false,
        code: "AUTH-001",
        message: "Missing token",
        status: 401,
      };
    }

    try {
      const { payload } = await jwtVerify(token, secretKey(secret), {
        issuer,
        clockTolerance: rejectExpiredTokens ? 0 : Number.MAX_SAFE_INTEGER,
      });

      const role = payload.role as Role | undefined;
      if (!role || (role !== "user" && role !== "admin")) {
        return {
          ok: false,
          code: "AUTH-004",
          message: "Invalid role claim",
          status: 401,
        };
      }

      return {
        ok: true,
        claims: {
          sub: String(payload.sub),
          role,
          iss: String(payload.iss),
          exp: payload.exp,
          iat: payload.iat,
        },
      };
    } catch (error) {
      if (error instanceof JoseErrors.JWTExpired) {
        if (!rejectExpiredTokens) {
          // Intentionally insecure path used by demo-invalid.
          try {
            const { payload } = await jwtVerify(token, secretKey(secret), {
              issuer,
              clockTolerance: Number.MAX_SAFE_INTEGER,
            });
            const role = payload.role as Role;
            return {
              ok: true,
              claims: {
                sub: String(payload.sub),
                role,
                iss: String(payload.iss),
                exp: payload.exp,
                iat: payload.iat,
              },
            };
          } catch {
            return {
              ok: false,
              code: "AUTH-002",
              message: "Malformed token",
              status: 401,
            };
          }
        }
        return {
          ok: false,
          code: "AUTH-005",
          message: "Expired token rejected",
          status: 401,
        };
      }

      if (error instanceof JoseErrors.JWSSignatureVerificationFailed) {
        return {
          ok: false,
          code: "AUTH-003",
          message: "Modified signature rejected",
          status: 401,
        };
      }

      return {
        ok: false,
        code: "AUTH-002",
        message: "Malformed token",
        status: 401,
      };
    }
  }

  function requireRole(claims: TokenClaims, allowed: Role[]): AuthCheck {
    if (!enforceRoles) {
      return { ok: true, claims };
    }
    if (!allowed.includes(claims.role)) {
      return {
        ok: false,
        code: "AUTH-010",
        message: "Insufficient role",
        status: 403,
      };
    }
    return { ok: true, claims };
  }

  function parseAuthorizationHeader(header: string | undefined | null): string | null {
    if (!header) return null;
    const [scheme, token] = header.split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !token) return null;
    return token;
  }

  async function authenticateRequest(header: string | undefined | null): Promise<AuthCheck> {
    const token = parseAuthorizationHeader(header);
    if (!token) {
      return {
        ok: false,
        code: "AUTH-001",
        message: "Missing token",
        status: 401,
      };
    }
    return verifyToken(token);
  }

  return {
    options: {
      issuer,
      rejectExpiredTokens,
      enforceRoles,
      productionMode,
    },
    issueToken,
    issueExpiredToken,
    verifyToken,
    requireRole,
    authenticateRequest,
    parseAuthorizationHeader,
  };
}

export type OdysseyAuth = ReturnType<typeof odysseyAuth>;
