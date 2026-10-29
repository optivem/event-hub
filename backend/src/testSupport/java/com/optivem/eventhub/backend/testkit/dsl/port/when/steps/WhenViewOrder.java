package com.optivem.eventhub.backend.testkit.dsl.port.when.steps;

import com.optivem.eventhub.backend.testkit.dsl.port.when.steps.base.WhenStep;

public interface WhenViewOrder extends WhenStep {
    WhenViewOrder withOrderNumber(String orderNumber);
}
