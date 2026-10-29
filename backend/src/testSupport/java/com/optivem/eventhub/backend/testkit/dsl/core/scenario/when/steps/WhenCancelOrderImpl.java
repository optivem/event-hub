package com.optivem.eventhub.backend.testkit.dsl.core.scenario.when.steps;

import com.optivem.eventhub.backend.testkit.dsl.core.ScenarioDslImpl;
import com.optivem.eventhub.backend.testkit.dsl.core.scenario.ExecutionResult;
import com.optivem.eventhub.backend.testkit.dsl.core.scenario.ExecutionResultBuilder;
import com.optivem.eventhub.backend.testkit.dsl.core.scenario.ScenarioDefaults;
import com.optivem.eventhub.backend.testkit.dsl.core.shared.VoidVerification;
import com.optivem.eventhub.backend.testkit.dsl.core.usecase.UseCaseDsl;
import com.optivem.eventhub.backend.testkit.dsl.port.when.steps.WhenCancelOrder;

public class WhenCancelOrderImpl extends BaseWhenStep<Void, VoidVerification>
        implements WhenCancelOrder {

    private String orderNumber;

    public WhenCancelOrderImpl(UseCaseDsl app, ScenarioDslImpl scenario) {
        super(app, scenario);
        withOrderNumber(ScenarioDefaults.DEFAULT_ORDER_NUMBER);
    }

    @Override
    public WhenCancelOrderImpl withOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
        return this;
    }

    @Override
    protected ExecutionResult<Void, VoidVerification> execute(UseCaseDsl app) {
        var result = app.eventhub().cancelOrder().orderNumber(orderNumber).execute();

        return new ExecutionResultBuilder<Void, VoidVerification>(result)
            .orderNumber(orderNumber)
            .build();
    }
}
