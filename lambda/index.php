<?php

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Aws\SecretsManager\SecretsManagerClient;
use Aws\S3\S3Client;
use Illuminate\Support\Facades\Artisan;

/**
 * Lambda handler for running Laravel commands.
 *
 * Supported commands:
 * - scribe:generate
 * - api:export-markdown
 * - test (with optional filter)
 */
function handler($event, $context)
{
    try {
        // Get command from event
        $command = $event['command'] ?? 'test';
        $filter = $event['filter'] ?? null;
        $arguments = $event['arguments'] ?? [];

        // Load secrets from Secrets Manager
        $secrets = getSecretsFromSecretsManager($event['secret_name'] ?? 'fibonacco/dev/app-secrets');

        // Set environment variables
        foreach ($secrets as $key => $value) {
            putenv("$key=$value");
            $_ENV[$key] = $value;
        }

        // Bootstrap Laravel
        $app = require_once __DIR__ . '/../bootstrap/app.php';
        $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

        // Build command
        $artisanCommand = $command;
        if ($filter && $command === 'test') {
            $artisanCommand = "test --filter=$filter";
        }

        // Add additional arguments
        foreach ($arguments as $arg) {
            $artisanCommand .= " $arg";
        }

        // Run command
        $exitCode = $kernel->call($artisanCommand);

        // Capture output
        $output = $kernel->output();

        // Upload results to S3 if command succeeded
        $s3Key = null;
        if ($exitCode === 0) {
            $s3Key = uploadResultsToS3($command, $output, $context->getRequestId());
        }

        return [
            'statusCode' => $exitCode === 0 ? 200 : 500,
            'body' => json_encode([
                'command' => $command,
                'exitCode' => $exitCode,
                'output' => $output,
                's3Key' => $s3Key,
                'requestId' => $context->getRequestId(),
            ]),
        ];
    } catch (Exception $e) {
        return [
            'statusCode' => 500,
            'body' => json_encode([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]),
        ];
    }
}

/**
 * Get secrets from AWS Secrets Manager.
 */
function getSecretsFromSecretsManager(string $secretName): array
{
    $client = new SecretsManagerClient([
        'version' => 'latest',
        'region' => getenv('AWS_DEFAULT_REGION') ?: 'us-east-1',
    ]);

    $result = $client->getSecretValue(['SecretId' => $secretName]);
    return json_decode($result['SecretString'], true);
}

/**
 * Upload command results to S3.
 */
function uploadResultsToS3(string $command, string $output, string $requestId): ?string
{
    $bucket = getenv('S3_BUCKET') ?: 'fibonacco-dev-app-storage';
    $key = "test-results/{$command}-{$requestId}.txt";

    try {
        $s3 = new S3Client([
            'version' => 'latest',
            'region' => getenv('AWS_DEFAULT_REGION') ?: 'us-east-1',
        ]);

        $s3->putObject([
            'Bucket' => $bucket,
            'Key' => $key,
            'Body' => $output,
            'ContentType' => 'text/plain',
        ]);

        return $key;
    } catch (Exception $e) {
        error_log("Failed to upload to S3: " . $e->getMessage());
        return null;
    }
}


