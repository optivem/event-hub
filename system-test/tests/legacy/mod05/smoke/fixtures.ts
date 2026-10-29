import { test as base } from '@playwright/test';
import { chromium } from '@playwright/test';
import type { Browser } from '@playwright/test';
import { loadConfiguration } from '../../../../config/configuration-loader.js';
import type { EventhubDriver } from '../../../../src/testkit/driver/port/eventhub-driver.js';
import type { ErpDriver } from '../../../../src/testkit/driver/port/external/erp/erp-driver.js';
import type { TaxDriver } from '../../../../src/testkit/driver/port/external/tax/tax-driver.js';
import { EventhubApiDriver } from '../../../../src/testkit/driver/adapter/api/eventhub-api-driver.js';
import { EventhubUiDriver } from '../../../../src/testkit/driver/adapter/ui/eventhub-ui-driver.js';
import { ErpRealDriver } from '../../../../src/testkit/driver/adapter/external/erp/erp-real-driver.js';
import { TaxRealDriver } from '../../../../src/testkit/driver/adapter/external/tax/tax-real-driver.js';

const config = loadConfiguration();

export const apiTest = base.extend<{ eventhubDriver: EventhubDriver; erpDriver: ErpDriver; taxDriver: TaxDriver }>({
    eventhubDriver: async ({}, use) => {
        const driver = new EventhubApiDriver(config.eventhub.backendApiUrl, config.keycloakUrl);
        await use(driver);
        await driver.close();
    },
    erpDriver: async ({}, use) => {
        const driver = new ErpRealDriver(config.externalSystems.erp.url);
        await use(driver);
        await driver.close();
    },
    taxDriver: async ({}, use) => {
        const driver = new TaxRealDriver(config.externalSystems.tax.url);
        await use(driver);
        await driver.close();
    },
});

export const uiTest = base.extend<{ eventhubDriver: EventhubDriver; erpDriver: ErpDriver; taxDriver: TaxDriver; _eventhubBrowser: Browser }>({
    _eventhubBrowser: async ({}, use) => {
        const browser = await chromium.launch();
        await use(browser);
        await browser.close();
    },
    eventhubDriver: async ({ _eventhubBrowser }, use) => {
        const driver = new EventhubUiDriver(config.eventhub.frontendUrl, _eventhubBrowser, config.keycloakUrl);
        await use(driver);
        await driver.close();
    },
    erpDriver: async ({}, use) => {
        const driver = new ErpRealDriver(config.externalSystems.erp.url);
        await use(driver);
        await driver.close();
    },
    taxDriver: async ({}, use) => {
        const driver = new TaxRealDriver(config.externalSystems.tax.url);
        await use(driver);
        await driver.close();
    },
});

export { expect } from '@playwright/test';
