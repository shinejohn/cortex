# How to Get GitHub Token for CodePipeline

## Step-by-Step Instructions

### 1. Go to GitHub Token Settings
Open: **https://github.com/settings/tokens**

### 2. Create New Token
- Click **"Generate new token"**
- Select **"Generate new token (classic)"**

### 3. Configure Token
- **Note**: `CodePipeline-Access` (or any name you prefer)
- **Expiration**: 
  - `90 days` (recommended for security)
  - OR `No expiration` (if you want it permanent)
- **Scopes**: 
  - ✅ Check **`repo`** (Full control of private repositories)
    - This includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`
    - **Also includes**: `write:repo_hook` and `read:repo_hook` (needed for CodePipeline webhooks)

### 4. Generate Token
- Click **"Generate token"** at the bottom
- **⚠️ IMPORTANT**: Copy the token immediately! You won't be able to see it again.

### 5. Save Token Securely
The token will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 6. Add to Pulumi Config
```bash
cd INFRASTRUCTURE
pulumi config set --secret github_token ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Replace `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` with your actual token.

## Verify Token Works
After setting it, you can verify:
```bash
cd INFRASTRUCTURE
pulumi config get github_token --show-secrets
```

(Don't share this output publicly!)

## Security Notes
- **Never commit tokens to git**
- **Use `--secret` flag** so Pulumi encrypts it
- **Rotate tokens periodically** (every 90 days)
- **Revoke old tokens** if compromised

## If You Lose the Token
If you lose the token, you'll need to:
1. Go back to https://github.com/settings/tokens
2. Revoke the old token
3. Create a new one
4. Update Pulumi config with the new token

