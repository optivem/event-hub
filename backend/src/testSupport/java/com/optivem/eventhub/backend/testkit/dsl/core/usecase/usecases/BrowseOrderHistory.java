package com.optivem.eventhub.backend.testkit.dsl.core.usecase.usecases;

import com.optivem.eventhub.backend.core.dtos.BrowseOrderHistoryResponse;
import com.optivem.eventhub.backend.testkit.driver.port.EventhubDriver;
import com.optivem.eventhub.backend.testkit.dsl.core.shared.UseCaseContext;
import com.optivem.eventhub.backend.testkit.dsl.core.shared.UseCaseResult;
import com.optivem.eventhub.backend.testkit.dsl.core.usecase.usecases.base.BaseEventhubUseCase;
import java.util.Set;
import org.springframework.http.HttpStatus;

/** {@code GET /api/orders} — always {@code 200 OK}; there is no rejection path to state. */
public class BrowseOrderHistory
        extends BaseEventhubUseCase<BrowseOrderHistoryResponse, BrowseOrderHistoryVerification> {

    public BrowseOrderHistory(EventhubDriver driver, UseCaseContext context) {
        super(driver, context);
    }

    @Override
    public UseCaseResult<BrowseOrderHistoryResponse, BrowseOrderHistoryVerification> execute() {
        var response = driver.browseOrderHistory();

        return new UseCaseResult<>(
            response.getStatusCode(),
            HttpStatus.OK,
            Set.of(),
            response::getBody,
            null,
            BrowseOrderHistoryVerification::new);
    }
}
