import { ChannelType } from '../../../channel/channel-type.js';
import type { EventhubDriver } from '../../../driver/port/eventhub-driver.js';
import type { ErpDriver } from '../../../driver/port/external/erp/erp-driver.js';
import type { ClockDriver } from '../../../driver/port/external/clock/clock-driver.js';
import type { TaxDriver } from '../../../driver/port/external/tax/tax-driver.js';
import { UserIdentity } from '../../../driver/port/user-identity.js';

export type ChannelMode = 'dynamic' | 'static';

const STATIC_CHANNEL = ChannelType.API;

export class AppContext {
  private readonly shops = new Map<string, EventhubDriver>();
  private identity: UserIdentity = UserIdentity.DEFAULT;
  private readonly channelMode: ChannelMode;
  private readonly channel: string;
  private readonly eventhubDriverFactory: (channel: string) => EventhubDriver;
  readonly erpDriver: ErpDriver;
  readonly clockDriver: ClockDriver;
  readonly taxDriver: TaxDriver;

  constructor(opts: {
    channelMode: ChannelMode;
    channel: string;
    eventhubDriverFactory: (channel: string) => EventhubDriver;
    erpDriver: ErpDriver;
    clockDriver: ClockDriver;
    taxDriver: TaxDriver;
  }) {
    this.channelMode = opts.channelMode;
    this.channel = opts.channel;
    this.eventhubDriverFactory = opts.eventhubDriverFactory;
    this.erpDriver = opts.erpDriver;
    this.clockDriver = opts.clockDriver;
    this.taxDriver = opts.taxDriver;
  }

  /** Selects who Eventhub operations are performed as, until changed again. */
  actAs(identity: UserIdentity): void {
    this.identity = identity;
  }

  eventhub(mode?: ChannelMode): EventhubDriver {
    const resolvedMode = mode ?? this.channelMode;
    const channel = resolvedMode === 'static' ? STATIC_CHANNEL : this.channel;
    if (!this.shops.has(channel)) {
      this.shops.set(channel, this.eventhubDriverFactory(channel));
    }
    const shop = this.shops.get(channel)!;
    shop.actAs(this.identity);
    return shop;
  }

  async closeAll(): Promise<void> {
    for (const driver of this.shops.values()) {
      await driver.close();
    }
    await this.erpDriver.close();
    await this.clockDriver.close();
    await this.taxDriver.close();
  }
}
