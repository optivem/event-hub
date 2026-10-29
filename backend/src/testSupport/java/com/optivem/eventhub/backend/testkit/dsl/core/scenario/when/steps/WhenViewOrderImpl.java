package com.optivem.eventhub.backend.testkit.dsl.core.scenario.when.steps;

import com.optivem.eventhub.backend.core.dtos.ViewOrderDetailsResponse;
import com.optivem.eventhub.backend.testkit.dsl.core.ScenarioDslImpl;
import com.optivem.eventhub.backend.testkit.dsl.core.scenario.ExecutionResult;
import com.optivem.eventhub.backend.testkit.dsl.core.scenario.ExecutionResultBuilder;
import com.optivem.eventhub.backend.testkit.dsl.core.usecase.UseCaseDsl;
import com.optivem.eventhub.backend.testkit.dsl.core.usecase.usecases.ViewOrderVerification;
import com.optivem.eventhub.backend.testkit.dsl.port.when.steps.WhenViewOrder;

public class WhenViewOrderImpl
        extends BaseWhenStep<ViewOrderDetailsResponse, ViewOrderVerification>
        implements WhenViewOrder {

    private String orderNumber;

    public WhenViewOrderImpl(UseCaseDsl app, ScenarioDslImpl scenario) {
        super(app, scenario);
    }

    @Override
    public WhenViewOrderImpl withOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
        return this;
    }

    @Override
    protected ExecutionResult<ViewOrderDetailsResponse, ViewOrderVerification> execute(
            UseCaseDsl app) {
        var result = app.eventhub().viewOrder().orderNumber(orderNumber).execute();

        return new ExecutionResultBuilder<>(result)
            .orderNumber(orderNumber)
            .build();
    }
}
