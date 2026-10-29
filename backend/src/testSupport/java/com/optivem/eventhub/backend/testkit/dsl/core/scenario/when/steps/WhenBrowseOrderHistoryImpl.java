package com.optivem.eventhub.backend.testkit.dsl.core.scenario.when.steps;

import com.optivem.eventhub.backend.core.dtos.BrowseOrderHistoryResponse;
import com.optivem.eventhub.backend.testkit.dsl.core.ScenarioDslImpl;
import com.optivem.eventhub.backend.testkit.dsl.core.scenario.ExecutionResult;
import com.optivem.eventhub.backend.testkit.dsl.core.scenario.ExecutionResultBuilder;
import com.optivem.eventhub.backend.testkit.dsl.core.usecase.UseCaseDsl;
import com.optivem.eventhub.backend.testkit.dsl.core.usecase.usecases.BrowseOrderHistoryVerification;
import com.optivem.eventhub.backend.testkit.dsl.port.when.steps.WhenBrowseOrderHistory;

public class WhenBrowseOrderHistoryImpl
        extends BaseWhenStep<BrowseOrderHistoryResponse, BrowseOrderHistoryVerification>
        implements WhenBrowseOrderHistory {

    public WhenBrowseOrderHistoryImpl(UseCaseDsl app, ScenarioDslImpl scenario) {
        super(app, scenario);
    }

    @Override
    protected ExecutionResult<BrowseOrderHistoryResponse, BrowseOrderHistoryVerification> execute(
            UseCaseDsl app) {
        var result = app.eventhub().browseOrderHistory().execute();
        return new ExecutionResultBuilder<>(result).build();
    }
}
