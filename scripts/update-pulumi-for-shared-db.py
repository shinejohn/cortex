#!/usr/bin/env python3
"""
Update Pulumi infrastructure to reference shared Aurora cluster instead of creating new RDS instances.
This prevents Pulumi from creating duplicate databases.
"""

import os
import sys
import re

INFRASTRUCTURE_DIR = os.path.join(os.path.dirname(__file__), "..", "INFRASTRUCTURE")
RDS_FILE = os.path.join(INFRASTRUCTURE_DIR, "database", "rds.py")
SECRETS_FILE = os.path.join(INFRASTRUCTURE_DIR, "secrets.py")

# Target Aurora cluster endpoint (will be imported/referenced)
TARGET_CLUSTER_ENDPOINT = "taskjugglerstack-auroracluster23d869c0-olydhprenkvz.cluster-csr8wa00wss4.us-east-1.rds.amazonaws.com"
TARGET_CLUSTER_ID = "taskjugglerstack-auroracluster23d869c0-olydhprenkvz"

def update_rds_file():
    """Update rds.py to reference existing Aurora cluster instead of creating new instance."""
    
    if not os.path.exists(RDS_FILE):
        print(f"❌ {RDS_FILE} not found")
        return False
    
    with open(RDS_FILE, 'r') as f:
        content = f.read()
    
    # Create new content that references the existing cluster
    new_content = '''"""
RDS PostgreSQL database configuration.
Uses shared Aurora Serverless v2 cluster instead of creating new instance.
"""

import pulumi
import pulumi_aws as aws
from config import project_name, env, common_tags

# Reference existing Aurora cluster instead of creating new RDS instance
# This prevents duplicate database creation and saves costs
# The cluster endpoint is stored in config or hardcoded here
config = pulumi.Config()

# Get cluster endpoint from config (set via: pulumi config set shared_db_endpoint "...")
# Or use the hardcoded value below
shared_db_endpoint = config.get("shared_db_endpoint") or "TARGET_CLUSTER_ENDPOINT"

# Export cluster endpoint for use in secrets
# Format: hostname:port
db_endpoint = pulumi.Output.from_input(f"{shared_db_endpoint}:5432")

pulumi.export("db_endpoint", db_endpoint)
pulumi.export("db_cluster_id", pulumi.Output.from_input("TARGET_CLUSTER_ID"))

# Note: This cluster is shared across multiple applications
# Each application uses a different database name within the same cluster
# Database instances within the cluster are managed separately
# Security groups and subnet groups are still needed for VPC access
'''
    
    # Replace placeholders
    new_content = new_content.replace("TARGET_CLUSTER_ID", TARGET_CLUSTER_ID)
    new_content = new_content.replace("TARGET_CLUSTER_ENDPOINT", TARGET_CLUSTER_ENDPOINT)
    
    # Backup original
    backup_file = RDS_FILE + ".backup"
    with open(backup_file, 'w') as f:
        f.write(content)
    print(f"✓ Backed up original to {backup_file}")
    
    # Write new content
    with open(RDS_FILE, 'w') as f:
        f.write(new_content)
    
    print(f"✓ Updated {RDS_FILE} to reference shared Aurora cluster")
    return True

def update_secrets_file():
    """Update secrets.py to use cluster endpoint."""
    
    if not os.path.exists(SECRETS_FILE):
        print(f"❌ {SECRETS_FILE} not found")
        return False
    
    with open(SECRETS_FILE, 'r') as f:
        content = f.read()
    
    # Update import to use db_endpoint from cluster
    # The endpoint parsing should still work the same way
    # Just need to ensure we're importing from the right place
    
    # Backup original
    backup_file = SECRETS_FILE + ".backup"
    with open(backup_file, 'w') as f:
        f.write(content)
    print(f"✓ Backed up original to {backup_file}")
    
    # The secrets file should work as-is since db_endpoint is still exported
    # Just update comment if needed
    if "# Parse database endpoint" in content:
        print(f"✓ {SECRETS_FILE} should work with cluster endpoint")
    
    return True

def main():
    print("🔄 Updating Pulumi code to use shared Aurora cluster...")
    print("=" * 60)
    
    success = True
    
    if not update_rds_file():
        success = False
    
    if not update_secrets_file():
        success = False
    
    if success:
        print("\n✅ Pulumi code updated successfully!")
        print("\nNext steps:")
        print("1. Review the changes in INFRASTRUCTURE/database/rds.py")
        print("2. Run: cd INFRASTRUCTURE && pulumi preview")
        print("3. If preview looks good: pulumi up")
        print("4. This will update your infrastructure to reference the shared cluster")
    else:
        print("\n❌ Some updates failed. Check errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
