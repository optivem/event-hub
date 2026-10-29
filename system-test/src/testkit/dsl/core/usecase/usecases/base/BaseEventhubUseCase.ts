import type { EventhubDriver } from '../../../../../driver/port/eventhub-driver.js';
import { BaseUseCase } from '../../../shared/base-use-case.js';

export abstract class BaseEventhubUseCase<TResponse, TVerification> extends BaseUseCase<
  EventhubDriver,
  TResponse,
  TVerification
> {}
