// LetterRatesApi.js
import axios from 'axios';
import { uri } from './URL';

const letterRatesAPI = {
  // دریافت لیست نرخ‌های نامه
  getLetterRates: async (id) => {
    try {
      const response = await axios.get(`${uri}/info/letter-rates/category/${id}`);
      return response.data?.data;
    } catch (error) {
      console.error('Error fetching letter rates:', error);
      throw error;
    }
  }
};

export default letterRatesAPI;