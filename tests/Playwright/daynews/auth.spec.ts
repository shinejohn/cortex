import { test, expect } from '@playwright/test';
import { loginAsUser, registerUser } from '../helpers/auth';

test.describe('Day.News Authentication', () => {
  test('user can register', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="password_confirmation"]', 'password123');
    
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard or home
    await expect(page).toHaveURL(/dashboard|home/, { timeout: 10000 });
  });

  test('user can login', async ({ page }) => {
    await loginAsUser(page, 'test@example.com', 'password');
    
    // Should be logged in
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 5000 });
  });

  test('user can logout', async ({ page }) => {
    await loginAsUser(page, 'test@example.com', 'password');
    
    // Find and click logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Logout');
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });
});

