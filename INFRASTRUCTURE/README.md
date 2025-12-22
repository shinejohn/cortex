# Fibonacco AWS Infrastructure

Infrastructure as Code (IaC) for the Fibonacco platform using **Pulumi** with **Python**.

## Architecture Overview

This infrastructure supports three web applications:
- **GoEventCity** (goeventcity.com) - Event calendar platform
- **Day.News** (day.news) - Local news platform
- **Downtown Guide** (downtownsguide.com) - Business directory

### Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AWS Infrastructure                             │
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                     │
│  │ CloudFront  │    │     ALB     │    │  Route 53   │                     │
│  │    (CDN)    │───▶│  (Load Bal) │◀───│    (DNS)    │                     │
│  └─────────────┘    └──────┬──────┘    └─────────────┘                     │
│                            │                                                │
│         ┌──────────────────┼──────────────────┐                            │
│         │                  │                  │                            │
│         ▼                  ▼                  ▼                            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                     │
│  │ GoEventCity │    │  Day.News   │    │  Downtown   │                     │
│  │   (ECS)     │    │   (ECS)     │    │   Guide     │                     │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                     │
│         │                  │                  │                            │
│         └──────────────────┼──────────────────┘                            │
│                            │                                                │
│              ┌─────────────┼─────────────┐                                 │
│              │             │             │                                 │
│              ▼             ▼             ▼                                 │
│       ┌───────────┐ ┌───────────┐ ┌───────────┐                           │
│       │ Inertia   │ │  Horizon  │ │ Scheduler │                           │
│       │   SSR     │ │  (Queue)  │ │  (Cron)   │                           │
│       └───────────┘ └───────────┘ └───────────┘                           │
│              │             │             │                                 │
│              └─────────────┼─────────────┘                                 │
│                            │                                                │
│         ┌──────────────────┼──────────────────┐                            │
│         │                  │                  │                            │
│         ▼                  ▼                  ▼                            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                     │
│  │    RDS      │    │ ElastiCache │    │     S3      │                     │
│  │ PostgreSQL  │    │   (Redis)   │    │  (Storage)  │                     │
│  └─────────────┘    └─────────────┘    └─────────────┘                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Prerequisites

1. **Pulumi CLI**: Install from https://www.pulumi.com/docs/install/
2. **Python 3.11+**: Required for running Pulumi programs
3. **AWS CLI**: Configured with appropriate credentials
4. **Pulumi Account**: Free tier at https://app.pulumi.com

## Quick Start

```bash
# 1. Clone and navigate to infrastructure
cd infrastructure

# 2. Create Python virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Login to Pulumi
pulumi login

# 5. Create and select a stack (environment)
pulumi stack init dev        # For development
# pulumi stack init staging  # For staging
# pulumi stack init production  # For production

# 6. Configure AWS region
pulumi config set aws:region us-east-1

# 7. Set required secrets
pulumi config set --secret db_password "your-secure-password"
pulumi config set --secret slack_webhook "https://hooks.slack.com/..."

# 8. Preview changes
pulumi preview

# 9. Deploy
pulumi up
```

## Project Structure

```
infrastructure/
├── __main__.py              # Entry point - orchestrates all modules
├── config.py                # Environment-aware configuration
├── Pulumi.yaml              # Project definition
├── Pulumi.dev.yaml          # Dev stack config
├── Pulumi.staging.yaml      # Staging stack config
├── Pulumi.production.yaml   # Production stack config
├── requirements.txt         # Python dependencies
│
├── networking/              # VPC, subnets, NAT Gateway
│   ├── __init__.py
│   └── vpc.py
│
├── database/                # RDS PostgreSQL, ElastiCache Redis
│   ├── __init__.py
│   ├── rds.py
│   └── elasticache.py
│
├── storage/                 # S3 buckets, ECR repositories
│   ├── __init__.py
│   ├── s3.py
│   └── ecr.py
│
├── compute/                 # ECS cluster and services
│   ├── __init__.py
│   ├── cluster.py
│   └── services.py
│
├── loadbalancing/           # ALB, target groups, SSL
│   ├── __init__.py
│   └── alb.py
│
├── cdn/                     # CloudFront distributions
│   └── __init__.py
│
├── dns/                     # Route53 hosted zones and records
│   └── __init__.py
│
├── monitoring/              # CloudWatch alarms and dashboards
│   ├── __init__.py
│   └── cloudwatch.py
│
└── automation/              # Auto-remediation Lambda
    ├── __init__.py
    └── remediation.py
```

