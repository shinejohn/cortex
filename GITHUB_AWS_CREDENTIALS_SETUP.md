# GitHub Actions AWS Credentials Setup

## Problem
The deployment workflow is failing with:
```
Error: Credentials could not be loaded, please check your action inputs: Could not load credentials from any providers
```

## Solution: Add AWS Credentials to GitHub Secrets

### Step 1: Create IAM User for GitHub Actions

1. Go to AWS Console → IAM → Users → Create User
2. Name: `github-actions-deploy`
3. **Access Type**: Programmatic access (Access Key ID + Secret Access Key)
4. **Permissions**: Attach policy with these permissions:

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
        "ecs:DescribeServices",
        "ecs:UpdateService",
        "ecs:DescribeTasks",
        "ecs:ListTasks",
        "ecs:DescribeTaskDefinition",
        "ecs:RegisterTaskDefinition",
        "sts:GetCallerIdentity",
        "ecr:DescribeRepositories",
        "ecr:CreateRepository"
      ],
      "Resource": "*"
    }
  ]
}
```

Or use AWS managed policy: `AmazonECS_FullAccess` + `AmazonEC2ContainerRegistryFullAccess`

### Step 2: Get Access Keys

After creating the user:
1. Go to the user → Security credentials tab
2. Click "Create access key"
3. Choose "Application running outside AWS"
4. **Copy both values immediately** (you won't see the secret again):
   - Access Key ID: `AKIA...`
   - Secret Access Key: `wJalr...`

### Step 3: Add to GitHub Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add these two secrets:

**Secret 1:**
- Name: `AWS_ACCESS_KEY_ID`
- Value: `AKIA...` (your access key ID)

**Secret 2:**
- Name: `AWS_SECRET_ACCESS_KEY`
- Value: `wJalr...` (your secret access key)

### Step 4: Verify

After adding secrets, re-run the failed workflow:
1. Go to Actions tab
2. Find the failed workflow run
3. Click "Re-run all jobs"

## Alternative: Use OIDC (More Secure, Recommended)

Instead of access keys, you can use OpenID Connect (OIDC) which is more secure:

### 1. Create OIDC Identity Provider in AWS

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

### 2. Create IAM Role with Trust Policy

Create role `GitHubActionsDeployRole` with trust policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::195430954683:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:shinejohn/Community-Platform:*"
        }
      }
    }
  ]
}
```

### 3. Update Workflow to Use OIDC

Replace the AWS credentials step with:

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::195430954683:role/GitHubActionsDeployRole
    aws-region: ${{ env.AWS_REGION }}
```

## Quick Fix (Temporary)

If you need to deploy NOW and can't set up secrets immediately, you can temporarily use your own AWS credentials:

1. Get your AWS credentials (from `~/.aws/credentials` or AWS Console)
2. Add them to GitHub Secrets as described above
3. **Important**: Rotate these keys after deployment if they're your personal keys

## Verification

After adding secrets, the workflow should:
1. ✅ Configure AWS credentials successfully
2. ✅ Test AWS connectivity (`aws sts get-caller-identity`)
3. ✅ Login to ECR
4. ✅ Build and push Docker images
5. ✅ Deploy to ECS

## Security Best Practices

1. **Use OIDC instead of access keys** (more secure, no long-lived credentials)
2. **Limit IAM permissions** to only what's needed (ECR + ECS)
3. **Rotate access keys regularly** if using access keys
4. **Never commit credentials** to the repository
5. **Use separate IAM users/roles** for different environments (dev/staging/prod)

