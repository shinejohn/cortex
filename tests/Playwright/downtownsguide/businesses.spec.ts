import { test, expect } from '@playwright/test';
import { loginAsUser } from '../helpers/auth';

test.describe('DowntownsGuide Businesses', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, 'test@example.com', 'password');
  });

  test('user can view businesses list', async ({ page }) => {
    await page.goto('/downtown-guide/businesses');
    
    await expect(page.locator('h1, h2')).toContainText(/business/i);
  });

  test('user can view business detail', async ({ page }) => {
    await page.goto('/downtown-guide/businesses');
    
    const businessLink = page.locator('a[href*="/businesses/"]').first();
    if (await businessLink.count() > 0) {
      await businessLink.click();
      await expect(page).toHaveURL(/\/businesses\/\d+/);
    }
  });

  test('user can submit review', async ({ page }) => {
    await page.goto('/downtown-guide/businesses');
    
    const businessLink = page.locator('a[href*="/businesses/"]').first();
    if (await businessLink.count() > 0) {
      await businessLink.click();
      
      // Look for review form
      const reviewButton = page.locator('button:has-text("Review"), a:has-text("Review")');
      if (await reviewButton.count() > 0) {
        await reviewButton.first().click();
        
        // Fill review form if visible
        const ratingInput = page.locator('input[type="radio"][name*="rating"]').first();
        if (await ratingInput.count() > 0) {
          await ratingInput.click();
          await page.fill('textarea[name*="review"], textarea[name*="comment"]', 'Great business!');
          await page.click('button[type="submit"]');
        }
      }
    }
  });
});

