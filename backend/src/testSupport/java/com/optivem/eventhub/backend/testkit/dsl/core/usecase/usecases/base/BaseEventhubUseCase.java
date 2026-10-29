package com.optivem.eventhub.backend.testkit.dsl.core.usecase.usecases.base;

import com.optivem.eventhub.backend.testkit.driver.port.EventhubDriver;
import com.optivem.eventhub.backend.testkit.dsl.core.shared.BaseUseCase;
import com.optivem.eventhub.backend.testkit.dsl.core.shared.ResponseVerification;
import com.optivem.eventhub.backend.testkit.dsl.core.shared.UseCaseContext;

public abstract class BaseEventhubUseCase<R, V extends ResponseVerification<R>>
        extends BaseUseCase<EventhubDriver, R, V> {

    /**
     * Scenario-scoped scratch space, so a use case that produces an identifier can register it under
     * an alias and a later use case can resolve that alias. The external stub use cases have no
     * equivalent — they never produce a value another step refers to.
     */
    protected final UseCaseContext context;

    protected BaseEventhubUseCase(EventhubDriver driver, UseCaseContext context) {
        super(driver);
        this.context = context;
    }
}
