import express, { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { calculate, validateRequest } from "../calculator";
import { CarbonRequest } from "../types";

function buildMcpServer(): McpServer {
  const server = new McpServer(
    { name: "ai-carbon-awareness-calculator", version: "1.0.0" },
    { capabilities: { tools: {} } },
  );

  server.registerTool(
    "calculate_emissions",
    {
      title: "Calculate Emissions",
      description:
        "Calculate carbon emissions (kg CO2e) from AI model token usage",
    },
    async (args) => {
      const request = args as unknown as CarbonRequest;
      const validationError = validateRequest(request);
      if (validationError) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: validationError }),
            },
          ],
          isError: true,
        };
      }

      const result = calculate(request);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  return server;
}

export function createMcpApp() {
  const app = createMcpExpressApp();
  app.use(express.json());

  // RATE LIMITING: Prevent abuse of MCP endpoints.
  // Store: In-memory (suitable for single Lambda instance; use Redis/DynamoDB for distributed deployments)
  // SSE: 30 requests/minute per IP (typical MCP clients connect once, then stream)
  // Message: 60 requests/minute per IP (allows some rapid requests within a session)
  const sseLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 30, // 30 requests per minute per IP
    message: "Too many SSE connections from this IP, please try again later",
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
  });

  const messageLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 60, // 60 requests per minute per IP
    message: "Too many messages from this IP, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
  });

  const healthLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 300, // Health checks are frequent, allow more
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.get("/sse", sseLimiter, async (req, res) => {
    const server = buildMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    await server.connect(transport);
    await transport.handleRequest(req, res);
    res.on("close", () => {
      transport.close().catch(() => undefined);
      server.close().catch(() => undefined);
    });
  });

  app.post("/message", messageLimiter, async (req, res) => {
    const server = buildMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on("close", () => {
      transport.close().catch(() => undefined);
      server.close().catch(() => undefined);
    });
  });

  app.get("/mcp-health", healthLimiter, (_req, res) => {
    res.json({
      status: "ok",
      service: "carbon-calc-mcp",
      transport: "streamable-http",
    });
  });

  return app;
}
