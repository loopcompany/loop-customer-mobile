/**
 * Pure mapping from an FCM `data` payload to a navigator target.
 *
 * The backend contract (see `FIREBASE_NOTIFICATIONS.md`) is:
 *   data.type    — a stable event kind, e.g. `order_status`
 *   data.screen  — an app-agnostic screen hint, e.g. `order-detail`
 *   data.order_id / … — string ids (FCM sends every `data` value as a string)
 *
 * Neither `type` nor `screen` is an app route name, so this module owns the
 * translation into the names used in `navigation/routes.js`. Keep it pure and
 * defensive — it runs against attacker-influenceable push content.
 */

/** `data.screen` hint → route name in `navigation/routes.js`. */
const SCREEN_TO_ROUTE = {
  'order-detail': 'Details',
  'order-details': 'Details',
  'order-tracking': 'OrderTrackingScreen',
  'order-summary': 'OrderSummaryScreen',
  orders: 'OrdersScreen',
  'canceled-orders': 'CanceledOrdersScreen',
  invoice: 'Invoice',
  wallet: 'TransactionsScreen',
  transactions: 'TransactionsScreen',
  payment: 'PaymentScreen',
  messages: 'MessageScreen',
  chat: 'ChatRoom',
  rates: 'RateListScreen',
  profile: 'Profile',
  'organization-profile': 'OrganizationProfile',
  'org-contract': 'OrganizationContract',
  club: 'Club',
  home: 'FolderScreen',
};

/** Fallback when `data.screen` is absent/unknown but `data.type` is known. */
const TYPE_TO_ROUTE = {
  order_status: 'Details',
  order_created: 'Details',
  order_assigned: 'Details',
  order_canceled: 'Details',
  order_rescheduled: 'Details',
  order_updated: 'Details',
  payment_status: 'TransactionsScreen',
  wallet_credit: 'TransactionsScreen',
  chat_message: 'ChatRoom',
};

/**
 * Route params, keyed by route name, built from known `data` fields.
 * Only whitelisted keys are forwarded — never spread the whole payload.
 */
function paramsForRoute(routeName, data) {
  switch (routeName) {
    case 'Details':
    case 'OrderTrackingScreen':
    case 'OrderSummaryScreen':
    case 'Invoice': {
      const orderId = data.order_id ?? data.orderId ?? data.id;
      return orderId != null ? { orderId: String(orderId) } : {};
    }
    case 'ChatRoom': {
      const roomId = data.room_id ?? data.chat_id ?? data.order_id;
      return roomId != null ? { roomId: String(roomId) } : {};
    }
    default:
      return {};
  }
}

/**
 * @param {Record<string, unknown> | null | undefined} data
 * @returns {{ name: string, params: object } | null}
 */
export function resolveNotificationTarget(data) {
  if (!data || typeof data !== 'object') return null;

  const screen = typeof data.screen === 'string' ? data.screen.trim().toLowerCase() : null;
  const type = typeof data.type === 'string' ? data.type.trim().toLowerCase() : null;

  const routeName = (screen && SCREEN_TO_ROUTE[screen]) || (type && TYPE_TO_ROUTE[type]) || null;

  if (!routeName) return null;

  return { name: routeName, params: paramsForRoute(routeName, data) };
}

/**
 * Normalise the different message shapes (RNFirebase remote message,
 * expo-notifications response, web push) down to a plain `data` object.
 */
export function extractData(message) {
  if (!message || typeof message !== 'object') return null;
  // RNFirebase remote message
  if (message.data && typeof message.data === 'object') return message.data;
  // expo-notifications response
  const req = message.notification?.request ?? message.request;
  const content = req?.content;
  if (content?.data && typeof content.data === 'object') return content.data;
  return null;
}

export const __testables = { SCREEN_TO_ROUTE, TYPE_TO_ROUTE, paramsForRoute };
