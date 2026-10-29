package com.optivem.eventhub.backend.testkit.dsl.port;

import com.optivem.eventhub.backend.testkit.dsl.port.assume.AssumeStage;
import com.optivem.eventhub.backend.testkit.dsl.port.given.GivenStage;
import com.optivem.eventhub.backend.testkit.dsl.port.when.WhenStage;

/**
 * Entry point of the component-test scenario DSL: {@code assume() / given() / when()}.
 *
 * <p>{@code then()} reaches only SUT state — the order, the coupons, the order history. The ERP /
 * Tax / Clock stubs are programmed by {@code given()}, so reading them back would assert nothing but
 * the test's own setup.
 */
public interface ScenarioDsl {
    AssumeStage assume();

    GivenStage given();

    WhenStage when();
}
