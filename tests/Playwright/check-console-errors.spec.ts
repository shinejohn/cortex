import { test, expect, Page } from '@playwright/test';

/**
 * Console Error Checker
 * 
 * This test navigates to pages and captures all console errors
 * to help identify why pages show "Server Error" in the browser
 * even though backend returns 200.
 */

const TEST_PAGES = [
    { name: 'Event City Home', url: '/', domain: 'goeventcity.test' },
    { name: 'Event City Events', url: '/events', domain: 'goeventcity.test' },
    { name: 'Event City Businesses', url: '/businesses', domain: 'goeventcity.test' },
    { name: 'Event City Calendar', url: '/calendar', domain: 'goeventcity.test' },
    { name: 'Day News Home', url: '/', domain: 'daynews.test' },
    { name: 'Day News Events', url: '/events', domain: 'daynews.test' },
    { name: 'Day News Businesses', url: '/businesses', domain: 'daynews.test' },
    { name: 'Downtown Guide Home', url: '/', domain: 'downtownguide.test' },
    { name: 'Downtown Guide Businesses', url: '/businesses', domain: 'downtownguide.test' },
    { name: 'Go Local Voices Home', url: '/', domain: 'golocalvoices.com' },
    { name: 'Alphasite Home', url: '/', domain: 'alphasite.com' },
    { name: 'Alphasite Directory', url: '/directory', domain: 'alphasite.com' },
];

test.describe('Console Error Checker', () => {
    for (const testPage of TEST_PAGES) {
        test(`should check console errors for ${testPage.name}`, async ({ page, browser }) => {
            const consoleErrors: string[] = [];
            const consoleWarnings: string[] = [];
            const networkErrors: string[] = [];
            const pageErrors: string[] = [];

            // Set up error listeners BEFORE navigation
            page.on('console', (msg) => {
                const text = msg.text();
                if (msg.type() === 'error') {
                    consoleErrors.push(text);
                } else if (msg.type() === 'warning') {
                    consoleWarnings.push(text);
                }
            });

            page.on('pageerror', (error) => {
                pageErrors.push(`${error.name}: ${error.message}`);
            });

            page.on('requestfailed', (request) => {
                const failure = request.failure();
                if (failure) {
                    networkErrors.push(`${request.url()} - ${failure.errorText}`);
                }
            });

            // Create context
            const context = await browser.newContext({
                baseURL: 'http://127.0.0.1:8000',
            });

            const testPageInstance = await context.newPage();

            // Set up route interception to add Host header
            await testPageInstance.route('**/*', (route) => {
                const headers = {
                    ...route.request().headers(),
                    'Host': testPage.domain,
                };
                route.continue({ headers });
            });

            try {
                // Navigate to page
                const response = await testPageInstance.goto(testPage.url, {
                    waitUntil: 'domcontentloaded',
                    timeout: 30000,
                });

                // Wait for potential errors to surface
                await testPageInstance.waitForTimeout(3000);

                // Get page content
                const bodyText = await testPageInstance.textContent('body').catch(() => '') || '';
                const bodyHTML = await testPageInstance.content().catch(() => '');

                // Check for "Server Error" in content
                const hasServerError = bodyText.includes('Server Error') || 
                                     bodyHTML.includes('Server Error') ||
                                     bodyText.includes('500') ||
                                     bodyHTML.includes('500');

                // Check for Inertia data
                const hasInertiaData = await testPageInstance.evaluate(() => {
                    const appElement = document.getElementById('app');
                    return appElement && appElement.hasAttribute('data-page');
                }).catch(() => false);

                // Get all console messages
                const allConsoleMessages = await testPageInstance.evaluate(() => {
                    return {
                        errors: (window as any).__consoleErrors || [],
                        warnings: (window as any).__consoleWarnings || [],
                    };
                }).catch(() => ({ errors: [], warnings: [] }));

                // Log results
                console.log(`\n📄 ${testPage.name} (${testPage.domain}${testPage.url})`);
                console.log(`   Status Code: ${response?.status() || 'N/A'}`);
                console.log(`   Has Inertia Data: ${hasInertiaData ? '✅' : '❌'}`);
                console.log(`   Has Server Error Text: ${hasServerError ? '❌ YES' : '✅ NO'}`);

                if (consoleErrors.length > 0) {
                    console.log(`   ❌ Console Errors (${consoleErrors.length}):`);
                    consoleErrors.forEach(err => console.log(`      - ${err}`));
                }

                if (pageErrors.length > 0) {
                    console.log(`   ❌ Page Errors (${pageErrors.length}):`);
                    pageErrors.forEach(err => console.log(`      - ${err}`));
                }

                if (networkErrors.length > 0) {
                    console.log(`   ❌ Network Errors (${networkErrors.length}):`);
                    networkErrors.forEach(err => console.log(`      - ${err}`));
                }

                if (consoleWarnings.length > 0) {
                    console.log(`   ⚠️  Console Warnings (${consoleWarnings.length}):`);
                    consoleWarnings.slice(0, 5).forEach(warn => console.log(`      - ${warn}`));
                }

                // Check for React hydration errors
                const hydrationErrors = consoleErrors.filter(err => 
                    err.includes('hydration') || 
                    err.includes('Hydration') ||
                    err.includes('React') ||
                    err.includes('render')
                );

                if (hydrationErrors.length > 0) {
                    console.log(`   ⚠️  Potential React Hydration Errors:`);
                    hydrationErrors.forEach(err => console.log(`      - ${err}`));
                }

                // Assertions
                expect(response?.status(), `HTTP status should be 200`).toBe(200);
                expect(hasServerError, `Page should not contain "Server Error" text`).toBe(false);
                
                // Log errors but don't fail test - we want to see all errors
                if (consoleErrors.length > 0 || pageErrors.length > 0) {
                    console.log(`\n   ⚠️  Found ${consoleErrors.length + pageErrors.length} errors - check details above`);
                }

            } catch (error: any) {
                console.error(`\n❌ Error testing ${testPage.name}:`, error.message);
                throw error;
            } finally {
                await testPageInstance.close();
                await context.close();
            }
        });
    }
});

