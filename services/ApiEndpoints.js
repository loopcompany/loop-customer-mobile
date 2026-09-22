import { uri } from './URL';

// API Endpoints Configuration
export const API_ENDPOINTS = {
  // Base URL (from URL.js)
  BASE_URL: uri, // http://192.168.21.123:8000/api

  // Auth endpoints (all prefixed with /auth)
  AUTH: {
    REGISTER: '/auth/register',
    VERIFY_PHONE: '/auth/verify-phone',
    RESEND_CODE: '/auth/resend-code',
    LOGIN: '/auth/login',
    VALIDATE_TOKEN: '/auth/validate-token',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
    REFRESH_TOKEN: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    // Reset password specific endpoints
    VERIFY_RESET_CODE: '/auth/verify-reset-code',
    RESEND_RESET_CODE: '/auth/resend-reset-code',
  },

  // User endpoints
  USER: {
    PROFILE: '/profile',
    UPDATE_PROFILE: '/profile',
    CHANGE_PASSWORD: '/profile/password',
    UPLOAD_AVATAR: '/user/avatar',
  },

  // Orders endpoints
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders/submit', // POST /api/orders/submit — verified against the live API.
    // NOTE: '/orders/' 301-redirects to '/orders', which only accepts GET/HEAD,
    // so a POST there always fails with 405. docs/ORDER_SUBMIT_API_QUICK_GUIDE.md is wrong.
    // NOTE: no longer used at checkout. The order screen's discount field now
    // validates against PROMO.CHECK and submits `promo_code`; this club/gem
    // endpoint is kept because the backend still serves it.
    CHECK_DISCOUNT: '/orders/check-discount', // POST — per ORGANIZATION_ORDER_API.md
    DETAILS: '/orders/{id}',
    GATEWAY_PAYMENT: '/orders/gateway-payment', // POST { order_id, linking_url }
    CANCEL: '/orders/{id}/cancel',
    TRACK: '/orders/{id}/track',
  },

  // Service steps & rates — contract: FRONTEND_SERVICE_RATES.md
  // `field_details[].price` is the per-option rate; the front sums the selected
  // ones into `total_price` and the backend stores that as-is (no recompute).
  STEPS: {
    FETCH: '/steps/fetch', // POST { categoryId }
    FETCH_CONDITIONAL: '/steps/fetch-conditional', // POST { categoryId, fieldId, fieldDetailId }
  },

  // Wallet & transactions — contract: FRONTEND_WALLET.md
  // Amounts are integer tomans. Charge accepts 10,000 .. 50,000,000.
  WALLET: {
    BALANCE: '/wallet/balance',
    CHARGE: '/wallet/charge',
    TRANSACTIONS: '/wallet/transactions',
    // NOTE: the body key is `orderId` (camelCase), unlike /orders/gateway-payment
    // which takes `order_id`. This asymmetry is the backend's, not a typo.
    PAY_ORDER: '/wallet/pay-order',
  },

  // Discount codes (club / gem plans) — contract: FRONTEND_DISCOUNT_CODES.md
  DISCOUNT: {
    OFFERS: '/discounts/offers',
    CATEGORIES: '/discounts/categories',
    LIST: '/discounts/list',
    DETAIL: '/discounts/detail', // POST { discountId }
    CLAIM: '/discounts/claim', // POST { discountId }
    USER_CODES: '/user/discounts',
    // NOTE: do NOT use '/discounts/check'. It is a second validation endpoint
    // with different field names (discountCode/categoryId), a flat
    // `discount_code_percent` response and 409 on invalid. The app standardises
    // on ORDERS.CHECK_DISCOUNT below, which is the wrapped//data variant.
  },

  // Promo codes (admin-generated, one use per user) — contract: FRONTEND_PROMO_CODES.md
  //
  // This is the code the order screen's «کد تخفیف» field collects, and it is
  // sent as `promo_code` on submit. Unrelated to DISCOUNT below (club/gem
  // codes, `discount_code`) and to REFERRAL (`referral_code`) — the backend
  // keeps three separate fields and the contract is explicit that a promo code
  // must travel in `promo_code` only.
  PROMO: {
    CHECK: '/promo-codes/check', // POST { code } — does NOT consume the code
  },

  // Referral codes (admin-assigned `LOOP-XXXXXX`) — contract: FRONTEND_REFERRAL_CODES.md
  // Unrelated to `other_referral_code` collected at registration, which is a
  // plain stored field with no discount attached. Do not merge the two.
  REFERRAL: {
    CHECK: '/referral-codes/check', // POST { code } — CONSUMES the code
  },

  // Push notifications (FCM device tokens) — see services/notifications/
  NOTIFICATIONS: {
    DEVICE_TOKEN: '/notifications/device-token', // POST register / DELETE remove
  },

  // Technician endpoints
  TECHNICIANS: {
    LIST: '/technicians',
    DETAILS: '/technicians/{id}',
    BOOK: '/technicians/book',
    AVAILABILITY: '/technicians/{id}/availability',
  },

  // Services endpoints
  SERVICES: {
    CATEGORIES: '/services/categories',
    LIST: '/services',
    HARDWARE: '/services/hardware',
    SOFTWARE: '/services/software',
    INSTALLATION: '/services/installation',
  },

  // Info endpoints (Public APIs)
  INFO: {
    FAQS: '/info/faqs',
    TERMS: '/info/terms',
    PRIVACY: '/info/privacy',
    ORGANIZATION_TERMS: '/info/organization-terms',
    WARRANTY: '/info/warranties',
  },

  // Organization endpoints
  ORGANIZATION: {
    REGISTER: '/organization/register',
    VERIFY_PHONE: '/organization/verify-phone',
    RESEND_CODE: '/organization/resend-code',
    LOGIN: '/organization/login',
    VALIDATE_TOKEN: '/organization/validate-token',
    LOGOUT: '/organization/logout',
    LOGOUT_ALL: '/organization/logout-all',
    WARRANTY: '/info/warranties',
  },
};

// Helper function to build full URL
export const buildApiUrl = (endpoint) => {
  return `${API_ENDPOINTS.BASE_URL}${endpoint}`;
};

// Helper function to replace path parameters
export const buildEndpointWithParams = (endpoint, params = {}) => {
  let url = endpoint;
  Object.keys(params).forEach((key) => {
    url = url.replace(`{${key}}`, params[key]);
  });
  return url;
};

// Usage examples:
/*
// Simple endpoint
const registerUrl = buildApiUrl(API_ENDPOINTS.AUTH.REGISTER);
// Result: "http://192.168.21.123:8000/api/auth/register"

// Endpoint with parameters
const orderDetailsEndpoint = buildEndpointWithParams(
  API_ENDPOINTS.ORDERS.DETAILS, 
  { id: 123 }
);
const orderDetailsUrl = buildApiUrl(orderDetailsEndpoint);
// Result: "http://192.168.21.123:8000/api/orders/123"
*/
