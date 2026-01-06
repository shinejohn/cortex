import { test, expect } from '@playwright/test';
import { loginAsUser } from '../helpers/auth';

test.describe('DowntownsGuide Coupons', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, 'test@example.com', 'password');
  });

  test('user can view coupons list', async ({ page }) => {
    await page.goto('/downtown-guide/coupons');
    
    await expect(page.locator('h1, h2')).toContainText(/coupon|deal/i);
  });

  test('user can view coupon detail', async ({ page }) => {
    await page.goto('/downtown-guide/coupons');
    
    const couponLink = page.locator('a[href*="/coupons/"]').first();
    if (await couponLink.count() > 0) {
      await couponLink.click();
      await expect(page).toHaveURL(/\/coupons\/\d+/);
    }
  });

  test('user can claim coupon', async ({ page }) => {
    await page.goto('/downtown-guide/coupons');
    
    const couponLink = page.locator('a[href*="/coupons/"]').first();
    if (await couponLink.count() > 0) {
      await couponLink.click();
      
      const claimButton = page.locator('button:has-text("Claim"), button:has-text("Get")');
      if (await claimButton.count() > 0) {
        await claimButton.first().click();
        
        // Should show success or coupon code
        await expect(page.locator('text=/claimed|code|success/i')).toBeVisible({ timeout: 5000 });
      }
    }
  });
});



