import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { ImageBackground } from "expo-image";
import Footer from "../../screens/Footer";
import ScreenHeaders from "../../components/ScreenHeaders";
import NewStyles from "../../styles/NewStyles";
import { themeColor0, themeColor1, themeColor3 } from "../../theme/Color";
import CustomStatusBar from "../../components/CustomStatusBar";

const Method = ({ navigation }) => {
  const handleOrganizationalLogin = () => {
    navigation.navigate("Login");
  };

  const handleCompanyLogin = () => {
    // Navigate to company login
    navigation.navigate("Login"); // You can create a separate company login screen if needed
  };

  return (
    <View style={[NewStyles.container, { flex: 1 }]}>
      <CustomStatusBar />
      <ScreenHeaders
        title="سازمانی / دولتی"
      />

      {/* Background with image */}
      <ImageBackground
        cachePolicy={"memory-disk"}
        source={require("../../assets/moon.jpg")}
        style={[NewStyles.container, { backgroundColor: "#020305" }]}
        contentPosition={"center"}
        contentFit="contain"
      >
        {/* Top section with header text */}
        <View
          style={{
            alignItems: "center",
            paddingTop: 30,
            paddingBottom: 30,
            paddingHorizontal: 25,
          }}
        >
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: 8,
              paddingVertical: 6,
              paddingHorizontal: 15,
              borderWidth: 1.5,
              borderColor: "#333",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: "VazirBold",
                textAlign: "center",
                color: "#333",
                lineHeight: 18,
              }}
            >
              قوانین و مقررات سامانه در پنل سازمانی / شرکتی
            </Text>
          </View>
        </View>

        {/* Central tower-like structure */}
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "flex-start",
            paddingHorizontal: 20,
            paddingTop: 100,
          }}
        >
          {/* Organizational Section */}
          <View
            style={{
              width: "100%",
              marginBottom: 50,
              alignItems: "center",
            }}
          >
            {/* Main header - سازمانی / دولتی */}
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("List");
              }}
              style={{
                width: "75%",
                backgroundColor: "#1a4480",
                borderRadius: 12,
                paddingVertical: 18,
                alignItems: "center",
                justifyContent: "center",
                elevation: 8,
                shadowColor: "#1a4480",
                shadowOpacity: 0.5,
                shadowRadius: 8,
                position: "relative",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  color: "#ffeb3b",
                  fontSize: 20,
                  fontWeight: "bold",
                  fontFamily: "VazirBold",
                  textAlign: "center",
                }}
              >
                {" "}
                انتخاب جامع
              </Text>
              {/* Arrow down */}
              <View
                style={{
                  position: "absolute",
                  bottom: -10,
                  alignSelf: "center",
                  width: 0,
                  height: 0,
                  borderLeftWidth: 12,
                  borderRightWidth: 12,
                  borderTopWidth: 10,
                  borderLeftColor: "transparent",
                  borderRightColor: "transparent",
                  borderTopColor: "#1a4480",
                }}
              />
            </TouchableOpacity>

            {/* Login button for organizational */}
          </View>

          {/* Company Section */}
          <View
            style={{
              width: "100%",
              alignItems: "center",
            }}
          >
            {/* Main header - شرکتی / خصوصی */}
            <View
              style={{
                width: "75%",
                backgroundColor: "#1a4480",
                borderRadius: 12,
                paddingVertical: 18,
                alignItems: "center",
                justifyContent: "center",
                elevation: 8,
                shadowColor: "#1a4480",
                shadowOpacity: 0.5,
                shadowRadius: 8,
                position: "relative",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  color: "#ffeb3b",
                  fontSize: 20,
                  fontWeight: "bold",
                  fontFamily: "VazirBold",
                  textAlign: "center",
                }}
              >
                انتخاب سیستماتیک
              </Text>
              {/* Arrow down */}
              <View
                style={{
                  position: "absolute",
                  bottom: -10,
                  alignSelf: "center",
                  width: 0,
                  height: 0,
                  borderLeftWidth: 12,
                  borderRightWidth: 12,
                  borderTopWidth: 10,
                  borderLeftColor: "transparent",
                  borderRightColor: "transparent",
                  borderTopColor: "#1a4480",
                }}
              />
            </View>

            {/* Login button for company */}
            <TouchableOpacity
              onPress={handleCompanyLogin}
              style={{
                width: "60%",
                backgroundColor: "#4a90e2",
                borderRadius: 8,
                paddingVertical: 10,
                marginTop: 8,
                alignItems: "center",
                justifyContent: "center",
                elevation: 4,
                shadowColor: "#4a90e2",
                shadowOpacity: 0.4,
                shadowRadius: 5,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: "bold",
                  fontFamily: "VazirBold",
                  textAlign: "center",
                }}
              >
                تامین قطعات/ کالا
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom yellow sections with arrows - positioned absolutely */}
        <View
          style={{
            position: "absolute",
            bottom: 20,
            right: 0,
            left: 0,
          }}
        >
          {/* First yellow section - Full width banner */}
          <View
            style={{
              width: "100%",
              backgroundColor: "#ffeb3b",
              paddingVertical: 8,
              marginBottom: 10,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 10,
            }}
          >
            {/* Dotted line */}
            <View
              style={{
                flex: 1,
                borderTopWidth: 2,
                borderTopColor: "#000",
                borderStyle: "dotted",
                marginRight: 10,
              }}
            />
            <Text
              style={{
                fontSize: 12,
                fontFamily: "VazirBold",
                color: "#000",
                textAlign: "center",
              }}
            >
              راهنمای انتخاب جامع
            </Text>
            {/* Red arrow pointing down */}
            <View
              style={{
                marginLeft: 15,
                width: 0,
                height: 0,
                borderLeftWidth: 8,
                borderRightWidth: 8,
                borderTopWidth: 12,
                borderLeftColor: "transparent",
                borderRightColor: "transparent",
                borderTopColor: "#ff0000",
              }}
            />
          </View>

          {/* Second yellow section - Full width banner */}
          <View
            style={{
              width: "100%",
              backgroundColor: "#ffeb3b",
              paddingVertical: 8,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 10,
            }}
          >
            {/* Dotted line */}
            <View
              style={{
                flex: 1,
                borderTopWidth: 2,
                borderTopColor: "#000",
                borderStyle: "dotted",
                marginRight: 10,
              }}
            />
            <Text
              style={{
                fontSize: 12,
                fontFamily: "VazirBold",
                color: "#000",
                textAlign: "center",
              }}
            >
              راهنمای انتخاب سیستماتیک
            </Text>
            {/* Red arrow pointing down */}
            <View
              style={{
                marginLeft: 15,
                width: 0,
                height: 0,
                borderLeftWidth: 8,
                borderRightWidth: 8,
                borderTopWidth: 12,
                borderLeftColor: "transparent",
                borderRightColor: "transparent",
                borderTopColor: "#ff0000",
              }}
            />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default Method;
