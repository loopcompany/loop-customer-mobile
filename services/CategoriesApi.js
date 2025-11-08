// CategoriesApi.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uri } from './URL';

const categoriesAPI = {
  getCategories: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${uri}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
  
  getSubCategories: async (categoryId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${uri}/categories/${categoryId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      throw error;
    }
  }
};

export default categoriesAPI;
