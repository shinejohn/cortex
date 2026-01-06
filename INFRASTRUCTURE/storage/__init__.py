"""
Storage module for Fibonacco infrastructure.

Exports:
    app_bucket: S3 bucket for application storage
    archive_bucket: S3 bucket for archive storage
    repositories: ECR repositories
"""

from .s3 import app_bucket, archive_bucket
from .ecr import repositories

__all__ = ["app_bucket", "archive_bucket", "repositories"]

