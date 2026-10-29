package com.optivem.eventhub.backend.testkit.dsl.core.usecase;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.optivem.eventhub.backend.testkit.driver.port.EventhubDriver;
import com.optivem.eventhub.backend.testkit.driver.port.external.clock.ClockDriver;
import com.optivem.eventhub.backend.testkit.driver.port.external.erp.ErpDriver;
import com.optivem.eventhub.backend.testkit.driver.adapter.sut.SutClockReader;
import com.optivem.eventhub.backend.testkit.driver.adapter.sut.SutErpReader;
import com.optivem.eventhub.backend.testkit.driver.adapter.sut.SutTaxReader;
import com.optivem.eventhub.backend.testkit.driver.port.external.tax.TaxDriver;
import com.optivem.eventhub.backend.testkit.dsl.core.usecase.external.clock.ClockDsl;
import com.optivem.eventhub.backend.testkit.dsl.core.usecase.external.erp.ErpDsl;
import com.optivem.eventhub.backend.testkit.dsl.core.usecase.external.tax.TaxDsl;

/**
 * Root of the use case layer: one entry per actor in a component test — the system under test
 * ({@link #eventhub()}) and the three external systems it talks to ({@link #erp()}, {@link #tax()},
 * {@link #clock()}).
 *
 * <p>This is the layer the scenario DSL is built on, and it stays exposed: a test that needs
 * surgical control can drop to it directly instead of bending a scenario around an edge case.
 */
public class UseCaseDsl {

    private final EventhubDsl eventhub;
    private final ErpDsl erp;
    private final TaxDsl tax;
    private final ClockDsl clock;
    private final SutErpReader sutErp;
    private final SutTaxReader sutTax;
    private final SutClockReader sutClock;

    public UseCaseDsl(
            EventhubDriver backendDriver,
            ObjectMapper objectMapper,
            ErpDriver erpStubDriver,
            TaxDriver taxStubDriver,
            ClockDriver clockStubDriver,
            SutErpReader sutErp,
            SutTaxReader sutTax,
            SutClockReader sutClock) {
        this.eventhub = new EventhubDsl(backendDriver, objectMapper);
        this.erp = new ErpDsl(erpStubDriver);
        this.tax = new TaxDsl(taxStubDriver);
        this.clock = new ClockDsl(clockStubDriver);
        this.sutErp = sutErp;
        this.sutTax = sutTax;
        this.sutClock = sutClock;
    }

    public EventhubDsl eventhub() {
        return eventhub;
    }

    public ErpDsl erp() {
        return erp;
    }

    public TaxDsl tax() {
        return tax;
    }

    public ClockDsl clock() {
        return clock;
    }

    /**
     * Reads a product through the SUT's production {@code ErpGateway} — the SUT's own view of the ERP
     * stub. Backs {@code then().product(...)} in the stub-contract tests, deliberately not the stub
     * client (a test-side read of the stub would be a tautology).
     */
    public SutErpReader sutErp() {
        return sutErp;
    }

    /** Reads a country through the SUT's production {@code TaxGateway}. See {@link #sutErp()}. */
    public SutTaxReader sutTax() {
        return sutTax;
    }

    /** Reads the current time through the SUT's production {@code ClockGateway}. See {@link #sutErp()}. */
    public SutClockReader sutClock() {
        return sutClock;
    }
}
