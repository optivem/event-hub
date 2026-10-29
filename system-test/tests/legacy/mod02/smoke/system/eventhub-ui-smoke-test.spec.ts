import { test, expect } from '@playwright/test';
import { loginToEventhubUiIfRequired } from '../../../../../src/testkit/driver/adapter/shared/client/playwright/keycloak-ui-login.js';
import { getConfiguration, getEventhubUiBaseUrl, setUpEventhubBrowser, tearDownEventhubBrowser, type EventhubBrowser } from '../../base/BaseRawTest.js';

test('shouldBeAbleToGoToEventhub', async () => {
    let eventhubBrowser: EventhubBrowser | null = null;
    try {
        eventhubBrowser = await setUpEventhubBrowser();
        const response = await eventhubBrowser.page.goto(getEventhubUiBaseUrl());

        expect(response?.status()).toBe(200);

        await loginToEventhubUiIfRequired(eventhubBrowser.page, getConfiguration().keycloakUrl);

        const contentType = response?.headers()['content-type'];
        expect(contentType).toBeDefined();
        expect(contentType).toContain('text/html');

        const pageContent = await eventhubBrowser.page.content();
        expect(pageContent).toContain('<html');
        expect(pageContent).toContain('</html>');
    } finally {
        await tearDownEventhubBrowser(eventhubBrowser);
    }
});
