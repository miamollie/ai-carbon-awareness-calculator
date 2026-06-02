import express from "express";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { calculate } from "../calculator";
import { requestSchema, requestShape, responseShape } from "../schemas";
import { mcpPostLimiter, healthLimiter } from "./ratelimit";

function buildMcpServer(): McpServer {
  const server = new McpServer(
    { name: "ai-energy-awareness-calculator", version: "1.0.0" },
    { capabilities: { tools: {} } },
  );

  server.registerTool(
    "calculate_ai_energy_impact",
    {
      title: "Calculate AI Energy Impact",
      description:
        "Calculate AI energy use (Wh) and low/high energy ranges from token usage",
      inputSchema: requestShape,
      outputSchema: responseShape,
    },
    async (args) => {
      const parsedRequest = requestSchema.safeParse(args);
      if (!parsedRequest.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: "Invalid tool input" }),
            },
          ],
          isError: true,
        };
      }

      const result = calculate(parsedRequest.data);
      const structuredContent = result as unknown as Record<string, unknown>;
      return {
        content: [
          { type: "text", text: JSON.stringify(structuredContent, null, 2) },
        ],
        structuredContent,
      };
    },
  );

  return server;
}

export function createMcpApp() {
  const app = createMcpExpressApp();
  app.use(express.json());

  app.post("/mcp", mcpPostLimiter, async (req, res) => {
    const server = buildMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } finally {
      void transport.close();
      void server.close().catch(() => undefined);
    }
  });

  app.get("/mcp-health", healthLimiter, (_req, res) => {
    res.json({
      status: "ok",
      service: "energy-calc-mcp",
      transport: "streamable-http",
    });
  });

  return app;
}
