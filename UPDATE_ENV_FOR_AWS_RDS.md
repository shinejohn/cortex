# Update .env for AWS RDS

**Date:** December 29, 2025  
**Status:** ✅ AWS RDS Found!

## AWS RDS Instance Found

```
Instance ID: fibonacco-dev-dba453d6f
Endpoint: fibonacco-dev-dba453d6f.csr8wa00wss4.us-east-1.rds.amazonaws.com
Port: 5432
Status: available
Database Name: fibonacco
Username: postgres
Publicly Accessible: false (private subnet)
```

## Current `.env` Configuration (WRONG)

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1  ❌ Should be AWS RDS endpoint
DB_PORT=5432  ✅ Correct
DB_DATABASE=laravel  ❌ Should be "fibonacco"
DB_USERNAME=root  ❌ Should be "postgres"
DB_PASSWORD=(empty)  ❌ Need to get from Pulumi secret
```

## Updated `.env` Configuration (CORRECT)

```env
DB_CONNECTION=pgsql
DB_HOST=fibonacco-dev-dba453d6f.csr8wa00wss4.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_DATABASE=fibonacco
DB_USERNAME=postgres
DB_PASSWORD=<get-from-pulumi-secret>
```

## Important: Security Group Configuration

**RDS is in private subnet** (`publicly_accessible=False`)

This means:
- ❌ **Cannot connect directly from your local machine**
- ✅ Can only connect from within AWS VPC
- ✅ Need VPN or bastion host to connect locally

### Security Group Rules
The RDS security group currently allows:
- Port 5432 from VPC CIDR: `10.0.0.0/16`

### Options to Connect

#### Option 1: Add Your IP to Security Group (Temporary)
```bash
# Get your public IP
MY_IP=$(curl -s ifconfig.me)

# Add ingress rule to RDS security group
aws ec2 authorize-security-group-ingress \
  --group-id <rds-security-group-id> \
  --protocol tcp \
  --port 5432 \
  --cidr ${MY_IP}/32 \
  --region us-east-1
```

**Note:** This won't work if RDS is truly private (no public IP). Need to check if RDS has public endpoint.

#### Option 2: Use AWS Systems Manager Session Manager
Connect to EC2 instance in same VPC, then connect to RDS from there.

#### Option 3: Use VPN or Bastion Host
Set up VPN connection to AWS VPC or use bastion host.

## Get Database Password

```bash
cd INFRASTRUCTURE
pulumi config get db_password
```

Or check Pulumi Cloud console: https://app.pulumi.com/shinejohn-org/fibonacco-infrastructure/dev

## Next Steps

1. **Get database password from Pulumi:**
   ```bash
   cd INFRASTRUCTURE
   pulumi config get db_password
   ```

2. **Check if RDS has public endpoint** (unlikely, but check):
   ```bash
   aws rds describe-db-instances \
     --db-instance-identifier fibonacco-dev-dba453d6f \
     --region us-east-1 \
     --query 'DBInstances[0].PubliclyAccessible'
   ```

3. **If RDS is truly private, set up VPN or bastion**

4. **Update `.env` with correct values**

5. **Test connection:**
   ```bash
   php artisan tinker --execute="DB::connection()->getPdo(); echo 'Connected!';"
   ```

## Summary

✅ **AWS RDS EXISTS and is RUNNING!**
- Endpoint: `fibonacco-dev-dba453d6f.csr8wa00wss4.us-east-1.rds.amazonaws.com`
- Database: `fibonacco`
- Username: `postgres`
- Port: `5432`

❌ **`.env` is pointing to wrong host** (localhost instead of AWS RDS)

⏳ **Need to:**
1. Get password from Pulumi
2. Update `.env` with RDS endpoint
3. Handle security group/VPN if RDS is private

The database IS running on AWS - we just need to update `.env` and handle the network access!


