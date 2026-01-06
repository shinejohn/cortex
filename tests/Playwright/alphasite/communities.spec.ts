import { test, expect } from '@playwright/test';
import { loginAsUser } from '../helpers/auth';

test.describe('AlphaSite Communities', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, 'test@example.com', 'password');
  });

  test('user can view communities list', async ({ page }) => {
    await page.goto('/alphasite/communities');
    
    await expect(page.locator('h1, h2')).toContainText(/community/i);
  });

  test('user can view community detail', async ({ page }) => {
    await page.goto('/alphasite/communities');
    
    const communityLink = page.locator('a[href*="/communities/"]').first();
    if (await communityLink.count() > 0) {
      await communityLink.click();
      await expect(page).toHaveURL(/\/communities\/\d+/);
    }
  });

  test('user can create community', async ({ page }) => {
    await page.goto('/alphasite/communities/create');
    
    await page.fill('input[name="name"], textarea[name="name"]', 'Test Community');
    await page.fill('textarea[name="description"]', 'Test description');
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/communities/, { timeout: 10000 });
  });
});



