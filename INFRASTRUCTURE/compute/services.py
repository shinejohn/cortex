"""
ECS Services configuration (SSR, Horizon, and web services).
"""

import json
import pulumi
import pulumi_aws as aws
from config import project_name, env, common_tags, ecs, ecs_ssr, ecs_horizon
from .cluster import cluster, ecs_security_group
from .service_discovery import ssr_service_discovery
from networking import private_subnets
from storage import repositories
from secrets import app_secret

# IAM Role for ECS Tasks
task_execution_role = aws.iam.Role(
    f"{project_name}-{env}-task-execution-role",
    assume_role_policy=pulumi.Output.from_input({
        "Version": "2012-10-17",
        "Statement": [{
            "Action": "sts:AssumeRole",
            "Effect": "Allow",
            "Principal": {
                "Service": "ecs-tasks.amazonaws.com",
            },
        }],
    }),
    tags=common_tags,
)

# Attach AWS managed policy for ECS task execution
aws.iam.RolePolicyAttachment(
    f"{project_name}-{env}-task-execution-policy",
    role=task_execution_role.name,
    policy_arn="arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
)

# Grant permission to read secrets from Secrets Manager
secrets_policy = aws.iam.Policy(
    f"{project_name}-{env}-secrets-policy",
    policy=pulumi.Output.from_input({
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetSecretValue",
                "secretsmanager:DescribeSecret"
            ],
            "Resource": f"arn:aws:secretsmanager:us-east-1:*:secret:fibonacco/{env}/*"
        }]
    }),
    tags=common_tags,
)

aws.iam.RolePolicyAttachment(
    f"{project_name}-{env}-secrets-policy-attachment",
    role=task_execution_role.name,
    policy_arn=secrets_policy.arn,
)

# IAM Role for ECS Tasks (application role)
task_role = aws.iam.Role(
    f"{project_name}-{env}-task-role",
    assume_role_policy=pulumi.Output.from_input({
        "Version": "2012-10-17",
        "Statement": [{
            "Action": "sts:AssumeRole",
            "Effect": "Allow",
            "Principal": {
                "Service": "ecs-tasks.amazonaws.com",
            },
        }],
    }),
    tags=common_tags,
)

# Inertia SSR Task Definition
ssr_task_definition = aws.ecs.TaskDefinition(
    f"{project_name}-{env}-ssr-task",
    family=f"{project_name}-{env}-ssr",
    network_mode="awsvpc",
    requires_compatibilities=["FARGATE"],
    cpu=str(ecs_ssr["cpu"]),
    memory=str(ecs_ssr["memory"]),
    execution_role_arn=task_execution_role.arn,
    task_role_arn=task_role.arn,
    container_definitions=pulumi.Output.all(
        url=repositories['inertia-ssr'].repository_url,
        secret_arn=app_secret.arn
    ).apply(lambda args: json.dumps([{
        "name": "inertia-ssr",
        "image": f"{args['url']}:latest",
        "essential": True,
        "command": ["php", "artisan", "inertia:start-ssr"],
        "portMappings": [{
            "containerPort": ecs_ssr["port"],
            "protocol": "tcp",
        }],
        "environment": [
            {"name": "NODE_ENV", "value": env},
            {"name": "INERTIA_SSR_PORT", "value": str(ecs_ssr["port"])},
            {"name": "APP_ENV", "value": env},
            {"name": "APP_DEBUG", "value": "false"},
            {"name": "DB_SSLMODE", "value": "require"},
        ],
        "secrets": [
            {"name": "DB_CONNECTION", "valueFrom": f"{args['secret_arn']}:DB_CONNECTION::"},
            {"name": "DB_HOST", "valueFrom": f"{args['secret_arn']}:DB_HOST::"},
            {"name": "DB_PORT", "valueFrom": f"{args['secret_arn']}:DB_PORT::"},
            {"name": "DB_DATABASE", "valueFrom": f"{args['secret_arn']}:DB_DATABASE::"},
            {"name": "DB_USERNAME", "valueFrom": f"{args['secret_arn']}:DB_USERNAME::"},
            {"name": "DB_PASSWORD", "valueFrom": f"{args['secret_arn']}:DB_PASSWORD::"},
            {"name": "REDIS_HOST", "valueFrom": f"{args['secret_arn']}:REDIS_HOST::"},
            {"name": "REDIS_PORT", "valueFrom": f"{args['secret_arn']}:REDIS_PORT::"},
            {"name": "APP_KEY", "valueFrom": f"{args['secret_arn']}:APP_KEY::"},
        ],
        "logConfiguration": {
            "logDriver": "awslogs",
            "options": {
                "awslogs-group": f"/ecs/{project_name}/{env}/ssr",
                "awslogs-region": "us-east-1",
                "awslogs-stream-prefix": "ecs",
            },
        },
    }])),
    tags=common_tags,
)

