"""
AWS Cloud Map Service Discovery configuration for ECS services.
"""

import pulumi
import pulumi_aws as aws
from config import project_name, env, common_tags
from networking import vpc

# Private DNS Namespace for service discovery
private_dns_namespace = aws.servicediscovery.PrivateDnsNamespace(
    f"{project_name}-{env}-namespace",
    name=f"{project_name}-{env}.local",
    description=f"Private DNS namespace for {project_name} {env} environment",
    vpc=vpc.id,
    tags=common_tags,
)

# Service Discovery Service for SSR
ssr_service_discovery = aws.servicediscovery.Service(
    f"{project_name}-{env}-ssr-discovery",
    name="ssr",
    description=f"Inertia SSR service discovery for {project_name} {env}",
    dns_config=aws.servicediscovery.ServiceDnsConfigArgs(
        namespace_id=private_dns_namespace.id,
        dns_records=[
            aws.servicediscovery.ServiceDnsConfigDnsRecordArgs(
                ttl=60,
                type="A",
            )
        ],
        routing_policy="MULTIVALUE",
    ),
    health_check_custom_config=aws.servicediscovery.ServiceHealthCheckCustomConfigArgs(
        failure_threshold=1,
    ),
    tags=common_tags,
)

pulumi.export("service_discovery_namespace_id", private_dns_namespace.id)
pulumi.export("service_discovery_namespace_name", private_dns_namespace.name)
pulumi.export("ssr_service_discovery_arn", ssr_service_discovery.arn)
pulumi.export("ssr_service_discovery_id", ssr_service_discovery.id)

