package com.optivem.eventhub.backend.testkit.dsl.core.usecase.external.tax.usecases;

import com.optivem.eventhub.backend.testkit.driver.port.external.tax.TaxDriver;
import com.optivem.eventhub.backend.testkit.dsl.core.usecase.external.tax.usecases.base.BaseTaxUseCase;

public class ReturnsTaxRate extends BaseTaxUseCase {

    private String country;
    private String taxRate;

    public ReturnsTaxRate(TaxDriver driver) {
        super(driver);
    }

    public ReturnsTaxRate country(String country) {
        this.country = country;
        return this;
    }

    public ReturnsTaxRate taxRate(String taxRate) {
        this.taxRate = taxRate;
        return this;
    }

    @Override
    public void execute() {
        driver.returnsTaxRate(country, taxRate);
    }
}
