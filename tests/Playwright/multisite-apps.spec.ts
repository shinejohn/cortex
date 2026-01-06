import { test, expect, Page, BrowserContext } from '@playwright/test';
import { getAuthStatePath } from './auth-helper';

/**
 * Multisite Apps Test Suite
 * 
 * Tests all 5 applications in the multisite setup:
 * 1. Event City (goeventcity.test) - Default/fallback
 * 2. Day News (daynews.test) - News platform
 * 3. Downtown Guide (downtownguide.test) - Business directory
 * 4. Go Local Voices (golocalvoices.com) - Podcast platform
 * 5. Alphasite (alphasite.com) - Business pages
 */

interface AppConfig {
    name: string;
    domain: string;
    baseURL: string;
    routes: string[];
    requiresAuth?: boolean;
}

const APPS: AppConfig[] = [
    {
        name: 'Event City',
        domain: 'goeventcity.test',
        baseURL: 'http://goeventcity.test:8000',
        routes: ['/', '/events', '/venues', '/performers', '/calendar', '/businesses'],
        requiresAuth: false,
    },
    {
        name: 'Day News',
        domain: 'daynews.test',
        baseURL: 'http://daynews.test:8000',
        routes: ['/', '/events', '/businesses'],
        requiresAuth: false,
    },
    {
        name: 'Downtown Guide',
        domain: 'downtownguide.test',
        baseURL: 'http://downtownguide.test:8000',
        routes: ['/', '/businesses', '/coupons'],
        requiresAuth: false,
    },
    {
        name: 'Go Local Voices',
        domain: 'golocalvoices.com',
        baseURL: 'http://golocalvoices.com:8000',
        routes: ['/'],
        requiresAuth: false,
    },
    {
        name: 'Alphasite',
        domain: 'alphasite.com',
        baseURL: 'http://alphasite.com:8000',
        routes: ['/', '/directory'],
        requiresAuth: false,
    },
];

/**
 * Navigate to a URL with proper Host header for domain-based routing
 */
async function navigateWithDomain(
    page: Page,
    url: string,
    domain: string,
    baseURL: string
): Promise<{ response: any; errors: string[]; consoleErrors: string[] }> {
    const errors: string[] = [];
    const consoleErrors: string[] = [];

    // Set up console error listener BEFORE navigation
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });

    // Set up page error listener BEFORE navigation
    page.on('pageerror', (error) => {
        errors.push(`${error.name}: ${error.message}`);
    });

    // Set up request error listener BEFORE navigation
    page.on('requestfailed', (request) => {
        const failure = request.failure();
        if (failure) {
            errors.push(`Request failed: ${request.url()} - ${failure.errorText}`);
        }
    });

    try {
        // Intercept requests to add Host header
        await page.route('**/*', (route) => {
            const headers = {
                ...route.request().headers(),
                'Host': domain,
            };
            route.continue({ headers });
        });

        // Navigate to URL (use 127.0.0.1 since we're setting Host header)
        const actualURL = url.startsWith('http') ? url : `http://127.0.0.1:8000${url}`;
        const response = await page.goto(actualURL, {
            waitUntil: 'domcontentloaded',
            timeout: 30000,
        });

        // Wait for potential errors to surface
        await page.waitForTimeout(2000);

        return { response, errors, consoleErrors };
    } catch (error: any) {
        errors.push(`Navigation error: ${error.message}`);
        return { response: null, errors, consoleErrors };
    }
}

/**
 * Verify page renders correctly without "Server Error"
 */
async function verifyPageContent(page: Page, appName: string): Promise<{
    success: boolean;
    hasServerError: boolean;
    hasContent: boolean;
    errors: string[];
    consoleErrors: string[];
    title: string;
}> {
    const errors: string[] = [];
    const consoleErrors: string[] = [];
    let hasServerError = false;
    let hasContent = false;
    let title = '';

    try {
        // Get page title
        title = await page.title().catch(() => '');

        // Get page content
        const bodyText = await page.textContent('body').catch(() => '') || '';
        const bodyHTML = await page.content().catch(() => '');

        // Check for "Server Error" indicators
        const serverErrorIndicators = [
            'Server Error',
            '500 Internal Server Error',
            'Whoops',
            'Symfony',
            'ReflectionException',
            'Class not found',
            'Unable to resolve page component',
        ];

        for (const indicator of serverErrorIndicators) {
            if (bodyText.includes(indicator) || bodyHTML.includes(indicator)) {
                hasServerError = true;
                errors.push(`Page contains error indicator: "${indicator}"`);
            }
        }

        // Check if page has actual content (not just error messages)
        // Look for common content indicators
        const contentIndicators = [
            '<div id="app"',
            'data-page=',
            'Inertia',
            'react',
            'root',
        ];

        hasContent = contentIndicators.some(indicator => bodyHTML.includes(indicator));

        // Check for Inertia data
        const hasInertiaData = await page.evaluate(() => {
            const appElement = document.getElementById('app');
            if (!appElement) return false;
            return appElement.hasAttribute('data-page');
        }).catch(() => false);

        if (!hasInertiaData && !hasServerError) {
            // Page might not use Inertia (API routes, etc.)
            hasContent = bodyText.trim().length > 50;
        }

        // Check console errors
        const consoleMessages = await page.evaluate(() => {
            return (window as any).__consoleErrors || [];
        }).catch(() => []);

        consoleErrors.push(...consoleMessages);

    } catch (error: any) {
        errors.push(`Error checking page content: ${error.message}`);
    }

    return {
        success: !hasServerError && hasContent && errors.length === 0,
        hasServerError,
        hasContent,
        errors,
        consoleErrors,
        title,
    };
}

