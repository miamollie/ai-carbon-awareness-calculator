import rateLimit from "express-rate-limit";

// RATE LIMITING: Prevent abuse of MCP endpoints.
// Store: In-memory (suitable for single Lambda instance; use Redis/DynamoDB for distributed deployments)
// GET /mcp stream: 30 requests/minute per IP (typical clients connect once, then stream)
// POST /mcp message: 60 requests/minute per IP (allows some rapid requests within a session)
const mcpGetLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 30, // 30 requests per minute per IP
  message:
    "Too many MCP stream connections from this IP, please try again later",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

const mcpPostLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 60, // 60 requests per minute per IP
  message: "Too many MCP messages from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const mcpDeleteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

const healthLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300, // Health checks are frequent, allow more
  standardHeaders: true,
  legacyHeaders: false,
});

export { mcpGetLimiter, mcpPostLimiter, mcpDeleteLimiter, healthLimiter };
