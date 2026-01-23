# AWS Fargate Platform Retirement Response

## Notification Summary

**Date**: January 21, 2025  
**Retirement Start**: Friday, January 30, 2026 04:00 GMT  
**New Platform Version Available**: Tasks launched after Friday, January 23, 2026 04:00 GMT  
**AWS Account**: 195430954683

AWS Fargate has deployed a new platform version revision and will retire tasks running on previous platform version revisions starting January 30, 2026.

## Current Configuration Analysis

### Deployment Configuration

**IMPORTANT FINDING**: The deployment configuration is defined in `INFRASTRUCTURE/config.py` but **NOT currently applied** to ECS services. This means services are using AWS **default values**:

- **Default Minimum Healthy Percent**: **100%** (AWS default)
- **Default Maximum Percent**: **200%** (AWS default)

**Configuration in code** (`INFRASTRUCTURE/config.py`):
```python
ecs = {
    "deployment_minimum_healthy_percent": 50 if is_production else 0,
    "deployment_maximum_percent": 200,
}
```

**However**, this configuration is not being applied to the ECS Service definitions in `INFRASTRUCTURE/compute/services.py`.

### Impact Assessment

#### ✅ **ALL Environments (Current State)**
- **Status**: **SAFE** - Using AWS default 100% minimum healthy percent
- **Behavior**: ECS will automatically launch replacement tasks on the new platform version before retiring old tasks
- **Impact**: **Zero downtime** - Automatic rolling deployment will occur
- **Action Required**: **NONE** - AWS will handle the transition automatically

**Why this is safe**: With 100% minimum healthy percent, ECS ensures:
1. New tasks are launched on the new platform version
2. New tasks pass health checks
3. Old tasks are drained and stopped
4. Zero downtime during the transition

### Recommendation

**No immediate action needed** - The default configuration provides the safest, zero-downtime update path.

**Optional Enhancement**: If you want more control over deployment behavior (e.g., faster rollouts with 50% minimum), you can add the deployment configuration to the service definitions (see "Optional: Add Deployment Configuration" section below).

## Recommended Actions

### 1. Verify Current Configuration (Immediate)

Check that the deployment configuration is correctly applied to all ECS services:

```bash
# Check all ECS services deployment configuration
aws ecs describe-services \
  --cluster fibonacco-dev \
  --services fibonacco-dev-goeventcity \
             fibonacco-dev-daynews \
             fibonacco-dev-downtownguide \
             fibonacco-dev-alphasite \
             fibonacco-dev-golocalvoices \
             fibonacco-dev-ssr \
             fibonacco-dev-horizon \
  --query 'services[*].[serviceName,deploymentConfiguration]' \
  --output table
```

### 2. Monitor Platform Version (Before Jan 23, 2026)

After January 23, 2026, verify that new tasks are being launched on the new platform version:

```bash
# Check platform version of running tasks
aws ecs list-tasks --cluster fibonacco-dev --service-name fibonacco-dev-daynews \
  --query 'taskArns[*]' --output text | \
  xargs -I {} aws ecs describe-tasks --cluster fibonacco-dev --tasks {} \
  --query 'tasks[*].[taskArn,platformVersion]' --output table
```

### 3. Force New Deployment (Optional - Before Jan 30, 2026)

If you want to proactively update tasks to the new platform version before the retirement date:

```bash
# Force new deployment for each service
for service in goeventcity daynews downtownguide alphasite golocalvoices ssr horizon; do
  aws ecs update-service \
    --cluster fibonacco-dev \
    --service fibonacco-dev-$service \
    --force-new-deployment \
    --region us-east-1
done
```

**Note**: This will trigger a rolling deployment. With 50% minimum healthy percent (production), this will be zero-downtime.

### 4. Update Dev/Staging Configuration (Optional)

If you want zero-downtime updates for dev/staging environments, update `INFRASTRUCTURE/config.py`:

```python
# Change from:
"deployment_minimum_healthy_percent": 50 if is_production else 0,

# To:
"deployment_minimum_healthy_percent": 50,  # Same for all environments
```

Then apply the infrastructure changes:

```bash
cd INFRASTRUCTURE
pulumi up
```

## Affected Services

All ECS Fargate services in the `fibonacco-dev` cluster:

