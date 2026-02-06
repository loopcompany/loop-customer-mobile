import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Pressable, Platform } from "react-native";
import Footer from "../../screens/Footer";
import ScreenHeaders from "../../components/ScreenHeaders";
import NewStyles from "../../styles/NewStyles";
import { themeColor0, themeColor1, themeColor3 } from "../../theme/Color";
import CustomStatusBar from "../../components/CustomStatusBar";
import { ImageBackground } from "expo-image";

const Grouping = ({ navigation }) => {
  const [isOrganizationalGuideOpen, setIsOrganizationalGuideOpen] = useState(false);
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
        title="سازمانی / شرکتی"
      />

      {/* Background with image */}
      <ImageBackground
        cachePolicy={"memory-disk"}
        source={Platform.OS === 'web' ? require('../../assets/loopbackground.webp') : require("../../assets/moon.jpg")} 
        style={[NewStyles.container, { backgroundColor: "#020305" }]}
        contentPosition={"center"}
        contentFit="cover"
      >
        {/* Top section with header text */}
        <Pressable
        onPress={()=>{navigation.navigate('OrganizationTermsScreen')}}
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
        </Pressable>

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
                  fontFamily: "VazirBold",
                  textAlign: "center",
                }}
              >
          
                سازمانی / شرکتی
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

            {/* Login button for organizational */}
            <TouchableOpacity
              onPress={handleOrganizationalLogin}
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
                  fontFamily: "VazirBold",
                  textAlign: "center",
                }}
              >
                ورود به حساب کاربری
              </Text>
            </TouchableOpacity>
          </View>

          {/* Company Section */}
          <View
            style={{
              width: "100%",
              alignItems: "center",
            }}
          >

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
          {/* First yellow section - Accordion Guide */}
          <View
            style={{
              width: "100%",
              marginBottom: 10,
            }}
          >
            {/* Header - clickable */}
            <TouchableOpacity
              onPress={() => setIsOrganizationalGuideOpen(!isOrganizationalGuideOpen)}
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
                راهنمای پنل سازمانی / دولتی 
              </Text>
              {/* Red arrow pointing down or up based on state */}
              <View
                style={{
                  marginLeft: 15,
                  width: 0,
                  height: 0,
                  borderLeftWidth: 8,
                  borderRightWidth: 8,
                  ...(isOrganizationalGuideOpen
                    ? {
                        borderBottomWidth: 12,
                        borderLeftColor: "transparent",
                        borderRightColor: "transparent",
                        borderBottomColor: "#ff0000",
                      }
                    : {
                        borderTopWidth: 12,
                        borderLeftColor: "transparent",
                        borderRightColor: "transparent",
                        borderTopColor: "#ff0000",
                      }),
                }}
              />
            </TouchableOpacity>

            {/* Content - collapsible */}
            {isOrganizationalGuideOpen && (
              <View
                style={{
                  width: "100%",
                  backgroundColor: "rgba(255, 235, 59, 0.95)",
                  paddingVertical: 12,
                  paddingHorizontal: 15,
                  borderBottomWidth: 2,
                  borderBottomColor: "#000",
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "VazirBold",
                    color: "#000",
                    textAlign: "right",
                    lineHeight: 20,
                  }}
                >
                  پنل سازمانی / شرکتی لوپ برای کاربرانی که دارای تعداد زیادی از محصولات / دستگاه / قطعات کامپیوتری می‌باشد و ثبت نام در این پنل به منظور تسریع در انجام خدمات و نیز کاهش درصد هزینه‌ها انجام گردیده است.
                </Text>
              </View>
            )}
          </View>

          {/* Second yellow section - Full width banner */}
         
        </View>
      </ImageBackground>
    </View>
  );
};

export default Grouping;
