package com.optivem.eventhub.backend.testkit.dsl.core.scenario.when.steps;

import com.optivem.eventhub.backend.testkit.common.Converter;
import com.optivem.eventhub.backend.testkit.dsl.core.ScenarioDslImpl;
import com.optivem.eventhub.backend.testkit.dsl.core.scenario.ExecutionResult;
import com.optivem.eventhub.backend.testkit.dsl.core.scenario.ExecutionResultBuilder;
import com.optivem.eventhub.backend.testkit.dsl.core.scenario.ScenarioDefaults;
import com.optivem.eventhub.backend.testkit.dsl.core.shared.VoidVerification;
import com.optivem.eventhub.backend.testkit.dsl.core.usecase.UseCaseDsl;
import com.optivem.eventhub.backend.testkit.dsl.port.when.steps.WhenPublishCoupon;

public class WhenPublishCouponImpl extends BaseWhenStep<Void, VoidVerification>
        implements WhenPublishCoupon {

    private String couponCode = ScenarioDefaults.DEFAULT_COUPON_CODE;
    private String discountRate = ScenarioDefaults.DEFAULT_DISCOUNT_RATE;
    private String validFrom = ScenarioDefaults.EMPTY;
    private String validTo = ScenarioDefaults.EMPTY;
    private Integer usageLimit = ScenarioDefaults.DEFAULT_USAGE_LIMIT;

    public WhenPublishCouponImpl(UseCaseDsl app, ScenarioDslImpl scenario) {
        super(app, scenario);
    }

    @Override
    public WhenPublishCouponImpl withCouponCode(String couponCode) {
        this.couponCode = couponCode;
        return this;
    }

    @Override
    public WhenPublishCouponImpl withDiscountRate(String discountRate) {
        this.discountRate = discountRate;
        return this;
    }

    @Override
    public WhenPublishCouponImpl withDiscountRate(double discountRate) {
        return withDiscountRate(Converter.fromDouble(discountRate));
    }

    @Override
    public WhenPublishCouponImpl withValidFrom(String validFrom) {
        this.validFrom = validFrom;
        return this;
    }

    @Override
    public WhenPublishCouponImpl withValidTo(String validTo) {
        this.validTo = validTo;
        return this;
    }

    @Override
    public WhenPublishCouponImpl withUsageLimit(int usageLimit) {
        this.usageLimit = usageLimit;
        return this;
    }

    @Override
    protected ExecutionResult<Void, VoidVerification> execute(UseCaseDsl app) {
        var result = app.eventhub().publishCoupon()
            .couponCode(couponCode)
            .discountRate(discountRate)
            .validFrom(validFrom)
            .validTo(validTo)
            .usageLimit(usageLimit)
            .execute();

        return new ExecutionResultBuilder<>(result)
            .couponCode(couponCode)
            .build();
    }
}
