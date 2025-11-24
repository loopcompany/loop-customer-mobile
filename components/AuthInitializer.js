import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setToken, setUserType } from '../slices/authSlice';

/**
 * Component برای بازیابی token و userType از AsyncStorage در هنگام راه‌اندازی اپلیکیشن
 * این مشکل لاگ اوت شدن در reload صفحه را حل می‌کند
 */
const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const restoreAuth = async () => {
      try {
        // بازیابی token
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          dispatch(setToken(token));
        }

        // بازیابی userType
        const userType = await AsyncStorage.getItem('userType');
        if (userType) {
          dispatch(setUserType(userType));
        }
      } catch (error) {
        console.error('خطا در بازیابی اطلاعات احراز هویت:', error);
      }
    };

    restoreAuth();
  }, [dispatch]);

  return children;
};

export default AuthInitializer;
