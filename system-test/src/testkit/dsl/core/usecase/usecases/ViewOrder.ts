import type { EventhubDriver } from '../../../../driver/port/eventhub-driver.js';
import type { ViewOrderResponse } from '../../../../driver/port/dtos/ViewOrderResponse.js';
import { UseCaseResult } from '../../shared/use-case-result.js';
import type { UseCaseContext } from '../../shared/use-case-context.js';
import { BaseEventhubUseCase } from './base/BaseEventhubUseCase.js';
import { ViewOrderVerification } from './ViewOrderVerification.js';

export class ViewOrder extends BaseEventhubUseCase<ViewOrderResponse, ViewOrderVerification> {
  private _orderNumber = '';

  constructor(driver: EventhubDriver, context: UseCaseContext) {
    super(driver, context);
  }

  orderNumber(aliasOrValue: string): this {
    this._orderNumber = aliasOrValue;
    return this;
  }

  async execute(): Promise<UseCaseResult<ViewOrderResponse, ViewOrderVerification>> {
    const resolved = this.context.getResultValue(this._orderNumber) ?? this._orderNumber;
    const result = await this.driver.viewOrder({ orderNumber: resolved });

    return new UseCaseResult(
      result,
      this.context,
      (response, ctx) => new ViewOrderVerification(response, ctx),
    );
  }
}
