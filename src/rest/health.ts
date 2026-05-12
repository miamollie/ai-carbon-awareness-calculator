import { APIGatewayProxyResultV2 } from "aws-lambda";

export const handler = async (): Promise<APIGatewayProxyResultV2> => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: "ok",
      service: "carbon-calc",
      timestamp: new Date().toISOString(),
    }),
  };
};
