import { expect, type TestType } from '@playwright/test';
import type { EventhubDriver } from '../../../../../src/testkit/driver/port/eventhub-driver.js';

// Playwright's TestType is invariant in its fixture shape, so the helper is generic
// over the concrete fixtures and only requires `eventhubDriver` to be among them.
export function runEventhubBaseSmokeTest<TTestArgs extends { eventhubDriver: EventhubDriver }, TWorkerArgs extends object>(
  test: TestType<TTestArgs, TWorkerArgs>,
): void {
  test('shouldBeAbleToGoToEventhub', async ({ eventhubDriver }) => {
    const result = await eventhubDriver.goToEventhub({});
    expect(result.success).toBe(true);
  });
}
