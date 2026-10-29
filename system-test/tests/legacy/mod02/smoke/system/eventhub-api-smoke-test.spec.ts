import { test, expect } from '@playwright/test';
import { getEventhubApiBaseUrl } from '../../base/BaseRawTest.js';

test('shouldBeAbleToGoToEventhub', async () => {
    const response = await fetch(`${getEventhubApiBaseUrl()}/health`);
    expect(response.status).toBe(200);
});
