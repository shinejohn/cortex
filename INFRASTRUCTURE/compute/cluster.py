"""
ECS Cluster configuration.
"""

import pulumi
import pulumi_aws as aws
from config import project_name, env, common_tags, is_production
from networking import vpc

# ECS Cluster
cluster = aws.ecs.Cluster(
    f"{project_name}-{env}-cluster",
    name=f"{project_name}-{env}",
    settings=[
        aws.ecs.ClusterSettingArgs(
            name="containerInsights",
            value="enabled",
        )
    ],
    tags=common_tags,
)

# Security Group for ECS Tasks
# Note: ALB security group reference will be added via security group rule after ALB is created
ecs_security_group = aws.ec2.SecurityGroup(
    f"{project_name}-{env}-ecs-sg",
    description="Security group for ECS tasks",
    vpc_id=vpc.id,
    ingress=[
        aws.ec2.SecurityGroupIngressArgs(
            description="Inertia SSR port",
            from_port=13714,
            to_port=13714,
            protocol="tcp",
            cidr_blocks=[vpc.cidr_block],
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
    tags={**common_tags, "Name": f"{project_name}-{env}-ecs-sg"},
)

# Note: ALB security group ingress rule will be added in loadbalancing/alb.py after ALB is created

pulumi.export("cluster_name", cluster.name)
pulumi.export("cluster_arn", cluster.arn)

