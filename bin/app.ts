#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ApiStack } from "../lib/api-stack";
import { RestStack } from "../lib/rest-stack";
import { McpStack } from "../lib/mcp-stack";
import { ObservabilityStack } from "../lib/observability-stack";

const app = new cdk.App();
const region = "eu-north-1";
// Use the account from the active AWS profile so HostedZone.fromLookup works
// when a custom domain is configured. Falls back to env-agnostic deploys
// otherwise.
const account = process.env.CDK_DEFAULT_ACCOUNT;
const env: cdk.Environment = { region, account };

// Custom-domain wiring is opt-in via CDK context:
//   cdk deploy -c domainName=carbon.miamollie.dev
// Optionally override the hosted-zone name (defaults to domainName):
//   cdk deploy -c domainName=carbon.miamollie.dev -c hostedZoneName=miamollie.dev
const domainName = app.node.tryGetContext("domainName") as string | undefined;
const hostedZoneName = app.node.tryGetContext("hostedZoneName") as
  | string
  | undefined;

// Create API stack first (no dependencies)
const apiStack = new ApiStack(app, "CarbonCalcApiStack", {
  env,
  region,
  domainName,
  hostedZoneName,
});

// Create REST stack (depends on API)
const restStack = new RestStack(app, "CarbonCalcRestStack", {
  env,
  api: apiStack.api,
  region,
});

// Create MCP stack (depends on API)
const mcpStack = new McpStack(app, "CarbonCalcMcpStack", {
  env,
  api: apiStack.api,
  region,
});

// Create Observability stack (depends on REST and MCP stacks for lambda references)
new ObservabilityStack(app, "CarbonCalcObservabilityStack", {
  env,
  calculatorLambda: restStack.calculatorLambda,
  restHealthLambda: restStack.restHealthLambda,
  mcpLambda: mcpStack.mcpLambda,
  region,
});
