"""
ElastiCache Redis configuration.
"""

import pulumi
import pulumi_aws as aws
from config import project_name, env, common_tags, cache
from networking import vpc, private_subnets

# Subnet Group for ElastiCache
cache_subnet_group = aws.elasticache.SubnetGroup(
    f"{project_name}-{env}-cache-subnet-group",
    subnet_ids=[subnet.id for subnet in private_subnets],
    tags={**common_tags, "Name": f"{project_name}-{env}-cache-subnet-group"},
)

# Security Group for ElastiCache
cache_security_group = aws.ec2.SecurityGroup(
    f"{project_name}-{env}-cache-sg",
    description="Security group for ElastiCache Redis",
    vpc_id=vpc.id,
    ingress=[
        aws.ec2.SecurityGroupIngressArgs(
            description="Redis from VPC",
            from_port=6379,
            to_port=6379,
            protocol="tcp",
            cidr_blocks=[vpc.cidr_block],
        )
    ],
    egress=[
        aws.ec2.SecurityGroupEgressArgs(
            from_port=0,
            to_port=0,
            protocol="-1",
            cidr_blocks=["0.0.0.0/0"],
        )
    ],
    tags={**common_tags, "Name": f"{project_name}-{env}-cache-sg"},
)

# Parameter Group for Redis
cache_parameter_group = aws.elasticache.ParameterGroup(
    f"{project_name}-{env}-cache-params",
    family=f"redis{cache['engine_version'].split('.')[0]}",
    parameters=[
        aws.elasticache.ParameterGroupParameterArgs(
            name="maxmemory-policy",
            value="allkeys-lru",
        ),
    ],
    tags={**common_tags, "Name": f"{project_name}-{env}-cache-params"},
)

# ElastiCache Replication Group (for high availability)
redis_cluster = aws.elasticache.ReplicationGroup(
    f"{project_name}-{env}-redis",
    replication_group_id=f"{project_name}-{env}-redis",
    description=f"Redis cluster for {project_name} {env}",
    engine=cache["engine"],
    engine_version=cache["engine_version"],
    node_type=cache["node_type"],
    num_cache_clusters=cache["num_cache_nodes"],
    port=6379,
    parameter_group_name=cache_parameter_group.name,
    subnet_group_name=cache_subnet_group.name,
    security_group_ids=[cache_security_group.id],
    at_rest_encryption_enabled=cache["at_rest_encryption_enabled"],
    transit_encryption_enabled=cache["transit_encryption_enabled"],
    automatic_failover_enabled=cache["automatic_failover_enabled"],
    tags={**common_tags, "Name": f"{project_name}-{env}-redis"},
)

redis_endpoint = redis_cluster.configuration_endpoint_address

pulumi.export("redis_endpoint", redis_endpoint)
pulumi.export("redis_port", redis_cluster.port)

