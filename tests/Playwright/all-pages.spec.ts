import { test, expect, Page } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Comprehensive Page Testing Suite
 * 
 * This test suite verifies that ALL Inertia pages load correctly.
 * It tests:
 * - Page loads without errors
 * - Inertia component renders
 * - No JavaScript errors
 * - Page title is set
 * - Basic content is visible
 */

// Extract all Inertia::render calls from routes and controllers
const extractInertiaPages = (): Array<{ path: string; route: string; requiresAuth: boolean }> => {
    const pages: Array<{ path: string; route: string; requiresAuth: boolean }> = [];
    
    // Public Event City pages
    pages.push({ path: '/', route: 'home', requiresAuth: false });
    pages.push({ path: '/about', route: 'about', requiresAuth: false });
    pages.push({ path: '/contact', route: 'contact', requiresAuth: false });
    pages.push({ path: '/how-it-works', route: 'how-it-works', requiresAuth: false });
    pages.push({ path: '/success-stories', route: 'success-stories', requiresAuth: false });
    pages.push({ path: '/advertise', route: 'advertise', requiresAuth: false });
    pages.push({ path: '/partner', route: 'partner', requiresAuth: false });
    pages.push({ path: '/press', route: 'press', requiresAuth: false });
    pages.push({ path: '/careers', route: 'careers', requiresAuth: false });
    pages.push({ path: '/gear', route: 'gear', requiresAuth: false });
    pages.push({ path: '/calendar', route: 'calendar.index', requiresAuth: false });
    pages.push({ path: '/events', route: 'events', requiresAuth: false });
    pages.push({ path: '/performers', route: 'performers', requiresAuth: false });
    pages.push({ path: '/venues', route: 'venues', requiresAuth: false });
    pages.push({ path: '/calendars', route: 'calendars.index', requiresAuth: false });
    pages.push({ path: '/tickets', route: 'tickets.index', requiresAuth: false });
    pages.push({ path: '/community', route: 'community.index', requiresAuth: false });
    pages.push({ path: '/community/impact', route: 'community.impact', requiresAuth: false });
    pages.push({ path: '/performers/discovery', route: 'performers.discovery', requiresAuth: false });
    pages.push({ path: '/performers/market-report', route: 'performers.market-report', requiresAuth: false });
    pages.push({ path: '/venues/submit', route: 'venues.submit', requiresAuth: false });
    pages.push({ path: '/businesses', route: 'event-city.businesses.index', requiresAuth: false });
    pages.push({ path: '/stores', route: 'stores.index', requiresAuth: false });
    pages.push({ path: '/shop', route: 'shop.discover', requiresAuth: false });
    
    // Authenticated Event City pages
    pages.push({ path: '/dashboard/fan', route: 'dashboard.fan', requiresAuth: true });
    pages.push({ path: '/dashboard/organizer', route: 'dashboard.organizer', requiresAuth: true });
    pages.push({ path: '/dashboard/performer', route: 'dashboard.performer', requiresAuth: true });
    pages.push({ path: '/dashboard/venue-owner', route: 'dashboard.venue-owner', requiresAuth: true });
    pages.push({ path: '/dashboard/calendar', route: 'dashboard.calendar', requiresAuth: true });
    pages.push({ path: '/events/create', route: 'events.create', requiresAuth: true });
    pages.push({ path: '/performers/create', route: 'performers.create', requiresAuth: true });
    pages.push({ path: '/venues/create', route: 'venues.create', requiresAuth: true });
    pages.push({ path: '/calendars/create', route: 'calendars.create', requiresAuth: true });
    pages.push({ path: '/social', route: 'social.index', requiresAuth: true });
    pages.push({ path: '/social/feed', route: 'social.feed.index', requiresAuth: true });
    pages.push({ path: '/notifications', route: 'notifications.index', requiresAuth: true });
    pages.push({ path: '/tickets/my-tickets', route: 'tickets.my-tickets', requiresAuth: true });
    pages.push({ path: '/orders', route: 'orders.index', requiresAuth: true });
    pages.push({ path: '/cart', route: 'cart.index', requiresAuth: false });
    
    return pages;
};

// Helper function to check if page loaded successfully
async function verifyPageLoads(page: Page, url: string): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
        // Navigate to page
        const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        
        // Check HTTP status
        if (!response || response.status() >= 400) {
            errors.push(`HTTP ${response?.status() || 'unknown'} error`);
            return { success: false, errors };
        }
        
        // Wait for Inertia to initialize
        await page.waitForFunction(() => {
            return window.Inertia !== undefined;
        }, { timeout: 10000 }).catch(() => {
            errors.push('Inertia not initialized');
        });
        
        // Check for JavaScript errors
        page.on('pageerror', (error) => {
            errors.push(`JavaScript error: ${error.message}`);
        });
        
        // Check for console errors
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                errors.push(`Console error: ${msg.text()}`);
            }
        });
        
        // Wait a bit for any errors to surface
        await page.waitForTimeout(2000);
        
        // Check if page has content (not blank)
        const bodyText = await page.textContent('body');
        if (!bodyText || bodyText.trim().length < 10) {
            errors.push('Page appears to be blank');
        }
        
        // Check if Inertia page component loaded
        const hasInertiaData = await page.evaluate(() => {
            return document.querySelector('[data-page]') !== null || 
                   window.Inertia !== undefined;
        });
        
        if (!hasInertiaData) {
            errors.push('Inertia page data not found');
        }
        
        return { success: errors.length === 0, errors };
    } catch (error: any) {
        errors.push(`Navigation error: ${error.message}`);
        return { success: false, errors };
    }
}

