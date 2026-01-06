"""
S3 buckets for application and archive storage.
"""

import pulumi
import pulumi_aws as aws
from config import project_name, env, common_tags, storage

# Application Storage Bucket
app_bucket = aws.s3.BucketV2(
    f"{project_name}-{env}-app-storage",
    bucket=f"{project_name}-{env}-app-storage",
    tags={**common_tags, "Name": f"{project_name}-{env}-app-storage"},
)

# Enable versioning
aws.s3.BucketVersioningV2(
    f"{project_name}-{env}-app-storage-versioning",
    bucket=app_bucket.id,
    versioning_configuration=aws.s3.BucketVersioningV2VersioningConfigurationArgs(
        status="Enabled" if storage["versioning_enabled"] else "Disabled",
    ),
)

# Block public access
aws.s3.BucketPublicAccessBlock(
    f"{project_name}-{env}-app-storage-pab",
    bucket=app_bucket.id,
    block_public_acls=True,
    block_public_policy=True,
    ignore_public_acls=True,
    restrict_public_buckets=True,
)

# Archive Storage Bucket with Lifecycle Rules
archive_bucket = aws.s3.BucketV2(
    f"{project_name}-{env}-archive",
    bucket=f"{project_name}-{env}-archive",
    tags={**common_tags, "Name": f"{project_name}-{env}-archive"},
)

# Lifecycle configuration for archive bucket
aws.s3.BucketLifecycleConfigurationV2(
    f"{project_name}-{env}-archive-lifecycle",
    bucket=archive_bucket.id,
    rules=[
        aws.s3.BucketLifecycleConfigurationV2RuleArgs(
            id="archive-to-standard-ia",
            status="Enabled",
            transitions=[
                aws.s3.BucketLifecycleConfigurationV2RuleTransitionArgs(
                    days=storage["lifecycle_rules"]["archive_after_days"],
                    storage_class="STANDARD_IA",
                ),
                aws.s3.BucketLifecycleConfigurationV2RuleTransitionArgs(
                    days=storage["lifecycle_rules"]["glacier_after_days"],
                    storage_class="GLACIER_IR",
                ),
                aws.s3.BucketLifecycleConfigurationV2RuleTransitionArgs(
                    days=storage["lifecycle_rules"]["deep_archive_after_days"],
                    storage_class="DEEP_ARCHIVE",
                ),
            ],
        ),
    ],
)

# Block public access for archive
aws.s3.BucketPublicAccessBlock(
    f"{project_name}-{env}-archive-pab",
    bucket=archive_bucket.id,
    block_public_acls=True,
    block_public_policy=True,
    ignore_public_acls=True,
    restrict_public_buckets=True,
)

pulumi.export("app_bucket_name", app_bucket.id)
pulumi.export("archive_bucket_name", archive_bucket.id)

