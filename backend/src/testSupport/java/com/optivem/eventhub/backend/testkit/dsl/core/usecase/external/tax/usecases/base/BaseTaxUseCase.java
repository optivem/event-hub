package com.optivem.eventhub.backend.testkit.dsl.core.usecase.external.tax.usecases.base;

import com.optivem.eventhub.backend.testkit.driver.port.external.tax.TaxDriver;
import com.optivem.eventhub.backend.testkit.dsl.core.shared.BaseStubUseCase;

public abstract class BaseTaxUseCase extends BaseStubUseCase<TaxDriver> {

    protected BaseTaxUseCase(TaxDriver driver) {
        super(driver);
    }
}
