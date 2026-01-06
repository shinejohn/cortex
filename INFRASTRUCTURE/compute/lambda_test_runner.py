"""
Lambda function to run Laravel tests and documentation generation.

This Lambda function runs in the VPC and has access to the private RDS instance.
It can execute:
- php artisan scribe:generate
- php artisan api:export-markdown
- php artisan test (integration tests)

Uses Lambda Container Image for easier PHP/Laravel deployment.
"""

import json
import pulumi
import pulumi_aws as aws
from config import project_name, env, common_tags
from networking import vpc, private_subnets
from database.rds import db_security_group as rds_security_group
from storage import repositories

# IAM Role for Lambda
lambda_role = aws.iam.Role(
    f"{project_name}-{env}-test-runner-lambda-role",
    assume_role_policy=aws.iam.get_policy_document(
        statements=[{
            "effect": "Allow",
            "principals": [{
                "type": "Service",
                "identifiers": ["lambda.amazonaws.com"],
            }],
            "actions": ["sts:AssumeRole"],
        }],
    ).json,
    tags=common_tags,
)

# Attach basic Lambda execution policy
lambda_role_policy = aws.iam.RolePolicyAttachment(
    f"{project_name}-{env}-test-runner-lambda-basic",
    role=lambda_role.name,
    policy_arn="arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
)

# Attach VPC access policy
lambda_vpc_policy = aws.iam.RolePolicyAttachment(
    f"{project_name}-{env}-test-runner-lambda-vpc",
    role=lambda_role.name,
    policy_arn="arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole",
)

# Attach S3 access policy (for uploading results)
lambda_s3_policy = aws.iam.RolePolicy(
    f"{project_name}-{env}-test-runner-lambda-s3",
    role=lambda_role.id,
    policy=aws.iam.get_policy_document(
        statements=[{
            "effect": "Allow",
            "actions": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:ListBucket",
            ],
            "resources": [
                f"arn:aws:s3:::fibonacco-{env}-app-storage/*",
                f"arn:aws:s3:::fibonacco-{env}-app-storage",
            ],
        }],
    ).json,
)

# Attach Secrets Manager policy
secrets_manager_policy = aws.iam.RolePolicy(
    f"{project_name}-{env}-test-runner-lambda-secrets",
    role=lambda_role.id,
    policy=aws.iam.get_policy_document(
        statements=[{
            "effect": "Allow",
            "actions": [
                "secretsmanager:GetSecretValue",
            ],
            "resources": [
                f"arn:aws:secretsmanager:us-east-1:*:secret:fibonacco/{env}/app-secrets*",
            ],
        }],
    ).json,
)

# Lambda function using container image
# Note: Container image must be built and pushed to ECR first
test_runner_lambda = aws.lambda_.Function(
    f"{project_name}-{env}-test-runner",
    name=f"{project_name}-{env}-test-runner",
    package_type="Image",  # Use container image
    # Image URI will be set after building and pushing container image
    # Format: {account_id}.dkr.ecr.{region}.amazonaws.com/{repo_name}:latest
    image_uri=pulumi.Output.from_input(f"195430954683.dkr.ecr.us-east-1.amazonaws.com/fibonacco-{env}-test-runner:latest"),
    role=lambda_role.arn,
    timeout=900,  # 15 minutes max
    memory_size=3008,  # Max memory for large test runs
    vpc_config=aws.lambda_.FunctionVpcConfigArgs(
        subnet_ids=[subnet.id for subnet in private_subnets],
        security_group_ids=[rds_security_group.id],
    ),
    environment=aws.lambda_.FunctionEnvironmentArgs(
        variables={
            "APP_ENV": env,
            "SECRET_NAME": f"fibonacco/{env}/app-secrets",
            "S3_BUCKET": f"fibonacco-{env}-app-storage",
        },
    ),
    tags={**common_tags, "Name": f"{project_name}-{env}-test-runner"},
)

# API Gateway for HTTP triggers (optional)
api_gateway = aws.apigatewayv2.Api(
    f"{project_name}-{env}-test-runner-api",
    name=f"{project_name}-{env}-test-runner-api",
    protocol_type="HTTP",
    description="API Gateway for Lambda test runner",
    cors_configuration=aws.apigatewayv2.ApiCorsConfigurationArgs(
        allow_origins=["*"],
        allow_methods=["POST", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        max_age=300,
    ),
    tags=common_tags,
)

# API Gateway integration with Lambda
lambda_integration = aws.apigatewayv2.Integration(
    f"{project_name}-{env}-test-runner-integration",
    api_id=api_gateway.id,
    integration_type="AWS_PROXY",
    integration_uri=test_runner_lambda.invoke_arn,
    payload_format_version="2.0",
)

# API Gateway route
api_route = aws.apigatewayv2.Route(
    f"{project_name}-{env}-test-runner-route",
    api_id=api_gateway.id,
    route_key="POST /run",
    target=pulumi.Output.concat("integrations/", lambda_integration.id),
)

# API Gateway stage
api_stage = aws.apigatewayv2.Stage(
    f"{project_name}-{env}-test-runner-stage",
    api_id=api_gateway.id,
    name="$default",
    auto_deploy=True,
)

# Grant API Gateway permission to invoke Lambda
lambda_permission = aws.lambda_.Permission(
    f"{project_name}-{env}-test-runner-api-permission",
    statement_id="AllowAPIGatewayInvoke",
    action="lambda:InvokeFunction",
    function=test_runner_lambda.name,
    principal="apigateway.amazonaws.com",
    source_arn=pulumi.Output.concat(api_gateway.execution_arn, "/*/*"),
)

# EventBridge rule for periodic runs (optional - runs daily at 2 AM UTC)
eventbridge_rule = aws.cloudwatch.EventRule(
    f"{project_name}-{env}-test-runner-schedule",
    name=f"{project_name}-{env}-test-runner-daily",
    description="Daily test run schedule",
    schedule_expression="cron(0 2 * * ? *)",  # 2 AM UTC daily
    tags=common_tags,
)

# EventBridge target (Lambda)
eventbridge_target = aws.cloudwatch.EventTarget(
    f"{project_name}-{env}-test-runner-target",
    rule=eventbridge_rule.name,
    arn=test_runner_lambda.arn,
    input=json.dumps({
        "command": "test",
        "filter": "Integration",
    }),
)

# Grant EventBridge permission to invoke Lambda
eventbridge_permission = aws.lambda_.Permission(
    f"{project_name}-{env}-test-runner-eventbridge-permission",
    statement_id="AllowEventBridgeInvoke",
    action="lambda:InvokeFunction",
    function=test_runner_lambda.name,
    principal="events.amazonaws.com",
    source_arn=eventbridge_rule.arn,
)

# Export Lambda function name and ARN
pulumi.export("test_runner_lambda_name", test_runner_lambda.name)
pulumi.export("test_runner_lambda_arn", test_runner_lambda.arn)
pulumi.export("test_runner_api_url", pulumi.Output.concat(api_stage.invoke_url, "/run"))
pulumi.export("test_runner_eventbridge_rule", eventbridge_rule.name)
