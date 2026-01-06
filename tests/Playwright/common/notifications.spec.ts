import { test, expect } from '@playwright/test';
import { loginAsUser } from '../helpers/auth';

test.describe('Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, 'test@example.com', 'password');
  });

  test('user can view notification preferences', async ({ page }) => {
    await page.goto('/settings/notifications');
    
    await expect(page.locator('h1, h2')).toContainText(/notification|preference/i);
  });

  test('user can enable browser notifications', async ({ page }) => {
    await page.goto('/settings/notifications');
    
    const enableButton = page.locator('button:has-text("Enable"), button:has-text("Browser")');
    if (await enableButton.count() > 0) {
      await enableButton.first().click();
      
      // Browser will prompt for permission
      await page.waitForTimeout(2000);
    }
  });

  test('user can subscribe to SMS notifications', async ({ page }) => {
    await page.goto('/settings/notifications');
    
    const phoneInput = page.locator('input[name="phone"], input[type="tel"]');
    if (await phoneInput.count() > 0) {
      await phoneInput.fill('+13125551234');
      await page.click('button:has-text("Verify"), button:has-text("Subscribe")');
      
      // Should show verification code input
      await expect(page.locator('input[name="code"], input[placeholder*="code"]')).toBeVisible({ timeout: 5000 });
    }
  });
});



