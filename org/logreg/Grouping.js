import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Footer from "../../screens/Footer";
import ScreenHeaders from "../../components/ScreenHeaders";
import NewStyles from "../../styles/NewStyles";
import { themeColor0, themeColor1, themeColor3 } from "../../theme/Color";
import CustomStatusBar from "../../components/CustomStatusBar";
import { ImageBackground } from "expo-image";
import Button from "../../components/Button";

const Grouping = ({ navigation }) => {
  const [isOrganizationalGuideOpen, setIsOrganizationalGuideOpen] = useState(false);
  const handleOrganizationalLogin = () => {
    navigation.navigate("Login");
  };


  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
      <CustomStatusBar />
      <ScreenHeaders title="سازمانی / شرکتی" onPressLeft={() => navigation.goBack()} onPressRight={() => { }} />
      <ImageBackground cachePolicy={"memory-disk"} source={Platform.OS === 'web' ? require("../../assets/loopbackground.webp") : require("../../assets/moon.jpg")} style={[NewStyles.container, { backgroundColor: "#020305" }]} contentPosition={"center"} contentFit="cover">

        <View
          style={{
            flex: 1,
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >


          {/* <Button title={'سازمانی / شرکتی'} /> */}
          <Button title={'ورود به حساب کاربری'} onPress={handleOrganizationalLogin} />
          <View style={{ backgroundColor: themeColor1.bgColor(1), padding: 10, ...NewStyles.border10, maxWidth:400 }}>
            <Text style={{ ...NewStyles.title10, textAlign: "center", }}>راهنمای پنل سازمانی / دولتی </Text>

            <Text style={[NewStyles.text10, { fontSize: 12, textAlign: 'center' }]}>پنل سازمانی / شرکتی لوپ برای کاربرانی که دارای تعداد زیادی از محصولات / دستگاه / قطعات کامپیوتری می‌باشد و ثبت نام در این پنل به منظور تسریع در انجام خدمات و نیز کاهش درصد هزینه‌ها انجام گردیده است.</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('OrganizationTermsScreen')}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: 6,
                paddingVertical: 10,
                paddingHorizontal: 15,
                borderWidth: 1,
                borderColor: themeColor3.bgColor(1),
                marginVertical: 10
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "VazirBold",
                  textAlign: "center",
                  color: "#333",
                  lineHeight: 16,
                }}
              >قوانین و مقررات سامانه در پنل سازمانی / شرکتی</Text>
            </TouchableOpacity>
          </View>





        </View>


        {/* First yellow section - Accordion Guide */}

      </ImageBackground>
    </SafeAreaView>
  );
};

export default Grouping;
