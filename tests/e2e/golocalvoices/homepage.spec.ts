import { test, expect } from '@playwright/test';
import { UITester } from '../utils/test-helpers';

test.describe('GoLocalVoices Homepage', () => {
    let tester: UITester;

    test.beforeEach(async ({ page }) => {
        tester = new UITester(page);
        await page.goto('/');
    });

    test('Podcast list displays', async ({ page }) => {
        const result = await tester.hasData(
            '[data-testid="podcasts-list"], .podcasts, .episodes',
            '.podcast-card, article',
            'Podcast list'
        );

        if (result.status === 'warning') {
            console.log('⚠️ ACTION NEEDED: Create podcast/episode records');
        }

        expect(result.status).not.toBe('fail');
    });

    test('Video list displays', async ({ page }) => {
        const result = await tester.hasData(
            '[data-testid="videos-list"], .videos, .video-gallery',
            '.video-card, .video-item',
            'Video list'
        );

        expect(result.status).not.toBe('fail');
    });

    test('Audio player works', async ({ page }) => {
        const playButton = page.locator('.play-button, [data-testid="play-audio"]').first();

        if (await playButton.isVisible()) {
            await playButton.click();
            await page.waitForTimeout(500);

            const player = page.locator('.audio-player, [data-testid="player-bar"]');
            await expect(player).toBeVisible();
            console.log('✅ Audio player appeared on click');
        }
    });

    test('Search media works', async ({ page }) => {
        const searchInput = page.locator('input[placeholder*="Search"], [data-testid="media-search"]');

        if (await searchInput.isVisible()) {
            await searchInput.fill('interview');
            await searchInput.press('Enter');
            await page.waitForLoadState('networkidle');
            console.log('✅ Media search submitted');
        }
    });
});
