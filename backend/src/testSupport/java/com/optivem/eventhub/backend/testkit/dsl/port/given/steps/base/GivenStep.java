package com.optivem.eventhub.backend.testkit.dsl.port.given.steps.base;

import com.optivem.eventhub.backend.testkit.dsl.port.given.GivenStage;
import com.optivem.eventhub.backend.testkit.dsl.port.then.ThenStage;
import com.optivem.eventhub.backend.testkit.dsl.port.when.WhenStage;

public interface GivenStep {
    GivenStage and();

    WhenStage when();

    ThenStage then();
}
