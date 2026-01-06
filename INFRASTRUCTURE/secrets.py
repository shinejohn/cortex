"""
AWS Secrets Manager configuration for application secrets.
"""

import json
import pulumi
import pulumi_aws as aws
from config import project_name, env, common_tags
from database import db_endpoint, db_instance
from database.elasticache import redis_endpoint, redis_cluster

# Parse database endpoint
db_host = db_endpoint.apply(lambda e: e.split(":")[0] if ":" in str(e) else str(e))
db_port = db_endpoint.apply(lambda e: e.split(":")[1] if ":" in str(e) else "5432")

# Parse Redis endpoint
redis_host = redis_endpoint
redis_port = redis_cluster.port

# Get database password from Pulumi config
config = pulumi.Config()
db_password = config.get_secret("db_password") or pulumi.Output.secret("ChangeMe123!")

# Generate APP_KEY (base64 encoded 32-byte key)
# In production, this should be set manually via: pulumi config set --secret app_key "base64:..."
# For now, generate a placeholder that will be replaced
app_key = config.get_secret("app_key") or pulumi.Output.secret("base64:ChangeMe123!ChangeMe123!ChangeMe123!ChangeMe123!")

# Create secret JSON
secret_string = pulumi.Output.all(
    db_host=db_host,
    db_port=db_port,
    db_password=db_password,
    redis_host=redis_host,
    redis_port=redis_port,
    app_key=app_key,
).apply(lambda args: json.dumps({
    "DB_CONNECTION": "pgsql",
    "DB_HOST": args["db_host"],
    "DB_PORT": args["db_port"],
    "DB_DATABASE": "fibonacco",
    "DB_USERNAME": "postgres",
    "DB_PASSWORD": args["db_password"],
    "REDIS_HOST": args["redis_host"],
    "REDIS_PORT": str(args["redis_port"]),
    "REDIS_PASSWORD": "",
    "APP_KEY": args["app_key"],
    "APP_ENV": env,
    "CACHE_STORE": "redis",
    "QUEUE_CONNECTION": "redis",
    "SESSION_DRIVER": "redis",
}))

# Create Secrets Manager secret
app_secret = aws.secretsmanager.Secret(
    f"{project_name}-{env}-app-secrets",
    name=f"fibonacco/{env}/app-secrets",
    description=f"Application secrets for {project_name} {env}",
    tags=common_tags,
)

# Create secret version with the actual secret string
app_secret_version = aws.secretsmanager.SecretVersion(
    f"{project_name}-{env}-app-secrets-version",
    secret_id=app_secret.id,
    secret_string=secret_string,
)

# Export secret ARN
pulumi.export("app_secret_arn", app_secret.arn)

