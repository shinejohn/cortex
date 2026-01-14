"""
Compute module for Fibonacco infrastructure.

Exports:
    cluster: ECS cluster
    ecs_security_group: Security group for ECS tasks
    ssr_service: Inertia SSR service
    horizon_service: Horizon queue worker service
    test_runner_lambda: Lambda function for running tests
"""

from .cluster import cluster, ecs_security_group
from .service_discovery import private_dns_namespace, ssr_service_discovery
from .services import ssr_service, horizon_service
# Temporarily disabled - Lambda image doesn't exist in ECR yet
# from .lambda_test_runner import test_runner_lambda

__all__ = ["cluster", "ecs_security_group", "private_dns_namespace", "ssr_service_discovery", "ssr_service", "horizon_service"]  # "test_runner_lambda"]

