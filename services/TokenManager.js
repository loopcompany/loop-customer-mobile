import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from './Api';
import i18next from 'i18next';
import { unregisterForPushNotifications } from './notifications';

// Token Management Service
export class TokenManager {
  static TOKEN_KEY = 'userToken';
  static USER_DATA_KEY = 'user_data';
  static SESSION_TOKEN_KEY = 'sessionToken'; // For temporary session storage
  static SESSION_USER_DATA_KEY = 'sessionUserData'; // For temporary session storage

  // Save token to AsyncStorage
  static async saveToken(token) {
    try {
      await AsyncStorage.setItem(this.TOKEN_KEY, token);
      console.log('✅ Token saved to AsyncStorage');
      return true;
    } catch (error) {
      console.error('❌ Error saving token:', error);
      return false;
    }
  }

  // Get token from AsyncStorage (checks both permanent and session storage)
  static async getToken() {
    try {
      // First check permanent storage
      let token = await AsyncStorage.getItem(this.TOKEN_KEY);
      if (token) {
        return token;
      }

      // If not found, check session storage
      token = await AsyncStorage.getItem(this.SESSION_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('❌ Error getting token:', error);
      return null;
    }
  }

  // Save user data to AsyncStorage
  static async saveUserData(userData) {
    try {
      await AsyncStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
      console.log('✅ User data saved to AsyncStorage');
      return true;
    } catch (error) {
      console.error('❌ Error saving user data:', error);
      return false;
    }
  }

  // Get user data from AsyncStorage (checks both permanent and session storage)
  static async getUserData() {
    try {
      // First check permanent storage
      let userData = await AsyncStorage.getItem(this.USER_DATA_KEY);
      if (userData) {
        return JSON.parse(userData);
      }

      // If not found, check session storage
      userData = await AsyncStorage.getItem(this.SESSION_USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Error getting user data:', error);
      return null;
    }
  }

  // Validate token with server
  static async validateToken(token) {
    try {
      if (!token) {
        console.log('❌ No token provided for validation');
        return { valid: false, error: 'No token' };
      }

      console.log('🔍 Validating token with server...');
      const response = await authAPI.validateToken(token);

      if (response.success && response.valid) {
        console.log('✅ Token is valid');

        // Update user data if provided
        if (response.data?.user) {
          await this.saveUserData(response.data.user);
        }

        return {
          valid: true,
          user: response.data?.user,
          tokenInfo: response.data?.token_info,
        };
      } else {
        console.log('❌ Token validation failed:', response.message);
        return {
          valid: false,
          error: response.message,
          requiresVerification: response.requires_verification,
        };
      }
    } catch (error) {
      console.log('❌ Token validation error:', error);

      // Handle different error types
      if (error.response?.status === 401) {
        return { valid: false, error: 'Token expired or invalid' };
      } else if (error.response?.status === 403) {
        return {
          valid: false,
          error: 'Access denied',
          requiresVerification: error.response?.data?.requires_verification,
        };
      }

      return { valid: false, error: 'Validation failed' };
    }
  }

  // Check if user is authenticated (has valid token)
  static async isAuthenticated() {
    try {
      const token = await this.getToken();

      if (!token) {
        console.log('📝 No token found in storage');
        return { authenticated: false, reason: 'no_token' };
      }

      console.log('🔍 Checking token validity...');
      const validation = await this.validateToken(token);

      if (validation.valid) {
        console.log('✅ User is authenticated');
        return {
          authenticated: true,
          token,
          user: validation.user,
          tokenInfo: validation.tokenInfo,
        };
      } else {
        console.log('❌ Token is invalid, removing from storage');
        await this.clearAuthData();
        return {
          authenticated: false,
          reason: validation.error,
          requiresVerification: validation.requiresVerification,
        };
      }
    } catch (error) {
      console.error('❌ Authentication check failed:', error);
      await this.clearAuthData();
      return { authenticated: false, reason: 'check_failed' };
    }
  }

  // Clear all authentication data
  static async clearAuthData() {
    try {
      // Remove this device's push token from the backend *before* the bearer
      // token is gone from storage — otherwise the DELETE call is unauthenticated.
      // Best-effort: this never throws and must not block logout.
      await unregisterForPushNotifications();

      await AsyncStorage.multiRemove([
        this.TOKEN_KEY,
        this.USER_DATA_KEY,
        this.SESSION_TOKEN_KEY, // Clear session token
        this.SESSION_USER_DATA_KEY, // Clear session user data
        'autoLoginEnabled', // Clear auto-login flag
        'savedPhone', // Clear saved phone
        'rememberLogin', // Clear remember login flag
        'accountType', // Clear account type (organization/individual)
        'userType', // Clear user type
        'organizationData', // Clear organization data
        'organizationCode', // Clear organization code
      ]);
      console.log('🗑️ All authentication data and auto-login settings cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing auth data:', error);
      return false;
    }
  }

  // Save complete authentication data (token + user)
  static async saveAuthData(token, userData) {
    try {
      const saveResults = await Promise.all([this.saveToken(token), this.saveUserData(userData)]);

      const allSaved = saveResults.every((result) => result === true);

      if (allSaved) {
        console.log('✅ Complete auth data saved successfully');
        return true;
      } else {
        console.error('❌ Some auth data failed to save');
        return false;
      }
    } catch (error) {
      console.error('❌ Error saving complete auth data:', error);
      return false;
    }
  }

  // Save session-only authentication data (for temporary login)
  static async saveSessionAuthData(token, userData) {
    try {
      const saveResults = await Promise.all([
        AsyncStorage.setItem(this.SESSION_TOKEN_KEY, token),
        AsyncStorage.setItem(this.SESSION_USER_DATA_KEY, JSON.stringify(userData)),
      ]);

      console.log('✅ Session auth data saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Error saving session auth data:', error);
      return false;
    }
  }

  // Get complete authentication state
  static async getAuthState() {
    try {
      const [token, userData] = await Promise.all([this.getToken(), this.getUserData()]);

      return {
        token,
        userData,
        hasToken: !!token,
        hasUserData: !!userData,
      };
    } catch (error) {
      console.error('❌ Error getting auth state:', error);
      return {
        token: null,
        userData: null,
        hasToken: false,
        hasUserData: false,
      };
    }
  }

  // Logout from current device
  static async logout() {
    try {
      const token = await this.getToken();

      if (!token) {
        // If no token, just clear local data
        await this.clearAuthData();
        return {
          success: true,
          message: 'خروج انجام شد',
        };
      }

      console.log('🚪 Logging out from current device...');

      // Call logout API
      const response = await authAPI.logout(token, i18next.language || 'en');

      // Always clear local data regardless of API response
      await this.clearAuthData();

      if (response && response.success) {
        console.log('✅ Logout successful');
        return {
          success: true,
          message: response.message || 'خروج انجام شد',
        };
      } else {
        console.log('⚠️ Logout API failed but local data cleared');
        return {
          success: true, // Still return success since local data is cleared
          message: 'خروج انجام شد',
        };
      }
    } catch (error) {
      console.error('❌ Logout error:', error);

      // Even if API fails, clear local data
      await this.clearAuthData();

      return {
        success: true, // Return success since local data is cleared
        message: 'خروج انجام شد',
      };
    }
  }

  // Logout from all devices
  static async logoutFromAllDevices() {
    try {
      const token = await this.getToken();

      if (!token) {
        return {
          success: false,
          message: 'کاربر وارد نشده است',
        };
      }

      console.log('🚪 Logging out from all devices...');

      const response = await authAPI.logoutAll(token);

      if (response && response.success) {
        // Clear local data only if API call was successful
        await this.clearAuthData();
        console.log('✅ Logout from all devices successful');
        return {
          success: true,
          message: response.message || 'خروج از همه دستگاه‌ها انجام شد',
        };
      } else {
        console.log('❌ Logout from all devices failed');
        return {
          success: false,
          message: response?.message || 'خطا در خروج از همه دستگاه‌ها',
        };
      }
    } catch (error) {
      console.error('❌ Logout all devices error:', error);
      return {
        success: false,
        message: 'خطا در خروج از همه دستگاه‌ها',
      };
    }
  }

  // Force clear all data (emergency logout)
  static async forceLogout() {
    try {
      console.log('🚨 Force logout - clearing all local data');
      await this.clearAuthData();
      return {
        success: true,
        message: 'خروج اجباری انجام شد',
      };
    } catch (error) {
      console.error('❌ Force logout error:', error);
      return {
        success: false,
        message: 'خطا در خروج اجباری',
      };
    }
  }
}

export default TokenManager;
