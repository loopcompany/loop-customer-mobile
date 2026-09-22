import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useDispatch } from 'react-redux';

import { setToken, setUserType } from '@slices/authSlice';
import { fetchUser } from '@slices/userSlice';
import TokenManager from '@services/TokenManager';
import CustomStatusBar from '@components/CustomStatusBar';
import { themeColor0, themeColor10 } from '@theme/Color';
import { fetchAddresses } from '@slices/addressSlice';
import { ImageBackground } from 'expo-image';
import { fetchRadii } from '@slices/radiusSlice';
import i18n from 'i18next';
import { setLanguage } from '@slices/languageSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchPdfDocs } from '@slices/pdfDocumentSlice';
import { fetchMinPrice } from '@slices/minPriceSlice';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { useEvent } from 'expo';
import { getSmsHash } from '@screens/auth/OtpRetriever';
import { setHashApp } from '@slices/hashAppSlice';

// اگر ویدیوی اسپلش پخش نشود (کدک، شبکه، یا نرسیدن رویداد playToEnd روی دستگاه)
// کاربر برای همیشه روی صفحه‌ی سیاه می‌ماند. این سقف زمانی تضمین می‌کند که در هر
// شرایطی وارد اپ می‌شود.
const SPLASH_TIMEOUT_MS = 6000;

// سقفِ مطلق: حتی اگر بررسیِ توکن هم گیر کند (شبکه‌ی کند، تایم‌اوتِ ۱۰ ثانیه‌ای
// axios)، کاربر بعد از این مدت به هر حال وارد صفحه‌ی خانه می‌شود.
const SPLASH_MAX_MS = 15000;

// ابعاد واقعی فایل ویدیو (۷۲۰×۱۲۸۰). برای اینکه ویدیو دقیقاً وسط صفحه بنشیند،
// اندازه‌ی کادر را خودمان از روی همین نسبت حساب می‌کنیم؛ با `flex: 1` کادر به
// اندازه‌ی ناحیه‌ی امن کشیده می‌شد و ویدیو نسبت به *کل* صفحه پایین/بالا می‌افتاد.
//
// The splash video is 720x1280. Sizing the box from that ratio ourselves — and
// centring it against the full window rather than the safe area — is what puts
// it in the middle of the screen; `flex: 1` inside `SafeAreaView` centred it
// inside the inset area instead, which is visibly off on any device whose top
// and bottom insets differ.
const VIDEO_ASPECT_RATIO = 720 / 1280;

