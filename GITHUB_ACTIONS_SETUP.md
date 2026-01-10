# GitHub Actions AWS Secrets Setup

## Required Secrets

The GitHub Actions deployment workflow requires these secrets to be configured in your GitHub repository:

- `AWS_ACCESS_KEY_ID` - Your AWS access key ID
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret access key

## How to Set Up Secrets in GitHub

### Step 1: Get Your AWS Credentials

If you don't have AWS credentials yet, create them:

1. Go to AWS Console → IAM → Users
2. Select your user (or create a new IAM user for CI/CD)
3. Go to "Security credentials" tab
4. Click "Create access key"
5. Choose "Command Line Interface (CLI)" or "Application running outside AWS"
6. Copy the **Access key ID** and **Secret access key**

**Important:** Save the secret access key immediately - you won't be able to see it again!

### Step 2: Configure IAM Permissions

The IAM user needs these permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "ecr:PutImage",
                "ecr:InitiateLayerUpload",
                "ecr:UploadLayerPart",
                "ecr:CompleteLayerUpload",
                "ecs:UpdateService",
                "ecs:DescribeServices",
                "ecs:DescribeTasks",
                "sts:GetCallerIdentity"
            ],
            "Resource": "*"
        }
    ]
}
```

Or attach these AWS managed policies:
- `AmazonEC2ContainerRegistryFullAccess`
- `AmazonECS_FullAccess`

### Step 3: Add Secrets to GitHub

1. Go to your GitHub repository: `https://github.com/shinejohn/Community-Platform`
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret**
5. Add each secret:

   **Secret 1:**
   - Name: `AWS_ACCESS_KEY_ID`
   - Value: `[Your AWS Access Key ID]`
   - Click **Add secret**

   **Secret 2:**
   - Name: `AWS_SECRET_ACCESS_KEY`
   - Value: `[Your AWS Secret Access Key]`
   - Click **Add secret**

### Step 4: Verify Secrets Are Set

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. You should see both secrets listed:
   - `AWS_ACCESS_KEY_ID` (shows as `••••••••`)
   - `AWS_SECRET_ACCESS_KEY` (shows as `••••••••`)

## Testing the Setup

After adding secrets, trigger a workflow run:

1. Go to **Actions** tab in GitHub
2. Select **Deploy to AWS ECS** workflow
3. Click **Run workflow** → **Run workflow**
4. The workflow should now be able to:
   - Login to ECR
   - Build and push Docker images
   - Deploy to ECS

## Current AWS Account Info

Based on your workflow configuration:
- **AWS Account ID:** `195430954683`
- **AWS Region:** `us-east-1`
- **ECR Base:** `195430954683.dkr.ecr.us-east-1.amazonaws.com`
- **Cluster:** `fibonacco-dev`
- **Environment:** `dev`

## Troubleshooting

### Error: "Credentials could not be loaded"

**Cause:** Secrets are not set or have wrong names

**Fix:**
1. Verify secret names are exactly: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
2. Check for typos or extra spaces
3. Ensure secrets are set at repository level (not organization level if using personal account)

### Error: "Access Denied" when pushing to ECR

**Cause:** IAM user doesn't have ECR permissions

**Fix:**
1. Check IAM user permissions
2. Ensure `AmazonEC2ContainerRegistryFullAccess` policy is attached
3. Verify the IAM user has access to ECR repositories in `us-east-1`

### Error: "Service not found" when deploying

**Cause:** ECS service doesn't exist or wrong cluster name

**Fix:**
1. Verify cluster name: `fibonacco-dev`
2. Check service names match: `fibonacco-dev-{service}`
3. Ensure services exist in AWS ECS console

## Security Best Practices

1. **Use IAM roles instead of access keys** (if possible with GitHub Actions OIDC)
2. **Rotate access keys regularly** (every 90 days)
3. **Use least privilege** - only grant permissions needed for CI/CD
4. **Never commit secrets** to the repository
5. **Use separate IAM user** for CI/CD (not your personal AWS account)

## Alternative: Using GitHub Actions OIDC (Recommended)

For better security, you can use GitHub Actions OIDC to assume an IAM role instead of using access keys:

1. Create an IAM role with trust policy allowing GitHub Actions
2. Configure GitHub Actions to use OIDC
3. Remove the need for access keys entirely

See: https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services

