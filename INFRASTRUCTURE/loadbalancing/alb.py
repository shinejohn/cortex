"""
Application Load Balancer configuration.
"""

import pulumi
import pulumi_aws as aws
from config import project_name, env, common_tags, domains, is_production
from networking import vpc, public_subnets

# Security Group for ALB
alb_security_group = aws.ec2.SecurityGroup(
    f"{project_name}-{env}-alb-sg",
    description="Security group for Application Load Balancer",
    vpc_id=vpc.id,
    ingress=[
        aws.ec2.SecurityGroupIngressArgs(
            description="HTTP",
            from_port=80,
            to_port=80,
            protocol="tcp",
            cidr_blocks=["0.0.0.0/0"],
        ),
        aws.ec2.SecurityGroupIngressArgs(
            description="HTTPS",
            from_port=443,
            to_port=443,
            protocol="tcp",
            cidr_blocks=["0.0.0.0/0"],
        ),
    ],
    egress=[
        aws.ec2.SecurityGroupEgressArgs(
            from_port=0,
            to_port=0,
            protocol="-1",
            cidr_blocks=["0.0.0.0/0"],
        )
    ],
    tags={**common_tags, "Name": f"{project_name}-{env}-alb-sg"},
)

# Application Load Balancer
alb = aws.lb.LoadBalancer(
    f"{project_name}-{env}-alb",
    name=f"{project_name}-{env}-alb",
    load_balancer_type="application",
    subnets=[subnet.id for subnet in public_subnets],
    security_groups=[alb_security_group.id],
    enable_deletion_protection=False,
    tags={**common_tags, "Name": f"{project_name}-{env}-alb"},
)

# Target Groups for each service
target_groups = {}

for service_name, domain_config in domains.items():
    tg = aws.lb.TargetGroup(
        f"{project_name}-{env}-{service_name}-tg",
        name=f"{project_name}-{env}-{service_name}",
        port=8000,
        protocol="HTTP",
        vpc_id=vpc.id,
        target_type="ip",
        health_check=aws.lb.TargetGroupHealthCheckArgs(
            enabled=True,
            path=domain_config["health_check_path"],
            protocol="HTTP",
            healthy_threshold=2,
            unhealthy_threshold=3,
            timeout=5,
            interval=30,
            matcher="200",
        ),
        tags={**common_tags, "Name": f"{project_name}-{env}-{service_name}-tg"},
    )
    target_groups[service_name] = tg

# HTTP Listener
# For dev/staging: Forward directly to target groups
# For production: Redirect to HTTPS
if is_production:
    # Production: HTTP redirects to HTTPS
    http_listener = aws.lb.Listener(
        f"{project_name}-{env}-http-listener",
        load_balancer_arn=alb.arn,
        port=80,
        protocol="HTTP",
        default_actions=[
            aws.lb.ListenerDefaultActionArgs(
                type="redirect",
                redirect=aws.lb.ListenerDefaultActionRedirectArgs(
                    port="443",
                    protocol="HTTPS",
                    status_code="HTTP_301",
                ),
            )
        ],
    )
    
    # Production: HTTPS listener with ACM certificates
    # TODO: Replace with actual certificate ARNs after requesting ACM certificates
    # For now, this is a placeholder - you must:
    # 1. Request ACM certificates: aws acm request-certificate --domain-name goeventcity.com ...
    # 2. Update certificate_arn below with actual ARNs
    # 3. Uncomment HTTPS listener code
    
    # https_listener = aws.lb.Listener(
    #     f"{project_name}-{env}-https-listener",
    #     load_balancer_arn=alb.arn,
    #     port=443,
    #     protocol="HTTPS",
    #     ssl_policy="ELBSecurityPolicy-TLS13-1-2-2021-06",
    #     certificate_arn="arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT_ID",
    #     default_actions=[
    #         aws.lb.ListenerDefaultActionArgs(
    #             type="fixed-response",
    #             fixed_response=aws.lb.ListenerDefaultActionFixedResponseArgs(
    #                 content_type="text/plain",
    #                 message_body="No matching domain",
    #                 status_code="404",
    #             ),
    #         )
    #     ],
    # )
    
    # # Create HTTPS rules for production
    # for service_name, tg in target_groups.items():
    #     aws.lb.ListenerRule(
    #         f"{project_name}-{env}-{service_name}-https-rule",
    #         listener_arn=https_listener.arn,
    #         priority=100 + list(target_groups.keys()).index(service_name),
    #         actions=[
    #             aws.lb.ListenerRuleActionArgs(
    #                 type="forward",
    #                 target_group_arn=tg.arn,
    #             )
    #         ],
    #         conditions=[
    #             aws.lb.ListenerRuleConditionArgs(
    #                 host_header=aws.lb.ListenerRuleConditionHostHeaderArgs(
    #                     values=[domains[service_name]["domain"]],
    #                 )
    #             )
    #         ],
    #     )
else:
    # Dev/Staging: HTTP forwards directly (no HTTPS required)
    http_listener = aws.lb.Listener(
        f"{project_name}-{env}-http-listener",
        load_balancer_arn=alb.arn,
        port=80,
        protocol="HTTP",
        default_actions=[
            aws.lb.ListenerDefaultActionArgs(
                type="fixed-response",
                fixed_response=aws.lb.ListenerDefaultActionFixedResponseArgs(
                    content_type="text/plain",
                    message_body="No matching domain",
                    status_code="404",
                ),
            )
        ],
    )
    
    # Create HTTP rules for dev/staging
    for service_name, tg in target_groups.items():
        aws.lb.ListenerRule(
            f"{project_name}-{env}-{service_name}-http-rule",
            listener_arn=http_listener.arn,
            priority=100 + list(target_groups.keys()).index(service_name),
            actions=[
                aws.lb.ListenerRuleActionArgs(
                    type="forward",
                    target_group_arn=tg.arn,
                )
            ],
            conditions=[
                aws.lb.ListenerRuleConditionArgs(
                    host_header=aws.lb.ListenerRuleConditionHostHeaderArgs(
                        values=[domains[service_name]["domain"]],
                    )
                )
            ],
        )

alb_dns_name = alb.dns_name

# Add security group rule to allow ALB to reach ECS tasks
# Import ECS security group here to avoid circular imports
from compute.cluster import ecs_security_group

alb_to_ecs_rule = aws.ec2.SecurityGroupRule(
    f"{project_name}-{env}-alb-to-ecs",
    type="ingress",
    description="HTTP from ALB to ECS",
    from_port=8000,
    to_port=8000,
    protocol="tcp",
    source_security_group_id=alb_security_group.id,
    security_group_id=ecs_security_group.id,
)

pulumi.export("alb_dns_name", alb_dns_name)
pulumi.export("alb_arn", alb.arn)

