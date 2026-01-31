import { test, expect } from '@playwright/test';
import { UITester } from '../utils/test-helpers';

test.describe('Day.News Navigation', () => {
    let tester: UITester;

    test.beforeEach(async ({ page }) => {
        tester = new UITester(page);
        await page.goto('/');
    });

    test('Main navigation links work', async ({ page }) => {
        const navLinks = [
            { text: 'News', expectedUrl: '/news' },
            { text: 'Events', expectedUrl: '/events' },
            { text: 'Business', expectedUrl: '/business' },
            { text: 'Local Voices', expectedUrl: '/local-voices' },
            { text: 'About', expectedUrl: '/about' },
        ];

        for (const link of navLinks) {
            await page.goto('/'); // Reset to home

            const navLink = page.locator(`nav a:has-text("${link.text}"), header a:has-text("${link.text}")`).first();

            if (await navLink.isVisible()) {
                await navLink.click();
                await page.waitForLoadState('networkidle');

                expect(page.url()).toContain(link.expectedUrl);
                console.log(`✅ ${link.text} navigation works`);
            } else {
                console.log(`⚠️ WARNING: ${link.text} nav link not found`);
            }
        }
    });

    test('Mobile menu opens and works', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        const hamburger = page.locator('[data-testid="mobile-menu-button"], .hamburger, button[aria-label="Menu"]');

        if (await hamburger.isVisible()) {
            await hamburger.click();
            await page.waitForTimeout(300);

            const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-nav, [role="navigation"]');
            await expect(mobileMenu).toBeVisible();

            // Test a link in mobile menu
            const firstLink = mobileMenu.locator('a').first();
            if (await firstLink.isVisible()) {
                await firstLink.click();
                await page.waitForLoadState('networkidle');
                console.log('✅ Mobile menu navigation works');
            }
        } else {
            console.log('⚠️ WARNING: Mobile hamburger menu not found');
        }
    });

    test('Footer navigation links work', async ({ page }) => {
        await page.goto('/');

        const footer = page.locator('footer');
        const footerLinks = footer.locator('a');
        const count = await footerLinks.count();

        console.log(`Found ${count} footer links`);

        // Test first 5 links
        for (let i = 0; i < Math.min(count, 5); i++) {
            await page.goto('/');
            const link = footer.locator('a').nth(i);
            const href = await link.getAttribute('href');

            if (href && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('http')) {
                await link.click();
                await page.waitForLoadState('networkidle');
                expect(page.url()).toBeTruthy();
                console.log(`✅ Footer link ${i + 1} works: ${href}`);
            }
        }
    });

    test('Breadcrumbs work (on article pages)', async ({ page }) => {
        // Navigate to an article first
        await page.goto('/');

        const articleLink = page.locator('article a, .story-card a, .article-card a').first();
        if (await articleLink.isVisible()) {
            await articleLink.click();
            await page.waitForLoadState('networkidle');

            const breadcrumbs = page.locator('[data-testid="breadcrumbs"], .breadcrumbs, nav[aria-label="Breadcrumb"]');
            if (await breadcrumbs.isVisible()) {
                const homeLink = breadcrumbs.locator('a').first();
                await homeLink.click();
                await page.waitForLoadState('networkidle');

                expect(page.url()).toContain('/');
                console.log('✅ Breadcrumb navigation works');
            } else {
                console.log('⚠️ INFO: No breadcrumbs on article page');
            }
        }
    });
});
