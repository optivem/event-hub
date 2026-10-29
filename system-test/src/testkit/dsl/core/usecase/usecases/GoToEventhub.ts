import type { EventhubDriver } from '../../../../driver/port/eventhub-driver.js';
import type { GoToEventhubResponse } from '../../../../driver/port/dtos/GoToEventhubResponse.js';
import { UseCaseResult } from '../../shared/use-case-result.js';
import { VoidVerification } from '../../shared/void-verification.js';
import type { UseCaseContext } from '../../shared/use-case-context.js';
import { BaseEventhubUseCase } from './base/BaseEventhubUseCase.js';

export class GoToEventhub extends BaseEventhubUseCase<GoToEventhubResponse, VoidVerification> {
  constructor(driver: EventhubDriver, context: UseCaseContext) {
    super(driver, context);
  }

  async execute(): Promise<UseCaseResult<GoToEventhubResponse, VoidVerification>> {
    const result = await this.driver.goToEventhub({});

    return new UseCaseResult(
      result,
      this.context,
      (_, ctx) => new VoidVerification(undefined, ctx),
    );
  }
}
