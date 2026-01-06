"""
RDS PostgreSQL database configuration.
"""

import pulumi
import pulumi_aws as aws
from config import project_name, env, common_tags, database
from networking import vpc, private_subnets

# Subnet Group for RDS
db_subnet_group = aws.rds.SubnetGroup(
    f"{project_name}-{env}-db-subnet-group",
    subnet_ids=[subnet.id for subnet in private_subnets],
    tags={**common_tags, "Name": f"{project_name}-{env}-db-subnet-group"},
)

# Security Group for RDS
db_security_group = aws.ec2.SecurityGroup(
    f"{project_name}-{env}-db-sg",
    description="Security group for RDS PostgreSQL",
    vpc_id=vpc.id,
    ingress=[
        aws.ec2.SecurityGroupIngressArgs(
            description="PostgreSQL from VPC",
            from_port=5432,
            to_port=5432,
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
    tags={**common_tags, "Name": f"{project_name}-{env}-db-sg"},
)

# RDS Parameter Group
# Using default parameter group to avoid static parameter issues
# Custom parameters can be set later via RDS console or separate parameter group
db_parameter_group = None  # Use default parameter group

# Get database password from config (should be set as secret)
config = pulumi.Config()
db_password = config.get_secret("db_password") or pulumi.Output.secret("ChangeMe123!")

# RDS Instance
db_instance = aws.rds.Instance(
    f"{project_name}-{env}-db",
    engine=database["engine"],
    engine_version=database["engine_version"],
    instance_class=database["instance_class"],
    allocated_storage=database["allocated_storage"],
    max_allocated_storage=database["max_allocated_storage"],
    storage_type=database["storage_type"],
    storage_encrypted=True,
    db_name="fibonacco",
    username="postgres",
    password=db_password,
    db_subnet_group_name=db_subnet_group.name,
    vpc_security_group_ids=[db_security_group.id],
    # parameter_group_name=db_parameter_group.name if db_parameter_group else None,  # Use default
    multi_az=database["multi_az"],
    backup_retention_period=database["backup_retention_period"],
    skip_final_snapshot=database["skip_final_snapshot"],
    final_snapshot_identifier=None if database["skip_final_snapshot"] else f"{project_name}-{env}-final-snapshot",
    deletion_protection=database["deletion_protection"],
    performance_insights_enabled=database["performance_insights_enabled"],
    publicly_accessible=False,
    tags={**common_tags, "Name": f"{project_name}-{env}-db"},
)

db_endpoint = db_instance.endpoint

pulumi.export("db_endpoint", db_endpoint)
pulumi.export("db_instance_id", db_instance.id)

