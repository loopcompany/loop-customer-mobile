// services/ReviewApi.js - Review API Service
import axios from 'axios';
import { uri } from './URL';

/**
 * ثبت نظر برای سفارش
 * @param {Object} reviewData 
 * @param {number} reviewData.technician_id - شناسه تکنسین
 * @param {number} reviewData.order_id - شناسه سفارش
 * @param {number} reviewData.application_rate - امتیاز اپلیکیشن (1-5)
 * @param {number} reviewData.technician_rate - امتیاز تکنسین (1-5)
 * @param {number} reviewData.support_rate - امتیاز پشتیبانی (1-5)
 * @param {string} reviewData.description - توضیحات (اختیاری)
 * @param {string} token - توکن احراز هویت
 * @returns {Promise}
 */
export const submitReview = async (reviewData, token) => {
  try {
    const response = await axios.post(
      `${uri}/reviews`,
      reviewData,
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
 * دریافت نظرات یک تکنسین (Public API)
 * @param {number} technicianId - شناسه تکنسین
 * @param {number} perPage - تعداد نظرات در هر صفحه (پیش‌فرض: 20)
 * @returns {Promise}
 */
export const getTechnicianReviews = async (technicianId, perPage = 20) => {
  try {
    const response = await axios.get(
      `${uri}/reviews/technician/${technicianId}?per_page=${perPage}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * دریافت نظرات خود کاربر
 * @param {string} token - توکن احراز هویت
 * @param {number} perPage - تعداد نظرات در هر صفحه (پیش‌فرض: 20)
 * @returns {Promise}
 */
export const getMyReviews = async (token, perPage = 20) => {
  try {
    const response = await axios.get(
      `${uri}/reviews/my-reviews?per_page=${perPage}`,
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

/**
 * بررسی وجود نظر برای یک سفارش خاص
 * @param {string} token - توکن احراز هویت
 * @param {number} orderId - شناسه سفارش
 * @returns {Promise<Object|null>} نظر پیدا شده یا null
 */
export const checkReviewForOrder = async (token, orderId) => {
  try {
    const response = await getMyReviews(token);
    
    if (response?.success && response?.data?.reviews) {
      const existingReview = response.data.reviews.find(
        review => review.order_id == orderId
      );
      return existingReview || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error checking review for order:', error);
    return null;
  }
};

export default {
  submitReview,
  getTechnicianReviews,
  getMyReviews,
  checkReviewForOrder
};
