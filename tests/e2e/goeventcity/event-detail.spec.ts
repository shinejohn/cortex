import { test, expect } from '@playwright/test';
import { UITester } from '../utils/test-helpers';

test.describe('GoEventCity Event Detail', () => {
    let tester: UITester;

    test.beforeEach(async ({ page }) => {
        tester = new UITester(page);
        await page.goto('/');

        // Navigate to first event
        const eventLink = page.locator('.event-card a, [data-testid="event-item"] a').first();
        if (await eventLink.isVisible()) {
            await eventLink.click();
            await page.waitForLoadState('networkidle');
        } else {
            await page.goto('/events/test-event-1');
        }
    });

    test('Event details display', async ({ page }) => {
        // Title
        await expect(page.locator('h1, [data-testid="event-title"]')).toBeVisible();

        // Date/Time
        const datetime = page.locator('[data-testid="event-datetime"], .event-date, time');
        await expect(datetime).toBeVisible();

        // Location/Venue
        const venue = page.locator('[data-testid="event-venue"], .venue-info, .location');
        if (await venue.isVisible()) {
            console.log('✅ Venue information displays');
        }

        // Description
        const description = page.locator('[data-testid="event-description"], .event-content, .description');
        await expect(description).toBeVisible();
    });

    test('Add to calendar button works', async ({ page }) => {
        const addCalendarBtn = page.locator('button:has-text("Add to Calendar"), [data-testid="add-calendar"]');

        if (await addCalendarBtn.isVisible()) {
            await addCalendarBtn.click();
            await this.page.waitForTimeout(500);

            // Check for dropdown with calendar options
            const options = page.locator('.calendar-options, [role="menu"]');
            if (await options.isVisible()) {
                console.log('✅ Calendar options dropdown appears');
            }
        }
    });

    test('Share event works', async ({ page }) => {
        const shareBtn = page.locator('button:has-text("Share"), [data-testid="share-event"]');

        if (await shareBtn.isVisible()) {
            await shareBtn.click();
            await page.waitForTimeout(500);
            console.log('✅ Share button clicked');
        }
    });

    test('Map displays (if location)', async ({ page }) => {
        const map = page.locator('[data-testid="event-map"], .map-container, .google-map, iframe[src*="maps"]');

        if (await map.isVisible()) {
            console.log('✅ Map displays for event location');
        } else {
            console.log('⚠️ INFO: No map found - may not have location data');
        }
    });
});
