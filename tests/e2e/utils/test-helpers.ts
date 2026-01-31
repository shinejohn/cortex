import { Page, expect } from '@playwright/test';

export interface TestResult {
    element: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
    screenshot?: string;
}

export class UITester {
    constructor(private page: Page) { }

    /**
     * Test if element exists and is visible
     */
    async elementExists(selector: string, description: string): Promise<TestResult> {
        try {
            const element = this.page.locator(selector).first();
            await expect(element).toBeVisible({ timeout: 5000 });
            return { element: selector, status: 'pass', message: `${description} is visible` };
        } catch (e: any) {
            return { element: selector, status: 'fail', message: `${description} not found or not visible` };
        }
    }

    /**
     * Test navigation link works
     */
    async navigationWorks(selector: string, expectedUrl: string, description: string): Promise<TestResult> {
        try {
            const link = this.page.locator(selector).first();
            await link.click();
            await this.page.waitForLoadState('networkidle');

            const currentUrl = this.page.url();
            if (currentUrl.includes(expectedUrl)) {
                return { element: selector, status: 'pass', message: `${description} navigates correctly` };
            }
            return { element: selector, status: 'fail', message: `${description} navigated to ${currentUrl}, expected ${expectedUrl}` };
        } catch (e: any) {
            return { element: selector, status: 'fail', message: `${description} navigation failed: ${e}` };
        }
    }

    /**
     * Test if data is displaying (not empty state)
     */
    async hasData(containerSelector: string, itemSelector: string, description: string): Promise<TestResult> {
        try {
            const container = this.page.locator(containerSelector);
            await expect(container).toBeVisible({ timeout: 5000 });

            const items = container.locator(itemSelector);
            const count = await items.count();

            if (count > 0) {
                return { element: containerSelector, status: 'pass', message: `${description} shows ${count} items` };
            }
            return { element: containerSelector, status: 'warning', message: `${description} is empty - needs test data` };
        } catch (e: any) {
            return { element: containerSelector, status: 'fail', message: `${description} container not found` };
        }
    }

    /**
     * Test button click triggers action
     */
    async buttonWorks(selector: string, expectedBehavior: 'modal' | 'submit' | 'navigation', description: string): Promise<TestResult> {
        try {
            const button = this.page.locator(selector).first();
            await expect(button).toBeVisible();
            await expect(button).toBeEnabled();

            await button.click();
            await this.page.waitForTimeout(500);

            switch (expectedBehavior) {
                case 'modal':
                    const modal = this.page.locator('[role="dialog"], .modal, [data-modal]');
                    if (await modal.isVisible()) {
                        return { element: selector, status: 'pass', message: `${description} opens modal` };
                    }
                    return { element: selector, status: 'fail', message: `${description} did not open modal` };

                case 'submit':
                    // Check for loading state or success message
                    const loading = this.page.locator('.loading, [data-loading], .spinner');
                    const success = this.page.locator('.success, [data-success], .toast-success');
                    if (await loading.isVisible() || await success.isVisible()) {
                        return { element: selector, status: 'pass', message: `${description} triggered submit` };
                    }
                    return { element: selector, status: 'warning', message: `${description} clicked but no visible feedback` };

                case 'navigation':
                    await this.page.waitForLoadState('networkidle');
                    return { element: selector, status: 'pass', message: `${description} navigated` };
            }

            return { element: selector, status: 'warning', message: `${description} clicked but behavior unclear` };
        } catch (e: any) {
            return { element: selector, status: 'fail', message: `${description} failed: ${e}` };
        }
    }

    /**
     * Test form CRUD operation
     */
    async testCRUD(config: {
        createButton: string;
        formFields: { selector: string; value: string }[];
        submitButton: string;
        successIndicator: string;
        listSelector: string;
        editButton: string;
        deleteButton: string;
        description: string;
    }): Promise<TestResult[]> {
        const results: TestResult[] = [];

        // CREATE
        try {
            await this.page.locator(config.createButton).click();
            await this.page.waitForTimeout(500);

            for (const field of config.formFields) {
                await this.page.locator(field.selector).fill(field.value);
            }

            await this.page.locator(config.submitButton).click();
            await this.page.waitForTimeout(1000);

            const success = await this.page.locator(config.successIndicator).isVisible();
            results.push({
                element: 'CREATE',
                status: success ? 'pass' : 'fail',
                message: `${config.description} CREATE ${success ? 'succeeded' : 'failed'}`
            });
        } catch (e: any) {
            results.push({ element: 'CREATE', status: 'fail', message: `${config.description} CREATE error: ${e}` });
        }

        // READ - Check list displays
        try {
            const items = await this.page.locator(config.listSelector).count();
            results.push({
                element: 'READ',
                status: items > 0 ? 'pass' : 'warning',
                message: `${config.description} READ shows ${items} items`
            });
        } catch (e: any) {
            results.push({ element: 'READ', status: 'fail', message: `${config.description} READ error: ${e}` });
        }

        // UPDATE
        try {
            await this.page.locator(config.editButton).first().click();
            await this.page.waitForTimeout(500);

            if (config.formFields.length > 0) {
                await this.page.locator(config.formFields[0].selector).fill(config.formFields[0].value + ' Updated');
            }

            await this.page.locator(config.submitButton).click();
            await this.page.waitForTimeout(1000);

            results.push({ element: 'UPDATE', status: 'pass', message: `${config.description} UPDATE completed` });
        } catch (e: any) {
            results.push({ element: 'UPDATE', status: 'fail', message: `${config.description} UPDATE error: ${e}` });
        }

        // DELETE
        try {
            await this.page.locator(config.deleteButton).first().click();
            await this.page.waitForTimeout(500);

            // Confirm deletion if dialog appears
            const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")');
            if (await confirmButton.isVisible()) {
                await confirmButton.click();
            }

            await this.page.waitForTimeout(1000);
            results.push({ element: 'DELETE', status: 'pass', message: `${config.description} DELETE completed` });
        } catch (e: any) {
            results.push({ element: 'DELETE', status: 'fail', message: `${config.description} DELETE error: ${e}` });
        }

        return results;
    }
}
