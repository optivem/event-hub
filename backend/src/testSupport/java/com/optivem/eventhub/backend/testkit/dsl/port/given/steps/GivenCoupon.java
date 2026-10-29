package com.optivem.eventhub.backend.testkit.dsl.port.given.steps;

import com.optivem.eventhub.backend.testkit.dsl.port.given.steps.base.GivenStep;

public interface GivenCoupon extends GivenStep {
    GivenCoupon withCouponCode(String couponCode);

    GivenCoupon withDiscountRate(String discountRate);

    GivenCoupon withDiscountRate(double discountRate);

    GivenCoupon withValidFrom(String validFrom);

    GivenCoupon withValidTo(String validTo);

    GivenCoupon withUsageLimit(int usageLimit);
}
