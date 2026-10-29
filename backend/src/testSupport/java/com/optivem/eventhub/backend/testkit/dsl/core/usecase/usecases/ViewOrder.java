package com.optivem.eventhub.backend.testkit.dsl.core.usecase.usecases;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.optivem.eventhub.backend.core.dtos.ViewOrderDetailsResponse;
import com.optivem.eventhub.backend.testkit.driver.port.EventhubDriver;
import com.optivem.eventhub.backend.testkit.dsl.core.shared.ResponseParser;
import com.optivem.eventhub.backend.testkit.dsl.core.shared.UseCaseContext;
import com.optivem.eventhub.backend.testkit.dsl.core.shared.UseCaseResult;
import com.optivem.eventhub.backend.testkit.dsl.core.usecase.usecases.base.BaseEventhubUseCase;
import java.util.Set;
import org.springframework.http.HttpStatus;

/**
 * {@code GET /api/orders/{orderNumber}} — {@code 200 OK} with the persisted details, or {@code 404
 * NOT_FOUND} with a {@code ProblemDetail} when no such order exists.
 */
public class ViewOrder extends BaseEventhubUseCase<ViewOrderDetailsResponse, ViewOrderVerification> {

    private final ObjectMapper objectMapper;
    private String orderNumberResultAlias;

    public ViewOrder(EventhubDriver driver, UseCaseContext context, ObjectMapper objectMapper) {
        super(driver, context);
        this.objectMapper = objectMapper;
    }

    /**
     * An alias registered by an earlier step, or a literal order number. Unregistered strings pass
     * through unchanged, which is what makes {@code withOrderNumber("UNKNOWN")} still name an order
     * that does not exist.
     */
    public ViewOrder orderNumber(String orderNumberResultAlias) {
        this.orderNumberResultAlias = orderNumberResultAlias;
        return this;
    }

    @Override
    public UseCaseResult<ViewOrderDetailsResponse, ViewOrderVerification> execute() {
        var response = driver.viewOrder(context.getResultValue(orderNumberResultAlias));

        return new UseCaseResult<>(
            response.getStatusCode(),
            HttpStatus.OK,
            Set.of(HttpStatus.NOT_FOUND),
            () -> ResponseParser.parseSuccess(response, ViewOrderDetailsResponse.class, objectMapper),
            () -> ResponseParser.parseRejection(response, objectMapper),
            ViewOrderVerification::new);
    }
}
