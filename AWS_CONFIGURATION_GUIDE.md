# AWS Configuration Guide

## Services Requiring AWS Configuration

### 1. NotificationService (AWS SNS)

**Status:** ✅ Error handling added - will throw clear error if credentials missing

**Required AWS Credentials:**
- `AWS_ACCESS_KEY_ID` - AWS IAM access key
- `AWS_SECRET_ACCESS_KEY` - AWS IAM secret key
- `AWS_DEFAULT_REGION` - AWS region (defaults to `us-east-1`)

**AWS Service:** Simple Notification Service (SNS)

**Configuration Location:**
- Environment variables: `.env` or `.env.testing`
- Config file: `config/services.php` → `sns` section

**Setup Steps:**
1. Create AWS IAM user with SNS permissions:
   ```bash
   # Required IAM permissions:
   - sns:CreateTopic
   - sns:Subscribe
   - sns:Publish
   - sns:Unsubscribe
   - sns:ListTopics
   ```

2. Generate access keys in AWS Console:
   - Go to: https://console.aws.amazon.com/iam/
   - Select your IAM user → Security credentials → Create access key


3. Add to `.env`:
   ```env
   AWS_ACCESS_KEY_ID=your_access_key_here
   AWS_SECRET_ACCESS_KEY=your_secret_key_here
   AWS_DEFAULT_REGION=us-east-1
   ```

4. Optional SNS configuration:
   ```env
   AWS_SNS_SMS_TYPE=Transactional
   SNS_TOPIC_PREFIX=shine-notifications
   ```

**Testing:**
- For local/testing: Use AWS credentials with limited permissions
- For production: Use IAM role if running on EC2/ECS

---

### 2. WebPushService (VAPID Keys - NOT AWS)

**Status:** ✅ Error handling already exists - throws RuntimeException if keys missing

**Important:** VAPID keys are **NOT AWS-related**. They are generated locally for browser push notifications.

**Required Configuration:**
- `VAPID_PUBLIC_KEY` - Public VAPID key (generated locally)
- `VAPID_PRIVATE_KEY` - Private VAPID key (generated locally)
- `VAPID_SUBJECT` - Email or URL identifier (defaults to `mailto:notifications@shine.com`)

**Configuration Location:**
- Environment variables: `.env` or `.env.testing`
- Config file: `config/services.php` → `webpush` section

**Setup Steps:**
1. Generate VAPID keys using Node.js:
   ```bash
   npm install -g web-push
   web-push generate-vapid-keys
   ```

   Or using PHP:
   ```bash
   composer require minishlink/web-push
   php artisan tinker
   >>> use Minishlink\WebPush\VAPID;
   >>> VAPID::createVapidKeys();
   ```

2. Add to `.env`:
   ```env
   VAPID_PUBLIC_KEY=your_public_key_here
   VAPID_PRIVATE_KEY=your_private_key_here
   VAPID_SUBJECT=mailto:notifications@shine.com
   ```

**Testing:**
- VAPID keys can be the same for all environments
- They identify your application server to push notification services

---

## Current Configuration Status

**✅ AWS Credentials Found:** `~/.aws/credentials`

**AWS Credentials Location:**
- Standard AWS credentials file: `~/.aws/credentials`
- AWS config file: `~/.aws/config` (region: `us-east-1`)
- ✅ Credentials are configured and available

**Checked in current project (`php artisan tinker`):**
```
VAPID_PUBLIC_KEY: NOT SET
VAPID_PRIVATE_KEY: NOT SET
AWS_ACCESS_KEY_ID: NOT SET (needs to be copied from ~/.aws/credentials)
AWS_SECRET_ACCESS_KEY: NOT SET (needs to be copied from ~/.aws/credentials)
```

**Note:** AWS credentials exist in `~/.aws/credentials` but are not yet in this project's `.env` file. To use them, extract and add to `.env`:

```bash
# Extract from AWS credentials file
AWS_ACCESS_KEY_ID=$(grep aws_access_key_id ~/.aws/credentials | cut -d'=' -f2 | tr -d ' ')
AWS_SECRET_ACCESS_KEY=$(grep aws_secret_access_key ~/.aws/credentials | cut -d'=' -f2 | tr -d ' ')
AWS_DEFAULT_REGION=$(grep region ~/.aws/config | cut -d'=' -f2 | tr -d ' ')

# Add to .env file
echo "AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID" >> .env
echo "AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY" >> .env
echo "AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION" >> .env
```

**Both services will now fail gracefully with clear error messages if credentials are missing.**

---

## Summary

| Service | AWS Required? | Configuration Status | Error Handling |
|---------|--------------|---------------------|----------------|
| **NotificationService** | ✅ Yes (AWS SNS) | ❌ Not configured | ✅ Added |
| **WebPushService** | ❌ No (VAPID keys) | ❌ Not configured | ✅ Already exists |

---

## Next Steps

1. **Copy AWS Credentials from `/Users/johnshine/Dropbox/Fibonacco/thefae`:**
   ```bash
   # Copy AWS credentials from thefae directory to this project
   # Look for .env file or AWS configuration in thefae directory
   # Then add to this project's .env file:
   AWS_ACCESS_KEY_ID=<from_thefae>
   AWS_SECRET_ACCESS_KEY=<from_thefae>
   AWS_DEFAULT_REGION=us-east-1
   ```

2. **For AWS SNS (NotificationService):**
   - ✅ AWS credentials are configured at `/Users/johnshine/Dropbox/Fibonacco/thefae`
   - Copy credentials to this project's `.env` file
   - Ensure IAM user has SNS permissions:
     - `sns:CreateTopic`
     - `sns:Subscribe`
     - `sns:Publish`
     - `sns:Unsubscribe`
     - `sns:ListTopics`

3. **For VAPID Keys (WebPushService):**
   - Generate VAPID keys locally (if not already in thefae)
   - Add to `.env` file:
     ```bash
     VAPID_PUBLIC_KEY=<your_public_key>
     VAPID_PRIVATE_KEY=<your_private_key>
     VAPID_SUBJECT=mailto:notifications@shine.com
     ```

4. **For Testing:**
   - Copy credentials to `.env.testing` for test environment
   - Services will now throw clear errors if missing

---

## Quick Setup Command

To copy AWS credentials from `~/.aws/credentials` to this project:

```bash
# Extract AWS credentials from standard AWS credentials file
cd /Users/johnshine/Dropbox/Fibonacco/Day-News/Multisite

# Extract and add to .env
grep aws_access_key_id ~/.aws/credentials | cut -d'=' -f2 | tr -d ' ' | xargs -I {} echo "AWS_ACCESS_KEY_ID={}" >> .env
grep aws_secret_access_key ~/.aws/credentials | cut -d'=' -f2 | tr -d ' ' | xargs -I {} echo "AWS_SECRET_ACCESS_KEY={}" >> .env
grep region ~/.aws/config | cut -d'=' -f2 | tr -d ' ' | xargs -I {} echo "AWS_DEFAULT_REGION={}" >> .env

# Or manually copy from ~/.aws/credentials:
# AWS_ACCESS_KEY_ID=<value from credentials file>
# AWS_SECRET_ACCESS_KEY=<value from credentials file>
# AWS_DEFAULT_REGION=us-east-1
```

**Note:** The AWS credentials are already configured in `~/.aws/credentials`. You just need to add them to this project's `.env` file to use them with Laravel.

