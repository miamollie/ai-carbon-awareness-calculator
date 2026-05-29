import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";

const defaultRegion = "eu-north-1";

export interface ApiStackProps extends cdk.StackProps {
  region?: string;
  /**
   * Fully-qualified custom domain for the API, e.g. `carbon.miamollie.dev`.
   * When provided, the stack creates an ACM certificate, an API Gateway
   * custom domain, and a Route 53 A-record alias.
   *
   * Requires a public Route 53 hosted zone whose name matches
   * `hostedZoneName` (defaults to `domainName` for the subdomain-delegation
   * pattern).
   */
  domainName?: string;
  /**
   * Name of the Route 53 public hosted zone to look up.
   * Defaults to `domainName`.
   */
  hostedZoneName?: string;
}

export class ApiStack extends cdk.Stack {
  public readonly api: apigwv2.HttpApi;
  public readonly customDomainName?: string;

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

    // Optional custom domain wiring
    let publicBaseUrl = this.api.apiEndpoint;
    if (props.domainName) {
      const zoneName = props.hostedZoneName ?? props.domainName;
      const zone = route53.HostedZone.fromLookup(this, "HostedZone", {
        domainName: zoneName,
      });

      const certificate = new acm.Certificate(this, "ApiCertificate", {
        domainName: props.domainName,
        validation: acm.CertificateValidation.fromDns(zone),
      });

      const domain = new apigwv2.DomainName(this, "ApiDomain", {
        domainName: props.domainName,
        certificate,
      });

      new apigwv2.ApiMapping(this, "ApiMapping", {
        api: this.api,
        domainName: domain,
      });

      // Record name relative to the hosted zone.
      // - If the hosted zone IS the domain, recordName is undefined (apex).
      // - If the domain is a child of the hosted zone, strip the zone suffix.
      let recordName: string | undefined;
      if (props.domainName === zoneName) {
        recordName = undefined;
      } else if (props.domainName.endsWith(`.${zoneName}`)) {
        recordName = props.domainName.slice(
          0,
          props.domainName.length - zoneName.length - 1,
        );
      } else {
        recordName = props.domainName;
      }

      new route53.ARecord(this, "ApiAliasRecord", {
        zone,
        recordName,
        target: route53.RecordTarget.fromAlias(
          new targets.ApiGatewayv2DomainProperties(
            domain.regionalDomainName,
            domain.regionalHostedZoneId,
          ),
        ),
      });

      this.customDomainName = props.domainName;
      publicBaseUrl = `https://${props.domainName}`;

      new cdk.CfnOutput(this, "CustomDomainName", {
        value: props.domainName,
        description: "Custom domain serving the API",
      });

      new cdk.CfnOutput(this, "CustomDomainTarget", {
        value: domain.regionalDomainName,
        description:
          "Regional API Gateway domain (alias target for the A record)",
      });
    }

    new cdk.CfnOutput(this, "ApiBaseUrl", {
      value: publicBaseUrl,
      description: "Base URL for carbon calculator API",
    });

    new cdk.CfnOutput(this, "ApiGatewayEndpoint", {
      value: this.api.apiEndpoint,
      description: "Underlying API Gateway endpoint (always available)",
    });

    new cdk.CfnOutput(this, "CarbonEndpoint", {
      value: `${publicBaseUrl}/carbon`,
      description: "POST endpoint for carbon calculations",
    });

    new cdk.CfnOutput(this, "HealthEndpoint", {
      value: `${publicBaseUrl}/health`,
      description: "GET endpoint for service health",
    });

    new cdk.CfnOutput(this, "McpGetEndpoint", {
      value: `${publicBaseUrl}/mcp`,
      description: "GET streamable-http MCP endpoint",
    });

    new cdk.CfnOutput(this, "McpPostEndpoint", {
      value: `${publicBaseUrl}/mcp`,
      description:
        "POST streamable-http MCP endpoint (use mcp-session-id header)",
    });

    new cdk.CfnOutput(this, "McpDeleteEndpoint", {
      value: `${publicBaseUrl}/mcp`,
      description: "DELETE streamable-http MCP endpoint (terminate session)",
    });

    new cdk.CfnOutput(this, "McpHealthEndpoint", {
      value: `${publicBaseUrl}/mcp-health`,
      description: "GET endpoint for MCP health status",
    });
  }
}
