import { apiTest as test, expect } from '../fixtures.js';

test('shouldBeAbleToGoToEventhub', async ({ eventhubApiClient }) => {
    const result = await eventhubApiClient.health().checkHealth();
    expect(result.success).toBe(true);
});