# CloudWatch Log Group for SSR
ssr_log_group = aws.cloudwatch.LogGroup(
    f"{project_name}-{env}-ssr-logs",
    name=f"/ecs/{project_name}/{env}/ssr",
    retention_in_days=7,
    tags=common_tags,
)

# Inertia SSR Service with Service Discovery
ssr_service = aws.ecs.Service(
    f"{project_name}-{env}-ssr-service",
    name=f"{project_name}-{env}-ssr",
    cluster=cluster.arn,
    task_definition=ssr_task_definition.arn,
    desired_count=ecs_ssr["desired_count"],
    launch_type="FARGATE",
    network_configuration=aws.ecs.ServiceNetworkConfigurationArgs(
        subnets=[subnet.id for subnet in private_subnets],
        security_groups=[ecs_security_group.id],
        assign_public_ip=False,
    ),
    service_registries=aws.ecs.ServiceServiceRegistriesArgs(
        registry_arn=ssr_service_discovery.arn,
    ),
    enable_execute_command=True,
    tags=common_tags,
)

# Horizon Task Definition
horizon_task_definition = aws.ecs.TaskDefinition(
    f"{project_name}-{env}-horizon-task",
    family=f"{project_name}-{env}-horizon",
    network_mode="awsvpc",
    requires_compatibilities=["FARGATE"],
    cpu=str(ecs_horizon["cpu"]),
    memory=str(ecs_horizon["memory"]),
    execution_role_arn=task_execution_role.arn,
    task_role_arn=task_role.arn,
    container_definitions=pulumi.Output.all(
        url=repositories['base-app'].repository_url,
        secret_arn=app_secret.arn
    ).apply(lambda args: json.dumps([{
        "name": "horizon",
        "image": f"{args['url']}:latest",
        "essential": True,
        "command": ["php", "artisan", "horizon"],
        "environment": [
            {"name": "APP_ENV", "value": env},
            {"name": "APP_DEBUG", "value": "false"},
            {"name": "QUEUE_CONNECTION", "value": "redis"},
            {"name": "CACHE_STORE", "value": "redis"},
            {"name": "SESSION_DRIVER", "value": "redis"},
            {"name": "DB_SSLMODE", "value": "require"},
        ],
        "secrets": [
            {"name": "DB_CONNECTION", "valueFrom": f"{args['secret_arn']}:DB_CONNECTION::"},
            {"name": "DB_HOST", "valueFrom": f"{args['secret_arn']}:DB_HOST::"},
            {"name": "DB_PORT", "valueFrom": f"{args['secret_arn']}:DB_PORT::"},
            {"name": "DB_DATABASE", "valueFrom": f"{args['secret_arn']}:DB_DATABASE::"},
            {"name": "DB_USERNAME", "valueFrom": f"{args['secret_arn']}:DB_USERNAME::"},
            {"name": "DB_PASSWORD", "valueFrom": f"{args['secret_arn']}:DB_PASSWORD::"},
            {"name": "REDIS_HOST", "valueFrom": f"{args['secret_arn']}:REDIS_HOST::"},
            {"name": "REDIS_PORT", "valueFrom": f"{args['secret_arn']}:REDIS_PORT::"},
            {"name": "APP_KEY", "valueFrom": f"{args['secret_arn']}:APP_KEY::"},
        ],
        "logConfiguration": {
            "logDriver": "awslogs",
            "options": {
                "awslogs-group": f"/ecs/{project_name}/{env}/horizon",
                "awslogs-region": "us-east-1",
                "awslogs-stream-prefix": "ecs",
            },
        },
    }])),
    tags=common_tags,
)

# CloudWatch Log Group for Horizon
horizon_log_group = aws.cloudwatch.LogGroup(
    f"{project_name}-{env}-horizon-logs",
    name=f"/ecs/{project_name}/{env}/horizon",
    retention_in_days=7,
    tags=common_tags,
)

# Horizon Service
horizon_service = aws.ecs.Service(
    f"{project_name}-{env}-horizon-service",
    name=f"{project_name}-{env}-horizon",
    cluster=cluster.arn,
    task_definition=horizon_task_definition.arn,
    desired_count=ecs_horizon["desired_count"],
    launch_type="FARGATE",
    network_configuration=aws.ecs.ServiceNetworkConfigurationArgs(
        subnets=[subnet.id for subnet in private_subnets],
        security_groups=[ecs_security_group.id],
        assign_public_ip=False,
    ),
    enable_execute_command=True,
    tags=common_tags,
)


