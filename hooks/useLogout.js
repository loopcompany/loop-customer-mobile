import { useState } from 'react';
import { Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import TokenManager from '../services/TokenManager';
import { setToken, setUserType } from '../slices/authSlice';
import { clearOrganizationData } from '../slices/organizationSlice';
import { showAlert } from '../helpers/Common';

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
        dispatch(setUserType(null));
        dispatch(clearOrganizationData());
        
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
  const logoutWithConfirmation = (options = {}) => {
    if (Platform.OS === 'web') {
      // Use window.confirm for web
      if (typeof window !== 'undefined' && window.confirm) {
        const confirmed = window.confirm('آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟');
        
        if (confirmed) {
          logout()
            .then((result) => {
              if (typeof options.onSuccess === 'function') {
                try { options.onSuccess(); } catch {}
              }
              if (window.alert) {
                window.alert(result.message || 'با موفقیت خارج شدید');
              }
              // Navigate to Welcome screen after alert
              if (navigation.replace) {
                navigation.replace('Welcome');
              } else {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Welcome' }],
                });
              }
            })
            .catch((error) => {
              if (window.alert) {
                window.alert(error.message || 'خطای غیرمنتظره در خروج');
              }
            });
        }
      } else {
        // Fallback: just logout without confirmation
        console.warn('window.confirm not available, logging out without confirmation');
        logout()
          .then(() => {
            if (typeof options.onSuccess === 'function') {
              try { options.onSuccess(); } catch {}
            }
            if (navigation.replace) {
              navigation.replace('Welcome');
            } else {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            }
          })
          .catch(error => console.error('Logout error:', error));
      }
    } else {
      // Use Alert.alert for mobile
      showAlert(
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
                if (typeof options.onSuccess === 'function') {
                  try { options.onSuccess(); } catch {}
                }
                showAlert('موفق', result.message, [
                  {
                    text: 'باشه',
                    onPress: () => {
                      // Navigate to Welcome screen after showing alert
                      if (navigation.replace) {
                        navigation.replace('Welcome');
                      } else {
                        navigation.reset({
                          index: 0,
                          routes: [{ name: 'Welcome' }],
                        });
                      }
                    }
                  }
                ]);
              } catch (error) {
                showAlert('خطا', error.message || 'خطای غیرمنتظره در خروج');
              }
            },
          },
        ]
      );
    }
  };

  // Logout from all devices
  const logoutFromAllDevices = async () => {
    try {
      setIsLoggingOut(true);
      
      const result = await TokenManager.logoutFromAllDevices();
      
      if (result.success) {
        // Clear Redux state
        dispatch(setToken(null));
        dispatch(setUserType(null));
        dispatch(clearOrganizationData());
        
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
    if (Platform.OS === 'web') {
      // Use window.confirm for web
      if (typeof window !== 'undefined' && window.confirm) {
        const confirmed = window.confirm('آیا می‌خواهید از همه دستگاه‌هایی که با این حساب وارد شده‌اند خارج شوید؟');
        
        if (confirmed) {
          logoutFromAllDevices()
            .then((result) => {
              if (window.alert) {
                window.alert(result.message || 'با موفقیت از همه دستگاه‌ها خارج شدید');
              }
              // Navigate to Welcome screen after alert
              if (navigation.replace) {
                navigation.replace('Welcome');
              } else {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Welcome' }],
                });
              }
            })
            .catch((error) => {
              if (window.alert) {
                window.alert(error.message || 'خطای غیرمنتظره در خروج از همه دستگاه‌ها');
              }
            });
        }
      } else {
        // Fallback: just logout without confirmation
        console.warn('window.confirm not available, logging out from all devices without confirmation');
        logoutFromAllDevices()
          .then(() => {
            if (navigation.replace) {
              navigation.replace('Welcome');
            } else {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            }
          })
          .catch(error => console.error('Logout all error:', error));
      }
    } else {
      // Use Alert.alert for mobile
      showAlert(
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
                showAlert('موفق', result.message, [
                  {
                    text: 'باشه',
                    onPress: () => {
                      // Navigate to Welcome screen after showing alert
                      if (navigation.replace) {
                        navigation.replace('Welcome');
                      } else {
                        navigation.reset({
                          index: 0,
                          routes: [{ name: 'Welcome' }],
                        });
                      }
                    }
                  }
                ]);
              } catch (error) {
                showAlert('خطا', error.message || 'خطای غیرمنتظره در خروج از همه دستگاه‌ها');
              }
            },
          },
        ]
      );
    }
  };

  // Force logout (clear local data without API call)
  const forceLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      const result = await TokenManager.forceLogout();
      
      // Clear Redux state
      dispatch(setToken(null));
      
      // Navigate to Welcome screen
      if (navigation.replace) {
        navigation.replace('Welcome');
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      }
      
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
