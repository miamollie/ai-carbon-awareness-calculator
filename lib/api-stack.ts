import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";

const defaultRegion = "eu-north-1";

export interface ApiStackProps extends cdk.StackProps {
  region?: string;
}

export class ApiStack extends cdk.Stack {
  public readonly api: apigwv2.HttpApi;

  constructor(scope: Construct, id: string, props: ApiStackProps = {}) {
    super(scope, id, props);

    const region = props.region || defaultRegion;

    // HTTP API with CORS
    this.api = new apigwv2.HttpApi(this, "AICarbonAwarenessApi", {
      description: `AICarbon calculator API (${region})`,
      corsPreflight: {
        allowMethods: [
          apigwv2.CorsHttpMethod.POST,
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.DELETE,
        ],
        allowOrigins: ["*"],
      },
    });

    new cdk.CfnOutput(this, "ApiBaseUrl", {
      value: this.api.apiEndpoint,
      description: "Base URL for carbon calculator API",
    });

    new cdk.CfnOutput(this, "CarbonEndpoint", {
      value: `${this.api.apiEndpoint}/carbon`,
      description: "POST endpoint for carbon calculations",
    });

    new cdk.CfnOutput(this, "HealthEndpoint", {
      value: `${this.api.apiEndpoint}/health`,
      description: "GET endpoint for service health",
    });

    new cdk.CfnOutput(this, "McpGetEndpoint", {
      value: `${this.api.apiEndpoint}/mcp`,
      description: "GET streamable-http MCP endpoint",
    });

    new cdk.CfnOutput(this, "McpPostEndpoint", {
      value: `${this.api.apiEndpoint}/mcp`,
      description:
        "POST streamable-http MCP endpoint (use mcp-session-id header)",
    });

    new cdk.CfnOutput(this, "McpDeleteEndpoint", {
      value: `${this.api.apiEndpoint}/mcp`,
      description: "DELETE streamable-http MCP endpoint (terminate session)",
    });

    new cdk.CfnOutput(this, "McpHealthEndpoint", {
      value: `${this.api.apiEndpoint}/mcp-health`,
      description: "GET endpoint for MCP health status",
    });
  }
}
