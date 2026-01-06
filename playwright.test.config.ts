import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Test Configuration (No WebServer)
 * Use this when server is already running
 */
export default defineConfig({
    testDir: './tests/Playwright',
    
    fullyParallel: false,
    workers: 1,
    
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    
    reporter: 'list',
    
    use: {
        baseURL: process.env.APP_URL || 'http://localhost:8000',
        actionTimeout: 30000,
        navigationTimeout: 60000,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    
    timeout: 300000,
    
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    
    // NO webServer - server must be running separately
});

