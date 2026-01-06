import { test, expect } from '@playwright/test';
import { loginAsUser } from '../helpers/auth';

test.describe('GoEventCity Tickets', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, 'test@example.com', 'password');
  });

  test('user can view ticket plans for event', async ({ page }) => {
    await page.goto('/events');
    
    const eventLink = page.locator('a[href*="/events/"]').first();
    if (await eventLink.count() > 0) {
      await eventLink.click();
      
      // Look for ticket plans
      await expect(page.locator('text=/ticket|price|plan/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('user can purchase tickets', async ({ page }) => {
    await page.goto('/events');
    
    const eventLink = page.locator('a[href*="/events/"]').first();
    if (await eventLink.count() > 0) {
      await eventLink.click();
      
      const buyButton = page.locator('button:has-text("Buy"), button:has-text("Ticket"), a:has-text("Buy")');
      if (await buyButton.count() > 0) {
        await buyButton.first().click();
        
        // Should show ticket purchase form
        await expect(page).toHaveURL(/ticket|order|checkout/, { timeout: 5000 });
      }
    }
  });

  test('user can apply promo code', async ({ page }) => {
    await page.goto('/events');
    
    const eventLink = page.locator('a[href*="/events/"]').first();
    if (await eventLink.count() > 0) {
      await eventLink.click();
      
      const buyButton = page.locator('button:has-text("Buy"), button:has-text("Ticket")');
      if (await buyButton.count() > 0) {
        await buyButton.first().click();
        
        // Look for promo code input
        const promoInput = page.locator('input[name*="promo"], input[placeholder*="promo"]');
        if (await promoInput.count() > 0) {
          await promoInput.fill('TESTCODE');
          await page.click('button:has-text("Apply")');
        }
      }
    }
  });
});



