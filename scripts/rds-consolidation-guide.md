# RDS Database Consolidation Guide

## Overview

This guide consolidates all RDS database instances into a single Aurora Serverless v2 cluster to save ~$350-400/month.

## Current State

- **7 database instances** across 5 clusters
- **Target cluster**: `taskjugglerstack-auroracluster23d869c0-olydhprenkvz` (Aurora Serverless v2)
- **Cost**: ~$341/month → **Target**: ~$50-80/month

## Prerequisites

1. **PostgreSQL client tools**:
   ```bash
   brew install postgresql  # macOS
   # or
   sudo apt-get install postgresql-client  # Ubuntu
   ```

2. **AWS CLI configured** with appropriate permissions

3. **jq installed** (for JSON parsing):
   ```bash
   brew install jq  # macOS
   ```

## Step-by-Step Migration

### Step 1: Check Current Databases

```bash
# List all RDS instances
aws rds describe-db-instances --query "DBInstances[*].{ID:DBInstanceIdentifier,Endpoint:Endpoint.Address,Status:DBInstanceStatus}" --output table

# List all Aurora clusters
aws rds describe-db-clusters --query "DBClusters[*].{ID:DBClusterIdentifier,Endpoint:Endpoint,Status:Status}" --output table
```

### Step 2: Run Consolidation Script

The script will:
1. Check which databases have data
2. Export databases that have data
3. Create databases in target Aurora cluster
4. Restore data preserving credentials
5. Update AWS Secrets Manager

```bash
cd /Users/johnshine/Dropbox/Fibonacco/Day-News/Multisite
./scripts/rds-consolidation.sh
```

**Important**: The script will prompt for passwords if they're not in Secrets Manager.

### Step 3: Update Pulumi Code

Update Pulumi to reference the shared cluster instead of creating new instances:

```bash
cd /Users/johnshine/Dropbox/Fibonacco/Day-News/Multisite
./scripts/update-pulumi-for-shared-db.py
```

This will:
- Update `INFRASTRUCTURE/database/rds.py` to import existing cluster
- Backup original files with `.backup` extension

### Step 4: Review and Apply Pulumi Changes

```bash
cd INFRASTRUCTURE
pulumi preview
```

Review the changes. If everything looks good:

```bash
pulumi up
```

### Step 5: Redeploy ECS Services

After updating Secrets Manager, force ECS services to pick up new connection strings:

```bash
# Get all ECS services
aws ecs list-services --cluster fibonacco-dev --query "serviceArns[]" --output text

# Force new deployment for each service
for service in goeventcity daynews downtownguide alphasite ssr horizon; do
    aws ecs update-service \
        --cluster fibonacco-dev \
        --service fibonacco-dev-$service \
        --force-new-deployment \
        --region us-east-1
done
```

### Step 6: Test Applications

Test each application to ensure they connect correctly:
- `dev.goeventcity.com`
- `dev.day.news`
- `dev.downtownsguide.com`
- `dev.alphasite.ai`
- `dev.golocalvoices.com`

Check CloudWatch logs for any database connection errors.

### Step 7: Verify Migration

```bash
# Connect to target cluster and list databases
psql -h taskjugglerstack-auroracluster23d869c0-olydhprenkvz.cluster-csr8wa00wss4.us-east-1.rds.amazonaws.com \
     -U postgres \
     -d postgres \
     -c "\l"
```

You should see:
- `fibonacco`
- `taskjuggler`
- `learning_center` (if it had data)

### Step 8: Delete Old Instances (AFTER 24-48 HOURS)

**⚠️ WAIT 24-48 HOURS** after migration to ensure everything works before deleting old instances.

```bash
# Delete old RDS instances
aws rds delete-db-instance \
    --db-instance-identifier fibonacco-dev-dba453d6f \
    --skip-final-snapshot

aws rds delete-db-instance \
    --db-instance-identifier taskjuggler-production-db \
    --skip-final-snapshot

aws rds delete-db-instance \
    --db-instance-identifier learning-center-db-instance-1 \
    --skip-final-snapshot
```

## Credential Preservation

The script preserves all credentials by:
1. Reading current credentials from AWS Secrets Manager
2. Creating the same users with the same passwords in the target cluster
3. Only updating the `DB_HOST` in Secrets Manager (user/pass stay the same)

Your applications won't need credential changes - only the hostname changes.

## Rollback Plan

If something goes wrong:
1. Old databases are still running (don't delete until verified)
2. Revert Secrets Manager changes:
   ```bash
   # Restore old secret values
   aws secretsmanager update-secret \
       --secret-id fibonacco/dev/app-secrets \
       --secret-string '{"DB_HOST":"old-endpoint",...}'
   ```
3. Redeploy ECS services

## Expected Savings

| Item | Before | After | Monthly Savings |
|------|--------|-------|-----------------|
| RDS Instances | ~$341 | ~$60-80 | **~$260** |
| NAT Gateways (orphan VPCs) | ~$64+ | $0 | **~$64** |
| **Total** | | | **~$350-400** |

## Troubleshooting

### Connection Issues

If you can't connect to a database:
1. Check security groups allow connections from your IP/VPC
2. Verify credentials in Secrets Manager
3. Check CloudWatch logs for detailed errors

### Migration Failures

If migration fails:
1. Check backup files in `./db-backups/`
2. Review script output for specific errors
3. You can manually restore using `pg_restore` if needed

### Pulumi State Issues

If Pulumi complains about state:
```bash
cd INFRASTRUCTURE
pulumi refresh  # Refresh state from AWS
pulumi preview  # See what changes
```

## Support

If you encounter issues:
1. Check AWS CloudWatch logs
2. Review script output
3. Verify Secrets Manager values
4. Test database connections manually