def create_web_service(name: str, domain_config: dict, target_group_arn: pulumi.Output[str]):
    """Create a web service (GoEventCity, Day.News, or Downtown Guide)."""
    task_def = aws.ecs.TaskDefinition(
        f"{project_name}-{env}-{name}-task",
        family=f"{project_name}-{env}-{name}",
        network_mode="awsvpc",
        requires_compatibilities=["FARGATE"],
        cpu=str(ecs["cpu"]),
        memory=str(ecs["memory"]),
        execution_role_arn=task_execution_role.arn,
        task_role_arn=task_role.arn,
        container_definitions=pulumi.Output.all(
            url=repositories[name].repository_url,
            secret_arn=app_secret.arn
        ).apply(lambda args: json.dumps([{
            "name": name,
            "image": f"{args['url']}:latest",
            "essential": True,
            "portMappings": [{
                "containerPort": 8000,
                "protocol": "tcp",
            }],
            "environment": [
                {"name": "APP_ENV", "value": env},
                {"name": "APP_DEBUG", "value": "true" if env == "dev" else "false"},
                {"name": "APP_URL", "value": f"http://{domain_config['domain']}" if env != "production" else f"https://{domain_config['domain']}"},
                {"name": "CACHE_STORE", "value": "redis"},
                {"name": "QUEUE_CONNECTION", "value": "redis"},
                {"name": "SESSION_DRIVER", "value": "redis"},
                {"name": "LOG_CHANNEL", "value": "stderr"},  # Log to stderr for CloudWatch
                {"name": "LOG_LEVEL", "value": "debug" if env == "dev" else "info"},
                {"name": "INERTIA_SSR_URL", "value": f"http://ssr.{project_name}-{env}.local:13714"},
                {"name": "INERTIA_SSR_ENABLED", "value": "true"},
                {"name": "REDIS_SCHEME", "value": "tls"},
                {"name": "REDIS_TLS", "value": "true"},
                {"name": "DB_SSLMODE", "value": "require"},
            ],
            "secrets": [
                {"name": "DB_CONNECTION", "valueFrom": f"{args['secret_arn']}:DB_CONNECTION::"},
                {"name": "DB_HOST", "valueFrom": f"{args['secret_arn']}:DB_HOST::"},
                {"name": "DB_PORT", "valueFrom": f"{args['secret_arn']}:DB_PORT::"},
                {"name": "DB_DATABASE", "valueFrom": f"{args['secret_arn']}:DB_DATABASE::"},
                {"name": "DB_USERNAME", "valueFrom": f"{args['secret_arn']}:DB_USERNAME::"},
                {"name": "DB_PASSWORD", "valueFrom": f"{args['secret_arn']}:DB_PASSWORD::"},
                {"name": "REDIS_HOST", "valueFrom": f"{args['secret_arn']}:REDIS_HOST::"},
                {"name": "REDIS_PORT", "valueFrom": f"{args['secret_arn']}:REDIS_PORT::"},
                {"name": "APP_KEY", "valueFrom": f"{args['secret_arn']}:APP_KEY::"},
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": f"/ecs/{project_name}/{env}/{name}",
                    "awslogs-region": "us-east-1",
                    "awslogs-stream-prefix": "ecs",
                },
            },
        }])),
        tags=common_tags,
    )

    # Log group
    log_group = aws.cloudwatch.LogGroup(
        f"{project_name}-{env}-{name}-logs",
        name=f"/ecs/{project_name}/{env}/{name}",
        retention_in_days=7,
        tags=common_tags,
    )

    # Service
    service = aws.ecs.Service(
        f"{project_name}-{env}-{name}-service",
        name=f"{project_name}-{env}-{name}",
        cluster=cluster.arn,
        task_definition=task_def.arn,
        desired_count=ecs["desired_count"],
        launch_type="FARGATE",
        network_configuration=aws.ecs.ServiceNetworkConfigurationArgs(
            subnets=[subnet.id for subnet in private_subnets],
            security_groups=[ecs_security_group.id],
            assign_public_ip=False,
        ),
        load_balancers=[
            aws.ecs.ServiceLoadBalancerArgs(
                target_group_arn=target_group_arn,
                container_name=name,
                container_port=8000,
            )
        ],
        enable_execute_command=True,
        tags=common_tags,
    )

    return service

