package com.optivem.eventhub.backend.testkit.dsl.port.when.steps;

import com.optivem.eventhub.backend.testkit.dsl.port.when.steps.base.WhenStep;

public interface WhenPublishCoupon extends WhenStep {
    WhenPublishCoupon withCouponCode(String couponCode);

    WhenPublishCoupon withDiscountRate(String discountRate);

    WhenPublishCoupon withDiscountRate(double discountRate);

    WhenPublishCoupon withValidFrom(String validFrom);

    WhenPublishCoupon withValidTo(String validTo);

    WhenPublishCoupon withUsageLimit(int usageLimit);
}
