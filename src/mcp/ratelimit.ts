import rateLimit from "express-rate-limit";

// RATE LIMITING: Prevent abuse of MCP endpoints.
// Store: In-memory (suitable for single Lambda instance; use Redis/DynamoDB for distributed deployments)
// POST /mcp message: 60 requests/minute per IP.

const mcpPostLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 60, // 60 requests per minute per IP
  message: "Too many MCP messages from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const healthLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300, // Health checks are frequent, allow more
  standardHeaders: true,
  legacyHeaders: false,
});

export { mcpPostLimiter, healthLimiter };
