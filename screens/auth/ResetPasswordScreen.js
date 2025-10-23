import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Platform,
  ImageBackground,
  StyleSheet,
  ScrollView,
} from "react-native";
import NewStyles from "../../styles/NewStyles";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { themeColor0, themeColor3 } from "../../theme/Color";
import { setToken } from "../../slices/authSlice";
import axios from "axios";
import { uri } from "../../services/URL";
import Button from "../../components/Button";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage"; 
export default function ResetPasswordScreen({ navigation,route }) {
  const params = route?.params;
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");

  const dispatch = useDispatch();
  const [phone, setPhone] = useState("");
  // const [timer, setTimer] = useState(120);
  const [error, setError] = useState("");
  const ref = useBlurOnFulfill({ value, cellCount: 6 });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  // const codeVerification = async () => {
  //   try {
  //     const response = await axios.post(`${uri}/codeVerification`, {
  //       phone: params?.phone,
  //       code: value,
  //     });
  //     if (response?.data?.success == "success") {
  //       setError("");
  //     } else if (response?.data?.error == "error") {
  //       setError("The entered code is not correct!");
  //     }
  //   } catch (error) {
  //     console.log(error, route.params?.phone, "**");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const codeVerification = async () => {
    try {
      const response = await axios.post(`${uri}/codeVerification`, {
        phone: params?.phone,
        code: value,
      });
      if (response?.data?.success == "success") {
        const userId = JSON.stringify(response?.data?.userId);
        const userToken = response?.data?.token?.replace('"', "");
        await AsyncStorage.setItem("ui", userId);
        await AsyncStorage.setItem("ut", userToken);
        // ست کوکی 
        dispatch(setToken(userToken));
        navigation.navigate("FolderScreen")
      } 
      console.log(response?.data);
      
    } catch (error) {
      console.log(error);
    } finally {



      setLoading(false);
  
    }
  };
  return (
    <ImageBackground
      source={require("../../assets/moon.jpg")}
      style={styles.background}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* کد تأیید شبیه مستطیل‌های شش‌تایی */}
        {/* <View style={styles.codeContainer}>
          {Array(6).fill().map((_, index) => (
            <View key={index} style={styles.codeBox} />
          ))}
        </View> */}

        {/* لوگو */}
        <Image
          source={require("../../assets/logo.png")}
          style={NewStyles.logo}
          resizeMode="contain"
        />
        <View style={NewStyles.center}>
          <CodeField
            ref={ref}
            {...props}
            value={value}
            onChangeText={(text) => {
              setValue(text);
            }}
            cellCount={6}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete={Platform.select({
              android: "sms-otp",
              default: "one-time-code",
            })}
            renderCell={({ index, symbol, isFocused }) => (
              <Text
                key={index}
                style={[styles.cell, NewStyles.border10]}
                onLayout={getCellOnLayoutHandler(index)}
              >
                {symbol || (isFocused ? <Cursor /> : null)}
              </Text>
            )}
          />

          {error && <Text style={NewStyles.text6}>{error}</Text>}
          <Button
            title={"Submit"}
            loading={loading}
            onPress={() => {
              if (value?.length === 6) {
                setLoading(true);
                codeVerification();
              } else {
                setError("Please enter the code correctly.");
              }
            }}
          />
        </View>
        {/* فیلد رمز جدید */}
        {/* <TextInput
          style={styles.input}
          placeholder="رمز عبور جدید خود را وارد کنید"
          placeholderTextColor="#555"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        /> */}

        {/* فیلد تکرار رمز */}
        {/* <TextInput
          style={styles.input}
          placeholder="مجدد رمز عبور جدید را وارد کنید"
          placeholderTextColor="#555"
          secureTextEntry
          value={repeatPassword}
          onChangeText={setRepeatPassword}
        /> */}

        {/* پیام موفقیت */}
        <Text style={styles.successText}>
          رمز عبور جدید با موفقیت ثبت شد / ورود مجدد
        </Text>
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
    justifyContent: "space-evenly",
    alignItems: "center",
    padding: 20,
  },
  codeContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 80,
    width: "90%",
  },
  codeBox: {
    width: 40,
    height: 50,
    backgroundColor: "#1f4ed8",
    borderRadius: 5,
    marginHorizontal: 4,
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 40,
  },
  input: {
    backgroundColor: "#fff",
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    fontSize: 16,
    marginVertical: 10,
    textAlign: "right",
  },
  successText: {
    marginTop: 30,
    color: "#e60000",
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
  },
  cell: {
    width: 40,
    height: 40,
    backgroundColor: themeColor3.bgColor(0.7),
    fontSize: 20,
    color: themeColor0.bgColor(1),
    fontFamily: "VazirLight",
    textAlign: "center",
    lineHeight: 40,
    marginHorizontal: 5,
  },
});
