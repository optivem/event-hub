import type { EventhubDriver } from '../../../../driver/port/eventhub-driver.js';
import type { BrowseOrderHistoryResponse } from '../../../../driver/port/dtos/BrowseOrderHistoryResponse.js';
import { UseCaseResult } from '../../shared/use-case-result.js';
import type { UseCaseContext } from '../../shared/use-case-context.js';
import { BaseEventhubUseCase } from './base/BaseEventhubUseCase.js';
import { BrowseOrderHistoryVerification } from './BrowseOrderHistoryVerification.js';

export class BrowseOrderHistory extends BaseEventhubUseCase<BrowseOrderHistoryResponse, BrowseOrderHistoryVerification> {
  private _orderNumber = '';

  constructor(driver: EventhubDriver, context: UseCaseContext) {
    super(driver, context);
  }

  orderNumber(aliasOrValue: string): this {
    this._orderNumber = aliasOrValue;
    return this;
  }

  async execute(): Promise<UseCaseResult<BrowseOrderHistoryResponse, BrowseOrderHistoryVerification>> {
    const resolved = this.context.getResultValue(this._orderNumber) ?? this._orderNumber;
    const result = await this.driver.browseOrderHistory({ orderNumber: resolved });

    return new UseCaseResult(
      result,
      this.context,
      (response, ctx) => new BrowseOrderHistoryVerification(response, ctx),
    );
  }
}