1. **Web Services** (5 services):
   - `fibonacco-dev-goeventcity`
   - `fibonacco-dev-daynews`
   - `fibonacco-dev-downtownguide`
   - `fibonacco-dev-alphasite`
   - `fibonacco-dev-golocalvoices`

2. **Supporting Services**:
   - `fibonacco-dev-ssr` (Inertia SSR)
   - `fibonacco-dev-horizon` (Laravel Horizon)

## Timeline

- **Now - Jan 23, 2026**: Tasks continue running on old platform version
- **Jan 23, 2026**: New platform version becomes available (new tasks use this)
- **Jan 30, 2026**: Old platform version retirement begins
- **After Jan 30, 2026**: All tasks must be on new platform version

## Verification Commands

### Check Service Health

```bash
# Check service status
aws ecs describe-services \
  --cluster fibonacco-dev \
  --services fibonacco-dev-daynews \
  --query 'services[0].[serviceName,runningCount,desiredCount,deployments[*].[status,desiredCount,runningCount]]' \
  --output table
```

### Check Platform Versions

```bash
# List all tasks and their platform versions
aws ecs list-tasks --cluster fibonacco-dev --output text | \
  xargs -I {} aws ecs describe-tasks --cluster fibonacco-dev --tasks {} \
  --query 'tasks[*].[taskArn,platformVersion,lastStatus]' --output table
```

### Check AWS Health Dashboard

View affected resources in AWS Health Dashboard:
- Navigate to: AWS Console → Health Dashboard → "Affected Resources" tab
- Filter by: ECS service events

## Optional: Add Deployment Configuration

If you want to explicitly control deployment behavior (instead of relying on AWS defaults), you can add deployment configuration to the ECS services.

### Update Infrastructure Code

Modify `INFRASTRUCTURE/compute/services.py` to add `deployment_configuration` to all service definitions:

```python
# For web services (around line 296)
service = aws.ecs.Service(
    f"{project_name}-{env}-{name}-service",
    # ... existing args ...
    deployment_configuration=aws.ecs.ServiceDeploymentConfigurationArgs(
        minimum_healthy_percent=ecs["deployment_minimum_healthy_percent"],
        maximum_percent=ecs["deployment_maximum_percent"],
    ),
    tags=common_tags,
)

# For SSR service (around line 137)
ssr_service = aws.ecs.Service(
    # ... existing args ...
    deployment_configuration=aws.ecs.ServiceDeploymentConfigurationArgs(
        minimum_healthy_percent=ecs_ssr.get("deployment_minimum_healthy_percent", 50),
        maximum_percent=200,
    ),
    tags=common_tags,
)

# For Horizon service (around line 212)
horizon_service = aws.ecs.Service(
    # ... existing args ...
    deployment_configuration=aws.ecs.ServiceDeploymentConfigurationArgs(
        minimum_healthy_percent=ecs_horizon.get("deployment_minimum_healthy_percent", 50),
        maximum_percent=200,
    ),
    tags=common_tags,
)
```

Then apply:
```bash
cd INFRASTRUCTURE
pulumi up
```

**Note**: This is optional - AWS defaults (100% minimum healthy) already provide zero-downtime updates.

## Conclusion

**Current Status**: ✅ **No action required** - All services are using AWS default deployment configuration (100% minimum healthy percent), which ensures automatic zero-downtime rolling updates when the platform version retires.

**Timeline**:
- **Now - Jan 23, 2026**: Tasks continue running on old platform version
- **Jan 23, 2026**: New platform version becomes available (new tasks will use this automatically)
- **Jan 30, 2026**: Old platform version retirement begins (AWS will automatically update tasks)
- **After Jan 30, 2026**: All tasks will be on new platform version

**Recommended Actions**:
1. ✅ **None required** - AWS will handle automatically
2. 📊 **Monitor** (optional): Check AWS Health Dashboard for affected resources
3. 🔍 **Verify** (optional): After Jan 23, verify new tasks use new platform version
4. ⚙️ **Enhance** (optional): Add explicit deployment configuration for more control

## References

- [AWS Fargate Platform Versions](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/platform_versions.html)
- [ECS Deployment Configuration](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service_definition_parameters.html#deploymentConfiguration)
- [AWS Health Dashboard](https://phd.aws.amazon.com/)