// Test each app
for (const app of APPS) {
    test.describe(`${app.name} (${app.domain})`, () => {
        for (const route of app.routes) {
            test(`should load ${route} without Server Error`, async ({ page, browser }) => {
                // Create a new context for this test with route interception
                const context = await browser.newContext({
                    baseURL: 'http://127.0.0.1:8000',
                });

                const testPage = await context.newPage();

                try {
                    // Set up route interception to add Host header
                    await testPage.route('**/*', (route) => {
                        const headers = {
                            ...route.request().headers(),
                            'Host': app.domain,
                        };
                        route.continue({ headers });
                    });

                    const url = route.startsWith('http') ? route : `http://127.0.0.1:8000${route}`;
                    
                    // Navigate with domain
                    const { errors: navErrors, consoleErrors: navConsoleErrors, response } = await navigateWithDomain(
                        testPage,
                        url,
                        app.domain,
                        app.baseURL
                    );

                    // Verify page content
                    const verification = await verifyPageContent(testPage, app.name);

                    // Collect all errors
                    const allErrors = [
                        ...navErrors,
                        ...verification.errors,
                        ...navConsoleErrors,
                        ...verification.consoleErrors,
                    ];

                    // Log results
                    console.log(`\n📄 ${app.name} - ${route}`);
                    console.log(`   Status Code: ${response?.status() || 'N/A'}`);
                    console.log(`   Status: ${verification.success ? '✅' : '❌'}`);
                    console.log(`   Title: ${verification.title || 'N/A'}`);
                    console.log(`   Has Content: ${verification.hasContent ? '✅' : '❌'}`);
                    console.log(`   Server Error: ${verification.hasServerError ? '❌ YES' : '✅ NO'}`);

                    if (allErrors.length > 0) {
                        console.log(`   Errors:`);
                        allErrors.forEach(err => console.log(`     - ${err}`));
                    }

                    // Assertions
                    expect(response?.status(), `HTTP status should be 200`).toBe(200);
                    expect(verification.hasServerError, `Page shows "Server Error"`).toBe(false);
                    expect(verification.hasContent, `Page has no content`).toBe(true);
                    
                    // Log errors but don't fail - we want to see all errors
                    if (allErrors.length > 0) {
                        console.log(`   ⚠️  Found ${allErrors.length} errors - check details above`);
                    }
                } finally {
                    await testPage.close();
                    await context.close();
                }
            });
        }
    });
}

// Comprehensive test: Test all apps homepage
test.describe('All Apps - Homepage Test', () => {
    test('should load all app homepages successfully', async ({ browser }) => {
        const results: Array<{
            app: string;
            domain: string;
            success: boolean;
            errors: string[];
        }> = [];

        for (const app of APPS) {
            // Create a new context for each app
            const context = await browser.newContext({
                baseURL: 'http://127.0.0.1:8000',
            });

            const page = await context.newPage();

            try {
                // Set up route interception to add Host header
                await page.route('**/*', (route) => {
                    const headers = {
                        ...route.request().headers(),
                        'Host': app.domain,
                    };
                    route.continue({ headers });
                });

                const { errors: navErrors, response } = await navigateWithDomain(
                    page,
                    'http://127.0.0.1:8000/',
                    app.domain,
                    app.baseURL
                );

                const verification = await verifyPageContent(page, app.name);

                const allErrors = [...navErrors, ...verification.errors, ...verification.consoleErrors];

                results.push({
                    app: app.name,
                    domain: app.domain,
                    success: verification.success && allErrors.length === 0 && response?.status() === 200,
                    errors: allErrors,
                });

                console.log(`\n${verification.success && response?.status() === 200 ? '✅' : '❌'} ${app.name} (${app.domain})`);
                console.log(`   Status: ${response?.status() || 'N/A'}`);
                console.log(`   Has Server Error: ${verification.hasServerError ? 'YES' : 'NO'}`);
                if (allErrors.length > 0) {
                    console.log(`   Errors: ${allErrors.join(', ')}`);
                }
            } catch (error: any) {
                results.push({
                    app: app.name,
                    domain: app.domain,
                    success: false,
                    errors: [`Test error: ${error.message}`],
                });
            } finally {
                await page.close();
                await context.close();
            }
        }

        // Summary
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);

        console.log(`\n📊 Summary:`);
        console.log(`   ✅ Successful: ${successful.length}/${results.length}`);
        console.log(`   ❌ Failed: ${failed.length}/${results.length}`);

        if (failed.length > 0) {
            console.log(`\n❌ Failed Apps:`);
            failed.forEach(f => {
                console.log(`   - ${f.app} (${f.domain}): ${f.errors.join(', ')}`);
            });
        }

        // Assert at least 80% success rate
        const successRate = successful.length / results.length;
        expect(successRate, `Only ${(successRate * 100).toFixed(1)}% of apps loaded successfully`).toBeGreaterThan(0.8);
    });
});

