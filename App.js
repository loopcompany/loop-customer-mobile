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
import OrganizationProfileScreen from './screens/organization/OrganizationProfileScreen';
import OrganizationContractScreen from './screens/organization/OrganizationContractScreen';
import TestAPIScreen from './screens/TestAPIScreen';

// Import HOC and access control components
import { withOrganizationAccess, ACCESS_PRESETS } from './components/withOrganizationAccess';

// Create protected components for order-related screens
const ProtectedOrderMenuScreen = withOrganizationAccess(OrderMenuScreen, {
  ...ACCESS_PRESETS.ORDER_RELATED,
  screenName: 'OrderMenuScreen'
});

const ProtectedFolderScreen = withOrganizationAccess(FolderScreen, {
  ...ACCESS_PRESETS.ORDER_RELATED,
  screenName: 'FolderScreen'
});

const ProtectedSubCategories = withOrganizationAccess(SubCategories, {
  ...ACCESS_PRESETS.ORDER_RELATED,
  screenName: 'SubCategories'
});

const ProtectedSteps = withOrganizationAccess(Steps, {
  ...ACCESS_PRESETS.ORDER_RELATED,
  screenName: 'Steps'
});

const ProtectedPreview = withOrganizationAccess(Preview, {
  ...ACCESS_PRESETS.ORDER_RELATED,
  screenName: 'Preview'
});

const ProtectedDetails = withOrganizationAccess(Details, {
  ...ACCESS_PRESETS.ORDER_RELATED,
  screenName: 'Details'
});

// Always allowed screens for organization users
const AlwaysAllowedProfile = withOrganizationAccess(Profile, {
  ...ACCESS_PRESETS.ORGANIZATION_ALWAYS_ALLOWED,
  screenName: 'Profile'
});

// 🔒 Organization-only screens (فقط کاربران سازمانی لاگین شده)
const ProtectedOrganizationProfile = withOrganizationAccess(OrganizationProfileScreen, {
  allowOrganizationAccess: true,
  requireCompleteAccess: false, // نمیخواد تایید کامل باشه
  customAccessCheck: ({ isOrganizationUser, accessStatus, profileStatus, contractStatus, hasCompleteAccess }) => {
    console.log('🔍 OrganizationProfile customAccessCheck:', {
      isOrganizationUser,
      profileStatus,
      contractStatus,
      hasCompleteAccess,
      accessStatus: accessStatus ? 'exists' : 'null'
    });
    
    // فقط کاربران سازمانی دسترسی دارند
    if (!isOrganizationUser) {
      console.log('❌ OrganizationProfile: Not organization user');
      return {
        allowed: false,
        title: "دسترسی محدود",
        message: "این بخش فقط برای کاربران سازمانی است. لطفا ابتدا به عنوان کاربر سازمانی وارد شوید.",
        showRetry: false
      };
    }
    // کاربر سازمانی است - دسترسی آزاد (حتی اگر تایید نشده باشد)
    console.log('✅ OrganizationProfile: Organization user - allowing access');
    return { allowed: true };
  }
});

const ProtectedOrganizationContract = withOrganizationAccess(OrganizationContractScreen, {
  allowOrganizationAccess: true,
  requireCompleteAccess: false, // نمیخواد تایید کامل باشه
  customAccessCheck: ({ isOrganizationUser, accessStatus }) => {
    // فقط کاربران سازمانی دسترسی دارند
    if (!isOrganizationUser) {
      return {
        allowed: false,
        title: "دسترسی محدود",
        message: "این بخش فقط برای کاربران سازمانی است. لطفا ابتدا به عنوان کاربر سازمانی وارد شوید.",
        showRetry: false
      };
    }
    // کاربر سازمانی است - دسترسی آزاد (حتی اگر تایید نشده باشد)
    return { allowed: true };
  }
});

const Stack = createNativeStackNavigator();

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 2000,
  fade: true,
});

const PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';

const App = () => {
  const navigationRef = useRef(null);
  
  const [loaded, error] = useFonts({
    'VazirBold': require("./assets/fonts/Vazir-Bold-FD.ttf"),
    'VazirLight': require("./assets/fonts/Vazir-Light-FD.ttf"),
  });
  
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();

  useEffect(() => {
    const restoreState = async () => {
      try {
        // Only restore state in development mode for native platforms
        if (__DEV__ && Platform.OS !== 'web') {
          const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY);
          const state = savedStateString ? JSON.parse(savedStateString) : undefined;

          if (state !== undefined) {
            setInitialState(state);
          }
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

  if (!loaded && !error) {
    return null;
  }
  
  if (!isReady) {
    return null;
  }

  // Simple linking configuration for web only
  const linking = Platform.OS === 'web' ? {
    prefixes: ['http://localhost:8081', 'http://localhost:8082', 'https://loop.app'],
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
        // Only save state for native platforms in dev mode
        if (state && Platform.OS !== 'web' && __DEV__) {
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
          {/* Organization profile and contract screens - 🔒 Protected */}
          <Stack.Screen 
            component={ProtectedOrganizationProfile} 
            name="OrganizationProfile" 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            component={ProtectedOrganizationContract} 
            name="OrganizationContract" 
            options={{ headerShown: false }} 
          />
          <Stack.Screen
            component={TestAPIScreen}
            name="TestAPIScreen"
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
          <Stack.Screen component={ProtectedOrderMenuScreen} name="OrderMenuScreen" options={{ headerShown: false, }} />
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
                  <Stack.Screen component={ProtectedFolderScreen} name="FolderScreen" options={{ headerShown: false, }} />
                  <Stack.Screen component={ProtectedSubCategories} name="SubCategories" options={{ headerShown: false }}/>
                  <Stack.Screen
                    component={ContractScreen}
                    name="ContractScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen name='Add New Address' component={AddNewAddress} options={{ headerShown: true, header: () => <SubcategoryHeader title={'افزودن آدرس'} />, }} />
                  <Stack.Screen name='Map' component={Map} options={{ headerShown: true, header: () => <SubcategoryHeader title={'موقعیت مکانی'} />, }} />
                  <Stack.Screen component={ProtectedPreview} name="Preview" options={{ headerShown: false }}/>
                  <Stack.Screen component={ProtectedDetails} name="Details" options={{ headerShown: false }}/>
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
                  <Stack.Screen name='Steps' component={ProtectedSteps} options={{ headerShown: false,  gestureEnabled: false }} />

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
                    component={AlwaysAllowedProfile}
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
