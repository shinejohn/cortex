# AWS Account Quarantine Recovery Plan

## Current Situation

Your AWS account has been **automatically quarantined** due to exposed credentials in the public GitHub repository. AWS detected the compromised key and applied the `AWSCompromisedKeyQuarantineV3` policy.

**Status:**
- ✅ Exposed key identified: `AKIAS3AEXW25YDDEMQEJ`
- ⚠️ Account quarantined - cannot delete/create access keys
- ⚠️ Other key exists: `AKIAS3AEXW255MQDK6MY` (created Sept 19)

## Immediate Actions Required

### Option 1: Contact AWS Support (Recommended)

AWS Support can remove the quarantine and help rotate keys safely:

1. **Open AWS Support Case:**
   - Go to: https://console.aws.amazon.com/support/home
   - Create a case: "Security - Compromised Access Key"
   - Priority: **Urgent**

2. **Provide Details:**
   ```
   Subject: Request to Remove Compromised Key Quarantine
   
   Issue: Access key AKIAS3AEXW25YDDEMQEJ was accidentally committed 
   to a public GitHub repository. AWS automatically quarantined the 
   account with AWSCompromisedKeyQuarantineV3 policy.
   
   Request: Please remove the quarantine policy and assist with 
   rotating the compromised credentials.
   
   Account ID: 195430954683
   IAM User: FAECLI
   Compromised Key: AKIAS3AEXW25YDDEMQEJ
   ```

3. **AWS Support Will:**
   - Remove the quarantine policy
   - Help delete the compromised key
   - Assist with creating new keys
   - Review account security

### Option 2: Use Root Account (If Available)

If you have root account access:

1. **Login as Root:**
   - Go to AWS Console → IAM
   - Login with root credentials

2. **Remove Quarantine Policy:**
   ```bash
   aws iam detach-user-policy \
       --user-name FAECLI \
       --policy-arn arn:aws:iam::aws:policy/AWSCompromisedKeyQuarantineV3
   ```

3. **Then Run Rotation Script:**
   ```bash
   ./scripts/rotate-aws-credentials.sh
   ```

### Option 3: Create New IAM User (Temporary Workaround)

While waiting for AWS Support, create a new IAM user with same permissions:

1. **Create New User:**
   ```bash
   aws iam create-user --user-name FAECLI-NEW
   ```

2. **Attach Same Policies:**
   ```bash
   # Get current policies
   aws iam list-attached-user-policies --user-name FAECLI
   aws iam list-user-policies --user-name FAECLI
   
   # Attach to new user (replace POLICY_ARN)
   aws iam attach-user-policy --user-name FAECLI-NEW --policy-arn POLICY_ARN
   ```

3. **Create Access Keys for New User:**
   ```bash
   aws iam create-access-key --user-name FAECLI-NEW
   ```

4. **Update Services:**
   - Update AWS Secrets Manager
   - Update ECS task definitions
   - Update any hardcoded credentials

5. **After Quarantine Removed:**
   - Delete old user (FAECLI)
   - Rename new user to FAECLI

## What AWS Quarantine Does

The `AWSCompromisedKeyQuarantineV3` policy prevents:
- ❌ Creating new access keys
- ❌ Deleting access keys
- ❌ Modifying IAM user policies
- ✅ Most other AWS operations still work (S3, ECS, etc.)

## Security Checklist

While waiting for AWS Support:

- [ ] Check AWS CloudTrail for unauthorized access
- [ ] Review S3 bucket access logs
- [ ] Check for unauthorized ECS deployments
- [ ] Review AWS billing for unexpected charges
- [ ] Check for new IAM users/roles created
- [ ] Review security groups for unauthorized changes
- [ ] Check for new EC2 instances
- [ ] Review CloudWatch logs for suspicious activity

## CloudTrail Investigation

```bash
# Check for unauthorized access with exposed key
aws cloudtrail lookup-events \
    --lookup-attributes AttributeKey=AccessKeyId,AttributeValue=AKIAS3AEXW25YDDEMQEJ \
    --max-results 50 \
    --output table

# Check recent IAM changes
aws cloudtrail lookup-events \
    --lookup-attributes AttributeKey=EventName,AttributeValue=CreateUser \
    --start-time $(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%S) \
    --output table
```

## Next Steps After Quarantine Removed

1. **Delete Compromised Key:**
   ```bash
   aws iam delete-access-key \
       --user-name FAECLI \
       --access-key-id AKIAS3AEXW25YDDEMQEJ
   ```

2. **Create New Key:**
   ```bash
   aws iam create-access-key --user-name FAECLI
   ```

3. **Update All Services:**
   - Run `./scripts/rotate-aws-credentials.sh`
   - Update AWS Secrets Manager
   - Redeploy ECS services

4. **Regenerate Other Keys:**
   - VAPID keys
   - Laravel APP_KEY
   - Any other exposed secrets

5. **Clean Git History:**
   ```bash
   ./scripts/remove-secrets-from-git-history.sh
   ```

## Prevention

After recovery:

1. ✅ Never commit `.env*` files (except `.env.example`)
2. ✅ Use AWS Secrets Manager for all credentials
3. ✅ Use IAM roles for ECS tasks (not access keys)
4. ✅ Enable MFA for IAM users
5. ✅ Set up CloudTrail alerts for suspicious activity
6. ✅ Use git-secrets or pre-commit hooks

## Timeline

- **Now**: Account quarantined, contact AWS Support
- **Within 24 hours**: AWS Support removes quarantine
- **After quarantine removed**: Rotate all credentials
- **Within 48 hours**: Clean git history, verify security

## Support Contacts

- **AWS Support**: https://console.aws.amazon.com/support/home
- **AWS Security**: security@amazon.com (for critical issues)
- **Documentation**: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html
