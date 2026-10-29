import { test as base } from '@playwright/test';
import { chromium } from '@playwright/test';
import type { Browser, BrowserContext, Page } from '@playwright/test';
import { loadConfiguration } from '../../../../config/configuration-loader.js';
import { EventhubApiClient } from '../../../../src/testkit/driver/adapter/api/client/EventhubApiClient.js';
import { ErpRealClient } from '../../../../src/testkit/driver/adapter/external/erp/client/ErpRealClient.js';
import { TaxRealClient } from '../../../../src/testkit/driver/adapter/external/tax/client/TaxRealClient.js';

const config = loadConfiguration();

export const apiTest = base.extend<{ eventhubApiClient: EventhubApiClient; erpClient: ErpRealClient; taxClient: TaxRealClient }>({
    eventhubApiClient: async ({}, use) => {
        await use(new EventhubApiClient(config.eventhub.backendApiUrl, config.keycloakUrl));
    },
    erpClient: async ({}, use) => {
        await use(new ErpRealClient(config.externalSystems.erp.url));
    },
    taxClient: async ({}, use) => {
        await use(new TaxRealClient(config.externalSystems.tax.url));
    },
});

export const uiTest = base.extend<{ eventhubPage: Page; eventhubUiUrl: string; _eventhubBrowser: Browser; _eventhubContext: BrowserContext }>({
    eventhubUiUrl: async ({}, use) => {
        await use(config.eventhub.frontendUrl);
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
