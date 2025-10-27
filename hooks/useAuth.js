import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setToken, removeToken, setAuthLoading, setAuthError } from '../slices/authSlice';
import { fetchUser } from '../slices/userSlice';
import TokenManager from '../services/TokenManager';

// Custom hook for authentication management
export const useAuth = () => {
  const dispatch = useDispatch();
  const { token, isAuthenticated, isLoading, authError } = useSelector(state => state.auth);
  const { data: userData, loading: userLoading } = useSelector(state => state.user);
  
  const [initializing, setInitializing] = useState(true);

  // Initialize authentication on app start
  const initializeAuth = async () => {
    try {
      dispatch(setAuthLoading(true));
      console.log('🔄 Initializing authentication...');
      
      const authCheck = await TokenManager.isAuthenticated();
      
      if (authCheck.authenticated) {
        console.log('✅ User is authenticated, setting up state...');
        
        // Set token in Redux
        dispatch(setToken(authCheck.token));
        
        // Fetch user data
        const userResult = await dispatch(fetchUser(authCheck.token));
        
        if (fetchUser.fulfilled.match(userResult)) {
          console.log('✅ User data loaded successfully');
        } else {
          console.log('❌ Failed to load user data');
        }
        
        return { authenticated: true, user: authCheck.user };
      } else {
        console.log('❌ User not authenticated:', authCheck.reason);
        
        // Clear any invalid tokens
        dispatch(removeToken());
        
        return { 
          authenticated: false, 
          reason: authCheck.reason,
          requiresVerification: authCheck.requiresVerification
        };
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      dispatch(setAuthError('خطا در بررسی وضعیت ورود'));
      dispatch(removeToken());
      return { authenticated: false, reason: 'initialization_error' };
    } finally {
      dispatch(setAuthLoading(false));
      setInitializing(false);
    }
  };

  // Login function
  const login = async (token, userData) => {
    try {
      console.log('🔑 Logging in user...');
      
      // Save to AsyncStorage
      const saved = await TokenManager.saveAuthData(token, userData);
      
      if (saved) {
        // Update Redux state
        dispatch(setToken(token));
        
        // Fetch fresh user data
        await dispatch(fetchUser(token));
        
        console.log('✅ Login successful');
        return { success: true };
      } else {
        throw new Error('Failed to save authentication data');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      dispatch(setAuthError('خطا در ذخیره اطلاعات ورود'));
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('🚪 Logging out user...');
      
      // Clear AsyncStorage
      await TokenManager.clearAuthData();
      
      // Clear Redux state
      dispatch(removeToken());
      
      console.log('✅ Logout successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  // Refresh authentication
  const refreshAuth = async () => {
    if (token) {
      console.log('🔄 Refreshing authentication...');
      await dispatch(fetchUser(token));
    }
  };

  // Check if token is valid
  const validateCurrentToken = async () => {
    if (!token) return { valid: false };
    
    try {
      const validation = await TokenManager.validateToken(token);
      
      if (!validation.valid) {
        // Token is invalid, logout
        await logout();
      }
      
      return validation;
    } catch (error) {
      console.log('❌ Token validation error:', error);
      await logout();
      return { valid: false };
    }
  };

  // Auto-initialize on hook mount
  useEffect(() => {
    initializeAuth();
  }, []);

  return {
    // State
    isAuthenticated,
    isLoading: isLoading || userLoading,
    initializing,
    token,
    userData,
    authError,
    
    // Functions
    initializeAuth,
    login,
    logout,
    refreshAuth,
    validateCurrentToken,
  };
};

export default useAuth;