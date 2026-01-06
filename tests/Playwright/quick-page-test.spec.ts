import { test, expect } from '@playwright/test';

/**
 * Quick Page Test - Tests Critical Pages
 * 
 * This is a fast test that verifies the most important pages work.
 * Run this first to quickly verify the system works.
 */

const criticalPages = [
    { path: '/', name: 'Homepage' },
    { path: '/about', name: 'About' },
    { path: '/contact', name: 'Contact' },
    { path: '/how-it-works', name: 'How It Works' },
    { path: '/events', name: 'Events' },
    { path: '/performers', name: 'Performers' },
    { path: '/venues', name: 'Venues' },
    { path: '/calendars', name: 'Calendars' },
    { path: '/tickets', name: 'Tickets' },
    { path: '/community', name: 'Community' },
    { path: '/calendar', name: 'Calendar' },
    { path: '/advertise', name: 'Advertise' },
    { path: '/partner', name: 'Partner' },
    { path: '/press', name: 'Press' },
    { path: '/careers', name: 'Careers' },
    { path: '/gear', name: 'Gear' },
    { path: '/success-stories', name: 'Success Stories' },
    { path: '/community/impact', name: 'Community Impact' },
    { path: '/performers/discovery', name: 'Performers Discovery' },
    { path: '/performers/market-report', name: 'Performers Market Report' },
    { path: '/venues/submit', name: 'Venues Submit' },
    { path: '/businesses', name: 'Businesses' },
    { path: '/stores', name: 'Stores' },
    { path: '/shop', name: 'Shop' },
];

test.describe('Critical Pages - Quick Test', () => {
    for (const page of criticalPages) {
        test(`should load ${page.name} (${page.path})`, async ({ page: browserPage }) => {
            // Navigate to page
            const response = await browserPage.goto(page.path, { 
                waitUntil: 'domcontentloaded',
                timeout: 30000,
            });
            
            // Check HTTP status
            expect(response?.status()).toBe(200);
            
            // Wait for page to be ready
            await browserPage.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
                // Network idle timeout is OK
            });
            
            // Check for JavaScript errors
            const errors: string[] = [];
            browserPage.on('pageerror', (error) => {
                errors.push(error.message);
            });
            
            // Wait a moment for errors
            await browserPage.waitForTimeout(1000);
            
            // Check page has content
            const bodyText = await browserPage.textContent('body');
            expect(bodyText).toBeTruthy();
            expect(bodyText?.length).toBeGreaterThan(10);
            
            // Check for common error indicators
            const errorIndicators = [
                '500 Internal Server Error',
                'Server Error',
                'Whoops',
                'ReflectionException',
                'Class not found',
                'Unable to resolve page component',
            ];
            
            for (const indicator of errorIndicators) {
                expect(bodyText).not.toContain(indicator);
            }
            
            // Verify no JavaScript errors
            expect(errors.length, `JavaScript errors found: ${errors.join(', ')}`).toBe(0);
            
            // Check page title
            const title = await browserPage.title();
            expect(title).toBeTruthy();
            
            console.log(`✅ ${page.name} (${page.path}) - Loaded successfully`);
        });
    }
    
    test('should verify Inertia is functional', async ({ page }) => {
        await page.goto('/about');
        
        // Check Inertia is loaded
        const hasInertia = await page.evaluate(() => {
            return typeof window !== 'undefined' && 
                   (window as any).Inertia !== undefined;
        });
        
        expect(hasInertia, 'Inertia should be loaded').toBe(true);
        
        // Test navigation
        const link = page.locator('a[href="/contact"]').first();
        if (await link.count() > 0) {
            await link.click();
            await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
            expect(page.url()).toContain('/contact');
        }
    });
});

test.describe('Error Handling', () => {
    test('should handle 404 gracefully', async ({ page }) => {
        const response = await page.goto('/non-existent-page-12345', { 
            waitUntil: 'domcontentloaded' 
        });
        
        // Should return 404, not 500
        expect(response?.status()).toBe(404);
        
        // Page should still render
        const bodyText = await page.textContent('body');
        expect(bodyText).toBeTruthy();
    });
});

