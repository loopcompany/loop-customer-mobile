import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  TextInput,
  Platform,
  ToastAndroid,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";

import { uri } from "../../services/URL";
import { fetchUser } from "../../slices/userSlice";

import {
  themeColor0,
  themeColor1,
  themeColor12,
  themeColor3,
  themeColor4,
  themeColor5,
} from "../../theme/Color";
import Button from "../../components/Button";
import TransparentButton from "../../components/TransparentButton";
import { setToken } from "../../slices/authSlice";
import { useTranslation } from "react-i18next";
import NewStyles from "../../styles/NewStyles";
import { useNavigation } from "@react-navigation/native";
import {
  formatTime,
  persianAppName,
  showToastOrAlert,
} from "../../helpers/Common";

export default function LoginModal({ loginModal, setLoginModal }) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [loginWithPassword, setLoginWithPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [value, setValue] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(120);

  const ref = useBlurOnFulfill({ value, cellCount: 6 });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const validatePhone = () => {
    if (phone.match(/^09\d{9}$/)) {
      return true;
    } else {
      return false;
    }
  };
  useEffect(() => {
    if (code) {
      if (timer === 0) return;

      const intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [timer, code]);
  const validatePassword = () => {
    const pattern =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
    if (password.match(pattern)) {
      return true;
    } else {
      return false;
    }
  };

  const sendVerificationCode = async () => {
    try {
      const response = await axios.post(`${uri}/sendVerificationCode`, {
        phone: phone,
      });
      console.log(response?.status);
      console.log(response?.data);

      if (response?.data?.success == "success") {
        setCode(true);
        setError("");
        setTimer(120);
      } else if (response?.data?.error == "error") {
        setError(
          `${t(
            "Failed to send code. Please make sure the phone number you entered is correct."
          )}`
        );
      }
    } catch (error) {
      Platform.OS === "android"
        ? ToastAndroid.show(`${t("Something went wrong!")}`, ToastAndroid.SHORT)
        : alert(`${t("Something went wrong!")}`);
    } finally {
      setLoading(false);
    }
  };

  const codeVerification = async () => {
    try {
      const response = await axios.post(`${uri}/codeVerification`, {
        phone: phone,
        code: value,
      });
      if (response?.data?.success == "success") {
        const userId = JSON.stringify(response?.data?.userId);
        const userToken = response?.data?.token?.replace('"', "");
        await AsyncStorage.setItem("userId", userId);
        await AsyncStorage.setItem("userToken", userToken);
        dispatch(setToken(userToken));
        dispatch(fetchUser(userToken));
        setPhone("");
        setValue("");
        setCode(false);
        setError("");
        setLoginModal(false);
      } else if (response?.data?.error == "error") {
        setValue("");
        setError(`${t("The entered code is not correct!")}`);
      }
    } catch (error) {
      console.log(error);

      Platform.OS === "android"
        ? ToastAndroid.show(`${t("Something went wrong!")}`, ToastAndroid.SHORT)
        : alert(`${t("Something went wrong!")}`);
    } finally {
      setLoading(false);
    }
  };
  const passwordVerification = async () => {
    try {
      const response = await axios.post(`${uri}/passwordVerification`, {
        phone: phone,
        password: password,
      });
      if (response?.data?.success == "success") {
        const userId = JSON.stringify(response?.data?.userId);
        const userToken = response?.data?.token?.replace('"', "");
        await AsyncStorage.setItem("userId", userId);
        await AsyncStorage.setItem("userToken", userToken);
        dispatch(fetchUser(userToken));
        dispatch(setToken(userToken));
        setPhone("");
        setValue("");
        setCode(false);
        setError("");
        setLoginModal(false);
      } else if (response?.data?.error == "error") {
        setValue("");
        setError(`${t("The entered password is not correct!")}`);
      }
    } catch (error) {
      Platform.OS === "android"
        ? ToastAndroid.show(`${t("Something went wrong!")}`, ToastAndroid.SHORT)
        : alert(`${t("Something went wrong!")}`);
    } finally {
      setLoading(false);
    }
  };
  
}
