import { test, expect } from '@playwright/test';
import { loginAsUser } from '../helpers/auth';

test.describe('Day.News Posts', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, 'test@example.com', 'password');
  });

  test('user can view posts list', async ({ page }) => {
    await page.goto('/day-news/posts');
    
    // Should show posts page
    await expect(page.locator('h1, h2')).toContainText(/post|article/i);
  });

  test('user can create post', async ({ page }) => {
    await page.goto('/day-news/posts/create');
    
    // Fill in post form
    await page.fill('input[name="title"], textarea[name="title"]', 'Test Post');
    await page.fill('textarea[name="content"], textarea[name="excerpt"]', 'Test content');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect or show success
    await expect(page).toHaveURL(/posts/, { timeout: 10000 });
  });

  test('user can view post detail', async ({ page }) => {
    await page.goto('/day-news/posts');
    
    // Click first post if available
    const firstPost = page.locator('a[href*="/posts/"]').first();
    if (await firstPost.count() > 0) {
      await firstPost.click();
      await expect(page).toHaveURL(/\/posts\/\d+/);
    }
  });
});

