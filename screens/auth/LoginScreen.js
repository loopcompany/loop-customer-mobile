import React, { useState } from "react";
import {
  Text,
  TextInput,
  Image,
  Platform,
  ImageBackground,
  StyleSheet,
  ScrollView,
  ToastAndroid,
  View,
  TouchableOpacity
} from "react-native";
import TransparentButton from "../../components/TransparentButton";
import Button from "../../components/Button";
import axios from "axios";
import { uri } from "../../services/URL";
import { handleError, showToastOrAlert } from "../../helpers/Common";
import NewStyles from "../../styles/NewStyles";
import { themeColor0, themeColor1, themeColor10 } from "../../theme/Color";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  // missing state variables used later in the component
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [captcha, setCaptcha] = useState("");

  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  // const sendVerificationCode = async () => {
  //   try {
  //     const response = await axios.post(`${uri}/sendVerificationCode`, {
  //       phone: phone,
  //     });

  //     if (response?.data?.success == "success") {
  //       setError("");
  //       navigation.navigate("ResetPasswordScreen", { phone: phone });
  //     } else if (response?.data?.error == "error") {
  //       setError(
  //         `${t(
  //           "Failed to send code. Please make sure the phone number you entered is correct."
  //         )}`
  //       );
  //     }
  //   } catch (error) {
  //     console.log("====================================");
  //     console.log(error);
  //     console.log("====================================");
  //     showToastOrAlert("خطایی رخ داده است.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const sendVerificationCode = async () => {
  //   try {
  //     const response = await axios.post(`${uri}/sendVerificationCode`, {
  //       phone: phone,
  //     });
  //     console.log(response?.data);
  //     if (response?.data?.success == "success") {
  //       navigation.navigate("ResetPasswordScreen",{phone:phone});

  //     } else if (response?.data?.error == "error") {
  //       showToastOrAlert("خطا رخ داد");
  //     }
  //   } catch (error) {
  //     handleError(error, t);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const sendVerificationCode = async () => {
    try {
      const response = await axios.post(`${uri}/sendVerificationCode`, {
        phone: phone,
      });
      console.log(response);
      
      if (response?.data?.success == "success") {
        navigation.navigate("ResetPasswordScreen", { phone: phone });
      }
    } catch (error) {
      handleError(error,t);
    } finally {
      setLoading(false);
    }
  };

  // simple captcha generator for UI (4 digits)
  const [captchaValue, setCaptchaValue] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const generateCaptcha = () => setCaptchaValue(Math.floor(1000 + Math.random() * 9000).toString());

  const validatePhone = () => {
    if (phone.match(/^09\d{9}$/)) {
      return true;
    } else {
      showToastOrAlert("فرمت شماره تلفن درست نیست");
      return false;
    }
  };
  const style = { backgroundColor: "red" };
  return (
    <ImageBackground
      source={require("../../assets/moon.jpg")}
      style={NewStyles.container}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require("../../assets/logo.png")}
          style={NewStyles.logo}
          resizeMode={"contain"}
        />

        <View style={styles.inputGroup}>

          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                     placeholder="شماره موبایل خود را وارد کنید"
                     placeholderTextColor={themeColor10.bgColor(0.9)}
                     value={phone}
                     onChangeText={setPhone}
                     keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
      
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
            placeholder="رمز عبور"
            placeholderTextColor={themeColor10.bgColor(0.7)}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <View style={NewStyles.rowWrapper}>
            <View style={NewStyles.row}>
              <TouchableOpacity
                onPress={() => setRememberMe(!rememberMe)}
                style={styles.checkbox}
              >
                <View
                  style={
                    rememberMe ? styles.checkboxChecked : styles.checkboxEmpty
                  }
                />
              </TouchableOpacity>
              <Text style={NewStyles.title10}>ذخیره رمز عبور</Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                navigation.navigate("SignInScreen");
              }}
            >
              <Text style={NewStyles.title10}>فراموشی رمز عبور</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.inputGroup}>
    
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            {/* refresh icon (circular) */}
            <TouchableOpacity onPress={generateCaptcha} style={styles.refreshButton}>
              <Text style={{ fontSize: 18, color: '#fff' }}>↺</Text>
            </TouchableOpacity>

            {/* captcha visual box */}
            <View style={styles.captchaImage}>
              <Text style={styles.captchaText}>{captchaValue}</Text>
            </View>

            {/* security code button */}
            <TouchableOpacity style={styles.securityButton} onPress={() => {
              if (validatePhone()) {
                setLoading(true);
                sendVerificationCode();
              }
            }}>
              <Text style={styles.securityButtonText}>کد امنیتی</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Button
          style={{ width: "100%" }}
          title={"ورود"}
          loading={loading}
          // onPress={() => {
          //   navigation.navigate("FolderScreen");
          // }}
          onPress={() => {
            if (validatePhone()) {
              setLoading(true);
              sendVerificationCode();
            } else {
              setError("The mobile number you entered is not valid.");
            }
          }}
        />

        <TransparentButton
          customTextStyle={{ color: themeColor1.bgColor(1) }}
          title={"ثبت نام کاربر جدید"}
          onPress={() => {
            navigation.navigate("MainScreen");
          }}
        />
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
    backgroundColor: themeColor0.bgColor(0.22),
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 150,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 20,
    gap: 5,
  },
  label: {
    fontFamily: "VazirLight",
    color: "#fff",
    fontSize: 16,
    marginBottom: 5,
    textAlign: "right",
  },
  input: {
    backgroundColor: "#000",
    color: "#fff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#00f",
    textAlign: "right",
    writingDirection: "rtl",
  },
  checkboxContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 10,
  },
  checkbox: {
    marginHorizontal: 5,
  },
  checkboxEmpty: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: themeColor0.bgColor(1),
    borderRadius: 4,
  },
  checkboxChecked: {
    width: 18,
    height: 18,
    backgroundColor: themeColor1.bgColor(1),
    borderRadius: 4,
  },
  checkboxLabel: {
    color: "#fff",
    marginRight: 10,
    fontSize: 14,
    textAlign: "right",
  },
  forgotText: {
    color: "white",
    marginRight: "90",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#3366ff",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 60,
    marginTop: 20,
    shadowColor: "#00f",
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 5,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  captchaImage: {
    width: 100,
    height: 35,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbb'
  },
  captchaText: {
    fontSize: 22,
    fontFamily: 'VazirBold'
  },
  refreshButton: {
    width: 34,
    height: 34,
    borderRadius: 18,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  securityButton: {
    backgroundColor: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  securityButtonText: {
    fontFamily: 'VazirBold'
  },
  registerText: {
    color: "#00f",
    marginTop: 20,
    fontSize: 16,
  },
});
