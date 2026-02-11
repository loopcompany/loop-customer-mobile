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
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { themeColor0, themeColor10, themeColor13, themeColor4, themeColor1 } from '../theme/Color';
import NewStyles, { deviceHeight } from '../styles/NewStyles';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import useLogout from '../hooks/useLogout';
import { fetchContacts } from '../slices/contactSlice';
import { fetchUser } from '../slices/userSlice';
import { createStyles } from '../styles/NewStyles';
// Create Context
const MenuContext = createContext();

// Menu Provider Component
export const MenuProvider = ({ children }) => {
      const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(()=> createLocalStyles(NewStyles), [NewStyles]);
    const navigation = useNavigation();
    const { logoutWithConfirmation, isLoggingOut } = useLogout();
    const [menuVisible, setMenuVisible] = useState(false);
    const [currentRouteName, setCurrentRouteName] = useState('');
    const insets = useSafeAreaInsets();
    // Get user type and auth token from Redux
    const userType = useSelector(state => state.auth.userType);
    const token = useSelector(state => state.auth.token);
    const user = useSelector(state => state.user?.data);
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
    useEffect(()=>{
        if(!user && token){
            dispatch(fetchUser(token))
        }
    },[token])

    // Generate menu items dynamically based on user type
    const menuItems = useMemo(() => {
        console.log('🔍 [MenuContext] Current userType:', userType);

        const baseMenuItems = [
            { id: 23, title: t("Submit Order"), screen: "FolderScreen" },
            { id: 22, title: t("Loop Wallet"), screen: "Increase" },
            { id: 21, title: t("Privacy"), screen: "PrivacyScreen" },
            // برای سازمانی: قوانین سازمانی | برای عادی: قوانین عمومی
            {
                id: 20,
                title: userType === 'organization' ? t("Organization Terms and Conditions") : t("Terms / About Loop"),
                screen: userType === 'organization' ? "OrganizationTermsScreen" : "AboutScreen"
            },
            { id: 19, title: t("FAQ"), screen: "LearnMoreScreen" },
            { id: 18, title: t("Note"), screen: "NotesScreen" },
            { id: 17, title: t("Warranty / Guarantee"), screen: "WarrantyScreen" },
            { id: 16, title: t("Feedback and Suggestions"), screen: "FeedbackSurveyScreen" },
            { id: 15, title: t("Report/Track Violation"), screen: "ViolationReportScreen" },
            { id: 14, title: t("Rate List"), screen: "RateCategory" },
            { id: 13, title: t("Service / Product Faults"), screen: "ProductIssueScreen" },
            { id: 12, title: t("Promotional Plans"), screen: "Club" },
            { id: 11, title: t("Think and Play"), screen: "GameMenu" },
            { id: 10, title: t("Training Course Registration"), screen: "TrainingRegistrationScreen", },
            { id: 9, title: t("Selected Addresses"), screen: "AddressScreen" },
            { id: 8, title: t("Contract"), screen: "OrganizationContract", organizationOnly: true },
            { id: 7, title: t("User Account"), screen: "Profile" },
            { id: 6, title: t("Messages"), screen: "MessageScreen" },
            { id: 5, title: t("Canceled Orders"), screen: "CanceledOrdersScreen" },
            { id: 4, title: t("Transactions"), screen: "TransactionsScreen" },
            { id: 3, title: t("Orders"), screen: "OrdersScreen" },
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
            <Text style={[NewStyles.title10, { paddingVertical: 5 }]}>{item.title}</Text>
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
                        <View >
                            <Text style={NewStyles.text4}>
                                {user?.code}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.supportButton} onPress={() => { navigation.navigate('MessageScreen') }}>
                            <Text style={NewStyles.text4}>{t('Support')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={openMenu} style={{ backgroundColor: themeColor4.bgColor(1), borderRadius: 100, marginVertical: 5 }}>
                            <Image
                                source={require("../assets/logo.png")}
                                style={styles.footerLogo}
                            />
                        </TouchableOpacity>
                    </View>
                )}
                {/* Menu Modal */}
                <Modal
                    transparent={true}
                    visible={menuVisible}
                    onRequestClose={closeMenu}
                    animationType="fade"
                >
                    <TouchableWithoutFeedback onPress={closeMenu}>
                        <View style={styles.coverlist2}>
                            <View style={[styles.coverlist, {height: deviceHeight - insets.top - insets.bottom - 50}]}>
                                <View style={{ backgroundColor: themeColor0.bgColor(1), }}>
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
                                            onPress={() => logoutWithConfirmation({ onSuccess: closeMenu })}
                                            disabled={isLoggingOut}
                                        >
                                            <Ionicons name="power" size={20} color="#fff" />
                                            <Text style={styles.logoutText}>
                                                {isLoggingOut ? t('Logging out...') : t('Log out of account')}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </SafeAreaView>

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
const createLocalStyles = (NewStyles) =>  StyleSheet.create({
    coverlist: {
        width: '80%',
        backgroundColor: themeColor0.bgColor(0),
        justifyContent: 'flex-end',
    },
    coverlist2: {
        flex: 1,
        
    },
    footer: {
        backgroundColor: themeColor13.bgColor(1),
        width: "100%",
        paddingHorizontal: 15,
    },
    footerLogo: {
        width: 70,
        height: 40,
        resizeMode: "contain",
    },
    supportButton: {
        backgroundColor: themeColor0.bgColor(1),
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 5,
    },
    list: {
        paddingTop: 20,
        paddingHorizontal: 16,
        paddingBottom: 100,
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