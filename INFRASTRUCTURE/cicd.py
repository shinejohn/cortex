"""
CI/CD Infrastructure - CodePipeline and CodeBuild

Sets up AWS CodePipeline with CodeBuild projects for building Docker images
and deploying to ECS.
"""

import pulumi
import pulumi_aws as aws
from config import project_name, env, common_tags

# =============================================================================
# IAM Roles for CodePipeline and CodeBuild
# =============================================================================

# CodePipeline Service Role
codepipeline_role = aws.iam.Role(
    f"{project_name}-codepipeline-role",
    assume_role_policy=aws.iam.get_policy_document(
        statements=[
            {
                "effect": "Allow",
                "principals": [{
                    "type": "Service",
                    "identifiers": ["codepipeline.amazonaws.com"],
                }],
                "actions": ["sts:AssumeRole"],
            }
        ]
    ).json,
    tags=common_tags,
)

# CodePipeline needs permissions for CodeBuild, S3, and CloudWatch
codepipeline_policy = aws.iam.RolePolicy(
    f"{project_name}-codepipeline-policy",
    role=codepipeline_role.id,
    policy=aws.iam.get_policy_document(
        statements=[
            {
                "effect": "Allow",
                "actions": [
                    "s3:GetObject",
                    "s3:GetObjectVersion",
                    "s3:PutObject",
                    "s3:GetBucketVersioning",
                ],
                "resources": [
                    f"arn:aws:s3:::*-pipeline-artifacts/*",
                    f"arn:aws:s3:::*-pipeline-artifacts",
                ],
            },
            {
                "effect": "Allow",
                "actions": [
                    "codebuild:BatchGetBuilds",
                    "codebuild:StartBuild",
                ],
                "resources": ["*"],
            },
            {
                "effect": "Allow",
                "actions": [
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents",
                ],
                "resources": ["*"],
            },
        ]
    ).json,
)

# CodeBuild Service Role
codebuild_role = aws.iam.Role(
    f"{project_name}-codebuild-role",
    assume_role_policy=aws.iam.get_policy_document(
        statements=[
            {
                "effect": "Allow",
                "principals": [{
                    "type": "Service",
                    "identifiers": ["codebuild.amazonaws.com"],
                }],
                "actions": ["sts:AssumeRole"],
            }
        ]
    ).json,
    tags=common_tags,
)

# CodeBuild needs permissions for ECR, ECS, and CloudWatch Logs
codebuild_policy = aws.iam.RolePolicy(
    f"{project_name}-codebuild-policy",
    role=codebuild_role.id,
    policy=aws.iam.get_policy_document(
        statements=[
            {
                "effect": "Allow",
                "actions": [
                    "ecr:GetAuthorizationToken",
                    "ecr:BatchCheckLayerAvailability",
                    "ecr:GetDownloadUrlForLayer",
                    "ecr:BatchGetImage",
                    "ecr:PutImage",
                    "ecr:InitiateLayerUpload",
                    "ecr:UploadLayerPart",
                    "ecr:CompleteLayerUpload",
                ],
                "resources": ["*"],
            },
            {
                "effect": "Allow",
                "actions": [
                    "ecs:UpdateService",
                    "ecs:DescribeServices",
                    "ecs:DescribeTaskDefinition",
                ],
                "resources": ["*"],
            },
            {
                "effect": "Allow",
                "actions": [
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents",
                ],
                "resources": ["*"],
            },
            {
                "effect": "Allow",
                "actions": ["s3:*"],
                "resources": ["*"],
            },
        ]
    ).json,
)

# =============================================================================
# CodeBuild Projects for Docker Builds
# =============================================================================

# Import ECR repositories
from storage import repositories

# Get AWS account ID from config (set via: pulumi config set aws_account_id 195430954683)
config = pulumi.Config()
aws_account_id = config.require("aws_account_id")

# Services that need Docker builds
services = [
    {"name": "goeventcity", "dockerfile": "docker/Dockerfile.web"},
    {"name": "daynews", "dockerfile": "docker/Dockerfile.web"},
    {"name": "downtownguide", "dockerfile": "docker/Dockerfile.web"},
    {"name": "alphasite", "dockerfile": "docker/Dockerfile.web"},
    {"name": "golocalvoices", "dockerfile": "docker/Dockerfile.web"},
    {"name": "base-app", "dockerfile": "docker/Dockerfile.base-app"},
    {"name": "inertia-ssr", "dockerfile": "docker/Dockerfile.inertia-ssr"},
]

codebuild_projects = {}

