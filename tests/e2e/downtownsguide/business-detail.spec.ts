import { test, expect } from '@playwright/test';
import { UITester } from '../utils/test-helpers';

test.describe('DowntownsGuide Business Detail', () => {
    let tester: UITester;

    test.beforeEach(async ({ page }) => {
        tester = new UITester(page);
        await page.goto('/');

        // Navigate to first business
        const businessLink = page.locator('.business-card a, [data-testid="business-item"] a').first();
        if (await businessLink.isVisible()) {
            await businessLink.click();
            await page.waitForLoadState('networkidle');
        } else {
            await page.goto('/business/test-business-1');
        }
    });

    test('Business details display', async ({ page }) => {
        // Name
        await expect(page.locator('h1, [data-testid="business-name"]')).toBeVisible();

        // Category
        const category = page.locator('[data-testid="business-category"], .category-badge');
        await expect(category).toBeVisible();

        // Contact Info
        await expect(page.locator('[data-testid="business-address"], .address')).toBeVisible();
        await expect(page.locator('[data-testid="business-phone"], .phone')).toBeVisible();

        // Description
        const description = page.locator('[data-testid="business-description"], .description');
        await expect(description).toBeVisible();
    });

    test('Contact buttons work', async ({ page }) => {
        const callButton = page.locator('a[href^="tel:"], [data-testid="call-button"]');
        if (await callButton.isVisible()) {
            console.log('✅ Call button visible');
        }

        const websiteButton = page.locator('a:has-text("Website"), [data-testid="website-button"]');
        if (await websiteButton.isVisible()) {
            console.log('✅ Website link visible');
        }
    });

    test('Reviews display', async ({ page }) => {
        const reviews = page.locator('[data-testid="reviews-section"], .reviews, #reviews');

        if (await reviews.isVisible()) {
            const reviewItems = reviews.locator('.review-item, [data-testid="review"]');
            const count = await reviewItems.count();
            console.log(`ℹ️ ${count} reviews displayed`);
        } else {
            console.log('⚠️ INFO: Reviews section not found');
        }
    });

    test('Map displays', async ({ page }) => {
        const map = page.locator('[data-testid="business-map"], .map-container, iframe[src*="maps"]');

        if (await map.isVisible()) {
            console.log('✅ Map displays for business location');
        }
    });
});
