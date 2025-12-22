"""
Fibonacco Infrastructure - Main Entry Point

This is the main Pulumi program that orchestrates all infrastructure components
for Day.News, GoEventCity, and Downtown Guide.

Usage:
    pulumi stack init dev          # Create dev environment
    pulumi stack init staging      # Create staging environment
    pulumi stack init production   # Create production environment
    
    pulumi up                      # Deploy current stack
    pulumi preview                 # Preview changes
    pulumi destroy                 # Tear down infrastructure
"""

import pulumi

# Import configuration
from config import project_name, env, common_tags

pulumi.log.info(f"Deploying {project_name} infrastructure to {env} environment")

# =============================================================================
# 1. NETWORKING
# =============================================================================
from networking import vpc, public_subnets, private_subnets, nat_gateway_ip

pulumi.log.info("✓ Networking configured")

# =============================================================================
# 2. DATABASE
# =============================================================================
from database import db_instance, db_endpoint, redis_cluster, redis_endpoint

pulumi.log.info("✓ Database configured")

# =============================================================================
# 3. STORAGE
# =============================================================================
from storage import app_bucket, archive_bucket, repositories

pulumi.log.info("✓ Storage configured")

# =============================================================================
# 4. LOAD BALANCING
# =============================================================================
from loadbalancing import alb, alb_dns_name, target_groups

pulumi.log.info("✓ Load balancing configured")

# =============================================================================
# 5. COMPUTE (ECS)
# =============================================================================
from compute import cluster, ecs_security_group, ssr_service, horizon_service
from compute.services import create_web_service
from config import domains

# Create web services with target groups from ALB
goeventcity_service = create_web_service(
    name="goeventcity",
    domain_config=domains["goeventcity"],
    target_group_arn=target_groups["goeventcity"].arn,
)

daynews_service = create_web_service(
    name="daynews",
    domain_config=domains["daynews"],
    target_group_arn=target_groups["daynews"].arn,
)

downtownguide_service = create_web_service(
    name="downtownguide",
    domain_config=domains["downtownguide"],
    target_group_arn=target_groups["downtownguide"].arn,
)

pulumi.log.info("✓ Compute configured")

# =============================================================================
# 6. MONITORING
# =============================================================================
from monitoring import alert_topic, dashboard

pulumi.log.info("✓ Monitoring configured")

# =============================================================================
# 7. AUTOMATION (Auto-remediation)
# =============================================================================
from automation import auto_remediation_lambda, capacity_warning_rule

pulumi.log.info("✓ Automation configured")

# =============================================================================
# SUMMARY EXPORTS
# =============================================================================
pulumi.export("summary", {
    "environment": env,
    "vpc_id": vpc.id,
    "database_endpoint": db_endpoint,
    "cache_endpoint": redis_endpoint,
    "load_balancer_dns": alb_dns_name,
    "domains": {
        "goeventcity": domains["goeventcity"]["domain"],
        "daynews": domains["daynews"]["domain"],
        "downtownguide": domains["downtownguide"]["domain"],
    },
})

pulumi.log.info(f"""
================================================================================
Fibonacco Infrastructure Deployment Summary ({env})
================================================================================

VPC:           {project_name}-{env}
Database:      PostgreSQL (RDS)
Cache:         Redis (ElastiCache)
Compute:       ECS Fargate

Services:
  - GoEventCity:    {domains['goeventcity']['domain']}
  - Day.News:       {domains['daynews']['domain']}
  - Downtown Guide: {domains['downtownguide']['domain']}
  - Inertia SSR:    Internal (Service Discovery)
  - Horizon:        Queue Worker

Monitoring:    CloudWatch Dashboard + Alarms
Automation:    Auto-scaling remediation {'enabled' if auto_remediation_lambda else 'disabled'}

================================================================================
Run 'pulumi stack output' to see connection details
================================================================================
""")
