/**
 * Playwright Authentication Helper
 * 
 * Utility functions for managing authentication in Playwright tests
 */

import { Page, BrowserContext } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authDir = path.join(__dirname, '../.auth');

/**
 * Login once and save authentication state
 */
export async function loginAndSaveState(
    page: Page,
    context: BrowserContext,
    email: string,
    password: string,
    authFileName: string = 'auth.json'
): Promise<void> {
    const authFile = path.join(authDir, authFileName);
    
    // Navigate to login page (extended timeout)
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 60000 });
    
    // Fill in credentials
    await page.fill('#email', email, { timeout: 30000 });
    await page.fill('input[type="password"]', password, { timeout: 30000 });
    
    // Submit form
    await page.click('button[type="submit"]', { timeout: 30000 });
    
    // Wait for successful login (extended timeout for testing)
    await page.waitForURL(/\/(dashboard|home|settings)/, { timeout: 60000 });
    
    // Save authentication state
    await context.storageState({ path: authFile });
    
    console.log(`✅ Authentication state saved to: ${authFile}`);
}

/**
 * Get authentication state file path
 */
export function getAuthStatePath(authFileName: string = 'auth.json'): string {
    return path.join(authDir, authFileName);
}

/**
 * Check if authentication state exists
 */
export function authStateExists(authFileName: string = 'auth.json'): boolean {
    const authFile = getAuthStatePath(authFileName);
    return fs.existsSync(authFile);
}

/**
 * Test user credentials
 */
export const testUsers = {
    admin: {
        email: 'admin@test.com',
        password: 'password',
    },
    user: {
        email: 'user@test.com',
        password: 'password',
    },
    editor: {
        email: 'editor@test.com',
        password: 'password',
    },
    viewer: {
        email: 'viewer@test.com',
        password: 'password',
    },
} as const;

