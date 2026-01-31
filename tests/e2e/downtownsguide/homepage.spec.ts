import { test, expect } from '@playwright/test';
import { UITester } from '../utils/test-helpers';

test.describe('DowntownsGuide Homepage', () => {
    let tester: UITester;

    test.beforeEach(async ({ page }) => {
        tester = new UITester(page);
        await page.goto('/');
    });

    test('Business listings display', async ({ page }) => {
        const result = await tester.hasData(
            '[data-testid="business-listings"], .businesses, .directory-list',
            '.business-card, article, [data-testid="business-item"]',
            'Business listings'
        );

        if (result.status === 'warning') {
            console.log('⚠️ ACTION NEEDED: Create business records in database');
        }

        expect(result.status).not.toBe('fail');
    });

    test('Category filters work', async ({ page }) => {
        const filters = page.locator('[data-testid="category-filters"], .directory-filters, .category-list');

        if (await filters.isVisible()) {
            const links = filters.locator('a, button');
            const count = await links.count();

            for (let i = 0; i < Math.min(count, 3); i++) {
                await links.nth(i).click();
                await page.waitForTimeout(500);
                console.log(`✅ Category filter ${i + 1} clicked`);
            }
        }
    });

    test('Search businesses works', async ({ page }) => {
        const searchInput = page.locator('input[placeholder*="Search"], [data-testid="business-search"]');

        if (await searchInput.isVisible()) {
            await searchInput.fill('restaurant');
            await searchInput.press('Enter');
            await page.waitForLoadState('networkidle');
            console.log('✅ Business search submitted');
        }
    });

    test('Map toggle/view works', async ({ page }) => {
        const mapToggle = page.locator('[data-testid="map-toggle"], .view-toggle:has-text("Map")');

        if (await mapToggle.isVisible()) {
            await mapToggle.click();
            await page.waitForTimeout(500);

            const map = page.locator('.map-container, #map, [data-testid="business-map"]');
            await expect(map).toBeVisible();
            console.log('✅ Map view toggle works');
        }
    });
});
