# Scribe API Documentation Guide

**Date:** December 29, 2025  
**Purpose:** Generate comprehensive API documentation using Scribe and output to Markdown files

## Overview

Scribe automatically generates API documentation from your Laravel routes and controllers. It extracts:
- Endpoint URLs and methods
- Request/response examples
- Validation rules
- Authentication requirements
- Code examples in multiple languages

## Installation

✅ Already installed:
```bash
composer require --dev knuckleswtf/scribe
php artisan vendor:publish --tag=scribe-config
```

## Configuration

### 1. Basic Configuration (`config/scribe.php`)

Key settings:
- **`type`**: Set to `'static'` to generate HTML + MD files
- **`base_url`**: Your API base URL
- **`routes`**: Which routes to document (currently set to `api/*`)
- **`output_path`**: Where to save documentation

### 2. Generate Documentation

```bash
# Generate all documentation
php artisan scribe:generate

# This will create:
# - public/docs/index.html (HTML documentation)
# - resources/docs/source/index.md (Source Markdown)
# - public/docs/postman.json (Postman collection)
# - public/docs/openapi.yaml (OpenAPI spec)
```

### 3. Markdown Output

Scribe generates Markdown files in `resources/docs/source/`. To export to standalone MD files:

```bash
# Copy markdown files to docs directory
mkdir -p docs/api
cp -r resources/docs/source/* docs/api/
```

## Adding Documentation to Controllers

### Basic Example

```php
/**
 * @group Authentication
 * 
 * Register a new user account.
 */
public function register(RegisterRequest $request): JsonResponse
{
    // ...
}
```

### Advanced Example with Examples

```php
/**
 * @group Posts
 * 
 * Create a new post.
 * 
 * @bodyParam workspace_id string required The workspace ID. Example: 550e8400-e29b-41d4-a716-446655440000
 * @bodyParam title string required The post title. Example: My First Post
 * @bodyParam content string required The post content. Example: This is the content of my post
 * @bodyParam status string The post status. Example: draft
 * 
 * @response 201 {
 *   "success": true,
 *   "message": "Post created successfully",
 *   "data": {
 *     "id": "550e8400-e29b-41d4-a716-446655440000",
 *     "title": "My First Post",
 *     "status": "draft"
 *   }
 * }
 */
public function store(StorePostRequest $request): JsonResponse
{
    // ...
}
```

## Documentation Tags

### Grouping Endpoints
```php
/**
 * @group Authentication
 */
```

### Request Parameters
```php
/**
 * @bodyParam name string required The user's name. Example: John Doe
 * @queryParam page integer The page number. Example: 1
 * @urlParam id string required The user ID. Example: 123
 */
```

### Responses
```php
/**
 * @response 200 {
 *   "success": true,
 *   "data": {...}
 * }
 * @response 422 {
 *   "success": false,
 *   "errors": {...}
 * }
 */
```

### Authentication
```php
/**
 * @authenticated
 */
```

## Generating Markdown Files

### Option 1: Use Scribe's Built-in Markdown

Scribe generates markdown in `resources/docs/source/`. You can:

1. Generate docs: `php artisan scribe:generate`
2. Copy markdown files:
```bash
mkdir -p docs/api/v1
cp resources/docs/source/*.md docs/api/v1/
```

### Option 2: Convert HTML to Markdown

Use a tool like `pandoc`:
```bash
pandoc public/docs/index.html -o docs/api/complete-api-documentation.md
```

### Option 3: Export from OpenAPI Spec

The OpenAPI spec (`public/docs/openapi.yaml`) can be converted to Markdown:
```bash
# Using redoc-cli
npx @redocly/cli build-docs public/docs/openapi.yaml -o docs/api/openapi.md
```

## Custom Markdown Export Script

Create a custom command to export to MD:

```php
// app/Console/Commands/ExportApiDocsToMarkdown.php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ExportApiDocsToMarkdown extends Command
{
    protected $signature = 'api:export-markdown';
    protected $description = 'Export API documentation to Markdown files';

    public function handle()
    {
        // Generate Scribe docs first
        $this->call('scribe:generate');

        // Copy markdown files
        $sourceDir = resource_path('docs/source');
        $outputDir = base_path('docs/api');

        if (!File::exists($outputDir)) {
            File::makeDirectory($outputDir, 0755, true);
        }

        File::copyDirectory($sourceDir, $outputDir);

        $this->info("API documentation exported to {$outputDir}");
    }
}
```

## Documentation Structure

```
docs/
├── api/
│   ├── index.md (Main documentation)
│   ├── authentication.md
│   ├── users.md
│   ├── posts.md
│   ├── crm.md
│   └── ...
├── integration-tests/
│   └── scenarios.md
└── README.md
```

## Best Practices

1. **Add DocBlocks to All Controllers**: Document every endpoint
2. **Include Examples**: Provide realistic request/response examples
3. **Group Related Endpoints**: Use `@group` tags
4. **Document Errors**: Include error response examples
5. **Keep Updated**: Regenerate docs after API changes

## Automated Documentation Updates

Add to CI/CD pipeline:

```yaml
# .github/workflows/docs.yml
name: Generate API Docs

on:
  push:
    branches: [ main ]
    paths:
      - 'app/Http/Controllers/**'
      - 'routes/api/**'

jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Generate Docs
        run: |
          composer install
          php artisan scribe:generate
          php artisan api:export-markdown
      - name: Commit Docs
        run: |
          git config user.name "Docs Bot"
          git config user.email "docs@example.com"
          git add docs/
          git commit -m "Update API documentation" || exit 0
          git push
```

## Viewing Documentation

### Local Development
```bash
# Generate docs
php artisan scribe:generate

# View HTML docs
open public/docs/index.html

# View markdown files
cat docs/api/index.md
```

### Production
- HTML: Host `public/docs/` directory
- Markdown: Include in repository or documentation site
- Postman: Import `public/docs/postman.json`
- OpenAPI: Use with Swagger UI or other tools

## Next Steps

1. Add DocBlocks to all controllers
2. Generate initial documentation
3. Export to Markdown
4. Review and refine
5. Set up automated generation


