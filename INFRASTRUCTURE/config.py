"""
Fibonacco Infrastructure Configuration

Environment-aware configuration that scales resources appropriately
for dev, staging, and production environments.
"""

import pulumi

# Get current stack (environment) name
env = pulumi.get_stack()
is_production = env == "production"
is_staging = env == "staging"
is_dev = not is_production and not is_staging

# Project naming
project_name = "fibonacco"
aws_region = "us-east-1"

# Tags applied to all resources
common_tags = {
    "Project": project_name,
    "Environment": env,
    "ManagedBy": "Pulumi",
}


# =============================================================================
# NETWORKING CONFIGURATION
# =============================================================================
networking = {
    "vpc_cidr": "10.0.0.0/16",
    "availability_zones": ["us-east-1a", "us-east-1b"] if not is_production else ["us-east-1a", "us-east-1b", "us-east-1c"],
    "public_subnet_cidrs": ["10.0.1.0/24", "10.0.2.0/24"] if not is_production else ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"],
    "private_subnet_cidrs": ["10.0.10.0/24", "10.0.20.0/24"] if not is_production else ["10.0.10.0/24", "10.0.20.0/24", "10.0.30.0/24"],
    "enable_nat_gateway": True,
    "single_nat_gateway": not is_production,  # Cost saving for non-prod
}


# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
database = {
    "engine": "postgres",
    "engine_version": "15",
    "instance_class": "db.r6g.large" if is_production else ("db.t3.small" if is_staging else "db.t3.micro"),
    "allocated_storage": 100 if is_production else 20,
    "max_allocated_storage": 500 if is_production else 100,
    "storage_type": "gp3",
    "multi_az": is_production,
    "backup_retention_period": 7 if is_production else 1,
    "skip_final_snapshot": not is_production,
    "deletion_protection": is_production,
    "performance_insights_enabled": is_production or is_staging,
}


# =============================================================================
# CACHE CONFIGURATION (ElastiCache / Valkey)
# =============================================================================
cache = {
    "engine": "redis",
    "engine_version": "7.0",
    "node_type": "cache.r6g.large" if is_production else ("cache.t3.small" if is_staging else "cache.t3.micro"),
    "num_cache_nodes": 2 if is_production else 1,
    "automatic_failover_enabled": is_production,
    "at_rest_encryption_enabled": True,
    "transit_encryption_enabled": True,
}


# =============================================================================
# ECS / COMPUTE CONFIGURATION
# =============================================================================
ecs = {
    "cpu": 512 if is_production else 256,
    "memory": 1024 if is_production else 512,
    "desired_count": 2 if is_production else 1,
    "min_capacity": 2 if is_production else 1,
    "max_capacity": 20 if is_production else (5 if is_staging else 2),
    "health_check_grace_period": 60,
    "deployment_minimum_healthy_percent": 50 if is_production else 0,
    "deployment_maximum_percent": 200,
}

# Inertia SSR specific
ecs_ssr = {
    "cpu": 256,
    "memory": 512,
    "desired_count": 2 if is_production else 1,
    "min_capacity": 2 if is_production else 1,
    "max_capacity": 10 if is_production else 2,
    "port": 13714,
}

# Horizon (queue worker)
ecs_horizon = {
    "cpu": 512 if is_production else 256,
    "memory": 1024 if is_production else 512,
    "desired_count": 1,
    "min_capacity": 1,
    "max_capacity": 4 if is_production else 2,
}


# =============================================================================
# STORAGE CONFIGURATION
# =============================================================================
storage = {
    "versioning_enabled": True,
    "lifecycle_rules": {
        "archive_after_days": 90,
        "glacier_after_days": 365,
        "deep_archive_after_days": 1825,  # 5 years
    },
}


# =============================================================================
# CDN / CLOUDFRONT CONFIGURATION
# =============================================================================
cdn = {
    "enabled": is_production or is_staging,
    "price_class": "PriceClass_100" if is_production else "PriceClass_100",  # US, Canada, Europe
    "default_ttl": 300,  # 5 minutes
    "max_ttl": 3600,  # 1 hour
    "min_ttl": 0,
}


# =============================================================================
# DOMAINS CONFIGURATION - Multisite Applications
# =============================================================================
# All 5 applications share the same infrastructure but use different domains
# Domain-based routing in Laravel handles app selection
domains = {
    "goeventcity": {
        "domain": "goeventcity.com" if is_production else f"{env}.goeventcity.com",
        "health_check_path": "/healthcheck",  # Laravel health check endpoint
        "app_name": "event-city",
    },
    "daynews": {
        "domain": "day.news" if is_production else f"{env}.day.news",
        "health_check_path": "/healthcheck",
        "app_name": "day-news",
    },
    "downtownguide": {
        "domain": "downtownsguide.com" if is_production else f"{env}.downtownsguide.com",
        "health_check_path": "/healthcheck",
        "app_name": "downtown-guide",
    },
    "golocalvoices": {
        "domain": "golocalvoices.com" if is_production else f"{env}.golocalvoices.com",
        "health_check_path": "/healthcheck",
        "app_name": "local-voices",
    },
    "alphasite": {
        "domain": "alphasite.ai" if is_production else f"{env}.alphasite.ai",
        "health_check_path": "/healthcheck",
        "app_name": "alphasite",
    },
}


# =============================================================================
# MONITORING / ALERTING CONFIGURATION
# =============================================================================
monitoring = {
    "alarm_email": pulumi.Config().get("alarm_email") or "alerts@fibonacco.com",
    "slack_webhook": pulumi.Config().get_secret("slack_webhook"),
    "cpu_alarm_threshold": 80,
    "memory_alarm_threshold": 80,
    "db_cpu_alarm_threshold": 80,
    "db_connections_alarm_threshold": 100,
    "cache_evictions_alarm_threshold": 1000,
}


# =============================================================================
# AUTO-REMEDIATION CONFIGURATION
# =============================================================================
automation = {
    "enabled": is_production or is_staging,
    "max_auto_scale_ceiling": 50,  # Hard limit for automatic scaling
    "scale_up_percentage": 50,  # Increase by 50% when auto-scaling
    "cooldown_minutes": 5,
}
