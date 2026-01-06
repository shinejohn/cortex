# Migrating Pulumi Stack to Cloud Backend

## Current Status

- **Pulumi User:** `johnshine`
- **Organization:** `shinejohn`
- **Project:** `fibonacco-infrastructure`
- **Stack:** `dev`
- **Backend:** Currently using passphrase-based secrets manager
- **Resources:** 78 resources deployed

## Migration Steps

The stack is currently configured with a passphrase-based secrets manager. To migrate to Pulumi Cloud:

### Option 1: Use Existing Stack with Cloud Backend (Recommended)

Since you're already logged into Pulumi Cloud, the stack should automatically use cloud backend. However, the secrets provider needs to be migrated.

**Steps:**

1. **Set the passphrase temporarily** (if you know it):
   ```bash
   export PULUMI_CONFIG_PASSPHRASE="your-passphrase"
   cd INFRASTRUCTURE
   pulumi stack select dev
   ```

2. **Migrate secrets to cloud:**
   ```bash
   # Export current secrets
   pulumi stack export > stack-export.json
   
   # The secrets will be automatically migrated to cloud when you run pulumi up
   ```

3. **Update the stack to use cloud secrets:**
   ```bash
   # Remove passphrase requirement
   pulumi config rm --path secrets_provider
   
   # Or explicitly set to cloud
   pulumi config set secrets_provider cloud://
   ```

### Option 2: Create New Stack in Cloud

If you don't have the passphrase:

1. **Create a new stack in Pulumi Cloud:**
   ```bash
   cd INFRASTRUCTURE
   pulumi stack init dev-cloud
   pulumi config set aws:region us-east-1
   ```

2. **Import existing resources** (if needed):
   ```bash
   pulumi import <resource-type> <resource-name> <aws-resource-id>
   ```

### Option 3: Reset Secrets Provider

If you want to keep the existing stack but migrate secrets:

1. **Backup current config:**
   ```bash
   cp Pulumi.dev.yaml Pulumi.dev.yaml.backup
   ```

2. **Edit Pulumi.dev.yaml** to remove passphrase encryption:
   - Remove `encryptionsalt` line
   - Change encrypted secrets to plain text (temporarily)
   - Or use `pulumi config set --plaintext` for secrets

3. **Re-encrypt with cloud:**
   ```bash
   pulumi config set --secret db_password "your-password"
   ```

## Current Configuration

The stack already has `backend.url: cloud://` configured, which means it's set to use Pulumi Cloud. The issue is the secrets provider is still using passphrase.

## Next Steps

Since you're logged into Pulumi Cloud (`johnshine`), you can:

1. **View the stack in Pulumi Console:**
   https://app.pulumi.com/shinejohn/fibonacco-infrastructure/dev

2. **Update the stack:**
   - If you have the passphrase, set `PULUMI_CONFIG_PASSPHRASE` and run `pulumi up`
   - If you don't have the passphrase, you may need to recreate secrets or contact the original stack creator

3. **Verify cloud connection:**
   ```bash
   pulumi whoami
   pulumi stack ls
   ```

## Resources Currently Deployed

From the stack export, the following resources are deployed:
- VPC and networking (subnets, NAT gateway)
- RDS database instance
- ElastiCache Redis cluster
- ECS cluster
- Application Load Balancer
- S3 buckets (app storage, archive)
- ECR repositories
- CloudWatch alarms and SNS topics
- Secrets Manager secrets

Total: 78 resources


