#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ApiStack } from "../lib/api-stack";
import { RestStack } from "../lib/rest-stack";
import { McpStack } from "../lib/mcp-stack";
import { ObservabilityStack } from "../lib/observability-stack";

const app = new cdk.App();
const region = "eu-north-1";

// Create API stack first (no dependencies)
const apiStack = new ApiStack(app, "CarbonCalcApiStack", {
  env: { region },
  region,
});

// Create REST stack (depends on API)
const restStack = new RestStack(app, "CarbonCalcRestStack", {
  env: { region },
  api: apiStack.api,
  region,
});

// Create MCP stack (depends on API)
const mcpStack = new McpStack(app, "CarbonCalcMcpStack", {
  env: { region },
  api: apiStack.api,
  region,
});

// Create Observability stack (depends on REST and MCP stacks for lambda references)
new ObservabilityStack(app, "CarbonCalcObservabilityStack", {
  env: { region },
  calculatorLambda: restStack.calculatorLambda,
  restHealthLambda: restStack.restHealthLambda,
  mcpLambda: mcpStack.mcpLambda,
  region,
});
