import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['list']
    ],

    use: {
        baseURL: process.env.TEST_URL || 'https://dev.day.news',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'on-first-retry',
    },

    projects: [
        // Day.News
        {
            name: 'day-news',
            use: {
                ...devices['Desktop Chrome'],
                baseURL: 'http://localhost:8002',
                extraHTTPHeaders: {
                    'X-Forced-Host': 'dev.day.news'
                }
            },
        },
        // GoEventCity
        {
            name: 'goeventcity',
            use: {
                ...devices['Desktop Chrome'],
                baseURL: 'http://localhost:8002',
                extraHTTPHeaders: {
                    'X-Forced-Host': 'goeventcity.test'
                }
            },
        },
        // GoLocalVoices
        {
            name: 'golocalvoices',
            use: {
                ...devices['Desktop Chrome'],
                baseURL: 'http://localhost:8002',
                extraHTTPHeaders: {
                    'X-Forced-Host': 'golocalvoices.test'
                }
            },
        },
        // DowntownsGuide
        {
            name: 'downtownsguide',
            use: {
                ...devices['Desktop Chrome'],
                baseURL: 'http://localhost:8002',
                extraHTTPHeaders: {
                    'X-Forced-Host': 'downtownguide.test'
                }
            },
        },
        // AlphaSite
        {
            name: 'alphasite',
            use: {
                ...devices['Desktop Chrome'],
                baseURL: 'http://localhost:8002',
                extraHTTPHeaders: {
                    'X-Forced-Host': 'alphasite.test'
                }
            },
        },
        // Mobile Testing
        {
            name: 'mobile-chrome',
            use: {
                ...devices['Pixel 5'],
                baseURL: 'https://dev.day.news',
            },
        },
    ],
});
