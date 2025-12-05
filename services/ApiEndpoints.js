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
    CREATE: '/orders/',  // ✅ POST /api/orders/ (با / در انتها)
    DETAILS: '/orders/{id}',
    CANCEL: '/orders/{id}/cancel',
    TRACK: '/orders/{id}/track',
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
  }
};

// Helper function to build full URL
export const buildApiUrl = (endpoint) => {
  return `${API_ENDPOINTS.BASE_URL}${endpoint}`;
};

// Helper function to replace path parameters
export const buildEndpointWithParams = (endpoint, params = {}) => {
  let url = endpoint;
  Object.keys(params).forEach(key => {
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