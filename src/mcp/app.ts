import express from "express";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { calculate } from "../calculator";
import {
  carbonRequestSchema,
  carbonRequestShape,
  carbonResponseShape,
} from "../schemas/carbon";
import {
  mcpGetLimiter,
  mcpPostLimiter,
  mcpDeleteLimiter,
  healthLimiter,
} from "./ratelimit";
import {
  getActiveSessionCount,
  hasSessionCapacity,
  createSessionToken,
  headerValue,
  SESSION_ID_HEADER,
  getSession,
  registerSession,
  removeSession,
  MAX_ACTIVE_SESSIONS,
} from "./sessions";

function buildMcpServer(): McpServer {
  const server = new McpServer(
    { name: "ai-carbon-awareness-calculator", version: "1.0.0" },
    { capabilities: { tools: {} } },
  );

  server.registerTool(
    "calculate_AI_carbon_emissions",
    {
      title: "Calculate AI CarbonEmissions",
      description:
        "Calculate carbon emissions (kg CO2e) from AI model token usage",
      inputSchema: carbonRequestShape,
      outputSchema: carbonResponseShape,
    },
    async (args) => {
      const parsedRequest = carbonRequestSchema.safeParse(args);
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

  app.get("/mcp", mcpGetLimiter, async (req, res) => {
    const sessionId = headerValue(req.headers[SESSION_ID_HEADER]);
    if (!sessionId) {
      res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Missing mcp-session-id header",
        },
        id: null,
      });
      return;
    }

    const session = getSession(sessionId);
    if (!session) {
      res.status(404).json({
        jsonrpc: "2.0",
        error: {
          code: -32001,
          message: "Invalid session ID",
        },
        id: null,
      });
      return;
    }

    await session.transport.handleRequest(req, res);
  });

  app.post("/mcp", mcpPostLimiter, async (req, res) => {
    const sessionId = headerValue(req.headers[SESSION_ID_HEADER]);

    if (sessionId) {
      const session = getSession(sessionId);
      if (!session) {
        res.status(404).json({
          jsonrpc: "2.0",
          error: {
            code: -32001,
            message: "Invalid session ID",
          },
          id: null,
        });
        return;
      }

      await session.transport.handleRequest(req, res, req.body);
      return;
    }

    if (!isInitializeRequest(req.body)) {
      res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "No valid session ID provided",
        },
        id: null,
      });
      return;
    }

    if (!hasSessionCapacity()) {
      res.status(429).json({
        jsonrpc: "2.0",
        error: {
          code: -32004,
          message: "Session limit reached",
          data: {
            activeSessions: getActiveSessionCount(),
            maxSessions: MAX_ACTIVE_SESSIONS,
          },
        },
        id: null,
      });
      return;
    }

    const server = buildMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => createSessionToken(),
      onsessioninitialized: (initializedSessionId) => {
        registerSession(initializedSessionId, { transport, server });
      },
    });

    transport.onclose = () => {
      const activeSessionId = transport.sessionId;
      if (activeSessionId) {
        removeSession(activeSessionId);
      }
      void server.close().catch(() => undefined);
    };

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  app.delete("/mcp", mcpDeleteLimiter, async (req, res) => {
    const sessionId = headerValue(req.headers[SESSION_ID_HEADER]);
    if (!sessionId) {
      res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Missing mcp-session-id header",
        },
        id: null,
      });
      return;
    }

    const session = getSession(sessionId);
    if (!session) {
      res.status(404).json({
        jsonrpc: "2.0",
        error: {
          code: -32001,
          message: "Invalid session ID",
        },
        id: null,
      });
      return;
    }

    await session.transport.handleRequest(req, res);
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