for service in services:
    service_name = service["name"]
    dockerfile = service["dockerfile"]
    
    # Get ECR repository
    ecr_repo = repositories.get(service_name)
    if not ecr_repo:
        pulumi.log.warn(f"ECR repository not found for {service_name}, skipping CodeBuild project")
        continue
    
    # CodeBuild project for this service
    project = aws.codebuild.Project(
        f"{project_name}-{service_name}-build",
        name=f"{project_name}-{env}-{service_name}-build",
        description=f"Build Docker image for {service_name}",
        service_role=codebuild_role.arn,
        artifacts=aws.codebuild.ProjectArtifactsArgs(
            type="NO_ARTIFACTS",
        ),
        environment=aws.codebuild.ProjectEnvironmentArgs(
            type="LINUX_CONTAINER",
            image="aws/codebuild/standard:7.0",
            compute_type="BUILD_GENERAL1_MEDIUM",
            privileged_mode=True,  # Required for Docker builds
            environment_variables=[
                aws.codebuild.ProjectEnvironmentEnvironmentVariableArgs(
                    name="AWS_DEFAULT_REGION",
                    value="us-east-1",
                ),
                aws.codebuild.ProjectEnvironmentEnvironmentVariableArgs(
                    name="AWS_ACCOUNT_ID",
                    value=aws_account_id,
                ),
                aws.codebuild.ProjectEnvironmentEnvironmentVariableArgs(
                    name="ECR_REPOSITORY",
                    value=ecr_repo.repository_url,
                ),
                aws.codebuild.ProjectEnvironmentEnvironmentVariableArgs(
                    name="IMAGE_TAG",
                    value="latest",
                ),
                aws.codebuild.ProjectEnvironmentEnvironmentVariableArgs(
                    name="DOCKERFILE",
                    value=dockerfile,
                ),
                aws.codebuild.ProjectEnvironmentEnvironmentVariableArgs(
                    name="SERVICE_NAME",
                    value=service_name,
                ),
            ],
        ),
        source=aws.codebuild.ProjectSourceArgs(
            type="CODEPIPELINE",
            buildspec="""version: 0.2
phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
      - echo Build started on `date`
      - echo Building Docker image...
  build:
    commands:
      - echo Building the Docker image...
      - docker build -f $DOCKERFILE -t $ECR_REPOSITORY:$IMAGE_TAG -t $ECR_REPOSITORY:$CODEBUILD_RESOLVED_SOURCE_VERSION .
      - echo Build completed on `date`
  post_build:
    commands:
      - echo Pushing the Docker images...
      - docker push $ECR_REPOSITORY:$IMAGE_TAG
      - docker push $ECR_REPOSITORY:$CODEBUILD_RESOLVED_SOURCE_VERSION
      - echo Writing image definitions file...
      - printf '[{"name":"%s","imageUri":"%s:%s"}]' $SERVICE_NAME $ECR_REPOSITORY $CODEBUILD_RESOLVED_SOURCE_VERSION > imagedefinitions.json
artifacts:
  files:
    - imagedefinitions.json
""",
        ),
        logs_config=aws.codebuild.ProjectLogsConfigArgs(
            cloudwatch_logs=aws.codebuild.ProjectLogsConfigCloudwatchLogsArgs(
                group_name=f"/aws/codebuild/{project_name}-{env}-{service_name}",
                stream_name="build",
            ),
        ),
        tags=common_tags,
    )
    
    codebuild_projects[service_name] = project

# =============================================================================
# CodePipeline
# =============================================================================

# S3 bucket for CodePipeline artifacts
pipeline_artifacts_bucket = aws.s3.Bucket(
    f"{project_name}-pipeline-artifacts",
    bucket=f"{project_name}-{env}-pipeline-artifacts",
    force_destroy=True,
    tags=common_tags,
)

pipeline_artifacts_bucket_versioning = aws.s3.BucketVersioning(
    f"{project_name}-pipeline-artifacts-versioning",
    bucket=pipeline_artifacts_bucket.id,
    versioning_configuration=aws.s3.BucketVersioningVersioningConfigurationArgs(
        status="Enabled",
    ),
)

# CodePipeline with GitHub source
pipeline = aws.codepipeline.Pipeline(
    f"{project_name}-pipeline",
    name=f"{project_name}-{env}-pipeline",
    role_arn=codepipeline_role.arn,
    artifact_stores=[aws.codepipeline.PipelineArtifactStoreArgs(
        location=pipeline_artifacts_bucket.bucket,
        type="S3",
    )],
    stages=[
        # Source Stage - GitHub
        aws.codepipeline.PipelineStageArgs(
            name="Source",
            actions=[aws.codepipeline.PipelineStageActionArgs(
                name="Source",
                category="Source",
                owner="ThirdParty",
                provider="GitHub",
                version="1",
                output_artifacts=["source_output"],
                configuration={
                    "Owner": "shinejohn",  # Update with your GitHub username/org
                    "Repo": "Community-Platform",  # Update with your repo name
                    "Branch": "main",
                    "OAuthToken": config.require_secret("github_token"),  # Set via: pulumi config set --secret github_token <token>
                    "PollForSourceChanges": "false",  # Use webhooks instead
                },
            )],
        ),
        # Build Stage - CodeBuild for each service
        aws.codepipeline.PipelineStageArgs(
            name="Build",
            actions=[
                aws.codepipeline.PipelineStageActionArgs(
                    name=f"Build-{service_name}",
                    category="Build",
                    owner="AWS",
                    provider="CodeBuild",
                    version="1",
                    input_artifacts=["source_output"],
                    output_artifacts=[f"{service_name}_output"],
                    configuration={
                        "ProjectName": project.name,
                    },
                )
                for service_name, project in codebuild_projects.items()
            ],
        ),
    ],
    tags=common_tags,
)

# Export CodePipeline name
pulumi.export("pipeline_name", pipeline.name)
pulumi.export("pipeline_arn", pipeline.arn)

