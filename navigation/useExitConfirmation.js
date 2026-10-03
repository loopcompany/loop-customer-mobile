import { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';

import { showAlert } from '@helpers/Common';

import { ROOT_ROUTES } from './routes';

/**
 * Asks for confirmation before the Android hardware back button closes the app.
 *
 * The routes listed in `ROOT_ROUTES` exit, and so does any screen with nothing
 * beneath it — e.g. «انتخاب سیستماتیک», which is a customer's home after login
 * (stack reset) but an ordinary pushed screen for an organisation user above
 * `List`. Everywhere else the default "go back one screen" behaviour is left alone. No-op on iOS and web, which
 * have no hardware back button to intercept.
 *
 * @param {import('react').RefObject<import('@react-navigation/native').NavigationContainerRef<any>>} navigationRef
 */
export function useExitConfirmation(navigationRef) {
  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      const currentRoute = navigationRef.current?.getCurrentRoute()?.name;
      const isStackRoot = navigationRef.current?.canGoBack?.() === false;
      if (!ROOT_ROUTES.includes(currentRoute) && !isStackRoot) return false;

      showAlert('خروج از برنامه', 'آیا مطمئن به خروج هستید؟', [
        { text: 'خیر', style: 'cancel' },
        { text: 'بله', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    });

    return () => subscription.remove();
  }, [navigationRef]);
}

export default useExitConfirmation;