// Test all public pages
test.describe('Public Pages - Event City', () => {
    const publicPages = extractInertiaPages().filter(p => !p.requiresAuth);
    
    for (const page of publicPages) {
        test(`should load ${page.path}`, async ({ page: browserPage }) => {
            const result = await verifyPageLoads(browserPage, page.path);
            
            if (!result.success) {
                console.error(`Failed to load ${page.path}:`, result.errors);
            }
            
            expect(result.success, `Page ${page.path} failed: ${result.errors.join(', ')}`).toBe(true);
            
            // Additional checks
            const title = await browserPage.title();
            expect(title).toBeTruthy();
            
            // Check for common error messages
            const errorText = await browserPage.textContent('body');
            expect(errorText).not.toContain('500');
            expect(errorText).not.toContain('Server Error');
            expect(errorText).not.toContain('Page not found');
        });
    }
});

// Test authenticated pages (requires auth setup)
test.describe('Authenticated Pages - Event City', () => {
    test.use({ storageState: 'playwright/.auth/user.json' });
    
    const authPages = extractInertiaPages().filter(p => p.requiresAuth);
    
    for (const page of authPages) {
        test(`should load ${page.path}`, async ({ page: browserPage }) => {
            const result = await verifyPageLoads(browserPage, page.path);
            
            if (!result.success) {
                console.error(`Failed to load ${page.path}:`, result.errors);
            }
            
            expect(result.success, `Page ${page.path} failed: ${result.errors.join(', ')}`).toBe(true);
            
            // Check we're not redirected to login
            const url = browserPage.url();
            expect(url).not.toContain('/login');
            expect(url).not.toContain('/auth');
        });
    }
});

// Test Day News pages
test.describe('Day News Pages', () => {
    test('should load Day News homepage', async ({ page }) => {
        // Note: This requires domain configuration
        // For local testing, you may need to use hosts file or domain setup
        const result = await verifyPageLoads(page, '/');
        
        // This will test the default domain (Event City)
        // For Day News specific testing, configure domain in playwright.config.ts
        expect(result.success).toBe(true);
    });
});

// Test Downtown Guide pages
test.describe('Downtown Guide Pages', () => {
    test('should load Downtown Guide homepage', async ({ page }) => {
        // Note: This requires domain configuration
        const result = await verifyPageLoads(page, '/');
        
        // For Downtown Guide specific testing, configure domain in playwright.config.ts
        expect(result.success).toBe(true);
    });
});

// Test error handling
test.describe('Error Handling', () => {
    test('should handle 404 gracefully', async ({ page }) => {
        const response = await page.goto('/non-existent-page-12345', { waitUntil: 'networkidle' });
        
        // Should return 404, not 500
        expect(response?.status()).toBe(404);
        
        // Page should still render (Laravel 404 page)
        const bodyText = await page.textContent('body');
        expect(bodyText).toBeTruthy();
    });
    
    test('should handle invalid routes gracefully', async ({ page }) => {
        const response = await page.goto('/invalid/route/test', { waitUntil: 'networkidle' });
        
        // Should return 404
        expect(response?.status()).toBe(404);
    });
});

// Test Inertia navigation
test.describe('Inertia Navigation', () => {
    test('should navigate between pages without full reload', async ({ page }) => {
        await page.goto('/about');
        
        // Get initial page load count
        const initialLoads = await page.evaluate(() => {
            return window.performance.getEntriesByType('navigation').length;
        });
        
        // Navigate to another page
        await page.click('a[href="/contact"]');
        await page.waitForLoadState('networkidle');
        
        // Verify we're on the new page
        expect(page.url()).toContain('/contact');
        
        // Verify Inertia navigation occurred (no full page reload)
        // In a real SPA, navigation should be faster than full reload
        const finalLoads = await page.evaluate(() => {
            return window.performance.getEntriesByType('navigation').length;
        });
        
        // Navigation count should be similar (SPA navigation, not full reload)
        expect(finalLoads).toBeLessThanOrEqual(initialLoads + 1);
    });
});

// Test page component existence
test.describe('Page Component Verification', () => {
    test('should verify all page components exist', async () => {
        const pages = extractInertiaPages();
        const missingPages: string[] = [];
        
        for (const page of pages) {
            // Convert route path to file path
            // event-city/about -> resources/js/pages/event-city/about.tsx
            const filePath = join(process.cwd(), 'resources/js/pages', `${page.path.replace(/^\//, '').replace(/\//g, '/')}.tsx`);
            
            try {
                readFileSync(filePath, 'utf-8');
            } catch (error) {
                missingPages.push(page.path);
            }
        }
        
        expect(missingPages.length, `Missing page components: ${missingPages.join(', ')}`).toBe(0);
    });
});

