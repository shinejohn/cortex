"""
Auto-remediation Lambda function for ECS auto-scaling.
"""

import pulumi
import pulumi_aws as aws
from config import project_name, env, common_tags, automation
from compute import cluster

if automation["enabled"]:
    # IAM Role for Lambda
    lambda_role = aws.iam.Role(
        f"{project_name}-{env}-remediation-lambda-role",
        assume_role_policy=pulumi.Output.from_input({
            "Version": "2012-10-17",
            "Statement": [{
                "Action": "sts:AssumeRole",
                "Effect": "Allow",
                "Principal": {
                    "Service": "lambda.amazonaws.com",
                },
            }],
        }),
        tags=common_tags,
    )

    # Attach policies
    aws.iam.RolePolicyAttachment(
        f"{project_name}-{env}-lambda-basic",
        role=lambda_role.name,
        policy_arn="arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    )

    # Lambda policy for ECS updates
    lambda_policy = aws.iam.RolePolicy(
        f"{project_name}-{env}-lambda-ecs-policy",
        role=lambda_role.id,
        policy=pulumi.Output.from_input({
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [
                        "ecs:UpdateService",
                        "ecs:DescribeServices",
                    ],
                    "Resource": "*",
                },
            ],
        }),
    )

    # Lambda function code
    lambda_code = """
import json
import boto3

ecs = boto3.client('ecs')

def lambda_handler(event, context):
    # Parse CloudWatch alarm
    alarm = json.loads(event['Records'][0]['Sns']['Message'])
    
    # Extract service name from alarm
    # This is a simplified version - adjust based on your alarm structure
    cluster_name = alarm.get('Trigger', {}).get('Dimensions', [{}])[0].get('value', '')
    service_name = alarm.get('Trigger', {}).get('Dimensions', [{}])[1].get('value', '')
    
    if not cluster_name or not service_name:
        return {'statusCode': 400, 'body': 'Missing cluster or service name'}
    
    # Get current service configuration
    response = ecs.describe_services(
        cluster=cluster_name,
        services=[service_name]
    )
    
    if not response['services']:
        return {'statusCode': 404, 'body': 'Service not found'}
    
    current_desired = response['services'][0]['desiredCount']
    max_capacity = """ + str(automation["max_auto_scale_ceiling"]) + """
    scale_up_percent = """ + str(automation["scale_up_percentage"]) + """ / 100
    
    # Calculate new desired count
    new_desired = min(
        int(current_desired * (1 + scale_up_percent)),
        max_capacity
    )
    
    if new_desired > current_desired:
        # Update service
        ecs.update_service(
            cluster=cluster_name,
            service=service_name,
            desiredCount=new_desired
        )
        
        return {
            'statusCode': 200,
            'body': f'Scaled {service_name} from {current_desired} to {new_desired}'
        }
    
    return {'statusCode': 200, 'body': 'No scaling needed'}
"""

    # Lambda function
    auto_remediation_lambda = aws.lambda_.Function(
        f"{project_name}-{env}-remediation-lambda",
        name=f"{project_name}-{env}-remediation",
        runtime="python3.11",
        role=lambda_role.arn,
        handler="index.lambda_handler",
        code=pulumi.AssetArchive({
            "index.py": pulumi.StringAsset(lambda_code),
        }),
        timeout=60,
        memory_size=128,
        tags=common_tags,
    )

    # EventBridge Rule for capacity warnings
    capacity_warning_rule = aws.cloudwatch.EventRule(
        f"{project_name}-{env}-capacity-warning-rule",
        name=f"{project_name}-{env}-capacity-warning",
        event_pattern=pulumi.Output.from_input({
            "source": ["aws.ecs"],
            "detail-type": ["ECS Service Action"],
            "detail": {
                "eventName": ["SERVICE_STEADY_STATE"],
            },
        }),
        tags=common_tags,
    )

    # EventBridge Target
    aws.cloudwatch.EventTarget(
        f"{project_name}-{env}-lambda-target",
        rule=capacity_warning_rule.name,
        arn=auto_remediation_lambda.arn,
    )

    # Lambda permission for EventBridge
    aws.lambda_.Permission(
        f"{project_name}-{env}-lambda-eventbridge-permission",
        statement_id="AllowExecutionFromEventBridge",
        action="lambda:InvokeFunction",
        function_name=auto_remediation_lambda.name,
        principal="events.amazonaws.com",
        source_arn=capacity_warning_rule.arn,
    )

else:
    auto_remediation_lambda = None
    capacity_warning_rule = None

