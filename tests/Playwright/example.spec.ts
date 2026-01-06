/**
 * Example Playwright Test using saved authentication state
 */

import { test, expect } from '@playwright/test';
import { getAuthStatePath, testUsers } from './auth-helper';

// Use saved authentication state for admin
const adminAuthFile = getAuthStatePath('admin-auth.json');

test.describe('Authenticated Tests - Admin', () => {
    // Use saved authentication state
    test.use({ storageState: adminAuthFile });

    test('should access dashboard when logged in', async ({ page }) => {
        await page.goto('/dashboard');
        
        // Verify we're authenticated (not redirected to login)
        await expect(page).not.toHaveURL(/\/login/);
        await expect(page.locator('body')).toBeVisible();
    });

    test('should access protected route', async ({ page }) => {
        await page.goto('/settings');
        
        // Verify we can access settings
        await expect(page).not.toHaveURL(/\/login/);
    });
});

test.describe('Authenticated Tests - Regular User', () => {
    const userAuthFile = getAuthStatePath('user-auth.json');
    
    test.use({ storageState: userAuthFile });

    test('should access dashboard as regular user', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page).not.toHaveURL(/\/login/);
    });
});

