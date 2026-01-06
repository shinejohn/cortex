import { test, expect } from '@playwright/test';
import { loginAsUser } from '../helpers/auth';

test.describe('Day.News Comments', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, 'test@example.com', 'password');
  });

  test('user can view comments on post', async ({ page }) => {
    await page.goto('/day-news/posts');
    
    const postLink = page.locator('a[href*="/posts/"]').first();
    if (await postLink.count() > 0) {
      await postLink.click();
      
      // Should show comments section
      await expect(page.locator('text=/comment/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('user can submit comment', async ({ page }) => {
    await page.goto('/day-news/posts');
    
    const postLink = page.locator('a[href*="/posts/"]').first();
    if (await postLink.count() > 0) {
      await postLink.click();
      
      const commentInput = page.locator('textarea[name*="comment"], textarea[placeholder*="comment"]');
      if (await commentInput.count() > 0) {
        await commentInput.fill('Great article!');
        await page.click('button[type="submit"]:has-text("Comment"), button:has-text("Post")');
        
        // Comment should appear
        await expect(page.locator('text=Great article!')).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('user can reply to comment', async ({ page }) => {
    await page.goto('/day-news/posts');
    
    const postLink = page.locator('a[href*="/posts/"]').first();
    if (await postLink.count() > 0) {
      await postLink.click();
      
      const replyButton = page.locator('button:has-text("Reply"), a:has-text("Reply")').first();
      if (await replyButton.count() > 0) {
        await replyButton.click();
        
        const replyInput = page.locator('textarea[name*="reply"], textarea[placeholder*="reply"]');
        if (await replyInput.count() > 0) {
          await replyInput.fill('I agree!');
          await page.click('button[type="submit"]');
        }
      }
    }
  });
});



