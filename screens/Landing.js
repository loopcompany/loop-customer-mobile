import React, { useEffect, useState } from 'react';
import {View,Text,ActivityIndicator,StyleSheet,} from 'react-native';
import { useDispatch } from 'react-redux';

import { setToken } from '../slices/authSlice';
import { fetchUser } from '../slices/userSlice';
import TokenManager from '../services/TokenManager';
import CustomStatusBar from '../components/CustomStatusBar';
import { themeColor0, themeColor10 } from '../theme/Color';
import { fetchAddresses } from '../slices/addressSlice';
import { ImageBackground } from 'expo-image';
import NewStyles from '../styles/NewStyles';

export default function Landing({ navigation }) {
  const dispatch = useDispatch();
  const [checking, setChecking] = useState(true);

  // Check authentication on component mount
  useEffect(() => {
    checkAuthenticationStatus();
  }, []);

  const checkAuthenticationStatus = async () => {
    try {
      console.log('🔍 Landing: Checking authentication status...');

      // Use TokenManager to check authentication
      const authStatus = await TokenManager.isAuthenticated();

      if (authStatus.authenticated) {
        console.log('✅ Landing: User is authenticated');

        // Set token in Redux
        dispatch(setToken(authStatus.token));
        dispatch(fetchAddresses(authStatus.token));
        await dispatch(fetchUser(authStatus.token));
        // Fetch user data if needed
        if (authStatus.user) {
          console.log('✅ Landing: User data available, redirecting to main app');
          navigateToMainApp();
        } else {
          // Try to fetch user data
          const userResult = await dispatch(fetchUser(authStatus.token));

          if (fetchUser.fulfilled.match(userResult)) {
            console.log('✅ Landing: User data loaded, redirecting to main app');
            navigateToMainApp();
          } else {
            console.log('❌ Landing: Failed to load user data');
            navigateToWelcome();
          }
        }
      } else {
        console.log('📝 Landing: User not authenticated:', authStatus.reason);
        navigateToWelcome();
      }

    } catch (error) {
      console.error('❌ Landing: Auth check failed:', error);
      navigateToWelcome();
    }
  };

  // Navigate to Welcome screen (auth flow)
  const navigateToWelcome = () => {
    setTimeout(() => {
      setChecking(false);
      navigation.replace('Welcome');
    }, 1000); // Small delay for better UX
  };

  // Navigate to main app (FolderScreen)
  const navigateToMainApp = () => {
    setTimeout(() => {
      setChecking(false);
      navigation.replace('FolderScreen');
    }, 1000);
  };

  return (
    <ImageBackground source={require('../assets/moon.jpg')} style={[NewStyles.container, { backgroundColor: '#020305' }]} contentPosition={'center'} contentFit="contain" cachePolicy={'memory-disk'} >
      <CustomStatusBar />
      <View style={styles.container}>
        {/* Loading Section */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={themeColor0.bgColor(1)}
            style={styles.spinner}
          />
          <Text style={styles.loadingText}>
            در حال بررسی وضعیت ورود...
          </Text>
          <Text style={styles.subText}>
            لطفاً چند لحظه صبر کنید
          </Text>
        </View>

        {/* App Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.appName}>لوپ</Text>
          <Text style={styles.appTagline}>پلتفرم خدمات فنی</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  spinner: {
    marginBottom: 10,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'VazirBold',
    textAlign: 'center',
  },
  subText: {
    color: themeColor10.bgColor(0.8),
    fontSize: 14,
    fontFamily: 'VazirLight',
    textAlign: 'center',
  },
  infoContainer: {
    alignItems: 'center',
    gap: 5,
    marginBottom: 40,
  },
  appName: {
    color: '#ffffff',
    fontSize: 24,
    fontFamily: 'VazirBold',
    textAlign: 'center',
  },
  appTagline: {
    color: themeColor10.bgColor(0.9),
    fontSize: 14,
    fontFamily: 'VazirLight',
    textAlign: 'center',
  },
});