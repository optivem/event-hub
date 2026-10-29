package com.optivem.eventhub.backend.testkit.dsl.core.usecase.external.erp.usecases.base;

import com.optivem.eventhub.backend.testkit.driver.port.external.erp.ErpDriver;
import com.optivem.eventhub.backend.testkit.dsl.core.shared.BaseStubUseCase;

public abstract class BaseErpUseCase extends BaseStubUseCase<ErpDriver> {

    protected BaseErpUseCase(ErpDriver driver) {
        super(driver);
    }
}
