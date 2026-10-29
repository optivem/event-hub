import type { EventhubDriver } from '../../../../driver/port/eventhub-driver.js';
import type { BrowseCouponsResponse } from '../../../../driver/port/dtos/BrowseCouponsResponse.js';
import { UseCaseResult } from '../../shared/use-case-result.js';
import type { UseCaseContext } from '../../shared/use-case-context.js';
import { BaseEventhubUseCase } from './base/BaseEventhubUseCase.js';
import { BrowseCouponsVerification } from './BrowseCouponsVerification.js';

export class BrowseCoupons extends BaseEventhubUseCase<BrowseCouponsResponse, BrowseCouponsVerification> {
  constructor(driver: EventhubDriver, context: UseCaseContext) {
    super(driver, context);
  }

  async execute(): Promise<UseCaseResult<BrowseCouponsResponse, BrowseCouponsVerification>> {
    const result = await this.driver.browseCoupons({});

    return new UseCaseResult(
      result,
      this.context,
      (response, ctx) => new BrowseCouponsVerification(response, ctx),
    );
  }
}
