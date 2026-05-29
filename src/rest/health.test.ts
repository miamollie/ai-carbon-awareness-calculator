import { describe, expect, it } from "vitest";
import { handler } from "./health";

describe("health handler", () => {
  it("returns healthy status payload", async () => {
    const response = await handler();

    expect(response.statusCode).toBe(200);
    expect(response.headers?.["Content-Type"]).toBe("application/json");

    const parsed = JSON.parse(response.body || "{}");
    expect(parsed.status).toBe("ok");
    expect(parsed.service).toBe("carbon-calc");
    expect(Number.isNaN(Date.parse(parsed.timestamp))).toBe(false);
  });
});
