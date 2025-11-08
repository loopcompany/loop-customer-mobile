import React, { createContext, useContext, useState } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { themeColor0, themeColor10, themeColor13, themeColor4, themeColor1 } from '../theme/Color';
import NewStyles from '../styles/NewStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import useLogout from '../hooks/useLogout';

// Create Context
const MenuContext = createContext();

// Menu Provider Component
export const MenuProvider = ({ children }) => {
    const navigation = useNavigation();
    const { logoutWithConfirmation, isLoggingOut } = useLogout();
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuItems] = useState([
        { id: 22, title: "کیف پول لوپ", screen: "Increase" },
        { id: 21, title: "حریم خصوصی", screen: "PrivacyScreen" },
        { id: 20, title: "قوانین / درباره لوپ", screen: "AboutScreen" },
        { id: 19, title: " سوالات متداول", screen: "LearnMoreScreen" },
        { id: 18, title: "یادداشت", screen: "NotesScreen" },
        { id: 17, title: " ضمانت نامه / گارانتی", screen: "WarrantyScreen" },
        { id: 16, title: "نظرات و پیشنهادات", screen: "FeedbackSurveyScreen" },
        { id: 15, title: " ثبت/پیگیری تخلف", screen: "ViolationReportScreen" },
        { id: 14, title: "نرخنامه", screen: "RateListScreen" },
        { id: 13, title: "عیوب سرویس / محصول", screen: "ProductIssueScreen" },
        { id: 12, title: "طرح‌های تشویقی", screen: "Club" },
        { id: 11, title: "فکروبکر", screen: "GameMenu" },
        { id: 10, title: "ثبت‌نام دوره‌های آموزشی ", screen: "TrainingRegistrationScreen", },
        { id: 9, title: "آدرس‌های منتخب", screen: "AddressScreen" },
        { id: 7, title: "حساب کاربری", screen: "Profile" },
        { id: 6, title: "پیام", screen: "MessageScreen" },
        { id: 5, title: "لغوشده ها", screen: "CanceledOrdersScreen" },
        { id: 4, title: "تراکنش‌ها", screen: "TransactionsScreen" },
        { id: 3, title: "سفارش‌ها", screen: "OrdersScreen" },
        { id: 2, title: "سازمانی / شرکتی", screen: "CorporateScreen" },
        { id: 1, title: "سفارش‌های جاری / رزرو", screen: "DeviceOrderSummary" },
    ]);

    const openMenu = () => {
        setMenuVisible(true);
    };

    const closeMenu = () => {
        setMenuVisible(false);
    };

    const navigateToScreen = (screenName) => {
        navigation.navigate('MainApp', { screen: screenName });
        closeMenu();
    };

    const callSupport = () => {
        Linking.openURL(`tel:02121164552`);
    };

    const renderMenuItem = ({ item }) => (
        <TouchableOpacity
            style={styles.item}
            onPress={() => navigateToScreen(item.screen)}
        >
            <Text style={NewStyles.text10}>{item.title}</Text>
        </TouchableOpacity>
    );

    const contextValue = {
        menuVisible,
        openMenu,
        closeMenu,
        navigateToScreen,
        callSupport,
        menuItems,
    };

    return (
        <MenuContext.Provider value={contextValue}>
            <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={{ flex: 1 }}>
                {children}

                {/* Global Footer - همیشه در پایین تمام صفحات نمایش داده می‌شود */}
                <View style={[styles.footer, NewStyles.rowWrapper]}>
                    <TouchableOpacity onPress={callSupport}>
                        <Text style={NewStyles.text4}>21164552</Text>
                    </TouchableOpacity>
                    <Text style={NewStyles.text4}>فا</Text>
                    <TouchableOpacity style={styles.supportButton}>
                        <Text style={NewStyles.text4}>پشتیبانی</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={openMenu}>
                        <Image
                            source={require("../assets/logo.png")}
                            style={styles.footerLogo}
                        />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Menu Modal */}
            <Modal
                transparent={true}
                visible={menuVisible}
                onRequestClose={closeMenu}
                animationType="fade"
            >
                <TouchableWithoutFeedback onPress={closeMenu}>
                    <View style={styles.coverlist2}>
                        <View style={styles.coverlist}>
                            <View style={{backgroundColor:themeColor0.bgColor(1)}}>
                                <FlatList
                                    inverted
                                    data={menuItems}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={renderMenuItem}
                                    contentContainerStyle={styles.list}
                                    showsVerticalScrollIndicator={false}
                                />
                                
                                {/* دکمه خروج */}
                                <View style={styles.logoutContainer}>
                                    <TouchableOpacity
                                        style={[styles.logoutBtn, isLoggingOut && styles.logoutBtnDisabled]}
                                        onPress={logoutWithConfirmation}
                                        disabled={isLoggingOut}
                                    >
                                        <Ionicons name="power" size={20} color="#fff" />
                                        <Text style={styles.logoutText}>
                                            {isLoggingOut ? 'در حال خروج...' : 'خروج از حساب کاربری'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </MenuContext.Provider>
    );
};

// Hook to use Menu Context
export const useMenu = () => {
    const context = useContext(MenuContext);
    if (!context) {
        throw new Error('useMenu must be used within a MenuProvider');
    }
    return context;
};

// Styles
const styles = StyleSheet.create({
    coverlist: {
        width: '80%',
        backgroundColor: themeColor0.bgColor(0),
        height: '92%',
        justifyContent:'flex-end'
    },
    coverlist2: {
        flex: 1
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
        backgroundColor: themeColor0.bgColor(1),
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 5,
    },
    list: {
        paddingVertical: "20",
        paddingHorizontal: "16",
    },
    item: {
        backgroundColor: themeColor4.bgColor(1),
        paddingVertical: 2,
        paddingHorizontal: 20,
        width: "100%",
    },
    logoutContainer: {
        padding: 10,
        backgroundColor: themeColor0.bgColor(1),
    },
    logoutBtn: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#d32f2f',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
    },
    logoutBtnDisabled: {
        backgroundColor: '#999',
    },
    logoutText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'VazirBold',
    },
});