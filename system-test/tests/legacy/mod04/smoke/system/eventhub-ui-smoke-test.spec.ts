import { uiTest as test, expect } from '../fixtures.js';

test('shouldBeAbleToGoToEventhub', async ({ eventhubPage, eventhubUiUrl }) => {
    const response = await eventhubPage.goto(eventhubUiUrl);
    expect(response?.status()).toBe(200);
});
