import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { describe, expect, it } from "vitest";
import { handler } from "./handler";

function makeEvent(body: string | null): APIGatewayProxyEventV2 {
  return {
    version: "2.0",
    routeKey: "POST /calculate",
    rawPath: "/calculate",
    rawQueryString: "",
    headers: {},
    requestContext: {
      accountId: "123",
      apiId: "api-id",
      domainName: "example.com",
      domainPrefix: "example",
      http: {
        method: "POST",
        path: "/calculate",
        protocol: "HTTP/1.1",
        sourceIp: "127.0.0.1",
        userAgent: "vitest",
      },
      requestId: "req-1",
      routeKey: "POST /calculate",
      stage: "$default",
      time: "01/Jan/2026:00:00:00 +0000",
      timeEpoch: 0,
    },
    isBase64Encoded: false,
    body,
  } as APIGatewayProxyEventV2;
}

describe("rest handler", () => {
  it("returns 400 for invalid json", async () => {
    const response = await handler(makeEvent("{"));

    expect(response.statusCode).toBe(400);
    expect(response.headers?.["Cache-Control"]).toBe("no-cache, no-store");

    const parsed = JSON.parse(response.body || "{}");
    expect(parsed.error).toBe("Invalid JSON body");
  });

  it("returns 400 for invalid schema body", async () => {
    const response = await handler(
      makeEvent(
        JSON.stringify({
          model: "gpt-4o",
          input_tokens: -1,
          output_tokens: 50,
        }),
      ),
    );

    expect(response.statusCode).toBe(400);
    expect(response.headers?.["Cache-Control"]).toBe("no-cache, no-store");

    const parsed = JSON.parse(response.body || "{}");
    expect(parsed.error).toBe("Invalid request body");
    expect(parsed.details.length).toBeGreaterThan(0);
  });

  it("returns 200 with calculated payload for valid request", async () => {
    const response = await handler(
      makeEvent(
        JSON.stringify({
          model: "gpt-4o",
          input_tokens: 1000,
          output_tokens: 500,
        }),
      ),
    );

    expect(response.statusCode).toBe(200);
    expect(response.headers?.["Cache-Control"]).toBe("public, max-age=3600");

    const parsed = JSON.parse(response.body || "{}");
    expect(parsed.model).toBe("gpt-4o");
    expect(parsed.carbon_kg_co2e).toBe(0.00006);
    expect(parsed.equivalencies).toHaveProperty("drivingKm");
  });
});
