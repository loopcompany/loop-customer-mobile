import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  TouchableOpacity,
  I18nManager,
} from "react-native";
import Button from "../../components/Button";
import NewStyles from "../../styles/NewStyles";
// import * as SplashScreen from 'expo-splash-screen';

// قفل کردن نمایش صفحه تا فونت ها و RTL ست بشه
// SplashScreen.preventAutoHideAsync();

// اطمینان از راست‌چین بودن اپ
I18nManager.forceRTL(false);

export default function SignInLanding({ navigation }) {
  return (
    <ImageBackground
      source={require("../../assets/moon.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      {/* <View style={styles.container}> */}
      <Image
        source={require("../../assets/logo.png")}
        style={NewStyles.logo}
        resizeMode="contain"
      />

      {/* <TouchableOpacity style={styles.button} onPress={()=>{
            navigation.navigate('LoginScreen')
        }}>
          <Text style={styles.buttonText}>ورود</Text>
        </TouchableOpacity> */}
      <Button
        style={{ width: "70%" }}
        title={"ورود"}
        onPress={() => {
          navigation.navigate("LoginScreen");
        }}
      />
      <Button
        style={{ width: "70%" }}
        title={"ثبت نام"}
        onPress={() => {
          navigation.navigate("MainSignIn");
        }}
      />
      {/* <TouchableOpacity
        style={styles.button}
        onPress={() => {
          navigation.navigate("SignInScreen");
        }}
      >
        <Text style={styles.buttonText}>ثبت نام</Text>
      </TouchableOpacity> */}

      <TouchableOpacity style={styles.languageSwitcher}>
        <Image
          source={{
            uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Flag_of_Iran.svg/320px-Flag_of_Iran.svg.png",
          }}
          style={styles.flag}
        />
        <Text style={styles.languageText}>فارسی</Text>
      </TouchableOpacity>
      {/* </View> */}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 300,
    height: 150,
    marginBottom: 350,
  },
  button: {
    backgroundColor: "#000",
    borderColor: "#00f",
    borderWidth: 2,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginVertical: 10,
    shadowColor: "#00f",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 5,
    width: 250,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  languageSwitcher: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    backgroundColor: "#000",
    borderColor: "#00f",
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    shadowColor: "#00f",
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 3,
  },
  flag: {
    width: 24,
    height: 16,
    marginRight: 10,
  },
  languageText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
