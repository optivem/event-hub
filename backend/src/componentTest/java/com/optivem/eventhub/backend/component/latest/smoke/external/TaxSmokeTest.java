package com.optivem.eventhub.backend.component.latest.smoke.external;

import com.optivem.eventhub.backend.BaseComponentTest;
import org.junit.jupiter.api.Test;

/** Liveness canary for the in-process Tax stub. See {@link ErpSmokeTest} for what it does not cover. */
class TaxSmokeTest extends BaseComponentTest {

    @Test
    void shouldBeAbleToGoToTax() {
        scenario.assume().tax().shouldBeRunning();
    }
}
