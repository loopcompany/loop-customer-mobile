// Order / payment confirmation notifications (SMS + push fan-out on the backend).
//
// This module used to import a non-existent `API_BASE_URL` from './URL' (which
// only ever exported `mainUri` / `uri` / `imageUri`). Every template literal
// therefore built the string "undefined/api/notifications/...". On web that is a
// *relative* URL, so it silently resolved against the dev origin and returned
// the SPA's index.html instead of failing loudly; on iOS/Android there is no
// origin to resolve against, so axios rejected every call and "ثبت نهایی سفارش"
// failed 100% of the time on device. Use the shared API base instead.
import axios from './axiosConfig';
import { uri } from './URL';

export const notificationAPI = {
  sendOrderConfirmation: async (orderId, orderData) => {
    try {
      const response = await axios.post(`${uri}/notifications/send-order-confirmation`, {
        order_id: orderId,
        phone: orderData.phone,
        order_type: orderData.type,
        order_date: orderData.date,
        customer_name: orderData.customerName,
        ...orderData,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending order confirmation:', error);
      throw error;
    }
  },

  sendOrderStatus: async (orderId, status, message) => {
    try {
      const response = await axios.post(`${uri}/notifications/send-status-update`, {
        order_id: orderId,
        status: status,
        message: message,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending status update:', error);
      throw error;
    }
  },

  sendPaymentConfirmation: async (transactionId, amount, phone) => {
    try {
      const response = await axios.post(`${uri}/notifications/send-payment-confirmation`, {
        transaction_id: transactionId,
        amount: amount,
        phone: phone,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending payment confirmation:', error);
      throw error;
    }
  },

  getNotificationStatus: async (notificationId) => {
    try {
      const response = await axios.get(`${uri}/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting notification status:', error);
      throw error;
    }
  },

  resendNotification: async (notificationId) => {
    try {
      const response = await axios.post(`${uri}/notifications/${notificationId}/resend`);
      return response.data;
    } catch (error) {
      console.error('Error resending notification:', error);
      throw error;
    }
  },
};

export default notificationAPI;
