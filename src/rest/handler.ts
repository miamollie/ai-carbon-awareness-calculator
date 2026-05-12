import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { calculate } from "../calculator";
import { carbonRequestSchema } from "../schemas/carbon";

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  const payload = parseBody(event);
  if (!payload) {
    return jsonResponse(400, {
      error: "Invalid JSON body",
      example: { model: "sonnet", input_tokens: 50000, output_tokens: 25000 },
    });
  }

  const parsedPayload = carbonRequestSchema.safeParse(payload);
  if (!parsedPayload.success) {
    return jsonResponse(400, {
      error: "Invalid request body",
      details: parsedPayload.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  return jsonResponse(200, calculate(parsedPayload.data));
};

// Ensure errors are not cached by API Gateway, but successful responses can be cached for 1 hour
function jsonResponse(
  statusCode: number,
  payload: unknown,
): APIGatewayProxyResultV2 {
  const cacheControl =
    statusCode === 200 ? "public, max-age=3600" : "no-cache, no-store";
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": cacheControl,
    },
    body: JSON.stringify(payload),
  };
}

function parseBody(event: APIGatewayProxyEventV2): unknown | null {
  if (!event.body) {
    return null;
  }
  try {
    return JSON.parse(event.body);
  } catch {
    return null;
  }
}
