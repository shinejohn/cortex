# Quarantine Tests

This directory contains tests that are known to be flaky, broken, or need investigation.

## Purpose

Tests in this directory are:
- **Non-blocking** - They don't prevent deployment
- **Informational** - They still run and report results
- **Tracked** - Each test should have a GitHub issue tracking its fix

## Moving Tests Here

When moving a test to quarantine:

1. **Create a GitHub issue** describing:
   - Why the test is flaky/broken
   - What it was testing
   - Error message or behavior
   - Priority for fixing

2. **Add a comment** to the test:
   ```php
   /**
    * @group quarantine
    * 
    * QUARANTINE: Issue #123
    * Reason: Flaky due to timing issues with external API
    * Date: 2025-01-28
    */
   ```

3. **Move the test file** to this directory

4. **Update CI/CD** to run quarantine tests separately (non-blocking)

## Review Process

- **Weekly**: Review quarantine tests
- **Fix or Delete**: Each test should be fixed or deleted within 2 weeks
- **Document**: Keep this README updated with current status

## Current Quarantine Tests

_None yet - tests will be moved here as they are identified_

