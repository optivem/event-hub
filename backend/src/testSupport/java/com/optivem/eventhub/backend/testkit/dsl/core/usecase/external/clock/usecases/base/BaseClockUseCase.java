package com.optivem.eventhub.backend.testkit.dsl.core.usecase.external.clock.usecases.base;

import com.optivem.eventhub.backend.testkit.driver.port.external.clock.ClockDriver;
import com.optivem.eventhub.backend.testkit.dsl.core.shared.BaseStubUseCase;

public abstract class BaseClockUseCase extends BaseStubUseCase<ClockDriver> {

    protected BaseClockUseCase(ClockDriver driver) {
        super(driver);
    }
}
