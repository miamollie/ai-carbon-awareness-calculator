import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createSessionToken,
  decodeSessionToken,
  getActiveSessionCount,
  getSession,
  hasSessionCapacity,
  headerValue,
  isValidSessionToken,
  MAX_ACTIVE_SESSIONS,
  registerSession,
  removeSession,
  sessions,
  SESSION_TTL_SECONDS,
} from "./sessions";

describe("mcp sessions", () => {
  afterEach(() => {
    vi.useRealTimers();
    sessions.clear();
  });

  it("creates a valid, decodable token", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const token = createSessionToken();
    const claims = decodeSessionToken(token);

    expect(claims).not.toBeNull();
    expect(claims?.sid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect((claims?.exp ?? 0) - (claims?.iat ?? 0)).toBe(SESSION_TTL_SECONDS);
    expect(isValidSessionToken(token)).toBe(true);
  });

  it("rejects malformed and tampered tokens", () => {
    const token = createSessionToken();
    const parts = token.split(".");
    const tampered = `${parts[0]}.${parts[1]}.bad-signature`;

    expect(decodeSessionToken("not-a-jwt")).toBeNull();
    expect(decodeSessionToken(tampered)).toBeNull();
  });

  it("expires tokens based on ttl", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const token = createSessionToken();
    expect(isValidSessionToken(token)).toBe(true);

    vi.setSystemTime(new Date("2026-01-01T01:00:01.000Z"));
    expect(isValidSessionToken(token)).toBe(false);
  });

  it("registers and fetches active sessions", () => {
    const token = createSessionToken();
    const session = { transport: {} as any, server: {} as any };

    registerSession(token, session as any);

    expect(getSession(token)).toEqual(session);
    expect(getActiveSessionCount()).toBe(1);

    removeSession(token);
    expect(getSession(token)).toBeUndefined();
  });

  it("cleans up expired sessions before capacity checks", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const token = createSessionToken();
    registerSession(token, { transport: {} as any, server: {} as any } as any);
    expect(getActiveSessionCount()).toBe(1);

    vi.setSystemTime(new Date("2026-01-01T01:00:01.000Z"));
    expect(hasSessionCapacity()).toBe(true);
    expect(getActiveSessionCount()).toBe(0);
  });

  it("returns first header value for array headers", () => {
    expect(headerValue("single")).toBe("single");
    expect(headerValue(["first", "second"])).toBe("first");
    expect(headerValue(undefined)).toBeUndefined();
  });

  it("reports capacity under max active sessions", () => {
    for (let i = 0; i < MAX_ACTIVE_SESSIONS - 1; i += 1) {
      const token = createSessionToken();
      registerSession(token, { transport: {} as any, server: {} as any } as any);
    }

    expect(hasSessionCapacity()).toBe(true);
  });
});
