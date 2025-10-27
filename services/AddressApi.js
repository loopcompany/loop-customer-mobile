// AddressApi.js
import axios from 'axios';
import { uri } from './URL';

const addressAPI = {
  // دریافت لیست آدرس‌ها
  getAddresses: async (token) => {
    try {
      const response = await axios.get(`${uri}/addresses`, {
        headers: { 
          'Accept': 'application/json', 
          'Authorization': `Bearer ${token}` 
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  },

  // ایجاد آدرس جدید
  createAddress: async (addressData, token) => {
    try {
      const response = await axios.post(`${uri}/addresses`, addressData, {
        headers: { 
          'Accept': 'application/json', 
          'Authorization': `Bearer ${token}` 
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  },

  // حذف آدرس
  deleteAddress: async (addressId, token) => {
    try {
      const response = await axios.delete(`${uri}/addresses/${addressId}`, {
        headers: { 
          'Accept': 'application/json', 
          'Authorization': `Bearer ${token}` 
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }
};

export default addressAPI;