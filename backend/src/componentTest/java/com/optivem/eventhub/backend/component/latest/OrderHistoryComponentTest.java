package com.optivem.eventhub.backend.component.latest;

import com.optivem.eventhub.backend.BaseComponentTest;
import org.junit.jupiter.api.Test;

/**
 * "After" of the component-test refactor: the scenarios written
 * on the scenario DSL ({@link com.optivem.eventhub.backend.testkit.dsl.core.ScenarioDslImpl}).
 *
 * <p>{@link #browseReturnsPlacedOrders()} says the whole story as one scenario — place, then assert
 * the order shows up in the history — rather than arranging an order imperatively and browsing as a
 * second act. {@code orderHistory()} reads {@code GET /api/orders} back, and {@code containsOrder()}
 * resolves the order number the SUT generated, so the test never has to hold it.
 */
class OrderHistoryComponentTest extends BaseComponentTest {

    @Test
    void browseReturnsPlacedOrders() {
        scenario.when().placeOrder()
            .then().shouldSucceed()
            .and().orderHistory().containsOrder();
    }

    @Test
    void viewMissingOrderReturnsNotFound() {
        scenario.when().viewOrder().withOrderNumber("UNKNOWN")
            .then().shouldFail()
                .errorMessage("Order UNKNOWN does not exist.");
    }
}
