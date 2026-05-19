import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

const defaultRegion = "eu-north-1";

export interface RestStackProps extends cdk.StackProps {
  api: apigwv2.HttpApi;
  region?: string;
}

export class RestStack extends cdk.Stack {
  public readonly calculatorLambda: NodejsFunction;
  public readonly restHealthLambda: NodejsFunction;

  constructor(scope: Construct, id: string, props: RestStackProps) {
    super(scope, id, props);

    const region = props.region || defaultRegion;

    // Log groups
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

    // Lambda functions
    this.calculatorLambda = new NodejsFunction(
      this,
      "CarbonCalculatorFunction",
      {
        entry: "src/rest/handler.ts",
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_22_X,
        timeout: cdk.Duration.seconds(5),
        logGroup: calculatorLogGroup,
        bundling: {
          minify: true,
        },
        environment: {
          REGION: region,
        },
      },
    );

    this.restHealthLambda = new NodejsFunction(this, "RestHealthFunction", {
      entry: "src/rest/health.ts",
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      timeout: cdk.Duration.seconds(2),
      logGroup: restHealthLogGroup,
      bundling: {
        minify: true,
      },
      environment: {
        REGION: region,
      },
    });

    // Rate limiting: Reserve Lambda concurrency
    (
      this.calculatorLambda.node.defaultChild as lambda.CfnFunction
    ).reservedConcurrentExecutions = 100;
    (
      this.restHealthLambda.node.defaultChild as lambda.CfnFunction
    ).reservedConcurrentExecutions = 50;

    // REST routes
    props.api.addRoutes({
      path: "/carbon",
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration(
        "CarbonCalculatorIntegration",
        this.calculatorLambda,
      ),
    });

    props.api.addRoutes({
      path: "/health",
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration(
        "HealthIntegration",
        this.restHealthLambda,
      ),
    });
  }
}
