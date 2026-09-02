import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import AuthInitializer from '@components/AuthInitializer';
import PushNotificationProvider from '@components/PushNotificationProvider';
import { MenuProvider } from '@contexts/MenuContext';
import { setNavigationRef } from '@services/axiosConfig';

import i18n from './i18n';
import NavigationFallback from './navigation/NavigationFallback';
import linking from './navigation/linking';
import RootNavigator from './navigation/RootNavigator';
import useExitConfirmation from './navigation/useExitConfirmation';
import store from './store';

/**
 * Persian font faces. These four keys are the *only* registered families —
 * a hyphenated `'Vazir-Bold'` is not one of them and silently falls back to
 * the system font, so always go through `getFontFamily()` in `theme/Typography`
 * rather than writing a family name by hand.
 */
const FONTS = {
  VazirBold: require('@assets/fonts/Vazirmatn-Bold.ttf'),
  VazirLight: require('@assets/fonts/Vazirmatn-Light.ttf'),
  VazirBoldFD: require('@assets/fonts/Vazir-Bold-FD.ttf'),
  VazirLightFD: require('@assets/fonts/Vazir-Light-FD.ttf'),
};

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 2000, fade: true });

const documentTitle = {
  formatter: (options, route) => `لوپ - ${route?.name ?? 'خانه'}`,
};

const App = () => {
  const navigationRef = useRef(null);
  const [fontsLoaded, fontError] = useFonts(FONTS);

  useExitConfirmation(navigationRef);

  // The axios error interceptor needs a way to redirect to the login screen.
  useEffect(() => {
    setNavigationRef(navigationRef);
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  // Hold the splash screen until the fonts resolve one way or the other.
  // On failure we still render: a missing font is worse-looking, not fatal.
  if (!fontsLoaded && !fontError) return null;

  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <SafeAreaProvider>
          <NavigationContainer
            ref={navigationRef}
            linking={linking}
            documentTitle={documentTitle}
            fallback={<NavigationFallback />}
          >
            <AuthInitializer>
              <PushNotificationProvider>
                <MenuProvider>
                  <RootNavigator />
                </MenuProvider>
              </PushNotificationProvider>
            </AuthInitializer>
          </NavigationContainer>
        </SafeAreaProvider>
      </I18nextProvider>
    </Provider>
  );
};

export default App;
