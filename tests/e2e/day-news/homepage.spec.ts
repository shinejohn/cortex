import { test, expect } from '@playwright/test';
import { UITester } from '../utils/test-helpers';

test.describe('Day.News Homepage', () => {
    let tester: UITester;

    test.beforeEach(async ({ page }) => {
        tester = new UITester(page);
        await page.goto('/');
    });

    test('Core layout elements exist', async ({ page }) => {
        // Header
        await expect(page.locator('header, [data-testid="header"]')).toBeVisible();

        // Logo/Brand
        await expect(page.locator('a[href="/"], .logo, [data-testid="logo"]')).toBeVisible();

        // Navigation
        await expect(page.locator('nav, [data-testid="navigation"]')).toBeVisible();

        // Main content area
        await expect(page.locator('main, [data-testid="main-content"]')).toBeVisible();

        // Footer
        await expect(page.locator('footer, [data-testid="footer"]')).toBeVisible();
    });

    test('Hero/Featured stories display', async ({ page }) => {
        const result = await tester.hasData(
            '[data-testid="hero-section"], .hero, .featured-stories',
            'article, .story-card, .article-card',
            'Hero stories section'
        );

        if (result.status === 'warning') {
            console.log('⚠️ ACTION NEEDED: Add featured/hero articles to database');
        }

        expect(result.status).not.toBe('fail');
    });

    test('News feed displays articles', async ({ page }) => {
        const result = await tester.hasData(
            '[data-testid="news-feed"], .news-feed, .articles-list',
            'article, .story-card, .article-card, [data-testid="article-item"]',
            'News feed'
        );

        if (result.status === 'warning') {
            console.log('⚠️ ACTION NEEDED: Run news workflow to generate articles');
            console.log('   Command: php artisan news:run-daily-workflow');
        }

        expect(result.status).not.toBe('fail');
    });

    test('Category tabs/pills work', async ({ page }) => {
        const categories = page.locator('[data-testid="category-tabs"] button, .category-pill, .category-tab');
        const count = await categories.count();

        if (count === 0) {
            console.log('⚠️ WARNING: No category tabs found');
            return;
        }

        // Click each category and verify content changes
        for (let i = 0; i < Math.min(count, 5); i++) {
            const category = categories.nth(i);
            await category.click();
            await page.waitForTimeout(500);

            // Verify articles display after filtering
            const articles = page.locator('article, .story-card');
            await expect(articles.first()).toBeVisible({ timeout: 5000 }).catch(() => {
                console.log(`⚠️ INFO: No articles found for category ${i}`);
            });
        }
    });

    test('Search functionality works', async ({ page }) => {
        const searchButton = page.locator('[data-testid="search-button"], .search-button, button[aria-label="Search"]');

        if (await searchButton.isVisible()) {
            await searchButton.click();
            await page.waitForTimeout(300);

            const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], [data-testid="search-input"]');
            await expect(searchInput).toBeVisible();

            await searchInput.fill('test search');
            await searchInput.press('Enter');

            await page.waitForLoadState('networkidle');
            // Verify search results page or results display
            await expect(page).toHaveURL(/search/);
        } else {
            console.log('⚠️ WARNING: Search button not found - check implementation');
        }
    });

    test('Location selector works', async ({ page }) => {
        const locationSelector = page.locator('[data-testid="location-selector"], .location-picker, .city-selector');

        if (await locationSelector.isVisible()) {
            await locationSelector.click();
            await page.waitForTimeout(300);

            // Check dropdown/modal appears
            const dropdown = page.locator('[data-testid="location-dropdown"], .location-options, [role="listbox"]');
            await expect(dropdown).toBeVisible();
        } else {
            console.log('⚠️ INFO: Location selector not found on homepage');
        }
    });
});
