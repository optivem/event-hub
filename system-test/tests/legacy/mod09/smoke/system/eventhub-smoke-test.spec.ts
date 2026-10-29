import { test, forChannels, ChannelType } from '../../base/BaseScenarioDslTest.js';

forChannels(ChannelType.UI, ChannelType.API)(() => {
    test('shouldBeAbleToGoToEventhub', async ({ scenario }) => {
        await scenario.assume().eventhub().shouldBeRunning();
    });
});
