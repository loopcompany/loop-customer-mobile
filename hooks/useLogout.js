import { useState } from 'react';
import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import TokenManager from '../services/TokenManager';
import { setToken } from '../slices/authSlice';

// Custom hook for logout functionality
export const useLogout = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Simple logout
  const logout = async () => {
    try {
      setIsLoggingOut(true);
      
      const result = await TokenManager.logout();
      
      if (result.success) {
        // Clear Redux state
        dispatch(setToken(null));
        
        // Navigate to Welcome screen
        navigation.replace('Welcome');
        
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Logout with confirmation dialog
  const logoutWithConfirmation = () => {
    Alert.alert(
      'خروج از حساب کاربری',
      'آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟',
      [
        {
          text: 'انصراف',
          style: 'cancel',
        },
        {
          text: 'خروج',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await logout();
              Alert.alert('موفق', result.message);
            } catch (error) {
              Alert.alert('خطا', error.message || 'خطای غیرمنتظره در خروج');
            }
          },
        },
      ]
    );
  };

  // Logout from all devices
  const logoutFromAllDevices = async () => {
    try {
      setIsLoggingOut(true);
      
      const result = await TokenManager.logoutFromAllDevices();
      
      if (result.success) {
        // Clear Redux state
        dispatch(setToken(null));
        
        // Navigate to Welcome screen
        navigation.replace('Welcome');
        
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Logout all error:', error);
      throw error;
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Logout from all devices with confirmation
  const logoutFromAllDevicesWithConfirmation = () => {
    Alert.alert(
      'خروج از همه دستگاه‌ها',
      'آیا می‌خواهید از همه دستگاه‌هایی که با این حساب وارد شده‌اند خارج شوید؟',
      [
        {
          text: 'انصراف',
          style: 'cancel',
        },
        {
          text: 'خروج از همه',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await logoutFromAllDevices();
              Alert.alert('موفق', result.message);
            } catch (error) {
              Alert.alert('خطا', error.message || 'خطای غیرمنتظره در خروج از همه دستگاه‌ها');
            }
          },
        },
      ]
    );
  };

  // Force logout (clear local data without API call)
  const forceLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      const result = await TokenManager.forceLogout();
      
      // Clear Redux state
      dispatch(setToken(null));
      
      // Navigate to Welcome screen
      navigation.replace('Welcome');
      
      return result;
    } catch (error) {
      console.error('Force logout error:', error);
      throw error;
    } finally {
      setIsLoggingOut(false);
    }
  };

  return {
    logout,
    logoutWithConfirmation,
    logoutFromAllDevices,
    logoutFromAllDevicesWithConfirmation,
    forceLogout,
    isLoggingOut,
  };
};

export default useLogout;