export default function Landing({ navigation }) {
  const dispatch = useDispatch();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [checking, setChecking] = useState(true);
  // نگهبان‌های تک‌بار-بودن: هم playToEnd و هم تایم‌اوت می‌توانند مسیر را ادامه دهند.
  const startedRef = React.useRef(false);
  const settledRef = React.useRef(false);
  const player = useVideoPlayer(require('@assets/video/InShot_20260626_171217014.mp4'), player => {
    console.log("player ready");
    if (Platform.OS === 'web') {

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
  
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    // getSmsHash() resolves to [] where the native module isn't linked
    // (Expo Go) instead of throwing, so no guard is needed here.
    getSmsHash().then(hashes => {
      dispatch(setHashApp(hashes))
      console.log('SMS hashes:', hashes);
    });
  }, []);

  const checkAuthenticationStatus = async () => {
    // هم رویداد پایان ویدیو و هم تایم‌اوت می‌توانند این را صدا بزنند؛ فقط یک بار اجرا شود.
    if (startedRef.current) return;
    startedRef.current = true;
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

  // مقصد بعد از اسپلش. هر دو مسیر از این می‌گذرند تا فقط یک بار جابه‌جایی رخ دهد.
  //
  // Both auth branches funnel through here so the "settle once" guard covers
  // them equally — `playToEnd` and either timeout can all reach this point.
  const settle = (routeName) => {
    if (settledRef.current) return;
    settledRef.current = true;
    setChecking(false);
    navigation.replace(routeName);
  };

  // یک شروعِ واردشده از اسپلش «خوش آمدید» رد می‌شود و بعد روی منوی چهارگزینه‌ای
  // (`OrderMenuScreen`) می‌نشیند — سفارش سیستماتیک / سفارش فوری / هوش مصنوعی /
  // سازمانی و شرکتی.
  //
  // A signed-in cold start goes through the `Welcome` splash, which then lands
  // on `OrderMenuScreen` — the four-way entry menu.
  //
  // `Welcome` had been orphaned: it is the only screen that navigates to
  // `OrderMenuScreen`, and nothing navigated to *it*, so the whole entry menu
  // (and the organisation login behind it) was unreachable from a cold start.
  // `Welcome` re-checks the session itself before choosing where to go, so the
  // signed-out case stays covered even if the token is dropped in between.
  const navigateToMainApp = () => settle('Welcome');

  // کاربر خارج‌شده هم به همان اسپلش و منوی ورودی می‌رود — آنجا هر دو مسیر ورود
  // (مشتری و سازمانی) در دسترس است.
  //
  // A signed-out visitor goes to the same place: the entry menu is public and
  // is where both sign-in paths start.
  //
  // The hazard this branch was split to avoid was sending an unauthenticated
  // user to `List` — a signed-in UI whose every request then went out with no
  // Authorization header, and whose 401s `axiosConfig` swallows precisely
  // because they carried no token. `OrderMenuScreen` is not that: it makes no
  // authenticated request at all, so routing a guest there reintroduces
  // nothing.
  const navigateToWelcome = () => settle('Welcome');


  useEffect(() => {
    const subscription = player.addListener('playToEnd', () => {
      // ۲. بعد از اتمام ویدیو به صفحه بعد بروید
      checkAuthenticationStatus();
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

  // Fallback: never let a video that refuses to play (or never emits
  // `playToEnd`) strand the user on the splash screen.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!settledRef.current) {
        console.warn('[Landing] splash video did not finish in time — continuing');
        checkAuthenticationStatus();
      }
    }, SPLASH_TIMEOUT_MS);

    // اگر بررسیِ توکن هم طول بکشد، مقصد را از روی *وجودِ* توکن انتخاب می‌کنیم،
    // نه از روی نتیجه‌ی تأییدِ آن؛ کاربری که توکن دارد نباید به‌خاطر کندیِ شبکه
    // دوباره به صفحه‌ی ورود فرستاده شود.
    //
    // If the auth check itself overruns, pick the destination from whether a
    // token *exists*, not from whether it was verified. A user who has a stored
    // token is signed in as far as this screen is concerned: bouncing them to
    // the login page because the network was slow is exactly the regression
    // this splash screen must not cause. Entering the app is safe here because
    // nothing downstream trusts this decision — `RequireAuth` still gates every
    // guarded route, and the 401 interceptor still raises the session-expiry
    // sheet the moment a real request proves the token is dead.
    //
    // settle() با settledRef محافظت شده، پس اگر بررسیِ توکن زودتر تمام شود این
    // فراخوانی بی‌اثر است.
    const hardTimer = setTimeout(async () => {
      if (settledRef.current) return;

      const storedToken = await TokenManager.getToken();
      console.warn(
        `[Landing] auth check exceeded budget — continuing as ${storedToken ? 'signed in' : 'guest'}`
      );

      if (storedToken) navigateToMainApp();
      else navigateToWelcome();
    }, SPLASH_MAX_MS);

    return () => {
      clearTimeout(timer);
      clearTimeout(hardTimer);
    };
  }, []);

  useEffect(() => {
    const subscription = player.addListener('statusChange', ({ status, error }) => {

      console.log('Player status changed: ', error);
    });

    return () => {
      subscription.remove();
    };
  }, []);
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });


  useEffect(() => {
    if (Platform.OS === 'web' && !isPlaying && player) {
      player.play();


    }
  }, [player, isPlaying])

  // کادر ویدیو: بزرگ‌ترین اندازه‌ای که با حفظ نسبت داخل صفحه جا می‌شود.
  const videoWidth = Math.min(windowWidth, windowHeight * VIDEO_ASPECT_RATIO);
  const videoHeight = videoWidth / VIDEO_ASPECT_RATIO;

  return (
    <View style={styles.root}>
      <CustomStatusBar />
      <LinearGradient colors={SPLASH_GRADIENT} style={StyleSheet.absoluteFill} />

      <View style={styles.videoCenter} pointerEvents="none">
        <VideoView
          style={{ width: videoWidth, height: videoHeight }}
          nativeControls={false}
          player={player}
          contentFit="contain"
        />
      </View>
    </View>
  );
}

// رنگ‌های اختصاصی اسپلش (در پالت theme/Color.js معادل ندارند).
const SPLASH_GRADIENT = ['#1c2833', '#0b0d11', '#0b0d11'];

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SPLASH_GRADIENT[1],
  },
  videoCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
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