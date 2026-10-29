import { test, expect, forChannels, ChannelType } from '../fixtures.js';

forChannels(ChannelType.UI, ChannelType.API)(() => {
    test('shouldBeAbleToGoToEventhub', async ({ eventhubDriver }) => {
        const result = await eventhubDriver.goToEventhub({});
        expect(result.success).toBe(true);
    });
});
