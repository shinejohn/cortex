# AWS Credentials for GitHub Actions

## Your AWS Credentials

Run these commands to get your credentials:

```bash
aws configure get aws_access_key_id
aws configure get aws_secret_access_key
```

## Add to GitHub Secrets

1. Go to: https://github.com/shinejohn/Community-Platform/settings/secrets/actions
2. Click **"New repository secret"**
3. Add each secret:

   **Secret Name:** `AWS_ACCESS_KEY_ID`  
   **Value:** [Paste the output from `aws configure get aws_access_key_id`]

   **Secret Name:** `AWS_SECRET_ACCESS_KEY`  
   **Value:** [Paste the output from `aws configure get aws_secret_access_key`]

## Current AWS Configuration

- **Account ID:** 195430954683
- **Region:** us-east-1
- **IAM User:** FAECLI (based on ARN)

## Security Note

⚠️ **Never commit these credentials to git!**  
⚠️ **Only add them as GitHub Secrets**  
⚠️ **Keep them secure and rotate regularly**

