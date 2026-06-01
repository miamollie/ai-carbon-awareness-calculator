import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

const defaultRegion = "eu-north-1";

export interface ObservabilityStackProps extends cdk.StackProps {
  calculatorLambda: NodejsFunction;
  restHealthLambda: NodejsFunction;
  mcpLambda: NodejsFunction;
  region?: string;
}

export class ObservabilityStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ObservabilityStackProps) {
    super(scope, id, props);

    const region = props.region || defaultRegion;

    // Dashboard
    const dashboard = new cloudwatch.Dashboard(
      this,
      "EnergyAwarenessCalculatorDashboard",
      {
        dashboardName: `energy-awareness-calculator-${region}`,
      },
    );

    // REST Lambda metrics
    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: "REST Calculator Invocations",
        left: [props.calculatorLambda.metricInvocations({ statistic: "Sum" })],
      }),
      new cloudwatch.GraphWidget({
        title: "REST Calculator Duration (ms)",
        left: [props.calculatorLambda.metricDuration({ statistic: "Average" })],
      }),
    );

    // MCP Lambda metrics
    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: "MCP Invocations",
        left: [props.mcpLambda.metricInvocations({ statistic: "Sum" })],
      }),
      new cloudwatch.GraphWidget({
        title: "MCP Duration (ms)",
        left: [props.mcpLambda.metricDuration({ statistic: "Average" })],
      }),
    );

    // Health Lambda metrics
    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: "Health Check Invocations",
        left: [props.restHealthLambda.metricInvocations({ statistic: "Sum" })],
      }),
    );

    // Energy metric (emitted from REST handler)
    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: "Energy Per Invocation (Wh)",
        left: [
          new cloudwatch.Metric({
            namespace: "EnergyAwarenessCalculator",
            metricName: "EnergyPerInvocationWh",
            statistic: "Average",
            period: cdk.Duration.minutes(5),
            dimensionsMap: {
              Service: "energy-calc",
              Transport: "rest",
            },
          }),
        ],
      }),
    );
  }
}
