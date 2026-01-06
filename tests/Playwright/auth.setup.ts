/**
 * Playwright Authentication Setup
 * 
 * This script logs in users and saves their authentication state
 * Run: npx playwright test tests/Playwright/auth.setup.ts
 */

import { test as setup } from '@playwright/test';
import { loginAndSaveState, testUsers } from './auth-helper';

// Setup authentication for different users
// Extended timeouts are configured in playwright.config.ts (5 minutes global)
setup('authenticate as admin', async ({ page, context }) => {
    await loginAndSaveState(page, context, testUsers.admin.email, testUsers.admin.password, 'admin-auth.json');
});

setup('authenticate as regular user', async ({ page, context }) => {
    await loginAndSaveState(page, context, testUsers.user.email, testUsers.user.password, 'user-auth.json');
});

setup('authenticate as editor', async ({ page, context }) => {
    await loginAndSaveState(page, context, testUsers.editor.email, testUsers.editor.password, 'editor-auth.json');
});

setup('authenticate as viewer', async ({ page, context }) => {
    await loginAndSaveState(page, context, testUsers.viewer.email, testUsers.viewer.password, 'viewer-auth.json');
});

