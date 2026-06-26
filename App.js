import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import i18n from 'i18next';
import { useEffect, useRef, useState } from "react";
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { Alert, BackHandler, I18nManager, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from "react-redux";
import en from './assets/locales/en.json';
import fa from './assets/locales/fa.json';
import AccessRestrictedScreen from "./components/AccessRestrictedScreen";
import AuthInitializer from "./components/AuthInitializer";
import ScreenHeaders from "./components/ScreenHeaders";
import { MenuProvider } from "./contexts/MenuContext";
import ComprehensiveSelectionScreen from "./org/ComprehensiveSelectionScreen";
import ContractScreen from "./org/ContractScreen";
import DiscountCodeScreen from "./org/DiscountCodeScreen";
import HardwareSelectionScreen from "./org/HardwareSelectionScreen";
import List from "./org/List";
import Grouping from "./org/logreg/Grouping";
import Login from "./org/logreg/Login";
import Method from "./org/logreg/Method";
import OrganizationForgotPassword from "./org/logreg/OrganizationForgotPassword";
import OrganizationResetPassword from "./org/logreg/OrganizationResetPassword";
import OTPVerification from "./org/logreg/OTPVerification";
import OrgPrivacy from "./org/logreg/Privacy";
import Register from "./org/logreg/Register";
import TestConnection from "./org/logreg/TestConnection";
import TechnicianVisitScreen from "./org/TechnicianVisitScreen";
import AddressScreen from "./screens/account/AddressScreen";
import Increase from "./screens/account/Increase";
import PaymentScreen from "./screens/account/PaymentScreen";
import Profile from "./screens/account/Profile";
import AddNewAddress from './screens/address/AddNewAddress';
import Map from './screens/address/Map';
import ForgotPassword from "./screens/auth/ForgotPassword";
import LoginScreen from "./screens/auth/LoginScreen";
import MainSignIn from "./screens/auth/MainSignIn";
import RegistrationVerificationScreen from "./screens/auth/RegistrationVerificationScreen";
import ResetPasswordScreen from "./screens/auth/ResetPasswordScreen";
import SignInLanding from "./screens/auth/SignInLanding";
import Preview from "./screens/category/Preview";
import Steps from "./screens/category/Steps";
import SubCategories from "./screens/category/SubCategories";
import ChatRoom from "./screens/chat/ChatRoom";
import Club from './screens/club/Club';
import DiscountDetail from "./screens/club/DiscountDetail";
import GemTransactions from './screens/club/GemTransactions';
import UserDiscounts from './screens/club/UserDiscounts';
import FeedbackSurveyScreen from "./screens/contact/FeedbackSurveyScreen";
import ViolationReportScreen from "./screens/contact/ViolationReportScreen";
import DeviceModelInfoScreen from "./screens/DeviceModelInfoScreen";
import Fekrobekr from "./screens/Fekrobekr";
import FolderScreen from "./screens/FolderScreen";
import Footer from "./screens/Footer";
import GameMenuScreen from './screens/game/GameMenuScreen';
import GamePlayScreen from './screens/game/GamePlayScreen';
import GameResultScreen from './screens/game/GameResultScreen';
import GuideScreen from "./screens/GuideScreen";
import HardwareIssueScreen from "./screens/HardwareIssueScreen";
import IncentivePlansScreen from "./screens/IncentivePlansScreen";
import Landing from "./screens/Landing";
import MapPickerScreen from "./screens/MapPickerScreen";
import MessageScreen from "./screens/MessageScreen";
import AddEditNoteScreen from './screens/notes/AddEditNoteScreen';
import NotesScreen from './screens/NotesScreen';
import CanceledOrdersScreen from "./screens/orders/CanceledOrdersScreen";
import Details from "./screens/orders/Details";
import DeviceOrderSummary from "./screens/orders/DeviceOrderSummary";
import Invoice from "./screens/orders/Invoice";
import OrderMenuScreen from "./screens/orders/OrderMenuScreen";
import OrdersScreen from "./screens/orders/OrdersScreen";
import OrderSummaryScreen from "./screens/orders/OrderSummaryScreen";
import OrderTrackingScreen from "./screens/orders/OrderTrackingScreen";
import OrganizationContract from "./screens/organization/OrganizationContract";
import PartsSupplyScreen from "./screens/PartsSupplyScreen";
import ProductIssueScreen from "./screens/ProductIssueScreen";
import RateCategory from "./screens/RateCategory";
import RateListScreen from "./screens/RateListScreen";
import AboutScreen from "./screens/resources/AboutScreen";
import LearnMoreScreen from "./screens/resources/LearnMoreScreen";
import OrganizationTermsScreen from "./screens/resources/OrganizationTermsScreen";
import PrivacyScreen from "./screens/resources/PrivacyScreen";
import WarrantyScreen from "./screens/resources/WarrantyScreen";
import SoftwareInstallScreen from "./screens/SoftwareInstallScreen";
import TechnicianBookingScreen from "./screens/TechnicianBookingScreen";
import TrainingRegistrationScreen from "./screens/TrainingRegistrationScreen";
import TransactionsScreen from "./screens/TransactionsScreen";
import ViolationReportsListScreen from "./screens/ViolationReportsListScreen";
import WebViewScreen from './screens/WebViewScreen';
import Welcome from "./screens/Welcome";
import WindowsInstallScreen from "./screens/WindowsInstallScreen";
import { setNavigationRef } from "./services/axiosConfig";
import store from "./store";
const Stack = createNativeStackNavigator();
I18nManager.forceRTL(false);

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fa: { translation: fa },
      en: { translation: en },
    },
    lng: "fa",
    fallbackLng: "fa",
    interpolation: {
      escapeValue: false
    }
  });


SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 2000,
  fade: true,
});
 
const App = () => {
  const navigationRef = useRef(null);

  const [loaded, error] = useFonts({
    'VazirBold': require("./assets/fonts/Vazirmatn-Bold.ttf"),
    'VazirLight': require("./assets/fonts/Vazirmatn-Light.ttf"),
    'VazirBoldFD': require("./assets/fonts/Vazir-Bold-FD.ttf"),
    'VazirLightFD': require("./assets/fonts/Vazir-Light-FD.ttf"),
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

  // Handle Android back button
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      const currentRoute = navigationRef.current?.getCurrentRoute()?.name;

      // لیست صفحاتی که در آن‌ها باید از اپ خارج شویم
      const rootScreens = ['Landing', 'Welcome', 'FolderScreen'];

      if (rootScreens.includes(currentRoute)) {
        // نمایش Alert تأیید خروج
        Alert.alert(
          'خروج از برنامه',
          'آیا مطمئن به خروج هستید؟',
          [
            {
              text: 'خیر',
              onPress: () => null,
              style: 'cancel'
            },
            {
              text: 'بله',
              onPress: () => BackHandler.exitApp()
            }
          ],
          { cancelable: false }
        );
        return true; // جلوگیری از رفتار پیش‌فرض
      }

      return false; // اجازه به رفتار پیش‌فرض (برگشت به صفحه قبل)
    });

    return () => backHandler.remove();
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
        OrganizationTermsScreen: 'organization-terms',
        TransactionsScreen: 'transactions',
        MessageScreen: 'messages',
        OrdersScreen: 'orders',
        CanceledOrdersScreen: 'canceled-orders',
        ViolationReportScreen: 'violation-report',
        ViolationReportsListScreen: 'violation-reports',
        FeedbackSurveyScreen: 'feedback',
        Fekrobekr: 'fekrobekr',
        RateListScreen: 'rates',
        RateCategory: 'category-rates',
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
    <I18nextProvider i18n={i18n}>

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
                  <Stack.Screen component={RateCategory} name="RateCategory" />
                  <Stack.Screen component={ProductIssueScreen} name="ProductIssueScreen" />
                  <Stack.Screen component={IncentivePlansScreen} name="IncentivePlansScreen" />
                  <Stack.Screen component={TrainingRegistrationScreen} name="TrainingRegistrationScreen" />
                  <Stack.Screen component={NotesScreen} name="NotesScreen" />
                  <Stack.Screen component={AddEditNoteScreen} name="AddEditNoteScreen" />
                  <Stack.Screen component={LearnMoreScreen} name="LearnMoreScreen" />
                  <Stack.Screen component={AboutScreen} name="AboutScreen" />
                  <Stack.Screen component={OrganizationTermsScreen} name="OrganizationTermsScreen" />
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
    </I18nextProvider>
  );
};

export default App;

const styles = StyleSheet.create({});
