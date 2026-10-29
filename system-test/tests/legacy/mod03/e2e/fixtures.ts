import { test as base } from '@playwright/test';
import { chromium } from '@playwright/test';
import type { Browser, BrowserContext, Page } from '@playwright/test';
import { loadConfiguration, type TestConfig } from '../../../../config/configuration-loader.js';

const config = loadConfiguration();

// Raw HTTP fixtures for API tests
export const apiTest = base.extend<{ config: TestConfig }>({
    config: async ({}, use) => {
        await use(config);
    },
});

// Raw Playwright fixtures for UI tests
export const uiTest = base.extend<{ config: TestConfig; eventhubPage: Page; _eventhubBrowser: Browser; _eventhubContext: BrowserContext }>({
    config: async ({}, use) => {
        await use(config);
    },
    _eventhubBrowser: async ({}, use) => {
        const browser = await chromium.launch();
        await use(browser);
        await browser.close();
    },
    _eventhubContext: async ({ _eventhubBrowser }, use) => {
        const context = await _eventhubBrowser.newContext({ viewport: { width: 1920, height: 1080 } });
        await use(context);
        await context.close();
    },
    eventhubPage: async ({ _eventhubContext }, use) => {
        const page = await _eventhubContext.newPage();
        await use(page);
        await page.close();
    },
});

export { expect } from '@playwright/test';
export { config };
