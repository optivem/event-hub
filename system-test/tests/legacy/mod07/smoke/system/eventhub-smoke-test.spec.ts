import { test, forChannels, ChannelType } from '../fixtures.js';

forChannels(ChannelType.UI, ChannelType.API)(() => {
    test('shouldBeAbleToGoToEventhub', async ({ app }) => {
        (await app.eventhub().goToEventhub().execute()).shouldSucceed();
    });
});
