package com.optivem.eventhub.backend.testkit.dsl.port.when;

import com.optivem.eventhub.backend.testkit.dsl.port.when.steps.WhenBrowseCoupons;
import com.optivem.eventhub.backend.testkit.dsl.port.when.steps.WhenBrowseOrderHistory;
import com.optivem.eventhub.backend.testkit.dsl.port.when.steps.WhenCancelOrder;
import com.optivem.eventhub.backend.testkit.dsl.port.when.steps.WhenPlaceOrder;
import com.optivem.eventhub.backend.testkit.dsl.port.when.steps.WhenPublishCoupon;
import com.optivem.eventhub.backend.testkit.dsl.port.when.steps.WhenViewOrder;

/** The one action the scenario is about. */
public interface WhenStage {
    WhenPlaceOrder placeOrder();

    WhenCancelOrder cancelOrder();

    WhenViewOrder viewOrder();

    WhenBrowseOrderHistory browseOrderHistory();

    WhenPublishCoupon publishCoupon();

    WhenBrowseCoupons browseCoupons();
}
