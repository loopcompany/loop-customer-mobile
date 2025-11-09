import { Platform } from 'react-native';

/**
 * Helper to manage navigation state persistence for web
 */
export const useNavigationPersistence = () => {
  if (Platform.OS !== 'web') {
    return {};
  }

  return {
    onStateChange: (state) => {
      if (state) {
        // Get current route from state
        const getCurrentRoute = (navState) => {
          if (!navState) return null;
          
          const route = navState.routes[navState.index];
          if (route.state) {
            return getCurrentRoute(route.state);
          }
          return route;
        };

        const currentRoute = getCurrentRoute(state);
        
        // Update URL based on route
        if (currentRoute && currentRoute.name) {
          const routeMap = {
            // Auth screens
            'Landing': '/',
            'Welcome': '/welcome',
            'SignInLanding': '/signin-landing',
            'MainSignIn': '/main-signin',
            'RegistrationVerificationScreen': '/registration-verification',
            'LoginScreen': '/login',
            'Login': '/org-login',
            'Register': '/org-register',
            'OTPVerification': '/org-otp-verification',
            'ForgotPassword': '/forgot-password',
            'ResetPasswordScreen': '/reset-password',
            
            // Main app screens
            'FolderScreen': '/folder',
            'SubCategories': '/subcategories',
            'Steps': '/steps',
            'Preview': '/preview',
            'Details': '/order-details',
            'Invoice': '/invoice',
            'ChatRoom': '/chat',
            'Club': '/club',
            'Profile': '/profile',
            'OrdersScreen': '/orders',
            'TransactionsScreen': '/transactions',
            'NotesScreen': '/notes',
          };

          const path = routeMap[currentRoute.name] || '/';
          
          // Only update if different from current path
          if (window.location.pathname !== path) {
            window.history.pushState({}, '', path);
          }
        }
      }
    }
  };
};
