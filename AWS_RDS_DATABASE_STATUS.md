# AWS RDS Database Status

**Date:** December 29, 2025  
**Status:** ✅ RDS Infrastructure Configured, ⏳ Need to Verify Deployment

## Infrastructure Configuration

### ✅ RDS Infrastructure Exists
- **Location:** `INFRASTRUCTURE/database/rds.py`
- **Engine:** PostgreSQL 15
- **Instance Class:** 
  - Production: `db.r6g.large`
  - Staging: `db.t3.small`
  - Dev: `db.t3.micro`
- **Database Name:** `fibonacco`
- **Username:** `postgres`
- **Password:** Set via Pulumi secret `db_password`
- **Multi-AZ:** Enabled for production
- **Public Access:** ❌ Disabled (private subnet only)

### Pulumi Configuration
- **Project:** `fibonacco-infrastructure`
- **Stack:** `dev` (and potentially `staging`, `production`)
- **Region:** `us-east-1`
- **Resources:** 74 resources deployed (according to PULUMI_SETUP.md)

## Current `.env` Configuration

```
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1  ❌ WRONG - This is localhost!
DB_PORT=5432
DB_DATABASE=laravel  ❌ WRONG - Should be "fibonacco"
DB_USERNAME=root  ❌ WRONG - Should be "postgres"
DB_PASSWORD=(empty)
```

## What Needs to Happen

### 1. Get RDS Endpoint from Pulumi
```bash
cd INFRASTRUCTURE
pulumi stack select dev  # or staging/production
pulumi stack output db_endpoint
```

### 2. Get Database Password
```bash
pulumi config get db_password
# Or check Pulumi Cloud console for secrets
```

### 3. Update `.env` File
```env
DB_CONNECTION=pgsql
DB_HOST=<rds-endpoint-from-pulumi>
DB_PORT=5432
DB_DATABASE=fibonacco
DB_USERNAME=postgres
DB_PASSWORD=<password-from-pulumi-secret>
```

### 4. Security Note
**RDS is in private subnet** - This means:
- ✅ Can't connect from your local machine directly
- ✅ Can only connect from within AWS VPC
- ✅ Need VPN or bastion host to connect locally
- ✅ Or connect from EC2/ECS instances in same VPC

## Options to Connect

### Option 1: Use AWS Systems Manager Session Manager (Recommended)
```bash
# Connect to EC2 instance in same VPC
aws ssm start-session --target <instance-id>

# Then from EC2 instance:
psql -h <rds-endpoint> -U postgres -d fibonacco
```

### Option 2: Create Bastion Host
- Launch EC2 instance in public subnet
- Configure security group to allow RDS access
- SSH tunnel through bastion

### Option 3: Temporarily Enable Public Access (NOT Recommended)
- Modify RDS security group to allow your IP
- Enable public accessibility
- **Security Risk** - Only for testing

### Option 4: Use AWS RDS Proxy (Production)
- Set up RDS Proxy
- Connect through proxy endpoint
- Better for connection pooling

## Next Steps

1. **Check Pulumi Stack Outputs:**
   ```bash
   cd INFRASTRUCTURE
   pulumi stack output
   ```

2. **If RDS is deployed, get endpoint:**
   ```bash
   pulumi stack output db_endpoint
   ```

3. **If RDS is NOT deployed yet:**
   ```bash
   pulumi up  # Deploy RDS instance
   ```

4. **Update `.env` with correct values**

5. **Test connection** (from within VPC or via VPN/bastion)

## Current Status

| Item | Status | Details |
|------|--------|---------|
| RDS Infrastructure Code | ✅ Exists | `INFRASTRUCTURE/database/rds.py` |
| RDS Deployed? | ❓ Unknown | Need to check Pulumi outputs |
| `.env` Configuration | ❌ Wrong | Points to localhost |
| Database Name | ❌ Wrong | Should be "fibonacco" |
| Connection Test | ❌ Failed | Can't connect to localhost |

## Summary

**Yes, AWS RDS should be running!** The infrastructure code exists and is configured. However:

1. **Need to verify** if RDS is actually deployed (check Pulumi outputs)
2. **Need to get** the RDS endpoint from Pulumi
3. **Need to update** `.env` to point to AWS RDS instead of localhost
4. **Need VPN/bastion** to connect from local machine (RDS is in private subnet)

The database is configured to run on AWS RDS, but your `.env` file is still pointing to localhost. Once we get the RDS endpoint and update `.env`, we can connect!


