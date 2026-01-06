"""
VPC, Subnets, and NAT Gateway configuration.
"""

import pulumi
import pulumi_aws as aws
from config import project_name, env, common_tags, networking, aws_region

# Get availability zones
availability_zones = networking["availability_zones"]

# Create VPC
vpc = aws.ec2.Vpc(
    f"{project_name}-{env}-vpc",
    cidr_block=networking["vpc_cidr"],
    enable_dns_hostnames=True,
    enable_dns_support=True,
    tags={**common_tags, "Name": f"{project_name}-{env}-vpc"},
)

# Internet Gateway
igw = aws.ec2.InternetGateway(
    f"{project_name}-{env}-igw",
    vpc_id=vpc.id,
    tags={**common_tags, "Name": f"{project_name}-{env}-igw"},
)

# Public Subnets
public_subnets = []
for idx, (az, cidr) in enumerate(zip(availability_zones, networking["public_subnet_cidrs"])):
    subnet = aws.ec2.Subnet(
        f"{project_name}-{env}-public-subnet-{idx+1}",
        vpc_id=vpc.id,
        cidr_block=cidr,
        availability_zone=az,
        map_public_ip_on_launch=True,
        tags={**common_tags, "Name": f"{project_name}-{env}-public-{az[-1]}", "Type": "Public"},
    )
    public_subnets.append(subnet)

# Private Subnets
private_subnets = []
for idx, (az, cidr) in enumerate(zip(availability_zones, networking["private_subnet_cidrs"])):
    subnet = aws.ec2.Subnet(
        f"{project_name}-{env}-private-subnet-{idx+1}",
        vpc_id=vpc.id,
        cidr_block=cidr,
        availability_zone=az,
        tags={**common_tags, "Name": f"{project_name}-{env}-private-{az[-1]}", "Type": "Private"},
    )
    private_subnets.append(subnet)

# Elastic IP for NAT Gateway
nat_eip = aws.ec2.Eip(
    f"{project_name}-{env}-nat-eip",
    domain="vpc",
    tags={**common_tags, "Name": f"{project_name}-{env}-nat-eip"},
    opts=pulumi.ResourceOptions(depends_on=[igw]),
)

# NAT Gateway (in first public subnet)
nat_gateway = aws.ec2.NatGateway(
    f"{project_name}-{env}-nat",
    allocation_id=nat_eip.id,
    subnet_id=public_subnets[0].id,
    tags={**common_tags, "Name": f"{project_name}-{env}-nat"},
)

nat_gateway_ip = nat_eip.public_ip

# Route Table for Public Subnets
public_route_table = aws.ec2.RouteTable(
    f"{project_name}-{env}-public-rt",
    vpc_id=vpc.id,
    routes=[
        aws.ec2.RouteTableRouteArgs(
            cidr_block="0.0.0.0/0",
            gateway_id=igw.id,
        )
    ],
    tags={**common_tags, "Name": f"{project_name}-{env}-public-rt"},
)

# Associate Public Subnets with Public Route Table
for idx, subnet in enumerate(public_subnets):
    aws.ec2.RouteTableAssociation(
        f"{project_name}-{env}-public-rta-{idx+1}",
        subnet_id=subnet.id,
        route_table_id=public_route_table.id,
    )

# Route Table for Private Subnets
private_route_table = aws.ec2.RouteTable(
    f"{project_name}-{env}-private-rt",
    vpc_id=vpc.id,
    routes=[
        aws.ec2.RouteTableRouteArgs(
            cidr_block="0.0.0.0/0",
            nat_gateway_id=nat_gateway.id,
        )
    ],
    tags={**common_tags, "Name": f"{project_name}-{env}-private-rt"},
)

# Associate Private Subnets with Private Route Table
for idx, subnet in enumerate(private_subnets):
    aws.ec2.RouteTableAssociation(
        f"{project_name}-{env}-private-rta-{idx+1}",
        subnet_id=subnet.id,
        route_table_id=private_route_table.id,
    )

# Export values
pulumi.export("vpc_id", vpc.id)
pulumi.export("public_subnet_ids", [s.id for s in public_subnets])
pulumi.export("private_subnet_ids", [s.id for s in private_subnets])

