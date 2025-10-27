import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  Linking,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { themeColor0, themeColor10, themeColor13, themeColor4 } from "../theme/Color";
import NewStyles from "../styles/NewStyles";

export default function Footer() {
  const navigation = useNavigation();
  const [menuItems, setMenuItems] = useState([
    { id: 1, title: "سفارش‌های جاری / رزرو", screen: "DeviceOrderSummary" },
    { id: 2, title: "سازمانی / شرکتی", screen: "CorporateScreen" },
    { id: 3, title: "سفارش‌ها", screen: "OrdersScreen" },
    { id: 4, title: "تراکنش‌ها", screen: "TransactionsScreen" },
    { id: 5, title: "لغوشده ها", screen: "CanceledOrdersScreen" },
    { id: 6, title: "پیام", screen: "MessageScreen" },
    { id: 7, title: "حساب کاربری", screen: "Profile" },
    // { id: 8, title: "حریم خصوصی", screen: "PrivacyScreen" },
    { id: 9, title: "آدرس‌های منتخب", screen: "AddressScreen" },
    {
      id: 10,
      title: "ثبت‌نام دوره‌های آموزشی ",
      screen: "TrainingRegistrationScreen",
    },
    { id: 11, title: "فکروبکر", screen: "Fekrobekr" },
    { id: 12, title: "طرح‌های تشویقی", screen: "IncentivePlansScreen" },
    { id: 13, title: "عیوب سرویس / محصول", screen: "ProductIssueScreen" },
    { id: 14, title: "نرخنامه", screen: "RateListScreen" },
    { id: 15, title: " ثبت/پیگیری تخلف", screen: "ViolationReportScreen" },
    { id: 16, title: "نظرات و پیشنهادات", screen: "FeedbackSurveyScreen" },
    { id: 17, title: " ضمانت نامه / گارانتی", screen: "WarrantyScreen" },
    { id: 18, title: "یادداشت", screen: "NotesScreen" },
    { id: 19, title: " سوالات متداول", screen: "LearnMoreScreen" },
    { id: 20, title: "قوانین / درباره لوپ", screen: "AboutScreen" },
    { id: 21, title: "حریم خصوصی", screen: "PrivacyScreen" },
  ]);
  const [menuVisible, setMenuVisible] = useState(false);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        navigation.navigate(item.screen);
        setMenuVisible(false)
      }}
    >
      <Text style={NewStyles.text10}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View>
      <Modal
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => {
          setMenuVisible(false);
        }}
        animationType="fade"

      >
        <TouchableWithoutFeedback onPress={() => {
          setMenuVisible(false);
        }}>

          <View style={styles.coverlist2}>
            <View style={styles.coverlist}>
              <View>
                <FlatList
                  data={menuItems}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderItem}
                  contentContainerStyle={styles.list}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <View style={[styles.footer, NewStyles.rowWrapper]}>




        <TouchableOpacity onPress={() => { Linking.openURL(`tel:02121164552`) }}>
          <Text style={NewStyles.text4}>21164552</Text>
        </TouchableOpacity>
        <Text style={NewStyles.text4}>فا</Text>
        <TouchableOpacity style={styles.supportButton}>
          <Text style={NewStyles.text4}>پشتیبانی</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.footerLogo}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    resizeMode: "cover",
    paddingTop: 60,
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: 5,
  },
  logo: {
    width: 160,
    height: 90,
    resizeMode: "contain",
  },
  folderList: {
    // flexDirection: "row",
    // flexWrap: "wrap",
    // justifyContent: "flex-start",
    // paddingHorizontal: 20,
    flex: 1,
  },
  coverlist: {
    width: '80%',
    backgroundColor: themeColor0.bgColor(0.9),
    height:'90%'
  },
  coverlist2: {
    flex:1
   
  },
  folderItem: {
    width: 80,
    alignItems: "center",
    margin: 12,
    // flexDirection: 'row-reverse',
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    width: "50%",
  },
  folderIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  folderText: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },

  footer: {
backgroundColor: themeColor13.bgColor(1),
    width: "100%",
    paddingHorizontal: 15,
  },
  footerLogo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  supportButton: {
    backgroundColor: "#005b9f",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 5,
  },
  supportText: {
    color: "#fff",
    fontWeight: "bold",
  },
  language: {
    color: "#fff",
    fontSize: 16,
  },
  phone: {
    color: "#fff",
    fontSize: 16,
  },
  menuBox: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 8,
    padding: 10,
    width: "90%",
    maxHeight: "70%",
    marginBottom: 20,
  },
  menuScroll: {
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 10,
  },
  menuText: {
    fontSize: 14,
    marginRight: 10,
    color: "#000",
  },
  list: {
    paddingVertical: "20",
    paddingHorizontal: "16",
    // backgroundColor: themeColor4.bgColor(1),

  },
  item: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 20,
    // borderRadius: 10,
    // marginBottom: 10,
    // borderWidth: 1,
    // borderColor: '#ddd',
    width: "100%",
  },
  title: {
    color: "#333",
    fontSize: 16,
    textAlign: "right",
    fontWeight: "bold",
  },
});
