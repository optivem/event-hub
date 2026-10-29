import type { AppContext, ChannelMode } from '../scenario/app-context.js';
import { UseCaseContext } from '../shared/use-case-context.js';
import { externalSystemModeFromEnv } from '../../../common/env.js';
import { EventhubDsl } from './EventhubDsl.js';
import { ClockDsl } from './external/clock/ClockDsl.js';
import { ErpDsl } from './external/erp/ErpDsl.js';
import { TaxDsl } from './external/tax/TaxDsl.js';

export class UseCaseDsl {
  private readonly useCaseContext: UseCaseContext;
  private _eventhubDsl?: EventhubDsl;
  private _clockDsl?: ClockDsl;
  private _erpDsl?: ErpDsl;
  private _taxDsl?: TaxDsl;

  constructor(private readonly app: AppContext) {
    this.useCaseContext = new UseCaseContext(externalSystemModeFromEnv());
  }

  eventhub(mode?: ChannelMode): EventhubDsl {
    if (mode) {
      this._eventhubDsl = new EventhubDsl(this.app.eventhub(mode), this.useCaseContext);
    } else {
      this._eventhubDsl ??= new EventhubDsl(this.app.eventhub(mode), this.useCaseContext);
    }
    return this._eventhubDsl;
  }

  clock(): ClockDsl {
    this._clockDsl ??= new ClockDsl(this.app.clockDriver, this.useCaseContext);
    return this._clockDsl;
  }

  erp(): ErpDsl {
    this._erpDsl ??= new ErpDsl(this.app.erpDriver, this.useCaseContext);
    return this._erpDsl;
  }

  tax(): TaxDsl {
    this._taxDsl ??= new TaxDsl(this.app.taxDriver, this.useCaseContext);
    return this._taxDsl;
  }

  async close(): Promise<void> {
    await this.app.closeAll();
  }
}
