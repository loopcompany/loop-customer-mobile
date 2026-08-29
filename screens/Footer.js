import React, { useState, useEffect } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { themeColor0, themeColor4 } from "@theme/Color";
import { spacing } from "@theme/Spacing";
import { radius } from "@theme/Radius";
import { fontSize } from "@theme/Typography";
import NewStyles from "@styles/NewStyles";

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
    { id: 11, title: "فکروبکر", screen: "IdeaBoxScreen" },
    { id: 12, title: "طرح‌های تشویقی", screen: "Club" },
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

  // ساعت سینی سیستم - الهام‌گرفته از ساعت گوشه‌ی تسک‌بار ویندوز 7
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);
  const timeLabel = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });

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

      {/* نوار پایین با الهام از تسک‌بار شیشه‌ای (Aero) ویندوز 7:
          دکمه‌ی استارت گرد سمت چپ، دکمه‌های سنجاق‌شده‌ی وسط، سینی سیستم + ساعت سمت راست */}
      <View style={styles.taskbar}>
        <LinearGradient
          colors={["#5b8fd6", "#2f5fa8", "#0f2d5c"]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
        <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={["rgba(255,255,255,0.35)", "rgba(255,255,255,0)"]}
          style={styles.glassSheen}
          pointerEvents="none"
        />

        <View style={styles.taskbarRow}>
          <TouchableOpacity
            onPress={() => setMenuVisible(!menuVisible)}
            style={styles.startOrbWrap}
            activeOpacity={0.75}
          >
            <View style={styles.startOrbGlow} pointerEvents="none" />
            <Image source={require("@assets/icon.png")} style={styles.startOrb} />
            <View style={styles.startOrbShine} pointerEvents="none" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { Linking.openURL(`tel:02191693909`) }}
            style={styles.taskbarButton}
            activeOpacity={0.75}
          >
            <Ionicons name="call-outline" size={16} color={themeColor4.bgColor(1)} />
            <Text style={styles.taskbarButtonText}>91693909</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.taskbarButton} activeOpacity={0.75}>
            <Ionicons name="headset-outline" size={16} color={themeColor4.bgColor(1)} />
            <Text style={styles.taskbarButtonText}>پشتیبانی</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <View style={styles.trayCluster}>
            <Ionicons name="globe-outline" size={14} color={themeColor4.bgColor(0.9)} />
            <Text style={styles.trayText}>فا</Text>
            <View style={styles.trayDivider} />
            <Text style={styles.trayClock}>{timeLabel}</Text>
          </View>
        </View>
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

  taskbar: {
    width: "100%",
    overflow: "hidden",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.25)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  glassSheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
  },
  taskbarRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 64,
  },
  startOrbWrap: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  startOrb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255,215,0,0.85)",
  },
  startOrbGlow: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,215,0,0.18)",
  },
  startOrbShine: {
    position: "absolute",
    top: 5,
    left: 11,
    width: 20,
    height: 9,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  taskbarButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginRight: spacing.sm,
  },
  taskbarButtonText: {
    color: "#fff",
    fontSize: fontSize.xs,
    fontFamily: "VazirBold",
    marginLeft: 6,
  },
  trayCluster: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  trayText: {
    color: "#fff",
    fontSize: fontSize.xs,
    fontFamily: "VazirBold",
    marginLeft: 4,
  },
  trayDivider: {
    width: 1,
    height: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginHorizontal: spacing.sm,
  },
  trayClock: {
    color: "#fff",
    fontSize: fontSize.sm,
    fontFamily: "VazirBold",
    letterSpacing: 0.5,
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
