// services/WalletApi.js - Wallet & Transactions API Service
import axios from 'axios';
import { uri } from './URL';

/**
 * دریافت لیست تراکنش‌های کاربر
 * @param {string} token - توکن احراز هویت
 * @param {Object} params - پارامترهای فیلتر
 * @param {string} params.from_date - تاریخ شروع (Y-m-d)
 * @param {string} params.to_date - تاریخ پایان (Y-m-d)
 * @param {number} params.per_page - تعداد آیتم در هر صفحه (پیش‌فرض: 20، حداکثر: 100)
 * @param {number} params.page - شماره صفحه (پیش‌فرض: 1)
 * @returns {Promise}
 */
export const getTransactions = async (token, params = {}) => {
  try {
    // ساختن query string
    const queryParams = new URLSearchParams();
    
    if (params.from_date) queryParams.append('from_date', params.from_date);
    if (params.to_date) queryParams.append('to_date', params.to_date);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    if (params.page) queryParams.append('page', params.page);
    
    const queryString = queryParams.toString();
    const url = `${uri}/wallet/transactions${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * شارژ کیف پول
 * @param {string} token - توکن احراز هویت
 * @param {Object} chargeData 
 * @param {number} chargeData.amount - مبلغ شارژ به تومان
 * @param {string} chargeData.linking_url - URL بازگشت
 * @returns {Promise}
 */
export const chargeWallet = async (token, chargeData) => {
  try {
    const response = await axios.post(
      `${uri}/wallet/charge`,
      chargeData,
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * پرداخت سفارش از کیف پول
 * @param {string} token - توکن احراز هویت
 * @param {number} orderId - شناسه سفارش
 * @returns {Promise}
 */
export const payOrderFromWallet = async (token, orderId) => {
  try {
    const response = await axios.post(
      `${uri}/wallet/pay-order`,
      { order_id: orderId },
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * دریافت موجودی کیف پول
 * @param {string} token - توکن احراز هویت
 * @returns {Promise}
 */
export const getWalletBalance = async (token) => {
  try {
    const response = await axios.get(
      `${uri}/wallet/balance`,
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getTransactions,
  chargeWallet,
  payOrderFromWallet,
  getWalletBalance
};
