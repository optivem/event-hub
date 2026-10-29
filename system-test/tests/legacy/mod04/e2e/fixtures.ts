import { test as base } from '@playwright/test';
import { chromium } from '@playwright/test';
import type { Browser } from '@playwright/test';
import { loadConfiguration } from '../../../../config/configuration-loader.js';
import { EventhubApiClient } from '../../../../src/testkit/driver/adapter/api/client/EventhubApiClient.js';
import { EventhubUiClient } from '../../../../src/testkit/driver/adapter/ui/client/EventhubUiClient.js';
import { ErpRealClient } from '../../../../src/testkit/driver/adapter/external/erp/client/ErpRealClient.js';

const config = loadConfiguration();

// Client fixtures for API tests
export const apiTest = base.extend<{ eventhubApiClient: EventhubApiClient; erpClient: ErpRealClient }>({
    eventhubApiClient: async ({}, use) => {
        await use(new EventhubApiClient(config.eventhub.backendApiUrl, config.keycloakUrl));
    },
    erpClient: async ({}, use) => {
        await use(new ErpRealClient(config.externalSystems.erp.url));
    },
});

// Client fixtures for UI tests
export const uiTest = base.extend<{ eventhubUiClient: EventhubUiClient; _eventhubBrowser: Browser; erpClient: ErpRealClient }>({
    _eventhubBrowser: async ({}, use) => {
        const browser = await chromium.launch();
        await use(browser);
        await browser.close();
    },
    eventhubUiClient: async ({ _eventhubBrowser }, use) => {
        const client = new EventhubUiClient(config.eventhub.frontendUrl, _eventhubBrowser, config.keycloakUrl);
        await use(client);
        await client.close();
    },
    erpClient: async ({}, use) => {
        await use(new ErpRealClient(config.externalSystems.erp.url));
    },
});

export { expect } from '@playwright/test';
export { config };
