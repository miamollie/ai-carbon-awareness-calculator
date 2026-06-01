import type {
  APIGatewayProxyResultV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import { describe, expect, it } from "vitest";
import { handler } from "./health";

function asStructuredResponse(
  response: APIGatewayProxyResultV2,
): APIGatewayProxyStructuredResultV2 {
  if (typeof response === "string") {
    throw new Error("Expected a structured API Gateway response");
  }
  return response;
}

describe("health handler", () => {
  it("returns healthy status payload", async () => {
    const response = asStructuredResponse(await handler());

    expect(response.statusCode).toBe(200);
    expect(response.headers?.["Content-Type"]).toBe("application/json");

    const parsed = JSON.parse(response.body || "{}");
    expect(parsed.status).toBe("ok");
    expect(parsed.service).toBe("carbon-calc");
    expect(Number.isNaN(Date.parse(parsed.timestamp))).toBe(false);
  });
});
