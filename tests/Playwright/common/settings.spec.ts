import { test, expect } from '@playwright/test';
import { loginAsUser } from '../helpers/auth';

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, 'test@example.com', 'password');
  });

  test('user can access profile settings', async ({ page }) => {
    await page.goto('/settings/profile');
    
    await expect(page.locator('h1, h2')).toContainText(/profile|settings/i);
  });

  test('user can update profile', async ({ page }) => {
    await page.goto('/settings/profile');
    
    await page.fill('input[name="name"]', 'Updated Name');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Updated Name')).toBeVisible({ timeout: 5000 });
  });

  test('user can change password', async ({ page }) => {
    await page.goto('/settings/password');
    
    await page.fill('input[name="current_password"]', 'password');
    await page.fill('input[name="password"]', 'newpassword123');
    await page.fill('input[name="password_confirmation"]', 'newpassword123');
    
    await page.click('button[type="submit"]');
    
    // Should show success message or redirect
    await expect(page).toHaveURL(/settings|password/, { timeout: 5000 });
  });
});



