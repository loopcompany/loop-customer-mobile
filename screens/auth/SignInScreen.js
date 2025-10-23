import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import Button from "../../components/Button";
import NewStyles from "../../styles/NewStyles";
import { themeColor10, themeColor4 } from "../../theme/Color";
export default function SignInScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [email, setEmail] = useState("");

  return (
    <ImageBackground
      source={require("../../assets/moon.jpg")}
      style={styles.background}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[{flex:1}, NewStyles.center]}>
          <Image
            source={require("../../assets/logo.png")}
            style={NewStyles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={[{flex:1, width:'100%', gap:10}, NewStyles.center]}>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            placeholder="نام کاربری خود را وارد کنید"
            placeholderTextColor={themeColor10.bgColor(0.9)}
            value={username}
            onChangeText={setUsername}
          />

          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            placeholder="شماره موبایل خود را وارد کنید"
            placeholderTextColor={themeColor10.bgColor(0.9)}
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
          />

          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            placeholder="شماره ملی خود را وارد کنید"
            placeholderTextColor={themeColor10.bgColor(0.9)}
            value={nationalId}
            onChangeText={setNationalId}
            keyboardType="number-pad"
          />

          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            placeholder="آدرس ایمیل خود را وارد کنید"
            placeholderTextColor={themeColor10.bgColor(0.9)}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        <View style={[{flex:1, width:'100%'}, NewStyles.center]}>
          <Button
           
            title={"ارسال رمز اعتباری"}
            onPress={() => {
              navigation.navigate("ResetPasswordScreen");
            }}
          />
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logo: {
    width: 200,
    height: 100,
  },
  input: {
    backgroundColor: "#000",
    color: "#fff",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: "#00f",
    marginVertical: 10,
    width: "100%",
    fontSize: 16,
    textAlign: "right",
  },
  submitButton: {
    backgroundColor: "#3366ff",
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 50,
    marginTop: 30,
    shadowColor: "#00f",
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 5,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
