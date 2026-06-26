import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform, SafeAreaView, } from 'react-native';
import { useDispatch } from 'react-redux';

import { setToken, setUserType } from '../slices/authSlice';
import { fetchUser } from '../slices/userSlice';
import TokenManager from '../services/TokenManager';
import CustomStatusBar from '../components/CustomStatusBar';
import { themeColor0, themeColor10 } from '../theme/Color';
import { fetchAddresses } from '../slices/addressSlice';
import { ImageBackground } from 'expo-image';
import NewStyles, { deviceHeight, deviceWidth } from '../styles/NewStyles';
import { fetchRadii } from '../slices/radiusSlice';
import i18n from 'i18next';
import { setLanguage } from '../slices/languageSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchPdfDocs } from '../slices/pdfDocumentSlice';
import { fetchMinPrice } from '../slices/minPriceSlice';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { useEvent } from 'expo';

export default function Landing({ navigation }) {
  const dispatch = useDispatch();
  const [checking, setChecking] = useState(true);
  const player = useVideoPlayer(require('../assets/video/InShot_20260626_171217014.mp4'), player => {
    console.log("player ready");
    if(Platform.OS==='web'){

      player.muted = true;
    }
    player.play();
  });
  // Check authentication on component mount
  useEffect(() => {

    dispatch(fetchRadii())
    dispatch(fetchPdfDocs())
    dispatch(fetchMinPrice())

  }, []);

  const checkAuthenticationStatus = async () => {
    try {
      // Use TokenManager to check authentication
      const authStatus = await TokenManager.isAuthenticated();

      if (authStatus.authenticated) {
        dispatch(setToken(authStatus.token));
        dispatch(fetchAddresses(authStatus.token));
        await dispatch(fetchUser(authStatus.token));
        if (authStatus.user) {
          if (authStatus.user?.account_type !== 'individual') {
            dispatch(setUserType('organization'))
          } else {
            dispatch(setUserType('individual'))
          }
          navigateToMainApp();
        } else {
          const userResult = await dispatch(fetchUser(authStatus.token));
          if (userResult?.payload?.account_type !== 'individual') {
            dispatch(setUserType('organization'))
          } else {
            dispatch(setUserType('individual'))
          }

          if (fetchUser.fulfilled.match(userResult)) {
            navigateToMainApp();
          } else {
            navigateToWelcome();
          }
        }
      } else {
        navigateToWelcome();
      }

    } catch (error) {
      navigateToWelcome();
    }
  };

  // Navigate to Welcome screen (auth flow)
  const navigateToWelcome = () => {
    setChecking(false);
    navigation.replace('Welcome');
  };

  // Navigate to main app (FolderScreen)
  const navigateToMainApp = () => {
    setChecking(false);
    navigation.replace('FolderScreen');
  };


  useEffect(() => {
    const subscription = player.addListener('playToEnd', () => {
      // ۲. بعد از اتمام ویدیو به صفحه بعد بروید
      // navigation.replace('Welcome');
      checkAuthenticationStatus();
    });

    return () => {
      subscription.remove();
    };
  }, [player]);
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing }); 
  useEffect(() => {
    if (Platform.OS === 'web' && !isPlaying && player) {
      player.play();
      

    }
  }, [player, isPlaying])

  return (
    <SafeAreaView style={NewStyles.container}>
      <CustomStatusBar />
      <LinearGradient colors={['#1c2833', '#0b0d11', '#0b0d11']} style={{ flex: 1 }}>

        <VideoView style={{ flex: 1 }} nativeControls={false} player={player} contentFit='contain' allowsFullscreen allowsPictureInPicture />
      </LinearGradient>
    </SafeAreaView >
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