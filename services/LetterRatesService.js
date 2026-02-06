// LetterRatesApi.js
import axios from 'axios';
import { uri } from './URL';

const letterRatesCategoryAPI = {
  // دریافت لیست نرخ‌های نامه
  getLetterRatesCategory: async () => {
    try {
      const response = await axios.get(`${uri}/info/letter-rate-categories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching letter rates categories:', error);
      throw error;
    }
  }
};

export default letterRatesCategoryAPI;