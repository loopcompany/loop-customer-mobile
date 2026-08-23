import axios from './axiosConfig';
import { API_BASE_URL } from './URL';

export const notificationAPI = {
  sendOrderConfirmation: async (orderId, orderData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/notifications/send-order-confirmation`, {
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
      const response = await axios.post(`${API_BASE_URL}/api/notifications/send-status-update`, {
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
      const response = await axios.post(`${API_BASE_URL}/api/notifications/send-payment-confirmation`, {
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
      const response = await axios.get(`${API_BASE_URL}/api/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting notification status:', error);
      throw error;
    }
  },

  resendNotification: async (notificationId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/notifications/${notificationId}/resend`);
      return response.data;
    } catch (error) {
      console.error('Error resending notification:', error);
      throw error;
    }
  },
};

export default notificationAPI;
