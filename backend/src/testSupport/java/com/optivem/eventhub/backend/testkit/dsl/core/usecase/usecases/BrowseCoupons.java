package com.optivem.eventhub.backend.testkit.dsl.core.usecase.usecases;

import com.optivem.eventhub.backend.core.dtos.BrowseCouponsResponse;
import com.optivem.eventhub.backend.testkit.driver.port.EventhubDriver;
import com.optivem.eventhub.backend.testkit.dsl.core.shared.UseCaseContext;
import com.optivem.eventhub.backend.testkit.dsl.core.shared.UseCaseResult;
import com.optivem.eventhub.backend.testkit.dsl.core.usecase.usecases.base.BaseEventhubUseCase;
import java.util.Set;
import org.springframework.http.HttpStatus;

/** {@code GET /api/coupons} — always {@code 200 OK}; there is no rejection path to state. */
public class BrowseCoupons extends BaseEventhubUseCase<BrowseCouponsResponse, BrowseCouponsVerification> {

    public BrowseCoupons(EventhubDriver driver, UseCaseContext context) {
        super(driver, context);
    }

    @Override
    public UseCaseResult<BrowseCouponsResponse, BrowseCouponsVerification> execute() {
        var response = driver.browseCoupons();

        return new UseCaseResult<>(
            response.getStatusCode(),
            HttpStatus.OK,
            Set.of(),
            response::getBody,
            null,
            BrowseCouponsVerification::new);
    }
}
