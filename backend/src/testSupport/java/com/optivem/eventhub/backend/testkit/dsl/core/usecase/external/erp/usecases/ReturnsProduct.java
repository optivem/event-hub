package com.optivem.eventhub.backend.testkit.dsl.core.usecase.external.erp.usecases;

import com.optivem.eventhub.backend.testkit.driver.port.external.erp.ErpDriver;
import com.optivem.eventhub.backend.testkit.dsl.core.usecase.external.erp.usecases.base.BaseErpUseCase;

public class ReturnsProduct extends BaseErpUseCase {

    private String sku;
    private String unitPrice;

    public ReturnsProduct(ErpDriver driver) {
        super(driver);
    }

    public ReturnsProduct sku(String sku) {
        this.sku = sku;
        return this;
    }

    public ReturnsProduct unitPrice(String unitPrice) {
        this.unitPrice = unitPrice;
        return this;
    }

    @Override
    public void execute() {
        driver.returnsProduct(sku, unitPrice);
    }
}
