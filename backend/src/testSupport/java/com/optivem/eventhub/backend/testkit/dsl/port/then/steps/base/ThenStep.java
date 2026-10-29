package com.optivem.eventhub.backend.testkit.dsl.port.then.steps.base;

import com.optivem.eventhub.backend.testkit.dsl.port.then.steps.ThenClock;
import com.optivem.eventhub.backend.testkit.dsl.port.then.steps.ThenCoupon;
import com.optivem.eventhub.backend.testkit.dsl.port.then.steps.ThenCountry;
import com.optivem.eventhub.backend.testkit.dsl.port.then.steps.ThenOrder;
import com.optivem.eventhub.backend.testkit.dsl.port.then.steps.ThenOrderHistory;
import com.optivem.eventhub.backend.testkit.dsl.port.then.steps.ThenProduct;

/**
 * Lets one {@code then()} chain hop between entities: {@code .shouldSucceed().and().order()
 * .hasTotalPrice(...).and().coupon("SAVE20").hasUsedCount(1)}.
 *
 * <p>The no-argument {@code order()} / {@code coupon()} resolve against what the action produced —
 * the order number the SUT generated, the coupon code the action carried — so a scenario that
 * already said it once does not repeat it.
 *
 * <p>{@code product()} / {@code clock()} / {@code country()} hop to an external as the SUT sees it
 * (through the production gateway — see {@link com.optivem.eventhub.backend.testkit.dsl.port.then.ThenStage}).
 */
public interface ThenStep<T> {
    T and();

    ThenOrder order();

    ThenOrder order(String orderNumber);

    ThenCoupon coupon();

    ThenCoupon coupon(String couponCode);

    ThenOrderHistory orderHistory();

    ThenProduct product(String sku);

    ThenClock clock();

    ThenCountry country(String code);
}
