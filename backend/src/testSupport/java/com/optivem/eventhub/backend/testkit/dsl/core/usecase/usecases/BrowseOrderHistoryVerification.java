package com.optivem.eventhub.backend.testkit.dsl.core.usecase.usecases;

import static org.assertj.core.api.Assertions.assertThat;

import com.optivem.eventhub.backend.core.dtos.BrowseOrderHistoryResponse;
import com.optivem.eventhub.backend.testkit.dsl.core.shared.ResponseVerification;

public class BrowseOrderHistoryVerification
        extends ResponseVerification<BrowseOrderHistoryResponse> {

    public BrowseOrderHistoryVerification(BrowseOrderHistoryResponse response) {
        super(response);
    }

    public BrowseOrderHistoryVerification hasOrderWithNumber(String expectedOrderNumber) {
        assertThat(getResponse().getOrders())
            .as("order history")
            .extracting(BrowseOrderHistoryResponse.BrowseOrderHistoryItemResponse::getOrderNumber)
            .contains(expectedOrderNumber);
        return this;
    }
}
