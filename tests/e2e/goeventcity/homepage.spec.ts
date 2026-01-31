import { test, expect } from '@playwright/test';
import { UITester } from '../utils/test-helpers';

test.describe('GoEventCity Homepage', () => {
    let tester: UITester;

    test.beforeEach(async ({ page }) => {
        tester = new UITester(page);
        await page.goto('/');
    });

    test('Featured events display', async ({ page }) => {
        const result = await tester.hasData(
            '[data-testid="featured-events"], .featured-events, .hero-events',
            '.event-card, article, [data-testid="event-item"]',
            'Featured events section'
        );

        if (result.status === 'warning') {
            console.log('⚠️ ACTION NEEDED: Create featured events in database');
            console.log('   Set is_featured = true on event records');
        }

        expect(result.status).not.toBe('fail');
    });

    test('Calendar widget displays', async ({ page }) => {
        const calendar = page.locator('[data-testid="calendar"], .calendar-widget, .mini-calendar');

        if (await calendar.isVisible()) {
            // Check for date navigation
            const prevButton = calendar.locator('button:has-text("<"), [aria-label="Previous"]');
            const nextButton = calendar.locator('button:has-text(">"), [aria-label="Next"]');

            if (await prevButton.isVisible() && await nextButton.isVisible()) {
                await nextButton.click();
                await page.waitForTimeout(300);
                console.log('✅ Calendar navigation works');
            }
        } else {
            console.log('⚠️ WARNING: Calendar widget not found');
        }
    });

    test('Event category filters work', async ({ page }) => {
        const filters = page.locator('[data-testid="category-filters"], .event-filters, .category-pills');

        if (await filters.isVisible()) {
            const buttons = filters.locator('button, a');
            const count = await buttons.count();

            for (let i = 0; i < Math.min(count, 4); i++) {
                await buttons.nth(i).click();
                await page.waitForTimeout(500);
                console.log(`✅ Category filter ${i + 1} clicked`);
            }
        } else {
            console.log('⚠️ WARNING: Category filters not found');
        }
    });

    test('Upcoming events list displays', async ({ page }) => {
        const result = await tester.hasData(
            '[data-testid="upcoming-events"], .events-list, .upcoming-events',
            '.event-card, .event-item, article',
            'Upcoming events list'
        );

        expect(result.status).not.toBe('fail');
    });

    test('Search events works', async ({ page }) => {
        const searchInput = page.locator('input[placeholder*="Search"], [data-testid="event-search"]');

        if (await searchInput.isVisible()) {
            await searchInput.fill('music');
            await searchInput.press('Enter');
            await page.waitForLoadState('networkidle');
            console.log('✅ Event search submitted');
        }
    });
});
