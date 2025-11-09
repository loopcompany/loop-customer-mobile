import { StyleSheet, Text, View, Platform } from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Linking from 'expo-linking';
import AsyncStorage from "@react-native-async-storage/async-storage";
import FolderScreen from "./screens/FolderScreen";
import SubCategories from "./screens/category/SubCategories";
import SignInLanding from "./screens/auth/SignInLanding";
import LoginScreen from "./screens/auth/LoginScreen";
import Welcome from "./screens/Welcome";
import ResetPasswordScreen from "./screens/auth/ResetPasswordScreen";
import GuideScreen from "./screens/GuideScreen";
import OrderMenuScreen from "./screens/orders/OrderMenuScreen";
import HardwareIssueScreen from "./screens/HardwareIssueScreen";
import WindowsInstallScreen from "./screens/WindowsInstallScreen";
import SoftwareInstallScreen from "./screens/SoftwareInstallScreen";
import OrderTrackingScreen from "./screens/orders/OrderTrackingScreen";
import OrderSummaryScreen from "./screens/orders/OrderSummaryScreen";
import PartsSupplyScreen from "./screens/PartsSupplyScreen";
import TechnicianBookingScreen from "./screens/TechnicianBookingScreen";
import DeviceModelInfoScreen from "./screens/DeviceModelInfoScreen";
import DeviceOrderSummary from "./screens/orders/DeviceOrderSummary";
import Footer from "./screens/Footer";
import AddressScreen from "./screens/account/AddressScreen";
import MapPickerScreen from "./screens/MapPickerScreen";
import PrivacyScreen from "./screens/resources/PrivacyScreen";
import LearnMoreScreen from "./screens/resources/LearnMoreScreen";
import AboutScreen from "./screens/resources/AboutScreen";
import TransactionsScreen from "./screens/TransactionsScreen";
import MessageScreen from "./screens/MessageScreen";
import OrdersScreen from "./screens/orders/OrdersScreen";
import CanceledOrdersScreen from "./screens/orders/CanceledOrdersScreen";
import ViolationReportScreen from "./screens/contact/ViolationReportScreen";
import ViolationReportsListScreen from "./screens/ViolationReportsListScreen";
import FeedbackSurveyScreen from "./screens/contact/FeedbackSurveyScreen";
import Fekrobekr from "./screens/Fekrobekr";
import RateListScreen from "./screens/RateListScreen";
import ProductIssueScreen from "./screens/ProductIssueScreen";
import TrainingRegistrationScreen from "./screens/TrainingRegistrationScreen";
import IncentivePlansScreen from "./screens/IncentivePlansScreen";
import { Provider } from "react-redux";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { I18nManager } from "react-native";
import store from "./store";
import { MenuProvider } from "./contexts/MenuContext";
import DiscountCodeScreen from "./org/DiscountCodeScreen";
import TechnicianVisitScreen from "./org/TechnicianVisitScreen";
import ContractScreen from "./org/ContractScreen";
import HardwareSelectionScreen from "./org/HardwareSelectionScreen";
import ComprehensiveSelectionScreen from "./org/ComprehensiveSelectionScreen";
import Login from "./org/logreg/Login";
import Register from "./org/logreg/Register";
import OTPVerification from "./org/logreg/OTPVerification";
import TestConnection from "./org/logreg/TestConnection";
import OrganizationForgotPassword from "./org/logreg/OrganizationForgotPassword";
import OrganizationResetPassword from "./org/logreg/OrganizationResetPassword";
import OrganizationContract from "./screens/organization/OrganizationContract";
import Grouping from "./org/logreg/Grouping";
import Method from "./org/logreg/Method";
import OrgPrivacy from "./org/logreg/Privacy";
import List from "./org/List";
import MainSignIn from "./screens/auth/MainSignIn";
import RegistrationVerificationScreen from "./screens/auth/RegistrationVerificationScreen";
import Landing from "./screens/Landing";
import Profile from "./screens/account/Profile";
import ForgotPassword from "./screens/auth/ForgotPassword";
import Steps from "./screens/category/Steps";
import StepsHeader from './components/StepsHeader';
import AddNewAddress from './screens/address/AddNewAddress';
import Map from './screens/address/Map';
import SubcategoryHeader from "./components/SubcategoryHeader";
import Preview from "./screens/category/Preview";
import Details from "./screens/orders/Details";
import Invoice from "./screens/orders/Invoice";
import Increase from "./screens/account/Increase";
import PaymentScreen from "./screens/account/PaymentScreen";
import ChatRoom from "./screens/chat/ChatRoom";
import Club from './screens/club/Club';
import DiscountDetail from "./screens/club/DiscountDetail";
import GemTransactions from './screens/club/GemTransactions';
import UserDiscounts from './screens/club/UserDiscounts';
import NotesScreen from './screens/NotesScreen';
import AddEditNoteScreen from './screens/notes/AddEditNoteScreen';
import WarrantyScreen from "./screens/resources/WarrantyScreen";
import GameMenuScreen from './screens/game/GameMenuScreen';
import GamePlayScreen from './screens/game/GamePlayScreen';
import GameResultScreen from './screens/game/GameResultScreen';
import WebViewScreen from './screens/WebViewScreen';
const Stack = createNativeStackNavigator();

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 2000,
  fade: true,
});

const PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';

// Route mapping configuration - must match linking config exactly
const ROUTE_MAP = {
  '/': 'Landing',
  '/folder': 'FolderScreen',
  '/subcategories': 'SubCategories',
  '/steps': 'Steps',
  '/preview': 'Preview',
  '/order-details': 'Details',
  '/invoice': 'Invoice',
  '/chat': 'ChatRoom',
  '/club': 'Club',
  '/discount-detail': 'Discount Detail',
  '/gem-transactions': 'Gem Transactions',
  '/user-discounts': 'User Discounts',
  '/profile': 'Profile',
  '/orders': 'OrdersScreen',
  '/transactions': 'TransactionsScreen',
  '/notes': 'NotesScreen',
  '/note': 'AddEditNoteScreen',
  '/increase': 'Increase',
  '/payment': 'PaymentScreen',
  '/contract': 'ContractScreen',
  '/add-address': 'Add New Address',
  '/map': 'Map',
  '/guide': 'GuideScreen',
  '/hardware-issue': 'HardwareIssueScreen',
  '/windows-install': 'WindowsInstallScreen',
  '/software-install': 'SoftwareInstallScreen',
  '/order-tracking': 'OrderTrackingScreen',
  '/order-summary': 'OrderSummaryScreen',
  '/parts-supply': 'PartsSupplyScreen',
  '/technician-booking': 'TechnicianBookingScreen',
  '/device-model-info': 'DeviceModelInfoScreen',
  '/device-order-summary': 'DeviceOrderSummary',
  '/address': 'AddressScreen',
  '/privacy': 'PrivacyScreen',
  '/learn-more': 'LearnMoreScreen',
  '/about': 'AboutScreen',
  '/messages': 'MessageScreen',
  '/canceled-orders': 'CanceledOrdersScreen',
  '/violation-report': 'ViolationReportScreen',
  '/violation-reports': 'ViolationReportsListScreen',
  '/feedback': 'FeedbackSurveyScreen',
  '/fekrobekr': 'Fekrobekr',
  '/rates': 'RateListScreen',
  '/product-issue': 'ProductIssueScreen',
  '/training-registration': 'TrainingRegistrationScreen',
  '/incentive-plans': 'IncentivePlansScreen',
  '/discount-code': 'DiscountCodeScreen',
  '/technician-visit': 'TechnicianVisitScreen',
  '/hardware-selection': 'HardwareSelectionScreen',
  '/comprehensive-selection': 'ComprehensiveSelectionScreen',
  '/org-contract': 'OrganizationContract',
  '/warranty': 'WarrantyScreen',
  '/game': 'GameMenu',
  '/game-play': 'GamePlay',
  '/game-result': 'GameResult',
  '/webview': 'WebView',
  '/map-picker': 'MapPickerScreen',
  '/welcome': 'Welcome',
  '/login': 'LoginScreen',
  '/main-signin': 'MainSignIn',
  '/forgot-password': 'ForgotPassword',
  '/signin-landing': 'SignInLanding',
  '/registration-verification': 'RegistrationVerificationScreen',
  '/org-login': 'Login',
  '/org-register': 'Register',
  '/order-menu': 'OrderMenuScreen',
  '/list': 'List',
};

