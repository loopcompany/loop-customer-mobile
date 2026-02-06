import { StyleSheet, Image, Platform } from "react-native";
import Button from "../../components/Button";
import NewStyles from "../../styles/NewStyles";
import { ImageBackground } from "expo-image";
import { useTranslation } from "react-i18next";

export default function SignInLanding({ navigation }) {
  const { t } = useTranslation();
  return (
    <ImageBackground cachePolicy={'memory-disk'} source={Platform.OS === 'web' ? require('../../assets/loopbackground.webp') : require("../../assets/moon.jpg")} style={[NewStyles.container, { backgroundColor: '#020305' }, NewStyles.center]} contentPosition={'center'} contentFit={"cover"}>

      <Image source={require("../../assets/logo.png")} style={NewStyles.logo} resizeMode="contain" />
      <Button
        style={{ width: "70%" }}
        title={t("Log in")}
        onPress={() => {
          navigation.navigate("LoginScreen");
        }}
      />
      <Button
        style={{ width: "70%" }}
        title={t("Sign up")}
        onPress={() => {
          navigation.navigate("MainSignIn");
        }}
      />

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
