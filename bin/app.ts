#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CarbonAwarenessCalculatorStack } from "../lib/carbon-stack";
const app = new cdk.App();

new CarbonAwarenessCalculatorStack(app, "CarbonCalcSingleRegion", {
  env: { region: "eu-north-1" },
});
