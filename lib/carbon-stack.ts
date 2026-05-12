import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

const defaultRegion = "eu-north-1"; // AWS region with relatively low grid carbon intensity (source: https://www.electricitymap.org/)

export class CarbonAwarenessCalculatorStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const calculatorLogGroup = new logs.LogGroup(
      this,
      "RestCalculatorLogGroup",
      {
        retention: logs.RetentionDays.ONE_WEEK,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    );

    const restHealthLogGroup = new logs.LogGroup(this, "RestHealthLogGroup", {
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const calculatorLambda = new NodejsFunction(
      this,
      "CarbonCalculatorFunction",
      {
        entry: "src/rest/handler.ts",
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_20_X,
        timeout: cdk.Duration.seconds(5),
        logGroup: calculatorLogGroup,
        bundling: {
          minify: true,
        },
        environment: {
          REGION: props.env?.region || defaultRegion,
        },
      },
    );

    const restHealthLambda = new NodejsFunction(this, "RestHealthFunction", {
      entry: "src/rest/health.ts",
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(2),
      logGroup: restHealthLogGroup,
      bundling: {
        minify: true,
      },
      environment: {
        REGION: props.env?.region || defaultRegion,
      },
    });

    const mcpLogGroup = new logs.LogGroup(this, "McpLogGroup", {
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const mcpLambda = new NodejsFunction(this, "McpFunction", {
      entry: "src/mcp/handler.ts",
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      // NOTE: Max timeout used for SSE streaming
      timeout: cdk.Duration.seconds(29),
      logGroup: mcpLogGroup,
      bundling: {
        minify: true,
      },
      environment: {
        REGION: props.env?.region || defaultRegion,
      },
    });

    // RATE LIMITING: Reserve Lambda concurrency to prevent runaway scaling
    // (HTTP API v2 doesn't support built-in throttling like REST API, so we use Lambda concurrency limits)
    // Each function is limited to prevent exhausting account concurrency quota
    (
      calculatorLambda.node.defaultChild as lambda.CfnFunction
    ).reservedConcurrentExecutions = 100;
    (
      restHealthLambda.node.defaultChild as lambda.CfnFunction
    ).reservedConcurrentExecutions = 50;
    (
      mcpLambda.node.defaultChild as lambda.CfnFunction
    ).reservedConcurrentExecutions = 50;

    const api = new apigwv2.HttpApi(this, "AICarbonAwarenessApi", {
      description: `AICarbon calculator API (${props.env?.region || defaultRegion})`,
      corsPreflight: {
        allowMethods: [apigwv2.CorsHttpMethod.POST, apigwv2.CorsHttpMethod.GET],
        allowOrigins: ["*"],
        // ASSUMPTION: permissive CORS is acceptable for internal MVP testing only.
      },
    });

    // Express middleware rate limiting is applied within MCP Lambda (mcp-app.ts)

    api.addRoutes({
      path: "/carbon",
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration(
        "CarbonCalculatorIntegration",
        calculatorLambda,
      ),
    });

    api.addRoutes({
      path: "/health",
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration(
        "HealthIntegration",
        restHealthLambda,
      ),
    });

    // ASSUMPTION: MCP SSE clients reconnect frequently, so API Gateway's 29s timeout is acceptable.
    api.addRoutes({
      path: "/sse",
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration(
        "McpSseIntegration",
        mcpLambda,
      ),
    });

    api.addRoutes({
      path: "/message",
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration(
        "McpMessageIntegration",
        mcpLambda,
      ),
    });

    api.addRoutes({
      path: "/mcp-health",
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration(
        "McpHealthIntegration",
        mcpLambda,
      ),
    });

    const dashboard = new cloudwatch.Dashboard(
      this,
      "CarbonAwarenessCalculatorDashboard",
      {
        dashboardName: `carbon-calc-${props.env?.region || defaultRegion}`,
      },
    );

    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: "Lambda Invocations",
        left: [calculatorLambda.metricInvocations({ statistic: "Sum" })],
      }),
      new cloudwatch.GraphWidget({
        title: "Lambda Duration (ms)",
        left: [calculatorLambda.metricDuration({ statistic: "Average" })],
      }),
      new cloudwatch.GraphWidget({
        title: "Carbon Per Invocation (kgCO2e)",
        left: [
          new cloudwatch.Metric({
            namespace: "CarbonAwarenessCalculator",
            metricName: "CarbonPerInvocationKgCO2e",
            statistic: "Average",
            period: cdk.Duration.minutes(5),
            dimensionsMap: {
              Service: "carbon-calc",
              Transport: "rest",
            },
          }),
        ],
      }),
    );

    new cdk.CfnOutput(this, "ApiBaseUrl", {
      value: api.apiEndpoint,
      description: "Base URL for carbon calculator API",
    });

    new cdk.CfnOutput(this, "CarbonEndpoint", {
      value: `${api.apiEndpoint}/carbon`,
      description: "POST endpoint for carbon calculations",
    });

    new cdk.CfnOutput(this, "HealthEndpoint", {
      value: `${api.apiEndpoint}/health`,
      description: "GET endpoint for service health",
    });

    new cdk.CfnOutput(this, "McpSseEndpoint", {
      value: `${api.apiEndpoint}/sse`,
      description: "GET SSE endpoint for MCP clients",
    });

    new cdk.CfnOutput(this, "McpMessageEndpoint", {
      value: `${api.apiEndpoint}/message`,
      description: "POST endpoint for MCP client messages (?sessionId=)",
    });
  }
}
