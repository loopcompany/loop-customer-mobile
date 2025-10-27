// CategoriesApi.js
import axios from 'axios';
import { uri } from './URL';

const categoriesAPI = {
  getCategories: async () => {
    try {
      const response = await axios.get(`${uri}/categories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
  
  getSubCategories: async (categoryId) => {
    try {
      const response = await axios.get(`${uri}/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      throw error;
    }
  }
};

export default categoriesAPI;