## Environments

| Environment | Stack Name | Use Case |
|-------------|------------|----------|
| Development | `dev` or `dev-{name}` | Individual developer testing |
| Staging | `staging` | Pre-production testing |
| Production | `production` | Live traffic |

### Resource Scaling by Environment

| Resource | Dev | Staging | Production |
|----------|-----|---------|------------|
| RDS Instance | db.t3.micro | db.t3.small | db.r6g.large |
| RDS Multi-AZ | No | No | Yes |
| ElastiCache | cache.t3.micro | cache.t3.small | cache.r6g.large |
| ECS Tasks | 1 | 1-5 | 2-20 |
| NAT Gateway | 1 | 1 | 3 (multi-AZ) |

## Commands Reference

```bash
# Stack management
pulumi stack ls                    # List all stacks
pulumi stack select <name>         # Switch to a stack
pulumi stack rm <name>             # Delete a stack

# Deployment
pulumi preview                     # Preview changes
pulumi up                          # Deploy changes
pulumi up --yes                    # Deploy without confirmation
pulumi refresh                     # Sync state with AWS

# Outputs
pulumi stack output                # View all outputs
pulumi stack output db_endpoint    # View specific output

# Configuration
pulumi config                      # View config
pulumi config set key value        # Set config
pulumi config set --secret key val # Set secret

# Destruction
pulumi destroy                     # Tear down all resources
```

## Developer Environments

Create an isolated environment for each developer:

```bash
# Create your personal stack
pulumi stack init dev-shine
pulumi up

# This creates completely isolated:
# - VPC
# - Database
# - Cache
# - ECS services
# - Everything!
```

## Auto-Remediation

The infrastructure includes automatic scaling remediation:

1. **CloudWatch** monitors ECS task counts
2. **When capacity reaches 80%**, an alarm triggers
3. **EventBridge** routes alarm to Lambda
4. **Lambda** automatically increases `maxCapacity` by 50%
5. **SNS** sends notification of action taken

Configure in `config.py`:
```python
automation = {
    "enabled": True,
    "max_auto_scale_ceiling": 50,  # Hard limit
    "scale_up_percentage": 50,      # Increase by 50%
}
```

## Secrets Management

Secrets are stored in AWS Secrets Manager and referenced in ECS task definitions:

- Database password: `fibonacco/{env}/database`
- App key: `fibonacco/{env}/app-key`

To set secrets:
```bash
pulumi config set --secret db_password "secure-password"
```

## Cost Estimates

| Environment | Monthly Cost |
|-------------|-------------|
| Dev | ~$50-100 |
| Staging | ~$150-250 |
| Production | ~$500-800 |

## Monitoring

Access monitoring:
- **CloudWatch Dashboard**: `fibonacco-{env}` in AWS Console
- **Alarms**: Email notifications to configured address
- **Logs**: `/ecs/fibonacco/{env}/{service}` log groups

## Troubleshooting

### "Resource already exists"
```bash
pulumi import aws:ec2:Vpc existing-vpc vpc-12345
```

### "State out of sync"
```bash
pulumi refresh
```

### "Permission denied"
Check AWS credentials:
```bash
aws sts get-caller-identity
```

## Contributing

1. Create a feature branch
2. Make infrastructure changes
3. Run `pulumi preview` to verify
4. Create PR with preview output
5. After merge, GitHub Actions deploys to staging/production

## Related Documentation

- [AWS Migration Architecture](../docs/Fibonacco_AWS_Migration_Architecture.md)
- [Pulumi AWS Documentation](https://www.pulumi.com/registry/packages/aws/)
- [Laravel Deployment Guide](../docs/deployment.md)
