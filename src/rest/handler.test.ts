import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import { describe, expect, it } from "vitest";
import { handler } from "./handler";

function asStructuredResponse(
  response: APIGatewayProxyResultV2,
): APIGatewayProxyStructuredResultV2 {
  if (typeof response === "string") {
    throw new Error("Expected a structured API Gateway response");
  }
  return response;
}

function makeEvent(body: string | null): APIGatewayProxyEventV2 {
  return {
    version: "2.0",
    routeKey: "POST /energy",
    rawPath: "/energy",
    rawQueryString: "",
    headers: {},
    requestContext: {
      accountId: "123",
      apiId: "api-id",
      domainName: "example.com",
      domainPrefix: "example",
      http: {
        method: "POST",
        path: "/energy",
        protocol: "HTTP/1.1",
        sourceIp: "127.0.0.1",
        userAgent: "vitest",
      },
      requestId: "req-1",
      routeKey: "POST /energy",
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
    const response = asStructuredResponse(await handler(makeEvent("{")));

    expect(response.statusCode).toBe(400);
    expect(response.headers?.["Cache-Control"]).toBe("no-cache, no-store");

    const parsed = JSON.parse(response.body || "{}");
    expect(parsed.error).toBe("Invalid JSON body");
  });

  it("returns 400 for invalid schema body", async () => {
    const response = asStructuredResponse(
      await handler(
        makeEvent(
          JSON.stringify({
            model: "gpt-4o",
            input_tokens: -1,
            output_tokens: 50,
          }),
        ),
      ),
    );

    expect(response.statusCode).toBe(400);
    expect(response.headers?.["Cache-Control"]).toBe("no-cache, no-store");

    const parsed = JSON.parse(response.body || "{}");
    expect(parsed.error).toBe("Invalid request body");
    expect(parsed.details.length).toBeGreaterThan(0);
  });

  it("returns 200 with calculated payload for valid request", async () => {
    const response = asStructuredResponse(
      await handler(
        makeEvent(
          JSON.stringify({
            model: "gpt-4o",
            input_tokens: 1000,
            output_tokens: 500,
          }),
        ),
      ),
    );

    expect(response.statusCode).toBe(200);
    expect(response.headers?.["Cache-Control"]).toBe("public, max-age=3600");

    const parsed = JSON.parse(response.body || "{}");
    expect(parsed.model).toBe("gpt-4o");
    expect(parsed.energy_wh).toBe(0.6);
    expect(parsed.impact_level).toBe("moderate");
    expect(parsed.carbon_kg_co2e_range.low).toBe(0.00003);
    expect(parsed.carbon_kg_co2e_range.high).toBe(0.00042);
    expect(parsed.equivalencies).toHaveProperty("evMilesDriven");
    expect(parsed.equivalencies).toHaveProperty("iphoneCharges");
    expect(parsed.methodology.source_type).toBe("estimated");
  });
});
