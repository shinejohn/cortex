"""
Networking module for Fibonacco infrastructure.

Exports:
    vpc: VPC resource
    public_subnets: List of public subnet resources
    private_subnets: List of private subnet resources
    nat_gateway_ip: NAT Gateway public IP
"""

from .vpc import vpc, public_subnets, private_subnets, nat_gateway_ip

__all__ = ["vpc", "public_subnets", "private_subnets", "nat_gateway_ip"]

