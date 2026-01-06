import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './tests/Playwright',
    
    // Run tests in files in parallel
    fullyParallel: true,
    
    // Fail the build on CI if you accidentally left test.only in the source code
    forbidOnly: !!process.env.CI,
    
    // Retry on CI only
    retries: process.env.CI ? 2 : 0,
    
    // Opt out of parallel tests on CI
    workers: process.env.CI ? 1 : undefined,
    
    // Reporter to use
    reporter: 'html',
    
    // Shared settings for all projects
    use: {
        // Base URL to use in actions like `await page.goto('/')`
        baseURL: process.env.APP_URL || 'http://localhost:8000',
        
        // Extended timeouts for testing
        actionTimeout: 30000, // 30 seconds for actions
        navigationTimeout: 60000, // 60 seconds for navigation
        
        // Collect trace when retrying the failed test
        trace: 'on-first-retry',
        
        // Screenshot on failure
        screenshot: 'only-on-failure',
        
        // Video on failure
        video: 'retain-on-failure',
        
        // Capture console logs and errors
        console: 'on',
    },
    
    // Global test timeout (extended for comprehensive testing)
    timeout: 300000, // 5 minutes per test

    // Configure projects for major browsers
    projects: [
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/,
        },
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
            dependencies: ['setup'],
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
            dependencies: ['setup'],
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
            dependencies: ['setup'],
        },
    ],

    // Run your local dev server before starting the tests
    webServer: {
        command: 'php artisan serve',
        url: 'http://localhost:8000',
        reuseExistingServer: !process.env.CI,
        timeout: 300000, // Extended to 5 minutes for server startup
    },
});