// Reverse mapping: screen name -> path
const PATH_MAP = Object.fromEntries(
  Object.entries(ROUTE_MAP).map(([path, screen]) => [screen, path])
);

const MAIN_APP_SCREENS = [
  'FolderScreen', 'SubCategories', 'Steps', 'Preview', 
  'Details', 'Invoice', 'ChatRoom', 'Club', 'Discount Detail', 'Gem Transactions',
  'User Discounts', 'Profile', 'OrdersScreen', 'TransactionsScreen', 'NotesScreen',
  'AddEditNoteScreen', 'Increase', 'PaymentScreen', 'ContractScreen', 'Add New Address', 'Map',
  'GuideScreen', 'HardwareIssueScreen', 'WindowsInstallScreen', 'SoftwareInstallScreen',
  'OrderTrackingScreen', 'OrderSummaryScreen', 'PartsSupplyScreen', 'TechnicianBookingScreen',
  'DeviceModelInfoScreen', 'DeviceOrderSummary', 'AddressScreen', 'PrivacyScreen',
  'LearnMoreScreen', 'AboutScreen', 'MessageScreen', 'CanceledOrdersScreen',
  'ViolationReportScreen', 'ViolationReportsListScreen', 'FeedbackSurveyScreen',
  'Fekrobekr', 'RateListScreen', 'ProductIssueScreen', 'TrainingRegistrationScreen',
  'IncentivePlansScreen', 'DiscountCodeScreen', 'TechnicianVisitScreen',
  'HardwareSelectionScreen', 'ComprehensiveSelectionScreen', 'OrganizationContract',
  'WarrantyScreen', 'GameMenu', 'GamePlay', 'GameResult', 'WebView', 'MapPickerScreen'
];

