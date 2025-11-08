import axios from 'axios';
import { uri } from './URL';

// دریافت لیست پاداش‌های گردونه شانس
export const getGemActions = async (token) => {
  try {
    const response = await axios.get(`${uri}/gems/actions`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// شرکت در گردونه شانس
export const spinWheel = async (token) => {
  try {
    const response = await axios.post(`${uri}/gems/spin`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// دریافت تاریخچه امتیازات
export const getGemHistory = async (token, perPage = 20) => {
  try {
    const response = await axios.get(`${uri}/gems/history`, {
      params: { per_page: perPage },
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// بررسی امکان شرکت در گردونه
export const canPlayWheel = async (token) => {
  try {
    const response = await axios.get(`${uri}/gems/can-play`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
