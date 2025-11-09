import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setToken, removeToken, setAuthLoading, setUserType } from '../slices/authSlice';
import { fetchUser } from '../slices/userSlice';
import TokenManager from '../services/TokenManager';
import CustomStatusBar from '../components/CustomStatusBar';
import { themeColor0 } from '../theme/Color';

// Create Auth Context
const AuthContext = createContext({});

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { token, isAuthenticated, isLoading } = useSelector(state => state.auth);
  const { data: userData, loading: userLoading } = useSelector(state => state.user);
  
  const [initializing, setInitializing] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  // Initialize authentication on app start
  const initializeAuth = async () => {
    try {
      console.log('🚀 App starting - checking authentication...');
      dispatch(setAuthLoading(true));
      
      const authCheck = await TokenManager.isAuthenticated();
      
      if (authCheck.authenticated) {
        console.log('✅ Found valid token, authenticating user...');
        
        // Set token in Redux
        dispatch(setToken(authCheck.token));
        
        // Restore userType from AsyncStorage
        const accountType = await AsyncStorage.getItem('accountType');
        if (accountType) {
          dispatch(setUserType(accountType));
          console.log('✅ User type restored:', accountType);
        }
        
        // Fetch user data
        const userResult = await dispatch(fetchUser(authCheck.token));
        
        if (fetchUser.fulfilled.match(userResult)) {
          console.log('✅ User authenticated successfully');
        } else {
          console.log('❌ Failed to fetch user data, clearing auth');
          dispatch(removeToken());
          await TokenManager.clearAuthData();
        }
      } else {
        console.log('📝 No valid authentication found');
        dispatch(removeToken());
        
        // Handle special cases
        if (authCheck.requiresVerification) {
          console.log('📱 User needs phone verification');
        }
      }
    } catch (error) {
      console.error('❌ Auth initialization failed:', error);
      dispatch(removeToken());
      await TokenManager.clearAuthData();
    } finally {
      dispatch(setAuthLoading(false));
      setInitializing(false);
      setAuthReady(true);
    }
  };

  // Login function
  const login = async (token, userData) => {
    try {
      console.log('🔑 Processing login...');
      
      // Save to AsyncStorage
      const saved = await TokenManager.saveAuthData(token, userData);
      
      if (!saved) {
        throw new Error('Failed to save authentication data');
      }
      
      // Update Redux state
      dispatch(setToken(token));
      
      // Fetch fresh user data
      await dispatch(fetchUser(token));
      
      console.log('✅ Login completed successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Login failed:', error);
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('🚪 Processing logout...');
      
      // Clear AsyncStorage
      await TokenManager.clearAuthData();
      
      // Clear Redux state
      dispatch(removeToken());
      
      console.log('✅ Logout completed');
      return { success: true };
    } catch (error) {
      console.error('❌ Logout failed:', error);
      return { success: false, error: error.message };
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Show loading screen while initializing
  if (initializing || !authReady) {
    return (
      <View style={styles.loadingContainer}>
        <CustomStatusBar />
        <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
        <Text style={styles.loadingText}>در حال بررسی وضعیت ورود...</Text>
      </View>
    );
  }

  // Provide auth context to children
  return (
    <AuthContext.Provider
      value={{
        // State
        isAuthenticated,
        isLoading: isLoading || userLoading,
        token,
        userData,
        authReady,
        
        // Functions
        login,
        logout,
        initializeAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    gap: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'VazirLight',
  },
});

export default AuthProvider;