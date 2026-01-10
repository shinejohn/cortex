# Multisite Platform

Laravel-based multisite platform supporting multiple applications including GoEventCity, Day.News, Downtown Guide, AlphaSite, and GoLocalVoices.

## Workflow Status

[![Tests](https://github.com/shinejohn/Community-Platform/actions/workflows/tests.yml/badge.svg)](https://github.com/shinejohn/Community-Platform/actions/workflows/tests.yml)
[![Deploy](https://github.com/shinejohn/Community-Platform/actions/workflows/deploy.yml/badge.svg)](https://github.com/shinejohn/Community-Platform/actions/workflows/deploy.yml)

## Quick Start

### Prerequisites
- PHP 8.3+
- Composer
- Node.js 22+
- PostgreSQL or MySQL
- Redis (for queues and cache)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   composer install
   npm install
   ```
3. Copy environment file:
   ```bash
   cp .env.example .env
   ```
4. Generate application key:
   ```bash
   php artisan key:generate
   ```
5. Run migrations:
   ```bash
   php artisan migrate
   ```
6. Build assets:
   ```bash
   npm run build
   ```

### Running Tests

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature
php artisan test --testsuite=Unit
```

### Development

```bash
# Start development server
composer dev

# Or with SSR
composer dev:ssr
```

## CI/CD

### GitHub Actions Workflows

- **Tests** (`.github/workflows/tests.yml`): Runs on push/PR to main/develop
  - PHP 8.3 setup
  - Composer dependencies
  - Node dependencies
  - Asset building
  - Pest test execution

- **Deploy** (`.github/workflows/deploy.yml`): Runs on push to main
  - Runs tests first
  - Builds Docker images
  - Pushes to AWS ECR
  - Deploys to AWS ECS

- **Diagnostic** (`.github/workflows/diagnose.yml`): Manual/automated diagnostics
  - Checks dependencies
  - Validates configuration
  - Verifies Dockerfiles
  - Reports issues

### AWS Deployment

The platform deploys to AWS ECS with the following services:
- `fibonacco-dev-goeventcity`
- `fibonacco-dev-daynews`
- `fibonacco-dev-downtownguide`
- `fibonacco-dev-alphasite`
- `fibonacco-dev-golocalvoices`
- `fibonacco-dev-inertia-ssr`
- `fibonacco-dev-horizon`

See [AWS Infrastructure Verification Guide](docs/AWS_INFRASTRUCTURE_VERIFICATION.md) for details.

## Project Structure

```
├── app/                    # Laravel application code
├── config/                 # Configuration files
├── database/               # Migrations, seeders, factories
├── docker/                 # Docker configurations
├── resources/              # Frontend resources (React/Inertia)
├── routes/                 # Route definitions
├── tests/                  # Test suite (Pest)
└── .github/workflows/      # GitHub Actions workflows
```

## Documentation

- [Deployment Guide](README_DEPLOYMENT.md)
- [AWS Infrastructure Verification](docs/AWS_INFRASTRUCTURE_VERIFICATION.md)
- [Testing Guide](tests/Playwright/README-TESTING.md)

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure tests pass
4. Submit a pull request

## License

Proprietary

