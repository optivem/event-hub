package com.optivem.eventhub.backend.core.dtos;

import lombok.Data;

@Data
public class RecallSkuResponse {
    private String sku;
    private int cancelledCount;
}
