package com.optivem.eventhub.backend.testkit.dsl.port.when.steps.base;

import com.optivem.eventhub.backend.testkit.dsl.port.then.ThenResultStage;

/**
 * Every when-step ends in {@code then()}, which is what actually executes the action — the step
 * itself only collects parameters. The outcome (success payload or rejection) is captured, not
 * asserted, so the test states its expectation in {@code then()}.
 */
public interface WhenStep {
    ThenResultStage then();
}