const App = () => {
  const navigationRef = useRef(null);
  const isNavigatingFromBrowser = useRef(false);
  const currentPath = useRef('');
  const navigationTimeout = useRef(null);
  
  const [loaded, error] = useFonts({
    'VazirBold': require("./assets/fonts/Vazir-Bold-FD.ttf"),
    'VazirLight': require("./assets/fonts/Vazir-Light-FD.ttf"),
  });
  
  const [isReady, setIsReady] = useState(!__DEV__);
  const [initialState, setInitialState] = useState();

  useEffect(() => {
    const restoreState = async () => {
      try {
        if (Platform.OS === 'web') {
          // For web, we don't need to restore from AsyncStorage
          // as linking will handle the URL
          setIsReady(true);
          return;
        }
        
        const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY);
        const state = savedStateString ? JSON.parse(savedStateString) : undefined;

        if (state !== undefined) {
          setInitialState(state);
        }
      } finally {
        setIsReady(true);
      }
    };

    if (!isReady) {
      restoreState();
    }
  }, [isReady]);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Handle browser back/forward buttons for web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handlePopState = (event) => {
        const path = window.location.pathname;
        console.log('\n🔙🔙🔙 BROWSER BACK/FORWARD CLICKED 🔙🔙🔙');
        console.log('📍 New URL:', path);
        console.log('📍 Previous path in ref:', currentPath.current);
        console.log('📍 isNavigatingFromBrowser flag:', isNavigatingFromBrowser.current);
        console.log('📊 Browser History Length:', window.history.length);
        
        // Prevent handling if we're already navigating or path hasn't changed
        if (isNavigatingFromBrowser.current || currentPath.current === path) {
          console.log('⏭️  SKIPPED - already handling or same path\n');
          return;
        }
        
        isNavigatingFromBrowser.current = true;
        console.log('🚩 Flag set: isNavigatingFromBrowser = true');
        currentPath.current = path;
        console.log('💾 Updated currentPath.current to:', path);
        
        // Clear any pending navigation timeout
        if (navigationTimeout.current) {
          clearTimeout(navigationTimeout.current);
        }
        
        if (navigationRef.current && navigationRef.current.isReady()) {
          const screenName = ROUTE_MAP[path];
          console.log('🗺️  Screen name from route map:', screenName);
          
          if (screenName) {
            console.log('✅ NAVIGATING TO:', screenName);
            
            try {
              if (MAIN_APP_SCREENS.includes(screenName)) {
                console.log('📱 MainApp screen detected');
                navigationRef.current.navigate('MainApp', {
                  screen: screenName
                });
              } else {
                console.log('🔐 Auth/Top-level screen detected');
                navigationRef.current.navigate(screenName);
              }
              console.log('✅ Navigation command executed');
            } catch (error) {
              console.error('❌❌❌ Navigation error on popstate:', error);
            }
          } else {
            console.log('⚠️⚠️⚠️ NO SCREEN FOUND FOR PATH:', path);
          }
        } else {
          console.log('⚠️ Navigation ref not ready');
        }
        
        // Reset the flag after a brief delay
        navigationTimeout.current = setTimeout(() => {
          isNavigatingFromBrowser.current = false;
          console.log('🚩 Flag reset: isNavigatingFromBrowser = false\n');
        }, 300);
      };

      // Store initial path
      currentPath.current = window.location.pathname;

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
        if (navigationTimeout.current) {
          clearTimeout(navigationTimeout.current);
        }
      };
    }
  }, [isReady]);

  if (!loaded && !error) {
    return null;
  }
  
  if (!isReady) {
    return null;
  }

  // Web linking configuration for preserving navigation state on reload
  if (Platform.OS === 'web') {
    console.log('Current URL:', window.location.href);
    console.log('Current pathname:', window.location.pathname);
  }
  
  const linking = Platform.OS === 'web' ? {
    enabled: true,
    prefixes: ['http://localhost:8081', 'https://loop.app', '/'],
    // Custom getStateFromPath to control how URLs map to navigation state
    getStateFromPath: (path, config) => {
      // این تابع فقط برای initial load استفاده می‌شه
      // بعد از اون، ما خودمون URL رو manage می‌کنیم
      console.log('🔍 getStateFromPath called with:', path);
      
      const screenName = ROUTE_MAP[path];
      if (!screenName) {
        return undefined;
      }
      
      // Check if it's a MainApp screen
      if (MAIN_APP_SCREENS.includes(screenName)) {
        return {
          routes: [
            {
              name: 'MainApp',
              state: {
                routes: [{ name: screenName }],
                index: 0,
              },
            },
          ],
          index: 0,
        };
      }
      
      // It's an auth screen
      return {
        routes: [{ name: screenName }],
        index: 0,
      };
    },
    // CRITICAL: Return current path to prevent React Navigation from changing URL
    getPathFromState: (state, config) => {
      // Return current path so React Navigation doesn't add its own history entry
      // ما خودمون در onStateChange با replaceState URL رو update می‌کنیم
      const path = typeof window !== 'undefined' ? window.location.pathname : '/';
      console.log('🚫 getPathFromState: Keeping current path:', path);
      return path;
    },
    config: {
      screens: {
        Landing: '',
        Welcome: 'welcome',
        SignInLanding: 'signin-landing',
        MainSignIn: 'main-signin',
        RegistrationVerificationScreen: 'registration-verification',
        LoginScreen: 'login',
        Login: 'org-login',
        Register: 'org-register',
        OTPVerification: 'org-otp-verification',
        TestConnection: 'org-test-connection',
        OrganizationForgotPassword: 'org-forgot-password',
        OrganizationResetPassword: 'org-reset-password',
        OrgPrivacy: 'org-privacy',
        Grouping: 'grouping',
        Method: 'method',
        ResetPasswordScreen: 'reset-password',
        ForgotPassword: 'forgot-password',
        OrderMenuScreen: 'order-menu',
        List: 'list',
        MainApp: {
          screens: {
            ContractScreen: 'contract',
            FolderScreen: 'folder',
            'Add New Address': 'add-address',
            Map: 'map',
            SubCategories: 'subcategories',
            Preview: 'preview',
            Details: 'order-details',
            Invoice: 'invoice',
            Increase: 'increase',
            PaymentScreen: 'payment',
            ChatRoom: 'chat',
            Club: 'club',
            'Discount Detail': 'discount-detail',
            'Gem Transactions': 'gem-transactions',
            'User Discounts': 'user-discounts',
            DiscountCodeScreen: 'discount-code',
            Steps: 'steps',
            TechnicianVisitScreen: 'technician-visit',
            HardwareSelectionScreen: 'hardware-selection',
            ComprehensiveSelectionScreen: 'comprehensive-selection',
            GuideScreen: 'guide',
            HardwareIssueScreen: 'hardware-issue',
            WindowsInstallScreen: 'windows-install',
            SoftwareInstallScreen: 'software-install',
            OrderTrackingScreen: 'order-tracking',
            OrderSummaryScreen: 'order-summary',
            PartsSupplyScreen: 'parts-supply',
            TechnicianBookingScreen: 'technician-booking',
            DeviceModelInfoScreen: 'device-model-info',
            DeviceOrderSummary: 'device-order-summary',
            AddressScreen: 'address',
            PrivacyScreen: 'privacy',
            LearnMoreScreen: 'learn-more',
            AboutScreen: 'about',
            TransactionsScreen: 'transactions',
            MessageScreen: 'messages',
            OrdersScreen: 'orders',
            CanceledOrdersScreen: 'canceled-orders',
            ViolationReportScreen: 'violation-report',
            ViolationReportsListScreen: 'violation-reports',
            FeedbackSurveyScreen: 'feedback',
            Fekrobekr: 'fekrobekr',
            RateListScreen: 'rates',
            ProductIssueScreen: 'product-issue',
            TrainingRegistrationScreen: 'training-registration',
            IncentivePlansScreen: 'incentive-plans',
            OrganizationContract: 'org-contract',
            Profile: 'profile',
            NotesScreen: 'notes',
            AddEditNoteScreen: 'note',
            WarrantyScreen: 'warranty',
            GameMenu: 'game',
            GamePlay: 'game-play',
            GameResult: 'game-result',
            WebView: 'webview',
            MapPickerScreen: 'map-picker',
          }
        }
      },
    },
  } : undefined;

  return (
    <NavigationContainer 
      ref={navigationRef}
      linking={linking}
      initialState={initialState}
      fallback={<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><Text>Loading...</Text></View>}
      documentTitle={{
        formatter: (options, route) => `لوپ - ${route?.name || 'خانه'}`
      }}
      onStateChange={(state) => {
        if (Platform.OS === 'web') {
          console.log('\n📡📡📡 onStateChange FIRED 📡📡📡');
          console.log('📍 isNavigatingFromBrowser flag:', isNavigatingFromBrowser.current);
          console.log('📊 Browser History Length:', window.history.length);
          
          // Don't update URL if we're navigating from browser back/forward
          if (isNavigatingFromBrowser.current) {
            console.log('🚫 SKIPPED - navigating from browser\n');
            return;
          }
          
          // For web, update browser history
          if (state && typeof window !== 'undefined') {
            const getCurrentRoute = (navState) => {
              if (!navState || !navState.routes) return null;
              const route = navState.routes[navState.index || 0];
              if (route && route.state) {
                return getCurrentRoute(route.state);
              }
              return route;
            };

            const currentRoute = getCurrentRoute(state);
            if (currentRoute && currentRoute.name) {
              console.log('� Current Route Name:', currentRoute.name);
              
              // Use the same path mapping as in popstate handler
              const path = PATH_MAP[currentRoute.name] || `/${currentRoute.name.toLowerCase().replace(/screen/gi, '')}`;
              console.log('📌 Mapped Path:', path);
              console.log('📌 Current URL:', window.location.pathname);
              console.log('📌 currentPath.current:', currentPath.current);
              
              // Only update if path has actually changed
              if (window.location.pathname !== path && currentPath.current !== path) {
                console.log('🔄 WILL UPDATE URL');
                console.log('   From:', window.location.pathname);
                console.log('   To:', path);
                
                currentPath.current = path;
                console.log('💾 Updated currentPath.current to:', path);
                
                // Use replaceState instead of pushState to avoid creating duplicate history entries
                window.history.replaceState({}, '', path);
                console.log('✅ replaceState executed');
                console.log('📊 History length after replace:', window.history.length, '\n');
              } else {
                console.log('🚫 SKIPPED - URL already correct:', path, '\n');
              }
            }
          }
        } else if (state) {
          // For native, save to AsyncStorage
          AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
        }
      }}
    >
      <Provider store={store}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          {/* Auth screens (NO MenuProvider) */}
          <Stack.Screen component={Landing} name="Landing" options={{ headerShown: false, }} />
          <Stack.Screen component={Welcome} name="Welcome" options={{ headerShown: false, }} />
          <Stack.Screen
            component={SignInLanding}
            name="SignInLanding"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            component={MainSignIn}
            name="MainSignIn"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            component={RegistrationVerificationScreen}
            name="RegistrationVerificationScreen"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            component={LoginScreen}
            name="LoginScreen"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            component={Login}
            name="Login"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            component={Register}
            name="Register"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            component={OTPVerification}
            name="OTPVerification"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            component={TestConnection}
            name="TestConnection"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            component={OrganizationForgotPassword}
            name="OrganizationForgotPassword"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            component={OrganizationResetPassword}
            name="OrganizationResetPassword"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            component={OrgPrivacy}
            name="OrgPrivacy"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            component={Grouping}
            name="Grouping"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            component={Method}
            name="Method"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen component={ForgotPassword} name="ForgotPassword" options={{ headerShown: false, }} />
          <Stack.Screen
            component={ResetPasswordScreen}
            name="ResetPasswordScreen"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen component={OrderMenuScreen} name="OrderMenuScreen" options={{ headerShown: false, }} />
<Stack.Screen
                    component={List}
                    name="List"
                    options={{
                      headerShown: false,
                    }}
                  />
                  
          {/* Main app screens (WITH MenuProvider) */}
          <Stack.Screen name="MainApp">
            {() => (
              <MenuProvider>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                  <Stack.Screen component={FolderScreen} name="FolderScreen" options={{ headerShown: false, }} />
                  <Stack.Screen component={SubCategories} name="SubCategories" options={{ headerShown: false }}/>
                  <Stack.Screen
                    component={ContractScreen}
                    name="ContractScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen name='Add New Address' component={AddNewAddress} options={{ headerShown: true, header: () => <SubcategoryHeader title={'افزودن آدرس'} />, }} />
                  <Stack.Screen name='Map' component={Map} options={{ headerShown: true, header: () => <SubcategoryHeader title={'موقعیت مکانی'} />, }} />
                  <Stack.Screen component={Preview} name="Preview" options={{ headerShown: false }}/>
                  <Stack.Screen component={Details} name="Details" options={{ headerShown: false }}/>
                  <Stack.Screen component={Invoice} name="Invoice" options={{ headerShown: false }}/>
                  <Stack.Screen component={Increase} name="Increase" options={{ headerShown: false }}/>
                  <Stack.Screen component={PaymentScreen} name="PaymentScreen" options={{ headerShown: false }}/>
                  <Stack.Screen component={ChatRoom} name="ChatRoom" options={{ headerShown: false }}/>
                  <Stack.Screen component={Club} name="Club" options={{ headerShown: false }}/>
                  <Stack.Screen component={DiscountDetail} name="Discount Detail" options={{ headerShown: false }}/>
                  <Stack.Screen component={GemTransactions} name="Gem Transactions" options={{ headerShown: false }}/>
                  <Stack.Screen component={UserDiscounts} name="User Discounts" options={{ headerShown: false }}/>
                  <Stack.Screen
                    component={DiscountCodeScreen}
                    name="DiscountCodeScreen"
                    options={{ headerShown: false, }} />
                  <Stack.Screen name='Steps' component={Steps} options={{ headerShown: false,  gestureEnabled: false }} />

                  <Stack.Screen
                    component={TechnicianVisitScreen}
                    name="TechnicianVisitScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  
                  <Stack.Screen
                    component={HardwareSelectionScreen}
                    name="HardwareSelectionScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={ComprehensiveSelectionScreen}
                    name="ComprehensiveSelectionScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  
                  <Stack.Screen
                    component={GuideScreen}
                    name="GuideScreen"
                    options={{
                      headerShown: false,
                    }}
                  />

                  <Stack.Screen
                    component={HardwareIssueScreen}
                    name="HardwareIssueScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={WindowsInstallScreen}
                    name="WindowsInstallScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={SoftwareInstallScreen}
                    name="SoftwareInstallScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={OrderTrackingScreen}
                    name="OrderTrackingScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={OrderSummaryScreen}
                    name="OrderSummaryScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={PartsSupplyScreen}
                    name="PartsSupplyScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={TechnicianBookingScreen}
                    name="TechnicianBookingScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={DeviceModelInfoScreen}
                    name="DeviceModelInfoScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={DeviceOrderSummary}
                    name="DeviceOrderSummary"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={Footer}
                    name="Footer"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={AddressScreen}
                    name="AddressScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={Profile}
                    name="Profile"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={OrganizationContract}
                    name="OrganizationContract"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={MessageScreen}
                    name="MessageScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={TransactionsScreen}
                    name="TransactionsScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={OrdersScreen}
                    name="OrdersScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={CanceledOrdersScreen}
                    name="CanceledOrdersScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={Fekrobekr}
                    name="Fekrobekr"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={ViolationReportScreen}
                    name="ViolationReportScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={ViolationReportsListScreen}
                    name="ViolationReportsListScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={FeedbackSurveyScreen}
                    name="FeedbackSurveyScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={RateListScreen}
                    name="RateListScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={ProductIssueScreen}
                    name="ProductIssueScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={IncentivePlansScreen}
                    name="IncentivePlansScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={TrainingRegistrationScreen}
                    name="TrainingRegistrationScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={NotesScreen}
                    name="NotesScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={AddEditNoteScreen}
                    name="AddEditNote"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={LearnMoreScreen}
                    name="LearnMoreScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={AboutScreen}
                    name="AboutScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={PrivacyScreen}
                    name="PrivacyScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={WarrantyScreen}
                    name="WarrantyScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={GameMenuScreen}
                    name="GameMenu"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={GamePlayScreen}
                    name="GamePlay"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    component={GameResultScreen}
                    name="GameResult"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen 
                    component={WebViewScreen} 
                    name="WebView"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen name="MapPickerScreen" component={MapPickerScreen} />
                </Stack.Navigator>
              </MenuProvider>
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </Provider>
    </NavigationContainer>
  );
};

export default App;

const styles = StyleSheet.create({});
