<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

final class ExportApiDocsToMarkdown extends Command
{
    protected $signature = 'api:export-markdown {--output=docs/api}';
    protected $description = 'Export API documentation to Markdown files';

    public function handle(): int
    {
        $this->info('Generating API documentation with Scribe...');
        $this->call('scribe:generate');

        $sourceDir = resource_path('docs/source');
        $outputDir = base_path($this->option('output'));

        if (!File::exists($sourceDir)) {
            $this->error("Source directory not found: {$sourceDir}");
            $this->info('Run "php artisan scribe:generate" first.');
            return self::FAILURE;
        }

        if (!File::exists($outputDir)) {
            File::makeDirectory($outputDir, 0755, true);
            $this->info("Created output directory: {$outputDir}");
        }

        // Copy markdown files
        File::copyDirectory($sourceDir, $outputDir);

        // Also copy OpenAPI spec and Postman collection
        $publicDocs = public_path('docs');
        if (File::exists($publicDocs)) {
            File::copy("{$publicDocs}/openapi.yaml", "{$outputDir}/openapi.yaml");
            File::copy("{$publicDocs}/postman.json", "{$outputDir}/postman.json");
            $this->info('Copied OpenAPI spec and Postman collection');
        }

        $this->info("✅ API documentation exported to {$outputDir}");
        $this->info("📄 Markdown files: " . count(File::files($outputDir)) . " files");

        return self::SUCCESS;
    }
}


