import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
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
import { useEffect } from "react";
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
const Stack = createNativeStackNavigator();

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 2000,
  fade: true,
});

const App = () => {
  const [loaded, error] = useFonts({
    'VazirBold': require("./assets/fonts/Vazir-Bold-FD.ttf"),
    'VazirLight': require("./assets/fonts/Vazir-Light-FD.ttf"),
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
                  <Stack.Screen
                    component={ContractScreen}
                    name="ContractScreen"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen component={FolderScreen} name="FolderScreen" options={{ headerShown: false, }} />
                  <Stack.Screen name='Add New Address' component={AddNewAddress} options={{ headerShown: true, header: () => <SubcategoryHeader title={'افزودن آدرس'} />, }} />
                  <Stack.Screen name='Map' component={Map} options={{ headerShown: true, header: () => <SubcategoryHeader title={'موقعیت مکانی'} />, }} />
                  <Stack.Screen component={SubCategories} name="SubCategories" options={{ headerShown: false }}/>
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
