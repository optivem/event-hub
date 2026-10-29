import { apiTest as test, expect, config } from './base/BaseE2eTest.js';
import { randomUUID } from 'node:crypto';
import { ApiIdentity } from '../../../../src/testkit/driver/adapter/api/client/api-identity.js';
import { assertThatResult } from '../../../../src/testkit/common/result-assert.js';

// Runs only when a Keycloak URL is configured (KEYCLOAK_URL_REAL / KEYCLOAK_URL).
test.skip(!config.keycloakUrl, 'Authorization tests require KEYCLOAK_URL to be set');

function newCouponRequest() {
    return { code: `AUTH-${randomUUID().substring(0, 8).toUpperCase()}`, discountRate: '0.10' };
}

test('shouldNotRequireTokenForHealth', async ({ eventhubApiClient }) => {
    const result = await eventhubApiClient.as(ApiIdentity.ANONYMOUS).health().checkHealth();

    assertThatResult(result).isSuccess();
});

test('shouldRejectRequestWithoutToken', async ({ eventhubApiClient }) => {
    const result = await eventhubApiClient.as(ApiIdentity.ANONYMOUS).orders().viewOrder('ORD-NONEXISTENT');

    expect(assertThatResult(result).isFailure().getError().status).toBe(401);
});

test('shouldRejectCustomerPublishingCoupon', async ({ eventhubApiClient }) => {
    const result = await eventhubApiClient.as(ApiIdentity.CUSTOMER).coupons().publishCoupon(newCouponRequest());

    expect(assertThatResult(result).isFailure().getError().status).toBe(403);
});

test('shouldAllowAdminToPublishCoupon', async ({ eventhubApiClient }) => {
    const result = await eventhubApiClient.as(ApiIdentity.ADMIN).coupons().publishCoupon(newCouponRequest());

    assertThatResult(result).isSuccess();
});
