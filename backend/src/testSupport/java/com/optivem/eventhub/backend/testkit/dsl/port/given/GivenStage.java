package com.optivem.eventhub.backend.testkit.dsl.port.given;

import com.optivem.eventhub.backend.testkit.dsl.port.given.steps.GivenClock;
import com.optivem.eventhub.backend.testkit.dsl.port.given.steps.GivenCoupon;
import com.optivem.eventhub.backend.testkit.dsl.port.given.steps.GivenCountry;
import com.optivem.eventhub.backend.testkit.dsl.port.given.steps.GivenOrder;
import com.optivem.eventhub.backend.testkit.dsl.port.given.steps.GivenProduct;
import com.optivem.eventhub.backend.testkit.dsl.port.given.steps.GivenPromotion;
import com.optivem.eventhub.backend.testkit.dsl.port.then.ThenStage;
import com.optivem.eventhub.backend.testkit.dsl.port.when.WhenStage;

/**
 * The world the scenario runs in. Each step is translated into use case calls — the ERP / Tax /
 * Clock steps program the WireMock stubs, {@code coupon()} publishes through the SUT's own API.
 *
 * <p>Unstated values are filled from {@code ScenarioDefaults}, so a scenario states only what it
 * actually depends on.
 */
public interface GivenStage {
    GivenClock clock();

    GivenProduct product();

    GivenPromotion promotion();

    GivenCountry country();

    GivenCoupon coupon();

    GivenOrder order();

    WhenStage when();

    ThenStage then();
}
