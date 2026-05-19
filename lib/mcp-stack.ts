import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

const defaultRegion = "eu-north-1";

export interface McpStackProps extends cdk.StackProps {
  api: apigwv2.HttpApi;
  region?: string;
}

export class McpStack extends cdk.Stack {
  public readonly mcpLambda: NodejsFunction;

  constructor(scope: Construct, id: string, props: McpStackProps) {
    super(scope, id, props);

    const region = props.region || defaultRegion;

    // Log group
    const mcpLogGroup = new logs.LogGroup(this, "McpLogGroup", {
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // MCP Lambda function
    this.mcpLambda = new NodejsFunction(this, "McpFunction", {
      entry: "src/mcp/handler.ts",
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      timeout: cdk.Duration.seconds(29), // Max timeout for Streamable HTTP responses
      logGroup: mcpLogGroup,
      bundling: {
        minify: true,
      },
      environment: {
        REGION: region,
      },
    });

    // Rate limiting: Reserve Lambda concurrency
    (
      this.mcpLambda.node.defaultChild as lambda.CfnFunction
    ).reservedConcurrentExecutions = 50;

    // MCP routes (registered on the API from RestStack)
    props.api.addRoutes({
      path: "/mcp",
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration(
        "McpGetIntegration",
        this.mcpLambda,
      ),
    });

    props.api.addRoutes({
      path: "/mcp",
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration(
        "McpPostIntegration",
        this.mcpLambda,
      ),
    });

    props.api.addRoutes({
      path: "/mcp",
      methods: [apigwv2.HttpMethod.DELETE],
      integration: new integrations.HttpLambdaIntegration(
        "McpDeleteIntegration",
        this.mcpLambda,
      ),
    });

    props.api.addRoutes({
      path: "/mcp-health",
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration(
        "McpHealthIntegration",
        this.mcpLambda,
      ),
    });
  }
}
