import { StyleSheet, Text, View, Platform } from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setNavigationRef } from "./services/axiosConfig";
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
import ScreenHeaders from "./components/ScreenHeaders";
import AccessRestrictedScreen from "./components/AccessRestrictedScreen";
import AuthInitializer from "./components/AuthInitializer";
const Stack = createNativeStackNavigator();
I18nManager.forceRTL(false);
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 2000,
  fade: true,
});

const App = () => {
  const navigationRef = useRef(null);

  const [loaded, error] = useFonts({
    'VazirBold': require("./assets/fonts/Vazir-Bold-FD.ttf"),
    'VazirLight': require("./assets/fonts/Vazir-Light-FD.ttf"),
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    // تنظیم navigation reference برای API error handling
    setNavigationRef(navigationRef);
  }, []);

  if (!loaded && !error) {
    return null;
  }

  if (!isReady) {
    return null;
  }

  // Simplified linking configuration for web
  const linking = Platform.OS === 'web' ? {
    prefixes: ['https://user-panel.khayyamtech.com', 'http://localhost:8082', 'http://localhost:8081'],
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
        ContractScreen: 'contract',
        FolderScreen: 'folder',
        AddNewAddress: 'add-address',
        Map: 'map',
        SubCategories: 'subcategories',
        Preview: 'preview',
        Details: 'order-details',
        Invoice: 'invoice',
        Increase: 'increase',
        PaymentScreen: 'payment',
        ChatRoom: 'chat',
        Club: 'club',
        DiscountDetail: 'discount-detail',
        GemTransactions: 'gem-transactions',
        UserDiscounts: 'user-discounts',
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
      },
    },
  } : undefined;

  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={navigationRef}
        linking={linking}
        fallback={<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Loading...</Text></View>}
        documentTitle={{
          formatter: (options, route) => `لوپ - ${route?.name || 'خانه'}`
        }}
      >
        <Provider store={store}>
          <AuthInitializer>
            <MenuProvider>
              <Stack.Navigator
              screenOptions={{
                headerShown: false,
              }}
            >
              {/* Auth screens */}
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
              component={AccessRestrictedScreen}
              name="AccessRestrictedScreen"
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

            {/* Main app screens - flat structure */}
            <Stack.Screen component={FolderScreen} name="FolderScreen" />
            <Stack.Screen component={SubCategories} name="SubCategories" />
            <Stack.Screen component={ContractScreen} name="ContractScreen" />
            <Stack.Screen component={AddNewAddress} name="AddNewAddress" />
            <Stack.Screen 
              component={Map} 
              name="Map" 
              options={{ 
                headerShown: true, 
                header: () => <ScreenHeaders title={'موقعیت مکانی'} /> 
              }} 
            />
            <Stack.Screen component={Preview} name="Preview" />
            <Stack.Screen component={Details} name="Details" />
            <Stack.Screen component={Invoice} name="Invoice" />
            <Stack.Screen component={Increase} name="Increase" />
            <Stack.Screen component={PaymentScreen} name="PaymentScreen" />
            <Stack.Screen component={ChatRoom} name="ChatRoom" />
            <Stack.Screen component={Club} name="Club" />
            <Stack.Screen component={DiscountDetail} name="DiscountDetail" />
            <Stack.Screen component={GemTransactions} name="GemTransactions" />
            <Stack.Screen component={UserDiscounts} name="UserDiscounts" />
            <Stack.Screen component={DiscountCodeScreen} name="DiscountCodeScreen" />
            <Stack.Screen 
              component={Steps} 
              name="Steps" 
              options={{ gestureEnabled: false }} 
            />

            <Stack.Screen component={TechnicianVisitScreen} name="TechnicianVisitScreen" />
            <Stack.Screen component={HardwareSelectionScreen} name="HardwareSelectionScreen" />
            <Stack.Screen component={ComprehensiveSelectionScreen} name="ComprehensiveSelectionScreen" />
            <Stack.Screen component={GuideScreen} name="GuideScreen" />
            <Stack.Screen component={HardwareIssueScreen} name="HardwareIssueScreen" />
            <Stack.Screen component={WindowsInstallScreen} name="WindowsInstallScreen" />
            <Stack.Screen component={SoftwareInstallScreen} name="SoftwareInstallScreen" />
            <Stack.Screen component={OrderTrackingScreen} name="OrderTrackingScreen" />
            <Stack.Screen component={OrderSummaryScreen} name="OrderSummaryScreen" />
            <Stack.Screen component={PartsSupplyScreen} name="PartsSupplyScreen" />
            <Stack.Screen component={TechnicianBookingScreen} name="TechnicianBookingScreen" />
            <Stack.Screen component={DeviceModelInfoScreen} name="DeviceModelInfoScreen" />
            <Stack.Screen component={DeviceOrderSummary} name="DeviceOrderSummary" />
            <Stack.Screen component={Footer} name="Footer" />
            <Stack.Screen component={AddressScreen} name="AddressScreen" />
            <Stack.Screen component={Profile} name="Profile" />
            <Stack.Screen component={OrganizationContract} name="OrganizationContract" />
            <Stack.Screen component={MessageScreen} name="MessageScreen" />
            <Stack.Screen component={TransactionsScreen} name="TransactionsScreen" />
            <Stack.Screen component={OrdersScreen} name="OrdersScreen" />
            <Stack.Screen component={CanceledOrdersScreen} name="CanceledOrdersScreen" />
            <Stack.Screen component={Fekrobekr} name="Fekrobekr" />
            <Stack.Screen component={ViolationReportScreen} name="ViolationReportScreen" />
            <Stack.Screen component={ViolationReportsListScreen} name="ViolationReportsListScreen" />
            <Stack.Screen component={FeedbackSurveyScreen} name="FeedbackSurveyScreen" />
            <Stack.Screen component={RateListScreen} name="RateListScreen" />
            <Stack.Screen component={ProductIssueScreen} name="ProductIssueScreen" />
            <Stack.Screen component={IncentivePlansScreen} name="IncentivePlansScreen" />
            <Stack.Screen component={TrainingRegistrationScreen} name="TrainingRegistrationScreen" />
            <Stack.Screen component={NotesScreen} name="NotesScreen" />
            <Stack.Screen component={AddEditNoteScreen} name="AddEditNoteScreen" />
            <Stack.Screen component={LearnMoreScreen} name="LearnMoreScreen" />
            <Stack.Screen component={AboutScreen} name="AboutScreen" />
            <Stack.Screen component={PrivacyScreen} name="PrivacyScreen" />
            <Stack.Screen component={WarrantyScreen} name="WarrantyScreen" />
            <Stack.Screen component={GameMenuScreen} name="GameMenu" />
            <Stack.Screen component={GamePlayScreen} name="GamePlay" />
            <Stack.Screen component={GameResultScreen} name="GameResult" />
            <Stack.Screen component={WebViewScreen} name="WebView" />
            <Stack.Screen component={MapPickerScreen} name="MapPickerScreen" />
          </Stack.Navigator>
            </MenuProvider>
          </AuthInitializer>
        </Provider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({});
