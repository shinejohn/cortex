"""
ECR repositories for container images.
"""

import pulumi
import pulumi_aws as aws
from config import project_name, env, common_tags

# ECR Repositories
repositories = {}

repo_names = [
    "goeventcity",
    "daynews",
    "downtownguide",
    "golocalvoices",
    "alphasite",
    "inertia-ssr",
    "base-app",  # For Horizon and Scheduler
]

for repo_name in repo_names:
    repo = aws.ecr.Repository(
        f"{project_name}-{env}-{repo_name}",
        name=f"{project_name}/{env}/{repo_name}",
        image_tag_mutability="MUTABLE",
        image_scanning_configuration=aws.ecr.RepositoryImageScanningConfigurationArgs(
            scan_on_push=True,
        ),
        encryption_configurations=[
            aws.ecr.RepositoryEncryptionConfigurationArgs(
                encryption_type="AES256",
            )
        ],
        tags={**common_tags, "Name": f"{project_name}-{env}-{repo_name}"},
    )
    repositories[repo_name] = repo

pulumi.export("ecr_repositories", {k: v.repository_url for k, v in repositories.items()})

