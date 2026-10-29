package com.optivem.eventhub.backend.component.latest.smoke.system;

import com.optivem.eventhub.backend.BaseComponentTest;
import org.junit.jupiter.api.Test;

/**
 * "After" of the component-test refactor: the harness canary written on the scenario DSL
 * ({@link com.optivem.eventhub.backend.testkit.dsl.core.ScenarioDslImpl}) instead of raw {@code
 * restTemplate}. Proves the in-process harness boots
 * and serves (random port/real socket, Testcontainers Postgres migrated and reachable, HTTP
 * round-trips work), with no compose.
 *
 * <p>{@code assume().eventhub().shouldBeRunning()} resolves to the {@code GET /health} liveness probe,
 * so the canary depends only on the harness being up, not on any feature endpoint.
 */
class EventhubSmokeTest extends BaseComponentTest {

    @Test
    void shouldBeAbleToGoToEventhub() {
        scenario.assume().eventhub().shouldBeRunning();
    }
}
