import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { themeColor0, themeColor10, themeColor13, themeColor4, themeColor1 } from '../theme/Color';
import NewStyles from '../styles/NewStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import useLogout from '../hooks/useLogout';
import { fetchContacts } from '../slices/contactSlice';

// Create Context
const MenuContext = createContext();

// Menu Provider Component
export const MenuProvider = ({ children }) => {
    const navigation = useNavigation();
    const { logoutWithConfirmation, isLoggingOut } = useLogout();
    const [menuVisible, setMenuVisible] = useState(false);
    const [currentRouteName, setCurrentRouteName] = useState('');

    // Get user type and auth token from Redux
    const userType = useSelector(state => state.auth.userType);
    const token = useSelector(state => state.auth.token);
    const isLoggedIn = !!token; // کاربر لاگین کرده است اگر token داشته باشد

    // صفحاتی که نباید Footer و Menu نمایش داده شود
    const screensWithoutMenu = [
        'Landing',
        'Welcome',
        'SignInLanding',
        'MainSignIn',
        'RegistrationVerificationScreen',
        'LoginScreen',
        'Login',
        'Register',
        'OTPVerification',
        'TestConnection',
        'OrganizationForgotPassword',
        'OrganizationResetPassword',
        'OrgPrivacy',
        'Grouping',
        'Method',
        'ForgotPassword',
        'ResetPasswordScreen',
        'AccessRestrictedScreen',
        'OrderMenuScreen',
    ];

    // Track current route
    useEffect(() => {
        const unsubscribe = navigation.addListener('state', () => {
            const currentRoute = navigation.getCurrentRoute();
            setCurrentRouteName(currentRoute?.name || '');
        });

        // Set initial route
        const currentRoute = navigation.getCurrentRoute();
        setCurrentRouteName(currentRoute?.name || '');

        return unsubscribe;
    }, [navigation]);

    // Check if current screen should show menu
    const shouldShowMenu = useMemo(() => {
        // اگر در لیست صفحات بدون منو باشد، منو نشان نده
        if (screensWithoutMenu.includes(currentRouteName)) {
            return false;
        }
        
        // اگر در صفحه قوانین سازمانی هستیم و کاربر لاگین نکرده، منو نشان نده
        if (currentRouteName === 'OrganizationTermsScreen' && !isLoggedIn) {
            return false;
        }
        
        // در غیر این صورت منو را نشان بده
        return true;
    }, [currentRouteName, isLoggedIn]);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchContacts());
    }, [])
    const contact = useSelector(state => state.contacts);

    // Generate menu items dynamically based on user type
    const menuItems = useMemo(() => {
        console.log('🔍 [MenuContext] Current userType:', userType);
        
        const baseMenuItems = [
            { id: 23, title: "ثبت سفارش", screen: "FolderScreen" },
            { id: 22, title: "کیف پول لوپ", screen: "Increase" },
            { id: 21, title: "حریم خصوصی", screen: "PrivacyScreen" },
            // برای سازمانی: قوانین سازمانی | برای عادی: قوانین عمومی
            { 
                id: 20, 
                title: userType === 'organization' ? "قوانین و مقررات سازمانی" : "قوانین / درباره لوپ", 
                screen: userType === 'organization' ? "OrganizationTermsScreen" : "AboutScreen"
            },
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
            { id: 8, title: "قراردادنامه", screen: "OrganizationContract", organizationOnly: true },
            { id: 7, title: "حساب کاربری", screen: "Profile" },
            { id: 6, title: "پیام", screen: "MessageScreen" },
            { id: 5, title: "لغوشده ها", screen: "CanceledOrdersScreen" },
            { id: 4, title: "تراکنش‌ها", screen: "TransactionsScreen" },
            { id: 3, title: "سفارش‌ها", screen: "OrdersScreen" },
        ];

        if (userType === 'organization') {
            console.log('✅ [MenuContext] Showing organization menu items');
            // Show all items including organization-only items
            return baseMenuItems;
        } else {
            console.log('ℹ️ [MenuContext] Filtering out organization-only items');
            // Filter out organization-only items
            return baseMenuItems.filter(item => !item.organizationOnly);
        }
    }, [userType]);

    const openMenu = () => {
        setMenuVisible(true);
    };

    const closeMenu = () => {
        setMenuVisible(false);
    };

    const navigateToScreen = (screenName) => {
        navigation.navigate(screenName);
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

                {/* Global Footer - فقط در صفحات مجاز نمایش داده می‌شود */}
                {shouldShowMenu && (
                    <View style={[styles.footer, NewStyles.rowWrapper]}>
                        <TouchableOpacity
                            onPress={() => {
                                contact?.data?.data?.link && Linking.openURL(`${contact?.data?.data?.link}`)
                            }}
                        >
                            <Text style={NewStyles.text4}>{contact?.data?.data?.name}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.supportButton} onPress={()=>{navigation.navigate('MessageScreen')}}>
                            <Text style={NewStyles.text4}>پشتیبانی</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={openMenu}>
                            <Image
                                source={require("../assets/logo.png")}
                                style={styles.footerLogo}
                            />
                        </TouchableOpacity>
                    </View>
                )}
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
                            <View style={{ backgroundColor: themeColor0.bgColor(1) }}>
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
        justifyContent: 'flex-end'
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