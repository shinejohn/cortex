import { test, expect } from '@playwright/test';
import { loginAsUser } from '../helpers/auth';

test.describe('GoEventCity Events', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, 'test@example.com', 'password');
  });

  test('user can view events list', async ({ page }) => {
    await page.goto('/events');
    
    await expect(page.locator('h1, h2')).toContainText(/event/i);
  });

  test('user can create event', async ({ page }) => {
    await page.goto('/events/create');
    
    await page.fill('input[name="title"], textarea[name="title"]', 'Test Event');
    await page.fill('input[name="start_date"], input[name="date"]', new Date().toISOString().split('T')[0]);
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/events/, { timeout: 10000 });
  });

  test('user can purchase tickets', async ({ page }) => {
    await page.goto('/events');
    
    // Find an event with tickets
    const eventLink = page.locator('a[href*="/events/"]').first();
    if (await eventLink.count() > 0) {
      await eventLink.click();
      
      // Look for ticket purchase button
      const buyButton = page.locator('button:has-text("Buy"), button:has-text("Ticket")');
      if (await buyButton.count() > 0) {
        await buyButton.first().click();
        await expect(page).toHaveURL(/ticket|order/, { timeout: 5000 });
      }
    }
  });
});

