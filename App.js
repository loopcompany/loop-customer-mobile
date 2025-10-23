import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FolderScreen from "./screens/FolderScreen";
import SignInLanding from "./screens/auth/SignInLanding";
import LoginScreen from "./screens/auth/LoginScreen";
import Welcome from "./screens/Welcome";
import ResetPasswordScreen from "./screens/auth/ResetPasswordScreen";
import GuideScreen from "./screens/GuideScreen";
import OrderMenuScreen from "./screens/OrderMenuScreen";
import HardwareIssueScreen from "./screens/HardwareIssueScreen";
import WindowsInstallScreen from "./screens/WindowsInstallScreen";
import SoftwareInstallScreen from "./screens/SoftwareInstallScreen";
import OrderTrackingScreen from "./screens/OrderTrackingScreen";
import OrderSummaryScreen from "./screens/OrderSummaryScreen";
import PartsSupplyScreen from "./screens/PartsSupplyScreen";
import TechnicianBookingScreen from "./screens/TechnicianBookingScreen";
import DeviceModelInfoScreen from "./screens/DeviceModelInfoScreen";
import DeviceOrderSummary from "./screens/DeviceOrderSummary";
import Footer from "./screens/Footer";
import AddressScreen from "./screens/AddressScreen";
import MapPickerScreen from "./screens/MapPickerScreen";
import PrivacyScreen from "./screens/PrivacyScreen";
import TransactionsScreen from "./screens/TransactionsScreen";
import MessageScreen from "./screens/MessageScreen";
import OrdersScreen from "./screens/OrdersScreen";
import CanceledOrdersScreen from "./screens/CanceledOrdersScreen";
import ViolationReportScreen from "./screens/ViolationReportScreen";
import FeedbackSurveyScreen from "./screens/FeedbackSurveyScreen";
import Fekrobekr from "./screens/Fekrobekr";
import RateListScreen from "./screens/RateListScreen";
import ProductIssueScreen from "./screens/ProductIssueScreen";
import TrainingRegistrationScreen from "./screens/TrainingRegistrationScreen";
import IncentivePlansScreen from "./screens/IncentivePlansScreen";
import SignInScreen from "./screens/auth/SignInScreen";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { I18nManager } from "react-native";
import store from "./store";
import DiscountCodeScreen from "./org/DiscountCodeScreen";
import TechnicianVisitScreen from "./org/TechnicianVisitScreen";
import ContractScreen from "./org/ContractScreen";
import HardwareSelectionScreen from "./org/HardwareSelectionScreen";
import ComprehensiveSelectionScreen from "./org/ComprehensiveSelectionScreen";
import Login from "./org/logreg/Login";
import Register from "./org/logreg/Register";
import Grouping from "./org/logreg/Grouping";
import Method from "./org/logreg/Method";
import OrgPrivacy from "./org/logreg/Privacy";
import List from "./org/List";
import MainSignIn from "./screens/auth/MainSignIn";
I18nManager.forceRTL(false);
const Stack = createNativeStackNavigator();

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 2000,
  fade: true,
});

const App = () => {
  const [loaded, error] = useFonts({
    VazirBold: require("./assets/fonts/Vazir-Bold-FD.ttf"),
    VazirLight: require("./assets/fonts/Vazir-Light-FD.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <NavigationContainer>
      <Provider store={store}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen
            component={Welcome}
            name="Welcome"
            options={{
              headerShown: false,
            }}
          />
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
            component={FolderScreen}
            name="FolderScreen"
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
            component={DiscountCodeScreen}
            name="DiscountCodeScreen"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            component={TechnicianVisitScreen}
            name="TechnicianVisitScreen"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            component={ContractScreen}
            name="ContractScreen"
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
          <Stack.Screen
            component={List}
            name="List"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            component={SignInScreen}
            name="SignInScreen"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            component={ResetPasswordScreen}
            name="ResetPasswordScreen"
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
            component={OrderMenuScreen}
            name="OrderMenuScreen"
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
            component={PrivacyScreen}
            name="PrivacyScreen"
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

          <Stack.Screen name="MapPickerScreen" component={MapPickerScreen} />
        </Stack.Navigator>
      </Provider>
    </NavigationContainer>
  );
};

export default App;

const styles = StyleSheet.create({});
