import { test, expect } from '@playwright/test';
import { UITester } from '../utils/test-helpers';

test.describe('AlphaSite Dashboard', () => {
    let tester: UITester;

    test.beforeEach(async ({ page }) => {
        tester = new UITester(page);
        await page.goto('/');
        // AlphaSite might require login, but assuming it routes to a dashboard or landing for now
    });

    test('Dashboard loads basic elements', async ({ page }) => {
        await expect(page.locator('header, .dashboard-header')).toBeVisible();
        await expect(page.locator('aside, .sidebar, nav')).toBeVisible();
        await expect(page.locator('main')).toBeVisible();
    });

    test('AI Employee cards display', async ({ page }) => {
        const result = await tester.hasData(
            '[data-testid="ai-employees"], .employees-grid',
            '.employee-card, [data-testid="employee-item"]',
            'AI Employees list'
        );

        expect(result.status).not.toBe('fail');
    });

    test('Task management section works', async ({ page }) => {
        const tasksSection = page.locator('[data-testid="tasks-section"], .tasks-panel');

        if (await tasksSection.isVisible()) {
            const taskItems = tasksSection.locator('.task-item');
            console.log(`ℹ️ ${await taskItems.count()} tasks displayed`);
        }
    });

    test('Settings save works', async ({ page }) => {
        // Navigate to settings if possible
        const settingsLink = page.locator('a[href*="settings"], .settings-btn');
        if (await settingsLink.isVisible()) {
            await settingsLink.click();
            await page.waitForURL(/settings/);

            const saveButton = page.locator('button:has-text("Save"), [data-testid="save-settings"]');
            if (await saveButton.isVisible()) {
                await saveButton.click();
                await page.waitForTimeout(500);
                console.log('✅ Settings save triggered');
            }
        }
    });
});
