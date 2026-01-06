# Pulumi Configuration Status

**Last Updated:** December 23, 2025

## Current Configuration

- **Pulumi User:** `johnshine`
- **Pulumi Organization:** `shinejohn` (https://app.pulumi.com/shinejohn)
- **Project Name:** `fibonacco-infrastructure`
- **Current Stack:** `dev`
- **Resources Deployed:** 74
- **Last Update:** 1 day ago

## Project Structure

The Pulumi project is located in `/INFRASTRUCTURE/` and manages AWS infrastructure for:
- **GoEventCity** (goeventcity.com)
- **Day.News** (day.news)
- **Downtown Guide** (downtownsguide.com)
- **AlphaSite** (alphasite.ai)
- **Go Local Voices** (golocalvoices.com)

## Stack Management

### View Current Stack
```bash
cd INFRASTRUCTURE
pulumi stack ls
```

### Switch Stacks
```bash
pulumi stack select dev
pulumi stack select staging
pulumi stack select production
```

### View Stack Outputs
```bash
pulumi stack output
pulumi stack output database_endpoint
pulumi stack output load_balancer_dns
```

## Deployment Commands

### Preview Changes
```bash
pulumi preview
```

### Deploy Changes
```bash
pulumi up
pulumi up --yes  # Skip confirmation
```

### Refresh State
```bash
pulumi refresh  # Sync with AWS
```

## Configuration

### View Configuration
```bash
pulumi config
```

### Set Configuration
```bash
pulumi config set aws:region us-east-1
pulumi config set --secret db_password "your-password"
```

## Access Pulumi Console

View your infrastructure in the Pulumi web console:
**https://app.pulumi.com/shinejohn/fibonacco-infrastructure/dev**

## Related Documentation

- [Infrastructure README](./README.md)
- [AWS Migration Architecture](./Fibonacco_AWS_Migration_Architecture.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)

