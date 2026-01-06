# Lambda Test Runner - Plan

**Date:** December 29, 2025  
**Goal:** Run Laravel tests and documentation generation from Lambda function in VPC

## Architecture

```
Lambda Function (in VPC)
  ↓
Private Subnet
  ↓
RDS PostgreSQL (private)
  ↓
Run: php artisan scribe:generate
     php artisan api:export-markdown
     php artisan test
  ↓
Upload results to S3
```

## Options

### Option 1: Lambda with Custom PHP Runtime (Complex)
- Use Lambda Layers for PHP runtime
- Package Laravel app code
- **Pros:** Native Lambda
- **Cons:** Complex setup, large package size

### Option 2: Lambda Container Image (Recommended)
- Use Docker container with PHP + Laravel
- Deploy as Lambda container image
- **Pros:** Easier to manage, familiar Docker workflow
- **Cons:** Requires ECR (Elastic Container Registry)

### Option 3: ECS Fargate Task (Alternative)
- Run as one-time ECS task
- Trigger via EventBridge or API
- **Pros:** More flexible, can run longer
- **Cons:** More complex, higher cost

## Recommended: Lambda Container Image

### Steps

1. **Create Dockerfile for Lambda**
   ```dockerfile
   FROM public.ecr.aws/lambda/provided:al2
   
   # Install PHP and dependencies
   RUN yum install -y php81 php81-cli php81-pdo php81-pgsql \
       php81-xml php81-mbstring php81-json php81-opcache \
       composer
   
   # Copy Laravel app
   COPY . /var/task
   
   # Install dependencies
   RUN composer install --no-dev --optimize-autoloader
   
   # Set handler
   CMD ["index.handler"]
   ```

2. **Create Lambda Handler**
   ```php
   <?php
   // index.php
   require __DIR__ . '/vendor/autoload.php';
   
   function handler($event, $context) {
       $command = $event['command'] ?? 'test';
       
       // Load secrets from Secrets Manager
       $secrets = getSecrets();
       
       // Set environment variables
       foreach ($secrets as $key => $value) {
           putenv("$key=$value");
       }
       
       // Run Laravel command
       $output = [];
       $returnCode = 0;
       exec("php artisan $command 2>&1", $output, $returnCode);
       
       return [
           'statusCode' => $returnCode === 0 ? 200 : 500,
           'body' => json_encode([
               'command' => $command,
               'output' => implode("\n", $output),
               'returnCode' => $returnCode,
           ]),
       ];
   }
   ```

3. **Build and Push to ECR**
   ```bash
   # Create ECR repository
   aws ecr create-repository --repository-name fibonacco-dev-test-runner
   
   # Build and push
   docker build -t fibonacco-dev-test-runner .
   docker tag fibonacco-dev-test-runner:latest \
     195430954683.dkr.ecr.us-east-1.amazonaws.com/fibonacco-dev-test-runner:latest
   docker push 195430954683.dkr.ecr.us-east-1.amazonaws.com/fibonacco-dev-test-runner:latest
   ```

4. **Deploy Lambda Function**
   ```bash
   # Use Pulumi to create Lambda from container image
   pulumi up
   ```

5. **Invoke Lambda**
   ```bash
   # Run scribe:generate
   aws lambda invoke \
     --function-name fibonacco-dev-test-runner \
     --payload '{"command":"scribe:generate"}' \
     response.json
   
   # Run api:export-markdown
   aws lambda invoke \
     --function-name fibonacco-dev-test-runner \
     --payload '{"command":"api:export-markdown"}' \
     response.json
   
   # Run tests
   aws lambda invoke \
     --function-name fibonacco-dev-test-runner \
     --payload '{"command":"test","filter":"Integration"}' \
     response.json
   ```

## Infrastructure Code

See: `INFRASTRUCTURE/compute/lambda_test_runner.py`

## Benefits

✅ **Access to Private RDS** - Lambda in VPC can connect to RDS  
✅ **On-Demand Execution** - Run when needed  
✅ **Cost Effective** - Pay per invocation  
✅ **Scalable** - Handles concurrent runs  
✅ **Results in S3** - Easy to retrieve

## Limitations

⚠️ **15 Minute Timeout** - Lambda max execution time  
⚠️ **Package Size** - Laravel app + dependencies = large  
⚠️ **Cold Starts** - First invocation slower  
⚠️ **Memory Limits** - Max 10GB, but 3GB recommended

## Next Steps

1. Create Dockerfile for Lambda
2. Create Lambda handler PHP script
3. Build and push container image to ECR
4. Deploy Lambda function via Pulumi
5. Test invocation
6. Set up API Gateway (optional) for HTTP triggers

## Alternative: Use ECS Fargate Task

If Lambda limitations are an issue, use ECS Fargate:

```bash
# Run one-time task
aws ecs run-task \
  --cluster fibonacco-dev-cluster \
  --task-definition fibonacco-dev-test-runner \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx]}"
```

This gives you:
- ✅ No timeout limits
- ✅ More memory/CPU
- ✅ Easier to debug
- ❌ More expensive
- ❌ More complex setup


