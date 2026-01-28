# Migration Guide: Railway to AWS RDS

This guide explains how to use the `sync-railway-to-aws.sh` script to migrate your data.

## Prerequisites

1. **Network Access**:
   - Since AWS RDS is in a private subnet, you must run this script from a machine that has access to the VPC (e.g., an EC2 instance, VPN connected machine, or via SSH Tunnel).
   
2. **Environment Variables**:
   - Create a `.env` file (or update existing) with the following:
     ```env
     # Source (Railway) - From Railway settings
     RAILWAY_DB_URL=postgresql://user:password@containers-us-west.railway.app:port/railway
     
     # Target (AWS) - From Pulumi output or AWS Console
     DB_HOST=fibonacco-dev-dba453d6f.csr8wa00wss4.us-east-1.rds.amazonaws.com
     DB_PORT=5432
     DB_DATABASE=fibonacco
     DB_USERNAME=postgres
     DB_PASSWORD=your_password_here
     ```

## Usage

### 1. Initial Migration (Full Cutover)
Use this for the first-time setup or if you want to completely replace the AWS database with Railway data.

```bash
./scripts/sync-railway-to-aws.sh --mode initial
```
* **Destructive**: Drops existing tables in AWS before restoring.
* **Complete**: Copies schema, indexes, sequences, and data.

### 2. Regular Update (Refresh Data)
Use this to update the data in AWS without dropping the schema (useful if you have applied AWS-specific index changes or permissions).

```bash
./scripts/sync-railway-to-aws.sh --mode update
```
* **Data-Only**: Syncs data rows. 
* **Note**: This assumes the schema has not drifted. If schema changed on Railway, use `initial` mode.

### 3. Verification
Check if both databases are reachable and show table counts.

```bash
./scripts/sync-railway-to-aws.sh --mode verify
```

## Running via SSH Tunnel (Bastion)

If you are running this locally and need to tunnel:

1. Open a tunnel in a separate terminal:
   ```bash
   ssh -L 5432:fibonacco-dev-dba453d6f.csr8wa00wss4.us-east-1.rds.amazonaws.com:5432 -i key.pem ec2-user@bastion-public-ip
   ```

2. Update `.env` to point to localhost:
   ```env
   DB_HOST=127.0.0.1
   DB_PORT=5432
   ```

3. Run the script.
