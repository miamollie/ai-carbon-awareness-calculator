import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp";

type Session = {
  transport: StreamableHTTPServerTransport;
  server: McpServer;
};

type SessionClaims = {
  sid: string;
  iat: number;
  exp: number;
};

export const MAX_ACTIVE_SESSIONS = 25;
export const SESSION_TTL_SECONDS = 60 * 60;
export const SESSION_ID_HEADER = "mcp-session-id";

const SESSION_JWT_SECRET =
  process.env.MCP_SESSION_JWT_SECRET || "carbon-calc-demo-session-secret";

export const sessions = new Map<string, Session>();

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function signSessionToken(claims: SessionClaims): string {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(claims));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", SESSION_JWT_SECRET)
    .update(signingInput)
    .digest("base64url");
  return `${signingInput}.${signature}`;
}

export function createSessionToken(): string {
  const now = Math.floor(Date.now() / 1000);
  return signSessionToken({
    sid: randomUUID(),
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  });
}

export function decodeSessionToken(token: string): SessionClaims | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const [encodedHeader, encodedPayload, signature] = parts;
    const header = JSON.parse(base64UrlDecode(encodedHeader)) as {
      alg?: string;
      typ?: string;
    };
    if (header.alg !== "HS256" || header.typ !== "JWT") {
      return null;
    }

    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = createHmac("sha256", SESSION_JWT_SECRET)
      .update(signingInput)
      .digest();
    const actualSignature = Buffer.from(signature, "base64url");
    if (
      expectedSignature.length !== actualSignature.length ||
      !timingSafeEqual(expectedSignature, actualSignature)
    ) {
      return null;
    }

    const claims = JSON.parse(
      base64UrlDecode(encodedPayload),
    ) as Partial<SessionClaims>;
    if (
      typeof claims.sid !== "string" ||
      typeof claims.iat !== "number" ||
      typeof claims.exp !== "number"
    ) {
      return null;
    }

    if (Math.floor(Date.now() / 1000) >= claims.exp) {
      return null;
    }

    return claims as SessionClaims;
  } catch {
    return null;
  }
}

export function isValidSessionToken(token: string): boolean {
  return decodeSessionToken(token) !== null;
}

function cleanupExpiredSessions(): void {
  for (const [sessionToken] of sessions.entries()) {
    if (!isValidSessionToken(sessionToken)) {
      sessions.delete(sessionToken);
    }
  }
}

export function hasSessionCapacity(): boolean {
  cleanupExpiredSessions();
  return sessions.size < MAX_ACTIVE_SESSIONS;
}

export function getActiveSessionCount(): number {
  cleanupExpiredSessions();
  return sessions.size;
}

export function registerSession(sessionToken: string, session: Session): void {
  sessions.set(sessionToken, session);
}

export function getSession(sessionToken: string): Session | undefined {
  cleanupExpiredSessions();
  if (!isValidSessionToken(sessionToken)) {
    return undefined;
  }
  return sessions.get(sessionToken);
}

export function removeSession(sessionToken: string): void {
  sessions.delete(sessionToken);
}

export function headerValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
